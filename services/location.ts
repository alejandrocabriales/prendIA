import * as Location from "expo-location";
import { Coordinates } from "../types";

/**
 * Fallback location used whenever GPS is unavailable or permission is
 * denied — approximately Montevideo centro, so the MVP always has
 * something sensible to calculate distances from.
 */
export const DEFAULT_LOCATION: Coordinates = {
  latitude: -34.8947,
  longitude: -56.1645,
};

/**
 * Resolves the user's current location. Always resolves — never throws —
 * so the rest of the app can work even without location permission:
 *
 *   GPS disponible    -> ubicación real
 *   GPS no disponible -> DEFAULT_LOCATION (mock, Montevideo)
 */
export async function getUserLocation(): Promise<Coordinates> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return DEFAULT_LOCATION;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}
