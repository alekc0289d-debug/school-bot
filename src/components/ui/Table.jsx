export default function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50/80">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap first:rounded-l-lg last:rounded-r-lg"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}