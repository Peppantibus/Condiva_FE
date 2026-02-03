import React, { useState, useEffect } from 'react';
import { ErrorDialog } from './ui/ErrorDialog';

type Props = {
  error: unknown;
};

const ApiErrorBanner: React.FC<Props> = ({ error }) => {
  const [activeError, setActiveError] = useState<unknown>(null);

  useEffect(() => {
    if (error) {
      setActiveError(error);
    }
  }, [error]);

  if (!activeError) return null;

  return (
    <ErrorDialog
      error={activeError}
      onClear={() => setActiveError(null)}
    />
  );
};

export default ApiErrorBanner;
