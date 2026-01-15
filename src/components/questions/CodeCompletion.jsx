import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CodeCompletion.css';

function CodeCompletion({ codeLines, language, userAnswer, onAnswerChange }) {
  // Calculate the total number of blanks to ensure answer array maintains correct length
  const blankCount = React.useMemo(() => {
    if (!codeLines || !Array.isArray(codeLines)) return 0;
    return codeLines.filter(
      (line) =>
        (line.type === 'dropdown' && line.options) ||
        (line.text && line.text.match(/<BLANK\s+\d+>/i) && line.options)
    ).length;
  }, [codeLines]);

  const handleBlankChange = (blankIndex, value) => {
    // Ensure answer array has the correct length to preserve position information
    // This prevents partial answers from being incorrectly marked as complete
    const currentAnswer = userAnswer || [];
    const newAnswer = Array(blankCount).fill('').map((_, i) => 
      i === blankIndex ? value : (currentAnswer[i] || '')
    );
    onAnswerChange(newAnswer);
  };

  const renderLine = (line, lineIndex, blankCounter) => {
    if (!line) return null;
    
    // Handle type-based structure (from case study JSON)
    if (line.type === 'text' && line.content) {
      return (
        <div key={lineIndex} className="code-line">
          <SyntaxHighlighter
            language={language || 'javascript'}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '0.5rem 1rem',
              background: '#1e1e1e',
              borderRadius: '4px',
            }}
          >
            {line.content}
          </SyntaxHighlighter>
        </div>
      );
    }
    
    if (line.type === 'dropdown' && line.options) {
      const blankIndex = blankCounter.current;
      blankCounter.current += 1;
      const options = Array.isArray(line.options) ? line.options : [];
      
      return (
        <div key={lineIndex} className="code-line code-line-blank">
          <span className="blank-label">BLANK {blankIndex + 1}:</span>
          <select
            value={userAnswer && userAnswer[blankIndex] ? userAnswer[blankIndex] : ''}
            onChange={(e) => handleBlankChange(blankIndex, e.target.value)}
            className="blank-dropdown"
          >
            <option value="">Select an option...</option>
            {options.map((option, optIndex) => (
              <option key={optIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }
    
    // Fallback: Handle old structure with text and <BLANK N> tags
    if (line.text) {
      const blankMatch = line.text.match(/<BLANK\s+(\d+)>/i);
      if (blankMatch && line.options) {
        const blankIndex = parseInt(blankMatch[1]) - 1;
        const options = Array.isArray(line.options) ? line.options : [];
        
        return (
          <div key={lineIndex} className="code-line code-line-blank">
            <span className="blank-label">BLANK {blankIndex + 1}:</span>
            <select
              value={userAnswer && userAnswer[blankIndex] ? userAnswer[blankIndex] : ''}
              onChange={(e) => handleBlankChange(blankIndex, e.target.value)}
              className="blank-dropdown"
            >
              <option value="">Select an option...</option>
              {options.map((option, optIndex) => (
                <option key={optIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      }
      
      // Regular code line
      return (
        <div key={lineIndex} className="code-line">
          <SyntaxHighlighter
            language={language || 'javascript'}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '0.5rem 1rem',
              background: '#1e1e1e',
              borderRadius: '4px',
            }}
          >
            {line.text}
          </SyntaxHighlighter>
        </div>
      );
    }
    
    return null;
  };

  if (!codeLines || !Array.isArray(codeLines) || codeLines.length === 0) {
    return (
      <div className="code-completion">
        <div className="code-block">
          <p>No code available.</p>
        </div>
      </div>
    );
  }

  // Track blank index for type-based structure
  const blankCounter = { current: 0 };

  return (
    <div className="code-completion">
      <div className="code-block">
        {codeLines.map((line, index) => renderLine(line, index, blankCounter))}
      </div>
    </div>
  );
}

export default CodeCompletion;

