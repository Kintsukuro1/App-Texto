import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useUiStore } from '@/stores/useUiStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ColorPicker } from '@/components/common/ColorPicker';

export const ProfileSettings = () => {
  const { isProfileOpen, setProfileOpen, theme, setTheme, fontPreset, setFontPreset } = useUiStore();
  const { user, updateProfile, changePassword, error: authError, clearError } = useAuthStore();
  const { name: workspaceName, updateWorkspace } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'workspace' | 'settings'>('profile');

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

  useEffect(() => {
    if (isProfileOpen) {
      clearError();
      setProfileMsg(null);
      setPasswordMsg(null);
      setWsMsg(null);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setProfileOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[480px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 bg-[var(--bg-primary)] border-b md:border-b-0 md:border-r border-[var(--border-muted)] p-4 flex flex-row md:flex-col gap-1 shrink-0 overflow-x-auto">
          <div className="hidden md:block pb-3 px-2">
            <h3 className="font-bold text-xs tracking-wider uppercase text-[var(--text-secondary)]">
              Ajustes
            </h3>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>👤</span>
            <span>Mi perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>🔒</span>
            <span>Seguridad</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>🏢</span>
            <span>Espacio de trabajo</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span>🎨</span>
            <span>Ajustes generales</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between relative">
          <button
            onClick={() => setProfileOpen(false)}
            className="absolute top-4 right-4 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--bg-primary)]"
            title="Cerrar modal"
          >
            ✕
          </button>

          {/* TAB 1: MI PERFIL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Mi perfil</h2>
                <p className="text-xs text-[var(--text-secondary)]">Actualiza tu nombre e identidad visual</p>
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
                    Color de perfil
                  </label>
                  <ColorPicker selectedColor={color} onChange={setColor} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Guardando...' : 'Guardar perfil'}
              </button>
            </form>
          )}

          {/* TAB 2: CAMBIAR CONTRASEÑA */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Cambiar contraseña</h2>
                <p className="text-xs text-[var(--text-secondary)]">Mantén tu cuenta protegida</p>
              </div>

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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}

          {/* TAB 3: ESPACIO DE TRABAJO */}
          {activeTab === 'workspace' && (
            <form onSubmit={handleUpdateWorkspace} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Espacio de trabajo</h2>
                <p className="text-xs text-[var(--text-secondary)]">Personaliza el nombre de tu workspace compartido</p>
              </div>

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
                  Nombre del workspace
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
                {isUpdatingWs ? 'Guardando...' : 'Guardar nombre'}
              </button>
            </form>
          )}

          {/* TAB 4: AJUSTES GENERALES (TEMA + TIPOGRAFÍA) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Ajustes generales</h2>
                <p className="text-xs text-[var(--text-secondary)]">Apariencia visual y tipografía de la aplicación</p>
              </div>

              {/* Tema Claro / Oscuro */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Tema de color
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

              {/* Tipografía Curada */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-muted)]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Estilo de fuente
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
