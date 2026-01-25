import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { joinCommunity } from '../api/communities';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ApiErrorBanner from '../components/ApiErrorBanner';

const JoinPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [manualCode, setManualCode] = useState('');
    const codeParam = searchParams.get('code');

    useEffect(() => {
        if (codeParam) {
            handleAutoJoin(codeParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeParam]);

    const handleAutoJoin = async (code: string) => {
        setLoading(true);
        setError(null);
        try {
            await joinCommunity({ enterCode: code });
            // Ripulisci URL
            setSearchParams({});
            // Redirect
            navigate('/community', { replace: true });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleManualJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAutoJoin(manualCode);
    };

    if (loading && codeParam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-lg font-semibold text-slate-700">Accesso alla community in corso...</p>
                        <p className="text-sm text-slate-500 mt-2">Un momento, stiamo elaborando il tuo invito.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-slate-50">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-slate-900">Unisciti alla Community</h1>
                    <p className="text-sm text-slate-600 mt-1">Entra a far parte di una community su Condiva</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ApiErrorBanner error={error} />

                    {!codeParam && (
                        <form onSubmit={handleManualJoin} className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Inserisci il codice di invito che hai ricevuto per unirti alla community.
                            </p>
                            <Input
                                label="Codice Invito"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                required
                                placeholder="Inserisci il codice"
                            />
                            <Button type="submit" fullWidth isLoading={loading}>
                                Unisciti alla Community
                            </Button>
                        </form>
                    )}


                    {codeParam && error ? (
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Link non valido</h3>
                                <p className="text-sm text-slate-600">
                                    Il link di invito non è più valido, è scaduto o è già stato utilizzato.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => navigate('/community')} fullWidth variant="outline">
                                    Torna alle Community
                                </Button>
                                <Button onClick={() => {
                                    setSearchParams({});
                                    setError(null);
                                }} fullWidth>
                                    Inserisci Codice Manualmente
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinPage;
