import { CheckCircle2, Goal, Medal, Trophy } from 'lucide-react';
import SectionIntro from '../components/SectionIntro';

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
        description="Consulta las reglas de puntuación de TonnerCup."
      />

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
