import { useState, useMemo, useRef } from 'react';
import { useCities } from '@features/cities/hooks/useCities';
import { useUpdateCity } from '@features/cities/hooks/useUpdateCity';
import { uploadImage } from '@shared/services/cloudinary.service';
import type { City, ApiError } from '@shared/types/api.types';

const ITEMS_PER_PAGE = 4;

// --- Icons ---

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export const AdminCities = () => {
  const { cities, isPending, isError } = useCities();
  const { mutate: updateCity, isPending: isUpdating } = useUpdateCity();

  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<Partial<City>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return cities;
    const q = searchQuery.toLowerCase();
    return cities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
    );
  }, [cities, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCities.length / ITEMS_PER_PAGE));
  const paginatedCities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCities, currentPage]);

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      country: city.country,
      description: city.description,
      image: city.image,
      currency: city.currency,
      language: city.language,
    });
    setMessage(null);
  };

  const handleCancel = () => {
    setEditingCity(null);
    setFormData({});
    setMessage(null);
    setIsUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: result.secure_url }));
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;

    updateCity(
      { id: editingCity._id, data: formData },
      {
        onSuccess: () => {
          setMessage({ type: 'success', text: 'City updated successfully!' });
          setTimeout(() => {
            setEditingCity(null);
            setMessage(null);
          }, 2000);
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: ApiError } };
          setMessage({ type: 'error', text: apiError?.response?.data?.statusMsg || 'Failed to update city.' });
        },
      },
    );
  };

  if (isPending) return <div className="text-muted-foreground py-12 text-center animate-pulse">Loading cities data...</div>;
  if (isError) return <div className="text-destructive py-12 text-center">Error loading cities. Please try again.</div>;

  // --- Edit Form ---
  if (editingCity) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button type="button" onClick={handleCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            Cities
          </button>
          <span className="text-muted-foreground/40">›</span>
          <span className="text-primary font-medium">Edit {editingCity.name}</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Edit City: {editingCity.name}</h1>

        {message && (
          <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">City Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Country</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Currency</label>
              <input
                type="text"
                value={formData.currency || ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Language</label>
              <input
                type="text"
                value={formData.language || ''}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring resize-none"
              />
              <p className="text-right text-xs text-muted-foreground">
                {(formData.description || '').length} / 500 characters
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Cover Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Upload cover image"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="relative w-full overflow-hidden rounded-xl border border-dashed border-border bg-secondary/20 cursor-pointer transition-colors hover:border-primary/40 disabled:cursor-wait disabled:opacity-60"
              >
                {formData.image ? (
                  <img src={formData.image} alt="Cover preview" className="h-48 w-full object-cover opacity-70" />
                ) : (
                  <div className="h-48" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {isUploading ? (
                    <>
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground/60">PNG, JPG, WebP or GIF (max. 5MB)</p>
                    </>
                  )}
                </div>
              </button>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Or paste image URL here..."
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
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

  // --- Cities Table ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Cities Management</h1>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search cities by name or country..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-foreground placeholder-muted-foreground outline-none w-52 sm:w-64"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">City Name</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Itineraries</th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCities.map((city) => (
                <tr key={city._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="h-10 w-10 rounded-lg object-cover border border-border"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{city.name}</p>
                        <p className="text-xs text-muted-foreground">{city.language}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{city.country}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{city.itineraries?.length ?? '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleEdit(city)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${city.name}`}
                    >
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredCities.length)} of{' '}
            {filteredCities.length} cities
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
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 3 && (
              <>
                <span className="px-1 text-muted-foreground/40">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
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
    </div>
  );
};