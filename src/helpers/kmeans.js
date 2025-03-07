const euclideanDistance = (a, b) => {
    return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

const getMiddleOfCluster = (cluster) => {
    const averageX = parseInt(cluster.reduce((acc, curr) => acc + curr.x, 0) / cluster.length);
    const averageY = parseInt(cluster.reduce((acc, curr) => acc + curr.y, 0) / cluster.length);
    const averageZ = parseInt(cluster.reduce((acc, curr) => acc + curr.z, 0) / cluster.length);
    return {x: averageX, y: averageY, z: averageZ};
}

const kmeans = (data, clusterCount = 2) => {
    let centroids = [];
    let clusters = [];
    const log = false;
    let iterations = 0;
    let clustersHaveConverged = false;
    let initalCentroids;
    do {
        // Freeze the output from the last loop for comparison later
        const clustersAtStart = JSON.stringify(clusters);
        // Re initialise stuff.
        centroids = [];

        // Set the min and max ranges for the data
        const maxX = Math.max(...data.map(d => d.x));
        const minX = Math.min(...data.map(d => d.x));
        const maxY = Math.max(...data.map(d => d.y));
        const minY = Math.min(...data.map(d => d.y));
        const maxZ = Math.max(...data.map(d => d.z));
        const minZ = Math.min(...data.map(d => d.z));

        log && console.log({minX, maxX, minY, maxY, minZ, maxZ});

        for (let i = 0; i < clusterCount; i++) {
            if (iterations === 0) {
                // If we are on the first run of the algorithm, then set each centroid to a point in the data
                // We space the points evenly throughout the data

                // Pick a random point between xyz min and max:
                centroids.push({
                    x: Math.floor(Math.random() * (maxX - minX + 1)) + minX,
                    y: Math.floor(Math.random() * (maxY - minY + 1)) + minY,
                    z: Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ
                });
            } else {
                // Calculate the centroids based on the average of each cluster
                centroids[i] = getMiddleOfCluster(clusters[i]);
            }
        }

        if (iterations === 0) {
            initalCentroids = centroids;
            log && console.log(initalCentroids);
        }

        // Now we have recalculated the centroids, we can trash the clusters ready to re-assign into them
        clusters = [];
        for(let i =0 ; i < clusterCount ; i++) {
            clusters.push([]);
        }

        // cluster allocation
        data.forEach(datum => {
            const nearestCentroid = centroids.map(((centroid, centroidIndex) => {
                return {
                    dist: euclideanDistance(datum, centroid),
                    index: centroidIndex
                };
            })).sort((a, b) => a.dist - b.dist)[0].index;
            log && console.log({nearestCentroid, datum});
            clusters[nearestCentroid].push(datum);
        });
        iterations++;

        // If the clusters haven't changed since last time, we can stop.
        clustersHaveConverged = JSON.stringify(clusters) === clustersAtStart;
    } while(!clustersHaveConverged);

    return {clusters, centroids, initalCentroids};
};

export default kmeans;

export {
    euclideanDistance,
    kmeans
};
