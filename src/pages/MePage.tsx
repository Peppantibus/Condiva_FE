import React from 'react';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getMyReputation } from '../api/reputation';
import { listMyOffers } from '../api/offers';
import { listLoans } from '../api/loans';
import { LoanListItemDto, OfferListItemDto, ReputationDetailsDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { UserIcon } from '../components/ui/Icons';
import { Link } from 'react-router-dom';

const MePage: React.FC = () => {
  const { activeCommunityId, userId } = useSession(); // Accessing userId explicitly if needed for display
  const [reputation, setReputation] = React.useState<ReputationDetailsDto | null>(null);
  const [offers, setOffers] = React.useState<OfferListItemDto[]>([]);
  const [loans, setLoans] = React.useState<LoanListItemDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const loadProfile = React.useCallback(async () => {
    if (!activeCommunityId) return;
    setError(null);
    setLoading(true);
    try {
      const [repData, offersData, loansData] = await Promise.all([
        getMyReputation(activeCommunityId),
        listMyOffers({ communityId: activeCommunityId, page: 1, pageSize: 20 }),
        listLoans(), // Note: listLoans might need community filter if API supports it, currently assuming it returns user's loans
      ]);
      setReputation(repData);
      setOffers(offersData.items);
      setLoans(loansData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!activeCommunityId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <p className="text-slate-500 mb-4">Seleziona una community per vedere il tuo profilo.</p>
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

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-lg shadow-primary-500/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Il mio Profilo</h2>
            <p className="text-primary-100 text-sm">Community Member</p>
            {reputation && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md">
                <span>Score: {reputation.score}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reputation Stats */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-800">Statistiche</h3>
          <Button variant="ghost" size="sm" onClick={loadProfile} disabled={loading}>Aggiorna</Button>
        </div>

        {reputation ? (
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{reputation.lendCount}</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Prestiti</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success-600 text-green-600">{reputation.returnCount}</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Restituiti</div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Restituzioni Puntuali</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary-600">{reputation.onTimeReturnCount}</span>
                  <span className="text-xs text-slate-400">volte</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">Caricamento statistiche...</div>
        )}
      </section>

      {/* Offers Section */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 px-1">Le tue Offerte</h3>
        <div className="space-y-3">
          {offers.length ? (
            offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-900">{offer.message}</div>
                  </div>
                  <Badge variant={offer.status === 'Accepted' ? 'success' : 'default'}>{offer.status}</Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
              Nessuna offerta attiva.
            </div>
          )}
        </div>
      </section>

      {/* Loans Section */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 px-1">Prestiti in corso</h3>
        <div className="space-y-3">
          {loans.length ? (
            loans.map((loan) => (
              <Card key={loan.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-slate-400">ID: {loan.id.substring(0, 8)}...</span>
                    <Badge variant={loan.status === 'InLoan' ? 'purple' : 'default'}>{loan.status}</Badge>
                  </div>
                  <div className="font-medium text-slate-900">Oggetto: {loan.itemId}</div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
              Nessun prestito attivo.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MePage;
