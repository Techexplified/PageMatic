import React from "react";

/**
 * Clean, iconic, and uncluttered vector illustrations reflecting each page type.
 * Simple, beautiful visual metaphors without complex wireframes or false promises.
 */

// 1. LANDING PAGE — Launch, Growth & High-Impact Conversion
export function LandingPageIllustration() {
  return (
    <svg
      viewBox="0 0 140 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "86px", margin: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="rocketBody" x1="60" y1="20" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#0052FF" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="70" y1="58" x2="70" y2="76" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      {/* Soft Ambient Glow Circle */}
      <circle cx="70" cy="45" r="36" fill="#EFF6FF" />
      <circle cx="70" cy="45" r="28" fill="#DBEAFE" fillOpacity="0.5" />

      {/* Trajectory & Speed Lines */}
      <path d="M42 58 C 42 42, 54 28, 70 20" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
      <path d="M98 58 C 98 42, 86 28, 70 20" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />

      {/* Sparkles / Stars */}
      <path d="M38 32 L40 26 L42 32 L48 34 L42 36 L40 42 L38 36 L32 34 Z" fill="#F59E0B" opacity="0.9" />
      <path d="M100 24 L101.5 19 L103 24 L108 25.5 L103 27 L101.5 32 L100 27 L95 25.5 Z" fill="#3B82F6" opacity="0.8" />
      <circle cx="106" cy="48" r="2" fill="#F59E0B" />
      <circle cx="34" cy="50" r="1.5" fill="#3B82F6" />

      {/* Rocket Flame */}
      <path d="M64 56 Q 70 76, 70 78 Q 70 76, 76 56 Z" fill="url(#flameGrad)" />
      <path d="M66 56 Q 70 68, 70 70 Q 70 68, 74 56 Z" fill="#FEF08A" />

      {/* Rocket Fins */}
      <path d="M55 52 C 55 45, 62 44, 62 44 L59 58 L52 56 C 54 54, 55 53, 55 52 Z" fill="#1D4ED8" />
      <path d="M85 52 C 85 45, 78 44, 78 44 L81 58 L88 56 C 86 54, 85 53, 85 52 Z" fill="#1D4ED8" />

      {/* Rocket Fuselage */}
      <path d="M70 16 C 62 26, 61 46, 61 56 L 79 56 C 79 46, 78 26, 70 16 Z" fill="url(#rocketBody)" />

      {/* Nose Cone Accent */}
      <path d="M70 16 C 66 21, 64 27, 63 32 H 77 C 76 27, 74 21, 70 16 Z" fill="#EF4444" />

      {/* Porthole Window */}
      <circle cx="70" cy="38" r="5" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.2" />
      <circle cx="70" cy="38" r="3" fill="#60A5FA" />
      <circle cx="69" cy="37" r="1" fill="#FFFFFF" />
    </svg>
  );
}

// 2. HOME PAGE — Brand Storefront & Showcase
export function HomePageIllustration() {
  return (
    <svg
      viewBox="0 0 140 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "86px", margin: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="storeRoof" x1="40" y1="24" x2="100" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0052FF" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="doorGrad" x1="62" y1="52" x2="78" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
      </defs>

      {/* Soft Ambient Background Circle */}
      <circle cx="70" cy="45" r="36" fill="#F0FDF4" />
      <circle cx="70" cy="45" r="28" fill="#DCFCE7" fillOpacity="0.6" />

      {/* Sparkles */}
      <path d="M34 26 L35.5 22 L37 26 L41 27.5 L37 29 L35.5 33 L34 29 L30 27.5 Z" fill="#10B981" opacity="0.9" />
      <path d="M104 30 L105.5 26 L107 30 L111 31.5 L107 33 L105.5 37 L104 33 L100 31.5 Z" fill="#F59E0B" opacity="0.85" />
      <circle cx="36" cy="54" r="1.5" fill="#10B981" />
      <circle cx="106" cy="58" r="2" fill="#0052FF" />

      {/* Base Building Shadow & Ground */}
      <rect x="36" y="72" width="68" height="3" rx="1.5" fill="#CBD5E1" />

      {/* Main Store Building Walls */}
      <rect x="42" y="38" width="56" height="34" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

      {/* Windows Left & Right */}
      <rect x="46" y="46" width="14" height="18" rx="2" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="0.8" />
      <path d="M46 55 H60 M53 46 V64" stroke="#BFDBFE" strokeWidth="0.8" />

      <rect x="80" y="46" width="14" height="18" rx="2" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="0.8" />
      <path d="M80 55 H94 M87 46 V64" stroke="#BFDBFE" strokeWidth="0.8" />

      {/* Center Door */}
      <rect x="63" y="48" width="14" height="24" rx="2" fill="url(#doorGrad)" stroke="#3B82F6" strokeWidth="1" />
      <circle cx="73" cy="60" r="1.2" fill="#1D4ED8" />

      {/* Store Awning / Canopy */}
      <path d="M38 36 L42 24 H98 L102 36 Z" fill="url(#storeRoof)" />
      
      {/* Awning Stripes */}
      <path d="M47 24 L45 36 M60 24 L58 36 M72 24 L72 36 M84 24 L86 36 M95 24 L97 36" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.4" />

      {/* Scalloped Awning Fringe */}
      <path d="M38 36 Q 44 40, 50 36 Q 56 40, 62 36 Q 68 40, 74 36 Q 80 40, 86 36 Q 92 40, 98 36 Q 101 39, 102 36" fill="#1D4ED8" />

      {/* Store Sign Banner */}
      <rect x="54" y="16" width="32" height="10" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
      <circle cx="60" cy="21" r="1.8" fill="#10B981" />
      <rect x="65" y="19.5" width="16" height="3" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

// 3. PRODUCT PAGE — Featured Product Spotlight & Price Tag
export function ProductPageIllustration() {
  return (
    <svg
      viewBox="0 0 140 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "86px", margin: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="boxGrad" x1="44" y1="28" x2="96" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EFF6FF" />
        </linearGradient>
        <linearGradient id="tagGrad" x1="78" y1="18" x2="108" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Soft Ambient Circle */}
      <circle cx="70" cy="45" r="36" fill="#FEF3C7" fillOpacity="0.5" />
      <circle cx="70" cy="45" r="28" fill="#EFF6FF" />

      {/* Sparkles / Quality Stars */}
      <path d="M32 30 L34 25 L36 30 L41 31.5 L36 33 L34 38 L32 33 L27 31.5 Z" fill="#F59E0B" opacity="0.9" />
      <path d="M106 20 L107.5 16 L109 20 L113 21.5 L109 23 L107.5 27 L106 23 L102 21.5 Z" fill="#0052FF" opacity="0.8" />
      <circle cx="30" cy="55" r="1.5" fill="#3B82F6" />
      <circle cx="112" cy="52" r="2" fill="#F59E0B" />

      {/* Pedestal Base Shadow */}
      <ellipse cx="68" cy="73" rx="34" ry="5" fill="#CBD5E1" opacity="0.7" />

      {/* 3D Isometric Product Box / Showcase Pedestal */}
      {/* Box Front Face */}
      <path d="M46 44 L68 56 L68 70 L46 58 Z" fill="#0052FF" />
      {/* Box Right Face */}
      <path d="M68 56 L90 44 L90 58 L68 70 Z" fill="#1D4ED8" />
      {/* Box Top Face */}
      <path d="M68 30 L90 44 L68 56 L46 44 Z" fill="#3B82F6" />

      {/* Ribbon on Box */}
      <path d="M57 37 L79 50 L79 64 L57 51 Z" fill="#F59E0B" fillOpacity="0.85" />

      {/* Floating Price Tag */}
      <g transform="rotate(-12 88 32)">
        <path d="M82 22 L98 22 L106 30 L94 42 L78 42 L78 26 Z" fill="url(#tagGrad)" stroke="#B45309" strokeWidth="0.8" />
        <circle cx="83" cy="27" r="2" fill="#FFFFFF" />
        <text x="88" y="36" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">$</text>
      </g>

      {/* Rating Stars Strip at Bottom */}
      <g transform="translate(50, 77)">
        <circle cx="6" cy="3" r="1.8" fill="#F59E0B" />
        <circle cx="14" cy="3" r="1.8" fill="#F59E0B" />
        <circle cx="22" cy="3" r="1.8" fill="#F59E0B" />
        <circle cx="30" cy="3" r="1.8" fill="#F59E0B" />
        <circle cx="38" cy="3" r="1.8" fill="#F59E0B" />
      </g>
    </svg>
  );
}

// 4. FAQ PAGE — Question & Trust Shield
export function FaqPageIllustration() {
  return (
    <svg
      viewBox="0 0 140 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "86px", margin: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="faqBubbleBlue" x1="40" y1="20" x2="80" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#0052FF" />
        </linearGradient>
        <linearGradient id="faqBubbleGreen" x1="68" y1="40" x2="102" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Soft Ambient Background Circle */}
      <circle cx="70" cy="45" r="36" fill="#F5F3FF" />
      <circle cx="70" cy="45" r="28" fill="#EDE9FE" fillOpacity="0.6" />

      {/* Sparkles / Trust Marks */}
      <path d="M30 24 L31.5 20 L33 24 L37 25.5 L33 27 L31.5 31 L30 27 L26 25.5 Z" fill="#8B5CF6" opacity="0.9" />
      <path d="M108 26 L109.5 22 L111 26 L115 27.5 L111 29 L109.5 33 L108 29 L104 27.5 Z" fill="#10B981" opacity="0.85" />
      <circle cx="32" cy="52" r="1.5" fill="#3B82F6" />
      <circle cx="110" cy="56" r="2" fill="#8B5CF6" />

      {/* Background Subtle Trust Shield */}
      <path
        d="M70 16 C 80 16, 92 20, 92 32 C 92 50, 70 66, 70 66 C 70 66, 48 50, 48 32 C 48 20, 60 16, 70 16 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="1.2"
      />

      {/* Chat Bubble 1: Question Bubble (Blue) */}
      <g>
        <rect x="42" y="24" width="38" height="26" rx="8" fill="url(#faqBubbleBlue)" />
        {/* Bubble Tail */}
        <path d="M48 50 L44 56 L54 50 Z" fill="#0052FF" />
        {/* Bold Question Mark */}
        <text x="61" y="42" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">?</text>
      </g>

      {/* Chat Bubble 2: Answer & Verification Bubble (Green) */}
      <g>
        <rect x="66" y="42" width="38" height="26" rx="8" fill="url(#faqBubbleGreen)" />
        {/* Bubble Tail */}
        <path d="M96 68 L100 74 L90 68 Z" fill="#059669" />
        {/* Checkmark */}
        <path d="M78 55 L83 60 L93 50" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
