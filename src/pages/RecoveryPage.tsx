import React from 'react';
import { Link } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { recovery } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const RecoveryPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await recovery({ email });
      setDone(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-sm mb-8 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">Recupero Password</h1>
        <p className="text-slate-500 mt-2">Ti invieremo un link per resettarla.</p>
      </div>

      <Card className="w-full max-w-sm border-none shadow-xl shadow-primary-500/5">
        <CardContent className="space-y-6">
          <ApiErrorBanner error={error} />
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-slate-700 font-medium">Richiesta inviata.</p>
              <p className="text-sm text-slate-500">Controlla la tua email per il link di reset.</p>
              <Button variant="outline" fullWidth onClick={() => setDone(false)}>Invia di nuovo</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="La tua email"
              />
              <Button type="submit" fullWidth isLoading={loading}>
                Invia link
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm">
        <Link to="/login" className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Torna al login
        </Link>
      </p>
    </div>
  );
};

export default RecoveryPage;
