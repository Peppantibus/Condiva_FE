import React, { useMemo, useState } from 'react';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PackageIcon, RepeatIcon } from '../components/ui/Icons';
import { cancelReturn, confirmReturn, listLoans, requestReturn, startLoan } from '../api/loans';
import { LoanListItemDto } from '../api/types';
import { useSession } from '../state/session';

const LoansPage: React.FC = () => {
    const { activeCommunityId, userId } = useSession();
    const [activeTab, setActiveTab] = useState<'lent' | 'borrowed'>('lent');
    const [loans, setLoans] = useState<LoanListItemDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const loadLoans = React.useCallback(async () => {
        if (!activeCommunityId) return;
        setError(null);
        setLoading(true);
        try {
            const data = await listLoans({ communityId: activeCommunityId, page: 1, pageSize: 50 });
            setLoans(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [activeCommunityId]);

    React.useEffect(() => {
        loadLoans();
    }, [loadLoans]);

    const { lentLoans, borrowedLoans } = useMemo(() => {
        const lent: LoanListItemDto[] = [];
        const borrowed: LoanListItemDto[] = [];
        for (const loan of loans) {
            if (loan.lenderUserId && loan.lenderUserId === userId) {
                lent.push(loan);
            } else if (loan.borrowerUserId && loan.borrowerUserId === userId) {
                borrowed.push(loan);
            } else {
                lent.push(loan);
            }
        }
        return { lentLoans: lent, borrowedLoans: borrowed };
    }, [loans, userId]);

    const currentItems = activeTab === 'lent' ? lentLoans : borrowedLoans;

    const getStatusBadge = (status?: string, returnedAt?: Date, returnRequestedAt?: Date) => {
        if (status === 'Returned' || returnedAt) {
            return <Badge variant="default">Restituito</Badge>;
        }
        if (status === 'ReturnRequested' || returnRequestedAt) {
            return <Badge variant="warning">Restituzione richiesta</Badge>;
        }
        if (status === 'InLoan') {
            return <Badge variant="purple">In Corso</Badge>;
        }
        if (status === 'Reserved') {
            return <Badge variant="warning">Prenotato</Badge>;
        }
        if (status === 'Expired') {
            return <Badge variant="warning">Scaduto</Badge>;
        }
        return <Badge>Sconosciuto</Badge>;
    };

    const formatDate = (value?: Date) => {
        if (!value) return 'Data non disponibile';
        try {
            return new Date(value).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return 'Data non disponibile';
        }
    };

    const handleStart = async (id: string) => {
        try {
            await startLoan(id);
            await loadLoans();
        } catch (err) {
            setError(err);
        }
    };

    const handleReturnRequest = async (id: string) => {
        try {
            await requestReturn(id);
            await loadLoans();
        } catch (err) {
            setError(err);
        }
    };

    const handleReturnConfirm = async (id: string) => {
        try {
            await confirmReturn(id);
            await loadLoans();
        } catch (err) {
            setError(err);
        }
    };

    const handleReturnCancel = async (id: string) => {
        try {
            await cancelReturn(id);
            await loadLoans();
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 px-1">
                <RepeatIcon className="w-8 h-8 text-primary-600" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Prestiti</h1>
                    <p className="text-slate-500 text-sm">Gestisci i tuoi oggetti prestati e ricevuti</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('lent')}
                    className={`
            flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${activeTab === 'lent'
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'}
          `}
                >
                    Ho Prestato
                </button>
                <button
                    onClick={() => setActiveTab('borrowed')}
                    className={`
            flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${activeTab === 'borrowed'
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'}
          `}
                >
                    Ho Ricevuto
                </button>
            </div>

            <ApiErrorBanner error={error} />

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden h-full flex flex-col group border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
                            {/* Header Image Area */}
                            <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                    <PackageIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="absolute top-2 right-2">
                                    {getStatusBadge(item.status, item.returnedAt, item.returnRequestedAt)}
                                </div>
                            </div>

                            <CardContent className="p-3 flex-1 flex flex-col">
                                <div className="mb-2">
                                    {item.item?.category && (
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 mb-1">
                                            {item.item.category}
                                        </span>
                                    )}
                                    <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-1" title={item.item?.name ?? item.itemId}>
                                        {item.item?.name ?? item.itemId ?? 'Oggetto senza nome'}
                                    </h3>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                        {formatDate(item.startAt ?? item.dueAt ?? item.returnedAt)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 mb-3">
                                    <div className="text-[10px] text-slate-400">
                                        {activeTab === 'lent' ? 'A: ' : 'Da: '}
                                    </div>
                                    <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-[8px] font-bold text-primary-700 shrink-0">
                                        {((activeTab === 'lent' ? item.borrower?.displayName?.[0] : item.lender?.displayName?.[0]) || '?').toUpperCase()}
                                    </div>
                                    <span className="text-xs text-slate-600 font-medium truncate flex-1">
                                        {activeTab === 'lent'
                                            ? (item.borrower?.displayName ?? item.borrower?.userName ?? item.borrowerUserId ?? 'N/A')
                                            : (item.lender?.displayName ?? item.lender?.userName ?? item.lenderUserId ?? 'N/A')}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-auto pt-2 border-t border-slate-50">
                                    {item.status === 'Reserved' && activeTab === 'lent' && item.lenderUserId === userId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-8 text-xs text-primary-600 border-primary-200 hover:bg-primary-50"
                                            onClick={() => item.id && handleStart(item.id)}
                                            disabled={loading}
                                        >
                                            Avvia prestito
                                        </Button>
                                    )}
                                    {item.status === 'InLoan' && activeTab === 'borrowed' && item.borrowerUserId === userId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-8 text-xs text-primary-600 border-primary-200 hover:bg-primary-50"
                                            onClick={() => item.id && handleReturnRequest(item.id)}
                                            disabled={loading}
                                        >
                                            Restituisci
                                        </Button>
                                    )}
                                    {item.status === 'ReturnRequested' && activeTab === 'lent' && item.lenderUserId === userId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-8 text-xs text-primary-600 border-primary-200 hover:bg-primary-50"
                                            onClick={() => item.id && handleReturnConfirm(item.id)}
                                            disabled={loading}
                                        >
                                            Conferma reso
                                        </Button>
                                    )}
                                    {item.status === 'ReturnRequested' && activeTab === 'borrowed' && item.borrowerUserId === userId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
                                            onClick={() => item.id && handleReturnCancel(item.id)}
                                            disabled={loading}
                                        >
                                            Annulla
                                        </Button>
                                    )}

                                    {/* If no action is available/needed, we can show a status text or nothing */}
                                    {!['Reserved', 'InLoan', 'ReturnRequested'].includes(item.status || '') && (
                                        <div className="text-center text-[10px] text-slate-300 italic py-1">
                                            Nessuna azione
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 px-4 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <PackageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">{loading ? 'Caricamento prestiti...' : 'Nessun prestito trovato in questa sezione.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoansPage;
