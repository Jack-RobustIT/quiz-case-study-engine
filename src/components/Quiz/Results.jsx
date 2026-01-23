import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from "../ui/theme-toggle";
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { isUrl } from '../../utils/helpers';
import { sendResultsEmail } from '../../utils/emailService';
import { postResultsToBackend } from '../../utils/resultsService';
import './Results.css';

const BADGE_BANDS = [
  { id: 'foundation', label: 'Foundation Builder 🏗️', min: 0, max: 20, tone: 'red' },
  { id: 'explorer', label: 'Knowledge Explorer 📚', min: 21, max: 40, tone: 'amber' },
  { id: 'refiner', label: 'Skill Refiner 🔍', min: 41, max: 60, tone: 'amber' },
  { id: 'pass_ready', label: 'Pass-Ready Zone 🎯', min: 61, max: 84, tone: 'amber' },
  { id: 'exam_ready', label: 'Exam Ready ✅', min: 85, max: 99, tone: 'green' },
  { id: 'superstar', label: 'Superstar ⭐', min: 100, max: 100, tone: 'green' },
];

const SECONDARY_MESSAGES = {
  foundation: 'You are at the starting point. A structured learning approach will build strong foundations.',
  explorer: 'You are beginning to grasp the concepts, but several areas need more attention before you can progress confidently.',
  refiner: 'You understand the fundamentals, but a few weak areas are holding your score back.',
  pass_ready: 'You are in the Pass-Ready Zone. Most learners who pass sit here before their final attempt.',
  exam_ready: 'You are performing at the level required to pass the real exam.',
  superstar: 'Outstanding performance. You have demonstrated full mastery of the exam objectives.',
};

const CTA_LABELS = {
  foundation: 'Join a classroom',
  explorer: 'Review learning modules',
  refiner: 'Book a 1-2-1 session',
  pass_ready: 'Retake mock',
  exam_ready: 'Book exam',
  superstar: 'Share badge / Continue pathway',
};

const getBadgeForScore = (score) => BADGE_BANDS.find((band) => score >= band.min && score <= band.max) || BADGE_BANDS[0];

const getPrimaryMessage = (score, passMark, questionsToPass) => {
  if (score >= 100) {
    return 'Perfect score — outstanding work.';
  }
  if (score >= passMark) {
    return 'You have achieved a passing-level score.';
  }
  if (questionsToPass === 1) {
    return 'You were just one question away from passing.';
  }
  if (questionsToPass > 1 && questionsToPass <= 3) {
    return 'You are very close — only a few areas need tightening.';
  }
  return 'This attempt has highlighted the areas to focus on next.';
};

const getProgressionFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to read attempts from storage', error);
    return [];
  }
};

const persistAttempt = (key, attempt) => {
  try {
    const existing = getProgressionFromStorage(key);
    const updated = [...existing, attempt];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to persist attempt', error);
    return [];
  }
};

function Results({ results, quizType, quizName }) {
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const emailSentRef = useRef(false);
  const resultsPostedRef = useRef(false);
  const [progression, setProgression] = useState({
    attempts: 1,
    bestScore: null,
    previousBadge: null,
    previousScore: null,
    improved: false,
  });

  // Send email with results when component mounts
  useEffect(() => {
    // Only send email once per results view
    if (!emailSentRef.current) {
      emailSentRef.current = true;
      
      // Send email asynchronously, don't block UI
      sendResultsEmail(results, quizName).catch((error) => {
        console.error('Failed to send results email:', error);
        // Don't show error to user - email failure shouldn't block results display
      });
    }
  }, [results, quizName]);

  // Post results to legacy ASP.NET backend when results page mounts
  useEffect(() => {
    if (!resultsPostedRef.current) {
      resultsPostedRef.current = true;

      // Fire-and-forget; errors are logged but never shown to the learner
      postResultsToBackend(results, quizName, quizType).catch((error) => {
        console.error('Failed to post quiz results to backend:', error);
      });
    }
  }, [results, quizName, quizType]);

  // Trigger confetti when exam is passed
  useEffect(() => {
    if (results.passed) {
      // Create a celebration effect with multiple bursts
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from the left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Launch confetti from the right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [results.passed]);

  const totalQuestions = results.total || results.questionResults?.length || 0;
  const correctAnswers = results.correct ?? 0;
  const passMark = results.passMark ?? 85;

  const scorePercentage = useMemo(() => {
    if (Number.isFinite(results.score)) {
      return results.score;
    }
    if (totalQuestions === 0) {
      return 0;
    }
    return Math.round((correctAnswers / totalQuestions) * 100);
  }, [results.score, correctAnswers, totalQuestions]);

  const questionsToPass = Math.max(0, Math.ceil((passMark * totalQuestions) / 100) - correctAnswers);
  const badge = getBadgeForScore(scorePercentage);
  const primaryMessage = getPrimaryMessage(scorePercentage, passMark, questionsToPass);
  const secondaryMessage = SECONDARY_MESSAGES[badge.id];
  const ctaLabel = CTA_LABELS[badge.id];

  const didPass = scorePercentage >= passMark;
  const inPassReadyBand = badge.id === 'pass_ready';
  const statusLabel = didPass ? 'PASSED' : inPassReadyBand ? 'ALMOST THERE' : 'FAILED';
  const scoreCardClass = didPass ? 'passed' : inPassReadyBand ? 'almost' : 'failed';

  const attemptsStorageKey = `quizAttempts:${quizName || quizType || 'default'}`;

  useEffect(() => {
    const attemptRecord = {
      timestamp: Date.now(),
      score: scorePercentage,
      badgeId: badge.id,
      badgeLabel: badge.label,
    };

    const existing = getProgressionFromStorage(attemptsStorageKey);
    const previous = existing[existing.length - 1];
    const updated = persistAttempt(attemptsStorageKey, attemptRecord);
    const allScores = updated.map((item) => item.score);
    const bestScore = allScores.length ? Math.max(...allScores) : scorePercentage;

    setProgression({
      attempts: updated.length || 1,
      bestScore,
      previousBadge: previous?.badgeLabel || null,
      previousScore: previous?.score ?? null,
      improved: previous ? scorePercentage > previous.score : false,
    });
  }, [attemptsStorageKey, badge.id, badge.label, scorePercentage]);

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleCtaClick = () => {
    // Placeholder CTA actions per user request
    console.info(`CTA clicked for badge: ${badge.label}`);
  };

  const formatTimeSpent = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Quiz Results</h1>
        <div className="flex items-center gap-4">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <ThemeToggle />
        </div>
      </div>

      <div className="results-summary">
        <div className={`score-card ${scoreCardClass}`}>
          <div className="score-circle">
            <span className="score-value">{scorePercentage}%</span>
          </div>
          <h2 className="pass-fail">{statusLabel}</h2>
          <p className="pass-threshold">Passing Score: {passMark}%</p>
        </div>

        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{totalQuestions}</span>
          </div>
          <div className="stat-item correct">
            <span className="stat-label">Correct</span>
            <span className="stat-value">{results.correct}</span>
          </div>
          <div className="stat-item incorrect">
            <span className="stat-label">Incorrect</span>
            <span className="stat-value">{results.incorrect}</span>
          </div>
          <div className="stat-item unanswered">
            <span className="stat-label">Unanswered</span>
            <span className="stat-value">{results.unanswered}</span>
          </div>
          {results.timeSpent && (
            <div className="stat-item">
              <span className="stat-label">Time Spent</span>
              <span className="stat-value">{formatTimeSpent(results.timeSpent)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="feedback-panel">
        <div className="feedback-top">
          <div className={`badge-chip tone-${badge.tone}`}>
            <span className="badge-dot" />
            <span className="badge-text">{badge.label}</span>
          </div>
          <p className="primary-message">{primaryMessage}</p>
        </div>
        <div className="feedback-middle">
          <p className="secondary-message">{secondaryMessage}</p>
          <button
            type="button"
            className={`cta-button tone-${badge.tone}`}
            onClick={handleCtaClick}
          >
            {ctaLabel}
          </button>
        </div>
        <div className="feedback-meta">
          <span>Attempts: {progression.attempts}</span>
          <span>Best score: {progression.bestScore ?? scorePercentage}%</span>
          {progression.previousBadge && (
            <span className="progression-note">
              {progression.improved
                ? `Improved from ${progression.previousBadge} to ${badge.label}`
                : `Previous badge: ${progression.previousBadge}`}
            </span>
          )}
        </div>
      </div>

      <div className="results-review">
        <h2>Question Review</h2>
        <div className="questions-list">
          {results.questionResults.map((result, index) => {
            const isExpanded = expandedQuestions.has(index);
            const question = result.question;

            return (
              <div
                key={index}
                className={`question-review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div
                  className="question-review-header"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="question-review-number">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`status-badge ${result.isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                      {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <button className="expand-button">
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="question-review-content">
                    {question.image && (
                      <div className="review-image">
                        <img src={question.image} alt="Question illustration" />
                      </div>
                    )}

                    <div className="review-question-text">
                      <h4>Question:</h4>
                      <ReactMarkdown>{question.question}</ReactMarkdown>
                    </div>

                    <div className="review-answers">
                      <div className="answer-section">
                        <h4>Your Answer:</h4>
                        <div className="answer-display">
                          {question.type === 'code-ide' ? (
                            <SyntaxHighlighter
                              language={question.language || 'javascript'}
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: '#1e1e1e',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                              }}
                            >
                              {result.userAnswer || 'Not answered'}
                            </SyntaxHighlighter>
                          ) : Array.isArray(result.userAnswer) ? (
                            <ul>
                              {result.userAnswer.map((ans, i) => (
                                <li key={i}>{ans}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{result.userAnswer !== null && result.userAnswer !== undefined ? result.userAnswer : 'Not answered'}</p>
                          )}
                        </div>
                      </div>

                      <div className="answer-section">
                        <h4>Correct Answer:</h4>
                        <div className="answer-display correct-answer">
                          {question.type === 'code-ide' ? (
                            <SyntaxHighlighter
                              language={question.language || 'javascript'}
                              style={oneDark}
                              customStyle={{
                                margin: 0,
                                padding: '1rem',
                                background: '#1e1e1e',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                              }}
                            >
                              {result.correctAnswer || ''}
                            </SyntaxHighlighter>
                          ) : Array.isArray(result.correctAnswer) ? (
                            <ul>
                              {result.correctAnswer.map((ans, i) => (
                                <li key={i}>{ans}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{result.correctAnswer}</p>
                          )}
                        </div>
                      </div>

                      {question.explanation && (
                        <div className="explanation-section">
                          <h4>Explanation:</h4>
                          {isUrl(question.explanation) ? (
                            <a
                              href={question.explanation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="explanation-link"
                            >
                              Learn more about this question →
                            </a>
                          ) : (
                            <div className="explanation-text">
                              <ReactMarkdown>{question.explanation}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Results;

