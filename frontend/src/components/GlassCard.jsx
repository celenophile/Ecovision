export default function GlassCard({ children, className = "", strong = false, glow = false, as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`relative rounded-3xl ${strong ? "glass-strong" : "glass"} ${
        glow ? "shadow-glow" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
