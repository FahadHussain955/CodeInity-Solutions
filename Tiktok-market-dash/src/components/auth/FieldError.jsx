const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <p className="mt-1 text-body-sm text-error" role="alert">
      {message}
    </p>
  );
};

export default FieldError;
