/**
 * Shared Nexora password policy helpers.
 * Policy: min 8, upper, lower, digit, special character.
 */

export const PASSWORD_SPECIAL_RE = /[^A-Za-z0-9]/;

export const isStrongPassword = (password) => {
  const value = String(password || '');
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    PASSWORD_SPECIAL_RE.test(value)
  );
};

export const PASSWORD_POLICY_MESSAGES = {
  min: 'Password must be at least 8 characters',
  upper: 'Include at least one uppercase letter',
  lower: 'Include at least one lowercase letter',
  number: 'Include at least one number',
  special: 'Include at least one special character',
};

/**
 * Append Nexora strength rules to an express-validator body chain.
 */
export const withStrongPasswordRules = (chain) =>
  chain
    .isLength({ min: 8 })
    .withMessage(PASSWORD_POLICY_MESSAGES.min)
    .matches(/[A-Z]/)
    .withMessage(PASSWORD_POLICY_MESSAGES.upper)
    .matches(/[a-z]/)
    .withMessage(PASSWORD_POLICY_MESSAGES.lower)
    .matches(/[0-9]/)
    .withMessage(PASSWORD_POLICY_MESSAGES.number)
    .matches(PASSWORD_SPECIAL_RE)
    .withMessage(PASSWORD_POLICY_MESSAGES.special);
