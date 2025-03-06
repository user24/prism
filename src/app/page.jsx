'use client';
import styles from "./page.module.css";
import { useState} from "react";
import ImagePreview from '@/components/ImagePreview/ImagePreview';
import {sampleRGB} from '@/helpers/colorSampler';
import SwatchGrid from "@/components/SwatchGrid/SwatchGrid";
import colours from "@/data/xkcdColours";
import sentenceCase from "@/helpers/sentenceCase";
import kmeans from "@/helpers/kmeans";
import {Scatter3dColours, TYPES} from "@/components/Scatter3d/Scatter3dColours";

// When we get to clustering, consider using a weighted euclidean distance calculation
// as detailed here: https://www.compuphase.com/cmetric.htm

export default function Home() {
    const [canvas, setCanvas] = useState(null);

    const [maxWidth, maxHeight] = [512, 512];
    const [previewWidth, setPreviewWidth] = useState(maxWidth);
    const [previewHeight, setPreviewHeight] = useState(maxHeight);
    const [colourSpace, setColourSpace] = useState(TYPES.RGB);
    const numSamples = 1000; // 504 fits neatly into a 512 grid

    const samples = sampleRGB(canvas, numSamples).map(sample => {
        return {
            ...sample,
            x: sample.r,
            y: sample.g,
            z: sample.b,
        };
    });

    const hovertemplates = {
        [TYPES.RGB]: 'rgb(%{x}, %{y}, %{z})',
        [TYPES.HSV]: 'hsv(%{x}, %{y}, %{z})',
        [TYPES.XYZ]: 'xyz(%{x}, %{y}, %{z})',
    }

    const {clusters, centroids} = kmeans(samples, 2);

    const samplesWithCentroids = [...samples];
    // centroids.forEach(centroid => {
    //     samplesWithCentroids.push({
    //         centroid
    //     });
    // });

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
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale); // gives IDE error about too many args, but it's correct

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
              <input type='file' onChange={handleImageChange} />
          </label>
          {canvas && <div className={styles.results}>
              <h3>Image Preview:</h3>
              <ImagePreview canvas={canvas} width={previewWidth} height={previewHeight} />
              <br /><br /><br /><br />
              <h3>{numSamples} Random Colour Samples:</h3>
              <SwatchGrid swatches={samples} />

              <br /><br />
              <Scatter3dColours
                  title={`Plotted in ${colourSpace}`}
                  type={colourSpace}
                  hovertemplate={hovertemplates[colourSpace]}
                  points={samples}
              />
                <br /><br />
          </div>}
          <h3>Colour Space</h3>
          <label>HSV: <input type='radio' name='colourSpace' checked={colourSpace === TYPES.HSV} onChange={() => setColourSpace(TYPES.HSV)} /></label>
          <label>RGB: <input type='radio' name='colourSpace' checked={colourSpace === TYPES.RGB} onChange={() => setColourSpace(TYPES.RGB)} /></label>
          <label>XYZ: <input type='radio' name='colourSpace' checked={colourSpace === TYPES.XYZ} onChange={() => setColourSpace(TYPES.XYZ)} /></label>
          <p className={styles.text}>
              TODO: cluster the sampled points, then find the nearest named colour from the XKCD data.
          </p>
          <p className={styles.text}>
              We take {numSamples} samples randomly across the image, plot that into RGB space, cluster the samples to find the most common colours, and then name those colours using the XKCD colour survey data.
          </p>
          <Scatter3dColours
              title={`Sanitised XKCD colours in ${colourSpace}`}
              type={colourSpace}
              points={colours.map(col => {
                    return {
                        ...col,
                        label: sentenceCase(col.name),
                        x: col.r,
                        y: col.g,
                        z: col.b
                    };
              })}
              hovertemplate="%{customdata}<br />rgb(%{x}, %{y}, %{z})"
          />
          <p className={styles.text}>
              Named colours sourced from the <a href='https://blog.xkcd.com/2010/05/03/color-survey-results/'>XKCD colour survey</a>. Small brag: I got a shoutout <a href='https://blog.xkcd.com/2010/05/15/miscellaneous/comment-page-1/'>from XKCD</a> for a similar visualisation of these results :)<br /><br />
              I have removed colours with undesirable names such as 'puke green', and judgemental names like 'ugly purple', leaving us with a space of {colours.length} named colours. I'd like to remove colours that are very close to each other too. And also, did you know 'ecru' is a colour? This has sparked a thought about the responsibility we have when filtering or sanitising, and the impact it has on our culture and language. Who am I to remove 'ecru' just because I think it's a rarely used word.
          </p>
      </main>
    </div>
  );
}
