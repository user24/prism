'use client';
import styles from "./page.module.css";
import {forwardRef, useEffect, useId, useImperativeHandle, useRef, useState} from "react";
import {kmeans} from "./kmeans";
import dynamic from "next/dynamic";

// via: https://dev.to/composite/how-to-integrate-plotlyjs-on-nextjs-14-with-app-router-1loj
export const Plotly = dynamic(
    () =>
        import('plotly.js-dist-min').then(({ newPlot, purge }) => {
            const Plotly = forwardRef(({ id, className, data, layout, config }, ref) => {
                const originId = useId();
                const realId = id || originId;
                const originRef = useRef(null);
                const [handle, setHandle] = useState(undefined);

                useEffect(() => {
                    let instance;
                    originRef.current &&
                    newPlot(originRef.current!, data, layout, config).then((ref) => setHandle((instance = ref)));
                    return () => {
                        instance && purge(instance);
                    };
                }, [data]);

                useImperativeHandle(
                    ref,
                    () => (handle ?? originRef.current ?? document.createElement('div')),
                    [handle]
                );

                return <div id={realId} ref={originRef} className={className}></div>;
            });
            Plotly.displayName = 'Plotly';
            return Plotly;
        }),
    { ssr: false }
);

const Scatter3d = ({points, title = 'scatter plot'}) => {
    // Given a set of points like this [{x: 1, y: 2, z: 3}, {x: 4, y: 5, z: 6}], plot them on a 3d scatter graph:
    // https://plotly.com/javascript/3d-scatter-plots/

    const x = points.map(p => p.r);
    const y = points.map(p => p.g);
    const z = points.map(p => p.b);
    const colours = points.map(p => `rgb(${p.r}, ${p.g}, ${p.b})`);

    return (
        <Plotly
            data={[
                {
                    x,
                    y,
                    z,
                    type: 'scatter3d',
                    mode: 'markers',
                    marker: {color: colours, size: 5}
                }
            ]}

            layout={ {
                width: 1000,
                height: 1000,
                title: {text: title},
                scene: {
                    xaxis: {title: {text: 'Red'}},
                    yaxis: {title: {text: 'Green'}},
                    zaxis: {title: {text: 'Blue'}}
                }
        } }
        />);
};

const ImagePreview = ({canvas, width, height}) => {
    const ref = useRef(null);

    const drawPreview = (canvas) => {
        var destCtx = ref.current.getContext('2d')
        destCtx.clearRect(0, 0, width, height);
        destCtx.drawImage(canvas, 0, 0);
    };

    useEffect(() => {
        if (ref) {
            drawPreview(canvas);
        }
    }, [canvas, ref]);

    return <canvas className={styles.imagePreview} width={width} height={height} ref={ref}></canvas>;
}

const sampleRGBFromCanvas = (canvas, sampleCount = 500) => {
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
}

const SampleDisplay = ({samples}) => {
    const px = 20;
    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${px}px)`,
        gap: '1px',
        width: '100%',
        height: '100%',
    }}>
        {samples.map((sample, i) => <div key={i} style={{
            backgroundColor: `rgb(${sample.r}, ${sample.g}, ${sample.b})`,
            width: `${px}px`,
            height: `${px}px`,
        }} />)}
    </div>
}


export default function Home() {
    const [canvas, setCanvas] = useState(null);

    const previewWidth = 512;
    const previewHeight = 512;
    const numSamples = 1000; // 504 fits neatly into the grid

    const samples = sampleRGBFromCanvas(canvas, numSamples);
    console.log({samples});

    const imageToCanvas = (image) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Clamp the size
        if (image.width > previewWidth || image.height > previewHeight) {
            const scale = Math.min(previewWidth / image.width, previewHeight / image.height);
            canvas.width = image.width * scale;
            canvas.height = image.height * scale;
        } else {
            canvas.width = image.width;
            canvas.height = image.height;
        }

        // Clear previous image (in case new image is smaller or contains transparency)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image, scaled to canvas size
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

        return canvas;
    }

    const handleImageChange = (e) => {
        // On image input change, read the file data and store it in state.
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                setCanvas(imageToCanvas(image));
            };
            image.src = e.target.result as string;
        }
        reader.readAsDataURL(file);
    }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Prism Image Analyser</h1>
          <label>
              <div>Pick an image and we will analyse it.</div>
              <br />
              <input type='file' onChange={handleImageChange} />
          </label>
          {canvas && <>
              <h3>Image Preview:</h3>
              <ImagePreview canvas={canvas} width={previewWidth} height={previewHeight} />

              <h3>{numSamples} Random Colour Samples:</h3>
              <SampleDisplay samples={samples} />

              <Scatter3d points={samples} title={'Samples in 3d space'} />
          </>}
          <aside>The image never leaves your device - all processing is done locally.</aside>
      </main>
    </div>
  );
}
