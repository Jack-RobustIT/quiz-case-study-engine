/**
 * Python code execution utility using Pyodide
 * Executes Python code in the browser and captures output for validation
 */

let pyodideInstance = null;
let isLoading = false;
let loadPromise = null;

/**
 * Initialize Pyodide (lazy load on first use)
 * @returns {Promise<Object>} Pyodide instance
 */
async function loadPyodide() {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Dynamically import pyodide
      const pyodide = await import('pyodide');
      
      // Initialize Pyodide
      pyodideInstance = await pyodide.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/',
      });

      // Set up stdout capture
      pyodideInstance.runPython(`
import sys
from io import StringIO

# Create a StringIO object to capture stdout
_captured_output = StringIO()
_original_stdout = sys.stdout
_original_stderr = sys.stderr

def capture_output():
    sys.stdout = _captured_output
    sys.stderr = _captured_output

def get_output():
    output = _captured_output.getvalue()
    _captured_output.seek(0)
    _captured_output.truncate(0)
    return output

def restore_output():
    sys.stdout = _original_stdout
    sys.stderr = _original_stderr
`);

      isLoading = false;
      return pyodideInstance;
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Normalize output for comparison
 * @param {string} output - Raw output string
 * @returns {string} Normalized output
 */
function normalizeOutput(output) {
  if (!output || typeof output !== 'string') {
    return '';
  }

  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+$/gm, '');
}

/**
 * Execute Python code and capture output
 * @param {string} code - Python code to execute
 * @returns {Promise<{output: string, error: string|null, success: boolean}>}
 */
export async function executePythonCode(code) {
  if (!code || typeof code !== 'string') {
    return {
      output: '',
      error: null,
      success: true,
    };
  }

  try {
    const pyodide = await loadPyodide();

    // Set up output capture
    pyodide.runPython('capture_output()');

    // Execute the code
    try {
      pyodide.runPython(code);
      const output = pyodide.runPython('get_output()');
      
      // Restore stdout
      pyodide.runPython('restore_output()');

      return {
        output: normalizeOutput(output),
        error: null,
        success: true,
      };
    } catch (execError) {
      // Get any output before the error
      const output = pyodide.runPython('get_output()');
      pyodide.runPython('restore_output()');

      // Extract error message
      const errorMessage = execError.message || String(execError);
      
      return {
        output: normalizeOutput(output),
        error: errorMessage,
        success: false,
      };
    }
  } catch (error) {
    return {
      output: '',
      error: error.message || 'Failed to execute Python code',
      success: false,
    };
  }
}

/**
 * Compare two Python code outputs
 * Executes both codes and compares their outputs
 * @param {string} userCode - User's Python code
 * @param {string} correctCode - Correct Python code
 * @returns {Promise<boolean>} True if outputs match
 */
export async function comparePythonOutputs(userCode, correctCode) {
  try {
    const [userResult, correctResult] = await Promise.all([
      executePythonCode(userCode),
      executePythonCode(correctCode),
    ]);

    // If either execution failed, return false
    if (!userResult.success || !correctResult.success) {
      return false;
    }

    // Compare normalized outputs
    return userResult.output === correctResult.output;
  } catch (error) {
    console.error('Error comparing Python outputs:', error);
    return false;
  }
}

/**
 * Get the output of Python code execution (for display purposes)
 * @param {string} code - Python code to execute
 * @returns {Promise<string>} The output string
 */
export async function getPythonOutput(code) {
  const result = await executePythonCode(code);
  if (result.error) {
    return `Error: ${result.error}`;
  }
  return result.output || '(no output)';
}
