'use client';
import styles from "./page.module.css";
import {useEffect, useRef, useState} from "react";

const ImagePreview = ({image}) => {
    const ref = useRef(null);
    const maxWidth = 512;
    const maxHeight = 512;

    useEffect(() => {
        const canvas = ref.current;
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

        // Clear previous image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //ctx.drawImage(image,0,0);
        // scale image to canvas size:
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

    }, [image]);

    return <canvas className={styles.imagePreview} width={maxWidth} height={maxHeight} ref={ref}></canvas>;
}

export default function Home() {

    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        // On image input change, read the file data and store it in state.
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setImage(img);
            }
            img.src = e.target.result as string;
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
          {image && <ImagePreview image={image} />}
          <aside>The image never leaves your machine, all processing is done locally.</aside>
      </main>
    </div>
  );
}
