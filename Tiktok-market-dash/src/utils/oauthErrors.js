/** Map OAuth redirect ?error= codes to user-facing copy. */
export const oauthErrorMessage = (code, { page = 'login' } = {}) => {
  switch (code) {
    case 'google_not_configured':
      return 'Google Sign-In is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.';
    case 'not_registered':
      return 'No account found for this Google email. Please create an account first.';
    case 'already_registered':
      return 'An account with this Google email already exists. Please sign in instead.';
    case 'google_failed':
      return page === 'register'
        ? 'Google sign-up failed. Please try again or use email.'
        : 'Google sign-in failed. Please try again or use email.';
    default:
      return code
        ? page === 'register'
          ? 'Google sign-up failed. Please try again or use email.'
          : 'Google sign-in failed. Please try again or use email.'
        : null;
  }
};
