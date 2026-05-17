# Spec: Migración de Activities de `string[]` a objetos `Activity[]`

## Objetivo

Migrar el campo `activities` en los itinerarios de ser un `string[]` (solo URLs de imágenes) a ser un array de objetos estructurados `Activity[]` con `{ _id, name, description, image, duration? }`. Esto implica:

- Agregar nuevos tipos TypeScript.
- Crear servicios y hooks CRUD para actividades (endpoints dedicados).
- Crear una página de detalle de itinerario (`/itineraries/:id`) que muestre las actividades.
- Agregar gestión de actividades en el panel de administración.
- Actualizar tests existentes y crear nuevos.

---

## Fase 1: Tipos base

### Archivo a modificar

`src/features/itineraries/types/itineraries.types.ts`

### Cambios

1. **Agregar interfaz `Activity`**:
   ```typescript
   export interface Activity {
     _id: string;
     name: string;
     description: string;
     image: string;            // URL de la foto
     duration?: number;        // Duración en minutos (opcional)
   }
   ```

2. **Modificar `Itinerary.activities`**:
   - `activities?: string[]` → `activities?: Activity[]`

3. **Modificar `CreateItineraryData`**:
   - Eliminar la propiedad `activities?: string[]` del todo.
   - Las actividades ya no se envían al crear un itinerario; se gestionan aparte vía endpoints dedicados.

### Archivo adicional a modificar

`src/features/cities/cities.types.ts`:
- Corregir el import con typo: `@features/intineraries/itineraries.types` → `@features/itineraries/types/itineraries.types`
- La interfaz `City` ya usa `Itinerary[]` desde `api.types.ts` (que a su vez importa de `itineraries.types.ts`). Al cambiarse `Itinerary.activities` a `Activity[]`, el cambio se propaga automáticamente.
- **Alternativa**: si `cities.types.ts` no se usa (parece duplicado de `api.types.ts`), considerar marcarlo como `@deprecated` o eliminarlo. Por ahora, solo corregir el import path.

### Contrato resultante

```typescript
// Activity — nuevo tipo estructurado
export interface Activity {
  _id: string;
  name: string;
  description: string;
  image: string;
  duration?: number;
}

// Itinerary — activities cambia de string[] a Activity[]
export interface Itinerary {
  _id: string;
  title: string;
  price: number;
  guide: string;
  duration: number;
  hashtags: string[];
  guide_image: string;
  description: string;
  activities?: Activity[];       // ← CAMBIA
  city: string | any;
}

// CreateItineraryData — se quita activities
export interface CreateItineraryData {
  title: string;
  price: number;
  guide: string;
  duration: number;
  hashtags?: string[];
  guide_image: string;
  description: string;
  // activities eliminado
}

// CreateActivityData — nuevo, para el service de actividades
export interface CreateActivityData {
  name: string;
  description: string;
  image: string;
  duration?: number;
}
```

### Acceptance Criteria (Fase 1)

- [ ] AC1.1: Existe la interfaz `Activity` exportada con los campos `_id`, `name`, `description`, `image`, `duration?`.
- [ ] AC1.2: `Itinerary.activities` es `Activity[]` (opcional), no `string[]`.
- [ ] AC1.3: `CreateItineraryData` no tiene la propiedad `activities`.
- [ ] AC1.4: Existe `CreateActivityData` exportada (para usarse en services/hooks).
- [ ] AC1.5: El import en `cities.types.ts` está corregido (sin typo).

---

## Fase 2: Servicios de Actividades

### Archivo nuevo

`src/features/itineraries/services/activities.services.ts`

### Contrato

```typescript
import api from "@shared/api/api";
import type { ApiResponse } from "@shared/types/api.types";
import type { Activity, CreateActivityData } from "../types/itineraries.types";

export const activitiesService = {
  // Obtener todas las actividades de un itinerario
  getActivitiesByItinerary(itineraryId: string): Promise<Activity[]>;
  // Crear una nueva actividad en un itinerario
  createActivity(itineraryId: string, data: CreateActivityData): Promise<Activity>;
  // Actualizar una actividad existente (todos los campos son parciales, al menos 1 requerido)
  updateActivity(itineraryId: string, activityId: string, data: Partial<CreateActivityData>): Promise<Activity>;
  // Eliminar una actividad
  deleteActivity(itineraryId: string, activityId: string): Promise<void>;
};
```

### Implementación esperada

```typescript
export const activitiesService = {
  getActivitiesByItinerary: async (itineraryId: string): Promise<Activity[]> => {
    const response = await api.get<never, ApiResponse<Activity[]>>(`/itineraries/${itineraryId}/activities`);
    return response.data;
  },

  createActivity: async (itineraryId: string, data: CreateActivityData): Promise<Activity> => {
    const response = await api.post<never, ApiResponse<Activity>>(`/itineraries/${itineraryId}/activities`, data);
    return response.data;
  },

  updateActivity: async (itineraryId: string, activityId: string, data: Partial<CreateActivityData>): Promise<Activity> => {
    const response = await api.put<never, ApiResponse<Activity>>(`/itineraries/${itineraryId}/activities/${activityId}`, data);
    return response.data;
  },

  deleteActivity: async (itineraryId: string, activityId: string): Promise<void> => {
    const response = await api.delete<never, ApiResponse<void>>(`/itineraries/${itineraryId}/activities/${activityId}`);
    // Axios interceptor ya unwrapa response.data; si la respuesta es vacía/204, no hay problema.
  },
};
```

### Endpoints consumidos

| Método | Ruta | Body esperado | Respuesta exitosa |
|--------|------|---------------|-------------------|
| `GET` | `/itineraries/:id/activities` | — | `ApiResponse<Activity[]>` |
| `POST` | `/itineraries/:id/activities` | `CreateActivityData` | `ApiResponse<Activity>` |
| `PUT` | `/itineraries/:id/activities/:activityId` | `Partial<CreateActivityData>` | `ApiResponse<Activity>` |
| `DELETE` | `/itineraries/:id/activities/:activityId` | — | `ApiResponse<void>` (204) |

### Reglas de negocio para el service

- El interceptor de axios ya extrae `response.data`, así que el service recibe el `ApiResponse<T>` unwrapeado.
- `deleteActivity` no retorna data; el `ApiResponse<void>` se ignora.
- **No hay manejo de errores en el service**: los errores se propagan al hook/componente.
- `duration` en los endpoints está en **minutos**.

### Acceptance Criteria (Fase 2)

- [ ] AC2.1: `getActivitiesByItinerary` hace `GET /itineraries/{itineraryId}/activities` y retorna `Activity[]`.
- [ ] AC2.2: `createActivity` hace `POST /itineraries/{itineraryId}/activities` con `CreateActivityData` y retorna la `Activity` creada.
- [ ] AC2.3: `updateActivity` hace `PUT /itineraries/{itineraryId}/activities/{activityId}` con `Partial<CreateActivityData>` y retorna la `Activity` actualizada.
- [ ] AC2.4: `deleteActivity` hace `DELETE /itineraries/{itineraryId}/activities/{activityId}` y no retorna nada (`void`).
- [ ] AC2.5: Todos los métodos propagan errores (no los tragan).

---

## Fase 3: Hooks de Actividades

### Archivos nuevos

| Archivo | Hook | Descripción |
|---------|------|-------------|
| `src/features/itineraries/hooks/useItineraryActivities.ts` | `useItineraryActivities(itineraryId)` | `useQuery` — lista actividades |
| `src/features/itineraries/hooks/useCreateActivity.ts` | `useCreateActivity()` | `useMutation` — crear actividad |
| `src/features/itineraries/hooks/useUpdateActivity.ts` | `useUpdateActivity()` | `useMutation` — actualizar actividad |
| `src/features/itineraries/hooks/useDeleteActivity.ts` | `useDeleteActivity()` | `useMutation` — eliminar actividad |

### `useItineraryActivities`

```typescript
import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';

export const useItineraryActivities = (itineraryId: string | undefined) => {
  return useQuery({
    queryKey: ['itineraries', itineraryId, 'activities'],
    queryFn: () => activitiesService.getActivitiesByItinerary(itineraryId!),
    enabled: !!itineraryId,
  });
};
```

### `useCreateActivity`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';
import type { CreateActivityData } from '../types/itineraries.types';

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: { itineraryId: string; data: CreateActivityData }) =>
      activitiesService.createActivity(itineraryId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itineraries', variables.itineraryId, 'activities'],
      });
    },
    onError: (error) => {
      console.error('Failed to create activity:', error);
    },
  });
};
```

### `useUpdateActivity`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';
import type { CreateActivityData } from '../types/itineraries.types';

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, activityId, data }: { itineraryId: string; activityId: string; data: Partial<CreateActivityData> }) =>
      activitiesService.updateActivity(itineraryId, activityId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itineraries', variables.itineraryId, 'activities'],
      });
    },
    onError: (error) => {
      console.error('Failed to update activity:', error);
    },
  });
};
```

### `useDeleteActivity`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, activityId }: { itineraryId: string; activityId: string }) =>
      activitiesService.deleteActivity(itineraryId, activityId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['itineraries', variables.itineraryId, 'activities'],
      });
    },
    onError: (error) => {
      console.error('Failed to delete activity:', error);
    },
  });
};
```

### Patrón de invalidación

- `useCreateActivity`, `useUpdateActivity`, `useDeleteActivity` **siempre invalidan** `['itineraries', itineraryId, 'activities']` en éxito.
- Además, también deberían invalidar `['itineraries']` (padre) para refrescar la lista de itinerarios que ahora tienen activities populadas? **Discutible**. Decisión: **sí**, también invalidar `['itineraries']` para que la lista de itinerarios en CityDetailsPage se actualice si las activities se muestran ahí. El comportamiento real depende de si el backend popula activities en la respuesta del itinerary o si se obtienen aparte.

**Decisión de diseño**: Invalidar ambas claves:
```typescript
onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: ['itineraries', variables.itineraryId, 'activities'] });
  queryClient.invalidateQueries({ queryKey: ['itineraries'] });
},
```

### Acceptance Criteria (Fase 3)

- [ ] AC3.1: `useItineraryActivities(id)` hace query con key `['itineraries', id, 'activities']` y está deshabilitado si `id` es `undefined`.
- [ ] AC3.2: `useCreateActivity()` hace mutate y en éxito invalida `['itineraries', itineraryId, 'activities']` e `['itineraries']`.
- [ ] AC3.3: `useUpdateActivity()` hace mutate y en éxito invalida las mismas keys.
- [ ] AC3.4: `useDeleteActivity()` hace mutate y en éxito invalida las mismas keys.
- [ ] AC3.5: Ningún hook invalida en error.
- [ ] AC3.6: `useCreateActivity` propaga errores (no los traga).

---

## Fase 4: Itinerary Detail Page

### Archivo nuevo

`src/pages/itineraries/ItineraryDetailPage.tsx`

### Problema conocido: ENDPOINT STUB

Según la documentación del backend, `GET /api/itineraries/:id` es un **STUB** (no implementado). No podemos obtener un itinerario individual por ID directamente.

**Solución elegida (Opción A): Pasar el itinerary via `location.state` de React Router.**

- `ItineraryCard` pasa el objeto `itinerary` completo via `navigate('/itineraries/:id', { state: { itinerary } })`.
- `ItineraryDetailPage` lee `location.state.itinerary` en lugar de hacer fetch.
- Si no hay `state` (navegación directa a la URL), se muestra un mensaje de error con un enlace para volver atrás.
- Se agrega un `TODO` comentado para cuando el endpoint esté disponible.

### Diseño de la página

```
┌─────────────────────────────────────────────┐
│  ← Back to City                              │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  Hero section:                          │ │
│  │  [Guide Image]  Title                   │ │
│  │                 Guide: name             │ │
│  │                 $$$$  •  4 Hours        │ │
│  │                 #tag1 #tag2 #tag3       │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  Description:                                │
│  Full description text here...               │
│                                              │
│  ──── Activities ────                        │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Activity │ │ Activity │ │ Activity │    │
│  │ Card 1   │ │ Card 2   │ │ Card 3   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
└─────────────────────────────────────────────┘
```

### Estructura del componente

```typescript
// ItineraryDetailPage.tsx
import { useParams, useLocation, Link } from 'react-router';
import type { Itinerary } from '@features/itineraries/types/itineraries.types';
import { SEO } from '@shared/seo/SEO';
// import { useItineraryActivities } from '@features/itineraries/hooks/useItineraryActivities';

const ItineraryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const itinerary = (location.state as { itinerary: Itinerary })?.itinerary;

  // TODO: cuando el backend implemente GET /api/itineraries/:id,
  // agregar un fetch del itinerary por ID y usar ese como fallback.
  // Por ahora, se usa location.state desde ItineraryCard.

  if (!itinerary) {
    return <NotFoundState />;  // "Itinerario no encontrado. Vuelve a la ciudad desde la lista."
  }

  return (
    <>
      <SEO title={itinerary.title} description={itinerary.description} canonical={`/itineraries/${itinerary._id}`} />
      <div className="...">
        {/* Back button */}
        <Link to={`/cities/${typeof itinerary.city === 'string' ? itinerary.city : itinerary.city?._id}`}>
          ← Back to City
        </Link>

        {/* Hero section: guide image, title, guide name, price, duration, hashtags */}
        <HeroSection itinerary={itinerary} />

        {/* Description */}
        <DescriptionSection description={itinerary.description} />

        {/* Activities section */}
        <ActivitiesSection activities={itinerary.activities} />
      </div>
    </>
  );
};
```

### `ActivitiesSection`

- Si `itinerary.activities` existe y tiene longitud > 0, muestra grid de actividades.
- Cada actividad se muestra como una card con: imagen (izquierda), nombre, descripción, duración en minutos ("90 min").
- Si no hay actividades, muestra "No activities available yet."

**Formato de duración**: mostrar como "90 min". Si no tiene `duration`, no mostrar nada.

### Modificar `ItineraryCard.tsx`

Agregar `onClick` o hacer clickeable toda la card para navegar a `/itineraries/:id`:

```typescript
const handleCardClick = () => {
  navigate(`/itineraries/${itinerary._id}`, {
    state: { itinerary },
  });
};
```

La card debe tener `cursor-pointer` y el click debe propagarse en un area segura (no dentro del botón de wishlist, que tiene su propio `onClick` con `stopPropagation`).

**Precaución**: El botón de wishlist ya tiene su propio `onClick`. Se debe agregar `e.stopPropagation()` en el `handleWishlistClick` para evitar que el click en el corazón navegue a la detail page.

### Modificar `Router.tsx`

Agregar ruta lazy-loaded dentro de `MainLayout`:

```typescript
const ItineraryDetailPage = lazy(() => import('@pages/itineraries/ItineraryDetailPage'));

// En children del MainLayout:
{ path: "/itineraries/:id", element: <ItineraryDetailPage /> },
```

### Nuevo directorio

Crear `src/pages/itineraries/` con dentro `ItineraryDetailPage.tsx`.

### Acceptance Criteria (Fase 4)

- [ ] AC4.1: `ItineraryCard` es clickeable y navega a `/itineraries/:id` con `state: { itinerary }`.
- [ ] AC4.2: El click en el botón de wishlist **no** navega a la detail page (stopPropagation).
- [ ] AC4.3: `ItineraryDetailPage` existe y es lazy-loaded en `/itineraries/:id`.
- [ ] AC4.4: La página muestra nombre, guía, precio, duración, hashtags y descripción del itinerario.
- [ ] AC4.5: La página muestra una sección "Activities" con cada actividad (imagen, nombre, descripción, duración).
- [ ] AC4.6: Si no hay `state` (navegación directa), muestra estado de "Itinerario no encontrado" con enlace.
- [ ] AC4.7: Si no hay actividades, muestra "No activities available yet."

---

## Fase 5: Admin — Activities Management

### Archivo nuevo

`src/pages/profile/components/AdminActivities.tsx`

### Estructura del componente

```
┌─────────────────────────────────────────────┐
│  Activities Management                       │
│                                              │
│  [Select Itinerary ▼]  [Add Activity]        │
│                                              │
│  ┌─── Itinerary selected ──────────────────┐ │
│  │  Activities for: "Buenos Aires Walking…" │ │
│  │                                          │ │
│  │  ┌──────┬──────┬──────┬──────┬────────┐ │ │
│  │  │ Name │ Dur. │ Img  │ Descr│ Actions│ │ │
│  │  ├──────┼──────┼──────┼──────┼────────┤ │ │
│  │  │ …    │ …    │ …    │ …    │ ✏️ 🗑  │ │ │
│  │  └──────┴──────┴──────┴──────┴────────┘ │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Estados del componente

- `selectedItineraryId: string` — itinerario seleccionado del dropdown
- `editingActivity: Activity | null` — actividad siendo editada (null = modo lista)
- `formData: CreateActivityData` — datos del formulario de creación/edición
- `isFormOpen: boolean` — modal/formulario abierto

### Funcionalidad

1. **Selector de itinerario**: dropdown que carga itinerarios via `useCityItineraries` (necesita un cityId seleccionado). Alternativa: usar `useCities` para obtener ciudades y luego seleccionar un itinerario de la ciudad seleccionada.

   **Diseño**: Un dropdown de ciudades (como en AdminItineraries) y al seleccionar una ciudad, se cargan los itinerarios. Luego un segundo dropdown de itinerarios. Al seleccionar un itinerario, se muestran sus actividades.

2. **Tabla de actividades**: columnas Name, Duration, Image (thumbnail), Description (truncada), Actions (Edit/Delete).

3. **Botón "Add Activity"**: abre formulario inline (no modal) o un modal.

4. **Formulario de actividad**:
   - **Name** (input text, requerido)
   - **Description** (textarea, requerido)
   - **Image URL** (input text, requerido, con preview de imagen)
   - **Duration (minutes)** (input number, opcional, min 1)
   - Botones: Cancel / Save

5. **Editar actividad**: al hacer click en Edit, se abre el mismo formulario con los valores precargados. Se usa `updateActivity`.

6. **Eliminar actividad**: al hacer click en Delete, mostrar confirmación (`window.confirm()` o modal simple). Si acepta, llamar `deleteActivity`.

### Comunicación con AdminDashboard

**Cambios necesarios en `AdminDashboard.tsx`**:

1. Agregar `'activities'` al tipo `AdminView`:
   ```typescript
   type AdminView = 'dashboard' | 'cities' | 'itineraries' | 'activities';
   ```

2. Agregar `ActivityIcon` SVG (inline en el archivo):
   ```tsx
   const ActivityIcon = ({ className = '' }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 9.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 19H2"/>
       <path d="M8 3h8"/>
     </svg>
   );
   ```

3. Agregar nav item en `navItems`:
   ```typescript
   const navItems: NavItem[] = [
     { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
     { id: 'cities', label: 'Cities', icon: CityIcon },
     { id: 'itineraries', label: 'Itineraries', icon: ItineraryIcon },
     { id: 'activities', label: 'Activities', icon: ActivityIcon },  // ← NUEVO
   ];
   ```

4. Agregar renderizado condicional en el main content:
   ```typescript
   {activeView === 'activities' && <AdminActivities />}
   ```

5. **Pasar estado de itinerario preseleccionado**: El `AdminItineraries` necesita un botón "Manage Activities" que navegue a la vista de Activities con un itinerario específico.

   **Solución**: Agregar estado `selectedActivityItineraryId` en `AdminDashboard` y pasarlo como prop:
   ```typescript
   const [selectedActivityItineraryId, setSelectedActivityItineraryId] = useState<string>('');
   
   // Pasar a AdminItineraries (nueva prop):
   // <AdminItineraries onManageActivities={(id) => { setSelectedActivityItineraryId(id); setActiveView('activities'); }} />
   
   // Pasar a AdminActivities:
   // <AdminActivities preselectedItineraryId={selectedActivityItineraryId} />
   ```

### Modificaciones en `AdminItineraries.tsx`

1. **Aceptar nueva prop**:
   ```typescript
   interface Props {
     onManageActivities?: (itineraryId: string) => void;
   }
   ```

2. **Quitar campo activities del formulario de creación** (líneas 302-312 actuales). El input completo debe eliminarse.

3. **Quitar activities del formulario de edición** (no hay actualmente, confirmar que no aparezca).

4. **Agregar botón "Manage Activities" en cada fila de la tabla**:
   - Nueva columna (antes de Actions) con un botón que llame a `onManageActivities(itinerary._id)`.
   - Icono sugerido: lista/checklist SVG.

### Modificaciones en `AdminDashboard.tsx`

Agregar props de navegación y estado:
```typescript
// Estado para la comunicación entre AdminItineraries y AdminActivities
const [selectedActivityItineraryId, setSelectedActivityItineraryId] = useState<string>('');

// Al renderizar AdminItineraries:
<AdminItineraries onManageActivities={(id) => { setSelectedActivityItineraryId(id); setActiveView('activities'); }} />

// Al renderizar AdminActivities:
<AdminActivities 
  preselectedItineraryId={selectedActivityItineraryId}
  onClearPreselection={() => setSelectedActivityItineraryId('')}
/>
```

### Acceptance Criteria (Fase 5)

- [ ] AC5.1: `AdminActivities` existe y se renderiza cuando `activeView === 'activities'`.
- [ ] AC5.2: Hay un selector que permite elegir una ciudad y luego un itinerario de esa ciudad.
- [ ] AC5.3: Al seleccionar un itinerario, se muestra una tabla con sus actividades (name, duration, image, description truncada).
- [ ] AC5.4: Botón "Add Activity" abre formulario con campos: name, description, image, duration.
- [ ] AC5.5: Al guardar una actividad nueva, se llama a `createActivity` y se refresca la lista.
- [ ] AC5.6: Botón Edit en cada fila abre el formulario precargado; al guardar se llama a `updateActivity`.
- [ ] AC5.7: Botón Delete en cada fila muestra confirmación; al confirmar se llama a `deleteActivity`.
- [ ] AC5.8: El sidebar de AdminDashboard tiene el item "Activities" con su icono.
- [ ] AC5.9: El campo activities fue eliminado del formulario de creación de itinerarios en AdminItineraries.
- [ ] AC5.10: Hay un botón "Manage Activities" por fila en la tabla de itinerarios que navega a la vista de Activities.
- [ ] AC5.11: Al navegar desde "Manage Activities", el itinerario correspondiente aparece preseleccionado en `AdminActivities`.

---

## Fase 6: Tests

### Tests a actualizar

#### 1. `src/features/itineraries/services/__tests__/itineraries.services.test.ts`

**Cambios**:
- `mockItinerary.activities`: cambiar de `string[]` a `Activity[]`:
  ```typescript
  const mockItinerary: Itinerary = {
    // ... otros campos iguales
    activities: [
      { _id: 'act1', name: 'Plaza de Mayo', description: 'Visit the main square', image: 'https://example.com/plaza.jpg', duration: 60 },
      { _id: 'act2', name: 'San Telmo Market', description: 'Explore the market', image: 'https://example.com/san-telmo.jpg' },
    ],
    city: '64abc123',
  };
  ```
- `mockCreateData`: eliminar la propiedad `activities`.
- Verificar que los tests de `createItinerary` no envíen `activities` en el body.

#### 2. `src/features/itineraries/hooks/__tests__/useCreateItinerary.test.tsx`

**Cambios**:
- Mismo cambio en `mockItinerary.activities` de `string[]` a `Activity[]`.
- `mockCreateData`: eliminar `activities`.
- Verificar que el test de llamada a `createItinerary` use datos sin `activities`.

#### 3. `src/pages/profile/components/__tests__/AdminItineraries.test.tsx`

**Cambios**:
- `mockItineraries[0].activities`: cambiar de `['Plaza de Mayo', 'San Telmo']` a `Activity[]`:
  ```typescript
  activities: [
    { _id: 'act1', name: 'Plaza de Mayo', description: 'Visit the main square', image: 'https://example.com/plaza.jpg', duration: 60 },
    { _id: 'act2', name: 'San Telmo Market', description: 'Explore the market', image: 'https://example.com/san-telmo.jpg' },
  ],
  ```
- Test AC3 "should render expected form fields": actualizar para que **no** incluya el campo activities en la lista de campos esperados. El campo activities **no debe existir** en el formulario.

### Tests nuevos

#### 4. `src/features/itineraries/services/__tests__/activities.services.test.ts`

**Casos**:
- `getActivitiesByItinerary` éxito → retorna `Activity[]`
- `getActivitiesByItinerary` error (404) → propaga error
- `createActivity` éxito → retorna `Activity`
- `createActivity` error (400) → propaga error
- `updateActivity` éxito → retorna `Activity` actualizada
- `updateActivity` error (404) → propaga error
- `deleteActivity` éxito → no retorna nada (void)
- `deleteActivity` error (404) → propaga error

Patrón de mock (mismo que itineraries.services.test.ts):
```typescript
vi.mock('@shared/api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

#### 5. `src/features/itineraries/hooks/__tests__/useCreateActivity.test.tsx`

**Casos**:
- Llama a `activitiesService.createActivity` con `itineraryId` y `data`.
- En éxito, invalida `['itineraries', itineraryId, 'activities']` e `['itineraries']`.
- En error, **no** invalida.

#### 6. `src/features/itineraries/hooks/__tests__/useUpdateActivity.test.tsx`

**Casos**:
- Llama a `activitiesService.updateActivity` con `itineraryId`, `activityId` y `data`.
- En éxito, invalida las mismas query keys.
- En error, no invalida.

#### 7. `src/features/itineraries/hooks/__tests__/useDeleteActivity.test.tsx`

**Casos**:
- Llama a `activitiesService.deleteActivity` con `itineraryId` y `activityId`.
- En éxito, invalida las mismas query keys.
- En error, no invalida.

#### 8. `src/pages/profile/components/__tests__/AdminActivities.test.tsx`

**Casos** (TDD red → green):
- Muestra el título "Activities Management".
- Muestra selector de ciudad y selector de itinerario.
- Al seleccionar un itinerario, muestra la tabla de actividades.
- Botón "Add Activity" abre el formulario con los campos esperados.
- Llenar formulario y submit llama a `createActivity`.
- Botón Edit carga datos en formulario y submit llama a `updateActivity`.
- Botón Delete con confirmación llama a `deleteActivity`.

**Mocks necesarios**:
```typescript
vi.mock('@features/cities/hooks/useCities', () => ({ useCities: vi.fn() }));
vi.mock('@features/itineraries/hooks/useCityItineraries', () => ({ useCityItineraries: vi.fn() }));
vi.mock('@features/itineraries/hooks/useItineraryActivities', () => ({ useItineraryActivities: vi.fn() }));
vi.mock('@features/itineraries/hooks/useCreateActivity', () => ({ useCreateActivity: vi.fn() }));
vi.mock('@features/itineraries/hooks/useUpdateActivity', () => ({ useUpdateActivity: vi.fn() }));
vi.mock('@features/itineraries/hooks/useDeleteActivity', () => ({ useDeleteActivity: vi.fn() }));
```

### Resumen de archivos de test

| Archivo | Acción |
|---------|--------|
| `services/__tests__/itineraries.services.test.ts` | 🔄 Actualizar mocks |
| `hooks/__tests__/useCreateItinerary.test.tsx` | 🔄 Actualizar mocks |
| `components/__tests__/AdminItineraries.test.tsx` | 🔄 Actualizar mocks + quitar test de campo activities |
| `services/__tests__/activities.services.test.ts` | 🆕 Nuevo (8 casos) |
| `hooks/__tests__/useCreateActivity.test.tsx` | 🆕 Nuevo (3 casos) |
| `hooks/__tests__/useUpdateActivity.test.tsx` | 🆕 Nuevo (3 casos) |
| `hooks/__tests__/useDeleteActivity.test.tsx` | 🆕 Nuevo (3 casos) |
| `components/__tests__/AdminActivities.test.tsx` | 🆕 Nuevo (7 casos) |

### Acceptance Criteria (Fase 6)

- [ ] AC6.1: Los 3 archivos de test existentes tienen mocks actualizados (activities como `Activity[]`, sin activities en CreateItineraryData).
- [ ] AC6.2: `activities.services.test.ts` pasa todos sus casos (8 tests).
- [ ] AC6.3: `useCreateActivity.test.tsx` pasa todos sus casos (3 tests).
- [ ] AC6.4: `useUpdateActivity.test.tsx` pasa todos sus casos (3 tests).
- [ ] AC6.5: `useDeleteActivity.test.tsx` pasa todos sus casos (3 tests).
- [ ] AC6.6: `AdminActivities.test.tsx` pasa todos sus casos (7 tests).
- [ ] AC6.7: `AdminItineraries.test.tsx` pasa con los mocks actualizados y no verifica campo activities.

---

## Edge Cases

### Generales
- **Itinerario sin activities**: `Itinerary.activities` es `undefined`. La UI debe mostrar "No activities available yet." sin errores.
- **Activity sin duration**: `duration` es opcional. No mostrar nada en lugar de "undefined min".
- **Activity con duration = 0**: Si el backend envía `0`, mostrarlo como "0 min". Considerar si debería ocultarse. Decisión: Mostrar "0 min" tal cual. El backend no debería enviar 0, pero si lo hace, se muestra.
- **Navegación directa a `/itineraries/:id` sin state**: Mostrar pantalla de "Itinerario no encontrado" con enlace a la página anterior o a cities.
- **Caracteres especiales en nombres/descripciones**: El frontend debe renderizar sin escapar el contenido (React lo hace por defecto).
- **Imagen de actividad con URL inválida o rota**: Usar fallback visual (onError en img → mostrar placeholder) o simplemente dejar que se vea el alt text. El formulario de creación debería mostrar preview de la imagen al tipear la URL.
- **Eliminación de actividad con doble click**: El botón de eliminar debe deshabilitarse durante `isPending` para prevenir doble eliminación.
- **Creación de actividad con campos vacíos**: El formulario debe validar que name, description e image no estén vacíos antes de enviar. Si el backend rechaza, mostrar el error.
- **Selección de ciudad sin itinerarios**: El selector de itinerarios debe estar vacío/deshabilitado. Mostrar mensaje "No itineraries in this city".

### Admin Activities específicos
- **Preselección de itinerario desde "Manage Activities"**: Cuando `preselectedItineraryId` cambia, el componente debe seleccionarlo automáticamente en el dropdown de itinerarios y cargar sus actividades.
- **Itinerario preseleccionado pero de ciudad no seleccionada**: Si `preselectedItineraryId` viene con un id pero la ciudad no está cargada, el componente debe primero seleccionar la ciudad correcta (puede inferirla de los datos de itinerarios cargados).
- **Cambio de ciudad mientras hay actividades cargadas**: Al cambiar de ciudad, resetear la selección de itinerario y las actividades.
- **Cancelar creación/edición**: Debe volver a la tabla de actividades sin recargar datos.

### Itinerary Detail Page específicos
- **city es string (ID) vs objeto populado**: En `Itinerary.city`, puede ser un string (ID) o un objeto populado. El back link debe manejarlo: si es string, link a `/cities/${itinerary.city}`; si es objeto, link a `/cities/${itinerary.city._id}`.
- **Activities vacías desde el backend**: `itinerary.activities` puede ser `[]` o `undefined`. Ambos deben mostrar el mensaje de empty state.
- **Performance con muchas actividades**: Si un itinerario tiene 20+ actividades, el grid debe ser responsive y no romper el layout. Considerar scroll horizontal o grid CSS.

---

## Flujo de datos

### Crear actividad (end-to-end)

```
AdminActivities (form submit)
  → useCreateActivity.mutate({ itineraryId, data: { name, description, image, duration? } })
    → activitiesService.createActivity(itineraryId, data)
      → api.post('/itineraries/{itineraryId}/activities', data)
        → axios request interceptor: attacha Bearer token
        → fetch a POST http://localhost:8080/api/itineraries/{itineraryId}/activities
        ← response 201: { status, statusMsg, data: Activity }
        ← axios response interceptor: extrae response.data
      ← Activity
    → onSuccess:
      → queryClient.invalidateQueries(['itineraries', itineraryId, 'activities'])
      → queryClient.invalidateQueries(['itineraries'])
  ← UI: tabla de actividades refrescada, formulario cerrado
```

### Ver actividades en detail page

```
ItineraryCard (click)
  → navigate('/itineraries/{id}', { state: { itinerary } })
    → ItineraryDetailPage
      → location.state.itinerary.activities (directo, sin fetch)
      → Renderiza ActivitiesSection con ActivityCard por cada actividad
```

### Navegación "Manage Activities" en admin

```
AdminItineraries (click en "Manage Activities" de fila)
  → onManageActivities(itineraryId)
    → AdminDashboard: setSelectedActivityItineraryId(id), setActiveView('activities')
      → AdminActivities (recibe preselectedItineraryId)
        → Carga ciudades, carga itinerarios de primera ciudad
        → Preselecciona el itineraryId recibido
        → useItineraryActivities(itineraryId) → fetch de actividades
        → Renderiza tabla
```

---

## Dependencias

### Nuevos archivos a crear (8)

| # | Archivo | Propósito |
|---|---------|-----------|
| 1 | `src/features/itineraries/services/activities.services.ts` | Servicios CRUD de actividades |
| 2 | `src/features/itineraries/hooks/useItineraryActivities.ts` | Hook query de actividades |
| 3 | `src/features/itineraries/hooks/useCreateActivity.ts` | Hook mutation crear actividad |
| 4 | `src/features/itineraries/hooks/useUpdateActivity.ts` | Hook mutation actualizar actividad |
| 5 | `src/features/itineraries/hooks/useDeleteActivity.ts` | Hook mutation eliminar actividad |
| 6 | `src/pages/itineraries/ItineraryDetailPage.tsx` | Página de detalle de itinerario |
| 7 | `src/pages/profile/components/AdminActivities.tsx` | Componente admin de gestión de actividades |
| 8 | `specs/activities-structured.md` | Este documento |

### Nuevas carpetas a crear (1)

| # | Carpeta |
|---|---------|
| 1 | `src/pages/itineraries/` |

### Archivos a modificar (7)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/features/itineraries/types/itineraries.types.ts` | Agregar `Activity`, `CreateActivityData`; cambiar `activities` a `Activity[]`; eliminar de `CreateItineraryData` |
| 2 | `src/features/cities/cities.types.ts` | Corregir import typo |
| 3 | `src/features/itineraries/components/ItineraryCard.tsx` | Agregar click navigation y stopPropagation en wishlist |
| 4 | `src/app/routes/Router.tsx` | Agregar ruta `/itineraries/:id` con lazy loading |
| 5 | `src/pages/profile/components/AdminDashboard.tsx` | Agregar `'activities'` al tipo, ActivityIcon, nav item, estado de navegación, renderizar AdminActivities |
| 6 | `src/pages/profile/components/AdminItineraries.tsx` | Recibir `onManageActivities` prop, quitar campo activities del form, agregar botón "Manage Activities" |
| 7 | `src/pages/cities/CityDetailsPage.tsx` | **Sin cambios** (ya usa ItineraryCard, la navegación se agrega desde ItineraryCard) |

### Archivos de test a modificar (3)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/features/itineraries/services/__tests__/itineraries.services.test.ts` | Actualizar mocks |
| 2 | `src/features/itineraries/hooks/__tests__/useCreateItinerary.test.tsx` | Actualizar mocks |
| 3 | `src/pages/profile/components/__tests__/AdminItineraries.test.tsx` | Actualizar mocks, quitar test de campo activities |

### Archivos de test nuevos (5)

| # | Archivo |
|---|---------|
| 1 | `src/features/itineraries/services/__tests__/activities.services.test.ts` |
| 2 | `src/features/itineraries/hooks/__tests__/useCreateActivity.test.tsx` |
| 3 | `src/features/itineraries/hooks/__tests__/useUpdateActivity.test.tsx` |
| 4 | `src/features/itineraries/hooks/__tests__/useDeleteActivity.test.tsx` |
| 5 | `src/pages/profile/components/__tests__/AdminActivities.test.tsx` |

### Librerías nuevas

Ninguna. Todo el stack necesario ya está en `package.json` (React, TanStack Query, Axios, React Router, Vitest, Testing Library).

---

## API / Contratos relevantes

### Endpoints de backend consumidos

| Método | Ruta | Body | Respuesta exitosa |
|--------|------|------|-------------------|
| `GET` | `/api/itineraries/city/:city` | — | `ApiResponse<Itinerary[]>` (activities ahora es `Activity[]`) |
| `POST` | `/api/itineraries/city/:city` | `CreateItineraryData` (sin activities) | `ApiResponse<Itinerary>` |
| `PUT` | `/api/itineraries/:id` | `Partial<Itinerary>` (sin activities) | `ApiResponse<Itinerary>` |
| `GET` | `/api/cities/:id` | — | `ApiResponse<City>` (con itineraries populados, activities como `Activity[]`) |
| `GET` | `/api/itineraries/:id/activities` | — | `ApiResponse<Activity[]>` |
| `POST` | `/api/itineraries/:id/activities` | `CreateActivityData` | `ApiResponse<Activity>` |
| `PUT` | `/api/itineraries/:id/activities/:activityId` | `Partial<CreateActivityData>` | `ApiResponse<Activity>` |
| `DELETE` | `/api/itineraries/:id/activities/:activityId` | — | `ApiResponse<void>` |

### Tipos nuevos/actualizados

Ver Fase 1 para los tipos completos.

---

## Orden de implementación sugerido

1. **Fase 1**: Tipos base (Itinerary, Activity, CreateItineraryData, CreateActivityData)
2. **Fase 2**: Services (activities.services.ts) + tests del service
3. **Fase 3**: Hooks (useItineraryActivities, useCreateActivity, useUpdateActivity, useDeleteActivity) + tests de hooks
4. **Fase 4**: Itinerary Detail Page (actualizar ItineraryCard, crear página, actualizar Router)
5. **Fase 5**: Admin Activities (AdminActivities, AdminDashboard, AdminItineraries)
6. **Fase 6**: Tests restantes (AdminActivities.test.tsx, actualizar tests existentes)

Cada fase debe implementarse en orden, con TDD: escribir el test primero (red), luego implementar (green), luego refactorizar si es necesario.
