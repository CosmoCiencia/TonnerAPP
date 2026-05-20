import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getOptimizedImageSrc } from '../../../services/imageAssets';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

function SectionIntro({ eyebrow, title, description }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/cup';

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={getOptimizedImageSrc('/logo.png')} alt="Tonner" className="h-8 w-auto" decoding="async" />
          <p className="text-xs uppercase tracking-[0.28em] text-tonner-text/65">{eyebrow}</p>
        </div>

        {showBackButton ? (
          <button
            type="button"
            onClick={() => navigate('/cup')}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            <ArrowLeft size={14} />
            Volver
          </button>
        ) : null}
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-tonner-text/80">{description}</p>
    </div>
  );
}

export default SectionIntro;
