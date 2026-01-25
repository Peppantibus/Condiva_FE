import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { resendVerification, verify } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const [token, setToken] = React.useState(initialToken);
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!initialToken) return;
    setLoading(true);
    verify(initialToken)
      .then(() => setDone(true))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [initialToken]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verify(token);
      setDone(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      await resendVerification({ email });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm mb-8 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Verifica Account</h1>
      </div>

      <Card className="w-full max-w-sm border-none shadow-xl shadow-primary-500/5">
        <CardContent className="space-y-6">
          <ApiErrorBanner error={error} />
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-slate-700 font-medium">Account verificato con successo!</p>
              <Link to="/login">
                <Button fullWidth>Vai al login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-slate-500 text-center">Inserisci il token ricevuto nella tua email.</p>
              <Input
                label="Token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                placeholder="Token di verifica"
              />
              <Button type="submit" fullWidth isLoading={loading}>
                Verifica
              </Button>
            </form>
          )}

          {!done && (
            <div className="pt-4 border-t border-slate-50 space-y-3">
              <p className="text-xs text-center text-slate-400">Non hai ricevuto l'email?</p>
              <div className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tua email"
                  className="!py-2 !text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleResend} disabled={loading || !email}>
                  Reinvia
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!done && (
        <p className="mt-8 text-center text-sm">
          <Link to="/login" className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Torna al login
          </Link>
        </p>
      )}
    </div>
  );
};

export default VerifyPage;
