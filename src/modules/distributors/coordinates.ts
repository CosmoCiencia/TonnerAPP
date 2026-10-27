import type { Distributor } from './types';

function coordinateNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return Number(value);
  return NaN;
}

export function getDistributorCoordinates(distributor: Distributor) {
  const lat = coordinateNumber(distributor.lat ?? distributor.coordinates?.[0]);
  const lng = coordinateNumber(distributor.lng ?? distributor.coordinates?.[1]);

  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    Math.abs(lat) > 90 || Math.abs(lng) > 180 ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }

  return { lat, lng };
}
