# PROMPT DE REDISEÑO FRONTEND — N'GAGE
## Para Claude Code — Frontend Visual Overhaul Completo

---

## 🎯 OBJETIVO

El MVP de N'GAGE ya está funcional. Ahora necesitamos una **transformación visual completa** del frontend. El objetivo es que la app se vea como un producto de clase mundial — comparable a Tinder, Hinge o BeReal en términos de pulido visual — pero con una identidad única, oscura, y cinematográfica propia de N'GAGE.

**El criterio de éxito es simple**: alguien que vea la app NO debe poder decir que fue hecha con IA. Debe sentirse diseñada por un equipo profesional de diseño con visión estética clara.

---

## 📦 PASO 1 — INSTALAR TODAS LAS DEPENDENCIAS NUEVAS

Ejecuta estos comandos antes de tocar cualquier componente:

```bash
# Animaciones principales
npm install motion                          # Motion (ex Framer Motion) — animaciones declarativas
npm install gsap                            # GSAP — para animaciones de timeline y partículas

# Swipe nativo con física real
npm install react-tinder-card               # Swipe tipo Tinder con gestos táctiles nativos

# Componentes visuales premium (copy-paste, zero-config)
npx shadcn@latest add                       # Actualizar shadcn a última versión si aplica

# Efectos de partículas y fondos
npm install @tsparticles/react @tsparticles/slim   # Partículas para pantalla de match

# Utilidades de animación
npm install @formkit/auto-animate           # Animación automática de listas sin config
npm install react-intersection-observer     # Para animaciones al hacer scroll/aparecer en pantalla
npm install use-sound                       # Sonidos sutiles en interacciones clave (swipe, match)

# Contador animado para el timer
npm install react-countdown                 # Timer con callbacks

# Confetti para el match
npm install canvas-confetti               # Confetti en el match modal

# Gestos táctiles
npm install react-use-gesture              # Gestos avanzados (complemento al swipe)

# Tipografías (Google Fonts — agregar al layout.tsx o _app.tsx)
# Usar next/font con las siguientes fuentes:
# - "Clash Display" (display headers) — via CDN: https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap
# - "Satoshi" (body text) — via CDN: https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap
# - "JetBrains Mono" (timer, códigos) — Google Fonts
```

---

## 🎨 PASO 2 — SISTEMA DE DISEÑO GLOBAL (Design Tokens)

Crea o reemplaza el archivo `styles/tokens.css` y `tailwind.config.ts` con este sistema:

### Paleta de Colores N'GAGE (definitiva):

```css
:root {
  /* === BACKGROUNDS === */
  --bg-base: #07070F;           /* Fondo absoluto — casi negro azulado */
  --bg-surface: #0F0F1A;        /* Cards, panels, drawers */
  --bg-elevated: #161625;       /* Elementos sobre surface */
  --bg-overlay: rgba(7,7,15,0.85); /* Overlays y modals */

  /* === BRAND === */
  --brand-pink: #FF2D78;        /* Rosa eléctrico — acción principal */
  --brand-purple: #7B2FBE;      /* Púrpura — gradiente medio */
  --brand-blue: #1A6EFF;        /* Azul eléctrico — acción secundaria */
  --brand-gold: #FFB800;        /* Dorado — super like exclusivo */

  /* === GRADIENTES === */
  --gradient-brand: linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%);
  --gradient-brand-soft: linear-gradient(135deg, rgba(255,45,120,0.15) 0%, rgba(123,47,190,0.15) 100%);
  --gradient-gold: linear-gradient(135deg, #FFB800, #FF6B00);
  --gradient-card-overlay: linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.5) 40%, transparent 70%);

  /* === TEXTO === */
  --text-primary: #F0F0FF;      /* Blanco ligeramente azulado */
  --text-secondary: #8585A8;    /* Gris púrpura */
  --text-muted: #44445A;        /* Para placeholders y elementos deshabilitados */

  /* === BORDES Y GLASS === */
  --border-subtle: rgba(255,255,255,0.06);
  --border-brand: rgba(255,45,120,0.3);
  --glass-bg: rgba(15,15,26,0.7);
  --glass-blur: blur(20px);
  --glass-border: 1px solid rgba(255,255,255,0.08);

  /* === SOMBRAS === */
  --shadow-pink: 0 0 40px rgba(255,45,120,0.25);
  --shadow-blue: 0 0 40px rgba(26,110,255,0.2);
  --shadow-card: 0 20px 60px rgba(0,0,0,0.6);

  /* === RADIOS === */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 100px;

  /* === FUENTES === */
  --font-display: 'Clash Display', sans-serif;
  --font-body: 'Satoshi', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### `tailwind.config.ts` — extensiones necesarias:

```typescript
// Agrega esto al theme.extend de tu tailwind.config.ts
{
  colors: {
    brand: {
      pink: '#FF2D78',
      purple: '#7B2FBE',
      blue: '#1A6EFF',
      gold: '#FFB800',
    },
    surface: {
      base: '#07070F',
      card: '#0F0F1A',
      elevated: '#161625',
    }
  },
  fontFamily: {
    display: ['Clash Display', 'sans-serif'],
    body: ['Satoshi', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  backgroundImage: {
    'brand-gradient': 'linear-gradient(135deg, #FF2D78 0%, #7B2FBE 50%, #1A6EFF 100%)',
    'gold-gradient': 'linear-gradient(135deg, #FFB800, #FF6B00)',
    'card-overlay': 'linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.5) 40%, transparent 70%)',
  },
  animation: {
    'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
    'float': 'float 3s ease-in-out infinite',
    'shimmer': 'shimmer 2s linear infinite',
    'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    'glow': 'glow 2s ease-in-out infinite alternate',
  },
  keyframes: {
    pulseBrand: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(255,45,120,0.3)' },
      '50%': { boxShadow: '0 0 40px rgba(255,45,120,0.6)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-8px)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    glow: {
      '0%': { textShadow: '0 0 10px rgba(255,45,120,0.5)' },
      '100%': { textShadow: '0 0 30px rgba(255,45,120,0.9)' },
    }
  }
}
```

---

## 📐 PASO 3 — LAYOUT Y TIPOGRAFÍA BASE

### `app/layout.tsx` — Importar tipografías:

```tsx
import localFont from 'next/font/local'

// Clash Display — para títulos y display
const clashDisplay = localFont({
  src: '../public/fonts/ClashDisplay-Variable.woff2',
  variable: '--font-display',
})

// Satoshi — para body text
const satoshi = localFont({
  src: '../public/fonts/Satoshi-Variable.woff2',
  variable: '--font-body',
})

// NOTA: Descarga estas fuentes de:
// Clash Display: https://www.fontshare.com/fonts/clash-display
// Satoshi: https://www.fontshare.com/fonts/satoshi
// Colócalas en /public/fonts/
// Si prefieres CDN, usa:
// <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
```

### Jerarquía tipográfica obligatoria:
- **H1 / Display**: `font-display font-bold text-4xl tracking-tight` — solo para títulos de pantalla principal
- **H2 / Section**: `font-display font-semibold text-2xl`
- **H3 / Card title**: `font-body font-bold text-lg`
- **Body**: `font-body font-normal text-base`
- **Caption**: `font-body font-normal text-sm text-secondary`
- **Timer/Code**: `font-mono font-bold text-3xl`
- **Label/Tag**: `font-body font-medium text-xs uppercase tracking-widest`

---

## 🃏 PASO 4 — REDISEÑO DE LA TARJETA DE SWIPE (Componente más crítico)

Este es el corazón de la app. Reemplaza completamente el componente de swipe con esta implementación:

### Instalar y usar `react-tinder-card` con Motion:

```tsx
// components/swipe/SwipeCard.tsx
import TinderCard from 'react-tinder-card'
import { motion, AnimatePresence } from 'motion/react'

// La tarjeta debe tener estas capas visuales (de atrás hacia adelante):
// 1. Foto full-bleed (object-cover, aspect-[3/4])
// 2. Gradient overlay inferior (bg-card-overlay) — para legibilidad del texto
// 3. Gradient overlay superior sutil (para top info como mesa/relación)
// 4. Capa de like/dislike (aparece al hacer drag): verde con ❤️ o rojo con ✗
// 5. Capa de super like (al deslizar hacia arriba): dorado con ⭐
// 6. Info del perfil en la parte inferior

// Especificaciones visuales de la tarjeta:
// - Border radius: 28px
// - Box shadow: 0 25px 60px rgba(0,0,0,0.7)
// - Borde glassmorphism: 1px solid rgba(255,255,255,0.08)
// - Altura: 75vh máximo, aspect-ratio 3/4
// - Al hacer drag hacia la derecha: overlay verde rgba(0,255,120,0.3) + texto "LIKE" en verde
// - Al hacer drag hacia la izquierda: overlay rojo rgba(255,45,120,0.3) + texto "NOPE" en rojo
// - Al hacer drag hacia arriba: overlay dorado rgba(255,184,0,0.3) + estrella ⭐ dorada

// Info del perfil (bottom overlay):
// Nombre: font-display font-bold text-3xl
// Edad: font-display font-normal text-xl opacity-80
// Relación con el evento: chip pill con glassmorphism
// Mesa: ícono + número en font-mono
// Intereses: chips pequeños con emojis

// Stack de cartas (se ven las siguientes 2 cartas detrás):
// Card +1: scale(0.96) translateY(10px) opacity-80
// Card +2: scale(0.92) translateY(20px) opacity-60
```

### Botones de acción bajo las tarjetas:

```tsx
// Tres botones flotantes en fila:
// ✗ Nope: 56px circular, bg surface elevated, border-red-500/30, hover scale-110
// ⭐ Super: 48px circular, bg gold-gradient, shadow-gold, hover scale-110, pulse animation
// ❤️ Like: 64px circular (el más grande), bg brand-gradient, shadow-pink, hover scale-110

// Animación al presionar: spring animation hacia la dirección del swipe
// Feedback háptico en móvil (navigator.vibrate([30]) al dar like/dislike)
```

---

## ⏱️ PASO 5 — TIMER CINEMATOGRÁFICO

El timer es uno de los elementos más importantes de la app. Debe generar urgencia visual:

```tsx
// components/event/EventTimer.tsx
// Usar react-countdown + Motion para animaciones

// Display principal:
// - Fuente: font-mono font-bold
// - Tamaño: text-6xl (en la vista principal)
// - Formato: MM:SS
// - Color normal: var(--text-primary) con subtle glow

// Estados del timer y sus transformaciones visuales:
// > 10 minutos: blanco normal
// 5-10 minutos: texto ámbar (#FFB800) + leve pulsación
// 1-5 minutos: texto rojo (#FF2D78) + pulsación rápida + shadow-pink
// < 1 minuto: rojo brillante + animación de shake sutil + vibración en móvil
// 0:00: pantalla de "Tiempo agotado" con animación de fade-to-black y texto glitch

// Barra de progreso circular (SVG):
// - Círculo SVG con strokeDashoffset animado con Motion
// - El trazo va de brand-gradient a rojo conforme se acaba el tiempo
// - Radio: 40px, strokeWidth: 3

// El mini-timer en la barra de navegación inferior:
// - Versión compacta: solo MM:SS en font-mono text-sm
// - Parpadea cuando queden < 5 minutos
```

---

## 💥 PASO 6 — MODAL DE MATCH (El momento más emocional)

Este modal debe ser memorable. Se abre cuando hay un match mutuo:

```tsx
// components/match/MatchModal.tsx
// Usar AnimatePresence de Motion + canvas-confetti

// Secuencia de animación al hacer match:
// 1. Overlay negro fade-in (0.3s)
// 2. Las dos fotos "vuelan" desde los bordes y colisionan en el centro
//    - Tu foto: slide desde izquierda con rotation leve
//    - La otra foto: slide desde derecha con rotation opuesta
//    - Al colisionar: scale-up + heart burst particles (gsap)
// 3. Texto "¡Hicieron Match!" aparece con typewriter effect
//    - Font: font-display font-bold text-4xl
//    - Color: brand-gradient text
//    - Animación: letra por letra con Motion stagger
// 4. Subtexto: "Conócete en la Mesa X" fade-in
// 5. Confetti burst (canvas-confetti) en colores #FF2D78, #7B2FBE, #FFB800
// 6. Botones: "💬 Iniciar Chat" (primary) y "Seguir explorando" (ghost)

// Las dos fotos tienen:
// - Tamaño: 120px circular
// - Border: 3px solid con brand-gradient
// - Box shadow: var(--shadow-pink) y var(--shadow-blue) respectivamente
// - Overlap en el centro con z-index correcto
```

---

## 🔔 PASO 7 — NOTIFICACIONES IN-APP

```tsx
// components/ui/Toast.tsx — reemplazar con diseño N'GAGE
// Usar sonner o crear custom con Motion

// Posición: top-center en móvil
// Estilo base: glassmorphism (glass-bg + glass-blur + glass-border)
// Border-radius: var(--radius-lg)

// Tipos y sus estilos:
// like_received: 
//   - Ícono: ❤️ con glow rosa
//   - Borde izquierdo: 3px solid var(--brand-pink)
//   - Animación entrada: slide-down + fade-in

// match_created:
//   - Ícono: ✨ o 💫 dorado
//   - Background: gradient sutil de oro
//   - Animación: bounce-in especial
//   - Sonido: use-sound con chime corto

// new_message:
//   - Ícono: 💬 con badge de número
//   - Borde: brand-blue

// album_ready:
//   - Ícono: 📸
//   - Background: gradient azul-púrpura

// Animación de salida: slide-up + fade-out
// Auto-dismiss: 4 segundos
// Swipe para descartar: react-use-gesture
```

---

## 📸 PASO 8 — CÁMARA Y ÁLBUM

### Vista de cámara:
```tsx
// La interfaz de cámara debe sentirse como una app nativa de fotos

// Overlay de cámara:
// - Esquinas redondeadas con corners highlight (CSS border decorativo)
// - Guía facial oval centrada (como Face ID de Apple)
// - Contador de fotos: "X / 10" en font-mono arriba a la derecha
// - Botón de captura: círculo blanco grande (64px) con ring exterior animado
//   Al presionar: scale-down 0.8 → scale-up 1.0 en 150ms
// - Flash effect al tomar: overlay blanco que fade-out en 200ms

// Preview post-captura:
// - La foto aparece en miniatura abajo a la izquierda con slide-in animation
// - Checkmark verde animado sobre ella (confirma que se guardó)
```

### Galería del álbum:
```tsx
// Layout: CSS Columns masonry (2 columnas en mobile, 3 en tablet)
// Cada foto:
//   - Hover/tap: escala 1.02 con transition 200ms
//   - Tap → modal lightbox con Motion layoutId para shared element transition
//   - Badge del autor (nombre + hora) en overlay inferior con glassmorphism
// Animación de entrada del álbum completo:
//   - Stagger de 50ms entre fotos usando Motion
//   - Cada foto: fade-in + scale desde 0.9 a 1.0
// Si no hay fotos aún: pantalla con countdown hasta la hora de liberación
//   - Reloj animado con SVG
//   - Texto: "Tu álbum se libera en [HH:MM:SS]"
```

---

## 🔐 PASO 9 — PANTALLAS DE AUTH Y REGISTRO

### Landing del evento (`/e/[slug]`):
```tsx
// Hero section:
// - Imagen de cover del evento full-bleed con overlay oscuro gradient
// - El nombre del evento en font-display font-bold text-5xl
// - Tipo de evento + fecha como chips con glassmorphism
// - Orbs decorativos animados en background (3 círculos borrosos de colores brand)
// - Botón CTA grande con brand-gradient y shimmer animation en hover

// Floating orbs CSS (agregar al background de landing):
// .orb-1: 400px, brand-pink, top-left, blur(80px), opacity-30, animate-float
// .orb-2: 300px, brand-purple, center, blur(60px), opacity-20, animate-float delay-1s
// .orb-3: 500px, brand-blue, bottom-right, blur(100px), opacity-15, animate-float delay-2s
```

### Formulario de registro paso a paso:
```tsx
// Stepper visual en la parte superior:
// - Línea horizontal con puntos para cada paso
// - Punto activo: brand-gradient con glow
// - Puntos completados: verde con checkmark
// - Progreso animado con Motion

// Paso de selfie:
// - Transición especial: la pantalla se convierte en la cámara con animación fluida
// - El marco de guía facial pulsa suavemente invitando a alinearse
// - Al tomar la foto: animación "stamp" de la foto con tu nombre encima

// Cuestionario de intereses:
// - Cards táctiles tipo chip grande (80px de altura)
// - Al seleccionar: scale-up + border brand-pink + checkmark animado
// - Máximo 3 selecciones por categoría con shake feedback si intentas más
// - Transición entre pasos: slide horizontal con Motion
```

---

## 💬 PASO 10 — CHAT

```tsx
// Diseño del chat:
// - Background: bg-base con subtle noise texture (opacity 2%)
// - Burbujas propias: bg brand-gradient, border-radius 18px 18px 4px 18px
// - Burbujas del otro: glassmorphism, border-radius 18px 18px 18px 4px
// - Timestamp: font-mono text-xs text-muted

// Header del chat:
// - Foto del match circular (48px) con border brand-gradient
// - Nombre y "Mesa X" en subtítulo
// - Indicador online: punto verde animado con pulse
// - Botón "Ver perfil" a la derecha

// Input bar:
// - Glassmorphism con border brand-subtle
// - Al focus: border brand-pink con glow sutil
// - Botón send: circular con brand-gradient, rotate 45° animation al enviar

// Animación de mensajes nuevos:
// - Slide-up desde abajo con fade-in (Motion)
// - Auto-scroll suave al llegar mensaje nuevo
```

---

## 🧭 PASO 11 — NAVEGACIÓN INFERIOR

Reemplaza completamente la bottom navigation bar:

```tsx
// Bottom Navigation — 5 tabs: Buscar | Likes | Matches | Cámara | Perfil

// Contenedor:
// - Position: fixed bottom-0
// - Background: glassmorphism (glass-bg + glass-blur)
// - Border-top: glass-border
// - Padding: pb-safe (safe area de iOS)
// - Border-radius: 24px 24px 0 0

// Cada tab:
// - Ícono de 24px (Lucide React)
// - Label: font-body text-[10px] uppercase tracking-widest
// - Estado activo: ícono con brand-gradient fill + label brand-pink
// - Transición activo: Motion layout animation (el indicador activo se mueve fluidamente)
// - Indicador activo: pequeño dot de 4px brand-pink debajo del ícono

// Tab especial — Cámara (centro):
// - Tamaño mayor: 56px circular
// - Background: brand-gradient
// - Shadow: shadow-pink
// - El ícono de cámara en blanco
// - Efecto: sobresale 12px por encima de la navbar

// Badge de notificaciones:
// - Círculo rojo pequeño (16px) con número, brand-pink background
// - Animación entrada: scale desde 0 con bounce
// - Animación cuando llega nueva notificación: shake sutil
```

---

## 🌟 PASO 12 — COMPONENTES DE ACETERNITY UI A INTEGRAR

Visita **https://ui.aceternity.com/components** y copia estos componentes específicos para usarlos en N'GAGE:

### Componentes a implementar:

1. **`Background Beams`** — Para la pantalla de bienvenida/onboarding y la landing del evento
2. **`Spotlight`** — Para el hero de la landing del evento (enfoca el nombre del evento)
3. **`Card Hover Effect`** — Para los perfiles en la vista de "Likes recibidos"
4. **`Animated Tooltip`** — Para los intereses/chips en las tarjetas de perfil
5. **`Background Gradient Animation`** — Para el fondo del modal de match
6. **`Text Generate Effect`** — Para el texto "¡Hicieron Match!" que se escribe solo
7. **`Shimmer Button`** — Para el CTA principal de la landing del evento
8. **`3D Card Effect`** — Opcional: para las tarjetas de métricas en el dashboard del organizador
9. **`Wavy Background`** — Para el fondo de la pantalla de "Tiempo agotado"
10. **`TypewriterEffect`** — Para el onboarding (animación de textos de bienvenida)

**Instrucciones para Claude Code**: Para cada componente de Aceternity UI, visita `https://ui.aceternity.com/components/[nombre-del-componente]`, lee el código, adáptalo a los tokens de diseño de N'GAGE (colores, fuentes), y úsalo en el lugar especificado.

---

## ⚡ PASO 13 — COMPONENTES DE REACT BITS A INTEGRAR

Visita **https://reactbits.dev** y usa estos componentes:

1. **`Particles` background** → Pantalla de inicio de sesión y match modal
2. **`Fluid Glass`** → Cards de perfil en el swipe (glassmorphism más premium)
3. **`Magnet Lines`** → Background decorativo del dashboard del organizador
4. **`Grid Motion`** → Fondo animado de la pantalla de álbum liberado
5. **`Squares`** → Background sutil para pantallas de configuración/admin
6. **`Bubble Menu`** (si aplica) → Menú contextual de opciones en el perfil del match

**URL directa**: https://reactbits.dev/backgrounds/particles para empezar

---

## 🏗️ PASO 14 — PANTALLAS ESPECÍFICAS A REDISEÑAR (en orden de prioridad)

### Prioridad 1 — Las que el usuario ve primero:
1. **Landing del evento** (`/e/[slug]`) — Primera impresión absoluta
2. **Pantalla de swipe** — El corazón de la app
3. **Modal de match** — El momento más emocional
4. **Onboarding** (4 pantallas) — Primera experiencia

### Prioridad 2 — Uso frecuente:
5. **Tab de likes recibidos** — Grid con hover effects
6. **Chat** — Interfaz de mensajes
7. **Tab de perfil personal** — Mi información y mis eventos
8. **Cámara y álbum** — Captura de fotos

### Prioridad 3 — Dashboards:
9. **Dashboard del organizador** — Métricas y gestión
10. **Dashboard del Event Host** — Álbum y matches del evento
11. **Dashboard Super Admin** — Vista global

---

## 🚫 PASO 15 — COSAS A ELIMINAR DEL DISEÑO ACTUAL

Los siguientes patrones delatan que fue creado con IA y DEBEN eliminarse:

- ❌ Cualquier uso de `bg-white` en el fondo principal — siempre dark
- ❌ Borders visibles de color gris estándar — usar solo glass borders o brand borders
- ❌ Sombras de color negro puro — usar siempre sombras de color (brand colors)
- ❌ Font Inter o Roboto para títulos — solo Clash Display para display, Satoshi para body
- ❌ Gradientes de purple → white (el cliché de IA más reconocible)
- ❌ Cards con `rounded-lg` y `shadow-md` genérico — usar border-radius 20px+ y glow shadows
- ❌ Botones rectangulares con `bg-blue-600` genérico — siempre brand-gradient o glassmorphism
- ❌ Loading spinners circulares genéricos — crear skeleton loaders con shimmer animation
- ❌ Alertas/modals con fondo blanco o gris claro
- ❌ Íconos sin color ni contexto — siempre con el color del estado que representan
- ❌ Cualquier elemento con `opacity-50` como única técnica de "desactivado"
- ❌ Transiciones de página abruptas — siempre con fade o slide de Motion

---

## ✅ PASO 16 — MICRO-INTERACCIONES OBLIGATORIAS

Estas pequeñas animaciones hacen que la app se sienta viva:

| Acción | Animación |
|--------|-----------|
| Tap en botón | Scale 0.95 → 1.0 (spring, 150ms) |
| Swipe derecha (like) | Card rotation + green overlay fade-in |
| Swipe izquierda (nope) | Card rotation + red overlay fade-in |
| Like recibido | Heart icon bounces + pink badge aparece |
| Match! | Confetti + fotos "colisionan" + vibración |
| Foto tomada | Flash blanco + miniatura slide-in |
| Tab change | Content fade + slide sutil |
| Timer < 1 min | Números de timer pulsan rápido |
| Mensaje enviado | Burbuja scale-in desde esquina |
| Perfil agotado | Stack vacío con animación "no hay más" |
| Super like | Estrella dorada explota en partículas |
| Input focus | Border glow brand-pink + label float |
| Page load | Stagger reveal de elementos (50ms entre cada uno) |

---

## 📋 PASO 17 — SKELETONS Y LOADING STATES

Elimina todos los spinners y crea shimmer skeletons:

```css
/* Animación de shimmer para skeletons */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-elevated) 25%,
    rgba(255,255,255,0.05) 50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

Crear skeletons para:
- Tarjeta de swipe (mientras carga el feed)
- Grid de likes recibidos
- Lista de matches
- Grid del álbum de fotos
- Dashboard del organizador (métricas)

---

## 🔊 PASO 18 — SISTEMA DE SONIDOS (sutil)

Usar `use-sound` con volumen bajo (0.3) para:

```tsx
// Archivos de sonido a crear en /public/sounds/:
// swipe-right.mp3  — whoosh suave hacia la derecha
// swipe-left.mp3   — whoosh suave hacia la izquierda
// match.mp3        — chime corto + alegre (200ms)
// super-like.mp3   — sonido de estrella mágica
// message.mp3      — pop suave de notificación
// photo.mp3        — click de cámara

// IMPORTANTE: Todos deben ser sutiles (<200ms), nunca intrusivos
// Siempre respetar prefers-reduced-motion para las animaciones
// El usuario puede silenciar desde su perfil
```

---

## 📱 PASO 19 — OPTIMIZACIONES MOBILE-FIRST

```tsx
// Safe areas para iPhone con notch/Dynamic Island:
// padding-top: env(safe-area-inset-top)
// padding-bottom: env(safe-area-inset-bottom)

// Viewport height correcto en móvil (evitar el bug de 100vh):
// height: 100dvh  (dynamic viewport height — soportado en iOS 15.4+)
// Fallback: height: calc(var(--vh, 1vh) * 100)
// Implementar en JS: document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)

// Touch targets mínimo 44px en todos los elementos interactivos
// Scroll behavior: scroll-smooth + overscroll-behavior-y: contain
// Tap highlight color transparente: -webkit-tap-highlight-color: transparent
// Prevenir zoom en inputs (font-size: 16px mínimo en todos los inputs)
// Rubber band effect nativo en iOS debe funcionar correctamente
```

---

## 🎬 PASO 20 — TRANSICIONES DE PÁGINA (Next.js App Router)

```tsx
// Crear: components/providers/PageTransition.tsx
// Envolver todas las páginas con AnimatePresence de Motion

// Transición estándar entre páginas:
// exit: { opacity: 0, y: -10, duration: 0.2 }
// initial: { opacity: 0, y: 10 }
// animate: { opacity: 1, y: 0, duration: 0.3, ease: [0.16, 1, 0.3, 1] }

// Transición especial para el swipe (horizontal):
// Ir a "Likes": slide desde la derecha
// Ir a "Buscar": slide desde la izquierda
// Ir a "Perfil": slide desde abajo (como un sheet)

// Shared element transitions (Motion layoutId):
// La foto de perfil en la tarjeta → modal de match
// La miniatura en la galería → lightbox
// El avatar en la lista de matches → header del chat
```

---

## 📝 NOTAS FINALES PARA CLAUDE CODE

1. **No borres funcionalidad existente**. Este es un refactor visual puro — toda la lógica de negocio, API calls, y estado se mantienen intactos.

2. **Comienza por los Design Tokens** (Paso 2) antes de tocar cualquier componente. Sin el sistema base, los componentes individuales serán inconsistentes.

3. **La tarjeta de swipe es la prioridad máxima** (Paso 4). Si solo puedes mejorar una cosa, que sea esa.

4. **Usa `prefers-reduced-motion`** para todas las animaciones:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

5. **Performance**: Usa `will-change: transform` solo en elementos que realmente animan. No en todo. El `backdrop-filter` es costoso en mobile — usalos con `@supports`.

6. **Testea en iOS Safari** específicamente. Es el navegador más restrictivo con los gestos táctiles y el safe-area.

7. **El gradiente de N'GAGE** (`#FF2D78 → #7B2FBE → #1A6EFF`) debe aparecer consistentemente en: CTAs primarios, elementos activos, bordes de highlight, y el logo. No en todo lo demás.

8. **Fuentes como fallback**: Si Clash Display o Satoshi no cargan, usar `system-ui, -apple-system, sans-serif` como fallback — nunca Arial o Roboto.

---

*Prompt de Rediseño Frontend N'GAGE v1.0*
*Basado en investigación de mejores librerías y tendencias de diseño 2025*
