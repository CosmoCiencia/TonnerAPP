import type { GoalEvent } from '../services/types';

type Props = {
  events: GoalEvent[];
};

function formatGoalMinute(event: GoalEvent) {
  if (event.elapsed === null) return null;
  return event.extra ? `${event.elapsed}+${event.extra}'` : `${event.elapsed}'`;
}

function GoalEventsList({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="mx-auto mt-1.5 grid max-w-[7.2rem] gap-1 text-center">
      {events.map((event, index) => {
        const minute = formatGoalMinute(event);

        return (
          <p
            key={`${event.player_name}-${event.elapsed ?? 'na'}-${event.extra ?? 'na'}-${index}`}
            className="truncate text-[10px] font-bold leading-tight text-emerald-700"
            title={minute ? `${minute} ${event.player_name}` : event.player_name}
          >
            {minute ? <span className="font-black">{minute}</span> : null}
            {minute ? ' ' : null}
            {event.player_name}
          </p>
        );
      })}
    </div>
  );
}

export default GoalEventsList;
