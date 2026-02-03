import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getRequest } from '../api/requests';
import { createOffer } from '../api/offers';
import { listItems } from '../api/items';
import { ItemListItemDto, RequestDetailsDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { HandHeartIcon, PackageIcon } from '../components/ui/Icons';

const RequestOfferPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeCommunityId, userId } = useSession();
  const [request, setRequest] = React.useState<RequestDetailsDto | null>(null);
  const [userItems, setUserItems] = React.useState<ItemListItemDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const [form, setForm] = React.useState({ message: '', itemId: '' });

  const loadRequest = React.useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const data = await getRequest(id);
      setRequest(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadItems = React.useCallback(async () => {
    if (!activeCommunityId || !userId) {
      setUserItems([]);
      return;
    }
    setError(null);
    try {
      const data = await listItems(activeCommunityId);
      setUserItems(data.filter((item) => item.ownerUserId === userId && item.status === 'Available'));
    } catch (err) {
      setError(err);
    }
  }, [activeCommunityId, userId]);

  React.useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !activeCommunityId || !userId) return;
    setError(null);
    setLoading(true);
    try {
      await createOffer({
        communityId: activeCommunityId,
        offererUserId: userId,
        requestId: id,
        itemId: form.itemId || undefined,
        message: form.message,
        status: 'Open',
      });
      navigate(`/requests/${id}`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return <div className="text-sm">Request non trovata.</div>;
  }

  const requesterName = request?.owner?.displayName || request?.owner?.userName || request?.owner?.id;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Fai un'offerta</h1>
          <p className="text-sm text-slate-500">Invia una proposta senza inserire ID manualmente.</p>
        </div>
        <Link to={`/requests/${id}`}>
          <Button variant="ghost" size="sm">Torna al dettaglio</Button>
        </Link>
      </div>

      <ApiErrorBanner error={error} />

      {request && (
        <Card className="border-transparent shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{request.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{request.description}</p>
              </div>
              <Badge variant="purple">{request.status}</Badge>
            </div>
            <div className="text-xs text-slate-500">Richiedente: <span className="text-slate-700">{requesterName}</span></div>
          </CardContent>
        </Card>
      )}

      <Card className="animate-in fade-in slide-in-from-bottom-2">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <HandHeartIcon className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-lg">Dettagli offerta</h2>
          </div>
          {!activeCommunityId && <div className="text-sm text-red-500">Seleziona una community attiva per creare un'offerta.</div>}
          {activeCommunityId && !userId && (
            <div className="text-sm text-red-500">Sessione utente non disponibile. Effettua nuovamente l'accesso.</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Messaggio"
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
              placeholder="Spiega cosa puoi offrire e quando sei disponibile"
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 ml-1">Oggetto disponibile (opzionale)</label>
              <div className="relative">
                <select
                  value={form.itemId}
                  onChange={(event) => setForm((prev) => ({ ...prev, itemId: event.target.value }))}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500"
                  disabled={!userItems.length}
                >
                  <option value="">Nessun oggetto selezionato</option>
                  {userItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <PackageIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {!userItems.length && (
                <p className="text-xs text-slate-500 ml-1">Nessun oggetto disponibile: aggiungine uno nella sezione Oggetti.</p>
              )}
            </div>

            <Button type="submit" fullWidth disabled={loading || !activeCommunityId || !userId} isLoading={loading}>
              Invia offerta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestOfferPage;
