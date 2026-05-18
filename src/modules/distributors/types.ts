// src/modules/distributors/types.ts
export interface Distributor {
  id: string | number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  lat?: number;
  lng?: number;
  coordinates?: [number, number]; // [latitud, longitud]
}
