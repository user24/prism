import {useEffect, useRef} from "react";
import styles from "@/app/page.module.css";

const ImagePreview = ({canvas, width, height}) => {
    const ref = useRef(null);

    const drawPreview = (canvas) => {
        const destCtx = ref.current.getContext('2d')
        destCtx.clearRect(0, 0, width, height);
        destCtx.drawImage(canvas, 0, 0);
    };

    useEffect(() => {
        if (ref) {
            drawPreview(canvas);
        }
    }, [canvas, ref]);

    return <canvas className={styles.imagePreview} width={width} height={height} ref={ref}></canvas>;
};

export default ImagePreview;
