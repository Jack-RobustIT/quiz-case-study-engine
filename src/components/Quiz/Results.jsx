import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatTime, isUrl } from '../../utils/helpers';
import './Results.css';

function Results({ results, quizType, quizName }) {
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

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

  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
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
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>

      <div className="results-summary">
        <div className={`score-card ${results.passed ? 'passed' : 'failed'}`}>
          <div className="score-circle">
            <span className="score-value">{results.score}%</span>
          </div>
          <h2 className="pass-fail">{results.passed ? 'PASSED' : 'FAILED'}</h2>
          <p className="pass-threshold">Passing Score: 85%</p>
        </div>

        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{results.total}</span>
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

