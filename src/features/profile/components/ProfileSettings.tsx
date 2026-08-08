import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useUiStore, type AccentColor, type EditorWidth, type FontSizePreset, type LineHeightPreset, type AutoSaveInterval, type TrashRetentionDays } from '@/stores/useUiStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useNotesStore } from '@/stores/useNotesStore';
import { ColorPicker } from '@/components/common/ColorPicker';

type SettingsTab = 'profile' | 'security' | 'workspace' | 'appearance' | 'productivity' | 'data';

export const ProfileSettings = () => {
  const {
    isProfileOpen,
    setProfileOpen,
    theme,
    setTheme,
    fontPreset,
    setFontPreset,
    accentColor,
    setAccentColor,
    editorWidth,
    setEditorWidth,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    enableAnimations,
    setEnableAnimations,
    spellCheck,
    setSpellCheck,
    autoSaveInterval,
    setAutoSaveInterval,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationSound,
    setNotificationSound,
    trashRetentionDays,
    setTrashRetentionDays,
    autoStartWindows,
    setAutoStartWindows,
  } = useUiStore();

  const { user, updateProfile, changePassword, error: authError, clearError } = useAuthStore();
  const { name: workspaceName, updateWorkspace } = useWorkspaceStore();
  const { pages } = useNotesStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form State
  const [username, setUsername] = useState(user?.username || '');
  const [color, setColor] = useState(user?.color || '#6366f1');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Workspace Form State
  const [wsName, setWsName] = useState(workspaceName);
  const [wsMsg, setWsMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUpdatingWs, setIsUpdatingWs] = useState(false);

  // LAN Password State
  const [lanPass, setLanPass] = useState('');
  const [lanPassMsg, setLanPassMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isProfileOpen) {
      clearError();
      setProfileMsg(null);
      setPasswordMsg(null);
      setWsMsg(null);
      setLanPassMsg(null);
      if (user) {
        setUsername(user.username);
        setColor(user.color);
      }
      setWsName(workspaceName);
    }
  }, [isProfileOpen, user, workspaceName, clearError]);

  if (!isProfileOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    clearError();

    if (!username.trim()) return;

    setIsUpdatingProfile(true);
    const success = await updateProfile({ username: username.trim(), color });
    setIsUpdatingProfile(false);

    if (success) {
      setProfileMsg({ text: 'Perfil actualizado con éxito', type: 'success' });
    } else {
      setProfileMsg({ text: authError || 'Error al actualizar el perfil', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    clearError();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: 'Todos los campos son requeridos', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Las nuevas contraseñas no coinciden', type: 'error' });
      return;
    }

    setIsUpdatingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsUpdatingPassword(false);

    if (success) {
      setPasswordMsg({ text: 'Contraseña actualizada correctamente', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ text: authError || 'Error al cambiar contraseña', type: 'error' });
    }
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setWsMsg(null);
    if (!wsName.trim()) return;

    setIsUpdatingWs(true);
    const success = await updateWorkspace(wsName.trim());
    setIsUpdatingWs(false);

    if (success) {
      setWsMsg({ text: 'Nombre del espacio guardado', type: 'success' });
    } else {
      setWsMsg({ text: 'Error al actualizar espacio', type: 'error' });
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const { API_BASE_URL, getAuthHeaders } = await import('@/core/config');
      const token = useAuthStore.getState().sessionToken;
      const res = await fetch(`${API_BASE_URL}/api/backup/export`, {
        headers: getAuthHeaders(token),
        credentials: 'include',
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notion-local-backup-${new Date().toISOString().split('T')[0]}.db`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error al descargar backup:', err);
    }
  };

  const totalPages = Object.keys(pages).length;
  const privatePagesCount = Object.values(pages).filter((p) => p.isPrivate).length;
  const favoritePagesCount = Object.values(pages).filter((p) => p.isFavorite).length;

  const accentOptions: { id: AccentColor; label: string; bg: string }[] = [
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
    { id: 'violet', label: 'Violet', bg: 'bg-violet-500' },
    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setProfileOpen(false)}
    >
      <div
        className="w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Tabs */}
        <div className="w-full md:w-60 bg-[var(--bg-primary)] border-b md:border-b-0 md:border-r border-[var(--border-muted)] p-4 flex flex-row md:flex-col gap-1 shrink-0 overflow-x-auto">
          <div className="hidden md:block pb-3 px-2">
            <h3 className="font-bold text-xs tracking-wider uppercase text-[var(--text-secondary)]">
              Ajustes & Preferencias
            </h3>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'profile'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>👤</span>
            <span>Mi Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'security'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>🔒</span>
            <span>Seguridad & Acceso</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'workspace'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>🏢</span>
            <span>Espacio de Trabajo</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'appearance'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>🎨</span>
            <span>Apariencia & Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'productivity'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>⚡</span>
            <span>Productividad & Atajos</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'data'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>💾</span>
            <span>Datos & Red LAN</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between relative">
          <button
            onClick={() => setProfileOpen(false)}
            className="absolute top-4 right-4 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-xl hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            ✕
          </button>

          {/* TAB 1: MI PERFIL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Mi Perfil</h2>
                <p className="text-xs text-[var(--text-secondary)]">Actualiza tu identidad de usuario y color distintivo</p>
              </div>

              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium text-center ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Color de Perfil
                  </label>
                  <ColorPicker selectedColor={color} onChange={setColor} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
              </button>
            </form>
          )}

          {/* TAB 2: SEGURIDAD & ACCESO */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Seguridad & Acceso</h2>
                <p className="text-xs text-[var(--text-secondary)]">Protección de cuenta y control de autenticación</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Cambiar Contraseña
                </h3>

                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium text-center ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Contraseña Actual</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Confirmar Contraseña</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>

              <div className="pt-4 border-t border-[var(--border-muted)] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Clave de Acceso LAN (Opcional)
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Puedes requerir un código PIN de invitación para que otros usuarios se conecten desde la red local.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="PIN opcional para LAN..."
                    value={lanPass}
                    onChange={(e) => setLanPass(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setLanPassMsg('PIN de seguridad guardado')}
                    className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium cursor-pointer"
                  >
                    Guardar PIN
                  </button>
                </div>
                {lanPassMsg && <p className="text-[11px] text-emerald-400 font-medium">{lanPassMsg}</p>}
              </div>
            </div>
          )}

          {/* TAB 3: ESPACIO DE TRABAJO */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Espacio de Trabajo</h2>
                <p className="text-xs text-[var(--text-secondary)]">Ajustes del espacio compartido y retención de contenido</p>
              </div>

              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                {wsMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium text-center ${
                      wsMsg.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {wsMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Nombre del Workspace
                  </label>
                  <input
                    type="text"
                    required
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    placeholder="ej. Mi Espacio"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingWs}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingWs ? 'Guardando...' : 'Guardar Nombre'}
                </button>
              </form>

              {/* Retención de Papelera */}
              <div className="pt-4 border-t border-[var(--border-muted)] space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Limpieza Automática de Papelera
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([7, 30, 90, 0] as TrashRetentionDays[]).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setTrashRetentionDays(days)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                        trashRetentionDays === days
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {days === 0 ? 'Manual' : `${days} días`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Métricas del Workspace */}
              <div className="pt-4 border-t border-[var(--border-muted)]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                  Estadísticas del Espacio
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-2xl text-center">
                    <div className="text-xl font-bold text-indigo-400">{totalPages}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Páginas Totales</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-2xl text-center">
                    <div className="text-xl font-bold text-amber-400">{favoritePagesCount}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Favoritas</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-2xl text-center">
                    <div className="text-xl font-bold text-rose-400">{privatePagesCount}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Privadas 🔒</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APARIENCIA & EDITOR */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Apariencia & Editor</h2>
                <p className="text-xs text-[var(--text-secondary)]">Personaliza el diseño visual y la experiencia de lectura/escritura</p>
              </div>

              {/* Tema Claro / Oscuro */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Tema Base
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      theme === 'dark'
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xl">🌙</span>
                    <div className="text-left">
                      <div className="text-xs font-bold">Oscuro</div>
                      <div className="text-[10px] opacity-70">Deep Slate</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      theme === 'light'
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xl">☀️</span>
                    <div className="text-left">
                      <div className="text-xs font-bold">Claro</div>
                      <div className="text-[10px] opacity-70">Clean Light</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Estilo de Fuente */}
              <div className="space-y-2 pt-3 border-t border-[var(--border-muted)]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Estilo de Fuente
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFontPreset('default')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      fontPreset === 'default'
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-lg font-sans font-bold">Aa</span>
                    <div className="text-left">
                      <div className="text-xs font-bold font-sans">Predeterminada</div>
                      <div className="text-[10px] opacity-70">Moderna Sans-Serif</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFontPreset('mono')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      fontPreset === 'mono'
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-lg font-mono font-bold">Aa</span>
                    <div className="text-left">
                      <div className="text-xs font-bold font-mono">Elegante (Mono)</div>
                      <div className="text-[10px] opacity-70">Monospace Headings</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Color de Acento */}
              <div className="space-y-2 pt-3 border-t border-[var(--border-muted)]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Color de Acento Principal
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {accentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAccentColor(opt.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        accentColor === opt.id
                          ? 'border-indigo-400 bg-indigo-500/20 text-white'
                          : 'border-[var(--border-muted)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${opt.bg} shrink-0`} />
                      <span className="text-[11px] font-medium truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ancho del Editor */}
              <div className="space-y-2 pt-3 border-t border-[var(--border-muted)]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Ancho del Contenedor del Editor
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'narrow', label: 'Angosto (672px)' },
                    { id: 'normal', label: 'Normal (896px)' },
                    { id: 'full', label: 'Completo (1152px)' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setEditorWidth(w.id as EditorWidth)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                        editorWidth === w.id
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamaño de Letra e Interlineado */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border-muted)]">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Tamaño de Letra
                  </label>
                  <div className="flex gap-1 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-muted)]">
                    {(['sm', 'md', 'lg'] as FontSizePreset[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFontSize(sz)}
                        className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer uppercase ${
                          fontSize === sz
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Interlineado
                  </label>
                  <div className="flex gap-1 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-muted)]">
                    {(['compact', 'normal', 'spacious'] as LineHeightPreset[]).map((lh) => (
                      <button
                        key={lh}
                        type="button"
                        onClick={() => setLineHeight(lh)}
                        className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer capitalize ${
                          lineHeight === lh
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transiciones y Animaciones */}
              <div className="pt-3 border-t border-[var(--border-muted)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Animaciones y Efectos</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Activar micro-animaciones y transiciones suaves</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableAnimations(!enableAnimations)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    enableAnimations ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      enableAnimations ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTIVIDAD & ATAJOS */}
          {activeTab === 'productivity' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Productividad & Atajos</h2>
                <p className="text-xs text-[var(--text-secondary)]">Comportamiento del editor, guardado y notificaciones</p>
              </div>

              {/* Autoguardado */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Frecuencia de Autoguardado (Debounce)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 400, label: 'Rápido (400ms)' },
                    { val: 1000, label: 'Normal (1s)' },
                    { val: 2000, label: 'Conservador (2s)' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAutoSaveInterval(item.val as AutoSaveInterval)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                        autoSaveInterval === item.val
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-[var(--bg-primary)] border-[var(--border-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corrector Ortográfico */}
              <div className="pt-3 border-t border-[var(--border-muted)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Corrector Ortográfico</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Resaltar palabras mal escritas en el editor</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSpellCheck(!spellCheck)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    spellCheck ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      spellCheck ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Notificaciones */}
              <div className="pt-3 border-t border-[var(--border-muted)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Notificaciones de Escritorio</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Mostrar alertas nativas al recibir comentarios</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        notificationsEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">Efectos de Sonido</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">Reproducir sonido suave al recibir mensajes o notificaciones</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationSound(!notificationSound)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      notificationSound ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        notificationSound ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Tabla de Atajos Teclado */}
              <div className="pt-3 border-t border-[var(--border-muted)]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Atajos Rápidos de Teclado
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl flex items-center justify-between">
                    <span>Buscar notas</span>
                    <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] rounded border border-[var(--border-muted)] font-mono text-[10px]">Ctrl+K</kbd>
                  </div>
                  <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl flex items-center justify-between">
                    <span>Nota Diaria</span>
                    <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] rounded border border-[var(--border-muted)] font-mono text-[10px]">Ctrl+D</kbd>
                  </div>
                  <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl flex items-center justify-between">
                    <span>Modo Zen / Focus</span>
                    <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] rounded border border-[var(--border-muted)] font-mono text-[10px]">Ctrl+Shift+F</kbd>
                  </div>
                  <div className="p-2 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-xl flex items-center justify-between">
                    <span>Salir de Zen</span>
                    <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] rounded border border-[var(--border-muted)] font-mono text-[10px]">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DATOS & RED LAN */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Datos & Red LAN</h2>
                <p className="text-xs text-[var(--text-secondary)]">Gestión de copias de seguridad y servidor local</p>
              </div>

              {/* Backup BD */}
              <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl space-y-3">
                <div>
                  <div className="text-xs font-bold text-indigo-300">Copia de Seguridad SQLite</div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Descarga una copia completa e instantánea de la base de datos `notion-local.db`.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>💾</span>
                  <span>Descargar Copia de Seguridad (.db)</span>
                </button>
              </div>

              {/* Arrancar con Windows */}
              <div className="pt-3 border-t border-[var(--border-muted)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Iniciar con Windows</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Iniciar el servidor en segundo plano al encender la PC</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoStartWindows(!autoStartWindows)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoStartWindows ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      autoStartWindows ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Info Servidor LAN */}
              <div className="pt-3 border-t border-[var(--border-muted)] space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Estado del Servidor LAN
                </h3>
                <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-muted)] rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Puerto API Rest:</span>
                    <span className="font-mono text-indigo-400">3001</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Puerto Colaboración Yjs:</span>
                    <span className="font-mono text-emerald-400">1234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)]">Motor de Persistencia:</span>
                    <span className="font-mono text-[var(--text-primary)]">SQLite (Drizzle ORM)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
