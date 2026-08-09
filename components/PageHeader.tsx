export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 mt-2 flex items-start justify-between gap-4">
      <div>
        <p className="label-caps mb-1">{eyebrow}</p>
        <h1 className="font-display text-3xl text-champagne sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 font-label text-sm text-stone">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
