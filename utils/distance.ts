const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two coordinates using the Haversine formula.
 * Distance is always computed on the fly from the user's current location —
 * it's never stored on a product, since the same product is a different
 * distance away depending on where the user is standing.
 */
export function calculateDistanceKm(
  userLatitude: number,
  userLongitude: number,
  storeLatitude: number,
  storeLongitude: number
): number {
  const dLat = toRadians(storeLatitude - userLatitude);
  const dLon = toRadians(storeLongitude - userLongitude);

  const lat1 = toRadians(userLatitude);
  const lat2 = toRadians(storeLatitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = EARTH_RADIUS_KM * c;

  return Math.round(distanceKm * 10) / 10;
}
