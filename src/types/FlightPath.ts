export interface FlightPath {
  type: "FeatureCollection",
  crs: {
    type: "name",
    properties: {
      name: "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  features: [{
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [number, number, number]
    },
    properties: {
      TIMECODE: string,
      ISO: number,
      EV: number,
      D: number,
      H_S: number,
      V_S: number,
      SHUTER: number,
      FNUM: number,
      ALTITUDE: number,
      timestamp: number,
      SPEED_TWOD: number,
      SPEED_VERTICAL: number,
      SPEED_THREED: number,
      DISTANCE: number
    }
  }]
}
