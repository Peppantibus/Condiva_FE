import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import AuthErrorHandler from '../components/auth/AuthErrorHandler';
import { ErrorDialog } from '../components/ui/ErrorDialog';
import { AuthFieldErrors } from '../utils/authErrorMapper';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    username: '',
    email: '',
    password: '',
    name: '',
    lastName: '',
  });
  const [error, setError] = React.useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = React.useState<AuthFieldErrors>({});
  const [systemError, setSystemError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-sm mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Crea Account</h1>
        <p className="text-slate-500 mt-2">Unisciti a Condiva oggi.</p>
      </div>

      <Card className="w-full max-w-sm border-none shadow-xl shadow-primary-500/5">
        <CardContent className="space-y-6">
          <AuthErrorHandler
            context="register"
            error={error}
            onFieldErrors={setFieldErrors}
            onSystemError={setSystemError}
          />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" value={form.name} onChange={handleChange('name')} required placeholder="Mario" />
              <Input label="Cognome" value={form.lastName} onChange={handleChange('lastName')} required placeholder="Rossi" />
            </div>
            <Input
              label="Username"
              value={form.username}
              onChange={handleChange('username')}
              required
              placeholder="mario_rossi"
              error={fieldErrors.username}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              placeholder="mario@example.com"
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              required
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              error={fieldErrors.password}
            />

            <Button type="submit" fullWidth isLoading={loading} size="lg" className="mt-2">
              Crea account
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-slate-500">
        Hai giÃ  un account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Accedi
        </Link>
      </p>
      {systemError && (
        <ErrorDialog error={systemError} onClear={() => setSystemError(null)} />
      )}
    </div>
  );
};

export default RegisterPage;
