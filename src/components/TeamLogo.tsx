import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface TeamLogoProps {
  logoUrl?: string | null;
  teamId: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
}

const getTeamColor = (teamId: string) => {
  const mapping: Record<string, string> = {
    mst: '#00E5FF',     // Marine Science
    ifs: '#D042FF',    // Info Systems
    bdg: '#FFA000',       // Building
    mcb: '#00E676',     // Micro-Biology
    cys: '#FF1744',      // Cyber
    age: '#1DE9B6',    // Agricultural
    ana: '#2979FF',     // Anatomy
    aph: '#FF9100',      // Animal
    bch: '#E040FB',     // Bio-Chemistry
    csp: '#76FF03',      // Crop Science
    ent: '#00B0FF',     // Entrepreneurship
    fwt: '#C6FF00',      // Forestry
    ice: '#651FFF',     // ICE
    idd: '#FFE082',    // Industrial Design
    mbbs: '#F50057',       // Medicine
    phy: '#E65100',        // Physics
    phs: '#29B6F6',     // Physiology
    simt: '#FFEB3B',    // Security Investment
    sta: '#CDDC39',     // Statistics
  };
  return mapping[teamId.toLowerCase()] || '#00E5FF';
};

export const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, teamId, className, size = 'md' }) => {
  const [hasError, setHasError] = useState(false);
  const color = getTeamColor(teamId);
  const initials = teamId.toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px] rounded-lg',
    sm: 'w-8 h-8 text-[10px] rounded-xl',
    md: 'w-12 h-12 text-[13px] rounded-xl',
    lg: 'w-16 h-16 text-[16px] rounded-2xl',
    xl: 'w-24 h-24 text-[22px] rounded-[24px]',
    custom: '',
  };

  const borderSizeClass = {
    xs: 'border',
    sm: 'border',
    md: 'border',
    lg: 'border-2',
    xl: 'border-2',
    custom: 'border',
  }[size];

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={teamId.toUpperCase()}
        onError={() => setHasError(true)}
        className={cn(
          "object-contain bg-black/40 p-1 border border-white/10 shadow-md",
          size !== 'custom' && sizeClasses[size],
          className
        )}
      />
    );
  }

  // Fallback: Initials Avatar
  return (
    <div
      className={cn(
        "font-display font-black tracking-wider flex items-center justify-center uppercase select-none transition-all duration-300 shadow-md",
        size !== 'custom' && sizeClasses[size],
        borderSizeClass,
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
        textShadow: `0 0 10px ${color}30`,
      }}
    >
      {initials}
    </div>
  );
}
