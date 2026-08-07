/**
 * Scores password strength from 0–4 for UI meters.
 */
export const getPasswordStrength = (password = '') => {
  if (!password) {
    return { score: 0, label: '', barClass: 'bg-outline-variant/30', textClass: 'text-outline' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  score = Math.min(score, 4);

  const levels = {
    1: { label: 'Weak', barClass: 'bg-error', textClass: 'text-error' },
    2: { label: 'Fair', barClass: 'bg-warning', textClass: 'text-warning' },
    3: { label: 'Good', barClass: 'bg-info', textClass: 'text-info' },
    4: { label: 'Strong', barClass: 'bg-success', textClass: 'text-success' },
  };

  const level = levels[score] || levels[1];
  return { score, ...level };
};
