import * as THREE from "three";
import * as turf from "@turf/turf";


//calculate volume of selected mesh
async function calculateVolume(geometry, precision) {
  let volumen = 0;
  const vertices = geometry;
  let indices = precision;

  function volumenTriangular(p1, p2, p3) {
    const v321 = p3.x * p2.y * p1.z;
    const v231 = p2.x * p3.y * p1.z;
    const v312 = p3.x * p1.y * p2.z;
    const v132 = p2.x * p1.y * p3.z;
    const v213 = p1.x * p3.y * p2.z;
    const v123 = p1.x * p2.y * p3.z;
    return (1.0 / 6.0) * (-v321 + v231 + v312 - v132 - v213 + v123);
  }

  if (!indices) {
    indices = Array.from({ length: vertices.length / 3 }, (_, i) => i);
  }

  await Promise.all(
    Array.from({ length: indices.length / 3 }, async (_, i) => {
      const a = new THREE.Vector3().fromArray(vertices, indices[i * 3] * 3);
      const b = new THREE.Vector3().fromArray(vertices, indices[i * 3 + 1] * 3);
      const c = new THREE.Vector3().fromArray(vertices, indices[i * 3 + 2] * 3);
      volumen += volumenTriangular(a, b, c);
    })
  );

  if (precision) {
    console.log("Volume:", Math.abs(volumen));
    return Math.abs(volumen);
  } else {
    return Math.abs(volumen / 1000);
  }
}

interface MeshData {
  POSITION: { value: Float32Array; count: number };
  indices: { value: Uint32Array; count: number };
}

// Helper Functions
function isPointInsidePolygon(vertex: THREE.Vector3, polygon: THREE.Vector3[], heightTolerance: number = 0.1): boolean {
  if (polygon.length < 3) return false;
  const avgZ = polygon.reduce((sum, p) => sum + p.z, 0) / polygon.length;
  const xyVertex = [vertex.x, vertex.y];
  const xyPolygon = polygon.map(p => [p.x, p.y]);

  if (xyPolygon[0][0] !== xyPolygon[xyPolygon.length - 1][0] || xyPolygon[0][1] !== xyPolygon[xyPolygon.length - 1][1]) {
      xyPolygon.push(xyPolygon[0]);
  }
  const inside2D = turf.booleanPointInPolygon(xyVertex, turf.polygon([xyPolygon]));
  const withinHeight = vertex.z >= avgZ - heightTolerance && vertex.z <= avgZ + heightTolerance;
  const e = inside2D && withinHeight;

  return inside2D && withinHeight;
}

function getVertex(POSITION: { value: Float32Array }, index: number): number[] {
  return [
    POSITION.value[index * 3],
    POSITION.value[index * 3 + 1],
    POSITION.value[index * 3 + 2],
  ];
}

//extract mesh inside of the drawn polygon
export async function extractMeshInsidePolygon(
  meshData: MeshData,
  polygon: THREE.Vector3[]
): Promise<number> {
  const POSITION = meshData.primitives[0].attributes.POSITION;
  const indices = meshData.primitives[0].indices;

  console.log("Inside:", POSITION, indices);

  const filteredVertices: number[] = [];
  const vertexMap = new Map();
  const newIndices: number[] = [];

  // Step 1: Filter vertices of mesh
  const processVertices = async () => {
    await Promise.all(
      Array.from({ length: POSITION.count }, async (_, i) => {
        const x = POSITION.value[i * 3];
        const y = POSITION.value[i * 3 + 1];
        const z = POSITION.value[i * 3 + 2];

        const vertex = new THREE.Vector3(x, y, z);
        if (isPointInsidePolygon(vertex, polygon)) {
          vertexMap.set(i, filteredVertices.length / 3);
          filteredVertices.push(x, y, z);
        }
      })
    );
  };

  await processVertices();

  // Step 2: Filter indices of mesh
  const processIndices = async () => {
    const indexCount = indices?.count || indices?.value.length;

    await Promise.all(
      Array.from({ length: indexCount / 3 }, async (_, i) => {
        const i1 = indices.value[i * 3];
        const i2 = indices.value[i * 3 + 1];
        const i3 = indices.value[i * 3 + 2];

        const inside1 = vertexMap.has(i1);
        const inside2 = vertexMap.has(i2);
        const inside3 = vertexMap.has(i3);

        if (inside1 || inside2 || inside3) {
          if (!inside1)
            vertexMap.set(i1, filteredVertices.length / 3),
              filteredVertices.push(...getVertex(POSITION, i1));
          if (!inside2)
            vertexMap.set(i2, filteredVertices.length / 3),
              filteredVertices.push(...getVertex(POSITION, i2));
          if (!inside3)
            vertexMap.set(i3, filteredVertices.length / 3),
              filteredVertices.push(...getVertex(POSITION, i3));

          newIndices.push(
            vertexMap.get(i1),
            vertexMap.get(i2),
            vertexMap.get(i3)
          );
        }
      })
    );
  };

  await processIndices();

  console.log("Filtered Mesh:", {
    vertices: filteredVertices,
    indices: newIndices,
  });

  const volume = await calculateVolume(filteredVertices, newIndices);

  return volume;
}
