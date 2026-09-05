# Dashboard Principal — Contenedor de Proyectos

Plataforma web para centralizar y visualizar proyectos. Los administradores gestionan el catálogo y los usuarios; los clientes acceden a los proyectos que tienen autorizados.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS v4 |
| Base de datos | Firebase Firestore |
| Autenticación | OTP por correo + Magic Link (EmailJS) |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Deploy | Vercel |

---

## Funcionalidades

### Clientes
- Login sin contraseña — código OTP o magic link al correo
- Vista de proyectos activos autorizados
- Abrir proyectos en iframe dentro del dashboard o en pestaña nueva
- Acceso al repositorio de cada proyecto
- Perfil con datos de la cuenta

### Administradores
- Gestión completa de proyectos — crear, editar, activar/desactivar, eliminar
- Control de acceso por proyecto — lista de correos autorizados (vacía = público para todos)
- Gestión de usuarios — verificar, suspender, cambiar rol, expulsar
- Confirmación antes de acciones destructivas

---

## Lógica de visibilidad de proyectos

```
authorizedUsers vacío   →  visible para todos los clientes
authorizedUsers con correos  →  solo esas personas lo ven
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── ProtectedRoute.tsx       # Guarda rutas por rol y estado
│   └── ui/
│       ├── ProjectsModal.tsx    # CRUD de proyectos + gestión de usuarios
│       ├── Modal.tsx            # Modal genérico reutilizable
│       ├── sidebar.tsx          # Sidebar animado
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── otp-input.tsx
├── features/
│   └── auth/
│       ├── context/AuthContext.tsx
│       ├── pages/LoginPage.tsx
│       ├── pages/PendingApprovalPage.tsx
│       └── services/
│           ├── authService.ts   # getOrCreateUser en Firestore
│           └── emailService.ts  # OTP y magic link via EmailJS
├── hooks/
│   ├── useAuth.ts               # Sesión + rol + estado en tiempo real
│   └── useProjects.ts           # CRUD de proyectos en Firestore
├── pages/
│   ├── AdminDashboardPage.tsx
│   └── ClientDashboardPage.tsx
├── config/
│   └── firebase.ts
├── data/
│   └── projects.ts              # Interfaz Project
└── App.tsx                      # Rutas
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz con estos valores (nunca lo subas a git):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_TEMPLATE_ID_LINK=
VITE_EMAILJS_PUBLIC_KEY=
```

---

## Correr localmente

```bash
npm install
npm run dev
```

---

## Deploy en Vercel

1. Sube el repositorio a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. En **Settings → Environment Variables** agrega todas las variables del `.env`
4. Deploy — Vercel detecta Vite automáticamente

> El archivo `vercel.json` ya está configurado para que el routing de React funcione correctamente en producción.

---

## Flujo de autenticación

```
Usuario ingresa correo
       │
       ├── OTP  →  código de 6 dígitos al correo  →  verificación en cliente
       └── Link →  magic link al correo            →  token base64 en URL

Login exitoso → getOrCreateUser() en Firestore
       │
       ├── status: pending    →  /pending-approval  (espera aprobación del admin)
       ├── status: approved   →  /dashboard  (cliente)  o  /admin  (admin)
       └── status: suspended  →  /pending-approval
```

---

## Roles

| Rol | Acceso |
|---|---|
| `client` | `/dashboard` — ve proyectos activos autorizados |
| `admin` | `/admin` — gestión completa de proyectos y usuarios |

Los roles y estados se gestionan desde el panel de administración en tiempo real vía Firestore `onSnapshot`.
