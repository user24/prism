const kmeans = () => {
    const ages = [15, 15, 16, 19, 19, 20, 20, 21, 22, 28, 35, 40, 41, 42, 43, 44, 60, 61, 65];
    const clusterCount = 2;
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
        if (iterations === 0) {
            // If we are on the first run of the algorithm, then set the centroids randomly (within the range of the input data)
            for (let i = 0; i < clusterCount; i++) {
                //centroids.push(ages[Math.floor(Math.random() * ages.length)]);
            }
            centroids = [16, 22];
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
        ages.forEach(age => {
            const dist1 = Math.abs(age - centroids[0]);
            const dist2 = Math.abs(age - centroids[1]);

            if (dist1 < dist2) {
                clusters[0].push(age);
            } else {
                clusters[1].push(age);
            }
        });
        iterations++;

        // If the clusters haven't changed since last time, we can stop.
        console.log(`
        Centroid one: ${centroids[0]}
        Centroid two: ${centroids[1]}
        Cluster one members: ${clusters[0]}
        Cluster two members: ${clusters[1]}
        `);
        clustersHaveConverged = JSON.stringify(clusters) === clustersAtStart;
    } while(!clustersHaveConverged);

    console.log('finally: ', {clusters, centroids});
};

export default kmeans;
