import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApiErrorBanner from '../components/ApiErrorBanner';
import {
  createCommunity,
  getInviteCode,
  getInviteLink,
  joinCommunity,
  listCommunities,
  rotateInviteCode,
} from '../api/communities';
import { listMyMemberships } from '../api/memberships';
import { CommunityListItemDto, InviteCodeResponseDto, InviteLinkResponseDto, MembershipListItemDto } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PlusIcon, SearchIcon, UsersIcon } from '../components/ui/Icons';

const CommunityPage: React.FC = () => {
  const { activeCommunityId, setActiveCommunity, userId } = useSession();
  const navigate = useNavigate();
  const [memberships, setMemberships] = React.useState<MembershipListItemDto[]>([]);
  const [communities, setCommunities] = React.useState<CommunityListItemDto[]>([]);
  const [invite, setInvite] = React.useState<InviteCodeResponseDto | null>(null);
  const [inviteLink, setInviteLink] = React.useState<InviteLinkResponseDto | null>(null);
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const [createForm, setCreateForm] = React.useState({ name: '', slug: '', description: '' });
  const [joinCode, setJoinCode] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'list' | 'create' | 'join'>('list');

  const communityById = React.useMemo(() => new Map(communities.map((community) => [community.id, community])), [communities]);

  const loadData = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [membershipsData, communitiesData] = await Promise.all([listMyMemberships(), listCommunities()]);
      setMemberships(membershipsData);
      setCommunities(communitiesData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    setError(null);
    setLoading(true);
    try {
      await createCommunity({
        name: createForm.name,
        slug: createForm.slug,
        description: createForm.description,
      });
      setCreateForm({ name: '', slug: '', description: '' });
      await loadData();
      setActiveTab('list');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await joinCommunity({ enterCode: joinCode });
      setJoinCode('');
      await loadData();
      setActiveTab('list');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (rotate: boolean) => {
    if (!activeCommunityId) return;
    setError(null);
    setLoading(true);
    try {
      const data = rotate ? await rotateInviteCode(activeCommunityId) : await getInviteCode(activeCommunityId);
      setInvite(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetInviteLink = async () => {
    if (!activeCommunityId) return;
    setError(null);
    setLoading(true);
    try {
      const data = await getInviteLink(activeCommunityId);
      setInviteLink(data);
    } catch (err: any) {
      // Se 401/403, non mostrare errore critico, solo nascondere la sezione
      if (err?.status === 401 || err?.status === 403) {
        setInviteLink(null);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink?.url) return;
    try {
      await navigator.clipboard.writeText(inviteLink.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const [copyCodeSuccess, setCopyCodeSuccess] = React.useState(false); // Add new state

  const handleCopyCode = async () => {
    if (!invite?.enterCode) return;
    try {
      await navigator.clipboard.writeText(invite.enterCode);
      setCopyCodeSuccess(true);
      setTimeout(() => setCopyCodeSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          {/* Header handled by AppLayout now, but we can keep context specific actions if needed */}
        </div>
      </div>

      <ApiErrorBanner error={error} />

      {/* Community Selection / List */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-primary-600" />
          Le tue Community
        </h2>

        <div className="grid gap-3">
          {memberships.length > 0 ? (
            memberships.map((membership) => {
              const community = communityById.get(membership.communityId);
              const isActive = membership.communityId === activeCommunityId;
              return (
                <Card
                  key={membership.communityId}
                  onClick={() => {
                    if (membership.communityId) {
                      setActiveCommunity(membership.communityId, community?.name || membership.communityId);
                    }
                  }}
                  className={`border-2 transition-all flex overflow-hidden cursor-pointer hover:shadow-md ${isActive ? 'border-primary-500 bg-primary-50/50' : 'border-transparent hover:border-slate-200'}`}
                >
                  <div className="w-24 bg-slate-100 flex items-center justify-center shrink-0">
                    <UsersIcon className="w-10 h-10 text-slate-300 opacity-50" />
                  </div>
                  <CardContent className="flex-1 flex items-center justify-between gap-3 p-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{community?.name || 'Community Sconosciuta'}</h3>
                      <p className="text-sm text-slate-500">{community?.description || 'Nessuna descrizione'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={membership.role === 'Owner' ? 'purple' : 'default'}>{membership.role}</Badge>
                        {isActive && <Badge variant="success">Attiva</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/community/${membership.communityId}/members`);
                        }}
                      >
                        Mostra membri
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl">
              Non sei membro di nessuna community.
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'create' ? 'primary' : 'outline'}
          onClick={() => setActiveTab(activeTab === 'create' ? 'list' : 'create')}
          className="flex-1"
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Crea Nuova
        </Button>
        <Button
          variant={activeTab === 'join' ? 'primary' : 'outline'}
          onClick={() => setActiveTab(activeTab === 'join' ? 'list' : 'join')}
          className="flex-1"
          icon={<SearchIcon className="w-4 h-4" />}
        >
          Unisciti
        </Button>
      </div>

      {/* Create Form */}
      {activeTab === 'create' && (
        <Card className="animate-in slide-in-from-bottom-2 fade-in duration-300">
          <CardHeader><h3 className="font-bold">Crea una nuova community</h3></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {!userId && <div className="text-sm text-red-500">Effettua l'accesso per creare community.</div>}
              <Input
                label="Nome"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Es. Condominio Roma 12"
              />
              <Input
                label="Slug (URL)"
                value={createForm.slug}
                onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
                required
                placeholder="roma-12"
              />
              <Input
                label="Descrizione"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Breve descrizione..."
              />
              <Button type="submit" fullWidth disabled={loading || !userId} isLoading={loading}>
                Crea Community
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Join Form */}
      {activeTab === 'join' && (
        <Card className="animate-in slide-in-from-bottom-2 fade-in duration-300">
          <CardHeader><h3 className="font-bold">Unisciti con un codice</h3></CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                label="Codice Invito"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                placeholder="Inserisci il codice ricevuto"
              />
              <Button type="submit" fullWidth isLoading={loading}>
                Entra nella Community
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invite Management (Only if active community selected) */}
      {activeCommunityId && (
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="font-semibold text-slate-800">Gestione Inviti ({communityById.get(activeCommunityId)?.name})</h2>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => handleInvite(false)} disabled={loading}>
              Visualizza Codice
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleInvite(true)} disabled={loading}>
              Genera Nuovo
            </Button>
          </div>

          {invite && (
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-200 mt-2 animate-in fade-in">
              <p className="text-xs text-primary-700 uppercase tracking-wide font-bold mb-2">Codice Invito</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={invite.enterCode}
                  readOnly
                  disabled
                  className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-primary-200 rounded-lg text-slate-700 cursor-not-allowed"
                />
                <Button variant="primary" size="sm" onClick={handleCopyCode}>
                  {copyCodeSuccess ? "✓ Copiato!" : "Copia Codice"}
                </Button>
              </div>
              <p className="text-xs text-primary-600 mt-2">
                Scade il: {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : '-'} alle {invite.expiresAt ? new Date(invite.expiresAt).toLocaleTimeString() : '-'}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Condividi questo codice con chi vuoi invitare.
              </p>
            </div>
          )}

          {/* Invite Link Section */}
          <div className="border-t border-slate-100 pt-3 mt-3">
            <h3 className="font-semibold text-slate-800 mb-2">Condividi Link di Invito</h3>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGetInviteLink}
                disabled={loading}
              >
                Mostra Link di Invito
              </Button>
            </div>

            {inviteLink && (
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-200 mt-3 animate-in fade-in">
                <p className="text-xs text-primary-700 uppercase tracking-wide font-bold mb-2">Link di Invito</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={inviteLink.url}
                    readOnly
                    disabled
                    className="flex-1 px-3 py-2 text-sm font-mono bg-white border border-primary-200 rounded-lg text-slate-700 cursor-not-allowed"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copySuccess ? "✓ Copiato!" : "Copia Link"}
                  </Button>
                </div>
                <p className="text-xs text-primary-600 mt-2">
                  Scade il: {inviteLink.expiresAt ? new Date(inviteLink.expiresAt).toLocaleDateString() : '-'} alle {inviteLink.expiresAt ? new Date(inviteLink.expiresAt).toLocaleTimeString() : '-'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Condividi questo link con chi vuoi invitare. Il link è pronto all'uso!
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default CommunityPage;
