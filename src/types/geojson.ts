export type Properties = {
  SL_NO: number;
  AA: string;
  Solar_ID: string;
  Placed_IN: string;
  Latitude: number;
  Longitude: number;
  DoC: string;
  Phase: string;
  color: string;
  icon: string;
  sys_id: string;
  Nth: Record<string, string | number>;
};

export interface Feature<Geometry, Property> {
  type: "Feature";
  properties: Property;
  geometry: Geometry;
}

export type Point = {
  type: "Point";
  coordinates: [number, number];
};

// Default is a point feature with a load of properties
export interface GeoJson<FeatureType = Feature<Point, Properties>> {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: FeatureType[];
  errno: number;
}
