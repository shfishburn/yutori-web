type Props = {
  label?: string;
  labelColor?: string;
  heading: string;
  specs: [string, string][];
};

export function SectionSpecsTable({
  label,
  labelColor = 'text-fg-subtle',
  heading,
  specs,
}: Props) {
  return (
    <>
      {label && (
        <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
          {label}
        </p>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
        {heading}
      </h2>

      <div className="mt-12 overflow-hidden rounded-2xl border border-edge">
        <table className="w-full text-sm">
          <tbody>
            {specs.map(([specLabel, value], i) => (
              <tr key={specLabel} className={i % 2 === 0 ? 'bg-canvas' : 'bg-surface'}>
                <td className="px-6 py-4 font-medium text-fg-muted whitespace-nowrap align-top w-48">
                  {specLabel}
                </td>
                <td className="px-6 py-4 text-fg">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
