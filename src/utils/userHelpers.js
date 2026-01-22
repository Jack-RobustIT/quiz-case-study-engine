/**
 * User helper functions for retrieving user information
 * This is a placeholder that can be extended when authentication is implemented
 */

/**
 * Gets the user's email address
 * Priority:
 * 1. Future authentication context (when implemented)
 * 2. localStorage (for testing/development)
 * 3. Environment variable (for testing)
 * 4. Default test email (Jack.h@robustit.co.uk)
 * 
 * @returns {string|null} User email address or null if not available
 */
export function getUserEmail() {
  // TODO: When authentication is implemented, retrieve from auth context
  // Example: return useAuth()?.user?.email;
  
  // Check localStorage for testing
  const storedEmail = localStorage.getItem('userEmail');
  if (storedEmail) {
    return storedEmail;
  }
  
  // Check environment variable
  const envEmail = import.meta.env.VITE_USER_EMAIL;
  if (envEmail) {
    return envEmail;
  }
  
  // Default test email as specified
  return 'Jack.h@robustit.co.uk';
}

/**
 * Gets the user's username/display name
 * @returns {string|null} Username or null if not available
 */
export function getUsername() {
  // TODO: When authentication is implemented, retrieve from auth context
  // Example: return useAuth()?.user?.name;
  
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    return storedUsername;
  }
  
  // Extract username from email if available
  const email = getUserEmail();
  if (email) {
    return email.split('@')[0];
  }
  
  return null;
}
