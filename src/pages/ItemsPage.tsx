import React from 'react';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { createItem, deleteItem, listItems } from '../api/items';
import { ItemListItemDto, ItemStatus } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PackageIcon, PlusIcon, TrashIcon } from '../components/ui/Icons';
import { Link } from 'react-router-dom';

const ItemsPage: React.FC = () => {
  const { activeCommunityId, userId } = useSession();
  const [items, setItems] = React.useState<ItemListItemDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);
  const [activeTab, setActiveTab] = React.useState<'list' | 'create'>('list');

  const [form, setForm] = React.useState({
    name: '',
    description: '',
    category: '',
    status: 'Available' as ItemStatus,
  });
  const canCreate = Boolean(activeCommunityId && userId);

  const loadItems = React.useCallback(async () => {
    if (!activeCommunityId) return;
    setError(null);
    setLoading(true);
    try {
      const data = await listItems(activeCommunityId);
      setItems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeCommunityId || !userId) return;
    setError(null);
    setLoading(true);
    try {
      await createItem({
        communityId: activeCommunityId,
        name: form.name,
        description: form.description,
        category: form.category,
        status: form.status,
      });
      setForm({ name: '', description: '', category: '', status: 'Available' });
      await loadItems();
      setActiveTab('list');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminare questo oggetto?')) return;
    setError(null);
    setLoading(true);
    try {
      await deleteItem(id);
      await loadItems();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeCommunityId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh]">
        <p className="text-slate-500 mb-4">Seleziona una community per vedere gli oggetti.</p>
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

      {/* Floating Action Button for Mobile / Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Lista
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Aggiungi
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-secondary-600" />
              Inventario
            </h2>
            <Button variant="ghost" size="sm" onClick={loadItems}>
              Aggiorna
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {items.length ? (
              items.map((item) => {
                const isOwner = item.owner?.id === userId;
                return (
                  <div key={item.id} className="relative h-full group">
                    <Link to={`/items/${item.id}`} className="block h-full">
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

                        {/* Content Body */}
                        <CardContent className="p-3 flex-1 flex flex-col">
                          <div className="mb-2">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 mb-1">
                              {item.category}
                            </span>
                            <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-1" title={item.name}>
                              {item.name}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Footer: Owner & Actions */}
                          <div className="flex justify-between items-end pt-3 border-t border-slate-50 mt-auto">
                            <div className="flex items-center gap-1.5 max-w-[70%]">
                              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700 shrink-0">
                                {(item.owner?.displayName?.[0] || item.owner?.userName?.[0] || '?').toUpperCase()}
                              </div>
                              <span className="text-[10px] text-slate-400 truncate">
                                {item.owner?.displayName || item.owner?.userName || 'Sconosciuto'}
                              </span>
                            </div>

                            {/* Spacer for delete button alignment, button is absolute outside link to avoid nesting issues or bubbling weirdness if inside link */}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {isOwner && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDelete(item.id);
                          }}
                          className="bg-white/80 backdrop-blur-sm text-slate-300 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 shadow-sm border border-slate-100"
                          title="Elimina"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 px-4 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <PackageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nessun oggetto nell'inventario.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-bold text-lg mb-2">Aggiungi Oggetto</h2>
            {!activeCommunityId && <div className="text-sm text-red-500">Seleziona una community.</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nome Oggetto"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Es. Trapano a percussione"
              />
              <Input
                label="Descrizione"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Condizioni, accessori inclusi..."
              />
              <Input
                label="Categoria"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                required
                placeholder="Es. Fai da te"
              />

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 ml-1">Stato Iniziale</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ItemStatus }))}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="Available">Disponibile</option>
                  <option value="Reserved">Riservato</option>
                  <option value="InLoan">In Prestito</option>
                  <option value="Unavailable">Non Disponibile</option>
                </select>
              </div>

              <Button type="submit" fullWidth disabled={loading || !canCreate} isLoading={loading}>
                Crea Oggetto
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItemsPage;
