import React from 'react';
import { Link } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getCommunityRequestsFeed } from '../api/communities';
import { createRequest, deleteRequest, listMyRequests } from '../api/requests';
import { RequestListItemDtoPagedResponseDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HandHeartIcon, PlusIcon, TrashIcon } from '../components/ui/Icons';

const RequestsPage: React.FC = () => {
  const { activeCommunityId, userId } = useSession();
  const [feed, setFeed] = React.useState<RequestListItemDtoPagedResponseDto | null>(null);
  const [myRequests, setMyRequests] = React.useState<RequestListItemDtoPagedResponseDto | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'feed' | 'create' | 'mine'>('feed');

  const [form, setForm] = React.useState({
    title: '',
    description: '',
    neededFrom: '',
    neededTo: '',
  });
  const canCreate = Boolean(userId);

  const loadRequests = React.useCallback(async () => {
    if (!activeCommunityId) return;
    setError(null);
    setLoading(true);
    try {
      const [feedData, myData] = await Promise.all([
        getCommunityRequestsFeed(activeCommunityId, { status: 'Open', page: 1, pageSize: 20, excludingMine: true }),
        listMyRequests({ communityId: activeCommunityId, page: 1, pageSize: 20 }),
      ]);
      setFeed(feedData);
      setMyRequests(myData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeCommunityId || !userId) return;
    setError(null);
    setLoading(true);
    try {
      await createRequest({
        communityId: activeCommunityId,
        title: form.title,
        description: form.description,
        status: 'Open',
        neededFrom: form.neededFrom || null,
        neededTo: form.neededTo || null,
      });
      setForm({ title: '', description: '', neededFrom: '', neededTo: '' });
      await loadRequests();
      setActiveTab('mine');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa richiesta?')) return;
    setError(null);
    setLoading(true);
    try {
      await deleteRequest(id);
      await loadRequests();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeCommunityId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <p className="text-slate-500 mb-4">Seleziona una community per vedere le richieste.</p>
        <Link to="/community"><Button>Vai a Community</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        {/* Controlled by AppLayout */}
      </div>
      <ApiErrorBanner error={error} />

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Feed
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'mine' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Le mie
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Crea
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <HandHeartIcon className="w-5 h-5 text-primary-500" />
              Richieste Aperte
            </h2>
            <Button variant="ghost" size="sm" onClick={loadRequests}>Aggiorna</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feed?.items?.length ? (
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
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 mb-1">
                        {request.community.name}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-1" title={request.title}>
                        {request.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                      {request.description}
                    </p>

                    <div className="flex justify-between items-end pt-3 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-1.5 max-w-[70%]">
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700 shrink-0">
                          {(request.owner.displayName?.[0] || request.owner.userName?.[0] || '?').toUpperCase()}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate">
                          {request.owner.displayName || request.owner.userName || 'Sconosciuto'}
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
              <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                <HandHeartIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nessuna richiesta trovata.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mine' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              Le tue richieste
            </h2>
            <Button variant="ghost" size="sm" onClick={loadRequests}>Aggiorna</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRequests?.items?.length ? (
              myRequests.items.map((request) => (
                <Card key={request.id} className="overflow-hidden h-full flex flex-col group border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Header Image Area */}
                  <div className="h-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <HandHeartIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={request.status === 'Open' ? 'purple' : 'default'} className="text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {request.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3 flex-1 flex flex-col">
                    <div className="mb-2">
                      <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-1" title={request.title}>
                        {request.title}
                      </h3>
                      <div className="text-[10px] text-slate-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                      {request.description}
                    </p>

                    <div className="flex justify-between items-end pt-3 border-t border-slate-50 mt-auto">
                      <Link to={`/requests/${request.id}`}>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                          Vedi Dettaglio
                        </Button>
                      </Link>

                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 -mr-1 rounded-full hover:bg-red-50"
                        title="Elimina"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                <HandHeartIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Non hai ancora creato richieste.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-bold text-lg mb-2">Chiedi aiuto alla community</h2>
            {!userId && <div className="text-sm text-red-500">Accesso richiesto.</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Titolo"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Cosa ti serve?"
              />
              <Input
                label="Descrizione"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Descrivi i dettagli..."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Dal (Opzionale)"
                  type="date"
                  value={form.neededFrom}
                  onChange={(e) => setForm(prev => ({ ...prev, neededFrom: e.target.value }))}
                />
                <Input
                  label="Al (Opzionale)"
                  type="date"
                  value={form.neededTo}
                  onChange={(e) => setForm(prev => ({ ...prev, neededTo: e.target.value }))}
                />
              </div>
              <Button type="submit" fullWidth disabled={loading || !canCreate} isLoading={loading}>
                Pubblica Richiesta
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequestsPage;
