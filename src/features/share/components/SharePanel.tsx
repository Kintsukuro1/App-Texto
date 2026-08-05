import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'collaborators'>('invite');
  const { user } = useAuthStore();

  useEffect(() => {
    if (!isOpen) return;

    const fetchInfo = async () => {
      if (window.electronAPI?.getServerInfo) {
        const info = await window.electronAPI.getServerInfo();
        setServerInfo(info);
      } else {
        // Fallback para cuando corre en el navegador (sin Electron)
        setServerInfo({
          port: 3001,
          collabPort: 1234,
          localIP: window.location.hostname,
          lanURL: `http://${window.location.hostname}:3001`,
        });
      }
    };

    fetchInfo();
  }, [isOpen]);

  const handleCopy = () => {
    if (!serverInfo) return;
    navigator.clipboard.writeText(serverInfo.lanURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'var(--accent-primary)', color: '#fff' }}
                >
                  📡
                </div>
                <div>
                  <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                    Invitación & Red LAN
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Conecta amigos y dispositivos a tu espacio local
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                ✕
              </button>
            </div>

            {/* Pestañas (Tabs) */}
            <div className="flex border-b border-[var(--border-muted)] gap-4 pt-1">
              <button
                onClick={() => setActiveTab('invite')}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'invite'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                📲 Invitar Dispositivos / Amigos
              </button>
              <button
                onClick={() => setActiveTab('collaborators')}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'collaborators'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                👥 Colaboradores Activos
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {activeTab === 'invite' ? (
              serverInfo ? (
                <>
                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="p-4 rounded-xl"
                      style={{ background: '#fff' }}
                    >
                      <QRCodeSVG
                        value={serverInfo.lanURL}
                        size={150}
                        bgColor="#ffffff"
                        fgColor="#1a1d23"
                        level="M"
                      />
                    </div>
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      Escanea este código QR desde el celular o navegador
                    </p>
                  </div>

                  {/* URL */}
                  <div
                    className="rounded-xl p-3.5 space-y-2"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Enlace de invitación LAN
                    </p>
                    <div className="flex items-center gap-2">
                      <code
                        className="flex-1 text-xs font-mono truncate"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        {serverInfo.lanURL}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background: copied ? 'var(--accent-primary)' : 'var(--bg-hover)',
                          color: copied ? '#fff' : 'var(--text-primary)',
                        }}
                      >
                        {copied ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  <div
                    className="rounded-xl p-3 flex gap-2"
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <span className="text-base shrink-0">💡</span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Tus invitados entrarán directamente sin instalar nada. Al registrarse, podrán colaborar contigo en tiempo real.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
                    />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Cargando información de red...
                    </p>
                  </div>
                </div>
              )
            ) : (
              /* Pestaña Colaboradores */
              <div className="space-y-4 py-2">
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

                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-xs text-[var(--text-muted)] space-y-1">
                  <p className="font-medium text-[var(--text-secondary)]">🤝 Modo de Colaboración LAN</p>
                  <p className="text-[11px] leading-relaxed">
                    Cualquier usuario conectado a la red local que entre por la URL o QR aparecerá aquí y podrá ver y editar en tiempo real según los permisos.
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
