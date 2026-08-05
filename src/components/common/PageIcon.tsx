import React from 'react';

interface PageIconProps {
  icon?: string | null;
  className?: string;
  fallback?: string;
}

export const isImageIcon = (icon?: string | null): boolean => {
  if (!icon) return false;
  const lower = icon.trim().toLowerCase();
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('/uploads/') ||
    lower.startsWith('data:image/') ||
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg')
  );
};

export const PageIcon: React.FC<PageIconProps> = ({
  icon,
  className = 'w-4 h-4 rounded object-cover shrink-0',
  fallback = '📄',
}) => {
  if (!icon) {
    return <span className="shrink-0">{fallback}</span>;
  }

  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt="Page Icon"
        className={className}
        onError={(e) => {
          // Fallback en caso de que la imagen falle
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return <span className="shrink-0">{icon}</span>;
};
