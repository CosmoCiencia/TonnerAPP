type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionIntro({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.28em] text-white/65">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{description}</p>
    </div>
  );
}

export default SectionIntro;
