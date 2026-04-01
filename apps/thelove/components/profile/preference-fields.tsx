export function PreferenceFields({
  preferredTraits,
  dealBreakers,
}: {
  preferredTraits: string[];
  dealBreakers: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold">선호하는 부분</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {preferredTraits.length > 0 ? (
            preferredTraits.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
          ) : (
            <li>-</li>
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold">절대 안 되는 부분</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {dealBreakers.length > 0 ? (
            dealBreakers.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
          ) : (
            <li>-</li>
          )}
        </ul>
      </div>
    </div>
  );
}
