import { getPasswordStrength } from '@/features/auth/passwordStrength';

const PasswordStrength = ({ password }) => {
  const { score, label, barClass, textClass } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 rounded-full transition-colors duration-150 ${
              step <= score ? barClass : 'bg-outline-variant/30'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-label-caps uppercase tracking-wider ${textClass}`}>
        Password strength: {label}
      </p>
    </div>
  );
};

export default PasswordStrength;
