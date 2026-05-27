import type { Distributor } from './types';

export function getDistributorPhoneHref(phone: string) {
  const phoneNumber = phone.replace(/[^\d+]/g, '');
  return phoneNumber ? `tel:${phoneNumber}` : null;
}

export function getDistributorMapsHref(distributor: Distributor) {
  const lat = Number(distributor.lat ?? distributor.coordinates?.[0]);
  const lng = Number(distributor.lng ?? distributor.coordinates?.[1]);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${distributor.name} ${distributor.address} ${distributor.city}`,
  )}`;
}
