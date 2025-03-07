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

    let iterations = 0;
    let clustersHaveConverged = false;
    do {
        // Freeze the output from the last loop for comparison later
        const clustersAtStart = JSON.stringify(clusters);
        // Re initialise stuff.
        centroids = [];

        // re calculate the centroids based on the new clusters

        for (let i = 0; i < clusterCount; i++) {
            if (iterations === 0) {
                // If we are on the first run of the algorithm, then set each centroid to a randomly chosen point in the data
                centroids.push(data[Math.floor(Math.random() * data.length)]);
            } else {
                // Calculate the centroids based on the average of each cluster
                centroids[i] = getMiddleOfCluster(clusters[i]);
            }
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

            clusters[nearestCentroid].push(datum);
        });
        iterations++;

        // If the clusters haven't changed since last time, we can stop.
        clustersHaveConverged = JSON.stringify(clusters) === clustersAtStart;
    } while(!clustersHaveConverged);

    return {clusters, centroids};
};

export default kmeans;

export {
    euclideanDistance,
    kmeans
};
