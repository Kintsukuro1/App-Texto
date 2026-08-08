# Plan Maestro — Notion Local

> **Visión**: Aplicación de escritorio privada y colaborativa para gestión de conocimiento personal y en equipo. Se instala como un `.exe`, no requiere terminal ni configuración técnica. El dueño levanta el servidor y decide si lo usa solo, con amigos, o con su equipo. Los invitados se conectan desde el navegador vía LAN.

---

## ✅ Versión 1.0 — Completada

### 1.1 Infraestructura & Núcleo
- [x] **Esqueleto del proyecto** (Vite + React 19 + TypeScript + Tailwind v4)
- [x] **Núcleo de la App**: ErrorBoundary, Zustand, Shell con sidebar colapsable
- [x] **Backend & Persistencia**: SQLite + Drizzle ORM + Migraciones + API REST (Fastify + CORS)

### 1.2 Seguridad & Acceso
- [x] **Autenticación**: Registro, Login, Logout, `/api/auth/me`
- [x] **Sesiones Seguras**: Cookie `session_token` httpOnly + middleware `requireAuth`
- [x] **Perfil & Workspace**: Cambio de contraseña (bcrypt), avatar con color, nombre de workspace configurable (`/api/workspace`)

### 1.3 Edición & Navegación Base
- [x] **Editor BlockNote**: Integración completa, sin cajas grises, menú Slash `/` estilizado
- [x] **Cabecera de Página**: Emoji ícono + imagen de portada por URL
- [x] **Auto-guardado**: Debounce 400ms → SQLite + Fuse.js
- [x] **Tematización**: Modo Oscuro (Deep Slate) y Claro (Clean Light) + tipografías Sans/Mono
- [x] **Sidebar**: 3 secciones (Favoritos, Recientes, Todas) con colapso animado
- [x] **Búsqueda difusa (`Ctrl+K`)**: Modal Fuse.js con navegación por teclado
- [x] **Hub Principal**: Saludo dinámico por hora, mascota SVG (`idle/happy`), accesos directos

### 1.4 Colaboración en Tiempo Real
- [x] **Motor WebSocket**: Hocuspocus (puerto 1234) + Yjs + SQLite (`yjs-docs.db`)
- [x] **Auth WebSocket**: Validación de cookie `session_token` en handshake
- [x] **Cursores Compartidos**: Nombres y colores en tiempo real (`showCursorLabels: 'activity'`)
- [x] **Presencia en Vivo**: Hook `usePresence` + avatares en el header de la nota

---

## 🚀 Fase 2 — Empaquetado como App de Escritorio (Electron)

> **Meta**: Convertir la app en un `.exe` instalable, sin terminal, sin configuración manual. El usuario abre la app y todo funciona.

### 2.1 Migración a Electron
- [x] **Main Process**: Levantar Fastify y Hocuspocus dentro del proceso principal de Electron (Node.js embebido)
- [x] **Renderer Process**: Cargar la app React (build de Vite) en la ventana de Electron
- [x] **Rutas de datos del sistema**: Mover las bases de datos SQLite a `AppData` del sistema (`app.getPath('userData')`)
- [x] **IPC (Inter-Process Communication)**: `get-server-info` expone puerto, puerto collab e IP local
- [x] **Auth WebSocket mejorada**: Token pasado directamente al provider (sin depender de cookies entre puertos)
- [x] **Build Script**: `electron-builder` → genera `.exe` instalable para Windows (validado y empaquetado)

### 2.2 Experiencia LAN & Servidor Web
- [x] **Detección automática de IP local**: `getLocalIP()` en el main process
- [x] **Panel "Compartir"**: Muestra `http://[IP]:3001` + código QR para que otros escaneen y entren desde su navegador
- [x] **Servidor de archivos estáticos**: Fastify sirve la app SPA (`dist`) en `/` con fallback index.html (sin 404 al abrir en navegador)
- [x] **Subida de Imágenes / GIFs**: Endpoint `/api/upload` con `@fastify/multipart` que guarda archivos locales en `DATA_DIR/uploads/`
- [x] **Integración con Editor y Portadas**: Subir imágenes/GIFs desde PC o teléfono tanto en portadas/banners como dentro de los bloques de BlockNote
- [x] **System Tray**: La app corre en segundo plano con ícono en la bandeja. Menú: Abrir, Estado del servidor, Salir

### 2.3 Mantenimiento & Sistema
- [x] **Arranque con Windows**: Checkbox en Ajustes para iniciar el servidor en segundo plano al encender el PC (`app.setLoginItemSettings`)
- [x] **Backup Automático & Exportación BD**: Copias de seguridad de las bases de datos SQLite en carpeta configurable y descarga directa desde Ajustes

---

## 📚 Fase 3 — Gestión del Conocimiento & Productividad

> **Meta**: Transformar la colección de notas en una red de conocimiento navegable y acelerar el flujo de escritura.

### 3.1 Estructura & Organización de Notas
- [x] **Árbol de Sub-páginas (Sidebar jerárquico)**: Páginas anidadas (Padre → Hijo) con collapse animado y creación rápida con `+`
- [x] **Tags (`#tag`)**: Asignación de etiquetas en la nota y chips de filtrado rápido en el Sidebar
- [x] **Drag & Drop en Sidebar**: Reordenar y mover páginas entre carpetas arrastrando, con indicador visual de posición

### 3.2 Conexión & Previsualización
- [x] **Menciones entre notas & Enlaces**: Referencias dinámicas por título / ID entre notas
- [x] **Panel of Backlinks**: Al pie de cada nota, sección "Páginas que mencionan esta nota" con accesos directos
- [x] **"Peek" de nota (hover preview)**: Al hacer hover sobre un `[[enlace]]` o referencia de backlink, muestra un popover con el contenido sin necesidad de navegar

### 3.3 Productividad & Escritura Focus
- [x] **Command Palette ejecutable (`Ctrl+K`)**: Acciones rápidas (tema, nueva nota, inicio, perfil, eliminar, diario, zen) + búsqueda Fuse.js
- [x] **Daily Notes (`Ctrl+D`)**: Crea/abre automáticamente la página del día. Genera un hábito de uso diario y sirve de journal
- [x] **Templates de Nota**: Plantillas predefinidas (Meeting Notes, Weekly Review, Diario, etc.) accesibles desde la nota o Command Palette
- [x] **Modo Focus / Zen (`Ctrl+Shift+F`)**: Oculta sidebar, header y UI. Solo el editor. Para escritura sin distracciones
- [x] **Tabla de Contenidos automática**: TOC flotante generada a partir de los headings de la nota, visible en el margen derecho

---

## 💾 Fase 4 — Confianza y Colaboración Profunda

> **Meta**: Hacer que el trabajo en equipo sea seguro, reversible y organizado.

### 4.1 Historial & Versionado
- [x] **Historial de Versiones (Snapshots)**: Guardar versiones por sesión y manuales. Previsualizar instantáneas, ver autor y restaurar versiones anteriores en 1 clic

### 4.2 Comunicación & Notificaciones
- [x] **Comentarios por Nota/Bloque**: Panel lateral de comentarios (`💬 Comentarios`), avatares de autoría, hilos activos/resueltos y eliminación
- [x] **Notificaciones del Sistema**: Alertas nativas de Windows/Browser (`Notification API`) al publicar comentarios o eventos colaborativos

### 4.3 Organización de Espacios & Permisos
- [x] **Múltiples Workspaces**: Selector desplegable (`WorkspaceSelector.tsx`) para crear y alternar entre contextos (Personal / Trabajo / Universidad) con filtrado de notas por espacio independiente
- [x] **Roles y Permisos**: Soporte de permisos (Editor vs Solo Lectura `readOnly`) con bloqueos visuales en el editor
- [x] **Notas Privadas (candado 🔒)**: Marcar una nota como privada → invisible para otros roles aunque compartan el mismo workspace

---

## 📤 Fase 5 — Salida, Visualización y Distribución

> **Meta**: Facilitar la importación/exportación de contenidos y la visualización espacial de la red de notas.

### 5.1 Intercambio de Archivos & Formatos
- [x] **Exportación**: `.md` (Markdown) y `.html` descargables por nota desde la vista de la página
- [x] **Importación**: Lector e importador automático de archivos Markdown (`.md`) desde el explorador de Windows
- [x] **Exportar a PDF**: Genera un PDF limpio con los estilos de la app usando `@media print` e impresión web nativa
- [x] **Importar desde Obsidian**: Leer vault de Obsidian (`.md` con carpetas y referencias) y convertirlo manteniendo la estructura jerárquica

### 5.2 Visualización de Conocimiento
- [x] **Graph View 2D**: Mapa interactivo 2D de nodos (páginas) y aristas (menciones `[[Nota]]`) en HTML5 Canvas con navegación por clic

### 5.3 Distribución & Actualizaciones
- [ ] **Auto-Update**: Actualizaciones silenciosas desde `electron-updater`

---

## 🔮 Fase 6 — Ecosistema Avanzado

> **Meta**: Solo considerar cuando haya una base de usuarios real.

### 6.1 Extensibilidad & Integración
- [ ] **API Local documentada**: `GET /notes`, `POST /note`, `GET /tags` para integración con otras herramientas
- [ ] **Plugins Básicos**: API sencilla para extensiones de terceros

### 6.2 Seguridad & Sincronización
- [ ] **Sincronización P2P**: PC ↔ Laptop ↔ NAS sin depender de terceros
- [ ] **Cifrado de Base de Datos**: SQLCipher para cifrar SQLite en reposo

### 6.3 Búsqueda & Interacciones Avanzadas
- [ ] **Propiedades / Metadata por nota**: Campos estructurados (fecha, status, prioridad) como base para views tipo database. Cambio arquitectónico mayor
- [ ] **Menciones de usuario (`@nombre`)**: Notificación al colaborador mencionado dentro del texto de la nota
- [ ] **Atajos de teclado personalizables**: Pantalla de keybindings editable al estilo VS Code
- [ ] **SQLite FTS5**: Reemplazar Fuse.js por full-text search nativo de SQLite cuando el volumen de notas lo justifique

---

## ❄️ Congelado (sin prioridad activa)

- Mascota interactiva avanzada (animaciones por logros) — dejar como está
- Gamificación / rachas de productividad — no agrega valor en la dirección actual
- Kanban / Vista de Tabla — postponer hasta Fase 5+
- Graph View 3D — espectacular visualmente, pero nadie lo usa para navegar en serio. El 2D es suficiente
- Reacciones a bloques (👍❤️🔥) — fun, pero valor marginal en equipos pequeños
- Chat de Workspace — scope creep. La app es para notas, no mensajería
- Portadas generativas (gradientes animados) — cosmética pura, ya hay portadas por URL e imagen local
- Modo Revisión / Track Changes — duplica el historial de versiones ya implementado
- Webhooks salientes — orientado a devs integradores, no al usuario objetivo
