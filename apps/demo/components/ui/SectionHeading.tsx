type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-4xl">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white md:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}