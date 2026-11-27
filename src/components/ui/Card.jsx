export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`frost-card rounded-2xl ${
        hover ? 'frost-card-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
