export default function PagematicLoadingSvg({ width = 250, height = 250, className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 250 250"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", ...style }}
    >
      <defs>
        <linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#68A6FF" />
          <stop offset="1" stopColor="#1B6BEE" />
        </linearGradient>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="15" stdDeviation="17" floodColor="#155EEF" floodOpacity="0.13" />
        </filter>
        <clipPath id="card">
          <rect x="52.5" y="69" width="145" height="112" rx="14" />
        </clipPath>
        <path id="star" d="M0-1 Q0 0 1 0 Q0 0 0 1 Q0 0 -1 0 Q0 0 0-1Z" />
      </defs>

      {/* halos */}
      <g fill="none" stroke="#D9E6FF" strokeWidth="1">
        <circle cx="125" cy="125" r="124.5">
          <animate attributeName="opacity" values=".45;1;.45" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="125" cy="125" r="94.5">
          <animate attributeName="opacity" values=".45;1;.45" dur="2.4s" begin=".25s" repeatCount="indefinite" />
        </circle>
        <circle cx="125" cy="125" r="69.5">
          <animate attributeName="opacity" values=".45;1;.45" dur="2.4s" begin=".5s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* browser card */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 -9;0 0"
          dur="2.5s"
          repeatCount="indefinite"
        />
        <rect x="52.5" y="69" width="145" height="112" rx="14" fill="#fff" filter="url(#shadow)" />
        <rect x="52.5" y="69" width="145" height="25" fill="url(#topbar)" clipPath="url(#card)" />
        <rect x="53" y="69.5" width="144" height="111" rx="13.5" fill="none" stroke="#B8D0F8" />
        <g fill="#fff" fillOpacity=".53">
          <circle cx="63.5" cy="81.5" r="3" />
          <circle cx="74.5" cy="81.5" r="3" />
          <circle cx="85.5" cy="81.5" r="3" />
        </g>
        <g fill="#DCEAFF">
          <rect x="66.5" y="108" width="91" height="11" rx="5.5" />
          <rect x="66.5" y="128" width="117" height="11" rx="5.5" />
          <rect x="66.5" y="148" width="64" height="11" rx="5.5" />
        </g>
      </g>

      {/* sparkles */}
      <use href="#star" transform="translate(206 51) scale(16)" fill="#155EEF">
        <animate attributeName="opacity" values=".65;1;.65" dur="1.8s" repeatCount="indefinite" />
      </use>
      <use href="#star" transform="translate(42 190) scale(12.5)" fill="#155EEF">
        <animate attributeName="opacity" values=".65;1;.65" dur="1.8s" begin=".4s" repeatCount="indefinite" />
      </use>
    </svg>
  );
}
