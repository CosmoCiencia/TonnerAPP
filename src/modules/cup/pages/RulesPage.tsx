import { CheckCircle2, Goal, Medal, Trophy } from 'lucide-react';
import SectionIntro from '../components/SectionIntro';

const prizes = [
  { position: '1', amount: '$1.500.000' },
  { position: '2', amount: '$1.200.000' },
  { position: '3', amount: '$1.000.000' },
  { position: '4', amount: '$800.000' },
  { position: '5', amount: '$500.000' },
];

const scoringRules = [
  {
    title: 'Resultado acertado',
    points: '+3',
    description: 'Ganas puntos cuando aciertas si el partido termina con victoria local, empate o victoria visitante.',
    icon: CheckCircle2,
  },
  {
    title: 'Marcador exacto',
    points: '+5',
    description: 'Se suma cuando el marcador que guardaste coincide exactamente con el resultado final.',
    icon: Trophy,
  },
  {
    title: 'Goleador acertado',
    points: '+2',
    description: 'Se suma si el jugador que elegiste marca gol oficial en el partido.',
    icon: Goal,
  },
];

const conditions = [
  'Cada predicción se puede guardar o editar solo antes del inicio del partido.',
  'Los puntos se calculan cuando el partido queda finalizado en la base oficial.',
  'Los goles en propia puerta y penales fallados no cuentan como acierto de goleador.',
  'El ranking solo muestra participantes que hayan guardado mínimo una predicción.',
  'El ranking desempata por puntos totales, aciertos y cantidad de predicciones guardadas.',
];

function RulesPage() {
  return (
    <section className="min-w-0 space-y-4">
      <SectionIntro
        eyebrow=""
        title="¿Cómo se calculan los puntos?"
        description={'Consulta las reglas de puntuación\ny los premios de TonnerCup.'}
      />

      <article className="cup-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tonner-orange text-white shadow-[0_12px_24px_rgba(255,125,0,0.22)]">
            <Trophy size={24} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-lg font-black text-tonner-slate">Premios</h3>
            <p className="text-sm font-bold text-slate-500">Los mejores puntajes del ranking ganan.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {prizes.map((prize, index) => (
            <div
              key={prize.position}
              className={`flex items-center justify-between gap-3 px-4 py-3 ${
                index === 0
                  ? 'bg-[linear-gradient(90deg,#082b68,#2f5cc7)] text-white'
                  : 'border-t border-slate-200 bg-white text-tonner-slate'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                  index === 0
                    ? 'bg-white text-tonner-blue'
                    : 'bg-tonner-blue text-white'
                }`}>
                  #{prize.position}
                </span>
                <span className={`text-sm font-black uppercase ${
                  index === 0 ? 'text-white' : 'text-slate-600'
                }`}>
                  Puesto {prize.position}
                </span>
              </div>
              <strong className={`text-xl font-black ${index === 0 ? 'text-white' : 'text-tonner-blue'}`}>
                {prize.amount}
              </strong>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-3">
        {scoringRules.map(({ title, points, description, icon: Icon }) => (
          <article key={title} className="cup-card">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tonner-blue text-white">
                <Icon size={22} strokeWidth={2.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-tonner-slate">{title}</h3>
                  <span className="shrink-0 rounded-xl bg-orange-50 px-3 py-1 text-sm font-black text-tonner-orange">
                    {points}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <article className="cup-card">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-tonner-blue">
            <Medal size={22} strokeWidth={2.8} />
          </div>
          <h3 className="text-base font-black text-tonner-slate">Condiciones</h3>
        </div>
        <ol className="grid gap-3">
          {conditions.map((condition, index) => (
            <li key={condition} className="flex gap-3 text-sm font-bold leading-6 text-tonner-slate">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tonner-blue text-xs font-black text-white">
                {index + 1}
              </span>
              <span className="pt-0.5">{condition}</span>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}

export default RulesPage;
