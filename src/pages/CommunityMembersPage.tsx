import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { getCommunity } from '../api/communities';
import { listMemberships } from '../api/memberships';
import { getUserReputation } from '../api/reputation';
import { CommunityDetailsDto, MembershipListItemDto, ReputationDetailsDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const CommunityMembersPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveCommunity } = useSession();
  const [community, setCommunity] = React.useState<CommunityDetailsDto | null>(null);
  const [memberships, setMemberships] = React.useState<MembershipListItemDto[]>([]);
  const [reputations, setReputations] = React.useState<Map<string, ReputationDetailsDto>>(new Map());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const loadMembers = React.useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const [communityData, membershipsData] = await Promise.all([getCommunity(id), listMemberships()]);
      setCommunity(communityData);
      setActiveCommunity(communityData.id, communityData.name);

      const communityMembers = membershipsData.filter((membership) => membership.communityId === id);
      setMemberships(communityMembers);

      if (communityMembers.length) {
        const repEntries = await Promise.all(
          communityMembers.map(async (membership) => {
            try {
              const rep = await getUserReputation(id, membership.userId);
              return [membership.userId, rep] as const;
            } catch {
              return [membership.userId, null] as const;
            }
          })
        );
        setReputations(new Map(repEntries.filter(([, rep]) => rep) as Array<[string, ReputationDetailsDto]>));
      } else {
        setReputations(new Map());
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id, setActiveCommunity]);

  React.useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Community non trovata.</p>
        <Link to="/community">
          <Button variant="outline">Torna alle Community</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Membri Community</h1>
          <p className="text-sm text-slate-500">{community?.name || id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Indietro</Button>
          <Button variant="secondary" onClick={loadMembers} isLoading={loading}>Aggiorna</Button>
        </div>
      </div>

      <ApiErrorBanner error={error} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Lista Membri</h2>
            <Badge variant="default">Totale: {memberships.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {memberships.length > 0 ? (
            memberships.map((membership) => {
              const rep = reputations.get(membership.userId);
              return (
                <div key={membership.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {membership.users?.displayName || membership.users?.userName || membership.userId}
                      </div>
                      {membership.users?.userName && (
                        <div className="text-xs text-slate-400">@{membership.users.userName}</div>
                      )}
                      <div className="text-xs text-slate-500">Status: {membership.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={membership.role === 'Owner' ? 'purple' : 'default'}>{membership.role}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-500">Score</div>
                      <div className="font-semibold text-primary-700">{rep ? rep.score : '-'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-500">Prestiti / Restituzioni</div>
                      <div className="font-semibold text-slate-800">
                        {rep ? `${rep.lendCount} / ${rep.returnCount}` : '-'}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-500">On-time</div>
                      <div className="font-semibold text-slate-800">{rep ? rep.onTimeReturnCount : '-'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="text-xs text-slate-500">Joined</div>
                      <div className="font-semibold text-slate-800">
                        {membership.joinedAt ? new Date(membership.joinedAt).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-slate-500">Nessun membro trovato per questa community.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityMembersPage;
