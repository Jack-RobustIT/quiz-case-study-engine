# EmailJS Configuration Guide

This guide explains how to set up EmailJS for the automatic quiz results email feature.

## Overview

When a student completes a quiz, the results are automatically emailed to them. This feature uses EmailJS, a client-side email service that doesn't require a backend server.

## Setup Steps

### 1. Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails/month)

### 2. Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. **Note your Service ID** (e.g., `service_abc123`)

### 3. Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Configure your template with these variables:

**Required Template Variables:**
- `{{to_email}}` - Recipient email address
- `{{subject}}` - Email subject line
- `{{message}}` - HTML email content (contains full quiz results)

**Optional Template Variables (for custom templates):**
- `{{quiz_name}}` - Name of the quiz
- `{{score}}` - Score percentage (e.g., "85%")
- `{{status}}` - PASSED or FAILED
- `{{total_questions}}` - Total number of questions
- `{{correct_answers}}` - Number of correct answers
- `{{incorrect_answers}}` - Number of incorrect answers
- `{{unanswered}}` - Number of unanswered questions
- `{{time_spent}}` - Time spent on quiz (e.g., "45m 30s")

**Example Template:**
```
To: {{to_email}}
Subject: {{subject}}

{{message}}
```

4. **Note your Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key

1. Go to **Account** → **General** → **API Keys**
2. Copy your **Public Key** (e.g., `abcdefghijklmnop`)

### 5. Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

**Important:** 
- Environment variables in Vite must be prefixed with `VITE_`
- Never commit your `.env` file to version control
- Restart your development server after adding environment variables

### 6. Test Configuration

1. Complete a quiz in the application
2. Check the browser console for any errors
3. Verify the email is received at the configured email address

## User Email Configuration

The application retrieves the user's email address in this priority order:

1. **Authentication Context** (when implemented)
   - The email will be retrieved from your authentication system
   - Update `src/utils/userHelpers.js` to integrate with your auth

2. **localStorage** (for testing)
   ```javascript
   localStorage.setItem('userEmail', 'test@example.com');
   ```

3. **Environment Variable** (for testing)
   ```env
   VITE_USER_EMAIL=test@example.com
   ```

4. **Default Test Email**
   - Falls back to `Jack.h@robustit.co.uk` if none of the above are available

## Email Content

The email includes:

- **Header**: Quiz name, completion date/time, pass/fail status, score
- **Statistics**: Total questions, correct, incorrect, unanswered, time spent
- **Question Review**: For each question:
  - Question number and status (✓ Correct / ✗ Incorrect)
  - Question text
  - Student's answer
  - Correct answer
  - Explanation (if available)

The email is formatted as HTML with inline CSS for maximum compatibility.

## Troubleshooting

### Email Not Sending

1. **Check Console Errors**: Open browser developer tools and check for errors
2. **Verify Environment Variables**: Ensure all three EmailJS variables are set
3. **Check EmailJS Dashboard**: Verify your service and template are active
4. **Test EmailJS Directly**: Use EmailJS dashboard to send a test email

### Common Errors

- **"EmailJS configuration missing"**: Environment variables not set correctly
- **"Cannot send email: User email not available"**: User email not configured
- **EmailJS API errors**: Check your service/template IDs and public key

### Development vs Production

- **Development**: Uses `.env` file (not committed to git)
- **Production**: Set environment variables in your hosting platform
  - Vercel: Project Settings → Environment Variables
  - Netlify: Site Settings → Build & Deploy → Environment
  - Other platforms: Check their documentation

## Security Notes

- EmailJS Public Key is safe to expose in frontend code
- The public key only allows sending emails through your configured service
- No sensitive data is included in emails (only quiz results)
- User email should come from an authenticated source in production

## Support

For EmailJS-specific issues, refer to:
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Support](https://www.emailjs.com/support/)
