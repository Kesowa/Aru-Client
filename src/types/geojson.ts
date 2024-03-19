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

export type BBox = [number, number, number, number];

export const mergeBoundingBoxes = (boundingBoxes: BBox[]): BBox => {
  let [minLeft, minBottom, maxRight, maxTop] = boundingBoxes[0];
  boundingBoxes.forEach(([left, bottom, right, top]) => {
    if (left < minLeft) minLeft = left;
    if (bottom < minBottom) minBottom = bottom;
    if (right > maxRight) maxRight = right;
    if (top > maxTop) maxTop = top;
  });

  return [minLeft, minBottom, maxRight, maxTop];
};