import emailjs from '@emailjs/browser';
import { getUserEmail } from './userHelpers';

/**
 * Formats a user answer for display in email based on question type
 * @param {Object} question - The question object
 * @param {*} userAnswer - The user's answer
 * @returns {string} Formatted answer string
 */
function formatUserAnswer(question, userAnswer) {
  if (userAnswer === null || userAnswer === undefined) {
    return 'Not answered';
  }

  switch (question.type) {
    case 'single':
      return String(userAnswer);
    
    case 'multiple':
      if (Array.isArray(userAnswer)) {
        return userAnswer.join(', ');
      }
      return String(userAnswer);
    
    case 'drag-and-drop':
      if (Array.isArray(userAnswer) && Array.isArray(question.options)) {
        // Map indices to option text
        return userAnswer
          .map((index) => question.options[index] || `Option ${index}`)
          .join(' → ');
      }
      return String(userAnswer);
    
    case 'code-ide':
      return String(userAnswer || 'No code provided');
    
    case 'sql-completion':
    case 'code-completion':
      if (Array.isArray(userAnswer)) {
        return userAnswer.join(' | ');
      }
      return String(userAnswer);
    
    default:
      return String(userAnswer);
  }
}

/**
 * Formats a correct answer for display in email based on question type
 * @param {Object} question - The question object
 * @param {*} correctAnswer - The correct answer
 * @returns {string} Formatted answer string
 */
function formatCorrectAnswer(question, correctAnswer) {
  if (correctAnswer === null || correctAnswer === undefined) {
    return 'No correct answer provided';
  }

  switch (question.type) {
    case 'single':
      return String(correctAnswer);
    
    case 'multiple':
      if (Array.isArray(correctAnswer)) {
        return correctAnswer.join(', ');
      }
      return String(correctAnswer);
    
    case 'drag-and-drop':
      if (Array.isArray(correctAnswer) && Array.isArray(question.options)) {
        // For drag-and-drop, correctAnswer might be indices or text
        if (typeof correctAnswer[0] === 'number') {
          return correctAnswer
            .map((index) => question.options[index] || `Option ${index}`)
            .join(' → ');
        }
        return correctAnswer.join(' → ');
      }
      return String(correctAnswer);
    
    case 'code-ide':
      return String(correctAnswer || 'No code provided');
    
    case 'sql-completion':
    case 'code-completion':
      if (Array.isArray(correctAnswer)) {
        return correctAnswer.join(' | ');
      }
      return String(correctAnswer);
    
    default:
      return String(correctAnswer);
  }
}

/**
 * Formats time spent in seconds to a human-readable string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTimeSpent(seconds) {
  if (!seconds) return 'N/A';
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
}

/**
 * Formats quiz results into HTML email content
 * @param {Object} results - Quiz results object
 * @param {string} quizName - Name of the quiz
 * @returns {string} HTML formatted email content
 */
function formatEmailContent(results, quizName) {
  const dateTime = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: ${results.passed ? '#4CAF50' : '#f44336'};
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 10px 0;
        }
        .stats {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .stat-item {
          padding: 10px;
          background-color: white;
          border-radius: 4px;
        }
        .stat-label {
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 1.2em;
          color: #2196F3;
        }
        .question-item {
          margin-bottom: 30px;
          border: 2px solid ${results.questionResults.some(r => !r.isCorrect) ? '#e0e0e0' : '#4CAF50'};
          border-radius: 8px;
          padding: 15px;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .question-number {
          font-weight: bold;
          font-size: 1.1em;
        }
        .status-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: bold;
          color: white;
        }
        .status-correct {
          background-color: #4CAF50;
        }
        .status-incorrect {
          background-color: #f44336;
        }
        .question-text {
          margin: 15px 0;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .answer-section {
          margin: 15px 0;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        .answer-section h4 {
          margin-top: 0;
        }
        .answer-display {
          padding: 10px;
          background-color: white;
          border-radius: 4px;
          margin-top: 5px;
        }
        .correct-answer {
          border-left: 4px solid #4CAF50;
        }
        .explanation-section {
          margin: 15px 0;
          padding: 10px;
          background-color: #e3f2fd;
          border-radius: 4px;
        }
        .code-block {
          background-color: #1e1e1e;
          color: #d4d4d4;
          padding: 15px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          overflow-x: auto;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${quizName || 'Quiz Results'}</h1>
        <p><strong>Status:</strong> ${results.passed ? 'PASSED' : 'FAILED'}</p>
        <p><strong>Score:</strong> ${results.score}%</p>
        <p><strong>Completed:</strong> ${dateTime}</p>
      </div>

      <div class="stats">
        <h2>Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Questions</span>
            <span class="stat-value">${results.total}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Correct</span>
            <span class="stat-value" style="color: #4CAF50;">${results.correct}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Incorrect</span>
            <span class="stat-value" style="color: #f44336;">${results.incorrect}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Unanswered</span>
            <span class="stat-value" style="color: #ff9800;">${results.unanswered}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time Spent</span>
            <span class="stat-value">${formatTimeSpent(results.timeSpent)}</span>
          </div>
        </div>
      </div>

      <div>
        <h2>Question Review</h2>
  `;

  // Add each question
  results.questionResults.forEach((result, index) => {
    const question = result.question;
    const userAnswerFormatted = formatUserAnswer(question, result.userAnswer);
    const correctAnswerFormatted = formatCorrectAnswer(question, result.correctAnswer);
    const isCorrect = result.isCorrect;

    html += `
        <div class="question-item">
          <div class="question-header">
            <div>
              <span class="question-number">Question ${index + 1}</span>
            </div>
            <span class="status-badge ${isCorrect ? 'status-correct' : 'status-incorrect'}">
              ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          </div>

          <div class="question-text">
            <strong>Question:</strong><br>
            ${question.question || 'No question text'}
          </div>

          <div class="answer-section">
            <h4>Your Answer:</h4>
            <div class="answer-display">
              ${question.type === 'code-ide' 
                ? `<pre class="code-block">${escapeHtml(userAnswerFormatted)}</pre>` 
                : escapeHtml(userAnswerFormatted)}
            </div>
          </div>

          <div class="answer-section">
            <h4>Correct Answer:</h4>
            <div class="answer-display correct-answer">
              ${question.type === 'code-ide' 
                ? `<pre class="code-block">${escapeHtml(correctAnswerFormatted)}</pre>` 
                : escapeHtml(correctAnswerFormatted)}
            </div>
          </div>
    `;

    // Add explanation if available
    if (question.explanation) {
      const explanation = question.explanation;
      // Check if explanation is a URL
      const isUrl = explanation.startsWith('http://') || explanation.startsWith('https://');
      
      html += `
          <div class="explanation-section">
            <h4>Explanation:</h4>
            ${isUrl 
              ? `<p><a href="${escapeHtml(explanation)}" target="_blank">Learn more about this question →</a></p>`
              : `<p>${escapeHtml(explanation)}</p>`}
          </div>
      `;
    }

    html += `</div>`;
  });

  html += `
      </div>

      <div class="footer">
        <p>This is an automated email containing your quiz results.</p>
        <p>Generated on ${dateTime}</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    text = String(text);
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sends quiz results via email using EmailJS
 * @param {Object} results - Quiz results object
 * @param {string} quizName - Name of the quiz
 * @returns {Promise<void>}
 */
export async function sendResultsEmail(results, quizName) {
  try {
    const userEmail = getUserEmail();
    
    if (!userEmail) {
      console.warn('Cannot send email: User email not available');
      return;
    }

    // Get EmailJS configuration from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY environment variables.');
      return;
    }

    // Initialize EmailJS
    emailjs.init(publicKey);

    // Format email content
    const emailContent = formatEmailContent(results, quizName);

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `Quiz Results: ${quizName || 'Quiz'}`,
      message: emailContent,
      quiz_name: quizName || 'Quiz',
      score: `${results.score}%`,
      status: results.passed ? 'PASSED' : 'FAILED',
      total_questions: results.total,
      correct_answers: results.correct,
      incorrect_answers: results.incorrect,
      unanswered: results.unanswered,
      time_spent: results.timeSpent ? formatTimeSpent(results.timeSpent) : 'N/A',
    };

    // Send email
    await emailjs.send(serviceId, templateId, templateParams);

    console.log('Quiz results email sent successfully to', userEmail);
  } catch (error) {
    console.error('Error sending quiz results email:', error);
    throw error;
  }
}
