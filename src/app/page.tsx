'use client';
import styles from "./page.module.css";
import { useState} from "react";
import Scatter3dRGB from '@/components/Scatter3d/Scatter3dRGB';
import ImagePreview from '@/components/ImagePreview/ImagePreview';
import {sampleRGB} from '@/helpers/colorSampler';
import SwatchGrid from "@/components/SwatchGrid/SwatchGrid";
import colours from "@/data/xkcdColours";
import sentenceCase from "@/helpers/sentenceCase";

// When we get to clustering, consider using a weighted euclidean distance calculation
// as detailed here: https://www.compuphase.com/cmetric.htm

export default function Home() {
    const [canvas, setCanvas] = useState(null);

    const previewWidth = 512;
    const previewHeight = 512;
    const numSamples = 1000; // 504 fits neatly into a 512 grid

    const samples = sampleRGB(canvas, numSamples);

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
            image.src = e.target.result as string;
        }
        reader.readAsDataURL(file);
    }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Prism: Image Analyser</h1>
          <label>
              <div>Pick an image and we will analyse it.</div>
              <br />
              <input type='file' onChange={handleImageChange} />
          </label>
          {canvas && <div className={styles.results}>
              <h3>Image Preview:</h3>
              <ImagePreview canvas={canvas} width={previewWidth} height={previewHeight} />

              <h3>{numSamples} Random Colour Samples:</h3>
              <SwatchGrid swatches={samples} />

              <br /><br />
              <Scatter3dRGB
                  title={'Plotted in RGB space'}
                  points={samples}
              />
                <br /><hr /><br />
          </div>}
          <aside>The image never leaves your device - all processing is done locally.</aside>
          <p>
              We take {numSamples} samples randomly across the image, plot that into RGB space, cluster the samples to find the most common colours, and then name those colours using the XKCD colour survey data.
          </p>
          <Scatter3dRGB
              title={'Sanitised XKCD colour space'}
              points={colours.map(col => {
                  return {
                      ...col,
                      label: sentenceCase(col.name),
                  };
              })}
              hovertemplate="%{customdata}<br />rgb(%{x}, %{y}, %{z})"
          />
          <p>
              Named colours sourced from the <a href='https://blog.xkcd.com/2010/05/03/color-survey-results/'>XKCD colour survey</a>. Small brag: I got a shoutout in <a href='https://blog.xkcd.com/2010/05/15/miscellaneous/comment-page-1/'>an earlier blog post</a> for a similar visualisation of these results.<br />
              I have removed colours with undesirable names such as 'puke green', and judgemental names like 'ugly purple', leaving us with a space of {colours.length} named colours. I'd like to remove colours that are very close to each other too. And also, did you know 'ecru' is a colour? This has sparked a thought about the responsibility we have when filtering or sanitising, and the impact it has on our culture and language. Who am I to remove 'ecru' just because I think it's a rarely used word.
          </p>
      </main>
    </div>
  );
}
