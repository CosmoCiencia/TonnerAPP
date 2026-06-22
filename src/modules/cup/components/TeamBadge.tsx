import { getTeamFlag } from '../services/teamMeta';

type Props = {
  name: string;
  logo: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

function TeamBadge({ name, size = 'md' }: Props) {
  const sizeClass =
    size === 'xs'
      ? 'h-6 w-6 text-sm'
      : size === 'sm'
      ? 'h-9 w-9 text-xl'
      : size === 'lg'
        ? 'h-14 w-14 text-3xl'
        : 'h-12 w-12 text-2xl';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white ${sizeClass}`}
      aria-hidden="true"
    >
      {getTeamFlag(name)}
    </span>
  );
}

export default TeamBadge;
