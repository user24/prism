'use client';
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import ImagePreview from '@/components/ImagePreview/ImagePreview';
import {sampleRGB} from '@/helpers/colorSampler';
import SwatchGrid from "@/components/SwatchGrid/SwatchGrid";
import colours from "@/data/xkcdColours";
import sentenceCase from "@/helpers/sentenceCase";
import {
    euclideanDistance,
    kmeans
} from "@/helpers/kmeans";
import {Scatter3dColours, rgb2hsv, hsv2Rgb, TYPES} from "@/components/Scatter3d/Scatter3dColours";

// Consider using a weighted euclidean distance calculation
// as detailed here: https://www.compuphase.com/cmetric.htm

const numSamples = 1500;
const numClusters = 7;

const Swatch = ({colour}) => {
    const colorIsDark = ({r, g, b}) => {
        return ((r * 0.299) + (g * 0.587) + (b * 0.114)) <= 186;
    };

    const classes = [styles.swatch];
    if (colorIsDark(colour)) {
        classes.push(styles.darkSwatch);
    }

    return <div className={classes.join(' ')} style={{backgroundColor: `rgb(${colour.r}, ${colour.g}, ${colour.b})`}}>{colour.label}</div>;
}

const plotPointInSpaceUsingHSV = (point) => {
    const {h, s, v} = rgb2hsv(point.r, point.g, point.b);
    return {
        ...point,
        x: h,
        y: s,
        z: v
    };
}

const performKmeans = (canvas, numClusters, filterGreys) => {
    const samples = sampleRGB(canvas, numSamples).filter(colour => {
        if (!filterGreys) {
            return true;
        }
        // remove greyish colours:
        const [r, g, b] = [colour.r, colour.g, colour.b];
        const threshold = 20;
        return Math.abs(r - g) > threshold || Math.abs(r - b) > threshold || Math.abs(g - b) > threshold;
    }).map(plotPointInSpaceUsingHSV); // TODO: make the colour space configurable

    const {clusters, centroids, initalCentroids} = kmeans(samples, numClusters);
    //const centroids =initalCentroids;

    const namedCentroids = centroids.map(centroid => {
        const nearest = colours.map(col => {
            const hsvPlottedPoint = plotPointInSpaceUsingHSV(col);
            return {
                ...hsvPlottedPoint,
                dist: euclideanDistance(centroid, hsvPlottedPoint)
            };
        }).sort((a, b) => a.dist - b.dist)[0];

        return {
            ...centroid,
            label: sentenceCase(nearest.name)
        };
    }).map(centroid => {
        const {r, g, b} = hsv2Rgb(centroid.x, centroid.y, centroid.z);
        console.log({r, g, b, centroid});
        return {
            ...centroid,
            r,
            g,
            b
        };
    });

    console.log({centroids, namedCentroids});

    return {samples, clusters, centroids: namedCentroids};
};

export default function Home() {
    const [canvas, setCanvas] = useState(null);

    const [maxWidth, maxHeight] = [512, 512];
    const [previewWidth, setPreviewWidth] = useState(maxWidth);
    const [previewHeight, setPreviewHeight] = useState(maxHeight);
    const [colourSpace, setColourSpace] = useState(TYPES.HSV);
    const [filterGreys, setFilterGreys] = useState(true);
    const [samples, setSamples] = useState([]);
    const [clusters, setClusters] = useState(null);
    const [centroids, setCentroids] = useState(null);

    const hovertemplates = {
        [TYPES.RGB]: 'rgb(%{x}, %{y}, %{z})',
        [TYPES.HSV]: 'hsv(%{x}, %{y}, %{z})',
        [TYPES.XYZ]: 'xyz(%{x}, %{y}, %{z})',
    };

    useEffect(() => {
        if (canvas && !samples.length) {
            const {samples, centroids, clusters} = performKmeans(canvas, numClusters, filterGreys);
            setSamples(samples);
            setCentroids(centroids);
            setClusters(clusters);
        }
    }, [canvas]);

    const imageToCanvas = (image) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Clamp the size
        if (image.width > maxWidth || image.height > maxHeight) {
            const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
            canvas.width = image.width * scale;
            canvas.height = image.height * scale;
        } else {
            canvas.width = image.width;
            canvas.height = image.height;
        }

        setPreviewWidth(canvas.width);
        setPreviewHeight(canvas.height);

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
                setSamples([]);
                setCanvas(imageToCanvas(image));
            };
            image.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Prism: Image Analyser</h1>
          <label className={styles.callout}>
              <div>
                  Pick an image and we will analyse it.<br />
                  The image never leaves your device - all processing is done locally.
              </div>
              <br />
              <input type='file' id={'imageUpload'} onChange={handleImageChange} />
          </label>
          {(samples.length > 0) && <div className={styles.results}>
              <h3>Image Preview:</h3>
              <label htmlFor='imageUpload'>
                  <ImagePreview canvas={canvas} width={previewWidth} height={previewHeight} />
              </label>
              <br /><br /><br /><br />
              <h3>Detected colours: </h3> {centroids.map(centroid => <Swatch colour={centroid} key={JSON.stringify(centroid)} />)}
              <br /><br />
              <p className={styles.text}>
              <label>
                  Remove greys: <input type='checkbox' checked={filterGreys} onChange={() => setFilterGreys(!filterGreys)} /><br />
              </label>
              </p>
              <h2>Visualisation of process:</h2>
              <br />
              <h3>~{numSamples} Random Colour Samples:</h3>
              <p className={styles.text}>
                  It's fascinating to me that when you take an image of, say, a tree you think "well, it's green" but then the colour samples show that this idea of 'green' is much more derived from the context of it being a tree, than the actual colour data.
              </p>
              <p className={styles.text}>
                  Compare the colours you see in the swatches below, to the colours that come to mind in the source image.
              </p>
              <SwatchGrid swatches={samples} />

              <br /><br />
              <Scatter3dColours
                  title={`Plotted in ${colourSpace}`}
                  type={colourSpace}
                  hovertemplate={hovertemplates[colourSpace]}
                  points={samples}
              />
              <p className={styles.text}>
                  RGB is not the best colour space, you will probably see similar colours are actually quite spread-out in the space.<br />
                  There's also often a big streak of greyish colours from black to white, which skews the clustering - this is why we see a lot of greyish colours in the output.<br />
                  I'd like to remove this diagonal column of greyish colours, or use HSV space instead, which aligns better with how humans see colour.<br />
                  There's also the option of using a weighted distance function instead of linear euclidean distance, to account for the fact that we don't see all colours equally.
              </p>
                <br /><br />
              <Scatter3dColours
                  title={`Centroids, labelled with the nearest colour from the xkcd named colours`}
                  type={colourSpace}
                  hovertemplate={`%{customdata}<br />${hovertemplates[colourSpace]}`}
                  points={centroids}
              />
          </div>}
          {/*<h3>Colour Space</h3>*/}
          {/*<label>HSV: <input type='radio' name='colourSpace' checked={colourSpace === TYPES.HSV} onChange={() => setColourSpace(TYPES.HSV)} /></label>*/}
          {/*<label>RGB: <input type='radio' name='colourSpace' checked={colourSpace === TYPES.RGB} onChange={() => setColourSpace(TYPES.RGB)} /></label>*/}
          {/*<label>XYZ: <input type='radio' name='colourSpace' checked={colourSpace === TYPES.XYZ} onChange={() => setColourSpace(TYPES.XYZ)} /></label>*/}
          <p className={styles.text}>
              We take {numSamples} samples randomly across the image, plot that into RGB space, cluster the samples to find the most common colours, and then name those colours using the xkcd colour survey data.
          </p>
          <Scatter3dColours
              title={`Sanitised xkcd colours in ${colourSpace}`}
              className={styles.plotly}
              type={colourSpace}
              points={colours.map(col => {
                    return {
                        ...col,
                        label: sentenceCase(col.name)
                    };
              })}
              hovertemplate={`%{customdata}<br />${hovertemplates[colourSpace]}`}
          />
          <p className={styles.text}>
              Named colours sourced from the <a href='https://blog.xkcd.com/2010/05/03/color-survey-results/'>xkcd colour survey</a>. Small brag: I got a shoutout <a href='https://blog.xkcd.com/2010/05/15/miscellaneous/comment-page-1/'>from Randall</a> for a similar visualisation of these results :)<br /><br />
              I have removed colours with undesirable names such as 'puke green', and judgemental names like 'ugly purple', leaving us with a space of {colours.length} named colours. I'd like to remove colours that are very close to each other too. And also, did you know 'ecru' is a colour? This has sparked a thought about the responsibility we have when filtering or sanitising, and the impact it has on our culture and language. Who am I to remove 'ecru' just because I think it's a rarely used word.
          </p>
      </main>
    </div>
  );
}
