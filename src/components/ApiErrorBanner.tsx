import React from 'react';

const getMessage = (error: unknown) => {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Errore imprevisto.';
};

type Props = {
  error: unknown;
};

const ApiErrorBanner: React.FC<Props> = ({ error }) => {
  const message = getMessage(error);
  if (!message) return null;
  return <div className="border px-3 py-2 text-sm">{message}</div>;
};

export default ApiErrorBanner;
