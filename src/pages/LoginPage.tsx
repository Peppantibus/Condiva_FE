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

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = React.useState<AuthFieldErrors>({});
  const [systemError, setSystemError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);

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
      <div className="w-full max-w-sm mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <img src={logo} alt="Condiva" className="w-24 h-24 object-contain" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Condiva</h1>
        <p className="text-slate-500 mt-2">Bentornato nella tua community.</p>
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
              required
              placeholder="Inserisci il tuo username"
            />
            <div className="space-y-1">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Accedi
            </Button>
          </form>
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
