import { kmeans } from "ml-kmeans";
import { getPixelArray, getFlatPixelArray } from "../util/pixels.js";
//import convert from "color-convert";

export function getKmeansComplex(pixels, numClusters, skipRatio = 1) {

  const initialClusterRatio = 4;
  const initialNumClusters  = numClusters * initialClusterRatio;

  const sampledHsvPixels = getPixelArray(pixels, skipRatio, true);

  const points = sampledHsvPixels.flat();

  const { centroids } = kmeans(points, initialNumClusters, {
    initialization: 'kmeans++',
    seed: 2,
  });

  const assignments = getAssignments(points, centroids);

  const rag = createRAG(sampledHsvPixels, assignments, initialNumClusters);

  console.log(rag);

  return {
    centroids,
    assignments,
  };
}

function getAssignments(points, centroids) {
  return points.map(point => {
    let minDistance = Infinity;
    let minIndex = -1;
    for (let i = 0; i < centroids.length; i++) {
      const distance = euclideanDistance(point, centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }
    return minIndex;
  });
}

function euclideanDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) * (a[0] - b[0]) +
    (a[1] - b[1]) * (a[1] - b[1]) +
    (a[2] - b[2]) * (a[2] - b[2])
  );
}

export function createRAG(points, assignments, numClusters) {
  const adjacencyMatrix = createAdjacencyMatrix(points, assignments, numClusters);
  const regions = createRegions(points, assignments, adjacencyMatrix);
  const edges = createEdges(regions, adjacencyMatrix);
  console.log('edges', edges);
  const rag = { nodes: regions, edges: edges };
  return rag;
}
/*
function createAdjacencyMatrix(points, assignments, numClusters) {
  const width = points[0].length;
  const height = points.length;
  const adjacencyMatrix = new Array(numClusters);
  for (let i = 0; i < numClusters; i++) {
    adjacencyMatrix[i] = new Array(numClusters).fill(0);
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const clusterIndex = assignments[y * width + x];
      if (x > 0 && assignments[y * width + x - 1] === clusterIndex) {
        adjacencyMatrix[clusterIndex][clusterIndex]++;
      }
      if (x < width - 1 && assignments[y * width + x + 1] === clusterIndex) {
        adjacencyMatrix[clusterIndex][clusterIndex]++;
      }
      if (y > 0 && assignments[(y - 1) * width + x] === clusterIndex) {
        adjacencyMatrix[clusterIndex][clusterIndex]++;
      }
      if (y < height - 1 && assignments[(y + 1) * width + x] === clusterIndex) {
        adjacencyMatrix[clusterIndex][clusterIndex]++;
      }
    }
  }
  return adjacencyMatrix;
}
*/
function createAdjacencyMatrix(points, assignments, numClusters) {
  const width = points[0].length;
  const height = points.length;
  const adjacencyMatrix = new Array(numClusters);
  for (let i = 0; i < numClusters; i++) {
    adjacencyMatrix[i] = new Array(numClusters).fill(0);
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const clusterIndex = assignments[y * width + x];
      if (x > 0 && assignments[y * width + x - 1] === clusterIndex) {
        adjacencyMatrix[clusterIndex][assignments[y * width + x - 1]]++;
      }
      if (x < width - 1 && assignments[y * width + x + 1] === clusterIndex) {
        adjacencyMatrix[clusterIndex][assignments[y * width + x + 1]]++;
      }
      if (y > 0 && assignments[(y - 1) * width + x] === clusterIndex) {
        adjacencyMatrix[clusterIndex][assignments[(y - 1) * width + x]]++;
      }
      if (y < height - 1 && assignments[(y + 1) * width + x] === clusterIndex) {
        adjacencyMatrix[clusterIndex][assignments[(y + 1) * width + x]]++;
      }
    }
  }
  return adjacencyMatrix;
}

function createRegions(points, assignments, adjacencyMatrix) {
  const numRegions = adjacencyMatrix.length;
  const regions = new Array(numRegions);
  for (let i = 0; i < numRegions; i++) {
    regions[i] = { id: i, pixels: [] };
  }
  for (let y = 0; y < points.length; y++) {
    for (let x = 0; x < points[y].length; x++) {
      const pixel = points[y][x];
      const clusterIndex = assignments[y * points[y].length + x];
      regions[clusterIndex].pixels.push(pixel);
    }
  }
  return regions;
}

function createEdges(regions, adjacencyMatrix) {
  const numRegions = regions.length;
  const edges = [];
  for (let i = 0; i < numRegions; i++) {
    for (let j = i + 1; j < numRegions; j++) {
      if (adjacencyMatrix[i][j] > 0) {
        edges.push({ from: regions[i], to: regions[j] });
      }
    }
  }
  return edges;
}
