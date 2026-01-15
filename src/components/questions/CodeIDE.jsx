import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './CodeIDE.css';

function CodeIDE({ 
  language = 'javascript', 
  initialCode = '', 
  userAnswer, 
  onAnswerChange,
  starterCode = '',
  readOnly = false 
}) {
  const [code, setCode] = useState(userAnswer || initialCode || starterCode || '');

  useEffect(() => {
    // Update local state when userAnswer changes (e.g., when navigating between questions)
    if (userAnswer !== undefined && userAnswer !== null) {
      setCode(userAnswer);
    } else if (initialCode || starterCode) {
      setCode(initialCode || starterCode);
    }
  }, [userAnswer, initialCode, starterCode]);

  const handleEditorChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    onAnswerChange(newCode);
  };

  return (
    <div className="code-ide-container">
      <div className="code-ide-editor">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      <div className="code-ide-info">
        <span className="code-ide-language">Language: {language}</span>
        {readOnly && <span className="code-ide-readonly">Read-only mode</span>}
      </div>
    </div>
  );
}

export default CodeIDE;
