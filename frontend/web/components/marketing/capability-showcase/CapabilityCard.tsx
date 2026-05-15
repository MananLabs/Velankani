import type { CapabilityShowcaseItem } from './types';

type CapabilityCardProps = {
  item: CapabilityShowcaseItem;
};

export function CapabilityCard({ item }: CapabilityCardProps) {
  return (
    <article className="capability-panel rounded-3xl border border-white/10 px-7 py-8 md:px-9 md:py-10">
      <h3 className="text-[34px] font-semibold tracking-tight text-white">{item.title}</h3>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/50">{item.description}</p>

      <div className="mt-10 flex items-center gap-3">
        <span className="rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 text-[18px] text-white/90">
          {item.prompt}
        </span>
        <span className="h-11 w-11 rounded-full border border-white/10 bg-white/[0.08]" aria-hidden />
      </div>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.02] p-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-[34px] font-medium text-white/36">{item.previewTitle}</p>
          <p className="mt-1 text-[22px] text-white/40">{item.previewHandle}</p>

          <div className="mt-6 space-y-4">
            {item.previewBody.map((line, index) => (
              <p key={`${item.title}-${index}`} className="text-[14px] leading-relaxed text-white/72">
                {line || <span>&nbsp;</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
