export default function Divider({ label, spacing = "md" }) {
  if (label) {
    return (
      <div className={`divider divider--labeled divider--${spacing}`}>
        <span className="divider-line" />
        <span className="divider-label">{label}</span>
        <span className="divider-line" />
      </div>
    );
  }

  return <hr className={`divider divider--${spacing}`} />;
}