# Mock Quiz & Case Study Engine - Features and Functionality

## Overview

The Robust IT Mock Quiz Engine is a comprehensive web-based application designed for IT certification preparation. It supports multiple assessment types including mock exams, case studies, knowledge checks, and simulations, providing an authentic exam experience with robust features for learning and assessment.

---

## Mock Quiz Features

### Core Functionality

#### 1. **Question Management**
- **Question Shuffling**: Questions and answer options are randomly shuffled for each quiz session (except drag-and-drop questions which maintain their structure)
- **Dynamic Question Loading**: Questions are loaded from JSON files via a quiz selector dropdown
- **Question Navigation**: Numbered buttons allow direct navigation to any question
- **Question Counter**: Displays current question number and total questions

#### 2. **Timer Functionality**
- **Configurable Timer**: Default 90-minute countdown timer (configurable)
- **Real-time Display**: Timer updates every second showing minutes:seconds format
- **Auto-submission**: Automatically submits the quiz when time expires
- **Time Tracking**: Records start time, end time, and calculates total time spent

#### 3. **Answer Management**
- **Answer Storage**: All user answers are stored and preserved during navigation
- **Answer Persistence**: Answers remain visible when navigating between questions
- **Answer Validation**: Validates answers before submission
- **Answer Status Tracking**: Visual indicators show which questions have been answered

#### 4. **Bookmarking System**
- **Bookmark Questions**: Mark questions for later review with a single click
- **Bookmark Counter**: Tracks total number of bookmarked questions
- **Visual Indicators**: Bookmarked questions are highlighted with yellow background
- **Bookmark Review Mode**: Dedicated mode to review only bookmarked questions

#### 5. **Review Modes**

##### Bookmarked Questions Review
- **Automatic Detection**: System detects unanswered bookmarked questions before submission
- **Dedicated Navigation**: Navigate only through bookmarked questions
- **Review Completion**: Option to finish review and proceed to submission

##### Unanswered Questions Review
- **Smart Detection**: Automatically identifies unanswered questions
- **Threshold Warnings**: 
  - Warns if >80% questions are unanswered
  - Prompts to review unanswered questions before submission
- **Focused Navigation**: Navigate only through unanswered questions
- **Completion Options**: Option to submit after reviewing or continue reviewing

#### 6. **Progress Tracking**
- **Completion Counter**: Displays "X/Y questions completed" in real-time
- **Progress Bar**: Visual progress bar showing percentage completion
- **Progress Percentage**: Displays completion percentage numerically
- **Status Indicators**: Question buttons change colour based on status:
  - Default: Unanswered
  - Blue (#1ea8e7): Answered
  - Yellow (#FFFF00): Bookmarked

#### 7. **Results & Scoring**
- **Score Calculation**: Calculates correct answers, incorrect answers, and percentage score
- **Pass/Fail Indicator**: Visual feedback for scores ≥85% (pass) or <85% (fail)
- **Detailed Review**: 
  - Shows all questions with user answers and correct answers
  - Displays explanations for each question
  - Highlights correct (green) and incorrect (red) answers
  - Shows all available options for each question
- **Time Spent**: Displays total time spent on the quiz
- **Summary Statistics**: 
  - Total questions
  - Correct answers count
  - Incorrect/unanswered count
  - Score percentage

#### 8. **User Interface Features**
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Navigation Buttons**: Previous, Next, Submit buttons with smart visibility
- **Question Buttons**: Grid of numbered buttons for quick navigation
- **Popup Notifications**: Modal popups for confirmations and warnings
- **Image Support**: Questions can include images for visual context
- **Markdown Support**: Question text supports line breaks and basic formatting

#### 9. **Submission Workflow**
- **Pre-submission Validation**: 
  - Checks for unanswered bookmarked questions
  - Warns about unanswered questions
  - Provides options to review before submitting
- **Confirmation Dialogs**: Multiple confirmation steps before final submission
- **Smart Warnings**: Context-aware warnings based on completion status

---

## Case Study Features

### Enhanced Functionality

Case studies include all features from mock quizzes PLUS the following:

#### 1. **Case Study Context Panel**
- **Accordion-based Information**: Collapsible sections for easy navigation
- **Instructions Section**: Detailed instructions on how to use case studies
- **Overview Section**: 
  - Company Overview
  - IT Structure
  - Expandable sub-sections
- **Existing Environment Section**: 
  - Fabric configuration
  - Source Systems
  - Product Data
  - Azure setup
  - User Problems
  - Expandable sub-sections
- **Requirements Section**: 
  - Planned Changes
  - Technical Requirements
  - Data Transformation
  - Data Security
  - Expandable sub-sections

#### 2. **Two-Panel Layout**
- **Left Panel**: Case study information and context
- **Right Panel**: Questions and answer area
- **Responsive Design**: Adapts to different screen sizes

#### 3. **Question Counter**
- Displays "Case Study Question: X of Y" format
- Updates dynamically as user navigates

#### 4. **Modular Architecture**
- **StateManager**: Centralised state management (no global variables)
- **DataService**: Handles data loading and validation
- **TimerService**: Manages timer functionality
- **QuestionManager**: Handles question display and answer processing
- **UIController**: Manages all UI operations
- **ResultCalculator**: Calculates scores and results
- **CaseStudyApp**: Main orchestrator class

#### 5. **Enhanced Error Handling**
- Global error handlers for unexpected errors
- User-friendly error messages
- Automatic error recovery suggestions

---

## Question Types

The system supports **five distinct question types**:

### 1. **Single Choice Questions** (`type: "single"`)
- **Format**: Radio buttons (only one answer can be selected)
- **Answer Format**: Single string value
- **Use Case**: Traditional multiple-choice questions with one correct answer
- **Example**: "Which Azure service is used for data warehousing?"
  - Options: A. Azure SQL Database, B. Azure Synapse Analytics, C. Azure Data Factory, D. Azure Blob Storage
  - Correct Answer: ["Azure Synapse Analytics"]

### 2. **Multiple Choice Questions** (`type: "multiple"`)
- **Format**: Checkboxes (multiple answers can be selected)
- **Answer Format**: Array of strings
- **Use Case**: Questions requiring multiple correct answers
- **Validation**: All correct answers must be selected, and no incorrect answers
- **Example**: "Which of the following are Azure compute services? (Select all that apply)"
  - Options: A. Azure VMs, B. Azure Functions, C. Azure Storage, D. Azure App Service
  - Correct Answer: ["Azure VMs", "Azure Functions", "Azure App Service"]

### 3. **Drag-and-Drop Questions** (`type: "drag-and-drop"`)
- **Format**: Interactive drag-and-drop interface
- **Structure**: 
  - Left side: List of draggable items (actions/options)
  - Right side: Drop zones with position labels (Position 1, Position 2, etc.)
- **Answer Format**: Array of indices representing the order
- **Use Case**: Sequencing tasks, ordering steps, arranging items in correct sequence
- **Features**:
  - Items can be dragged from options list to drop zones
  - Items can be swapped between drop zones
  - Items can be returned to options list
  - Visual feedback during drag operations
- **Example**: "Arrange the following steps in the correct order for deploying an Azure resource:"
  - Options: ["Create resource group", "Configure settings", "Deploy template", "Verify deployment"]
  - Correct Order: [0, 1, 2, 3] (indices of options in correct sequence)

### 4. **SQL Completion Questions** (`type: "sql-completion"`)
- **Format**: SQL code with dropdown menus replacing blank spaces
- **Structure**: 
  - Text lines: Display SQL code
  - Dropdown lines: Replace `<BLANK N>` placeholders with selectable options
  - Inline dropdowns: Can appear inline with code or on separate lines
- **Answer Format**: Array of strings (selected dropdown values)
- **Use Case**: SQL query completion, filling in missing SQL keywords/clauses
- **Features**:
  - Syntax highlighting support (via highlight.js)
  - Numbered blanks (BLANK 1, BLANK 2, etc.)
  - Dropdown options for each blank
  - Maintains code formatting
- **Example**: "Complete the SQL query to join two tables:"
  ```sql
  SELECT * FROM Table1
  <BLANK 1> [dropdown: INNER JOIN, LEFT JOIN, RIGHT JOIN]
  Table2 ON Table1.id = Table2.id
  WHERE <BLANK 2> [dropdown: condition options]
  ```

### 5. **Code Completion Questions** (`type: "code-completion"`)
- **Format**: Code (any language) with dropdown menus replacing blank spaces
- **Structure**: Similar to SQL completion but for any programming language
- **Answer Format**: Array of strings (selected dropdown values)
- **Use Case**: Code snippet completion, filling in missing code elements
- **Features**:
  - Supports multiple programming languages
  - Syntax highlighting support
  - Numbered blanks
  - Dropdown options for each blank
- **Example**: "Complete the Python function:"
  ```python
  def calculate_sum(a, b):
      <BLANK 1> [dropdown: return, print, pass]
      a + b
  ```

---

## Additional Features

### 1. **Image Support**
- Questions can include images via the `image` field
- Images are displayed above or within question text
- Supports common image formats (PNG, JPG, etc.)
- Responsive image sizing

### 2. **Explanations**
- Each question includes an explanation field
- Explanations are shown in results review
- Supports both text explanations and URL links
- If explanation is a URL, displays as clickable link "Learn more about this question"

### 3. **Syntax Highlighting**
- Code blocks in questions support syntax highlighting
- Uses highlight.js library
- Supports multiple languages: SQL, JSON, Python, JavaScript, etc.
- Markdown code blocks with language tags (e.g., ```sql, ```json)

### 4. **Markdown Formatting**
- Question text supports markdown:
  - **Bold text** (`**text**`)
  - *Italic text* (`*text*`)
  - `Inline code` (backticks)
  - Code blocks with syntax highlighting
  - Line breaks

### 5. **Accessibility Features**
- ARIA labels for screen readers
- Keyboard navigation support
- Semantic HTML structure
- Focus management
- Progress bar with ARIA attributes

### 6. **Data Validation**
- JSON schema validation for questions
- Type checking for question types
- Option validation
- Answer format validation
- Error handling for invalid data

### 7. **State Management**
- Centralised state management (case studies)
- No global variables (case studies use StateManager)
- Immutable state updates
- Event-driven architecture
- State persistence during navigation

### 8. **Performance Optimisations**
- DOM element caching
- Efficient event delegation
- Batch DOM updates
- Lazy loading support
- Optimised rendering

---

## File Structure

### Quiz Files
- **Location**: `JSON/mock-exams/`, `JSON/knowledge-checks/`
- **Format**: JSON array of question objects
- **Structure**: Each question object contains:
  - `question`: Question text (string)
  - `options`: Array of answer options (string[])
  - `image`: Image URL or empty string (string)
  - `correctAnswer`: Array of correct answers (string[] or number[])
  - `type`: Question type ("single", "multiple", "drag-and-drop", "sql-completion", "code-completion")
  - `explanation`: Explanation text or URL (string)
  - `quizName`: Quiz name (string, for mock exams only)
  - `correctOrder`: Array of indices for drag-and-drop (number[], optional)
  - `sqlLines`/`codeLines`: Array of line objects for completion questions (object[], optional)

### Case Study Files
- **Location**: `JSON/case-studies/`
- **Format**: JSON object with case study data and questions
- **Structure**:
  - `caseStudyName`: Name of case study (string)
  - `overview`: Object with company overview and IT structure
  - `existingEnvironment`: Object with environment details
  - `requirements`: Object with requirements details
  - `questions`: Array of question objects (same structure as quiz questions)

---

## Technical Architecture

### Mock Quiz (`questions.js`)
- **Architecture**: Procedural JavaScript with global state
- **Features**: All core quiz functionality
- **File**: `js/questions.js`

### Case Study (`case-study.js` + modules)
- **Architecture**: Modular, class-based architecture
- **Modules**:
  - `CaseStudyApp.js`: Main application orchestrator
  - `StateManager.js`: Centralised state management
  - `DataService.js`: Data loading and validation
  - `TimerService.js`: Timer functionality
  - `QuestionManager.js`: Question display and handling
  - `UIController.js`: UI operations
  - `ResultCalculator.js`: Scoring and analysis
  - `Config.js`: Configuration constants
- **Benefits**: 
  - No global variables
  - Separation of concerns
  - Easy testing
  - Better error handling
  - Improved performance

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- LocalStorage support for state persistence
- Drag-and-drop API support

---

## Summary

The Mock Quiz & Case Study Engine provides a comprehensive assessment platform with:

- **5 Question Types**: Single choice, multiple choice, drag-and-drop, SQL completion, code completion
- **Advanced Features**: Timer, bookmarking, review modes, progress tracking, detailed results
- **Case Study Enhancements**: Context panels, accordion navigation, modular architecture
- **User Experience**: Responsive design, accessibility features, visual feedback
- **Technical Excellence**: Modern architecture, error handling, performance optimisations

This system provides an authentic exam experience while offering powerful tools for learning and assessment preparation.

