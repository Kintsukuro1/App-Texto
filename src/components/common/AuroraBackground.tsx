import { type ReactNode } from 'react';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
}

export const AuroraBackground = ({ children, className = '' }: AuroraBackgroundProps) => {
  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 transition-colors ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          className="absolute -inset-[10px] opacity-50 blur-[100px] filter"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.3) 45%, rgba(6, 182, 212, 0.15) 75%, transparent 100%)',
            animation: 'auroraPulse 15s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
