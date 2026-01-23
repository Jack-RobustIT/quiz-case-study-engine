import React from "react";
import "./SingleChoice.css";

function SingleChoice({ options, userAnswer, onAnswerChange }) {
  const handleChange = (option) => {
    onAnswerChange(option);
  };

  return (
    <fieldset className="single-choice">
      <legend className="sr-only">Select one option</legend>
      {options.map((option, index) => (
        <label key={index} className="single-choice-option">
          <input
            type="radio"
            name="single-choice"
            value={option}
            checked={userAnswer === option}
            onChange={() => handleChange(option)}
          />
          <span className="option-text">{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default SingleChoice;
