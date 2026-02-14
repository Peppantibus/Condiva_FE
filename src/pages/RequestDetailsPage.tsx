import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getRequest, getRequestOffers } from '../api/requests';
import { acceptOffer, rejectOffer, withdrawOffer } from '../api/offers';
import { OfferListItemDto, RequestDetailsDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { HandHeartIcon } from '../components/ui/Icons';
import { sanitizePlainText } from '../utils/sanitize';

const RequestDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { userId } = useSession();
  const [request, setRequest] = React.useState<RequestDetailsDto | null>(null);
  const [offers, setOffers] = React.useState<OfferListItemDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const isMountedRef = React.useRef(true);
  const latestRequestIdRef = React.useRef(0);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDetails = React.useCallback(async () => {
    if (!id) return;
    const requestId = ++latestRequestIdRef.current;
    setError(null);
    setLoading(true);
    try {
      const [requestData, offersData] = await Promise.all([
        getRequest(id),
        getRequestOffers(id, { page: 1, pageSize: 50 }),
      ]);
      if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
      setRequest(requestData);
      setOffers(offersData.items ?? []);
    } catch (err) {
      if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
      setError(err);
    } finally {
      if (isMountedRef.current && requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [id]);

  React.useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleAccept = async (offerId: string) => {
    const borrowerId = request?.requesterUserId || request?.owner?.id;
    if (!borrowerId) return;
    setError(null);
    setLoading(true);
    try {
      await acceptOffer(offerId, { borrowerUserId: borrowerId });
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

  const requesterName = request?.owner?.displayName || request?.owner?.userName || request?.owner?.id;
  const requesterId = request?.requesterUserId || request?.owner?.id;
  const isRequester = Boolean(userId && requesterId && userId === requesterId);
  const isRequestOpen = request?.status === 'Open';
  const formattedNeededFrom = request?.neededFrom ? new Date(request.neededFrom).toLocaleDateString() : null;
  const formattedNeededTo = request?.neededTo ? new Date(request.neededTo).toLocaleDateString() : null;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dettaglio richiesta</h1>
          <p className="text-sm text-slate-500">Offri un oggetto o gestisci le offerte ricevute.</p>
        </div>
        {!isRequester && isRequestOpen && (
          <Link to={`/requests/${id}/offer`}>
            <Button size="sm" icon={<HandHeartIcon className="w-4 h-4" />}>Fai un'offerta</Button>
          </Link>
        )}
      </div>
      <ApiErrorBanner error={error} />
      {request && (
        <Card className="border-transparent shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {sanitizePlainText(request.title, { fallback: 'Richiesta senza titolo', maxLength: 140 })}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {sanitizePlainText(request.description, { fallback: 'Nessuna descrizione disponibile.', maxLength: 260 })}
                </p>
              </div>
              <Badge variant="purple">{request.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div>
                <div className="font-semibold uppercase tracking-wide text-[10px] text-slate-400">Richiedente</div>
                <div className="text-slate-700">
                  {sanitizePlainText(requesterName, { fallback: 'Sconosciuto', maxLength: 80 })}
                </div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-wide text-[10px] text-slate-400">Periodo</div>
                <div className="text-slate-700">
                  {formattedNeededFrom || formattedNeededTo
                    ? `${formattedNeededFrom ?? '-'} -> ${formattedNeededTo ?? '-'}`
                    : 'Nessun periodo indicato'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Offerte ricevute</h2>
        </div>
        {offers.length ? (
          <div className="space-y-3">
            {offers.map((offer) => {
              const offererName = offer.offerer?.displayName || offer.offerer?.userName || offer.offerer?.id;
              const createdAt = offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : '';
              const isOfferOwner = Boolean(userId && offer.offererUserId && userId === offer.offererUserId);
              const isOfferOpen = offer.status === 'Open';
              return (
                <Card key={offer.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {sanitizePlainText(offererName, { fallback: 'Utente', maxLength: 80 })}
                        </div>
                        <div className="text-xs text-slate-500">{createdAt}</div>
                      </div>
                      <Badge variant={offer.status === 'Open' ? 'purple' : 'default'}>{offer.status}</Badge>
                    </div>
                    <div className="text-sm text-slate-700">
                      {sanitizePlainText(offer.message, { fallback: 'Messaggio non disponibile.', maxLength: 240 })}
                    </div>
                    <div className="text-xs text-slate-500">
                      Oggetto: {offer.itemId ? 'Associato' : 'Non indicato'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isRequester && isOfferOpen && isRequestOpen && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => offer.id && handleAccept(offer.id)}
                            disabled={loading || !requesterId}
                          >
                            Accetta
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => offer.id && handleReject(offer.id)}
                            disabled={loading}
                          >
                            Rifiuta
                          </Button>
                        </>
                      )}
                      {isOfferOwner && isOfferOpen && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => offer.id && handleWithdraw(offer.id)}
                          disabled={loading}
                        >
                          Ritira
                        </Button>
                      )}
                    </div>
                    {!requesterId && (
                      <div className="text-xs text-red-500">Impossibile accettare: richiedente non disponibile.</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            Nessuna offerta per ora.
          </div>
        )}
      </section>
    </div>
  );
};

export default RequestDetailsPage;

