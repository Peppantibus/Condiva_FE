import React from 'react';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getCommunityAvailableItems, getCommunityRequestsFeed } from '../api/communities';
import { listMyRequests } from '../api/requests';
import { ItemListItemDto, PagedResponseDto, RequestListItemDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HandHeartIcon, PackageIcon } from '../components/ui/Icons';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
    const { activeCommunityId } = useSession();
    const [feed, setFeed] = React.useState<PagedResponseDto<RequestListItemDto> | null>(null);
    const [items, setItems] = React.useState<PagedResponseDto<ItemListItemDto> | null>(null);
    const [myRequests, setMyRequests] = React.useState<PagedResponseDto<RequestListItemDto> | null>(null);
    const [error, setError] = React.useState<unknown>(null);
    const [loading, setLoading] = React.useState(false);

    const loadDashboard = React.useCallback(async () => {
        if (!activeCommunityId) return;
        setError(null);
        setLoading(true);
        try {
            const [feedData, itemsData, myRequestsData] = await Promise.all([
                getCommunityRequestsFeed(activeCommunityId, { status: 'Open', page: 1, pageSize: 10 }),
                getCommunityAvailableItems(activeCommunityId, { page: 1, pageSize: 10 }),
                listMyRequests({ communityId: activeCommunityId, page: 1, pageSize: 10 }),
            ]);
            setFeed(feedData);
            setItems(itemsData);
            setMyRequests(myRequestsData);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    {/* Controlled by AppLayout */}
                </div>
            </div>
            <ApiErrorBanner error={error} />

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

                <div className="space-y-3">
                    {feed?.items?.length ? (
                        feed.items.map((request) => (
                            <Card key={request.id} className="border-transparent shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-900">{request.title}</h3>
                                        <Badge variant="purple">{request.status}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{request.description}</p>
                                    <div className="text-xs text-slate-400 mb-2">
                                        Da: {request.owner.displayName || request.owner.userName || request.owner.id}
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Link to={`/requests/${request.id}`}>
                                            <Button variant="outline" size="sm">Vedi Dettagli</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
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

                <div className="grid grid-cols-2 gap-3">
                    {items?.items?.length ? (
                        items.items.map((item) => (
                            <Card key={item.id} className="overflow-hidden h-full flex flex-col">
                                <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <PackageIcon className="w-8 h-8 text-slate-400 opacity-50" />
                                </div>
                                <CardContent className="p-3 flex-1 flex flex-col">
                                    <h3 className="font-bold text-sm text-slate-900 mb-1">{item.name}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-1 flex-1">{item.description}</p>
                                    <div className="text-[10px] text-slate-400 mb-2">
                                        Di: {item.owner.displayName || item.owner.userName || item.owner.id}
                                    </div>
                                    <Badge variant="success" className="self-start text-[10px]">{item.status}</Badge>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-6 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                            Nessun oggetto disponibile.
                        </div>
                    )}
                </div>
            </section>

            {/* My Requests Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 px-1">Le mie richieste</h2>
                <div className="space-y-3">
                    {myRequests?.items?.length ? (
                        myRequests.items.map((request) => (
                            <Card key={request.id}>
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900">{request.title}</div>
                                        <div className="text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <Badge variant={request.status === 'Open' ? 'purple' : 'default'}>{request.status}</Badge>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-4 text-sm text-slate-400">
                            Non hai ancora creato richieste.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;
