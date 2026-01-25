import React from 'react';
import { useParams } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getRequest, getRequestOffers } from '../api/requests';
import { acceptOffer, createOffer, rejectOffer, withdrawOffer } from '../api/offers';
import { OfferListItemDto, RequestDetailsDto } from '../api/types';
import { useSession } from '../state/session';

const RequestDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { activeCommunityId, userId } = useSession();
  const [request, setRequest] = React.useState<RequestDetailsDto | null>(null);
  const [offers, setOffers] = React.useState<OfferListItemDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const canCreate = Boolean(activeCommunityId && userId);

  const [offerForm, setOfferForm] = React.useState({ message: '', itemId: '' });
  const [borrowerUserId, setBorrowerUserId] = React.useState('');

  const loadDetails = React.useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const [requestData, offersData] = await Promise.all([
        getRequest(id),
        getRequestOffers(id, { page: 1, pageSize: 50 }),
      ]);
      setRequest(requestData);
      setOffers(offersData.items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleCreateOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !activeCommunityId || !userId) return;
    setError(null);
    setLoading(true);
    try {
      await createOffer({
        communityId: activeCommunityId,
        requestId: id,
        itemId: offerForm.itemId || null,
        message: offerForm.message,
        status: 'Open',
      });
      setOfferForm({ message: '', itemId: '' });
      await loadDetails();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    if (!borrowerUserId) return;
    setError(null);
    setLoading(true);
    try {
      await acceptOffer(offerId, { borrowerUserId });
      await loadDetails();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (offerId: string) => {
    setError(null);
    setLoading(true);
    try {
      await rejectOffer(offerId);
      await loadDetails();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (offerId: string) => {
    setError(null);
    setLoading(true);
    try {
      await withdrawOffer(offerId);
      await loadDetails();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return <div className="text-sm">Request non trovata.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dettaglio richiesta</h1>
        <p className="text-sm">Gestione offerte e stato.</p>
      </div>
      <ApiErrorBanner error={error} />
      {request && (
        <section className="space-y-2">
          <h2 className="font-semibold">Richiesta</h2>
          <div className="border px-3 py-2 text-sm">
            <div className="font-medium">{request.title}</div>
            <div>{request.description}</div>
            <div>Status: {request.status}</div>
          </div>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="font-semibold">Crea offerta</h2>
        {!activeCommunityId && <div className="text-sm">Seleziona una community attiva per creare un'offerta.</div>}
        {activeCommunityId && !userId && (
          <div className="text-sm">Sessione utente non disponibile. Effettua nuovamente l'accesso.</div>
        )}
        <form onSubmit={handleCreateOffer} className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Messaggio</span>
            <input value={offerForm.message} onChange={(event) => setOfferForm((prev) => ({ ...prev, message: event.target.value }))} className="border px-2 py-1" required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">ItemId (opzionale)</span>
            <input value={offerForm.itemId} onChange={(event) => setOfferForm((prev) => ({ ...prev, itemId: event.target.value }))} className="border px-2 py-1" />
          </label>
          <button type="submit" className="border px-3 py-2" disabled={loading || !canCreate}>
            {loading ? 'Invio...' : 'Crea offerta (status Open)'}
          </button>
        </form>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Offerte</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>Borrower UserId (per accettare)</span>
          <input value={borrowerUserId} onChange={(event) => setBorrowerUserId(event.target.value)} className="border px-2 py-1" />
        </label>
        <div className="space-y-2 text-sm">
          {offers.length ? (
            offers.map((offer) => (
              <div key={offer.id} className="border px-3 py-2 space-y-1">
                <div className="font-medium">{offer.message}</div>
                <div>Status: {offer.status}</div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="border px-2 py-1 text-xs" onClick={() => handleAccept(offer.id)} disabled={loading || !borrowerUserId}>
                    Accetta
                  </button>
                  <button type="button" className="border px-2 py-1 text-xs" onClick={() => handleReject(offer.id)} disabled={loading}>
                    Rifiuta
                  </button>
                  <button type="button" className="border px-2 py-1 text-xs" onClick={() => handleWithdraw(offer.id)} disabled={loading}>
                    Ritira
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div>Nessuna offerta.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RequestDetailsPage;
