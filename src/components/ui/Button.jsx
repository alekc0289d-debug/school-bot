export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'px-4 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

  const variants = {
    primary:
      'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.98]',
    secondary:
      'bg-sky-50 text-slate-700 border border-sky-200/70 hover:bg-sky-100 active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
