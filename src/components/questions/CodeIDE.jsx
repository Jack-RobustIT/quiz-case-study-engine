import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { getPythonOutput } from '../../utils/pythonExecutor';
import './CodeIDE.css';

// Python IDE with Monaco Editor and code execution
function PythonIDE({ initialCode, onAnswerChange, readOnly }) {
  const { theme } = useTheme();
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine theme for Monaco Editor
  const monacoTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) 
    ? 'vs-dark' 
    : 'vs';

  useEffect(() => {
    // Update code when initialCode changes (e.g., navigating between questions)
    if (initialCode !== undefined) {
      setCode(initialCode);
      // Clear output when code changes
      setOutput('');
      setError('');
    }
  }, [initialCode]);

  const handleChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    if (onAnswerChange) {
      onAnswerChange(newCode);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('');
      setError('');
      return;
    }

    setIsExecuting(true);
    setError('');
    setOutput('Executing...');

    try {
      const result = await getPythonOutput(code);
      if (result.startsWith('Error: ')) {
        setError(result);
        setOutput('');
      } else {
        setOutput(result);
        setError('');
      }
    } catch (err) {
      setError(`Execution error: ${err.message || String(err)}`);
      setOutput('');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="python-ide-layout">
      <div className="python-editor-container">
        <div className="python-editor-header">
          <button
            className="python-run-button"
            onClick={handleRunCode}
            disabled={isExecuting || readOnly || !code.trim()}
            title="Run Python code (Ctrl+Enter)"
          >
            {isExecuting ? 'Running...' : '▶ Run Code'}
          </button>
        </div>
        <Editor
          height="400px"
          language="python"
          theme={monacoTheme}
          value={code}
          onChange={handleChange}
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
          onMount={(editor) => {
            // Add keyboard shortcut: Ctrl+Enter or Cmd+Enter to run code
            editor.addCommand(
              /* eslint-disable-next-line no-bitwise */
              window.monaco?.editor?.KeyMod?.CtrlCmd | window.monaco?.editor?.KeyCode?.Enter || 2048 | 3,
              () => {
                if (!readOnly && code.trim()) {
                  handleRunCode();
                }
              }
            );
          }}
        />
      </div>
      <div className="sandpack-output-container">
        <div className="python-output-header">Output</div>
        <div className="python-output-content">
          {isLoading && <div className="python-loading">Loading Python runtime...</div>}
          {error && <div className="python-error">{error}</div>}
          {output && !error && <pre className="python-output-text">{output}</pre>}
          {!output && !error && !isLoading && (
            <div className="python-output-placeholder">
              <p>Click "Run Code" to execute your Python code</p>
              <p className="text-sm text-muted-foreground">Or press Ctrl+Enter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeIDE({ 
  language = 'javascript', 
  initialCode = '', 
  userAnswer, 
  onAnswerChange,
  starterCode = '',
  readOnly = false 
}) {
  const [code, setCode] = useState(userAnswer || initialCode || starterCode || '');
  const { theme } = useTheme();

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
    if (onAnswerChange) {
      onAnswerChange(newCode);
    }
  };

  // Use simplified Python IDE for Python, regular Monaco Editor for other languages
  if (language === 'python') {
    const codeToUse = code || starterCode || initialCode || '';
    return (
      <div className="code-ide-container code-ide-sandpack">
        <PythonIDE 
          initialCode={codeToUse}
          onAnswerChange={handleEditorChange}
          readOnly={readOnly}
        />
        <div className="code-ide-info">
          <span className="code-ide-language">Language: {language}</span>
          {readOnly && <span className="code-ide-readonly">Read-only mode</span>}
        </div>
      </div>
    );
  }

  // Regular Monaco Editor for non-Python languages (backward compatible)
  const monacoTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) 
    ? 'vs-dark' 
    : 'vs';

  return (
    <div className="code-ide-container">
      <div className="code-ide-editor">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme={monacoTheme}
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
