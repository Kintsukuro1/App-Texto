import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
            className="flex items-center justify-between px-6 pt-6 pb-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'var(--accent-primary)', color: '#fff' }}
              >
                📡
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  Compartir en red local
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Otros dispositivos en tu red pueden conectarse
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

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {serverInfo ? (
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: '#fff' }}
                  >
                    <QRCodeSVG
                      value={serverInfo.lanURL}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#1a1d23"
                      level="M"
                    />
                  </div>
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    Escanea desde el navegador del otro dispositivo
                  </p>
                </div>

                {/* URL */}
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    URL de conexión
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 text-sm font-mono truncate"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {serverInfo.lanURL}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: copied ? 'var(--accent-primary)' : 'var(--bg-hover)',
                        color: copied ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {copied ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="rounded-xl p-3 space-y-0.5"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>IP local</p>
                    <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {serverInfo.localIP}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3 space-y-0.5"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Puerto</p>
                    <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {serverInfo.port}
                    </p>
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
                    Los invitados solo necesitan abrir esa URL en su navegador. No requieren instalar nada.
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
                    Obteniendo información de red...
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
