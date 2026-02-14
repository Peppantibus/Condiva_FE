import React from 'react';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getCommunityAvailableItems, getCommunityRequestsFeed } from '../api/communities';
import { listMyRequests } from '../api/requests';
import { ItemListItemDtoPagedResponseDto, RequestListItemDtoPagedResponseDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HandHeartIcon, PackageIcon } from '../components/ui/Icons';
import { Link } from 'react-router-dom';
import { sanitizePlainText } from '../utils/sanitize';

const DashboardGridSkeleton: React.FC<{ count: number }> = ({ count }) => (
    <>
        {Array.from({ length: count }).map((_, idx) => (
            <Card key={`dash-skeleton-${idx}`} className="overflow-hidden h-full flex flex-col border-slate-100 shadow-sm">
                <div className="h-24 bg-slate-100 animate-pulse" />
                <CardContent className="p-3 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </CardContent>
            </Card>
        ))}
    </>
);

const DashboardListSkeleton: React.FC<{ count: number }> = ({ count }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, idx) => (
            <Card key={`dash-list-skeleton-${idx}`} className="overflow-hidden">
                <CardContent className="p-4 space-y-2">
                    <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                </CardContent>
            </Card>
        ))}
    </div>
);

const DashboardPage: React.FC = () => {
    const { activeCommunityId } = useSession();
    const [feed, setFeed] = React.useState<RequestListItemDtoPagedResponseDto | null>(null);
    const [items, setItems] = React.useState<ItemListItemDtoPagedResponseDto | null>(null);
    const [myRequests, setMyRequests] = React.useState<RequestListItemDtoPagedResponseDto | null>(null);
    const [error, setError] = React.useState<unknown>(null);
    const [loading, setLoading] = React.useState(false);
    const isMountedRef = React.useRef(true);
    const latestRequestIdRef = React.useRef(0);

    React.useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadDashboard = React.useCallback(async () => {
        if (!activeCommunityId) return;
        const requestId = ++latestRequestIdRef.current;
        setError(null);
        setLoading(true);
        try {
            const [feedData, itemsData, myRequestsData] = await Promise.all([
                getCommunityRequestsFeed(activeCommunityId, { status: 'Open', page: 1, pageSize: 10, excludingMine: true }),
                getCommunityAvailableItems(activeCommunityId, { page: 1, pageSize: 10 }),
                listMyRequests({ communityId: activeCommunityId, page: 1, pageSize: 10 }),
            ]);
            if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
            setFeed(feedData);
            setItems(itemsData);
            setMyRequests(myRequestsData);
        } catch (err) {
            if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
            setError(err);
        } finally {
            if (isMountedRef.current && requestId === latestRequestIdRef.current) {
                setLoading(false);
            }
        }
    }, [activeCommunityId]);

    React.useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    if (!activeCommunityId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <PackageIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Nessuna Community Selezionata</h2>
                <p className="text-slate-500 mt-2 mb-6 max-w-xs">Seleziona o entra in una community per iniziare a condividere.</p>
                <Link to="/community">
                    <Button>Vai alle Community</Button>
                </Link>
            </div>
        );
    }

    const showInitialSkeleton = loading && !feed && !items && !myRequests;

    return (
        <div className="pb-20 lg:pb-0">
            <div className="lg:hidden">
                {/* Spacer controlled by AppLayout mobile header */}
            </div>
            <ApiErrorBanner error={error} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4 lg:mt-6">

                {/* Left Primary Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Feed Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <HandHeartIcon className="w-5 h-5 text-primary-600" />
                                Richieste Recenti
                            </h2>
                            <Button variant="ghost" size="sm" onClick={loadDashboard} disabled={loading}>
                                Aggiorna
                            </Button>
                        </div>

                        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                            {showInitialSkeleton ? (
                                <DashboardGridSkeleton count={4} />
                            ) : feed?.items?.length ? (
                                feed.items.map((request) => (
                                    <Card key={request.id} className="overflow-hidden h-full flex flex-col group border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
                                        {/* Header Image Area */}
                                        <div className="h-24 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                <HandHeartIcon className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="purple" className="text-[10px] uppercase tracking-wider px-2 py-0.5">
                                                    {request.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardContent className="p-3 flex-1 flex flex-col">
                                            <div className="mb-2">
                                                <h3
                                                    className="font-bold text-sm text-slate-900 leading-tight line-clamp-1"
                                                    title={sanitizePlainText(request.title, { fallback: 'Richiesta', maxLength: 140 })}
                                                >
                                                    {sanitizePlainText(request.title, { fallback: 'Richiesta senza titolo', maxLength: 140 })}
                                                </h3>
                                            </div>

                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                                                {sanitizePlainText(request.description, { fallback: 'Nessuna descrizione disponibile.', maxLength: 220 })}
                                            </p>

                                            <div className="flex justify-between items-end pt-3 border-t border-slate-50 mt-auto">
                                                <div className="flex items-center gap-1.5 max-w-[70%]">
                                                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700 shrink-0">
                                                        {(request.owner?.displayName?.[0] || request.owner?.userName?.[0] || '?').toUpperCase()}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 truncate">
                                                        {sanitizePlainText(
                                                            request.owner?.displayName || request.owner?.userName || 'Sconosciuto',
                                                            { fallback: 'Sconosciuto', maxLength: 60 }
                                                        )}
                                                    </span>
                                                </div>

                                                <Link to={`/requests/${request.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                                                        Vedi
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-6 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                                    Nessuna richiesta attiva al momento.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Available Items Section */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
                            <PackageIcon className="w-5 h-5 text-secondary-600" />
                            Oggetti Disponibili
                        </h2>

                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-6">
                            {showInitialSkeleton ? (
                                <DashboardGridSkeleton count={4} />
                            ) : items?.items?.length ? (
                                items.items.map((item) => (
                                    <Link to={`/items/${item.id}`} key={item.id} className="block h-full group">
                                        <Card className="overflow-hidden h-full flex flex-col border-slate-100 shadow-sm group-hover:shadow-md transition-all duration-200">
                                            {/* Header Image Area */}
                                            <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                    <PackageIcon className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div className="absolute top-2 right-2">
                                                    <Badge
                                                        variant={item.status === 'Available' ? 'success' : 'default'}
                                                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                                                    >
                                                        {item.status === 'Available' ? 'Disponibile' : item.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardContent className="p-3 flex-1 flex flex-col">
                                                <div className="mb-2">
                                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 mb-1">
                                                        {sanitizePlainText(item.category, { fallback: 'Categoria', maxLength: 40 })}
                                                    </span>
                                                    <h3
                                                        className="font-bold text-sm text-slate-900 leading-tight line-clamp-1 group-hover:text-primary-600 transition-colors"
                                                        title={sanitizePlainText(item.name, { fallback: 'Oggetto', maxLength: 120 })}
                                                    >
                                                        {sanitizePlainText(item.name, { fallback: 'Oggetto senza nome', maxLength: 120 })}
                                                    </h3>
                                                </div>

                                                <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                                                    {sanitizePlainText(item.description, { fallback: 'Nessuna descrizione disponibile.', maxLength: 220 })}
                                                </p>

                                                <div className="flex justify-between items-end pt-3 border-t border-slate-50 mt-auto">
                                                    <div className="flex items-center gap-1.5 max-w-[70%]">
                                                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700 shrink-0">
                                                            {(item.owner?.displayName?.[0] || item.owner?.userName?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 truncate">
                                                            {sanitizePlainText(item.owner?.displayName || item.owner?.userName || 'Sconosciuto', {
                                                                fallback: 'Sconosciuto',
                                                                maxLength: 60,
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-6 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                                    Nessun oggetto disponibile.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Column - Sticky on Desktop */}
                <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 px-1">Le mie richieste</h2>
                        <div className="space-y-3">
                            {showInitialSkeleton ? (
                                <DashboardListSkeleton count={3} />
                            ) : myRequests?.items?.length ? (
                                myRequests.items.map((request) => (
                                    <Card key={request.id} className="overflow-hidden">
                                        <div className="flex">
                                            {/* Image Placeholder small on left */}
                                            <div className="w-24 bg-slate-100 flex items-center justify-center shrink-0">
                                                <HandHeartIcon className="w-6 h-6 text-slate-300 opacity-50" />
                                            </div>
                                            <CardContent className="p-3 flex-1 flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-slate-900 line-clamp-1">
                                                        {sanitizePlainText(request.title, { fallback: 'Richiesta senza titolo', maxLength: 120 })}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}</div>
                                                </div>
                                                <Badge variant={request.status === 'Open' ? 'purple' : 'default'}>{request.status}</Badge>
                                            </CardContent>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-4 text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-100">
                                    Non hai ancora creato richieste.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
