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
    groupPoints: '+3',
    knockoutPoints: '+4',
    description:
      'Obtienes puntos cuando aciertas el resultado general del partido: victoria del equipo local, empate o victoria del equipo visitante.',
    icon: CheckCircle2,
  },
  {
    title: 'Marcador exacto',
    groupPoints: '+5',
    knockoutPoints: '+6',
    description:
      'Obtienes puntos adicionales cuando el marcador pronosticado coincide exactamente con el resultado final del partido.',
    icon: Trophy,
  },
  {
    title: 'Goleador acertado',
    groupPoints: '+2',
    knockoutPoints: '+3',
    description: 'Obtienes puntos si el jugador seleccionado anota al menos un gol válido durante el partido.',
    icon: Goal,
  },
];

const conditions = [
  'Cada predicción podrá guardarse o modificarse únicamente antes del inicio del partido.',
  'Desde los dieciseisavos de final, cada acierto otorga un punto adicional frente a la fase de grupos.',
  'Los puntos serán asignados una vez el partido haya finalizado y el resultado sea confirmado en la base de datos oficial.',
  'Los goles en propia puerta y los penales fallados no serán considerados para la puntuación de la categoría "Goleador acertado".',
  'El ranking mostrará únicamente a los participantes que hayan registrado al menos una predicción.',
  'En caso de empate en el ranking, se tendrá en cuenta el siguiente orden de desempate: mayor cantidad de puntos acumulados y mayor número de aciertos.',
];

const prizeNote = 'Los premios de la Polla Tonner serán otorgados exclusivamente a los empleados de Pinturas Tonner.';

function RulesPage() {
  return (
    <section className="min-w-0 space-y-4">
      <SectionIntro
        eyebrow=""
        title="Sistema de Puntuación"
        description={'Consulta las reglas de puntuación\ny los premios de TonnerCup.'}
      />

      <article className="cup-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tonner-orange text-white shadow-[0_12px_24px_rgba(255,125,0,0.22)]">
            <Trophy size={24} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-lg font-black text-tonner-slate">Premios</h3>
            <p className="text-sm font-bold text-slate-500">{prizeNote}</p>
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
        {scoringRules.map(({ title, groupPoints, knockoutPoints, description, icon: Icon }) => (
          <article key={title} className="cup-card">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tonner-blue text-white">
                <Icon size={22} strokeWidth={2.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <h3 className="text-base font-black text-tonner-slate">{title}</h3>
                  <div className="mt-2 grid w-full max-w-60 grid-cols-2 overflow-hidden rounded-lg border border-orange-100 text-center">
                    <div className="bg-slate-50 px-2 py-1">
                      <span className="block text-[9px] font-black uppercase text-slate-500">Grupos</span>
                      <span className="block text-sm font-black text-tonner-slate">{groupPoints}</span>
                    </div>
                    <div className="bg-orange-50 px-2 py-1">
                      <span className="block text-[9px] font-black uppercase text-tonner-orange">Eliminación</span>
                      <span className="block text-sm font-black text-tonner-orange">{knockoutPoints}</span>
                    </div>
                  </div>
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
