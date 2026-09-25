export default function PagematicLogoSvg({ className = "", width = 175, height = 175, style = {} }) {
  return (
    <img
      src="/pagematic-logo(2).png"
      alt="PageMatic Logo"
      width={width}
      height={height}
      className={className}
      style={{
        objectFit: "contain",
        display: "block",
        mixBlendMode: "multiply",
        ...style,
      }}
    />
  );
}

