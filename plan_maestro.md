# Plan Maestro — Notion Local

> **Visión**: Aplicación de escritorio privada y colaborativa para gestión de conocimiento personal y en equipo. Se instala como un `.exe`, no requiere terminal ni configuración técnica. El dueño levanta el servidor y decide si lo usa solo, con amigos, o con su equipo. Los invitados se conectan desde el navegador vía LAN.

---

## ✅ Versión 1.0 — Completada

### 🏗️ Infraestructura & Núcleo
- [x] **Esqueleto del proyecto** (Vite + React 19 + TypeScript + Tailwind v4)
- [x] **Núcleo de la App**: ErrorBoundary, Zustand, Shell con sidebar colapsable
- [x] **Backend & Persistencia**: SQLite + Drizzle ORM + Migraciones + API REST (Fastify + CORS)

### 🔒 Seguridad & Acceso
- [x] **Autenticación**: Registro, Login, Logout, `/api/auth/me`
- [x] **Sesiones Seguras**: Cookie `session_token` httpOnly + middleware `requireAuth`
- [x] **Perfil & Workspace**: Cambio de contraseña (bcrypt), avatar con color, nombre de workspace configurable (`/api/workspace`)

### 📝 Edición & Navegación
- [x] **Editor BlockNote**: Integración completa, sin cajas grises, menú Slash `/` estilizado
- [x] **Cabecera de Página**: Emoji ícono + imagen de portada por URL
- [x] **Auto-guardado**: Debounce 400ms → SQLite + Fuse.js
- [x] **Tematización**: Modo Oscuro (Deep Slate) y Claro (Clean Light) + tipografías Sans/Mono
- [x] **Sidebar**: 3 secciones (Favoritos, Recientes, Todas) con colapso animado
- [x] **Búsqueda difusa (`Ctrl+K`)**: Modal Fuse.js con navegación por teclado
- [x] **Hub Principal**: Saludo dinámico por hora, mascota SVG (`idle/happy`), accesos directos

### 🤝 Colaboración en Tiempo Real
- [x] **Motor WebSocket**: Hocuspocus (puerto 1234) + Yjs + SQLite (`yjs-docs.db`)
- [x] **Auth WebSocket**: Validación de cookie `session_token` en handshake
- [x] **Cursores Compartidos**: Nombres y colores en tiempo real (`showCursorLabels: 'activity'`)
- [x] **Presencia en Vivo**: Hook `usePresence` + avatares en el header de la nota

---

## 🚀 Fase 2 — Empaquetado como App de Escritorio (Electron)

> **Meta**: Convertir la app en un `.exe` instalable, sin terminal, sin configuración manual. El usuario abre la app y todo funciona.

### 2.1 Migración a Electron
- [x] Instalar y configurar `electron` + `electron-builder`
- [x] **Main Process**: Levantar Fastify y Hocuspocus dentro del proceso principal de Electron (Node.js embebido)
- [x] **Renderer Process**: Cargar la app React (build de Vite) en la ventana de Electron
- [x] Mover las bases de datos SQLite a `AppData` del sistema (`app.getPath('userData')`)
- [x] IPC (Inter-Process Communication): `get-server-info` expone puerto, puerto collab e IP local
- [x] **Auth WebSocket mejorada**: Token pasado directamente al provider (sin depender de cookies entre puertos)
- [ ] Build Script: `electron-builder` → genera `.exe` instalable para Windows *(pendiente validar)*

### 2.2 Experiencia LAN & Servidor Web
- [x] **Detección automática de IP local**: `getLocalIP()` en el main process
- [x] **Panel "Compartir"**: Muestra `http://[IP]:3001` + código QR para que otros escaneen y entren desde su navegador
- [x] **Servidor de archivos estáticos**: Fastify sirve la app SPA (`dist`) en `/` con fallback index.html (sin 404 al abrir en navegador)
- [x] **Subida de Imágenes / GIFs**: Endpoint `/api/upload` con `@fastify/multipart` que guarda archivos locales en `DATA_DIR/uploads/`
- [x] **Integración con Editor y Portadas**: Subir imágenes/GIFs desde PC o teléfono tanto en portadas/banners como dentro de los bloques de BlockNote
- [x] **System Tray**: La app corre en segundo plano con ícono en la bandeja. Menú: Abrir, Estado del servidor, Salir
- [ ] **Arranque con Windows** (opcional): Checkbox en Ajustes para iniciar el servidor al encender el PC



---

## 📚 Fase 3 — Gestión del Conocimiento

> **Meta**: Transformar la colección de notas en una red de conocimiento navegable.

- [x] **Árbol de Sub-páginas (Sidebar jerárquico)**: Páginas anidadas (Padre → Hijo) con collapse animado y creación rápida con `+`
- [x] **Menciones entre notas & Enlaces**: Referencias dinámicas por título / ID entre notas
- [x] **Panel of Backlinks**: Al pie de cada nota, sección "Páginas que mencionan esta nota" con accesos directos
- [x] **Tags (`#tag`)**: Asignación de etiquetas en la nota y chips de filtrado rápido en el Sidebar
- [x] **Command Palette ejecutable (`Ctrl+K`)**: Acciones rápidas (tema, nueva nota, inicio, perfil, eliminar) + búsqueda Fuse.js


---

## 💾 Fase 4 — Confianza y Colaboración Profunda

> **Meta**: Hacer que el trabajo en equipo sea seguro, reversible y organizado.

- [x] **Historial de Versiones (Snapshots)**: Guardar versiones por sesión y manuales. Previsualizar instantáneas, ver autor y restaurar versiones anteriores en 1 clic
- [x] **Comentarios por Nota/Bloque**: Panel lateral de comentarios (`💬 Comentarios`), avatares de autoría, hilos activos/resueltos y eliminación
- [x] **Múltiples Workspaces**: Selector desplegable (`WorkspaceSelector.tsx`) para crear y alternar entre contextos (Personal / Trabajo / Universidad) con filtrado de notas por espacio independiente
- [ ] **Roles y Permisos**: Dueño / Editor / Solo lectura por workspace o por página
- [ ] **Notificaciones del Sistema**: Alertas nativas de Windows ("Felipe comentó tu nota")

---

## 📤 Fase 5 — Salida, Visualización y Distribución

- [ ] **Exportación**: `.md` (Markdown), `.html`, sitio web estático (snapshot del workspace navegable sin backend)
- [ ] **Importación**: Archivos Markdown locales desde el explorador de Windows
- [ ] **Graph View**: Mapa interactivo 2D de nodos (páginas) y aristas (menciones) — requiere Fase 3 completada
- [ ] **Auto-Update**: Actualizaciones silenciosas desde `electron-updater`

---

## 🔮 Fase 6 — Ecosistema Avanzado

> Solo considerar cuando haya una base de usuarios real.

- [ ] **API Local documentada**: `GET /notes`, `POST /note`, `GET /tags` para integración con otras herramientas
- [ ] **Sincronización P2P**: PC ↔ Laptop ↔ NAS sin depender de terceros
- [ ] **Cifrado de Base de Datos**: SQLCipher para cifrar SQLite en reposo
- [ ] **Plugins Básicos**: API sencilla para extensiones de terceros

---

## ❄️ Congelado (sin prioridad activa)

- Mascota interactiva avanzada (animaciones por logros) — dejar como está
- Gamificación / rachas de productividad — no agrega valor en la dirección actual
- Kanban / Vista de Tabla — postponer hasta Fase 5+
