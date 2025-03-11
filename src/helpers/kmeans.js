const euclideanDistance = (a, b) => {
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
};

const getMiddleOfCluster = (cluster) => {
    const averageX = parseInt(cluster.reduce((acc, curr) => acc + curr.x, 0) / cluster.length);
    const averageY = parseInt(cluster.reduce((acc, curr) => acc + curr.y, 0) / cluster.length);
    const averageZ = parseInt(cluster.reduce((acc, curr) => acc + curr.z, 0) / cluster.length);
    return {x: averageX, y: averageY, z: averageZ};
};

const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const kmeans = (data, clusterCount = 2) => {
    const log = true;
    const centroids = [];
    const clusters = [];
    let clustersHaveConverged = false;
    let initalCentroids;

    // Set the min and max ranges for the data
    const maxX = Math.max(...data.map(d => d.x));
    const minX = Math.min(...data.map(d => d.x));
    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y));
    const maxZ = Math.max(...data.map(d => d.z));
    const minZ = Math.min(...data.map(d => d.z));

    if (log) {
        console.log({minX, maxX, minY, maxY, minZ, maxZ})
    }

    // Set initial centroids
    for (let i = 0; i < clusterCount; i++) {
        // Pick a random point between xyz min and max:
        centroids.push({
            x: randomBetween(minX, maxX),
            y: randomBetween(minY, maxY),
            z: randomBetween(minZ, maxZ)
        });
        // Set up empty cluster
        clusters[i] = [];
    }

    do {
        // Freeze the output from the last loop for comparison later
        const centroidsAtStart = JSON.stringify(centroids);

        // cluster allocation
        data.forEach(datum => {
            const nearestCentroid = centroids.map(((centroid, centroidIndex) => {
                return {
                    dist: euclideanDistance(datum, centroid),
                    index: centroidIndex
                };
            })).sort((a, b) => a.dist - b.dist)[0].index;
            //log && console.log({nearestCentroid, datum});
            clusters[nearestCentroid].push(datum);
        });

        // If the centroids haven't changed since last time, we can stop.
        clustersHaveConverged = JSON.stringify(centroids) === centroidsAtStart;

        // Recalculate the centroids ready for next iteration
        for (let i = 0; i < clusterCount; i++) {
            // Calculate the centroids based on the average of each cluster
            centroids[i] = getMiddleOfCluster(clusters[i]);
        }

        // Now we have recalculated the centroids, we can trash the clusters ready to re-assign into them
        for(let i =0 ; i < clusterCount ; i++) {
            clusters[i] = [];
        }
    } while(!clustersHaveConverged);

    const nonNullCentroids = centroids.filter((centroid, i) => {
        // remove null or non-unique centroids
        const isValid = !isNaN(centroid.x) && !isNaN(centroid.y) && !isNaN(centroid.z);
        return isValid && centroids.findIndex(c => {
            return c.x === centroid.x && c.y === centroid.y && c.z === centroid.z;
        }) === i;
    });

    if (log) {
        console.log({clusters, centroids, nonNullCentroids});
    }
    return {clusters, initalCentroids, centroids: nonNullCentroids };
};

export default kmeans;

export {
    euclideanDistance,
    kmeans
};
