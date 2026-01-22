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
- **Email Results**: Automatic email delivery of quiz results to students

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

2. Configure EmailJS (optional, for email results feature):
   - Create an account at [EmailJS](https://www.emailjs.com/)
   - Set up an email service (Gmail, Outlook, etc.)
   - Create an email template
   - Copy `.env.example` to `.env` and add your EmailJS credentials:
     ```
     VITE_EMAILJS_SERVICE_ID=your_service_id
     VITE_EMAILJS_TEMPLATE_ID=your_template_id
     VITE_EMAILJS_PUBLIC_KEY=your_public_key
     ```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

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

## Email Results Feature

When a quiz is submitted, results are automatically emailed to the student. The email includes:
- Quiz name and completion date/time
- Score percentage and pass/fail status
- Statistics (total questions, correct, incorrect, unanswered, time spent)
- Complete question review with:
  - Question text
  - Student's answer
  - Correct answer
  - Explanation (if available)

### EmailJS Setup

1. **Create EmailJS Account**: Sign up at [EmailJS](https://www.emailjs.com/)

2. **Add Email Service**: 
   - Go to Email Services in your dashboard
   - Add a service (Gmail, Outlook, etc.)
   - Note your Service ID

3. **Create Email Template**:
   - Go to Email Templates
   - Create a new template
   - Use these template variables:
     - `{{to_email}}` - Recipient email
     - `{{subject}}` - Email subject
     - `{{message}}` - HTML email content (contains full results)
     - `{{quiz_name}}` - Quiz name
     - `{{score}}` - Score percentage
     - `{{status}}` - PASSED or FAILED
     - `{{total_questions}}` - Total number of questions
     - `{{correct_answers}}` - Number of correct answers
     - `{{incorrect_answers}}` - Number of incorrect answers
     - `{{unanswered}}` - Number of unanswered questions
     - `{{time_spent}}` - Time spent on quiz
   - Note your Template ID

4. **Get Public Key**:
   - Go to Account → API Keys
   - Copy your Public Key

5. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`
   - Add your EmailJS credentials

### User Email Configuration

The application retrieves user email in this priority order:
1. Future authentication context (when implemented)
2. `localStorage.getItem('userEmail')` (for testing)
3. `VITE_USER_EMAIL` environment variable
4. Default test email: `Jack.h@robustit.co.uk`

To test with a specific email, you can set it in localStorage:
```javascript
localStorage.setItem('userEmail', 'your-email@example.com');
```

## Technologies Used

- React 18
- React Router
- Vite
- React Markdown
- React Syntax Highlighter
- EmailJS (for email results)
- CSS3

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for educational purposes.

