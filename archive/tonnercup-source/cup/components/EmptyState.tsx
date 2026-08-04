type Props = {
  title: string;
  description: string;
};

function EmptyState({ title, description }: Props) {
  return (
    <div className="cup-card text-center">
      <h3 className="font-display text-2xl font-bold text-tonner-slate">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default EmptyState;
