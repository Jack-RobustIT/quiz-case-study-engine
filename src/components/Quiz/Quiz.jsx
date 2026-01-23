import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "../../context/QuizContext";
import Timer from "../shared/Timer";
import ProgressBar from "../shared/ProgressBar";
import QuestionNavigation from "../shared/QuestionNavigation";
import QuestionDisplay from "./QuestionDisplay";
import BookmarkButton from "../shared/BookmarkButton";
import Modal from "../shared/Modal";
import Results from "./Results";
import { ThemeToggle } from "../ui/theme-toggle";
import { shuffleArray } from "../../utils/helpers";
import { isQuestionFullyAnswered } from "../../utils/questionHelpers";
import "./Quiz.css";

function Quiz() {
  const params = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useQuiz();
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewModalType, setReviewModalType] = useState(null);

  // Get the encoded path from the route (everything after /quiz/)
  const encodedPath = params["*"] || "";

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedPath]);

  useEffect(() => {
    if (state.questions.length > 0 && loading) {
      setLoading(false);
    }
  }, [state.questions.length, loading]);

  const prevReviewModeRef = React.useRef(state.reviewMode);
  useEffect(() => {
    if (
      prevReviewModeRef.current &&
      !state.reviewMode &&
      state.questions.length > 0
    ) {
      const unansweredQuestions = state.questions
        .map((question, i) => {
          const answer = state.answers[i];
          return isQuestionFullyAnswered(question, answer) ? null : i;
        })
        .filter((i) => i !== null);

      const bookmarkedQuestions = Array.from(state.bookmarks);

      if (
        unansweredQuestions.length === 0 &&
        bookmarkedQuestions.length === 0 &&
        !showSubmitModal &&
        !showReviewModal
      ) {
        setShowSubmitModal(true);
      }
    }
    prevReviewModeRef.current = state.reviewMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.reviewMode,
    state.questions.length,
    state.answers,
    state.bookmarks,
  ]);

  useEffect(() => {
    if (state.questions.length === 0) return;

    let filtered;
    if (state.reviewMode === "bookmarked") {
      filtered = state.questions.filter((_, i) => state.bookmarks.has(i));
    } else if (state.reviewMode === "unanswered") {
      // Use snapshot to keep list stable during review, just like bookmarked questions
      filtered = state.questions.filter((_, i) =>
        state.unansweredQuestionsSnapshot.has(i)
      );
    } else {
      filtered = state.questions;
    }

    if (state.reviewMode && filtered.length === 0) {
      dispatch({ type: "CLEANUP_BOOKMARKS" });
      dispatch({ type: "SET_REVIEW_MODE", payload: null });
      dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
      return;
    }

    // Ensure current index is within bounds
    if (filtered.length > 0 && state.currentQuestionIndex >= filtered.length) {
      dispatch({ type: "SET_CURRENT_QUESTION", payload: filtered.length - 1 });
    } else if (filtered.length > 0 && state.currentQuestionIndex < 0) {
      dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
    }
  }, [
    state.questions,
    state.reviewMode,
    state.currentQuestionIndex,
    state.bookmarks,
    state.unansweredQuestionsSnapshot,
    dispatch,
  ]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      // Decode the path to handle URL-encoded paths with subfolders
      const decodedPath = decodeURIComponent(encodedPath);
      const response = await fetch(
        `${import.meta.env.BASE_URL}JSON/${decodedPath}`
      );
      if (!response.ok) {
        throw new Error("Quiz not found");
      }
      const questions = await response.json();

      const shuffledQuestions = questions.map((q) => {
        if (q.type === "drag-and-drop") {
          return q;
        }

        const shuffled = { ...q };
        if (q.options && Array.isArray(q.options)) {
          const indices = q.options.map((_, i) => i);
          const shuffledIndices = shuffleArray([...indices]);
          shuffled.options = shuffledIndices.map((i) => q.options[i]);

          if (Array.isArray(q.correctAnswer)) {
            shuffled.correctAnswer = q.correctAnswer.map((ans) => {
              const originalIndex = q.options.indexOf(ans);
              return shuffledIndices.indexOf(originalIndex) !== -1
                ? shuffled.options[shuffledIndices.indexOf(originalIndex)]
                : ans;
            });
          }
        }
        return shuffled;
      });

      const shuffledQuestionsArray = shuffleArray(shuffledQuestions);
      dispatch({ type: "LOAD_QUESTIONS", payload: shuffledQuestionsArray });
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Failed to load quiz. Please try again.");
      navigate("/");
    }
  };

  const handleAnswerChange = (answer) => {
    const questionIndex = getOriginalQuestionIndex();
    dispatch({
      type: "SET_ANSWER",
      payload: { questionIndex, answer },
    });
  };

  const handleNext = () => {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    const nextIndex = getCurrentQuestionIndex() + 1;
    if (nextIndex < filtered.length) {
      dispatch({ type: "SET_CURRENT_QUESTION", payload: nextIndex });
    }
  };

  const handlePrevious = () => {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    const prevIndex = getCurrentQuestionIndex() - 1;
    if (prevIndex >= 0) {
      dispatch({ type: "SET_CURRENT_QUESTION", payload: prevIndex });
    }
  };

  const handleQuestionSelect = (index) => {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0 || index < 0 || index >= filtered.length) return;
    dispatch({ type: "SET_CURRENT_QUESTION", payload: index });
  };

  const getCurrentQuestionIndex = () => {
    return state.currentQuestionIndex;
  };

  const getFilteredQuestions = () => {
    if (state.reviewMode === "bookmarked") {
      return state.questions.filter((_, i) => state.bookmarks.has(i));
    }
    if (state.reviewMode === "unanswered") {
      // Use snapshot to keep list stable during review, just like bookmarked questions
      return state.questions.filter((_, i) =>
        state.unansweredQuestionsSnapshot.has(i)
      );
    }
    return state.questions;
  };

  const getOriginalQuestionIndex = () => {
    if (!state.reviewMode) {
      return getCurrentQuestionIndex();
    }
    const filtered = getFilteredQuestions();
    const filteredIndex = getCurrentQuestionIndex();
    if (filteredIndex < 0 || filteredIndex >= filtered.length) {
      return 0;
    }

    if (state.reviewMode === "bookmarked") {
      const bookmarkedIndices = Array.from(state.bookmarks).sort(
        (a, b) => a - b
      );
      return bookmarkedIndices[filteredIndex] ?? 0;
    } else if (state.reviewMode === "unanswered") {
      // Use snapshot to map filtered index to original index
      const unansweredIndices = Array.from(
        state.unansweredQuestionsSnapshot
      ).sort((a, b) => a - b);
      return unansweredIndices[filteredIndex] ?? 0;
    }
    return getCurrentQuestionIndex();
  };

  const handleBookmarkToggle = () => {
    const questionIndex = getOriginalQuestionIndex();
    dispatch({ type: "TOGGLE_BOOKMARK", payload: questionIndex });
  };

  const getCurrentQuestion = () => {
    const filtered = getFilteredQuestions();
    const currentIndex = getCurrentQuestionIndex();
    if (currentIndex >= 0 && currentIndex < filtered.length) {
      return filtered[currentIndex];
    }
    if (filtered.length > 0) {
      return filtered[filtered.length - 1];
    }
    return null;
  };

  const handleSubmit = () => {
    if (state.reviewMode === "bookmarked") {
      const bookmarkedQuestions = Array.from(state.bookmarks);
      const incompleteBookmarked = bookmarkedQuestions.filter((index) => {
        const question = state.questions[index];
        const answer = state.answers[index];
        return !isQuestionFullyAnswered(question, answer);
      });

      if (incompleteBookmarked.length > 0) {
        alert(
          `Please complete all reviewed questions before submitting. ${incompleteBookmarked.length} question(s) still need to be fully answered.`
        );
        return;
      }

      dispatch({ type: "CLEANUP_BOOKMARKS" });

      const unansweredQuestions = state.questions
        .map((question, i) => {
          const answer = state.answers[i];
          return isQuestionFullyAnswered(question, answer) ? null : i;
        })
        .filter((i) => i !== null);

      if (unansweredQuestions.length > 0) {
        const shouldReview = window.confirm(
          `You have ${unansweredQuestions.length} unanswered question(s). Would you like to review them before submitting?`
        );

        if (shouldReview) {
          dispatch({ type: "SET_REVIEW_MODE", payload: "unanswered" });
          dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
        } else {
          dispatch({ type: "SET_REVIEW_MODE", payload: null });
          dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
          setShowSubmitModal(true);
        }
        return;
      }

      dispatch({ type: "SET_REVIEW_MODE", payload: null });
      dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
      setShowSubmitModal(true);
      return;
    }

    if (state.reviewMode === "unanswered") {
      const unansweredQuestions = state.questions
        .map((question, i) => {
          const answer = state.answers[i];
          return isQuestionFullyAnswered(question, answer) ? null : i;
        })
        .filter((i) => i !== null);

      if (unansweredQuestions.length > 0) {
        alert(
          `Please complete all questions before submitting. ${unansweredQuestions.length} question(s) still need to be fully answered.`
        );
        return;
      }

      dispatch({ type: "SET_REVIEW_MODE", payload: null });
      dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
      setShowSubmitModal(true);
      return;
    }

    const bookmarkedQuestions = Array.from(state.bookmarks);

    if (bookmarkedQuestions.length > 0) {
      setReviewModalType("bookmarked");
      setShowReviewModal(true);
      return;
    }

    const unansweredQuestions = state.questions
      .map((question, i) => {
        const answer = state.answers[i];
        return isQuestionFullyAnswered(question, answer) ? null : i;
      })
      .filter((i) => i !== null);

    if (unansweredQuestions.length > 0) {
      setReviewModalType("unanswered");
      setShowReviewModal(true);
      return;
    }

    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    const results = await calculateResults();
    dispatch({ type: "SUBMIT_QUIZ", payload: results });
    setShowSubmitModal(false);
  };

  const calculateResults = async () => {
    let correct = 0;
    let incorrect = 0;
    const questionResults = await Promise.all(
      state.questions.map(async (question, index) => {
        const userAnswer = state.answers[index];
        const isCorrect = await checkAnswer(question, userAnswer);

      if (isCorrect) {
        correct++;
      } else if (userAnswer !== undefined && userAnswer !== null) {
        incorrect++;
      }

      const correctAnswerForReview =
        question.type === "drag-and-drop" &&
        Array.isArray(question.correctOrder)
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

    const total = state.questions.length;
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
      timeSpent: state.startTime
        ? Math.floor((Date.now() - state.startTime) / 1000)
        : 0,
    };
  };

  const checkAnswer = async (question, userAnswer) => {
    if (userAnswer === undefined || userAnswer === null) {
      return false;
    }

    const correctAnswer = question.correctAnswer;

    if (question.type === "single") {
      return Array.isArray(correctAnswer)
        ? correctAnswer[0] === userAnswer
        : correctAnswer === userAnswer;
    }

    if (question.type === "multiple") {
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

    if (question.type === "drag-and-drop") {
      if (!Array.isArray(userAnswer)) {
        return false;
      }
      const correctOrder = question.correctOrder;
      if (!Array.isArray(correctOrder)) {
        return false;
      }
      return JSON.stringify(userAnswer) === JSON.stringify(correctOrder);
    }

    if (
      question.type === "sql-completion" ||
      question.type === "code-completion"
    ) {
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
        return false;
      }
      if (userAnswer.length !== correctAnswer.length) {
        return false;
      }
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    }

    if (question.type === "code-ide") {
      if (typeof userAnswer !== "string" || typeof correctAnswer !== "string") {
        return false;
      }
      
      // For Python code-ide questions, compare execution outputs instead of code strings
      if (question.language === "python") {
        try {
          const { comparePythonOutputs } = await import("../../utils/pythonExecutor");
          return await comparePythonOutputs(userAnswer, correctAnswer);
        } catch (error) {
          console.error("Error comparing Python outputs:", error);
          // Fallback to code comparison if execution fails
          const normalizeCode = (code) => {
            return code
              .trim()
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n")
              .replace(/\s+$/gm, "")
              .replace(/\n{3,}/g, "\n\n");
          };
          return normalizeCode(userAnswer) === normalizeCode(correctAnswer);
        }
      }
      
      // For non-Python code-ide questions, use code string comparison (backward compatible)
      const normalizeCode = (code) => {
        return code
          .trim()
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/\s+$/gm, "")
          .replace(/\n{3,}/g, "\n\n");
      };
      return normalizeCode(userAnswer) === normalizeCode(correctAnswer);
    }

    return false;
  };

  const handleReviewBookmarked = () => {
    dispatch({ type: "SET_REVIEW_MODE", payload: "bookmarked" });
    dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
    setShowReviewModal(false);
    setReviewModalType(null);
  };

  const handleReviewUnanswered = () => {
    dispatch({ type: "SET_REVIEW_MODE", payload: "unanswered" });
    dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
    setShowReviewModal(false);
    setReviewModalType(null);
  };

  const exitReviewMode = () => {
    dispatch({ type: "CLEANUP_BOOKMARKS" });
    dispatch({ type: "SET_REVIEW_MODE", payload: null });
    dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
  };

  if (loading || state.questions.length === 0) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  if (state.isSubmitted && state.results) {
    // Extract filename from decoded path for display
    const decodedPath = decodeURIComponent(encodedPath);
    const pathParts = decodedPath.split("/");
    const fileName =
      pathParts[pathParts.length - 1]?.replace(".json", "") || decodedPath;
    const quizType = pathParts[0] || "";
    const quizName = fileName;

    return (
      <Results
        results={state.results}
        quizType={quizType}
        quizName={quizName}
      />
    );
  }

  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = getCurrentQuestion();

  if (filteredQuestions.length === 0 || !currentQuestion) {
    if (state.reviewMode) {
      return <div className="quiz-loading">Loading quiz...</div>;
    }
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  const answeredCount = state.questions.filter((question, i) => {
    const answer = state.answers[i];
    return isQuestionFullyAnswered(question, answer);
  }).length;
  const totalQuestions = state.questions.length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const allQuestionsAnswered = answeredCount === totalQuestions;
  const hasBookmarks = state.bookmarks.size > 0;

  const isLastQuestion =
    getCurrentQuestionIndex() === filteredQuestions.length - 1;
  const lastQuestionOriginalIndex = isLastQuestion
    ? getOriginalQuestionIndex()
    : -1;
  const isLastQuestionAnswered =
    isLastQuestion &&
    lastQuestionOriginalIndex >= 0 &&
    isQuestionFullyAnswered(
      state.questions[lastQuestionOriginalIndex],
      state.answers[lastQuestionOriginalIndex]
    );
  const isLastQuestionBookmarked =
    isLastQuestion &&
    lastQuestionOriginalIndex >= 0 &&
    state.bookmarks.has(lastQuestionOriginalIndex);

  const allQuestionsAnsweredInReviewMode = state.reviewMode
    ? state.questions.every((question, i) => {
        const answer = state.answers[i];
        return isQuestionFullyAnswered(question, answer);
      })
    : true;

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <div className="quiz-header-top">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
          <div className="flex items-center gap-4">
            <Timer timeRemaining={state.timeRemaining} />
            <button
              className="nav-button submit-button header-submit-button"
              onClick={handleSubmit}
              disabled={
                state.reviewMode
                  ? !allQuestionsAnsweredInReviewMode
                  : !allQuestionsAnswered || hasBookmarks
              }
            >
              Submit Quiz
            </button>
            <ThemeToggle />
          </div>
        </div>
        <div className="quiz-header-bottom">
          <h1>
            {(() => {
              const decodedPath = decodeURIComponent(encodedPath);
              const pathParts = decodedPath.split("/");
              const fileName =
                pathParts[pathParts.length - 1]?.replace(".json", "") ||
                decodedPath;
              return fileName
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
            })()}
          </h1>
          {state.reviewMode && (
            <div className="review-mode-banner">
              <span>
                {state.reviewMode === "bookmarked"
                  ? "Reviewing Bookmarked Questions"
                  : "Reviewing Unanswered Questions"}
              </span>
              <button onClick={exitReviewMode}>Exit Review Mode</button>
            </div>
          )}
        </div>
      </header>

      <div className="quiz-content">
        <aside className="quiz-sidebar">
          <ProgressBar
            progress={progress}
            answered={answeredCount}
            total={totalQuestions}
            bookmarked={state.bookmarks.size}
          />
          <QuestionNavigation
            questions={state.questions}
            currentIndex={getCurrentQuestionIndex()}
            answers={state.answers}
            bookmarks={state.bookmarks}
            onQuestionSelect={handleQuestionSelect}
            reviewMode={state.reviewMode}
            filteredQuestions={filteredQuestions}
            unansweredQuestionsSnapshot={state.unansweredQuestionsSnapshot}
          />
        </aside>

        <main className="quiz-main">
          <div className="question-header">
            <span className="question-counter">
              Question{" "}
              {state.reviewMode
                ? getOriginalQuestionIndex() + 1
                : getCurrentQuestionIndex() + 1}{" "}
              of{" "}
              {state.reviewMode
                ? state.questions.length
                : filteredQuestions.length}
            </span>
            <div className="question-header-actions">
              <BookmarkButton
                isBookmarked={state.bookmarks.has(getOriginalQuestionIndex())}
                onToggle={handleBookmarkToggle}
              />
              {!state.reviewMode &&
                (hasBookmarks || !allQuestionsAnswered) &&
                isLastQuestion &&
                (isLastQuestionAnswered || isLastQuestionBookmarked) && (
                  <button
                    className="nav-button review-mode-button"
                    onClick={() => {
                      if (hasBookmarks) {
                        dispatch({
                          type: "SET_REVIEW_MODE",
                          payload: "bookmarked",
                        });
                      } else {
                        const unansweredQuestions = state.questions
                          .map((question, i) => {
                            const answer = state.answers[i];
                            return isQuestionFullyAnswered(question, answer)
                              ? null
                              : i;
                          })
                          .filter((i) => i !== null);

                        if (unansweredQuestions.length > 0) {
                          dispatch({
                            type: "SET_REVIEW_MODE",
                            payload: "unanswered",
                          });
                        }
                      }
                      dispatch({ type: "SET_CURRENT_QUESTION", payload: 0 });
                    }}
                  >
                    Review Mode
                  </button>
                )}
            </div>
          </div>

          {currentQuestion ? (
            <QuestionDisplay
              question={currentQuestion}
              questionIndex={getOriginalQuestionIndex()}
              userAnswer={state.answers[getOriginalQuestionIndex()]}
              onAnswerChange={handleAnswerChange}
            />
          ) : (
            <div className="question-error">
              <p>No question available. Please try refreshing the page.</p>
            </div>
          )}
        </main>
      </div>

      <div className="quiz-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={getCurrentQuestionIndex() === 0}
        >
          Previous
        </button>
        <button
          className="nav-button submit-button"
          onClick={handleSubmit}
          disabled={
            state.reviewMode
              ? !allQuestionsAnsweredInReviewMode
              : !allQuestionsAnswered || hasBookmarks
          }
        >
          Submit Quiz
        </button>
        <button
          className="nav-button"
          onClick={handleNext}
          disabled={getCurrentQuestionIndex() === filteredQuestions.length - 1}
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirm Submission"
      >
        <p>
          Are you sure you want to submit your quiz? You cannot change your
          answers after submission.
        </p>
        <div className="modal-actions">
          <button
            className="button-secondary"
            onClick={() => setShowSubmitModal(false)}
          >
            Cancel
          </button>
          <button className="button-primary" onClick={confirmSubmit}>
            Submit Quiz
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setReviewModalType(null);
        }}
        title="Review Before Submission"
      >
        {reviewModalType === "bookmarked" ? (
          <>
            <p>
              You have questions marked for review. Would you like to review
              them before submitting?
            </p>
            <div className="modal-actions">
              <button
                className="button-secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewModalType(null);
                }}
              >
                Continue Answering Questions
              </button>
              <button
                className="button-primary"
                onClick={handleReviewBookmarked}
              >
                Review Bookmarked Questions
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              You have unanswered questions. Would you like to review them
              before submitting, or submit anyway?
            </p>
            <div className="modal-actions">
              <button
                className="button-secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewModalType(null);
                }}
              >
                Continue Answering Questions
              </button>
              <button
                className="button-primary"
                onClick={handleReviewUnanswered}
              >
                Review Unanswered Questions
              </button>
              <button
                className="button-primary"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewModalType(null);
                  setShowSubmitModal(true);
                }}
              >
                Submit Anyway
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Quiz;
