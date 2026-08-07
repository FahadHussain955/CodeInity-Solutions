const AuthErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-error/30 bg-error-container px-4 py-3 flex items-start gap-2 text-body-sm text-on-error-container"
    >
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
      <p className="flex-1 min-w-0">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-on-error-container/80 hover:text-on-error-container transition-colors shrink-0"
          aria-label="Dismiss error"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
};

export default AuthErrorAlert;
