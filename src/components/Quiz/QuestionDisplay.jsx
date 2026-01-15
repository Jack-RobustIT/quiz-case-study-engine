import React from 'react';
import ReactMarkdown from 'react-markdown';
import SingleChoice from '../questions/SingleChoice';
import MultipleChoice from '../questions/MultipleChoice';
import DragAndDrop from '../questions/DragAndDrop';
import SqlCompletion from '../questions/SqlCompletion';
import CodeCompletion from '../questions/CodeCompletion';
import CodeIDE from '../questions/CodeIDE';
import './QuestionDisplay.css';

function QuestionDisplay({ question, questionIndex, userAnswer, onAnswerChange }) {
  if (!question) return null;

  const renderQuestionType = () => {
    switch (question.type) {
      case 'single':
        return (
          <SingleChoice
            options={question.options}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'multiple':
        return (
          <MultipleChoice
            options={question.options}
            userAnswer={userAnswer || []}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'drag-and-drop':
        return (
          <DragAndDrop
            options={question.options}
            userAnswer={userAnswer || []}
            onAnswerChange={onAnswerChange}
            correctOrder={question.correctOrder}
          />
        );
      case 'sql-completion':
        return (
          <SqlCompletion
            sqlLines={question.sqlLines}
            userAnswer={userAnswer || []}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'code-completion':
        return (
          <CodeCompletion
            codeLines={question.codeLines}
            language={question.language || 'javascript'}
            userAnswer={userAnswer || []}
            onAnswerChange={onAnswerChange}
          />
        );
      case 'code-ide':
        return (
          <CodeIDE
            language={question.language || 'javascript'}
            initialCode={question.starterCode || ''}
            starterCode={question.starterCode || ''}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            readOnly={question.readOnly || false}
          />
        );
      default:
        return <div>Unknown question type: {question.type}</div>;
    }
  };

  return (
    <div className="question-display">
      {question.image && (
        <div className="question-image">
          <img src={question.image} alt="Question illustration" />
        </div>
      )}
      <div className="question-text">
        <ReactMarkdown>{question.question}</ReactMarkdown>
      </div>
      <div className="question-answer-area">
        {renderQuestionType()}
      </div>
    </div>
  );
}

export default QuestionDisplay;

