# Spec: Integración de Autenticación (Login + Register + Sesión)

## Objetivo

Reemplazar el mock de `useLogin.ts` con llamadas reales a la API REST en `http://localhost:8080/api/auth/*`, agregar el flujo completo de registro (`/register`), y establecer un manejo de sesión global que persista el usuario autenticado en el frontend. El token JWT se almacena en `localStorage` y se attacha automáticamente vía el interceptor de axios. Los errores del backend (statusMsg) deben mostrarse en los formularios.

---

## Contratos / Interfaces

### 1. Tipos compartidos (TypeScript)

Crear archivo: `src/features/auth/types/auth.types.ts`

```typescript
// --- Requests ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country: string;
  description?: string;
  image?: string;
}

// --- Responses ---

export interface AuthUser {
  _id: string;
  first_name: string;
  last_name: string;
  image: string;
  email: string;
  country: string;
  whishlist: string[]; // Array de ObjectId como strings
  token?: string;
}

export interface AuthSuccessResponse {
  status: number;
  statusMsg: string;
  data: AuthUser;
}

export interface AuthErrorResponse {
  error: true;
  status: number;
  statusMsg: string;
}

// El interceptor de axios ya extrae response.data,
// así que el tipo que llega al service es AuthSuccessResponse o AuthErrorResponse.

// --- Sesión ---

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### 2. Servicios API

Crear archivo: `src/features/auth/services/auth.services.ts`

```typescript
import api from '@shared/api/api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthSuccessResponse,
  AuthUser,
} from '../types/auth.types';

export const authService = {
  login(data: LoginRequest): Promise<AuthUser>,
    // Llama POST /api/auth/login
    // Retorna data (AuthUser con token). Si hay error (401), lanza error con statusMsg.

  register(data: RegisterRequest): Promise<AuthUser>,
    // Llama POST /api/auth/register
    // Retorna data (AuthUser con token). Si hay error (400/409), lanza error con statusMsg.

  verifyToken(): Promise<AuthUser>,
    // Llama POST /api/auth/token (el interceptor attacha Bearer token)
    // Retorna data (AuthUser sin token nuevo). Si 401, lanza error.
};
```

**Reglas del service**:
- Todas las funciones deben ser funciones async que usen `api` (el axios instance configurado).
- El interceptor de axios ya extrae `response.data` exitosamente, así que el service recibe `AuthSuccessResponse`.
- Si la respuesta es exitosa, se retorna `response.data` (el AuthUser).
- Si hay error (el interceptor rechaza con el error completo de axios), el service debe extraer `error.response.data.statusMsg` o tener un fallback genérico, y **re-lanzar el error con esa propiedad** para que los hooks puedan mostrarla en el formulario.

**Forma recomendada**:
```typescript
// Dentro de cada función del service:
try {
  const response = await api.post<AuthSuccessResponse>(...)
  return response.data  // AuthUser
} catch (error) {
  // error.response?.data tiene la forma AuthErrorResponse
  throw error  // El hook procesará statusMsg
}
```

### 3. Hook `useLogin` (refactorizado)

Archivo: `src/features/auth/hooks/useLogin.ts`

**Estado local**:
- `email: string`
- `password: string`
- `showPassword: boolean`
- `rememberMe: boolean`
- `isLoading: boolean`
- `error: string | null` — mensaje de error visible en el formulario

**Comportamiento**:
- `handleLogin(e)`:
  1. `e.preventDefault()`
  2. Si `error` no es null, limpiarlo (`setError(null)`)
  3. `setIsLoading(true)`
  4. Llamar `authService.login({ email, password })`
  5. En éxito: guardar `token` en `localStorage.setItem('token', user.token)` y llamar `login(user)` del `useAuthSessionContext` (sesión global). El hook NO redirige directamente; el contexto de sesión se encargará.
  6. En error: capturar `error.response?.data?.statusMsg ?? 'Login failed'` y asignarlo a `setError`
  7. `finally`: `setIsLoading(false)`
- `handleGoogleLogin` / `handleFacebookLogin`: por ahora mantienen el `console.log` (social login no está en scope).

**Retorno**:
```typescript
return {
  email, setEmail,
  password, setPassword,
  showPassword,
  rememberMe,
  isLoading,
  error,
  togglePasswordVisibility,
  toggleRememberMe,
  handleLogin,
  handleGoogleLogin,
  handleFacebookLogin,
};
```

### 4. Hook `useRegister` (nuevo)

Archivo: `src/features/auth/hooks/useRegister.ts`

**Estado local**:
- `firstName: string`
- `lastName: string`
- `email: string`
- `password: string`
- `confirmPassword: string`
- `country: string`
- `description: string` (opcional, puede ser string vacío)
- `image: string` (opcional, puede ser string vacío — URL de foto)
- `showPassword: boolean`
- `showConfirmPassword: boolean`
- `isLoading: boolean`
- `error: string | null`
- `fieldErrors: Record<string, string>` — errores por campo (si el backend devuelve validación por campo, se mapea aquí)

**Validación local** (antes de llamar a la API):
- `confirmPassword` debe coincidir con `password`. Si no, setear `error = "Passwords do not match"` y no llamar a la API.
- `firstName`, `lastName`, `email`, `password`, `country` son requeridos (el formulario usa `required` en HTML, pero se valida también en JS).

**Comportamiento**:
- `handleRegister(e)`:
  1. `e.preventDefault()`
  2. Validaciones locales. Si fallan, retornar sin llamar API.
  3. `setIsLoading(true)`, limpiar `error` y `fieldErrors`
  4. Llamar `authService.register({ first_name, last_name, email, password, country, description, image })`
  5. En éxito: guardar token en localStorage, llamar `login(user)` del contexto de sesión global.
  6. En error: si `error.response?.status === 409`, mostrar `"Email is already in use"`. Si es 400, mapear `error.response?.data?.errors` a `fieldErrors` (según estructura real de validación del backend). Fallback: `error.response?.data?.statusMsg ?? 'Registration failed'`.
  7. `finally`: `setIsLoading(false)`

**Retorno**:
```typescript
return {
  firstName, setFirstName,
  lastName, setLastName,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  country, setCountry,
  description, setDescription,
  image, setImage,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  isLoading,
  error,
  fieldErrors,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  handleRegister,
};
```

### 5. Contexto de Sesión Global (`useAuthSession`)

Crear: `src/features/auth/context/AuthSessionContext.tsx`

**Propósito**: Mantener el usuario autenticado en memoria para toda la app. Al cargar, intentar verificar si hay un token en localStorage y si es válido contra `POST /api/auth/token`.

**Interfaz**:
```typescript
interface AuthSessionContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;        // true mientras se verifica el token al cargar
  login: (user: AuthUser) => void;   // setea user y guarda token
  logout: () => void;                // limpia user y token de localStorage, redirige a /login
}
```

**Flujo de carga inicial**:
1. Al montar el `AuthSessionProvider`, leer `localStorage.getItem('token')`.
2. Si hay token: llamar `authService.verifyToken()`. Si éxito: `login(user)`. Si error: `localStorage.removeItem('token')`.
3. `isLoading` se setea `false` al terminar.

**Provider**:
- Debe envolver a la app en `main.tsx` (o en `App.tsx`).
- Usar `useState` para `user` y `isLoading`.
- `login(user)`: setea `user`, `localStorage.setItem('token', user.token!)` (si el token viene en la respuesta).
- `logout()`: `localStorage.removeItem('token')`, `setUser(null)`, redirigir a `'/login'` usando `useNavigate` de react-router.
- **Importante**: no redirigir en el provider directamente si no hay navigate disponible. En su lugar, `logout` puede lanzar un evento o se puede usar un helper en el hook.

**Archivo extra**: `src/features/auth/hooks/useAuthSession.ts`
```typescript
export const useAuthSession = (): AuthSessionContextValue => {
  const context = useContext(AuthSessionContext);
  if (!context) throw new Error('useAuthSession debe usarse dentro de AuthSessionProvider');
  return context;
};
```

### 6. Componente `RegisterForm`

Archivo: `src/features/auth/components/RegisterForm.tsx`

**Estructura del formulario**:

| Campo | Tipo | Requerido | Placeholder |
|-------|------|-----------|-------------|
| First Name | text | sí | "John" |
| Last Name | text | sí | "Doe" |
| Email | email | sí | "john@example.com" |
| Password | password | sí | "••••••••" |
| Confirm Password | password | sí | "••••••••" |
| Country | select (dropdown de países) | sí | "Select your country" |
| Description | textarea | no | "Tell us about yourself..." |
| Image URL | url | no | "https://example.com/photo.jpg" |

**Estados visuales**:
- `error !== null`: mostrar un `Alert` (div con bg rojo suave y borde rojo) arriba del botón submit con el texto de `error`. El `Alert` tiene un botón de cerrar que lo oculta (setError(null)).
- `fieldErrors['fieldName']`: mostrar texto en rojo debajo del input correspondiente.
- `isLoading`: botón submit deshabilitado con texto "Creating account..." y spinner.
- Satisfactorio: no hay feedback visual en el formulario (la redirección ocurre al guardar sesión).

**Botones sociales**:
- "Sign up with Google" y "Sign up with Facebook" con `console.log` por ahora.

**Link a login**:
- Texto: "Already have an account? Sign in" → Link a `/login`.

**Estilo**: debe ser consistente con `LoginForm` (mismo max-w-md, bg-card, border-border, inputs con iconos left, etc.).

### 7. Página `RegisterPage`

Archivo: `src/pages/register/RegisterPage.tsx`

**Estructura** (similar a `LoginPage.tsx`):
```tsx
const RegisterPage = () => (
  <>
    <SEO title="Create Account" description="..." canonical="/register" />
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <RegisterForm />
    </div>
  </>
);
export default RegisterPage;
```

### 8. Ruta `/register` en el Router

Archivo: `src/app/routes/Router.tsx`

Agregar:
```typescript
const RegisterPage = lazy(() => import('@pages/register/RegisterPage'));
```
Y en el array de children:
```typescript
{ path: "/register", element: <RegisterPage /> },
```

### 9. Interceptor de axios mejorado

Archivo: `src/shared/api/api.ts`

**Cambios**:
- En el interceptor de respuesta (error 401), además de `localStorage.removeItem('token')`, redirigir al usuario a `/login` usando `window.location.href = '/login'`.

**Justificación**: Puesto que el interceptor está fuera del árbol de React (no tiene acceso a `useNavigate` ni al contexto de sesión), `window.location.href` es la solución pragmática para redirigir en un 401. Esto fuerza una recarga completa, lo cual es aceptable para un caso de expiración de sesión.

- Mejorar el mensaje de log: `console.warn('[API] Unauthorized - redirecting to login')`.

### 10. Manejo de errores en formularios

**Flujo**:
1. El hook llama al service.
2. El service lanza el error de axios (con `error.response?.data`).
3. El hook captura y extrae `error.response?.data?.statusMsg ?? 'Something went wrong'`.
4. El hook setea `error` en su estado.
5. El componente `LoginForm` / `RegisterForm` renderiza el error en un `Alert` condicional.

**Estructura del Alert**:
```tsx
{error && (
  <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
    <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
    <span className="flex-1">{error}</span>
    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
      <XIcon className="h-4 w-4" />
    </button>
  </div>
)}
```

---

## Acceptance Criteria

- [ ] AC1: `useLogin` llama a `POST /api/auth/login` con email y password. En éxito (200), guarda el token en localStorage y setea el usuario en el contexto de sesión global.
- [ ] AC2: Si login falla con 401, el hook setea `error` con el texto `"Email or password is incorrect"` (desde `statusMsg` del backend) y lo muestra en el formulario.
- [ ] AC3: `useRegister` envía `POST /api/auth/register` con todos los campos requeridos. En éxito (201), guarda el token en localStorage y setea el usuario en el contexto de sesión global.
- [ ] AC4: Si register falla con 409, el formulario muestra `"Email is already in use"` en el Alert de error.
- [ ] AC5: Si register falla con 400 (validación), se muestran los errores por campo debajo de cada input.
- [ ] AC6: `RegisterForm` tiene todos los campos (first_name, last_name, email, password, confirm_password, country, description opcional, image opcional) y validación local de confirmación de password.
- [ ] AC7: La ruta `/register` existe en el Router, carga `RegisterPage` con lazy loading, y es accesible desde Header y Footer.
- [ ] AC8: Al cargar la app con un token válido en localStorage, `AuthSessionProvider` verifica el token contra `POST /api/auth/token` y setea el usuario autenticado (sin redirigir a login).
- [ ] AC9: Al cargar la app con un token inválido/expirado (401 de verifyToken), se limpia el token de localStorage y se muestra la pantalla de login.
- [ ] AC10: El interceptor de axios redirige a `/login` (via `window.location.href`) cuando recibe un 401 en cualquier request.
- [ ] AC11: `LoginForm` y `RegisterForm` tienen diseño visual consistente entre sí y usan los mismos tokens de Tailwind (bg-card, border-border, etc.).
- [ ] AC12: El hook `useAuthSession` expone `user`, `isAuthenticated`, `isLoading`, `login`, `logout`.

---

## Edge Cases

- **Token expirado durante uso activo**: Cualquier request que retorne 301/401 debe limpiar el token y redirigir a `/login`, forzando al usuario a re-autenticarse. No hay refresh token.
- **Registro con email duplicado**: El backend retorna 409 con `statusMsg: "Email is already in use"`. El frontend debe mostrar ese mensaje exacto en el Alert de error del formulario de registro.
- **Registro con contraseñas que no coinciden**: Validación local en el hook `useRegister`. No se debe llamar a la API si `password !== confirmPassword`.
- **Carga inicial con token pero sin usuario**: El `AuthSessionProvider` debe setear `isLoading = true` inicialmente para que la app no renderice contenido protegido asumiendo que no hay sesión. Las rutas que requieran autenticación (a futuro) deben esperar a `isLoading = false`.
- **Redirección 401 fuera del contexto de React**: El interceptor usa `window.location.href` porque no tiene acceso a React Router.
- **Dobles submits**: El botón submit se deshabilita durante `isLoading = true` para prevenir envíos duplicados.
- **Caracteres especiales en campos**: El backend debe validar, el frontend envía sin sanitización adicional (confía en la validación del servidor).
- **Country sin selección**: El formulario debe tener un option por defecto deshabilitado tipo `"Select your country"` y HTML validation (`required`) lo cubre.
- **Imagen URL vacía**: Si `image` es string vacío, no se envía el campo en el request (o se envía como string vacío; el backend debe manejarlo).

---

## Flujo de datos

### Login
```
LoginForm (submit)
  → useLogin.handleLogin(e)
    → authService.login({ email, password })
      → api.post('/auth/login', { email, password })
        → axios request interceptor: attacha token (si existe, en login no existe)
        → fetch a POST http://localhost:8080/api/auth/login
        ← response 200: { status, statusMsg, data: AuthUser }
        ← axios response interceptor: extrae response.data
      ← AuthUser (con token)
    → localStorage.setItem('token', user.token)
    → useContext(AuthSessionContext).login(user)
      → setUser(user)
    → (opcional futura redirección a / si el LoginForm la manejara)
  ← UI actualizada: sesión activa, usuario en header
```

### Register
```
RegisterForm (submit)
  → useRegister.handleRegister(e)
    → validación local: password === confirmPassword
    → authService.register({ first_name, last_name, email, password, country, description?, image? })
      → api.post('/auth/register', data)
        → fetch a POST http://localhost:8080/api/auth/register
        ← response 201: { status, statusMsg, data: AuthUser }
      ← AuthUser (con token)
    → localStorage.setItem('token', user.token)
    → useContext(AuthSessionContext).login(user)
  ← UI actualizada: sesión activa
```

### Verificación de sesión al cargar la app
```
App.tsx (mount)
  → AuthSessionProvider (mount)
    → isLoading = true
    → leer localStorage.getItem('token')
    → si token existe:
      → authService.verifyToken()
        → api.post('/auth/token')
          → axios request interceptor: attacha Bearer token
          → fetch a POST http://localhost:8080/api/auth/token
          ← response 200: { status, statusMsg, data: AuthUser }
          ← AuthUser (sin token nuevo)
        → setUser(AuthUser)
      → si error (401):
        → localStorage.removeItem('token')
    → isLoading = false
```

### 401 en cualquier request
```
api.interceptors.response.use (error handler)
  → error.response.status === 401
    → localStorage.removeItem('token')
    → console.warn('[API] Unauthorized - redirecting to login')
    → window.location.href = '/login'
  → reject error
```

---

## Dependencias

- **Nuevas librerías**: Ninguna. `axios`, `react-router`, `react-helmet-async` ya están en `package.json`.
- **Nuevos archivos a crear** (9 archivos):
  1. `src/features/auth/types/auth.types.ts` — tipos compartidos
  2. `src/features/auth/services/auth.services.ts` — servicios API
  3. `src/features/auth/context/AuthSessionContext.tsx` — contexto de sesión
  4. `src/features/auth/hooks/useAuthSession.ts` — hook del contexto
  5. `src/features/auth/hooks/useRegister.ts` — hook de registro
  6. `src/features/auth/components/RegisterForm.tsx` — formulario de registro
  7. `src/pages/register/RegisterPage.tsx` — página de registro
  8. `src/pages/register/` — carpeta nueva

- **Archivos a modificar** (5 archivos):
  1. `src/features/auth/hooks/useLogin.ts` — refactorizar el mock
  2. `src/features/auth/components/LoginForm.tsx` — agregar renderizado de `error` (Alert)
  3. `src/shared/api/api.ts` — mejorar redirect 401
  4. `src/app/routes/Router.tsx` — agregar ruta `/register`
  5. `src/main.tsx` — envolver App con `AuthSessionProvider` (o en `App.tsx`)

- **Nuevas carpetas**: `src/pages/register/`, `src/features/auth/types/`, `src/features/auth/services/`, `src/features/auth/context/`

---

## Notas de implementación

1. **Orden de implementación sugerido**:
   1. Tipos (`auth.types.ts`)
   2. Servicios API (`auth.services.ts`)
   3. Contexto de sesión (`AuthSessionContext.tsx` + `useAuthSession.ts`)
   4. Refactor `useLogin.ts` + `api.ts` interceptor
   5. `useRegister.ts`
   6. `RegisterForm.tsx`
   7. `RegisterPage.tsx`
   8. Actualizar Router
   9. Envolver app con `AuthSessionProvider` en `main.tsx`
   10. Agregar Alert de error a `LoginForm.tsx`

2. **`main.tsx`** debería verse así después del cambio:
   ```tsx
   import { AuthSessionProvider } from '@features/auth/context/AuthSessionContext';
   
   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <AuthSessionProvider>
         <App />
       </AuthSessionProvider>
     </StrictMode>
   );
   ```

3. **Tipado estricto**: El proyecto tiene `strict: true`, `noUnusedLocals: true`, `verbatimModuleSyntax: true`. Asegurarse de usar `import type` para solo tipos y exportar/importar correctamente.

4. **`AuthSessionContext` no debe redirigir imperativamente** en la verificación inicial. Solo debe exponer `logout()` que redirige. La redirección inicial (cuando no hay sesión) se maneja por ruta (ruta pública vs protegida, a futuro).

5. **Los iconos del Alert** (`AlertCircleIcon`, `XIcon`) deben existir en `src/shared/icons/` o crearse inline como SVG simples. Si no existen, usar emojis o SVGs inline.
