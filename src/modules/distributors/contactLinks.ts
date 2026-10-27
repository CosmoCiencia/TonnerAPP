import type { Distributor } from './types';
import { getDistributorCoordinates } from './coordinates.ts';

export function getDistributorPhoneHref(phone: string) {
  const phoneNumber = phone.replace(/[^\d+]/g, '');
  return phoneNumber ? `tel:${phoneNumber}` : null;
}

export function getDistributorMapsHref(distributor: Distributor) {
  const coordinates = getDistributorCoordinates(distributor);
  if (coordinates) {
    const { lat, lng } = coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${distributor.name} ${distributor.address} ${distributor.city}`,
  )}`;
}
