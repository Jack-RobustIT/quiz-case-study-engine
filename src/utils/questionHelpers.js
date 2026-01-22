/**
 * Shared utility functions for question validation and processing
 * This file centralises logic that was duplicated across multiple components
 */

/**
 * Determines if a question is fully answered based on its type and answer value
 * @param {Object} question - The question object
 * @param {*} answer - The user's answer (can be various types depending on question type)
 * @returns {boolean} - True if the question is fully answered, false otherwise
 */
export function isQuestionFullyAnswered(question, answer) {
  if (!answer && answer !== 0) {
    // Explicitly allow 0 if ever used as a valid answer
    return false;
  }

  // For code-completion and sql-completion, check if all blanks are filled
  if (question.type === 'code-completion' && question.codeLines) {
    const blankCount = question.codeLines.filter(
      (line) =>
        (line.type === 'dropdown' && line.options) ||
        (line.text && line.text.match(/<BLANK\s+\d+>/i) && line.options)
    ).length;
    if (blankCount === 0) return false; // No blanks means not answerable
    return (
      Array.isArray(answer) &&
      answer.length === blankCount &&
      answer.every((val) => val !== null && val !== undefined && val !== '')
    );
  }

  if (question.type === 'sql-completion' && question.sqlLines) {
    const blankCount = question.sqlLines.filter(
      (line) =>
        (line.type === 'dropdown' && line.options) ||
        (line.text && line.text.match(/<BLANK\s+\d+>/i) && line.options)
    ).length;
    if (blankCount === 0) return false;
    return (
      Array.isArray(answer) &&
      answer.length === blankCount &&
      answer.every((val) => val !== null && val !== undefined && val !== '')
    );
  }

  // For drag-and-drop, check if all drop zones are filled
  if (question.type === 'drag-and-drop' && question.correctOrder) {
    const requiredCount = Array.isArray(question.correctOrder)
      ? question.correctOrder.length
      : 0;
    if (requiredCount === 0) return false;
    return (
      Array.isArray(answer) &&
      answer.length === requiredCount &&
      answer.every((val) => val !== null && val !== undefined)
    );
  }

  // For multiple choice questions, consider answered if at least one option is selected
  // This allows users to under- or over-select options, matching real exam behaviour
  // Correctness is still determined by checkAnswer logic which requires exact matching
  if (question.type === 'multiple') {
    return (
      Array.isArray(answer) &&
      answer.length > 0 &&
      answer.every((val) => val !== null && val !== undefined && val !== '')
    );
  }

  // For code-ide questions, check if user has written code (not just starter code)
  if (question.type === 'code-ide') {
    if (typeof answer !== 'string') {
      return false;
    }
    const trimmedAnswer = answer.trim();
    const starterCode = (question.starterCode || '').trim();
    // Consider answered if there's code and it's different from starter code
    // or if there's meaningful code even if it matches starter code
    return trimmedAnswer.length > 0 && trimmedAnswer !== starterCode;
  }

  // For other types, any answer is considered answered
  return true;
}



