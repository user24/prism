const euclideanDistance = (a, b) => {
    return Math.hypot(b.x1 - a.x, b.y - a.y, b.z - a.z);
}

const kmeans = (data, clusterCount = 2) => {
    let centroids = [];
    let clusters = [];
    const logs = [];

    let iterations = 0;
    let clustersHaveConverged = false;
    do {
        // Freeze the output from the last loop for comparison later
        const clustersAtStart = JSON.stringify(clusters);
        // Re initialise stuff.
        centroids = [];

        // re calculate the centroids based on the new clusters
        if (iterations === 0) {
            // If we are on the first run of the algorithm, then set the centroids randomly (within the range of the input data)
            for (let i = 0; i < clusterCount; i++) {
                centroids.push(data[Math.floor(Math.random() * data.length)]);
            }
        } else {
            // Calculate the centroids based on the average of each cluster
            centroids[0] = clusters[0].reduce((n, sum) => n + sum, 0) / clusters[0].length; // todo: spin off into arraySum helper
            centroids[1] = clusters[1].reduce((n, sum) => n + sum, 0) / clusters[1].length;
        }

        // Now we have recalculated the centroids, we can trash the clusters ready to re-assign into them
        clusters = [];
        for(let i =0 ; i < clusterCount ; i++) {
            clusters.push([]);
        }

        // cluster allocation
        data.forEach(datum => {
            // TODO: add support for different number of clusters
            const dist1 = euclideanDistance(datum, centroids[0]);
            const dist2 = euclideanDistance(datum, centroids[1]);

            if (dist1 < dist2) {
                clusters[0].push(datum);
            } else {
                clusters[1].push(datum);
            }
        });
        iterations++;

        // If the clusters haven't changed since last time, we can stop.
        logs.push(`
        Centroid one: ${centroids[0]}
        Centroid two: ${centroids[1]}
        Cluster one members: ${clusters[0]}
        Cluster two members: ${clusters[1]}
        `);
        clustersHaveConverged = JSON.stringify(clusters) === clustersAtStart;
    } while(!clustersHaveConverged);

    logs.push('finally: ', {clusters, centroids});

    return {clusters, centroids, logs};
};

export default kmeans;
