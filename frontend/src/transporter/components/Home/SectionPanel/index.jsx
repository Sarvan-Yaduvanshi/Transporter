





export function SectionPanel({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">{title}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
            </div>
            <div className="p-4">{children}</div>
        </div>);

}