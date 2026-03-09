# PROMPT MAESTRO — N'GAGE APP
## Para usar en Claude Code (pegar completo al inicio del proyecto)

---

## 🎯 CONTEXTO DEL PROYECTO

Construye **N'GAGE**, una aplicación web de dating/conexión social por evento — efímera, mobile-first, y diseñada para que personas solteras en un mismo evento (bodas, XV años, conciertos, graduaciones, eventos corporativos, cruceros, etc.) puedan conectar entre sí de forma divertida, segura y temporal.

La diferencia clave vs. otras apps de citas: **todo sucede dentro del contexto de un evento específico, con un tiempo limitado, y los perfiles y contenido tienen caducidad configurada**. No es una app de citas permanente — es un "happening" social.

---

## 🏗️ STACK TECNOLÓGICO (obligatorio, no cambiar)

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 14** (App Router, TypeScript) |
| Base de datos | **Supabase** (PostgreSQL + Auth + Realtime + Storage) |
| ORM | **Prisma** (sobre la DB de Supabase) |
| Autenticación | **Supabase Auth** (email/password + Google OAuth) |
| Realtime | **Supabase Realtime** (likes, matches, chat en vivo) |
| Almacenamiento de fotos | **Cloudinary** (upload, transformación, optimización) |
| Hosting | **Railway** (deployment del backend y frontend) |
| Estilos | **Tailwind CSS** + **shadcn/ui** |
| Notificaciones push in-app | **Supabase Realtime** |
| Webhooks salientes | Endpoints REST propios con firma HMAC |
| Email transaccional | **Resend** |
| QR Generation | Librería `qrcode` (Node.js) |
| Animaciones | **Framer Motion** |
| Iconos | **Lucide React** |

---

## 👥 ROLES Y PERMISOS DEL SISTEMA

Define exactamente 4 roles en la base de datos y middleware:

### 1. `SUPER_ADMIN`
- Nosotros (los dueños de la plataforma N'GAGE)
- Acceso total: ver todos los eventos, todos los usuarios, todas las fotos, todos los matches
- Puede crear/suspender/eliminar cualquier cuenta u evento
- Dashboard de métricas globales
- Gestión de webhooks y API keys globales
- Puede impersonar cualquier rol para soporte

### 2. `EVENT_ORGANIZER`
- La empresa/persona que contrató el servicio N'GAGE para su evento
- Puede crear y configurar eventos
- Puede precargar base de datos de invitados (CSV/Excel upload)
- Puede ver métricas de su evento: cuántos se registraron, matches generados, fotos tomadas
- Puede configurar parámetros del evento (duración del timer, caducidad del contenido)
- Puede generar QR y links personalizados por evento
- Puede exportar el álbum completo del evento
- No puede ver chats privados entre usuarios

### 3. `EVENT_HOST` (Perfil Madre — máximo 3 por evento)
- Los protagonistas del evento (ej. novios en una boda, quinceañera, etc.)
- Asignados por el `EVENT_ORGANIZER` al crear el evento
- Pueden ver TODAS las fotos del álbum al día siguiente del evento
- Pueden ver TODOS los matches generados en su evento (solo quién hizo match con quién, no el contenido del chat)
- Pueden descargar el álbum completo
- No pueden ver chats privados
- Tienen una vista especial y personalizada de "su evento"

### 4. `GUEST` (Usuario invitado)
- Cualquier persona que escanea el QR o accede al link del evento
- Se registra en el evento específico
- Puede participar en el swipe, recibir likes, hacer matches
- Puede tomar hasta 10 fotos durante el evento (solo desde cámara, no galería)
- Puede ver su álbum al día siguiente
- Puede chatear con sus matches
- Sus datos y contenido tienen la caducidad configurada por el organizador
- Puede tener perfil persistente en N'GAGE que acumule eventos asistidos

---

## 🗄️ ESQUEMA DE BASE DE DATOS (Supabase/PostgreSQL)

Crea las siguientes tablas con sus relaciones:

```sql
-- Usuarios base
users
  id UUID PRIMARY KEY
  email VARCHAR UNIQUE NOT NULL
  phone VARCHAR
  full_name VARCHAR NOT NULL
  avatar_url VARCHAR (foto de perfil/selfie)
  role ENUM('SUPER_ADMIN', 'EVENT_ORGANIZER', 'EVENT_HOST', 'GUEST')
  google_id VARCHAR UNIQUE
  is_active BOOLEAN DEFAULT true
  created_at TIMESTAMP
  updated_at TIMESTAMP
  deleted_at TIMESTAMP (soft delete)

-- Perfil público del usuario (visible a otros guests del evento)
user_profiles
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id)
  age INTEGER
  relation_type ENUM('friend_bride', 'friend_groom', 'family_bride', 'family_groom', 'coworker', 'other')
  interests JSONB -- Array de gustos: deportes, mascotas, música, etc.
  bio VARCHAR(160) -- Opcional, máximo 160 chars
  created_at TIMESTAMP
  updated_at TIMESTAMP

-- Eventos
events
  id UUID PRIMARY KEY
  organizer_id UUID REFERENCES users(id)
  name VARCHAR NOT NULL (ej. "Boda María & Carlos")
  type ENUM('wedding', 'birthday', 'corporate', 'graduation', 'concert', 'cruise', 'other')
  event_date DATE NOT NULL
  venue_name VARCHAR
  venue_city VARCHAR
  cover_image_url VARCHAR
  status ENUM('draft', 'active', 'closed', 'expired')
  
  -- Configuración del timer de búsqueda
  search_duration_minutes INTEGER DEFAULT 60 -- El organizador configura esto
  search_start_time TIMESTAMP -- Cuándo empezó el cronómetro (cuando alguien lo activa)
  search_end_time TIMESTAMP -- search_start_time + duration
  
  -- Configuración de caducidad
  expiry_type ENUM('next_day', 'custom_days', 'never') DEFAULT 'custom_days'
  expiry_days INTEGER DEFAULT 3 -- Días después del evento que el contenido es visible
  expiry_at TIMESTAMP -- Calculado: event_date + expiry_days (o null si 'never')
  
  -- Album: cuándo se liberan las fotos
  album_release_at TIMESTAMP -- Calculado: event_date + 1 day (00:00 del día siguiente)
  
  -- QR y acceso
  qr_code_url VARCHAR -- URL de la imagen del QR generado
  unique_slug VARCHAR UNIQUE NOT NULL -- Para la URL: ngage.app/e/[slug]
  
  max_guests INTEGER -- Opcional, límite de registros
  created_at TIMESTAMP
  updated_at TIMESTAMP

-- Admins del evento (Event Hosts / Perfil Madre) - máximo 3 por evento
event_hosts
  id UUID PRIMARY KEY
  event_id UUID REFERENCES events(id)
  user_id UUID REFERENCES users(id)
  label VARCHAR (ej. "Novia", "Novio", "Organizador")
  created_at TIMESTAMP
  UNIQUE(event_id, user_id)

-- Registro de guests en eventos
event_registrations
  id UUID PRIMARY KEY
  event_id UUID REFERENCES events(id)
  user_id UUID REFERENCES users(id)
  
  -- Info específica del evento
  selfie_url VARCHAR NOT NULL -- Foto tomada el día del evento
  table_number VARCHAR -- Opcional
  relation_type ENUM(mismo que user_profiles) -- Relación con el evento
  interests JSONB -- Gustos seleccionados para este evento
  
  -- Timer personal
  search_started_at TIMESTAMP -- Cuándo presionó "Iniciar búsqueda"
  search_expires_at TIMESTAMP -- search_started_at + event.search_duration_minutes
  
  -- Estado
  is_visible BOOLEAN DEFAULT true -- Si su perfil aparece en el swipe
  photos_taken INTEGER DEFAULT 0 -- Contador de fotos tomadas (máx 10)
  super_like_used BOOLEAN DEFAULT false -- Solo 1 por evento
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
  UNIQUE(event_id, user_id)

-- Sistema de likes (swipe)
event_likes
  id UUID PRIMARY KEY
  event_id UUID REFERENCES events(id)
  from_user_id UUID REFERENCES users(id)
  to_user_id UUID REFERENCES users(id)
  type ENUM('like', 'dislike', 'super_like')
  created_at TIMESTAMP
  UNIQUE(event_id, from_user_id, to_user_id)

-- Matches (cuando hay like mutuo o un host los conecta)
event_matches
  id UUID PRIMARY KEY
  event_id UUID REFERENCES events(id)
  user_a_id UUID REFERENCES users(id)
  user_b_id UUID REFERENCES users(id)
  matched_at TIMESTAMP
  initiated_by UUID REFERENCES users(id) -- Quién inició el match
  UNIQUE(event_id, user_a_id, user_b_id)

-- Chat entre matches
match_messages
  id UUID PRIMARY KEY
  match_id UUID REFERENCES event_matches(id)
  sender_id UUID REFERENCES users(id)
  content TEXT NOT NULL
  read_at TIMESTAMP
  created_at TIMESTAMP

-- Fotos del álbum del evento
event_photos
  id UUID PRIMARY KEY
  event_id UUID REFERENCES events(id)
  user_id UUID REFERENCES users(id)
  cloudinary_public_id VARCHAR NOT NULL
  cloudinary_url VARCHAR NOT NULL
  thumbnail_url VARCHAR
  taken_at TIMESTAMP NOT NULL -- Cuándo fue tomada
  is_visible BOOLEAN DEFAULT false -- Se vuelve true en album_release_at
  created_at TIMESTAMP

-- Webhooks configurados (por organizador o super_admin)
webhooks
  id UUID PRIMARY KEY
  owner_id UUID REFERENCES users(id)
  event_id UUID REFERENCES events(id) -- Null = webhook global del organizador
  url VARCHAR NOT NULL
  secret VARCHAR NOT NULL -- Para firma HMAC
  events TEXT[] -- Array de eventos que disparan: ['match.created', 'like.received', 'photo.taken', etc.]
  is_active BOOLEAN DEFAULT true
  created_at TIMESTAMP

-- API Keys para integraciones externas
api_keys
  id UUID PRIMARY KEY
  owner_id UUID REFERENCES users(id)
  name VARCHAR
  key_hash VARCHAR NOT NULL -- Hash de la API key real
  scopes TEXT[] -- Permisos: ['events:read', 'guests:write', etc.]
  last_used_at TIMESTAMP
  expires_at TIMESTAMP
  is_active BOOLEAN DEFAULT true
  created_at TIMESTAMP

-- Log de webhooks enviados (para debugging)
webhook_logs
  id UUID PRIMARY KEY
  webhook_id UUID REFERENCES webhooks(id)
  event_type VARCHAR
  payload JSONB
  response_status INTEGER
  response_body TEXT
  sent_at TIMESTAMP
  success BOOLEAN

-- Catálogo de intereses (para el cuestionario de registro)
interest_categories
  id UUID PRIMARY KEY
  slug VARCHAR UNIQUE
  label VARCHAR
  emoji VARCHAR
  order INTEGER

interest_options
  id UUID PRIMARY KEY
  category_id UUID REFERENCES interest_categories(id)
  slug VARCHAR UNIQUE
  label VARCHAR
  emoji VARCHAR
```

---

## 🔄 FLUJOS DE USUARIO (implementar completos)

### FLUJO 1: Registro en evento vía QR / Link

1. Usuario escanea QR físico o accede a `ngage.app/e/[slug]`
2. Landing page del evento (nombre, cover image, fecha, venue)
3. Si el usuario ya tiene cuenta N'GAGE → login y continúa al paso 6
4. Si no → registro con:
   - Nombre completo
   - Email
   - Número de teléfono (WhatsApp)
   - O botón "Continuar con Google"
5. Verificación por email (link mágico de Supabase)
6. Formulario de registro al evento específico:
   - **Selfie obligatoria** (activar cámara del dispositivo, no galería)
   - Número de mesa (opcional, input de texto libre)
   - Relación con el evento: `friend_bride | friend_groom | family_bride | family_groom | coworker | other`
   - Cuestionario de intereses (máximo 3 pasos, diseño de tarjetas visuales):
     - **Paso 1 — Estilo de vida**: Deportes, Mascotas, Viajes, Lectura, Gastronomía, Arte
     - **Paso 2 — Entretenimiento**: Música (Rock, Pop, Electrónica, Regional, Jazz), Películas, Series, Videojuegos
     - **Paso 3 — Social**: Me gusta bailar, Prefiero platicar, Me gusta el aire libre, Soy de plan tranquilo
   - Campo de bebida favorita (select: Vino, Cerveza, Cocteles, No bebo, Otro)
7. Al completar → pantalla de bienvenida con botón grande **"INICIAR BÚSQUEDA"**

### FLUJO 2: Sesión de búsqueda (Swipe Mode)

1. Al presionar "INICIAR BÚSQUEDA":
   - Se guarda `search_started_at` y `search_expires_at` en `event_registrations`
   - Empieza cronómetro visible en la pantalla (regresivo)
2. Vista principal: tarjetas de perfil con swipe (estilo Tinder):
   - Foto selfie del día
   - Nombre y edad
   - Relación con el evento (ej. "Amiga de la novia")
   - Mesa (si la puso)
   - 3 intereses en chips visuales
   - Indicador de super like disponible (estrella dorada)
3. Gestos:
   - Swipe izquierda o botón X = **dislike** (desaparece sin notificación)
   - Swipe derecha o botón ❤️ = **like** (notifica al otro usuario)
   - Botón ⭐ = **super like** (solo 1 por evento, notificación especial al receptor)
4. Al expirar el timer: pantalla de "Tiempo agotado" — pueden ver sus likes recibidos pero no hacer más swipes

### FLUJO 3: Likes recibidos y Matches

**Tab "Likes recibidos"** (pestaña 2 de navegación):
- Grid de perfiles que te dieron like (foto con overlay de corazón)
- Botón "Hacer match" en cada uno → crea el match y abre el chat
- Si ya les diste like tú también → aparece automáticamente como match

**Tab "Mis matches"** (pestaña 3):
- Lista de matches con nombre, foto, mesa
- Al tocar → abre chat básico en tiempo real (Supabase Realtime)
- Chat simple: solo texto, sin fotos, sin emojis especiales
- Mensaje de bienvenida automático al crear match

### FLUJO 4: Álbum de fotos

**Durante el evento (Tab "Cámara" — pestaña 4)**:
- Botón grande de cámara
- Activa la cámara trasera del dispositivo (no frontal, no galería)
- Contador visible: "X / 10 fotos tomadas"
- Al tomar una foto → upload inmediato a Cloudinary con `is_visible = false`
- Al llegar a 10 fotos → el botón se desactiva con mensaje "Has usado todas tus fotos"
- Las fotos se PROCESAN y se GUARDAN pero NO son visibles hasta `album_release_at`

**Día siguiente — álbum disponible**:
- Notificación push y WhatsApp: "¡Tu álbum de [Nombre Evento] ya está disponible!"
- Tab "Álbum" muestra grid masonry de todas tus fotos
- Opción de descargar cada foto individualmente

**Para Event Host (Perfil Madre)**:
- Vista especial: ve TODAS las fotos de TODOS los participantes del evento
- Organizadas por usuario
- Descarga individual o zip completo del álbum
- Ve también todos los matches del evento

### FLUJO 5: Precarga de invitados (Event Organizer)

1. Organizer accede a su dashboard de evento
2. Sube archivo CSV o Excel con columnas: `nombre, email, telefono, mesa` (opcionales: `relacion`)
3. El sistema valida el archivo y muestra preview
4. Al confirmar:
   - Crea cuentas pendientes para cada invitado
   - Envía email/WhatsApp a cada uno con link personalizado al evento
   - El usuario llega ya pre-registrado, solo completa la selfie y el cuestionario

---

## 📱 ESTRUCTURA DE NAVEGACIÓN (mobile-first)

### Para GUEST (Bottom Navigation Bar):
```
[🔍 Buscar] [❤️ Likes] [💬 Matches] [📷 Cámara] [👤 Perfil]
```

### Para EVENT_HOST:
```
[🎉 Mi Evento] [📸 Álbum] [💑 Matches] [📊 Stats]
```

### Para EVENT_ORGANIZER:
```
[📋 Mis Eventos] [➕ Crear Evento] [👥 Invitados] [🔧 Configuración] [📊 Analytics]
```

### Para SUPER_ADMIN:
```
Dashboard global con sidebar: [Eventos] [Usuarios] [Organizadores] [Analytics] [Webhooks] [API Keys] [Configuración]
```

---

## 🎨 DISEÑO Y UI/UX

### Paleta de colores:
- **Primary**: `#FF3CAC` (rosa vibrante — energía, romance)
- **Secondary**: `#784BA0` (púrpura — elegancia)
- **Accent**: `#2B86C5` (azul — confianza)
- **Gradient principal**: `linear-gradient(225deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)`
- **Background**: `#0A0A0F` (casi negro — premium, nocturno)
- **Surface**: `#16161F` (cards y paneles)
- **Text primary**: `#FFFFFF`
- **Text secondary**: `#A0A0B0`

### Tipografía:
- **Display**: `Playfair Display` (para títulos del evento, nombres)
- **Body**: `Inter` (para texto general)
- **Monospace**: `JetBrains Mono` (para códigos, timers)

### Componentes clave:
- **Tarjeta de swipe**: Glassmorphism con blur, gradiente sutil en los bordes, foto full-card con overlay gradiente inferior para el nombre
- **Timer**: Display grande tipo reloj digital, con animación pulsante cuando queden <5 minutos. Cambia a rojo en los últimos 2 minutos
- **Botones de swipe**: Tres botones flotantes sobre la tarjeta: ✗ (gris) | ⭐ (dorado) | ❤️ (rosa)
- **Match modal**: Animación confeti/partículas al hacer match, muestra ambas fotos "colisionando"
- **Super like**: Animación de estrella que explota en partículas doradas

### Mobile-first:
- Diseñado primero para pantalla de 375px (iPhone SE)
- No hay versión desktop separada — responsive que escala bien
- Gestos táctiles nativos para swipe con `react-swipeable` o similar
- Todas las interacciones críticas accesibles con pulgar (zona inferior de pantalla)

---

## 🔌 API REST — ENDPOINTS COMPLETOS

Todos los endpoints bajo `/api/v1/`. Autenticación via Bearer token (Supabase JWT) o API Key en header `X-NGAGE-API-Key`.

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/google
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### Eventos
```
GET    /api/v1/events                          -- Lista (filtrable, paginada)
POST   /api/v1/events                          -- Crear evento (organizer)
GET    /api/v1/events/:id                      -- Detalle de evento
PATCH  /api/v1/events/:id                      -- Actualizar evento
DELETE /api/v1/events/:id                      -- Eliminar/archivar
GET    /api/v1/events/slug/:slug               -- Buscar por slug (para landing del QR)
POST   /api/v1/events/:id/start-search         -- Iniciar cronómetro global
POST   /api/v1/events/:id/close                -- Cerrar evento
GET    /api/v1/events/:id/qr                   -- Obtener/regenerar QR
GET    /api/v1/events/:id/stats                -- Métricas del evento
```

### Registros en evento
```
POST   /api/v1/events/:id/register             -- Registrarse en un evento
GET    /api/v1/events/:id/my-registration      -- Mi registro en este evento
PATCH  /api/v1/events/:id/my-registration      -- Actualizar mi registro
POST   /api/v1/events/:id/start-my-search      -- Iniciar mi timer personal
GET    /api/v1/events/:id/guests               -- Lista de guests (organizer/host)
POST   /api/v1/events/:id/guests/bulk          -- Precarga masiva CSV (organizer)
```

### Swipe / Likes
```
POST   /api/v1/events/:id/likes                -- Dar like/dislike/superlike
GET    /api/v1/events/:id/likes/received       -- Likes que he recibido
GET    /api/v1/events/:id/likes/sent           -- Likes que he dado
GET    /api/v1/events/:id/profiles             -- Perfiles para swipe (no vistos aún)
```

### Matches
```
GET    /api/v1/events/:id/matches              -- Mis matches en este evento
POST   /api/v1/events/:id/matches              -- Crear match manualmente (cuando recibes like)
GET    /api/v1/events/:id/matches/all          -- Todos los matches (host/organizer)
```

### Chat
```
GET    /api/v1/matches/:matchId/messages       -- Historial de mensajes
POST   /api/v1/matches/:matchId/messages       -- Enviar mensaje
PATCH  /api/v1/matches/:matchId/messages/read  -- Marcar como leído
```

### Fotos / Álbum
```
POST   /api/v1/events/:id/photos               -- Subir foto (upload a Cloudinary)
GET    /api/v1/events/:id/photos               -- Mis fotos del evento
GET    /api/v1/events/:id/photos/all           -- Todas las fotos (host/organizer)
DELETE /api/v1/events/:id/photos/:photoId      -- Eliminar foto propia
GET    /api/v1/events/:id/photos/download      -- Descargar álbum completo (zip, host)
```

### Perfil de usuario
```
GET    /api/v1/users/me                        -- Mi perfil
PATCH  /api/v1/users/me                        -- Actualizar perfil
DELETE /api/v1/users/me                        -- Eliminar cuenta
GET    /api/v1/users/me/events                 -- Eventos a los que he asistido
```

### Webhooks (organizer y super_admin)
```
GET    /api/v1/webhooks                        -- Mis webhooks
POST   /api/v1/webhooks                        -- Crear webhook
PATCH  /api/v1/webhooks/:id                    -- Actualizar
DELETE /api/v1/webhooks/:id                    -- Eliminar
POST   /api/v1/webhooks/:id/test               -- Test de webhook
GET    /api/v1/webhooks/:id/logs               -- Logs de envíos
```

### API Keys
```
GET    /api/v1/api-keys                        -- Mis API keys
POST   /api/v1/api-keys                        -- Crear nueva
DELETE /api/v1/api-keys/:id                    -- Revocar
```

### Intereses (catálogo)
```
GET    /api/v1/interests                       -- Catálogo completo de intereses
```

### Super Admin
```
GET    /api/v1/admin/events                    -- Todos los eventos
GET    /api/v1/admin/users                     -- Todos los usuarios
PATCH  /api/v1/admin/users/:id/status          -- Activar/suspender usuario
GET    /api/v1/admin/stats                     -- Dashboard métricas globales
POST   /api/v1/admin/api-keys                  -- Crear API key global
```

---

## 📡 SISTEMA DE WEBHOOKS

### Eventos que disparan webhooks:
```
guest.registered       -- Un invitado se registró en el evento
search.started         -- Un invitado inició su búsqueda
like.sent              -- Se dio un like
match.created          -- Se creó un match
message.sent           -- Se envió un mensaje en un match
photo.uploaded         -- Se subió una foto al álbum
album.released         -- El álbum del evento se liberó (día siguiente)
event.created          -- Se creó un nuevo evento
event.closed           -- El evento fue cerrado
event.expired          -- El evento expiró (caducidad)
```

### Estructura del payload:
```json
{
  "event": "match.created",
  "event_id": "uuid-del-evento",
  "timestamp": "2024-10-15T22:30:00Z",
  "data": { /* objeto relevante */ },
  "ngage_signature": "sha256=..." // HMAC del payload con el secret del webhook
}
```

### Firma HMAC:
- Header: `X-NGAGE-Signature: sha256=<firma>`
- Calculada con `crypto.createHmac('sha256', webhook.secret).update(rawBody).digest('hex')`
- El receptor debe verificar esta firma antes de procesar

---

## ⏱️ JOBS Y TAREAS PROGRAMADAS

Implementar con `node-cron` en un worker de Railway:

```
Cada 1 minuto:
  - Verificar eventos cuyo album_release_at ya pasó → setear is_visible=true en sus fotos → disparar webhook album.released

Cada 5 minutos:
  - Verificar eventos con expiry_at pasado → setear status='expired' → disparar webhook event.expired

Cada hora:
  - Limpiar sesiones expiradas de búsqueda
  - Enviar recordatorio WhatsApp a usuarios con search timer activo (si quedan <15 min)

Diario (midnight):
  - Reporte de métricas para super admin (email)
```

---

## 🔔 NOTIFICACIONES

### In-app (Supabase Realtime):
- Nuevo like recibido → badge en pestaña "Likes"
- Nuevo match → modal de celebración
- Nuevo mensaje → badge en pestaña "Matches"
- Álbum disponible → banner en Home
- Timer < 10 minutos → banner de urgencia

### WhatsApp (vía webhook a N8N):
Disparar webhook a endpoint de N8N del operador en estos momentos:
- Registro exitoso: "¡Bienvenido a [Evento]! Ya puedes buscar conexiones. Ingresa aquí: [link]"
- Like recibido: "¡Alguien te dio like en [Evento]! Entra para verlo: [link]"
- Match nuevo: "¡Hiciste match en [Evento]! Empieza a chatear: [link]"
- Álbum disponible: "¡Tu álbum de [Evento] ya está listo! Descarga tus fotos: [link]"
- Invitación precargada: "Hola [Nombre], estás invitado a [Evento]. Completa tu perfil aquí: [link]"

### Email (Resend):
- Bienvenida al registrarse en N'GAGE
- Confirmación de registro en evento
- Enlace mágico de verificación
- Álbum disponible (con preview de 3 fotos)
- Evento por expirar (24h antes)

---

## 🔐 SEGURIDAD Y REGLAS

- **Row Level Security (RLS)** en Supabase para todas las tablas
- Un usuario SOLO puede ver perfiles de su mismo evento y dentro del periodo de validez
- Los chats solo son visibles para los 2 participantes del match
- Las fotos `is_visible=false` no pueden ser accedidas por URLs directas (usar signed URLs de Cloudinary)
- Rate limiting en endpoints de swipe: máximo 100 swipes por hora por usuario
- Rate limiting en carga de fotos: máximo 10 por evento (enforced en DB y API)
- Validar que el event no esté expirado antes de permitir cualquier acción de participación
- Super likes: validar en DB que `super_like_used=false` antes de procesar
- API keys: guardar solo el hash (bcrypt), nunca el valor real
- CORS configurado para permitir solo dominios propios de N'GAGE

---

## 📊 DASHBOARDS

### Dashboard del EVENT_ORGANIZER (por evento):
- Total registrados / capacidad máxima
- Búsquedas iniciadas (cuántos presionaron "Iniciar búsqueda")
- Total likes dados
- Total matches generados
- Fotos tomadas / total posible (registrados × 10)
- Matches por hora (gráfica de línea)
- Registros por hora (gráfica de barras)
- Lista descargable de invitados

### Dashboard del SUPER_ADMIN (global):
- Eventos activos / histórico total
- Usuarios registrados totales (gráfica de crecimiento)
- Matches generados totales
- Fotos almacenadas (en GB)
- Ingresos (eventos creados × precio — solo informativo)
- Top organizadores por eventos
- Webhooks activos y su tasa de éxito
- Logs de errores

---

## 🗂️ ESTRUCTURA DE CARPETAS DEL PROYECTO

```
ngage/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de auth (login, register)
│   ├── (guest)/                  # App para invitados
│   │   ├── e/[slug]/             # Landing de evento (registro)
│   │   ├── event/[id]/           # Vista principal del evento
│   │   │   ├── search/           # Modo swipe
│   │   │   ├── likes/            # Likes recibidos
│   │   │   ├── matches/          # Mis matches + chat
│   │   │   ├── camera/           # Tomar fotos
│   │   │   └── album/            # Ver álbum
│   │   └── profile/              # Mi perfil N'GAGE
│   ├── (host)/                   # App para Event Hosts
│   │   └── host/[eventId]/       # Dashboard del host
│   ├── (organizer)/              # App para organizadores
│   │   ├── dashboard/            # Mis eventos
│   │   ├── events/new/           # Crear evento
│   │   └── events/[id]/          # Gestión de evento
│   ├── (admin)/                  # Super Admin
│   │   └── admin/                # Dashboard global
│   └── api/v1/                   # Todos los endpoints REST
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── swipe/                    # Componentes de swipe/tarjetas
│   ├── camera/                   # Componentes de cámara
│   ├── chat/                     # Componentes de chat
│   ├── album/                    # Galería de fotos
│   ├── event/                    # Tarjetas y headers de evento
│   └── admin/                    # Componentes del dashboard admin
├── lib/
│   ├── supabase/                 # Cliente y config de Supabase
│   ├── cloudinary/               # Upload y transformaciones
│   ├── webhooks/                 # Sistema de envío de webhooks
│   ├── notifications/            # WhatsApp y email helpers
│   ├── qr/                       # Generación de QR
│   └── utils/                   # Helpers generales
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores (estado global)
├── types/                        # TypeScript types/interfaces
├── middleware.ts                 # Auth middleware (protección de rutas)
├── prisma/
│   └── schema.prisma             # Schema de Prisma
└── supabase/
    ├── migrations/               # Migraciones SQL
    └── seed.ts                   # Datos iniciales (intereses, etc.)
```

---

## 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN PARA CLAUDE CODE

### Orden de construcción (hazlo en este orden exacto):

1. **Setup inicial**: Inicializar Next.js 14, instalar dependencias, configurar Supabase, Prisma, Tailwind, shadcn/ui
2. **Base de datos**: Crear todas las tablas con Prisma schema, correr migraciones, configurar RLS en Supabase, seed de intereses
3. **Autenticación**: Registro email + Google OAuth, middleware de protección de rutas, manejo de roles
4. **Landing de evento**: Página `e/[slug]` — flujo completo de registro del invitado incluyendo selfie con cámara
5. **Sistema de swipe**: Tarjetas animadas, gestos de swipe, API de likes, super like
6. **Sistema de likes y matches**: Tab de likes recibidos, creación de match, modal de celebración
7. **Chat en tiempo real**: Usando Supabase Realtime, interfaz de chat minimalista
8. **Sistema de fotos/álbum**: Captura desde cámara, upload a Cloudinary, liberación programada
9. **Dashboard del Organizador**: CRUD de eventos, precarga de invitados, generación de QR, métricas
10. **Dashboard del Event Host**: Vista del álbum completo, vista de matches del evento
11. **Dashboard Super Admin**: Panel global de administración
12. **API REST completa**: Todos los endpoints documentados, con validación Zod
13. **Sistema de Webhooks**: Registro, envío, firma HMAC, logs, retry automático
14. **Jobs programados**: Cron jobs para liberación de álbum, expiración, notificaciones
15. **Notificaciones**: WhatsApp webhook a N8N, emails con Resend
16. **Deployment**: Configuración de Railway, variables de entorno, CI/CD

### Variables de entorno necesarias:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Webhooks (N8N)
N8N_WHATSAPP_WEBHOOK_URL=
WEBHOOK_SIGNING_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=N'GAGE
JWT_SECRET=

# Railway
DATABASE_URL= (PostgreSQL de Supabase)
```

---

## 📝 NOTAS FINALES IMPORTANTES

- **Idioma del código**: Inglés (variables, funciones, comentarios)
- **Idioma de la UI**: Español (todo el texto visible al usuario es en español)
- **Manejo de errores**: Siempre con mensajes amigables en español para el usuario
- **Loading states**: Skeletons en todas las listas y acciones asíncronas
- **Optimistic UI**: Los likes y swipes deben sentirse instantáneos (actualizar UI antes de confirmar con servidor)
- **Accesibilidad**: aria-labels en todos los botones de acción crítica
- **SEO**: Solo las landing pages de evento (`e/[slug]`) necesitan SSR para SEO. El resto puede ser CSR
- **Testing**: Crear datos de prueba (seed) con al menos 1 evento de ejemplo, 10 perfiles de invitados, y matches preexistentes para poder probar toda la experiencia desde el inicio
- **El nombre del "Perfil Madre"** (los protagonistas del evento) se llama oficialmente en el sistema: **"Anfitrión del Evento" / `EVENT_HOST`**

---

## 🔐 SISTEMA DE ACCESO AL EVENTO (Control de entrada)

El acceso a cada evento es **completamente controlado** — nadie puede entrar sin autorización. Existen dos modos configurables por el organizador al crear el evento:

### Modo 1: Código Único por Evento (default)
- El organizador define un código de acceso al crear el evento (ej. `BODA2025`)
- Se genera un QR que lleva a la landing del evento + el código ya embebido en la URL: `ngage.app/e/[slug]?code=BODA2025`
- Al escanear el QR, el código se valida automáticamente sin que el usuario lo escriba
- Si alguien intenta acceder al slug sin el código → pantalla de "Acceso restringido"
- El código también puede enviarse por WhatsApp como link directo
- Un `event_access_token` se guarda en la sesión del usuario para mantenerlo activo durante el evento

### Modo 2: Código Individual por Invitado (activable por el organizador)
- Solo disponible cuando el organizador precarga la lista de invitados con CSV/Excel
- El sistema genera un token único por invitado: `ngage.app/e/[slug]?invite=TOKEN_UNICO`
- Cada token es de un solo uso — una vez registrado el invitado, el token se marca como usado
- Si alguien intenta usar el mismo token dos veces → acceso denegado
- Ideal para eventos donde el organizador quiere control total del aforo

### Tabla adicional en DB:
```sql
event_access_codes
  id UUID PRIMARY KEY
  event_id UUID REFERENCES events(id)
  code VARCHAR NOT NULL
  type ENUM('global', 'individual')
  assigned_to_email VARCHAR -- Solo para tipo 'individual'
  used_by UUID REFERENCES users(id) -- Solo para tipo 'individual'
  used_at TIMESTAMP
  is_active BOOLEAN DEFAULT true
  created_at TIMESTAMP
```

### Regla de negocio crítica:
- **Ningún endpoint de participación** (swipe, fotos, likes) debe funcionar sin un `event_access_token` válido en la sesión
- Validar en middleware que el token corresponde al evento correcto

---

## 🌍 SISTEMA MULTIIDIOMA

El idioma de toda la experiencia (UI, emails, mensajes de WhatsApp) se define a nivel evento por el organizador al crearlo.

### Idiomas soportados desde el MVP:
- `es-MX` — Español México (default)
- `es` — Español neutro (latinoamérica)
- `en` — Inglés

### Implementación:
- Usar `next-intl` para internacionalización en Next.js
- Los archivos de traducción en `/messages/es-MX.json`, `/messages/es.json`, `/messages/en.json`
- El idioma del evento se guarda en `events.language` (VARCHAR: `'es-MX' | 'es' | 'en'`)
- Al acceder a `e/[slug]`, se carga el idioma del evento y se aplica a toda la sesión del invitado
- Los emails y webhooks de WhatsApp usan el idioma del evento, no del usuario
- El dashboard de organizadores y super admin siempre en español MX

### Campo adicional en tabla `events`:
```sql
language VARCHAR(10) DEFAULT 'es-MX' -- 'es-MX' | 'es' | 'en'
```

---

## ⚧ SISTEMA DE GÉNERO Y MATCHING INTELIGENTE

Este es uno de los diferenciadores más importantes de N'GAGE. **El sistema de matching filtra por compatibilidad de orientación** — nunca aparecerá un perfil no compatible con las preferencias del usuario.

### Opciones de género (en registro del invitado):
- `male` — Hombre
- `female` — Mujer
- `non_binary` — No binario / Otro
- `prefer_not_say` — Prefiero no decir

### Opciones de "Me interesan" (a quién busco):
- `women` — Mujeres
- `men` — Hombres
- `everyone` — Todos
- `non_binary` — No binarios

### Lógica de matching (CRÍTICA — implementar con exactitud):
El algoritmo de swipe SOLO muestra perfiles donde hay compatibilidad bidireccional:

```
Usuario A (género: male, busca: women) 
  → Solo ve perfiles de: female que buscan men o everyone

Usuario B (género: female, busca: women)
  → Solo ve perfiles de: female que buscan women o everyone

Usuario C (género: male, busca: men)
  → Solo ve perfiles de: male que buscan men o everyone

Usuario D (género: non_binary, busca: everyone)
  → Solo ve perfiles de: anyone que busca non_binary o everyone
```

**Regla absoluta**: Un hombre heterosexual NUNCA debe ver el perfil de otro hombre heterosexual en el swipe. Idem con mujeres. Esto debe validarse tanto en la query SQL como en el API layer.

### Query SQL del feed de swipe (ejemplo base):
```sql
SELECT er.* FROM event_registrations er
WHERE er.event_id = :eventId
  AND er.user_id != :currentUserId
  -- No mostrar perfiles ya vistos (likes o dislikes dados)
  AND er.user_id NOT IN (
    SELECT to_user_id FROM event_likes 
    WHERE event_id = :eventId AND from_user_id = :currentUserId
  )
  -- Filtro de compatibilidad bidireccional
  AND (
    -- El otro me busca a mí (o a todos)
    er.looking_for = 'everyone' 
    OR er.looking_for = :myGenderValue
  )
  AND (
    -- Yo busco al otro (o a todos)
    :myLookingFor = 'everyone'
    OR :myLookingFor = er.gender
  )
ORDER BY RANDOM()
LIMIT 20
```

### Campos adicionales en `event_registrations`:
```sql
gender ENUM('male', 'female', 'non_binary', 'prefer_not_say') NOT NULL
looking_for ENUM('men', 'women', 'everyone', 'non_binary') NOT NULL
```

### Configuración por organizador:
- Por default, solo aparecen `male` y `female` en el formulario de registro
- El organizador puede activar `gender_extended_mode = true` en el evento para mostrar las 4 opciones
- Campo en tabla `events`: `gender_extended_mode BOOLEAN DEFAULT false`

---

## 🎬 ONBOARDING ANIMADO (primera experiencia)

Al registrarse por primera vez en N'GAGE (no en cada evento, solo la primera vez que el usuario crea su cuenta), mostrar un onboarding de 4 pantallas animadas con Framer Motion:

### Pantalla 1 — Bienvenida:
- Logo de N'GAGE con animación de entrada
- Texto: "Conecta. Aquí y ahora."
- Subtexto: "N'GAGE es la app de conexiones para el momento exacto que estás viviendo."

### Pantalla 2 — Cómo funciona:
- Animación de 3 pasos con iconos:
  1. 📷 "Regístrate con tu selfie del día"
  2. ❤️ "Haz swipe y conecta"
  3. 💬 "Habla con tus matches"

### Pantalla 3 — El álbum:
- Animación de cuadrícula de fotos apareciendo
- Texto: "Tus fotos, guardadas para siempre"
- Subtexto: "Toma hasta 10 fotos del evento. Al día siguiente, tienes tu álbum listo."

### Pantalla 4 — La regla de oro:
- Ícono de reloj con animación
- Texto: "Todo tiene un tiempo."
- Subtexto: "Las conexiones son del momento. Úsalas antes de que expiren."
- Botón CTA: "¡Vamos al evento!" → lleva al registro del evento

### Implementación:
- Guardar en `users.onboarding_completed BOOLEAN DEFAULT false`
- Una vez completado, nunca volver a mostrar
- Si el usuario llega directo por QR sin cuenta → mostrar onboarding ANTES del registro del evento
- Permitir saltar onboarding con botón "Saltar" en esquina superior derecha

---

## 📝 NOTAS ADICIONALES FINALES

---

## 💰 MODELO DE PRECIOS (para referencia interna y dashboard del Super Admin)

El cobro es externo a la plataforma (transferencia / link de pago). Sin embargo, el Super Admin puede registrar qué plan fue contratado por cada organizador. Los planes son:

| Plan | Invitados solteros | Precio MXN | Timer máx | Anfitriones | Precarga CSV | Webhooks/API |
|------|-------------------|------------|-----------|-------------|--------------|--------------|
| **Spark** ✨ | Hasta 50 | $3,500 | 1 hora | 1 | ❌ | ❌ |
| **Connect** 💫 | 51 – 100 | $6,500 | 2 horas | 2 | ❌ | ❌ |
| **Vibe** 🔥 | 101 – 200 | $10,000 | 3 horas | 3 | ✅ | ❌ |
| **Luxe** 💎 | 201 – 350 | $15,000 | Sin límite | 3 | ✅ | ✅ |
| **Elite** 👑 | 351 – 500 | $22,000 | Sin límite | 3 | ✅ | ✅ + soporte prioritario |
| **Exclusive** 🌟 | 500+ | Cotización | Sin límite | Ilimitados | ✅ | ✅ + soporte 24/7 |

### Campo adicional en tabla `events`:
```sql
plan ENUM('spark','connect','vibe','luxe','elite','exclusive') DEFAULT 'vibe'
plan_guest_limit INTEGER -- Límite de registros según el plan
```

### Regla de negocio:
- Al llegar al `plan_guest_limit`, nuevos intentos de registro muestran pantalla de "Evento lleno"
- El Super Admin puede actualizar el plan de un evento si el organizador hace upgrade
- La nota al usuario: el conteo es de **solteros registrados**, no del total de asistentes (estimar 30-40% del total)

---

## 📸 TRAZABILIDAD DE FOTOS (en lugar de moderación automática)

No hay moderación automática de contenido. En su lugar, **cada foto está completamente trazada** para garantizar la autorregulación por parte de los usuarios.

### Metadatos obligatorios en cada foto:
- `user_id` — Quién la tomó (siempre visible para anfitriones)
- `taken_at` — Timestamp exacto de cuando se tomó
- `device_info` — User agent del dispositivo (opcional, para soporte)
- `event_id` — A qué evento pertenece

### Visibilidad de trazabilidad:
- Los **Event Hosts** ven todas las fotos con nombre del autor y hora
- El **Super Admin** ve todos los metadatos completos
- Los **Guests** solo ven las fotos del álbum sin metadatos expuestos
- Si hay una foto reportada como inapropiada → el Super Admin puede eliminarla con registro en log

### Endpoint de reporte (agregar a la API):
```
POST /api/v1/events/:id/photos/:photoId/report
```
Body: `{ reason: string }`
Acción: Crea un registro en tabla `photo_reports` para revisión del Super Admin

### Tabla adicional:
```sql
photo_reports
  id UUID PRIMARY KEY
  photo_id UUID REFERENCES event_photos(id)
  reported_by UUID REFERENCES users(id)
  reason TEXT
  status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending'
  created_at TIMESTAMP
```

---

## 🤳 SELFIE DEL DÍA vs FOTO DE PERFIL GLOBAL

Son dos cosas distintas que coexisten:

### Foto de perfil global (permanente en N'GAGE):
- Se sube al crear la cuenta por primera vez
- Persiste entre eventos
- Visible en el historial de eventos del usuario
- Se puede cambiar en cualquier momento desde el perfil

### Selfie del día (por evento):
- **OBLIGATORIA** para participar en el swipe del evento
- Solo se puede tomar desde la cámara (no galería)
- **Reemplaza temporalmente** la foto de perfil durante el periodo activo del evento
- Una vez que el evento expira, la foto de perfil global vuelve a ser la principal
- La selfie del día queda guardada en el historial del evento pero no reemplaza permanentemente el perfil global

### Lógica en el feed de swipe:
- Mostrar SIEMPRE la selfie del día del evento actual como foto principal en las tarjetas
- En el perfil general (fuera del evento), mostrar la foto de perfil global

### Campo adicional en `users`:
```sql
avatar_url VARCHAR -- Foto de perfil global permanente
```
Ya existe en el schema. La selfie del día está en `event_registrations.selfie_url`.

### UX en el registro del evento:
1. Mostrar su foto de perfil actual con mensaje: *"Esta es tu foto de perfil actual"*
2. Botón obligatorio: **"Tomar selfie del día"** → activa cámara frontal
3. Preview de la selfie tomada con opción de repetir
4. Al confirmar → se guarda en `event_registrations.selfie_url`
5. Mensaje: *"Tu selfie del día está lista. Así te verán los demás en este evento."*

---

- **Dominio**: Usar URL de Railway por defecto en el MVP. El sistema debe estar preparado para cambiar de dominio con solo cambiar `NEXT_PUBLIC_APP_URL` en las variables de entorno. Todos los links generados (QR, emails, WhatsApp) deben usar esta variable, nunca hardcodear la URL.

- **Seed de prueba**: Al correr el seed de desarrollo, crear:
  - 1 Super Admin
  - 1 Event Organizer  
  - 1 evento activo tipo "wedding" con slug `boda-demo`
  - Código de acceso global: `DEMO2025`
  - 2 Event Hosts asignados
  - 15 invitados registrados con géneros y orientaciones mixtas (para poder probar el filtro de matching)
  - Algunos likes y matches pre-existentes entre los invitados
  - 5 fotos por invitado ya marcadas como `is_visible=true` (para probar el álbum sin esperar al día siguiente)

- **Error handling de cámara**: Si el navegador no tiene permisos de cámara o el dispositivo no tiene cámara disponible → mostrar mensaje claro con instrucciones para habilitarla. No dejar al usuario bloqueado.

- **Límite de capacidad del evento**: Si el organizador definió `max_guests` y ya se alcanzó → mostrar pantalla de "Este evento está lleno" al intentar registrarse, con opción de contactar al organizador.

- **Caducidad en tiempo real**: Cuando el contenido de un evento expira (llega `expiry_at`), los perfiles deben desaparecer del feed y los chats deben bloquearse en tiempo real usando Supabase Realtime — no solo al recargar la página.

---

*Prompt generado para N'GAGE — Connecting moments that matter.*
*Versión 2.0 — Para Claude Code — Completo y definitivo*
