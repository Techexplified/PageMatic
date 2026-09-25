export default function PagematicLogoSvg({ className = "", width = 175, height = 175 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: "drop-shadow(0 18px 32px rgba(0, 82, 255, 0.14))" }}
    >
      <defs>
        {/* Window Background Gradient */}
        <linearGradient id="pmWindowBg" x1="28" y1="24" x2="190" y2="185" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F6FF" />
        </linearGradient>

        {/* Inner Screen Blue Gradient */}
        <linearGradient id="pmScreenGradient" x1="42" y1="62" x2="178" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0047FF" />
          <stop offset="55%" stopColor="#005BFF" />
          <stop offset="100%" stopColor="#1E75FF" />
        </linearGradient>

        {/* Screen Curved Reflection Wave */}
        <linearGradient id="pmScreenWave" x1="42" y1="62" x2="140" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* 3D Delta Arrow - Main Face Gradient */}
        <linearGradient id="pmArrowMainFace" x1="140" y1="130" x2="195" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#256BFF" />
          <stop offset="45%" stopColor="#0052FF" />
          <stop offset="100%" stopColor="#003ACC" />
        </linearGradient>

        {/* 3D Delta Arrow - Side Bevel / 3D Extrusion */}
        <linearGradient id="pmArrowExtrusion" x1="150" y1="140" x2="205" y2="215" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0035B8" />
          <stop offset="100%" stopColor="#001F80" />
        </linearGradient>

        {/* Window Ambient Drop Shadow */}
        <filter id="pmWindowDropShadow" x="14" y="16" width="194" height="186" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0052FF" floodOpacity="0.1" />
        </filter>

        {/* Cursor 3D Drop Shadow */}
        <filter id="pmCursor3DShadow" x="125" y="115" width="95" height="115" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="3" dy="10" stdDeviation="9" floodColor="#00248F" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 1. Browser Window Frame */}
      <g filter="url(#pmWindowDropShadow)">
        {/* Main Base Card */}
        <rect
          x="28"
          y="24"
          width="156"
          height="146"
          rx="24"
          fill="url(#pmWindowBg)"
          stroke="#DBEAFE"
          strokeWidth="2"
        />

        {/* Titlebar Divider Line */}
        <line x1="28" y1="52" x2="184" y2="52" stroke="#E2E8F0" strokeWidth="1.2" strokeOpacity="0.8" />

        {/* 3 Window Control Dots */}
        <circle cx="46" cy="38" r="4.2" fill="#0052FF" />
        <circle cx="59" cy="38" r="4.2" fill="#0052FF" />
        <circle cx="72" cy="38" r="4.2" fill="#0052FF" />

        {/* Inner Screen Container */}
        <g>
          <rect
            x="40"
            y="62"
            width="132"
            height="56"
            rx="12"
            fill="url(#pmScreenGradient)"
          />

          {/* Curved Reflection Path over Screen */}
          <path
            d="M 40 74 C 70 82, 110 94, 172 70 L 172 62 L 40 62 Z"
            fill="url(#pmScreenWave)"
            style={{ mixBlendMode: "overlay" }}
          />
        </g>

        {/* 2 Content Lines / Text Placeholders */}
        <rect x="40" y="128" width="70" height="9" rx="4.5" fill="#60A5FA" fillOpacity="0.9" />
        <rect x="40" y="144" width="46" height="9" rx="4.5" fill="#93C5FD" fillOpacity="0.85" />
      </g>

      {/* 2. Radiating Click Burst Capsule Rays */}
      <g stroke="#0052FF" strokeWidth="6" strokeLinecap="round">
        {/* Left ray */}
        <line x1="120" y1="138" x2="132" y2="140" />
        {/* Top-left ray */}
        <line x1="128" y1="116" x2="138" y2="124" />
        {/* Top-right ray */}
        <line x1="150" y1="104" x2="154" y2="116" />
        {/* Right ray */}
        <line x1="170" y1="114" x2="162" y2="124" />
      </g>

      {/* 3. Modern 3D Delta Pointer Arrow (Pointed Up-Left at ~45°) */}
      <g filter="url(#pmCursor3DShadow)">
        {/* 3D Extrusion / Side Rim */}
        <path
          d="
            M 144 135
            L 197 172
            C 202 175, 201 180, 196 182
            L 174 187
            L 165 214
            C 162 220, 155 217, 153 211
            L 138 144
            C 137 139, 140 133, 144 135 Z
          "
          fill="url(#pmArrowExtrusion)"
        />

        {/* 3D Arrow - Top Front Face */}
        <path
          d="
            M 142 131
            L 194 167
            C 198 170, 197 175, 193 177
            L 170 182
            L 161 208
            C 158 213, 152 211, 150 205
            L 136 139
            C 135 134, 138 129, 142 131 Z
          "
          fill="url(#pmArrowMainFace)"
        />

        {/* Spine Specular Highlight on Left Edge */}
        <path
          d="
            M 142 131
            L 136 139
            C 135 142, 137 146, 139 152
            L 150 205
            C 149 203, 148 200, 147 196
            L 138 141
            C 137 136, 139 133, 142 131 Z
          "
          fill="#FFFFFF"
          fillOpacity="0.35"
        />

        {/* Inner Curved Subtle Shine */}
        <ellipse
          cx="160"
          cy="158"
          rx="12"
          ry="6"
          transform="rotate(35 160 158)"
          fill="#FFFFFF"
          fillOpacity="0.2"
        />
      </g>
    </svg>
  );
}
