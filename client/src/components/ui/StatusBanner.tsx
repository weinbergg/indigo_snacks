interface StatusBannerProps {
  tone: 'success' | 'error' | 'info';
  text: string;
}

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-brand/15 bg-brand/10 text-brand-deep'
};

export function StatusBanner({ text, tone }: StatusBannerProps) {
  return (
    <div className={`rounded-3xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>{text}</div>
  );
}
