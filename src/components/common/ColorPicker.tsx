export interface ColorOption {
  name: string;
  value: string;
  bgClass: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { name: 'Índigo', value: '#6366f1', bgClass: 'bg-indigo-500' },
  { name: 'Esmeralda', value: '#10b981', bgClass: 'bg-emerald-500' },
  { name: 'Rosa', value: '#f43f5e', bgClass: 'bg-rose-500' },
  { name: 'Ámbar', value: '#f59e0b', bgClass: 'bg-amber-500' },
  { name: 'Púrpura', value: '#a855f7', bgClass: 'bg-purple-500' },
  { name: 'Cian', value: '#06b6d4', bgClass: 'bg-cyan-500' },
];

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ selectedColor, onChange }: ColorPickerProps) => {
  return (
    <div className="flex items-center justify-between gap-2">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={`w-9 h-9 rounded-xl ${c.bgClass} flex items-center justify-center transition-all cursor-pointer ${
            selectedColor === c.value
              ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-surface)] scale-110'
              : 'opacity-70 hover:opacity-100'
          }`}
          title={c.name}
        >
          {selectedColor === c.value && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white drop-shadow"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};
