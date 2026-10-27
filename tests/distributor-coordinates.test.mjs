import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDistributorCoordinates } from '../src/modules/distributors/coordinates.ts';
import { getDistributorMapsHref } from '../src/modules/distributors/contactLinks.ts';

const store = { id: 'test', name: 'Pinturas de prueba', address: 'Calle 1 # 2-3', city: 'BOGOTA', phone: '' };

test('accepts current, legacy and numeric string coordinates', () => {
  const expected = { lat: 4.6, lng: -74.1 };
  assert.deepEqual(getDistributorCoordinates({ ...store, ...expected }), expected);
  assert.deepEqual(getDistributorCoordinates({ ...store, coordinates: [4.6, -74.1] }), expected);
  assert.deepEqual(getDistributorCoordinates({ ...store, lat: '4.6', lng: '-74.1' }), expected);
});

test('rejects unset, placeholder, malformed and out-of-range locations', () => {
  for (const location of [
    {}, { lat: null, lng: null }, { lat: '', lng: ' ' },
    { lat: 0, lng: 0 }, { coordinates: [0, 0] },
    { lat: 91, lng: -74 }, { lat: -91, lng: -74 },
    { lat: 4, lng: 181 }, { lat: 4, lng: -181 },
    { lat: NaN, lng: -74 }, { lat: 4, lng: Infinity },
    { lat: 'invalid', lng: -74 }, { lat: false, lng: false },
    { lat: 4.6 }, { lng: -74.1 },
  ]) {
    assert.equal(getDistributorCoordinates({ ...store, ...location }), null, JSON.stringify(location));
  }
});

test('allows actual locations on the equator or prime meridian', () => {
  assert.deepEqual(getDistributorCoordinates({ ...store, lat: 0, lng: -70 }), { lat: 0, lng: -70 });
  assert.deepEqual(getDistributorCoordinates({ ...store, lat: 10, lng: 0 }), { lat: 10, lng: 0 });
});

test('routes located stores by coordinates and unlocated stores by address', () => {
  const located = new URL(getDistributorMapsHref({ ...store, lat: 4.6, lng: -74.1 }));
  assert.equal(located.searchParams.get('destination'), '4.6,-74.1');
  for (const location of [{}, { lat: 0, lng: 0 }, { lat: null, lng: null }, { lat: 100, lng: 200 }]) {
    const route = new URL(getDistributorMapsHref({ ...store, ...location }));
    assert.equal(route.searchParams.get('destination'), 'Pinturas de prueba Calle 1 # 2-3 BOGOTA');
  }
});
