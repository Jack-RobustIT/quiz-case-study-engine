import React from "react";
import "./MultipleChoice.css";

function MultipleChoice({ options, userAnswer, onAnswerChange }) {
  const handleChange = (option, isChecked) => {
    const currentAnswers = userAnswer || [];
    if (isChecked) {
      onAnswerChange([...currentAnswers, option]);
    } else {
      onAnswerChange(currentAnswers.filter((ans) => ans !== option));
    }
  };

  return (
    <div className="multiple-choice">
      {options.map((option, index) => {
        const isChecked = userAnswer && userAnswer.includes(option);
        return (
          <label key={index} className="multiple-choice-option">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleChange(option, e.target.checked)}
            />
            <span className="option-text">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export default MultipleChoice;
