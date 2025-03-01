'use client';
import styles from "./page.module.css";
import { useState} from "react";
import Scatter3dRGB from '@/components/Scatter3d/Scatter3dRGB';
import ImagePreview from '@/components/ImagePreview/ImagePreview';
import {sampleRGB} from '@/helpers/colorSampler';
import SwatchGrid from "@/components/SwatchGrid/SwatchGrid";

// When we get to clustering, consider using a weighted euclidean distance calculation
// as detailed here: https://www.compuphase.com/cmetric.htm

export default function Home() {
    const [canvas, setCanvas] = useState(null);

    const previewWidth = 512;
    const previewHeight = 512;
    const numSamples = 1000; // 504 fits neatly into the grid

    const samples = sampleRGB(canvas, numSamples);
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
          </div>}
          <aside>The image never leaves your device - all processing is done locally.</aside>
      </main>
    </div>
  );
}
