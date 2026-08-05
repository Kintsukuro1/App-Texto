import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ColorPicker, COLOR_OPTIONS } from '@/components/common/ColorPicker';

export const LoginScreen = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsSubmitting(true);
    if (isRegisterMode) {
      await register(username, password, selectedColor);
    } else {
      await login(username, password);
    }
    setIsSubmitting(false);
  };

  const toggleMode = () => {
    clearError();
    setIsRegisterMode(!isRegisterMode);
  };

  return (
    <div className="min-h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {isRegisterMode ? 'Crear cuenta de persona' : 'Bienvenido a Notion Local'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isRegisterMode
              ? 'Regístrate para comenzar a estructurar tus notas'
              : 'Ingresa tus credenciales para acceder a tu espacio'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-medium animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. felipe"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-muted)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Color de perfil
              </label>
              <ColorPicker
                selectedColor={selectedColor}
                onChange={setSelectedColor}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/25 mt-2"
          >
            {isSubmitting
              ? 'Procesando...'
              : isRegisterMode
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {isRegisterMode
              ? '¿Ya tienes una cuenta? Inicia sesión'
              : '¿No tienes cuenta? Registra una nueva persona'}
          </button>
        </div>
      </div>
    </div>
  );
};
