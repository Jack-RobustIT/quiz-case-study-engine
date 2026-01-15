# Mock Quiz & Case Study Engine

A comprehensive React-based web application for IT certification preparation, supporting mock exams, knowledge checks, and case studies.

## Features

### Core Functionality
- **5 Question Types**: Single choice, multiple choice, drag-and-drop, SQL completion, code completion
- **Timer**: Configurable countdown timer with auto-submission
- **Bookmarking**: Mark questions for later review
- **Review Modes**: Review bookmarked or unanswered questions
- **Progress Tracking**: Real-time progress bar and completion statistics
- **Results & Scoring**: Detailed results with explanations and pass/fail indicators

### Case Study Features
- **Context Panel**: Accordion-based information panel with company overview, existing environment, and requirements
- **Two-Panel Layout**: Context information on the left, questions on the right
- **All Quiz Features**: Case studies include all features from mock quizzes

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
reactMocks/
├── public/
│   └── JSON/
│       ├── mock-exams/          # Mock exam JSON files
│       ├── knowledge-checks/    # Knowledge check JSON files
│       └── case-studies/        # Case study JSON files
├── src/
│   ├── components/
│   │   ├── Home.jsx            # Home page with quiz selection
│   │   ├── Quiz/               # Quiz components
│   │   ├── CaseStudy/          # Case study components
│   │   ├── questions/          # Question type components
│   │   └── shared/             # Shared components
│   ├── context/                # React Context providers
│   ├── utils/                  # Utility functions
│   └── App.jsx                 # Main app component
└── package.json
```

## JSON Data Format

### Quiz Questions Format

```json
{
  "question": "Question text here",
  "options": ["Option 1", "Option 2", "Option 3"],
  "image": "url-to-image-or-empty-string",
  "correctAnswer": ["Correct Answer"],
  "type": "single|multiple|drag-and-drop|sql-completion|code-completion",
  "explanation": "Explanation text or URL"
}
```

### Case Study Format

```json
{
  "caseStudyName": "Case Study Name",
  "overview": {
    "companyOverview": "...",
    "itStructure": "..."
  },
  "existingEnvironment": {
    "fabricConfiguration": "...",
    "sourceSystems": "..."
  },
  "requirements": {
    "plannedChanges": "...",
    "technicalRequirements": "..."
  },
  "questions": [...]
}
```

## Question Types

1. **Single Choice** (`type: "single"`): Radio buttons, one correct answer
2. **Multiple Choice** (`type: "multiple"`): Checkboxes, multiple correct answers
3. **Drag-and-Drop** (`type: "drag-and-drop"`): Order items correctly
4. **SQL Completion** (`type: "sql-completion"`): Complete SQL queries with dropdowns
5. **Code Completion** (`type: "code-completion"`): Complete code snippets with dropdowns

## Technologies Used

- React 18
- React Router
- Vite
- React Markdown
- React Syntax Highlighter
- CSS3

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for educational purposes.

