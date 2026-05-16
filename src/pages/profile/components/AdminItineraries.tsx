import { useState, useMemo, useRef, useEffect } from 'react';
import { useCities } from '@features/cities/hooks/useCities';
import { useCityItineraries } from '@features/itineraries/hooks/useCityItineraries';
import { useUpdateItinerary } from '@features/itineraries/hooks/useUpdateItinerary';
import { useCreateItinerary } from '@features/itineraries/hooks/useCreateItinerary';
import type { Itinerary, CreateItineraryData } from '@features/itineraries/types/itineraries.types';

const ITEMS_PER_PAGE = 3;
type Mode = 'list' | 'edit' | 'create';

// --- Icons ---

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

// --- Price Badge ---

const priceLevels: Record<number, { label: string; className: string }> = {
  1: { label: '$ Budget', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  2: { label: '$$ Medium', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  3: { label: '$$$ High', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  4: { label: '$$$$ Premium', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  5: { label: '$$$$$ Luxury', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

const PriceBadge = ({ price }: { price: number }) => {
  const level = priceLevels[price] || priceLevels[1];
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${level.className}`}>
      {level.label}
    </span>
  );
};

export const AdminItineraries = () => {
  const { cities, isPending: loadingCities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  const { data: itineraries, isPending: loadingItineraries } = useCityItineraries(selectedCityId || undefined);
  const { mutate: updateItinerary, isPending: isUpdating } = useUpdateItinerary();
  const { mutate: createItinerary, isPending: isCreating } = useCreateItinerary();

  const [mode, setMode] = useState<Mode>('list');
  const [createCityId, setCreateCityId] = useState<string>('');
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [formData, setFormData] = useState<Partial<Itinerary>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  const itineraryList = itineraries || [];
  const totalPages = Math.max(1, Math.ceil(itineraryList.length / ITEMS_PER_PAGE));
  const paginatedItineraries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return itineraryList.slice(start, start + ITEMS_PER_PAGE);
  }, [itineraryList, currentPage]);

  const handleEdit = (itinerary: Itinerary) => {
    setMode('edit');
    setEditingItinerary(itinerary);
    setFormData({
      title: itinerary.title,
      guide: itinerary.guide,
      description: itinerary.description,
      price: itinerary.price,
      duration: itinerary.duration,
      hashtags: itinerary.hashtags ? [...itinerary.hashtags] : [],
    });
    setMessage(null);
  };

  const handleCancel = () => {
    setMode('list');
    setEditingItinerary(null);
    setFormData({});
    setMessage(null);
  };

  const handleCreateNew = () => {
    setMode('create');
    setFormData({});
    setMessage(null);
    setCreateCityId('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim() || !formData.guide?.trim()) {
      setMessage({ type: 'error', text: 'Title and Guide are required.' });
      return;
    }

    const cityIdToUse = selectedCityId || createCityId;
    if (!cityIdToUse) return;

    const data: CreateItineraryData = {
      title: formData.title || '',
      price: formData.price ?? 1,
      guide: formData.guide || '',
      duration: formData.duration ?? 1,
      guide_image: formData.guide_image || '',
      description: formData.description || '',
      hashtags: formData.hashtags,
      activities: formData.activities,
    };

    createItinerary(
      { cityId: cityIdToUse, data },
      {
        onSuccess: () => {
          setMessage({ type: 'success', text: 'Itinerary created successfully!' });
          setMode('list');
          setFormData({});
          messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { statusMsg?: string } } };
          setMessage({ type: 'error', text: apiError?.response?.data?.statusMsg || 'Failed to create itinerary.' });
        },
      },
    );
  };

  const handleHashtagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((t) => t.trim()).filter((t) => t !== '');
    setFormData({ ...formData, hashtags: tags });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItinerary) return;

    updateItinerary(
      { id: editingItinerary._id, data: formData },
      {
        onSuccess: () => {
          setMessage({ type: 'success', text: 'Itinerary updated successfully!' });
          messageTimerRef.current = setTimeout(() => {
            setEditingItinerary(null);
            setMessage(null);
          }, 2000);
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { statusMsg?: string } } };
          setMessage({ type: 'error', text: apiError?.response?.data?.statusMsg || 'Failed to update itinerary.' });
        },
      },
    );
  };

  const selectedCity = cities.find((c) => c._id === selectedCityId);

  if (loadingCities) return <div className="text-muted-foreground py-12 text-center animate-pulse">Loading cities...</div>;

  // --- Create Form ---
  if (mode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={handleCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            Itineraries
          </button>
          <span className="text-muted-foreground/40">›</span>
          <span className="text-primary font-medium">Create Itinerary</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Create New Itinerary</h1>

        {selectedCityId && selectedCity && (
          <p className="text-sm text-muted-foreground">
            Creating itinerary for: <span className="font-medium text-foreground">{selectedCity.name}</span>
          </p>
        )}

        {message && (
          <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* City selector (only shown if no city is selected in list) */}
            {!selectedCityId && (
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="create-cityId" className="text-sm font-medium text-muted-foreground">City</label>
                <div className="relative">
                  <select
                    id="create-cityId"
                    value={createCityId}
                    onChange={(e) => setCreateCityId(e.target.value)}
                    className="appearance-none w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 pr-9 text-foreground outline-none transition-all focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="create-title" className="text-sm font-medium text-muted-foreground">Title</label>
              <input
                id="create-title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-guide" className="text-sm font-medium text-muted-foreground">Guide</label>
              <input
                id="create-guide"
                type="text"
                value={formData.guide || ''}
                onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="create-description" className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea
                id="create-description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-price" className="text-sm font-medium text-muted-foreground">Price (1-5)</label>
              <input
                id="create-price"
                type="number"
                min="1"
                max="5"
                value={formData.price ?? ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="create-duration" className="text-sm font-medium text-muted-foreground">Duration (Hours)</label>
              <input
                id="create-duration"
                type="number"
                min="1"
                max="8"
                value={formData.duration ?? ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="create-guide_image" className="text-sm font-medium text-muted-foreground">Guide Image</label>
              <input
                id="create-guide_image"
                type="text"
                value={formData.guide_image || ''}
                onChange={(e) => setFormData({ ...formData, guide_image: e.target.value })}
                placeholder="https://example.com/guide.jpg"
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="create-hashtags" className="text-sm font-medium text-muted-foreground">Hashtags (comma separated)</label>
              <input
                id="create-hashtags"
                type="text"
                value={formData.hashtags?.join(', ') || ''}
                onChange={handleHashtagsChange}
                placeholder="#travel, #adventure"
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="create-activities" className="text-sm font-medium text-muted-foreground">Activities (comma separated URLs)</label>
              <input
                id="create-activities"
                type="text"
                value={formData.activities?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value.split(',').map((a) => a.trim()).filter((a) => a !== '') })}
                placeholder="https://example.com/activity1, https://example.com/activity2"
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              disabled={isCreating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              {isCreating ? 'Creating...' : 'Create Itinerary'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- Edit Form ---
  if (editingItinerary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={handleCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            Itineraries
          </button>
          <span className="text-muted-foreground/40">›</span>
          <span className="text-primary font-medium">Edit {editingItinerary.title}</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Edit Itinerary: {editingItinerary.title}</h1>

        {message && (
          <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Guide Name</label>
              <input
                type="text"
                value={formData.guide || ''}
                onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Price (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.price ?? ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.duration ?? ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Hashtags (comma separated)</label>
              <input
                type="text"
                value={formData.hashtags?.join(', ') || ''}
                onChange={handleHashtagsChange}
                placeholder="#travel, #adventure"
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              disabled={isUpdating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- Itineraries Table ---
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Itineraries Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">View, edit, and manage all curated travel itineraries.</p>
      </div>

      {/* City Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={selectedCityId}
            onChange={(e) => {
              setSelectedCityId(e.target.value);
              setCurrentPage(1);
            }}
            className="appearance-none rounded-xl border border-border bg-secondary/30 px-4 py-2.5 pr-9 text-sm text-foreground outline-none transition-all focus:border-primary/50 cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
        </div>

        {selectedCityId && (
          <span className="text-sm text-muted-foreground">
            Showing {itineraryList.length} results
          </span>
        )}

        <button
          type="button"
          onClick={handleCreateNew}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create New Itinerary
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      {!selectedCityId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p className="text-sm text-muted-foreground">Select a city to view its itineraries</p>
        </div>
      ) : loadingItineraries ? (
        <div className="text-muted-foreground py-16 text-center animate-pulse">Fetching itineraries...</div>
      ) : itineraryList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16">
          <p className="text-sm text-muted-foreground">No itineraries found for {selectedCity?.name ?? 'this city'}.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Author (Insider)</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">City</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Level</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItineraries.map((itinerary) => (
                  <tr key={itinerary._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group last:border-b-0">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{itinerary.title}</p>
                        <p className="text-xs text-muted-foreground">ID: #{itinerary._id.slice(-4).toUpperCase()}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={itinerary.guide_image || '/no-image-stock.png'}
                          alt={itinerary.guide}
                          className="h-8 w-8 rounded-full object-cover border border-border"
                        />
                        <span className="text-sm text-muted-foreground">{itinerary.guide}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">
                        {selectedCity?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <PriceBadge price={itinerary.price} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {itinerary.duration} {itinerary.duration === 1 ? 'Hour' : 'Hours'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleEdit(itinerary)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${itinerary.title}`}
                      >
                        <EditIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};