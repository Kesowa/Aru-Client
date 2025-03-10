import http from "./httpCall";
import { MAPBOX_API_KEY } from "src/constants";

export async function reverseGeocoder(coordinates: any) {
  let address = "Address not found"; // fallback
  try {
    const result = await http.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_API_KEY}`,
      { withCredentials: false }
    );
    address = result.data.features[0].place_name;
  } catch (error) {
    console.error(error);
  }
  return address;
}
