export default function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-soft ${
        hover ? 'hover:shadow-lg hover:-translate-y-0.5 transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}