export default function Loader({ label = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-slate-500 text-sm font-medium">{label}</p>
    </div>
  );
}