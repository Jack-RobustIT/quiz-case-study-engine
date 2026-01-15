import React from "react";
import { isQuestionFullyAnswered } from "../../utils/questionHelpers";
import "./QuestionNavigation.css";

function QuestionNavigation({
  questions,
  currentIndex,
  answers,
  bookmarks,
  onQuestionSelect,
  reviewMode,
  filteredQuestions,
  unansweredQuestionsSnapshot,
}) {
  const questionsToShow = reviewMode ? filteredQuestions : questions;
  const questionIndices = reviewMode
    ? filteredQuestions.map((_, i) => {
        // Find original index in full questions array
        if (reviewMode === "bookmarked") {
          let count = 0;
          for (let j = 0; j < questions.length; j++) {
            if (bookmarks.has(j)) {
              if (count === i) return j;
              count++;
            }
          }
        } else if (reviewMode === "unanswered") {
          // Use snapshot to map filtered index to original index (same as in Quiz/CaseStudy)
          const unansweredIndices = unansweredQuestionsSnapshot 
            ? Array.from(unansweredQuestionsSnapshot).sort((a, b) => a - b)
            : [];
          return unansweredIndices[i] ?? i;
        }
        return i;
      })
    : questions.map((_, i) => i);

  return (
    <div className="question-navigation">
      <h3 className="navigation-title">
        {reviewMode === "bookmarked"
          ? "Bookmarked Questions"
          : reviewMode === "unanswered"
          ? "Unanswered Questions"
          : "All Questions"}
      </h3>
      <div className="question-buttons">
        {questionsToShow.map((_, displayIndex) => {
          const originalIndex = questionIndices[displayIndex];
          if (originalIndex === undefined || originalIndex === null) {
            return null;
          }
          const question = questions[originalIndex];
          const answer = answers[originalIndex];
          const isAnswered = question
            ? isQuestionFullyAnswered(question, answer)
            : false;
          const isBookmarked = bookmarks.has(originalIndex);
          const isCurrent = displayIndex === currentIndex;

          let buttonClass = "question-button";
          if (isCurrent) buttonClass += " question-button-current";
          if (isBookmarked) buttonClass += " question-button-bookmarked";
          if (isAnswered) buttonClass += " question-button-answered";

          return (
            <button
              key={displayIndex}
              className={buttonClass}
              onClick={() => onQuestionSelect(displayIndex)}
              aria-label={`Question ${reviewMode ? originalIndex + 1 : displayIndex + 1}${
                isAnswered ? ", answered" : ""
              }${isBookmarked ? ", marked for review" : ""}`}
            >
              {reviewMode ? originalIndex + 1 : displayIndex + 1}
              {isBookmarked && (
                <svg
                  className="review-star"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="#FFD700"
                  stroke="#FFD700"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionNavigation;
