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
import { HandHeartIcon, PlusIcon } from '../components/ui/Icons';

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

          {feed?.items?.length ? (
            feed.items.map((request) => (
              <Card key={request.id} className="border-transparent shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200">
                <div className="flex items-stretch min-h-[7rem]">
                  {/* Image Placeholder - Left Side */}
                  <div className="w-28 bg-slate-100 flex items-center justify-center shrink-0">
                    <HandHeartIcon className="w-8 h-8 text-slate-300 opacity-50" />
                  </div>

                  {/* Content - Middle */}
                  <CardContent className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {request.title}
                        </h3>
                        <Badge variant="purple" className="shrink-0 ml-2">{request.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1 mb-2">
                        {request.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-500">
                        {request.owner.displayName || request.owner.userName || request.owner.id}
                      </span>
                      <span>•</span>
                      <span>{request.community.name}</span>
                    </div>
                  </CardContent>

                  {/* Actions - Right Side */}
                  <div className="flex items-center px-4 border-l border-slate-50">
                    <Link to={`/requests/${request.id}`}>
                      <Button variant="ghost" size="sm" className="font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                        Dettaglio
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
              Nessuna richiesta trovata.
            </div>
          )}
        </div>
      )}

      {activeTab === 'mine' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <h2 className="font-bold">Le tue richieste</h2>
          {myRequests?.items?.length ? (
            myRequests.items.map((request) => (
              <Card key={request.id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
                <div className="flex h-20 items-stretch">
                  <div className="w-20 bg-slate-100 flex items-center justify-center shrink-0">
                    <HandHeartIcon className="w-8 h-8 text-slate-300 opacity-50" />
                  </div>
                  <CardContent className="flex-1 flex items-center justify-between px-6 py-0">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {request.title}
                      </h3>
                      <Badge variant={request.status === 'Open' ? 'purple' : 'default'} className="hidden sm:inline-flex">
                        {request.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Mobile Badge fallback if needed, but keeping clean for desktop */}
                      <Link to={`/requests/${request.id}`}>
                        <Button variant="ghost" size="sm" className="font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                          Vedi
                        </Button>
                      </Link>
                      <div className="h-4 w-px bg-slate-200"></div>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(request.id)}>
                        Elimina
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
              Non hai ancora creato richieste.
            </div>
          )}
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
