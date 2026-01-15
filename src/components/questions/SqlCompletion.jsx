import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './SqlCompletion.css';

function SqlCompletion({ sqlLines, userAnswer, onAnswerChange }) {
  // Calculate the total number of blanks to ensure answer array maintains correct length
  // Supports both new structure (type: "dropdown") and old structure (text with <BLANK N>)
  const blankCount = React.useMemo(() => {
    if (!sqlLines || !Array.isArray(sqlLines)) return 0;
    return sqlLines.filter(
      (line) =>
        (line.type === 'dropdown' && line.options) ||
        (line.text && line.text.match(/<BLANK\s+\d+>/i) && line.options)
    ).length;
  }, [sqlLines]);

  const handleBlankChange = (blankIndex, value) => {
    // Ensure answer array has the correct length to preserve position information
    // This prevents partial answers from being incorrectly marked as complete
    const currentAnswer = userAnswer || [];
    const newAnswer = Array(blankCount).fill('').map((_, i) => 
      i === blankIndex ? value : (currentAnswer[i] || '')
    );
    onAnswerChange(newAnswer);
  };

  const getBlankIndex = (line) => {
    if (!line || !line.text) return null;
    const match = line.text.match(/<BLANK\s+(\d+)>/i);
    return match ? parseInt(match[1]) - 1 : null;
  };

  const renderLine = (line, lineIndex, blankCounter) => {
    if (!line) return null;
    
    // Handle type-based structure (from case study JSON - new structure)
    if (line.type === 'text' && line.content) {
      return (
        <div key={lineIndex} className="sql-line">
          <SyntaxHighlighter
            language="sql"
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
        <div key={lineIndex} className="sql-line sql-line-blank">
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
      const blankIndex = getBlankIndex(line);
      const hasOptions = line.options && Array.isArray(line.options) && line.options.length > 0;
      const isStandaloneBlank = blankIndex !== null && line.text.trim() === `<BLANK ${blankIndex + 1}>`;
      
      // If this is a standalone blank line with options, render dropdown
      if (isStandaloneBlank && hasOptions) {
        const options = line.options;
        
        return (
          <div key={lineIndex} className="sql-line sql-line-blank">
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

      // If line contains <BLANK N> but has no options, it's a placeholder - remove the placeholder text
      if (blankIndex !== null && !hasOptions) {
        const cleanText = line.text.replace(/<BLANK\s+\d+>/gi, '').trim();
        if (!cleanText) return null; // Skip empty placeholder lines
        
        return (
          <div key={lineIndex} className="sql-line">
            <SyntaxHighlighter
              language="sql"
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: '0.5rem 1rem',
                background: '#1e1e1e',
                borderRadius: '4px',
              }}
            >
              {cleanText}
            </SyntaxHighlighter>
          </div>
        );
      }

      // Regular SQL line with syntax highlighting (no blanks)
      return (
        <div key={lineIndex} className="sql-line">
          <SyntaxHighlighter
            language="sql"
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

  if (!sqlLines || !Array.isArray(sqlLines) || sqlLines.length === 0) {
    return (
      <div className="sql-completion">
        <div className="sql-code-block">
          <p>No SQL code available.</p>
        </div>
      </div>
    );
  }

  // Track blank index for type-based structure
  const blankCounter = { current: 0 };

  return (
    <div className="sql-completion">
      <div className="sql-code-block">
        {sqlLines.map((line, index) => renderLine(line, index, blankCounter))}
      </div>
    </div>
  );
}

export default SqlCompletion;

