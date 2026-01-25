import React from 'react';
import ApiErrorBanner from '../components/ApiErrorBanner';
import { createItem, deleteItem, listItems } from '../api/items';
import { ItemListItemDto, ItemStatus } from '../api/types';
import { useSession } from '../state/session';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PackageIcon, PlusIcon } from '../components/ui/Icons';
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
            <Button variant="ghost" size="sm" onClick={loadItems}>Aggiorna</Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {items.length ? (
              items.map((item) => (
                <Card key={item.id} className="overflow-hidden h-full flex flex-col">
                  <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                    <PackageIcon className="w-10 h-10 text-slate-400 opacity-50" />
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.status === 'Available' ? 'success' : 'default'} className="text-[10px]">{item.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2 flex-1">{item.description}</p>
                    <div className="text-[10px] text-slate-400 mb-2">
                      Proprietario: {item.owner.displayName || item.owner.userName || item.owner.id}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">{item.category}</span>
                      <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                Nessun oggetto nell'inventario.
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
