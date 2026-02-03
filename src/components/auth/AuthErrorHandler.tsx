import React from 'react';
import { AuthContext, AuthFieldErrors, mapAuthError } from '../../utils/authErrorMapper';

type Props = {
  context: AuthContext;
  error: unknown;
  onFieldErrors: (errors: AuthFieldErrors) => void;
  onSystemError: (error: unknown | null) => void;
};

const AuthErrorHandler: React.FC<Props> = ({ context, error, onFieldErrors, onSystemError }) => {
  React.useEffect(() => {
    if (!error) {
      onFieldErrors({});
      onSystemError(null);
      return;
    }

    const mapped = mapAuthError(context, error);
    onFieldErrors(mapped.fieldErrors);
    onSystemError(mapped.systemError ?? null);
  }, [context, error, onFieldErrors, onSystemError]);

  return null;
};

export default AuthErrorHandler;
