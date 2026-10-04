export default function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition placeholder:text-slate-400 ${
          error ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
}