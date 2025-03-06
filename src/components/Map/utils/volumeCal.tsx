//volume calculation..................
import earcut from 'earcut';
import * as turf from "@turf/turf";

const clampToTerrain = async (points, deckInstance) => {
  const clamped = [];
  const viewport = deckInstance.current.deck.getViewports()[0];
  for (const [lon, lat] of points) {
    const { x, y } = deckInstance.current.deck.canvas;
    const screenPos = viewport.project([lon, lat]);
    const pickedInfo = await deckInstance.current.pickObject({
      x: screenPos[0],
      y: screenPos[1],
      unproject3D: true,
      radius: 1
    });
    clamped.push([lon, lat, pickedInfo?.coordinate?.[2] || 0]);
  }
  return clamped;
};

const calculateTriangleVolume = (triangle, baseHeight) => {
  const heights = triangle.map(p => p[2] - baseHeight);
  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / 3;
  const coords = triangle.map(([lon, lat]) => [lon, lat]);
  coords.push(coords[0]);
  const poly = turf.polygon([coords]);
  const area = turf.area(poly);

  return area * avgHeight;
};

export const calculateVolume = async (co, deckInstance) => {
  // 1. Generate point grid
  const boundaryCoords = co;
  const poly = turf.polygon([boundaryCoords]);
  const grid = turf.pointGrid(                  //need more detailed grid with large amount of points still working on it
    poly,
    1,
    { units: 'meters' }
  );

  const allPoints = [
    ...boundaryCoords.map(p => [p[0], p[1]]),
    ...grid.features.map(p => p.geometry.coordinates)
  ];

  const clampedPoints = await clampToTerrain(allPoints, deckInstance);
  const flatCoords = clampedPoints.flatMap(([x, y]) => [x, y]);
  const indices = earcut(flatCoords);
  
  const triangles = [];
  for (let i = 0; i < indices.length; i += 3) {
    triangles.push([
      clampedPoints[indices[i]],
      clampedPoints[indices[i + 1]],
      clampedPoints[indices[i + 2]],
    ]);
  }

  // 5. Calculate volume
  const baseHeight = Math.min(...clampedPoints.map(p => p[2]));
  const totalVolume = triangles.reduce((sum, triangle) => 
    sum + calculateTriangleVolume(triangle, baseHeight), 0);
  console.log("total volume :",totalVolume,"m³");
  return totalVolume;
};

