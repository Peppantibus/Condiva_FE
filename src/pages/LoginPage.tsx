import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { useAuth } from '../state/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);
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
        {/* Placeholder for Logo */}
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 shadow-sm border border-white">
          <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Condiva</h1>
        <p className="text-slate-500 mt-2">Bentornato nella tua community.</p>
      </div>

      <Card className="w-full max-w-sm border-none shadow-xl shadow-primary-500/5">
        <CardContent className="space-y-6">
          <ApiErrorBanner error={error} />
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
    </div>
  );
};

export default LoginPage;
