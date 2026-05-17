type PlaceholderPageProps = {
  title: string;
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="py-8">
      <div className="rounded-3xl border border-[var(--color-outine)] bg-[var(--color-section)] p-8 shadow-[rgba(0,0,0,0.1)_0_0.27rem_0.7rem]">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{title}</h1>
        <p className="mt-2 text-[var(--color-sub-text)]">
          هذه الصفحة قيد التجهيز ضمن المرحلة التالية.
        </p>
      </div>
    </div>
  );
}

