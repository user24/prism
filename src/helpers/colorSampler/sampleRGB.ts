
const sampleRGB = (canvas, sampleCount = 500) => {
    if (!canvas) {
        return [];
    }

    const ctx = canvas.getContext('2d');

    const samples = [];
    for (let i = 0; i < sampleCount; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);

        const pixel = ctx.getImageData(x, y, 1, 1);

        samples.push({
            r: pixel.data[0],
            g: pixel.data[1],
            b: pixel.data[2],
        });
    }

    return samples;
};

export default sampleRGB;
