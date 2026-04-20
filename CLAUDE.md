# N'GAGE — Claude Code Instructions

## Proyecto
App web de dating/conexion social por evento. Efimera, mobile-first.
"Conecta en el momento."

## Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **DB**: Supabase (PostgreSQL + Auth + Realtime)
- **ORM**: Prisma 7.4 con adapter-pg
- **Auth**: Supabase Auth (Google OAuth)
- **Fotos**: Cloudinary
- **Email**: Resend
- **Estilos**: Tailwind CSS v4 + shadcn/ui (style: base-nova) + Framer Motion
- **Estado**: Zustand
- **Icons**: Lucide React
- **i18n**: next-intl

## Roles y Rutas
| Rol | Ruta base | Descripcion |
|-----|-----------|-------------|
| SUPER_ADMIN | /admin | Duenos de plataforma |
| EVENT_ORGANIZER | /dashboard | Quien contrata el servicio |
| EVENT_HOST | /host/[eventId] | Protagonistas del evento (max 3) |
| GUEST | /event/[id]/* | Invitados que escanean QR |

## Idioma
- Todo el codigo (variables, funciones, componentes, commits) en **ingles**
- UI y textos al usuario en **espanol** (via next-intl, archivos en /messages)

---

## UI/UX Guidelines — OBLIGATORIO

### Skill de diseno
- Usar la skill **ui-ux-pro-max** para TODO trabajo de UI/UX (diseno, review, build, mejoras)
- Se activa automaticamente al pedir trabajo visual

### Mobile-First
- Disenar SIEMPRE para mobile primero (375px base)
- Touch targets minimo 44x44px
- Swipe gestures nativos (react-tinder-card, react-swipeable)
- Bottom navigation para guests, nunca top navbar en mobile
- Safe areas para notch/home indicator

### Design System — Paleta
```
Brand:
  pink:    #D6285A  (accion principal, likes, CTAs)
  purple:  #4A1C73  (fondo premium, gradientes)
  blue:    #1449A8  (info, links, secondary)
  gold:    #D4AF37  (premium, super likes, badges)

Surfaces (dark theme):
  base:     #000000
  card:     #0A0A0A
  elevated: #121212

Text:
  primary:   #FAFAFA
  secondary: #999999
  muted:     #555555
```

### Gradientes
- **brand-gradient**: `linear-gradient(135deg, #D6285A 0%, #4A1C73 50%, #1449A8 100%)` — headers, CTAs principales
- **brand-gradient-soft**: version al 10% opacidad — fondos sutiles
- **gold-gradient**: `linear-gradient(135deg, #D4AF37, #B5952F)` — elementos premium
- **card-overlay**: `linear-gradient(to top, #000 0%, rgba(0,0,0,0.6) 40%, transparent 80%)` — sobre fotos

### Tipografia
- `font-display` — Titulos y headings
- `font-body` — Texto general
- `font-mono` — Codigo, timers, contadores

### Estilo Visual
- **Dark mode** siempre (superficie negra)
- **Glassmorphism** en cards y modales: `backdrop-blur-xl bg-white/5 border border-white/10`
- **Glow effects** en botones principales: `shadow-pink`, `shadow-blue`, `shadow-gold`
- **Bordes redondeados grandes**: rounded-2xl (16px), rounded-3xl (24px)
- **Animaciones suaves** con Framer Motion: fade-in, slide-up, scale
- Sin bordes duros, todo suave y fluido

### Componentes — shadcn/ui
- Siempre usar shadcn/ui como base (style: base-nova, baseColor: neutral)
- Personalizar con las clases de Tailwind del design system
- Iconos: solo Lucide React
- Botones primarios: bg-brand-gradient con hover glow
- Cards: bg-surface-card con glassmorphism

### Animaciones (Framer Motion)
- `animate-pulse-brand` — CTAs que necesitan atencion
- `animate-float` — elementos decorativos
- `animate-shimmer` — loading states
- `animate-slide-up` — entrada de contenido
- `animate-glow` — texto destacado
- Transiciones de pagina: fade + slide sutil
- Match modal: scale + confetti (canvas-confetti)

### Accesibilidad
- Contraste minimo WCAG AA
- Focus rings visibles con brand colors
- Aria labels en todos los botones de icono
- Reducir animaciones si `prefers-reduced-motion`

### UX Patterns Clave
1. **Swipe cards**: Tinder-like con indicadores visuales de like/nope/superlike
2. **Timer regresivo**: Prominente, genera urgencia, usa font-mono
3. **Match modal**: Celebratorio con confetti y glow
4. **Selfie capture**: Camara nativa con overlay circular
5. **Empty states**: Siempre con ilustracion/icono + CTA claro
6. **Loading**: Skeletons con shimmer, nunca spinners genericos
7. **Navegacion guest**: Bottom bar con iconos + badge para matches

---

## Convenciones de Codigo
- Componentes: PascalCase, un archivo por componente
- Hooks: `use` prefix, en /hooks
- API routes: /api/v1/[recurso]/route.ts
- Server actions: en archivos separados con "use server"
- Imports: usar aliases (@/components, @/lib, @/hooks, @/stores, @/types)
- Validacion: Zod en boundaries (forms, API input)
- Estado global: Zustand stores en /stores

## Archivos de Referencia
- `NGAGE_ClaudeCode_Prompt.md` — Especificacion completa del sistema
- `prisma/schema.prisma` — Schema de BD
- `middleware.ts` — Proteccion de rutas por rol
- `tailwind.config.ts` — Design tokens completos
