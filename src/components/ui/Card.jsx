export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`frost-card rounded-2xl ${
        hover ? 'hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-0.5 transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
