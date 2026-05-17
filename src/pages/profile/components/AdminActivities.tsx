import { useState, useEffect, useRef } from 'react';
import { useCities } from '@features/cities/hooks/useCities';
import { useCityItineraries } from '@features/itineraries/hooks/useCityItineraries';
import { useItineraryActivities } from '@features/itineraries/hooks/useItineraryActivities';
import { useCreateActivity } from '@features/itineraries/hooks/useCreateActivity';
import { useUpdateActivity } from '@features/itineraries/hooks/useUpdateActivity';
import { useDeleteActivity } from '@features/itineraries/hooks/useDeleteActivity';
import type { CreateActivityData, Activity } from '@features/itineraries/types/itineraries.types';

interface Props {
  preselectedItineraryId?: string;
}

type ActivityMode = 'list' | 'create' | 'edit';

// --- Icons ---

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);

export const AdminActivities = ({ preselectedItineraryId }: Props) => {
  const { cities, isPending: loadingCities } = useCities();
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>(preselectedItineraryId || '');
  const [mode, setMode] = useState<ActivityMode>('list');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<CreateActivityData>({
    name: '',
    description: '',
    image: '',
    duration: undefined,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  // Sync preselectedItineraryId from props
  useEffect(() => {
    if (preselectedItineraryId) {
      setSelectedItineraryId(preselectedItineraryId);
    }
  }, [preselectedItineraryId]);

  const { data: itineraries = [], isPending: loadingItineraries } = useCityItineraries(
    selectedCityId || undefined,
  );

  // Auto-select first itinerary if exactly one available and none selected
  useEffect(() => {
    if (itineraries.length === 1 && !selectedItineraryId) {
      setSelectedItineraryId(itineraries[0]._id);
    }
  }, [itineraries, selectedItineraryId]);

  const {
    data: activities = [],
    isPending: loadingActivities,
  } = useItineraryActivities(selectedItineraryId || undefined);

  // H2 fix: hooks no longer receive itineraryId at instantiation
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();
  const { mutate: deleteActivity, isPending: isDeleting } = useDeleteActivity();

  const isMutating = isCreating || isUpdating || isDeleting;

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);
    setSelectedItineraryId('');
    setMode('list');
    setMessage(null);
  };

  const handleItineraryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItineraryId(e.target.value);
    setMode('list');
    setMessage(null);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '', duration: undefined });
    setEditingActivity(null);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      image: activity.image,
      duration: activity.duration,
    });
    setMode('edit');
    setMessage(null);
  };

  const handleCancel = () => {
    setMode('list');
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }

    if (!selectedItineraryId) {
      setMessage({ type: 'error', text: 'Please select an itinerary first.' });
      return;
    }

    if (mode === 'create') {
      createActivity(
        { itineraryId: selectedItineraryId, data: formData },
        {
          onSuccess: () => {
            setMessage({ type: 'success', text: 'Activity created successfully!' });
            setMode('list');
            resetForm();
            messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
          },
          onError: (err: unknown) => {
            const apiError = err as { response?: { data?: { statusMsg?: string } } };
            setMessage({ type: 'error', text: apiError?.response?.data?.statusMsg || 'Failed to create activity.' });
          },
        },
      );
    } else if (mode === 'edit' && editingActivity) {
      updateActivity(
        { itineraryId: selectedItineraryId, activityId: editingActivity._id, data: formData },
        {
          onSuccess: () => {
            setMessage({ type: 'success', text: 'Activity updated successfully!' });
            setMode('list');
            resetForm();
            messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
          },
          onError: (err: unknown) => {
            const apiError = err as { response?: { data?: { statusMsg?: string } } };
            setMessage({ type: 'error', text: apiError?.response?.data?.statusMsg || 'Failed to update activity.' });
          },
        },
      );
    }
  };

  const handleDelete = (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    if (!selectedItineraryId) return;

    deleteActivity(
      { itineraryId: selectedItineraryId, activityId },
      {
        onSuccess: () => {
          setMessage({ type: 'success', text: 'Activity deleted.' });
          messageTimerRef.current = setTimeout(() => setMessage(null), 3000);
        },
        onError: (err: unknown) => {
          const apiError = err as { response?: { data?: { statusMsg?: string } } };
          setMessage({ type: 'error', text: apiError?.response?.data?.statusMsg || 'Failed to delete activity.' });
        },
      },
    );
  };

  if (loadingCities) {
    return <div className="text-muted-foreground py-12 text-center animate-pulse">Loading cities...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Activities Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage activities for individual itineraries.</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300'
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={selectedCityId}
            onChange={handleCityChange}
            className="appearance-none rounded-xl border border-border bg-secondary/30 px-4 py-2.5 pr-9 text-sm text-foreground outline-none transition-all focus:border-primary/50 cursor-pointer"
            aria-label="Select city"
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

        {selectedCityId && (
          <div className="relative">
            <select
              value={selectedItineraryId}
              onChange={handleItineraryChange}
              className="appearance-none rounded-xl border border-border bg-secondary/30 px-4 py-2.5 pr-9 text-sm text-foreground outline-none transition-all focus:border-primary/50 cursor-pointer"
              aria-label="Select itinerary"
            >
              <option value="">Select an itinerary</option>
              {itineraries.map((it) => (
                <option key={it._id} value={it._id}>
                  {it.title}
                </option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        )}

        {loadingItineraries && selectedCityId && (
          <span className="text-sm text-muted-foreground animate-pulse">Loading itineraries...</span>
        )}

        <button
          type="button"
          onClick={() => {
            setMode('create');
            resetForm();
            setMessage(null);
          }}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Add Activity"
        >
          Add Activity
        </button>
      </div>

      {/* Create / Edit Form */}
      {(mode === 'create' || mode === 'edit') && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            {mode === 'create' ? 'New Activity' : 'Update Activity'}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="act-name" className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                id="act-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="act-duration" className="text-sm font-medium text-muted-foreground">Duration (min)</label>
              <input
                id="act-duration"
                type="number"
                min="1"
                value={formData.duration ?? ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="act-description" className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea
                id="act-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="act-image" className="text-sm font-medium text-muted-foreground">Image URL</label>
              <input
                id="act-image"
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-ring"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-lg object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              disabled={isMutating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              disabled={isMutating}
            >
              {mode === 'create' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  {isCreating ? 'Creating...' : 'Create Activity'}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  {isUpdating ? 'Updating...' : 'Update Activity'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Content */}
      {!selectedCityId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p className="text-sm text-muted-foreground">Select a city to manage activities</p>
        </div>
      ) : !selectedItineraryId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card py-16">
          <p className="text-sm text-muted-foreground">Select an itinerary to view its activities</p>
        </div>
      ) : loadingActivities ? (
        <div className="text-muted-foreground py-16 text-center animate-pulse">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16">
          <p className="text-sm text-muted-foreground">No activities found for this itinerary.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration (min)</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Image</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group last:border-b-0">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">{activity.name}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {activity.duration != null ? `${activity.duration} min` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <img
                        src={activity.image}
                        alt={activity.name}
                        className="h-10 w-10 rounded-lg object-cover border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/no-image-stock.png';
                        }}
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(activity)}
                          disabled={isMutating}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                          aria-label={`Edit ${activity.name}`}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(activity._id)}
                          disabled={isMutating}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          aria-label={`Delete ${activity.name}`}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
