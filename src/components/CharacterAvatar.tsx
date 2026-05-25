/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AvatarProps {
  type: 'hero' | 'partner' | 'enemy' | 'merchant' | 'system' | 'custom';
  name?: string;
  className?: string;
}

export const CharacterAvatar: React.FC<AvatarProps> = ({ type, name = '', className = '' }) => {
  // Let's render beautifully styled vector character designs tailored to the role!
  switch (type) {
    case 'partner':
      // Elven priestess/partner icon - Cyan & Golden hair theme
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-cyan-600/30 to-cyan-950/80 rounded-2xl border-2 border-cyan-400 overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.3)] ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-200">
            {/* Background halo */}
            <circle cx="50" cy="45" r="25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" />
            
            {/* Elf Ears */}
            <path d="M 28,45 C 10,40 15,25 32,38 Z" fill="#FCE7F3" stroke="#EC4899" strokeWidth="1" />
            <path d="M 72,45 C 90,40 85,25 68,38 Z" fill="#FCE7F3" stroke="#EC4899" strokeWidth="1" />
            
            {/* Golden long hair */}
            <path d="M 24,40 C 20,65 24,90 28,100 M 76,40 C 80,65 76,90 72,100" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            <path d="M 30,30 C 15,40 20,80 30,90 M 70,30 C 85,40 80,80 70,90" fill="#F59E0B" />
            
            {/* Neck and robes */}
            <path d="M 44,70 L 50,80 L 56,70" fill="#FCE7F3" />
            <path d="M 33,80 C 40,78 60,78 67,80 L 72,100 L 28,100 Z" fill="#FFFFFF" stroke="#06B6D4" strokeWidth="2" />
            <path d="M 47,80 L 50,100 L 53,80 Z" fill="#FBBF24" />
            
            {/* Elf face */}
            <circle cx="50" cy="50" r="20" fill="#FFE4E6" />
            
            {/* Pretty hair bangs */}
            <path d="M 30,38 C 40,25 60,25 70,38 C 65,30 35,30 30,38 Z" fill="#F59E0B" />
            <path d="M 45,30 C 48,42 52,42 55,30 Z" fill="#D97706" />

            {/* Cute anime eyes */}
            <ellipse cx="43" cy="48" rx="3" ry="5" fill="#0891B2" />
            <circle cx="42.5" cy="46" r="1" fill="#FFFFFF" />
            <ellipse cx="57" cy="48" rx="3" ry="5" fill="#0891B2" />
            <circle cx="56.5" cy="46" r="1" fill="#FFFFFF" />
            
            {/* Blushing cheeks */}
            <ellipse cx="38" cy="53" rx="2.5" ry="1" fill="#F43F5E" opacity="0.5" />
            <ellipse cx="62" cy="53" rx="2.5" ry="1" fill="#F43F5E" opacity="0.5" />
            
            {/* Smile */}
            <path d="M 48,56 Q 50,58 52,56" stroke="#BE123C" strokeWidth="1" fill="none" strokeLinecap="round" />
          </svg>
          <span className="absolute bottom-1 px-2 py-0.5 text-[10px] font-mono tracking-wide bg-cyan-950/90 text-cyan-300 border border-cyan-500/30 rounded-full">
            伴侣 (Lilith)
          </span>
        </div>
      );
    case 'enemy':
      // Menacing monster/dark warrior - Purple/Rose spikes theme
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-rose-950/40 to-rose-950/90 rounded-2xl border-2 border-rose-500 overflow-hidden shadow-[0_0_15px_rgba(244,63,94,0.3)] ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400">
            {/* Spiky halo */}
            <path d="M 50,15 L 53,30 L 68,25 L 58,36 L 75,40 L 59,48 L 70,64 L 54,58 L 50,85 L 46,58 L 30,64 L 41,48 L 25,40 L 42,36 L 32,25 L 47,30 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Demonic Horns */}
            <path d="M 33,35 C 20,10 15,25 36,30 Z" fill="#111827" stroke="#F43F5E" strokeWidth="1.5" />
            <path d="M 67,35 C 80,10 85,25 64,30 Z" fill="#111827" stroke="#F43F5E" strokeWidth="1.5" />
            
            {/* Grim face guard */}
            <circle cx="50" cy="50" r="18" fill="#1F2937" stroke="#EF4444" strokeWidth="1" />
            
            {/* Glowing red visor eyes */}
            <path d="M 38,46 L 46,49 L 38,48 Z" fill="#EF4444" className="animate-pulse" />
            <path d="M 62,46 L 54,49 L 62,48 Z" fill="#EF4444" className="animate-pulse" />
            <polygon points="40,47 60,47 50,54" fill="none" stroke="#F43F5E" strokeWidth="1" />
            
            {/* Shadow cloak body */}
            <path d="M 25,75 C 35,68 65,68 75,75 L 80,100 L 20,100 Z" fill="#111827" stroke="#EF4444" strokeWidth="1.5" />
            <path d="M 40,75 L 50,90 L 60,75 Z" fill="#4B5563" />
            
            {/* Blood droplets / accent runes */}
            <circle cx="50" cy="28" r="1.5" fill="#EF4444" />
          </svg>
          <span className="absolute bottom-1 px-2 py-0.5 text-[10px] font-mono tracking-wide bg-rose-950/90 text-rose-300 border border-rose-500/30 rounded-full">
            魔物/强敌
          </span>
        </div>
      );
    case 'merchant':
      // Cute catgirl merchant - Amber/Gold colors
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-amber-600/30 to-amber-950/80 rounded-2xl border-2 border-amber-400 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)] ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-200">
            {/* Merchant sparkles */}
            <path d="M 15,20 L 17,25 L 22,23 L 18,27 L 20,32 L 16,29 L 12,33 L 14,28 L 9,25 L 14,24 Z" fill="#F59E0B" opacity="0.6" />
            <path d="M 85,20 L 83,25 L 78,23 L 82,27 L 80,32 L 84,29 L 88,33 L 86,28 L 91,25 L 86,24 Z" fill="#F59E0B" opacity="0.6" />
            
            {/* Cat Ears */}
            <polygon points="25,36 15,15 38,28" fill="#B45309" stroke="#FBBF24" strokeWidth="1.5" />
            <polygon points="27,34 20,20 34,28" fill="#FCA5A5" />
            <polygon points="75,36 85,15 62,28" fill="#B45309" stroke="#FBBF24" strokeWidth="1.5" />
            <polygon points="73,34 80,20 66,28" fill="#FCA5A5" />
            
            {/* Golden hair locks */}
            <path d="M 28,42 C 26,60 28,80 32,95 M 72,42 C 74,60 72,80 68,95" stroke="#B45309" strokeWidth="3" fill="none" />
            
            {/* Round face */}
            <circle cx="50" cy="50" r="19" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
            <circle cx="50" cy="50" r="18" fill="#FFFBEB" />
            
            {/* Cat Eyes */}
            <ellipse cx="43" cy="48" rx="3" ry="5" fill="#D97706" />
            <polygon points="42,45 44,45 43,49" fill="#FFFFFF" />
            <ellipse cx="57" cy="48" rx="3" ry="5" fill="#D97706" />
            <polygon points="56,45 58,45 57,49" fill="#FFFFFF" />

            {/* Cat Whisker marks */}
            <line x1="28" y1="52" x2="34" y2="52" stroke="#B45309" strokeWidth="1" />
            <line x1="28" y1="55" x2="33" y2="56" stroke="#B45309" strokeWidth="1" />
            <line x1="72" y1="52" x2="66" y2="52" stroke="#B45309" strokeWidth="1" />
            <line x1="72" y1="55" x2="67" y2="56" stroke="#B45309" strokeWidth="1" />
            
            {/* Cute cat nose and mouth */}
            <polygon points="49,53 51,53 50,54" fill="#E11D48" />
            <path d="M 47,56 Q 50,58 53,56 Q 50,58 47,56 Z" fill="#B45309" />
            
            {/* Outfit */}
            <path d="M 30,78 C 36,75 64,75 70,78 L 74,100 L 26,100 Z" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="50" cy="88" r="4" fill="#F59E0B" /> {/* Big bell */}
            <path d="M 48,88 L 52,88 M 50,86 L 50,90" stroke="#FFFBEB" strokeWidth="1" />
          </svg>
          <span className="absolute bottom-1 px-2 py-0.5 text-[10px] font-mono tracking-wide bg-amber-950/90 text-amber-300 border border-amber-500/30 rounded-full">
            商人 (Coco)
          </span>
        </div>
      );
    case 'system':
      // Mystical ancient runes / gear of destiny - Purple/Slate tech theme
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-purple-950/40 to-slate-900 rounded-2xl border-2 border-purple-500 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)] ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-300">
            {/* Concentric magical rings */}
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-spin-slow" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="#A855F7" strokeWidth="0.75" strokeDasharray="5 3" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
            
            {/* Rune triangles */}
            <polygon points="50,18 78,66 22,66" fill="none" stroke="#A855F7" strokeWidth="1.5" opacity="0.6" />
            <polygon points="50,82 22,34 78,34" fill="none" stroke="#C084FC" strokeWidth="1" opacity="0.6" />
             
            {/* Center glowing orb */}
            <circle cx="50" cy="50" r="10" fill="#0F172A" stroke="#C084FC" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="#C084FC" className="animate-pulse" />
            
            {/* Rune sparkles */}
            <line x1="50" y1="5" x2="50" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="88" x2="50" y2="95" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="50" x2="12" y2="50" stroke="currentColor" strokeWidth="1.5" />
            <line x1="88" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="absolute bottom-1 px-2 py-0.5 text-[10px] font-mono tracking-wide bg-purple-950/90 text-purple-300 border border-purple-500/30 rounded-full">
            命运之轮
          </span>
        </div>
      );
    case 'hero':
    default:
      // Player hero silhouette overlay with epic sword glow - Blue theme
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-sky-600/30 to-sky-950/80 rounded-2xl border-2 border-sky-400 overflow-hidden shadow-[0_0_15px_rgba(56,189,248,0.3)] ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-sky-200">
            {/* Action slashes */}
            <line x1="10" y1="20" x2="90" y2="80" stroke="#38BDF8" strokeWidth="0.5" opacity="0.4" />
            <line x1="10" y1="80" x2="90" y2="20" stroke="#38BDF8" strokeWidth="0.5" opacity="0.4" />
            
            {/* Spiky cool hair */}
            <path d="M 25,50 L 32,32 L 40,25 L 48,29 L 55,20 L 62,30 L 70,27 L 72,42 L 75,50 C 70,55 30,55 25,50 Z" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
            
            {/* Hero face */}
            <circle cx="50" cy="48" r="16" fill="#FFF1F2" />
            <path d="M 33,38 C 40,32 60,32 67,38" fill="none" stroke="#2563EB" strokeWidth="2.5" />
            
            {/* Anime eyes (Heroic determination) */}
            <polygon points="40,46 46,45 43,49" fill="#0369A1" />
            <circle cx="43" cy="47" r="0.75" fill="#FFFFFF" />
            <polygon points="60,46 54,45 57,49" fill="#0369A1" />
            <circle cx="57" cy="47" r="0.75" fill="#FFFFFF" />
            
            {/* Confident smirk */}
            <path d="M 47,56 L 53,55" stroke="#9F1239" strokeWidth="1.5" strokeLinecap="round" />

            {/* Glowing Holy Sword silhouette behind shoulder */}
            <path d="M 72,25 L 85,2 L 88,5 L 75,28 Z" fill="#F59E0B" className="animate-pulse" />
            <path d="M 73,26 L 79,20" stroke="#FFFFFF" strokeWidth="1.5" />
            
            {/* Armor collars */}
            <path d="M 30,75 C 38,65 62,65 70,75 L 76,100 L 24,100 Z" fill="#1E293B" stroke="#0EA5E9" strokeWidth="2" />
            <path d="M 45,71 L 50,78 L 55,71" fill="#FFF1F2" />
            <circle cx="50" cy="85" r="3.5" fill="#38BDF8" />
          </svg>
          <span className="absolute bottom-1 px-2 py-0.5 text-[10px] font-mono tracking-wide bg-sky-950/90 text-sky-300 border border-sky-400/30 rounded-full">
            冒险勇者
          </span>
        </div>
      );
  }
};
