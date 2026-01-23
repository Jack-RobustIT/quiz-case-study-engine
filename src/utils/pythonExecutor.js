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
 * Extract required code elements from question text
 * Identifies functions, methods, and keywords that must be used in the code
 * @param {string} questionText - The question text to parse
 * @returns {string[]} Array of required elements (e.g., ['sorted', 'lambda'])
 */
export function extractRequiredElements(questionText) {
  if (!questionText || typeof questionText !== 'string') {
    return [];
  }

  const requiredElements = new Set();
  const text = questionText.toLowerCase();

  // Common Python built-in functions
  const pythonFunctions = [
    'sorted', 'min', 'max', 'sum', 'len', 'range', 'enumerate', 'zip',
    'map', 'filter', 'reduce', 'any', 'all', 'abs', 'round', 'int', 'float',
    'str', 'list', 'dict', 'set', 'tuple', 'type', 'isinstance', 'print'
  ];

  // Check for function patterns like "Use the `sorted()` function" or "use sorted()"
  pythonFunctions.forEach(func => {
    const patterns = [
      // "Use the `sorted()` function" or "use sorted() function"
      new RegExp(`use\\s+(?:the\\s+)?[\`']?${func}\\(\\)?[\`']?\\s+function`, 'i'),
      // "using sorted()" or "using the sorted() function"
      new RegExp(`using\\s+(?:the\\s+)?[\`']?${func}\\(\\)?[\`']?`, 'i'),
      // Backtick or quote wrapped: `sorted()` or 'sorted()'
      new RegExp(`[\`']${func}\\(\\)?[\`']`, 'i'),
      // Direct mention: sorted() in text
      new RegExp(`\\b${func}\\(\\)`, 'i'),
      // "with sorted()" pattern
      new RegExp(`with\\s+[\`']?${func}\\(\\)?[\`']?`, 'i')
    ];
    
    if (patterns.some(pattern => pattern.test(questionText))) {
      requiredElements.add(func);
    }
  });

  // Check for lambda keyword
  if (/\blambda\s+(?:function)?/i.test(questionText) || /with\s+a\s+lambda/i.test(questionText)) {
    requiredElements.add('lambda');
  }

  // Check for method calls like "use `.split()` method" or "call `.split()`"
  const methodPattern = /(?:use|call|using)\s+[`']\.(\w+)\(\)[`']?\s*(?:method|function)?/gi;
  let methodMatch;
  while ((methodMatch = methodPattern.exec(text)) !== null) {
    requiredElements.add(methodMatch[1]);
  }

  // Check for keywords like "def", "class", "import", "from"
  const keywords = ['def', 'class', 'import', 'from', 'try', 'except', 'with', 'as'];
  keywords.forEach(keyword => {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(text) && 
        (text.includes(`use ${keyword}`) || text.includes(`using ${keyword}`) || 
         text.includes(`with ${keyword}`) || text.includes(`define.*${keyword}`))) {
      requiredElements.add(keyword);
    }
  });

  // Check for specific patterns like "define a function" -> requires 'def'
  if (/\bdefine\s+(?:a\s+)?function/i.test(text) && !text.includes('lambda')) {
    requiredElements.add('def');
  }

  return Array.from(requiredElements);
}

/**
 * Normalize code for pattern checking
 * Removes comments and normalizes whitespace while preserving code structure
 * @param {string} code - Python code to normalize
 * @returns {string} Normalized code
 */
export function normalizeCodeForPatternCheck(code) {
  if (!code || typeof code !== 'string') {
    return '';
  }

  let normalized = code;

  // Remove single-line comments (# ...)
  normalized = normalized.replace(/#.*$/gm, '');

  // Remove multi-line comments (""" ... """ or ''' ... ''')
  normalized = normalized.replace(/""".*?"""/gs, '');
  normalized = normalized.replace(/'''.*?'''/gs, '');

  // Remove string literals to avoid matching patterns inside strings
  // This is a simplified approach - we'll preserve the structure but remove content
  normalized = normalized.replace(/['"](?:[^'"\\]|\\.)*['"]/g, '""');

  // Normalize whitespace: collapse multiple spaces, preserve single spaces
  normalized = normalized.replace(/[ \t]+/g, ' ');
  
  // Normalize line breaks: replace all line breaks with single space
  normalized = normalized.replace(/\r\n/g, ' ');
  normalized = normalized.replace(/\r/g, ' ');
  normalized = normalized.replace(/\n/g, ' ');

  // Remove leading/trailing whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Check if required elements are present in user code
 * @param {string} userCode - User's Python code
 * @param {string[]} requiredElements - Array of required elements to check for
 * @returns {boolean} True if all required elements are found
 */
export function checkRequiredElements(userCode, requiredElements) {
  if (!requiredElements || requiredElements.length === 0) {
    return true; // No requirements means always pass
  }

  if (!userCode || typeof userCode !== 'string') {
    return false;
  }

  const normalizedCode = normalizeCodeForPatternCheck(userCode);

  // Check each required element
  for (const element of requiredElements) {
    let found = false;

    // Check for function calls: sorted(, min(, etc.
    if (/^[a-z_][a-z0-9_]*$/i.test(element)) {
      // It's a function name - check for function call pattern
      const functionPattern = new RegExp(`\\b${element}\\s*\\(`, 'i');
      if (functionPattern.test(normalizedCode)) {
        found = true;
      }
    }

    // Check for method calls: .split(, .join(, etc.
    const methodPattern = new RegExp(`\\.${element}\\s*\\(`, 'i');
    if (methodPattern.test(normalizedCode)) {
      found = true;
    }

    // Check for keywords: lambda, def, class, import, from, etc.
    const keywordPattern = new RegExp(`\\b${element}\\b`, 'i');
    if (keywordPattern.test(normalizedCode)) {
      found = true;
    }

    if (!found) {
      return false; // At least one required element is missing
    }
  }

  return true; // All required elements found
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
 * Optionally validates that required code elements are present
 * @param {string} userCode - User's Python code
 * @param {string} correctCode - Correct Python code
 * @param {Object|null} question - Optional question object containing question text
 * @returns {Promise<boolean>} True if outputs match and required elements are present
 */
export async function comparePythonOutputs(userCode, correctCode, question = null) {
  try {
    // If question is provided, check for required code elements
    if (question && question.question) {
      const requiredElements = extractRequiredElements(question.question);
      if (requiredElements.length > 0) {
        const hasRequiredElements = checkRequiredElements(userCode, requiredElements);
        if (!hasRequiredElements) {
          return false; // Required elements missing
        }
      }
    }

    // Execute both codes and compare outputs
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
