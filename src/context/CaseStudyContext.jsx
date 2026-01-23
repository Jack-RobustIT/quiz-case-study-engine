import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { isQuestionFullyAnswered } from '../utils/questionHelpers';

const CaseStudyContext = createContext();

const initialState = {
  caseStudyData: null,
  questions: [],
  originalQuestions: [],
  currentQuestionIndex: 0,
  answers: {},
  bookmarks: new Set(),
  startTime: null,
  endTime: null,
  timeRemaining: 90 * 60,
  isSubmitted: false,
  results: null,
  reviewMode: null,
  shuffledIndices: [],
  unansweredQuestionsSnapshot: new Set(), // Snapshot of unanswered questions when entering review mode
};

function caseStudyReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CASE_STUDY':
      return {
        ...state,
        caseStudyData: action.payload.caseStudyData,
        questions: action.payload.questions,
        originalQuestions: action.payload.questions,
        shuffledIndices: action.payload.questions.map((_, i) => i),
        currentQuestionIndex: 0,
        answers: {},
        bookmarks: new Set(),
        startTime: Date.now(),
        endTime: null,
        timeRemaining: 90 * 60,
        isSubmitted: false,
        results: null,
        reviewMode: null,
        unansweredQuestionsSnapshot: new Set(),
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: action.payload,
      };
    case 'SET_ANSWER': {
      const { questionIndex, answer } = action.payload;
      const question = state.questions[questionIndex];

      const newAnswers = {
        ...state.answers,
        [questionIndex]: answer,
      };

      const updatedBookmarks = new Set(state.bookmarks);

      // Only remove bookmark once the question is actually fully answered.
      // CRITICAL: Never auto-remove bookmarks while in ANY review mode.
      // This prevents questions from disappearing from the review list mid-answer,
      // allowing users to complete all parts (all drag items, all dropdowns) before
      // the question is removed from review when they exit review mode.
      if (
        question &&
        updatedBookmarks.has(questionIndex) &&
        isQuestionFullyAnswered(question, newAnswers[questionIndex]) &&
        !state.reviewMode // Only auto-remove bookmarks when NOT in review mode
      ) {
        updatedBookmarks.delete(questionIndex);
      }

      return {
        ...state,
        answers: newAnswers,
        bookmarks: updatedBookmarks,
      };
    }
    case 'TOGGLE_BOOKMARK': {
      const newBookmarks = new Set(state.bookmarks);
      const isBookmarking = !newBookmarks.has(action.payload);
      
      if (isBookmarking) {
        newBookmarks.add(action.payload);
        // Clear answer when bookmarking
        const newAnswers = { ...state.answers };
        delete newAnswers[action.payload];
        return {
          ...state,
          bookmarks: newBookmarks,
          answers: newAnswers,
        };
      } else {
        newBookmarks.delete(action.payload);
        return {
          ...state,
          bookmarks: newBookmarks,
        };
      }
    }
    case 'UPDATE_TIMER':
      return {
        ...state,
        timeRemaining: action.payload,
      };
    case 'SET_REVIEW_MODE': {
      // When entering "unanswered" review mode, capture a snapshot of unanswered questions
      // This keeps the list stable during review, just like bookmarked questions
      let unansweredSnapshot = new Set();
      if (action.payload === 'unanswered') {
        state.questions.forEach((question, index) => {
          const answer = state.answers[index];
          if (!isQuestionFullyAnswered(question, answer)) {
            unansweredSnapshot.add(index);
          }
        });
      }
      return {
        ...state,
        reviewMode: action.payload,
        unansweredQuestionsSnapshot: unansweredSnapshot,
      };
    }
    case 'CLEANUP_BOOKMARKS': {
      // Remove bookmarks from all fully answered questions
      // This is called when exiting review mode to clean up bookmarks
      const updatedBookmarks = new Set(state.bookmarks);
      state.questions.forEach((question, index) => {
        const answer = state.answers[index];
        if (
          question &&
          updatedBookmarks.has(index) &&
          isQuestionFullyAnswered(question, answer)
        ) {
          updatedBookmarks.delete(index);
        }
      });
      return {
        ...state,
        bookmarks: updatedBookmarks,
        unansweredQuestionsSnapshot: new Set(), // Clear snapshot when exiting review mode
      };
    }
    case 'SUBMIT_CASE_STUDY':
      return {
        ...state,
        isSubmitted: true,
        endTime: Date.now(),
        results: action.payload,
      };
    case 'RESET_CASE_STUDY':
      return initialState;
    default:
      return state;
  }
}

export function CaseStudyProvider({ children }) {
  const [state, dispatch] = useReducer(caseStudyReducer, initialState);
  
  // Use refs to access latest state in timer without causing effect re-runs
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Timer effect - optimized to not recreate interval on every answer change
  useEffect(() => {
    if (state.startTime && !state.isSubmitted && state.timeRemaining > 0) {
      const interval = setInterval(async () => {
        const currentState = stateRef.current;
        const newTime = currentState.timeRemaining - 1;
        if (newTime <= 0) {
          dispatch({ type: 'UPDATE_TIMER', payload: 0 });
          // Calculate results and submit using latest state from ref
          const results = await calculateResults(currentState.questions, currentState.answers);
          dispatch({ type: 'SUBMIT_CASE_STUDY', payload: results });
        } else {
          dispatch({ type: 'UPDATE_TIMER', payload: newTime });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.startTime, state.timeRemaining, state.isSubmitted]);

  return (
    <CaseStudyContext.Provider value={{ state, dispatch }}>
      {children}
    </CaseStudyContext.Provider>
  );
}

export function useCaseStudy() {
  const context = useContext(CaseStudyContext);
  if (!context) {
    throw new Error('useCaseStudy must be used within CaseStudyProvider');
  }
  return context;
}

async function calculateResults(questions, answers) {
  let correct = 0;
  let incorrect = 0;
  const questionResults = await Promise.all(
    questions.map(async (question, index) => {
      const userAnswer = answers[index];
      const isCorrect = await checkAnswer(question, userAnswer);
    
    if (isCorrect) {
      correct++;
    } else if (userAnswer !== undefined && userAnswer !== null) {
      incorrect++;
    }

    // For drag-and-drop questions, store the correct order (indices) so the
    // Results component can map them back to option text consistently.
    const correctAnswerForReview =
      question.type === 'drag-and-drop' && Array.isArray(question.correctOrder)
        ? question.correctOrder
        : question.correctAnswer;

      return {
        question,
        userAnswer,
        isCorrect,
        correctAnswer: correctAnswerForReview,
      };
    })
  );

  const total = questions.length;
  const score = total > 0 ? (correct / total) * 100 : 0;
  const passed = score >= 85;

  return {
    total,
    correct,
    incorrect,
    unanswered: total - correct - incorrect,
    score: Math.round(score * 100) / 100,
    passed,
    questionResults,
  };
}

async function checkAnswer(question, userAnswer) {
  if (userAnswer === undefined || userAnswer === null) {
    return false;
  }

  const correctAnswer = question.correctAnswer;

  if (question.type === 'single') {
    return Array.isArray(correctAnswer) 
      ? correctAnswer[0] === userAnswer
      : correctAnswer === userAnswer;
  }

  if (question.type === 'multiple') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
  }

  if (question.type === 'drag-and-drop') {
    if (!Array.isArray(userAnswer)) {
      return false;
    }
    // For drag-and-drop, compare against correctOrder (indices) not correctAnswer (text)
    const correctOrder = question.correctOrder;
    if (!Array.isArray(correctOrder)) {
      return false;
    }
    return JSON.stringify(userAnswer) === JSON.stringify(correctOrder);
  }

  if (question.type === 'sql-completion' || question.type === 'code-completion') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }
    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }

  if (question.type === 'code-ide') {
    if (typeof userAnswer !== 'string' || typeof correctAnswer !== 'string') {
      return false;
    }
    
    // For Python code-ide questions, compare execution outputs instead of code strings
    if (question.language === 'python') {
      try {
        const { comparePythonOutputs } = await import('../utils/pythonExecutor');
        return await comparePythonOutputs(userAnswer, correctAnswer, question);
      } catch (error) {
        console.error('Error comparing Python outputs:', error);
        // Fallback to code comparison if execution fails
        const normalizeCode = (code) => {
          return code
            .trim()
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\s+$/gm, '')
            .replace(/\n{3,}/g, '\n\n');
        };
        return normalizeCode(userAnswer) === normalizeCode(correctAnswer);
      }
    }
    
    // For non-Python code-ide questions, use code string comparison (backward compatible)
    const normalizeCode = (code) => {
      return code
        .trim()
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\s+$/gm, '')
        .replace(/\n{3,}/g, '\n\n');
    };
    return normalizeCode(userAnswer) === normalizeCode(correctAnswer);
  }

  return false;
}

