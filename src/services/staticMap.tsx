import { GOOGLE_API_KEY } from "src/constants";

export const getImageForCircle = (lat, lng, rad, detail = 8) => {
  const uri = "https://maps.googleapis.com/maps/api/staticmap?";
  let staticMapSrc = "center=" + lat + "," + lng;
  staticMapSrc += `&key=${GOOGLE_API_KEY}`;
  staticMapSrc += "&size=500x500";
  staticMapSrc += "&path=color:0xff0000ff:weight:1";

  const r = 6371;

  const pi = Math.PI;

  const _lat = (lat * pi) / 180;
  const _lng = (lng * pi) / 180;
  const d = rad / 1000 / r;

  for (let i = 0; i <= 360; i += detail) {
    const brng = (i * pi) / 180;

    let pLat = Math.asin(
      Math.sin(_lat) * Math.cos(d) +
        Math.cos(_lat) * Math.sin(d) * Math.cos(brng)
    );
    const pLng =
      ((_lng +
        Math.atan2(
          Math.sin(brng) * Math.sin(d) * Math.cos(_lat),
          Math.cos(d) - Math.sin(_lat) * Math.sin(pLat)
        )) *
        180) /
      pi;
    pLat = (pLat * 180) / pi;

    staticMapSrc += "|" + pLat + "," + pLng;
  }

  staticMapSrc += "&markers=color:0xff0000ff:size:mid|" + lat + "," + lng;

  return uri + encodeURI(staticMapSrc);
};

export const getImageForPolygon = (points) => {
  const bounds = new window.google.maps.LatLngBounds();

  const polygonCoords = [];

  for (const x of points) {
    const llbound = new window.google.maps.LatLng(x.lat, x.lng);
    polygonCoords.push(llbound);
  }
  for (const element of polygonCoords) {
    bounds.extend(element);
  }

  const centerOfPolygon = bounds.getCenter();

  const uri = "https://maps.googleapis.com/maps/api/staticmap?";
  let staticMapSrc =
    "center=" + centerOfPolygon.lat() + "," + centerOfPolygon.lng();
  staticMapSrc += `&key=${GOOGLE_API_KEY}`;
  staticMapSrc += "&size=500x500";
  staticMapSrc += "&path=color:0xff0000ff:weight:1";

  for (const x of points) {
    staticMapSrc += `|${x.lat},${x.lng}`;
  }

  staticMapSrc += `|${points[0].lat},${points[0].lng}`;

  staticMapSrc +=
    "&markers=color:0xff0000ff:size:mid|" +
    centerOfPolygon.lat() +
    "," +
    centerOfPolygon.lng();

  return uri + encodeURI(staticMapSrc);
};
