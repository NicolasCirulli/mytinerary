# Creación de Itinerarios desde el Panel Admin

## Descripción

Feature que permite a los administradores crear nuevos itinerarios turísticos directamente desde el panel de administración. Anteriormente solo era posible editar itinerarios existentes.

---

## Cómo acceder

1. Iniciar sesión con una cuenta con rol de administración.
2. Navegar a la ruta `/admin` (panel de administración).
3. Seleccionar la sección **Itineraries** en la navegación del panel.
4. En la vista de lista de itinerarios, hacer clic en el botón **"Create New Itinerary"** (esquina superior derecha, junto al filtro de ciudades).

---

## Campos del formulario y validaciones

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| **City** | Selector desplegable | Sí (si no hay ciudad seleccionada previamente en el filtro) | Debe seleccionar una ciudad existente |
| **Title** | Texto | Sí | 3–20 caracteres (validación backend Joi) |
| **Guide** | Texto | Sí | 3–20 caracteres (validación backend Joi) |
| **Description** | Textarea | Sí | 30–500 caracteres (validación backend Joi) |
| **Price** | Número (1–5) | Sí | Valor entre 1 y 5. Se muestra como nivel económico en la tabla |
| **Duration** | Número (1–8) | Sí | Horas. Valor entre 1 y 8 |
| **Guide Image** | Texto (URI) | Sí | Debe ser una URL válida (validación backend Joi) |
| **Hashtags** | Texto (separado por comas) | No | Se convierten automáticamente en un array de strings |
| **Activities** | Texto (separado por comas) | No | Se convierten en un array de strings |

> **Nota:** Las validaciones se aplican tanto en frontend (client-side para campos requeridos como Title y Guide) como en backend (Joi).

---

## Flujo de creación paso a paso

1. **Seleccionar ciudad** (opcional): En la vista de lista, seleccionar una ciudad del filtro desplegable. Si ya hay una ciudad seleccionada, el formulario de creación la usará automáticamente.

2. **Abrir formulario**: Hacer clic en **"Create New Itinerary"**. El panel cambia al modo creación mostrando un breadcrumb con la ruta `Itineraries › Create Itinerary`.

3. **Completar campos**: Llenar los campos del formulario. Si no se seleccionó una ciudad previamente, aparecerá un selector de ciudad adicional dentro del formulario.

4. **Enviar**: Hacer clic en **"Create Itinerary"**. El botón muestra el texto `Creating...` y se deshabilita durante el envío para evitar duplicados.

5. **Éxito**: Si la creación es exitosa:
   - Se muestra un mensaje verde de éxito con el texto *"Itinerary created successfully!"*.
   - El formulario se cierra automáticamente y se retorna a la vista de lista.
   - La caché de itinerarios se invalida para que los datos nuevos aparezcan inmediatamente.
   - El mensaje de éxito desaparece después de 3 segundos.

---

## Manejo de errores

| Situación | Comportamiento |
|-----------|---------------|
| **Campos requeridos vacíos** (Title, Guide) | Validación client-side: muestra mensaje *"Title and Guide are required."* en un banner rojo |
| **Error del backend (400)** | Muestra el `statusMsg` devuelto por la API (ej: *"Validation failed: title is required"*) |
| **Ciudad no encontrada (404)** | Muestra el mensaje de error del backend |
| **Error de red / servidor (500)** | Muestra *"Failed to create itinerary."* como fallback |
| **Doble envío** | El botón de submit se deshabilita (`disabled`) mientras `isCreating` es `true` |
| **Limpieza de timers** | El `setTimeout` del mensaje de éxito se limpia en el cleanup del `useEffect` al desmontar el componente |

---

## Estructura de archivos involucrados

```
src/
├── features/itineraries/
│   ├── types/itineraries.types.ts          # Interfaz CreateItineraryData
│   ├── services/itineraries.services.ts    # Método createItinerary(cityId, data)
│   ├── hooks/useCreateItinerary.ts         # Hook useMutation con invalidación
│   ├── hooks/__tests__/useCreateItinerary.test.tsx
│   └── services/__tests__/itineraries.services.test.ts
└── pages/profile/components/
    ├── AdminItineraries.tsx                # Formulario de creación + lógica
    └── __tests__/AdminItineraries.test.tsx
```

---

## API

**Endpoint:** `POST /api/itineraries/city/:cityId`

**Body:**
```json
{
  "title": "string (3-20 chars)",
  "price": "number (1-5)",
  "guide": "string (3-20 chars)",
  "duration": "number (1-8)",
  "guide_image": "string (URI)",
  "description": "string (30-500 chars)",
  "hashtags": ["string"] (opcional),
  "activities": ["string"] (opcional)
}
```

**Response (201):** `{ status: 201, statusMsg: "created", data: Itinerary }`

---

## Tests

Se agregaron 10 tests nuevos (total: 86 tests):

- **Servicio** (3 tests): POST exitoso (201), error 404, error 400
- **Hook** (3 tests): llama al servicio, invalida queries en éxito, no invalida en error
- **Componente** (4 tests): botón visible en lista, formulario tras click, campos requeridos presentes, submit exitoso con retorno a lista

Para ejecutarlos:
```bash
npx vitest run
```
