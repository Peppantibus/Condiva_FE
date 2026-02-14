import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../state/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import AuthErrorHandler from '../components/auth/AuthErrorHandler';
import { ErrorDialog } from '../components/ui/ErrorDialog';
import { AuthFieldErrors } from '../utils/authErrorMapper';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        nonce?: string;
      }) => void;
      renderButton: (element: HTMLElement, options: {
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        width?: number;
        locale?: string;
      }) => void;
    };
  };
};

const GOOGLE_IDENTITY_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_IDENTITY_SCRIPT_SELECTOR = 'script[data-google-identity="gsi"]';

const readGoogleClientId = () => {
  const rawValue = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  return rawValue?.trim() ?? '';
};

const readGoogleIdentity = () => (window as Window & { google?: GoogleIdentity }).google;

const createNonce = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const ensureGoogleIdentityScript = () =>
  new Promise<void>((resolve, reject) => {
    if (readGoogleIdentity()) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(GOOGLE_IDENTITY_SCRIPT_SELECTOR);
    if (existingScript) {
      if (existingScript.dataset.error === 'true') {
        reject(new Error('Google Identity Services unavailable.'));
        return;
      }
      const onLoad = () => {
        existingScript.dataset.loaded = 'true';
        delete existingScript.dataset.error;
        cleanup();
        resolve();
      };
      const onError = () => {
        existingScript.dataset.error = 'true';
        cleanup();
        reject(new Error('Google Identity Services unavailable.'));
      };
      const cleanup = () => {
        existingScript.removeEventListener('load', onLoad);
        existingScript.removeEventListener('error', onError);
      };

      if (existingScript.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existingScript.addEventListener('load', onLoad);
      existingScript.addEventListener('error', onError);
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'gsi';

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      delete script.dataset.error;
      resolve();
    }, { once: true });
    script.addEventListener('error', () => {
      script.dataset.error = 'true';
      reject(new Error('Google Identity Services unavailable.'));
    }, { once: true });

    document.head.appendChild(script);
  });

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = React.useState<AuthFieldErrors>({});
  const [systemError, setSystemError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [googleStatusMessage, setGoogleStatusMessage] = React.useState<string | null>(null);
  const googleButtonRef = React.useRef<HTMLDivElement | null>(null);
  const googleClientId = React.useMemo(readGoogleClientId, []);
  const googleNonce = React.useMemo(createNonce, []);

  const handleGoogleCredential = React.useCallback(async (credential: string, nonce?: string) => {
    setError(null);
    setGoogleStatusMessage(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle({ idToken: credential, expectedNonce: nonce });
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, navigate]);

  React.useEffect(() => {
    if (!googleClientId) {
      setGoogleStatusMessage('Accesso Google non configurato: imposta VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    console.info('[GoogleAuth] origin runtime', window.location.origin);

    let cancelled = false;

    const initGoogle = async () => {
      try {
        await ensureGoogleIdentityScript();
        if (cancelled) return;

        const google = readGoogleIdentity();
        const buttonContainer = googleButtonRef.current;

        if (!google || !buttonContainer) {
          setGoogleStatusMessage('Google Sign-In non disponibile al momento.');
          return;
        }

        buttonContainer.innerHTML = '';
        google.accounts.id.initialize({
          client_id: googleClientId,
          nonce: googleNonce,
          callback: (response) => {
            if (!response.credential) {
              setGoogleStatusMessage('Google non ha restituito una credential valida.');
              return;
            }
            void handleGoogleCredential(response.credential, googleNonce);
          },
        });

        const width = Math.min(buttonContainer.clientWidth || 320, 360);
        google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width,
          locale: 'it',
        });

        setGoogleStatusMessage(null);
      } catch {
        if (!cancelled) {
          setGoogleStatusMessage('Impossibile caricare Google Sign-In. Riprova tra poco.');
        }
      }
    };

    void initGoogle();
    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleNonce, handleGoogleCredential]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Home
        </Link>
      </div>
      <div className="w-full max-w-sm mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <img src={logo} alt="Condiva" width={1536} height={1024} loading="eager" decoding="async" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Condiva</h1>
        <p className="text-slate-600 mt-2">Bentornato nella tua community.</p>
      </div>

      <Card className="w-full max-w-sm border-none shadow-xl shadow-primary-500/5">
        <CardContent className="space-y-6">
          <AuthErrorHandler
            context="login"
            error={error}
            onFieldErrors={setFieldErrors}
            onSystemError={setSystemError}
          />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={loading || googleLoading}
              required
              placeholder="Inserisci il tuo username"
            />
            <div className="space-y-1">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading || googleLoading}
                required
                placeholder="Inserisci la password"
                error={fieldErrors.password}
              />
              <div className="flex justify-end pt-1">
                <Link to="/recovery" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Password dimenticata?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={loading} size="lg" disabled={googleLoading}>
              Accedi
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="bg-white px-3">oppure</span>
            </div>
          </div>

          <div className={`flex justify-center min-h-[44px] ${googleLoading ? 'pointer-events-none opacity-60' : ''}`}>
            <div ref={googleButtonRef} className="w-full max-w-[360px]" />
          </div>
          {googleStatusMessage && (
            <p className="text-center text-xs text-amber-700">{googleStatusMessage}</p>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-slate-500">
        Non hai un account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
          Registrati
        </Link>
      </p>
      {Boolean(systemError) && (
        <ErrorDialog error={systemError} onClear={() => setSystemError(null)} />
      )}
    </div>
  );
};

export default LoginPage;
