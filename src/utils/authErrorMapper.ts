export type AuthContext = 'login' | 'register';

export type AuthFieldErrors = Partial<Record<'username' | 'email' | 'password' | 'name' | 'lastName', string>>;

type ParsedError = {
  status: number;
  code?: string;
  message?: string;
  raw: unknown;
};

const parseError = (err: unknown): ParsedError => {
  const errorObj = err as {
    status?: number;
    response?: { status?: number; data?: any } | string;
    code?: string;
    message?: string;
    error?: { code?: string; message?: string };
    result?: { error?: { message?: string } };
  };

  let status = errorObj?.status ?? (errorObj?.response as { status?: number })?.status ?? 0;
  let code: string | undefined = errorObj?.code ?? errorObj?.error?.code;
  let message: string | undefined =
    (errorObj?.response as { data?: { error?: { code?: string; message?: string }; message?: string } })?.data?.error?.message ??
    (errorObj?.response as { data?: { error?: { message?: string }; message?: string } })?.data?.message ??
    errorObj?.error?.message ??
    errorObj?.message ??
    undefined;

  const responseData = (errorObj?.response as { data?: any })?.data;
  if (responseData && typeof responseData === 'object') {
    code = responseData?.error?.code ?? responseData?.code ?? code;
    message = responseData?.error?.message ?? responseData?.message ?? message;
  }

  // Handle SwaggerException where response is a JSON string
  if (typeof errorObj?.response === 'string') {
    try {
      const parsedResponse = JSON.parse(errorObj.response);
      code = parsedResponse?.error?.code ?? parsedResponse?.code ?? code;
      message = parsedResponse?.error?.message ?? parsedResponse?.message ?? message;
      // Also try to extract status if not already found
      if (!status && parsedResponse?.status) {
        status = parsedResponse.status;
      }
    } catch (e) {
      // response is not JSON, use it as is if it's short, or ignore
      if (!message && errorObj.response.length < 200) {
        message = errorObj.response;
      }
    }
  }

  // Handle result property which some Swagger clients populate
  if (!message && errorObj?.result?.error?.message) {
    message = errorObj.result.error.message;
  }

  return { status, code, message, raw: err };
};

const mapRegisterValidationMessage = (message?: string) => {
  if (!message) return null;
  const normalized = message.toLowerCase();

  // If the backend message mentions specific fields, map to them
  if (normalized.includes('password')) {
    return {
      field: 'password' as const,
      message: message, // Use backend message directly
    };
  }

  if (normalized.includes('email') || normalized.includes('mail')) {
    return {
      field: 'email' as const,
      message: message, // Use backend message directly
    };
  }

  if (normalized.includes('username') || normalized.includes('user name')) {
    return {
      field: 'username' as const,
      message: message, // Use backend message directly
    };
  }

  if (normalized.includes('name') && !normalized.includes('user') && !normalized.includes('last')) {
    return {
      field: 'name' as const,
      message: message, // Use backend message directly
    };
  }

  if (normalized.includes('lastname') || normalized.includes('last name') || normalized.includes('cognome')) {
    return {
      field: 'lastName' as const,
      message: message, // Use backend message directly
    };
  }

  // Fallback mappings if backend message is generic (though logic above tries to use it)
  // Logic below is for specific known error codes if we had them, OR if we want to force specific text for certain patterns.
  // Given the requirement "BE espone messages", we prioritize `message` return above.

  // Specific catch for the "at least 8 characters" if not caught above (it is caught above by 'password')

  return null;
};

export const mapAuthError = (context: AuthContext, err: unknown) => {
  const { status, code, message, raw } = parseError(err);
  const normalizedCode = code?.trim().toLowerCase();
  const isNetworkError = message === 'Network Error' || status === 0;
  const isServerError = status >= 500;
  const isRateLimited = status === 429 || normalizedCode === 'ratelimited' || normalizedCode === 'rate_limited';

  if (context === 'login') {
    if (isRateLimited) {
      return {
        fieldErrors: { password: 'Troppi tentativi. Attendi qualche minuto e riprova.' } as AuthFieldErrors,
        systemError: null,
      };
    }
    if (normalizedCode === 'emailnotverified' || normalizedCode === 'email_not_verified') {
      return {
        fieldErrors: { password: 'Email non verificata. Controlla la tua casella o richiedi un nuovo link.' } as AuthFieldErrors,
        systemError: null,
      };
    }
    if (status === 400 || status === 401 || status === 403) {
      return {
        fieldErrors: { password: 'Credenziali non valide. Riprova o recupera la password.' } as AuthFieldErrors,
        systemError: null,
      };
    }
    if (isNetworkError || isServerError) {
      return { fieldErrors: {} as AuthFieldErrors, systemError: raw };
    }
    return { fieldErrors: {} as AuthFieldErrors, systemError: raw };
  }

  // register
  if (isRateLimited) {
    return {
      fieldErrors: { password: 'Troppi tentativi. Attendi qualche minuto e riprova.' } as AuthFieldErrors,
      systemError: null,
    };
  }
  if (status === 409) {
    const mapped = mapRegisterValidationMessage(message);
    if (mapped) {
      return { fieldErrors: { [mapped.field]: mapped.message } as AuthFieldErrors, systemError: null };
    }
    return {
      fieldErrors: { email: message ?? 'Username o email gia esistenti.' } as AuthFieldErrors,
      systemError: null,
    };
  }
  if (status === 400 || status === 422) { // 422 is also common for validation
    const mapped = mapRegisterValidationMessage(message);
    if (mapped) {
      return { fieldErrors: { [mapped.field]: mapped.message } as AuthFieldErrors, systemError: null };
    }
    // If we have a message but couldn't map it to a field, maybe it's a general system error or we show it under password as generic fallback?
    // Or return it as systemError if it's meant to be shown globally.
    // For now, let's stick to the generic field error on password if it's unmappable, or use the message if it's short enough.
    const fallbackMessage = message && message.length < 100 ? message : 'Dati non validi. Controlla i campi e riprova.';

    return {
      fieldErrors: { password: fallbackMessage } as AuthFieldErrors,
      systemError: null,
    };
  }
  if (isNetworkError || isServerError) {
    return { fieldErrors: {} as AuthFieldErrors, systemError: raw };
  }
  return { fieldErrors: {} as AuthFieldErrors, systemError: raw };
};
