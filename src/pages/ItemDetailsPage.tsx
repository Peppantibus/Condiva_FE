import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem } from '../api/items';
import { createLoan } from '../api/loans';
import { ItemDetailsDto } from '../api/types';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ChevronLeftIcon, PackageIcon } from '../components/ui/Icons';
import { useSession } from '../state/session';

const ItemDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userId, activeCommunityId } = useSession();
    const [item, setItem] = useState<ItemDetailsDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const loadItem = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getItem(id);
            setItem(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadItem();
    }, [loadItem]);

    const handleRequestLoan = async () => {
        if (!item || !activeCommunityId || !userId) return;

        if (!window.confirm('Vuoi richiedere il prestito di questo oggetto? Il proprietario dovrà confermare.')) {
            return;
        }

        setActionLoading(true);
        setError(null);
        try {
            await createLoan({
                communityId: activeCommunityId,
                itemId: item.id,
                lenderUserId: item.owner.id,
                borrowerUserId: userId,
                status: 'Reserved',
                startAt: new Date(), // Request for today
            });
            // Navigate to loan list or show success
            navigate('/loans');
        } catch (err) {
            setError(err);
        } finally {
            setActionLoading(false);
        }
    };

    // TODO: Add Delete/Edit logic for owner if needed here, consistent with ItemsPage list view.

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <PackageIcon className="w-8 h-8 text-slate-300 animate-bounce" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="p-4 text-center">
                <ApiErrorBanner error={error || new Error('Item not found')} />
                <Button variant="ghost" onClick={() => navigate(-1)}>Torna indietro</Button>
            </div>
        );
    }

    const isOwner = item.owner?.id === userId;
    const canRequest = !isOwner && item.status === 'Available';

    return (
        <div className="pb-[calc(var(--bottom-nav-height)+80px)] lg:pb-20 bg-white min-h-screen">
            {/* Header Image Area with Gradient */}
            <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-slate-700" />
                </button>

                <PackageIcon className="w-24 h-24 text-slate-400 opacity-40" />

                <div className="absolute bottom-4 right-4">
                    <Badge
                        variant={item.status === 'Available' ? 'success' : 'default'}
                        className="text-xs uppercase tracking-wider px-3 py-1 shadow-sm"
                    >
                        {item.status === 'Available' ? 'Disponibile' : item.status}
                    </Badge>
                </div>
            </div>

            <div className="px-4 py-6 -mt-6 bg-white rounded-t-3xl relative">
                <ApiErrorBanner error={error} />

                {/* Title & Category */}
                <div className="mb-6">
                    <span className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 mb-2">
                        {item.category}
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                        {item.name}
                    </h1>
                </div>

                {/* Owner Card */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                        {(item.owner?.displayName?.[0] || item.owner?.userName?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-medium">Proprietario</div>
                        <div className="text-sm font-bold text-slate-800">
                            {item.owner?.displayName || item.owner?.userName || 'Sconosciuto'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2 mb-8">
                    <h2 className="text-sm font-bold text-slate-900">Descrizione</h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {item.description}
                    </p>
                </div>

                {/* Actions Footer */}
                {/* Actions Footer - Fixed above bottom nav on mobile */}
                <div className="fixed bottom-[var(--bottom-nav-height)] lg:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur z-50 lg:static lg:p-0 lg:bg-transparent lg:z-auto">
                    {canRequest ? (
                        <Button
                            fullWidth
                            size="lg"
                            onClick={handleRequestLoan}
                            isLoading={actionLoading}
                            disabled={actionLoading}
                            className="shadow-lg shadow-primary-500/20"
                        >
                            Richiedi Prestito
                        </Button>
                    ) : isOwner ? (
                        <div className="text-center text-sm text-slate-400 italic py-2">
                            Sei il proprietario di questo oggetto.
                        </div>
                    ) : (
                        <Button fullWidth size="lg" disabled variant="ghost" className="bg-slate-100 text-slate-400">
                            Non disponibile
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;
