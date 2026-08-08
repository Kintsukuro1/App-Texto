import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { API_BASE_URL, getAuthHeaders } from '@/core/config';

interface SharePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServerInfo {
  port: number;
  collabPort: number;
  localIP: string;
  lanURL: string;
}

export const SharePanel = ({ isOpen, onClose }: SharePanelProps) => {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [copiedLan, setCopiedLan] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'lan' | 'collaborators'>('public');

  // Estado del Túnel de Cloudflare
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);
  const [isTunnelStarting, setIsTunnelStarting] = useState(false);
  const [tunnelError, setTunnelError] = useState<string | null>(null);

  const { user, sessionToken } = useAuthStore();
  const { pages, activePageId } = useNotesStore();

  const activePage = activePageId ? pages[activePageId] : null;

  const lanInviteUrl = serverInfo
    ? activePageId
      ? `${serverInfo.lanURL}?invite=${activePageId}`
      : serverInfo.lanURL
    : '';

  const publicInviteUrl = tunnelUrl
    ? activePageId
      ? `${tunnelUrl}?invite=${activePageId}`
      : tunnelUrl
    : '';

  useEffect(() => {
    if (!isOpen) return;

    const fetchInfo = async () => {
      if (window.electronAPI?.getServerInfo) {
        const info = await window.electronAPI.getServerInfo();
        setServerInfo(info);
      } else {
        setServerInfo({
          port: 3001,
          collabPort: 1234,
          localIP: window.location.hostname,
          lanURL: `http://${window.location.hostname}:3001`,
        });
      }
    };

    const checkTunnelStatus = async () => {
      try {
        if (window.electronAPI?.getTunnelStatus) {
          const status = await window.electronAPI.getTunnelStatus();
          if (status.isRunning && status.url) {
            setTunnelUrl(status.url);
          }
        } else {
          const res = await fetch(`${API_BASE_URL}/api/tunnel/status`, {
            headers: getAuthHeaders(sessionToken),
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            if (data.isRunning && data.url) {
              setTunnelUrl(data.url);
            }
          }
        }
      } catch {
        // Ignorar
      }
    };

    fetchInfo();
    checkTunnelStatus();
  }, [isOpen, sessionToken]);

  const handleStartTunnel = async () => {
    setIsTunnelStarting(true);
    setTunnelError(null);
    try {
      if (window.electronAPI?.startTunnel) {
        const res = await window.electronAPI.startTunnel();
        if (res.success && res.url) {
          setTunnelUrl(res.url);
        } else {
          setTunnelError((res as { error?: string })?.error || 'No se pudo iniciar el túnel de Cloudflare');
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/tunnel/start`, {
          method: 'POST',
          headers: getAuthHeaders(sessionToken),
          credentials: 'include',
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setTunnelUrl(data.url);
        } else {
          setTunnelError(data.error || 'No se pudo iniciar el túnel de Cloudflare');
        }
      }
    } catch (err) {
      setTunnelError(err instanceof Error ? err.message : 'Error al conectar con Cloudflare');
    } finally {
      setIsTunnelStarting(false);
    }
  };

  const handleStopTunnel = async () => {
    try {
      if (window.electronAPI?.stopTunnel) {
        await window.electronAPI.stopTunnel();
      } else {
        await fetch(`${API_BASE_URL}/api/tunnel/stop`, {
          method: 'POST',
          headers: getAuthHeaders(sessionToken),
          credentials: 'include',
          body: JSON.stringify({}),
        });
      }
      setTunnelUrl(null);
    } catch (err) {
      console.error('Error al detener túnel:', err);
    }
  };

  const handleCopyLan = () => {
    if (!lanInviteUrl) return;
    navigator.clipboard.writeText(lanInviteUrl);
    setCopiedLan(true);
    setTimeout(() => setCopiedLan(false), 2000);
  };

  const handleCopyPublic = () => {
    if (!publicInviteUrl) return;
    navigator.clipboard.writeText(publicInviteUrl);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 pt-6 pb-3 space-y-3"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
                  style={{ background: 'var(--accent-primary)', color: '#fff' }}
                >
                  📡
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Compartir & Colaboración
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Invita amigos dentro de tu Wi-Fi o desde cualquier parte del mundo
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                ✕
              </button>
            </div>

            {/* Pestañas (Tabs) */}
            <div className="flex border-b border-[var(--border-muted)] gap-2 pt-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('public')}
                className={`pb-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'public'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>🌐</span>
                <span>Internet (Cloudflare)</span>
                {tunnelUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('lan')}
                className={`pb-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'lan'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>📲</span>
                <span>Red Local (LAN)</span>
              </button>

              <button
                onClick={() => setActiveTab('collaborators')}
                className={`pb-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'collaborators'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>👥</span>
                <span>Colaboradores</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {/* TAB 1: Internet Público (Cloudflare Tunnel) */}
            {activeTab === 'public' && (
              <div className="space-y-4">
                {tunnelUrl ? (
                  <>
                    {/* Tunnel Active Badge & Stop Button */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <div>
                          <p className="text-xs font-bold text-emerald-400">● Enlace Público Activo</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">Accesible desde cualquier lugar por HTTPS</p>
                        </div>
                      </div>
                      <button
                        onClick={handleStopTunnel}
                        className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer font-medium"
                      >
                        Detener Túnel
                      </button>
                    </div>

                    {/* QR Code for Public URL */}
                    <div className="flex flex-col items-center gap-2 py-1">
                      <div className="p-4 rounded-2xl bg-white shadow-lg">
                        <QRCodeSVG
                          value={publicInviteUrl}
                          size={150}
                          bgColor="#ffffff"
                          fgColor="#1a1d23"
                          level="M"
                        />
                      </div>
                      <p className="text-xs text-center font-medium text-[var(--text-secondary)] mt-1">
                        {activePage ? `Invitación directa a: "${activePage.title}"` : 'Invitación a Workspace'}
                      </p>
                    </div>

                    {/* URL Input Bar */}
                    <div className="rounded-xl p-3.5 space-y-2 bg-[var(--bg-tertiary)] border border-[var(--border-muted)]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          Enlace web público para compartir:
                        </p>
                        {activePage && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {activePage.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono truncate select-all text-indigo-400">
                          {publicInviteUrl}
                        </code>
                        <button
                          onClick={handleCopyPublic}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            copiedPublic
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          }`}
                        >
                          {copiedPublic ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl p-3 bg-indigo-500/10 border border-indigo-500/20 flex gap-2">
                      <span className="text-base shrink-0">✨</span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Cualquier persona con este enlace podrá abrir tu Notion Local desde su celular o navegador en tiempo real.
                      </p>
                    </div>
                  </>
                ) : (
                  /* Tunnel Inactive State */
                  <div className="py-4 space-y-4 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                      ☁️
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Crear Enlace Público Seguro (Cloudflare Tunnel)
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                        Genera una dirección web (`https://...trycloudflare.com`) cifrada y segura para invitar amigos fuera de tu red Wi-Fi sin abrir puertos en tu router.
                      </p>
                    </div>

                    {tunnelError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                        ⚠️ {tunnelError}
                      </div>
                    )}

                    <button
                      onClick={handleStartTunnel}
                      disabled={isTunnelStarting}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isTunnelStarting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Solicitando túnel a Cloudflare... (5-10s)</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>Activar Enlace Público de Cloudflare</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-[var(--text-muted)] italic">
                      No requiere registros ni instalación previa. Es 100% automático.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Red Local (LAN) */}
            {activeTab === 'lan' && (
              <div className="space-y-4">
                {serverInfo ? (
                  <>
                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-2xl bg-white shadow-lg">
                        <QRCodeSVG
                          value={lanInviteUrl}
                          size={150}
                          bgColor="#ffffff"
                          fgColor="#1a1d23"
                          level="M"
                        />
                      </div>
                      <p className="text-xs text-center font-medium text-[var(--text-secondary)]">
                        {activePage ? `Invitación a nota: "${activePage.title}"` : 'Invitación a Workspace Local'}
                      </p>
                    </div>

                    {/* URL */}
                    <div className="rounded-xl p-3.5 space-y-2 bg-[var(--bg-tertiary)] border border-[var(--border-muted)]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[var(--text-secondary)]">
                          Enlace local (Red Wi-Fi):
                        </p>
                        {activePage && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {activePage.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono truncate select-all text-indigo-400">
                          {lanInviteUrl}
                        </code>
                        <button
                          onClick={handleCopyLan}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            copiedLan
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--border-muted)]'
                          }`}
                        >
                          {copiedLan ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="rounded-xl p-3 bg-indigo-500/10 border border-indigo-500/20 flex gap-2">
                      <span className="text-base shrink-0">💡</span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Cualquier dispositivo (teléfono, tablet o PC) conectado a tu misma red Wi-Fi puede acceder escaneando el QR o abriendo el enlace.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <p className="text-sm text-[var(--text-muted)]">Cargando información de red...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Colaboradores */}
            {activeTab === 'collaborators' && (
              <div className="space-y-4 py-1">
                <div className="text-xs text-[var(--text-secondary)] font-medium">
                  Usuarios en este espacio de trabajo:
                </div>

                <div className="space-y-2">
                  {user && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-muted)]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[var(--text-primary)]">
                            {user.username} (Tú)
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            ● En línea (Host/Anfitrión)
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Propietario
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[var(--text-secondary)]">🤝 Permiso predeterminado para invitados:</p>
                    <span className="text-[10px] text-indigo-400 font-mono">Colaborativo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-muted)] flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-primary)]">✏️ Editor</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Activo</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-muted)] flex items-center justify-between opacity-70">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">🔒 Solo Lectura</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Opcional</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                    Los colaboradores invitados tendrán sincronización en tiempo real y presencia activa de cursor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
