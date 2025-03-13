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

    return <span className={classes.join(' ')} style={{backgroundColor: `rgb(${colour.r}, ${colour.g}, ${colour.b})`}}>{colour.label}</span>;
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
    }).filter((centroid, i, centroids) => {
        // remove centroids with different XYZs, so were not caught by the kmeans dedupe,
        // but that still map to the same name
        return centroids.findIndex(c => c.label === centroid.label) === i;
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
        <h1>Prism</h1>
          <em>Images goes in, named colours come out.</em>
          <label className={styles.callout}>
              <div>
                  Pick an image.<br />
                  All processing is done locally - the image never leaves your device
              </div>
              <br />
              <input type='file' id={'imageUpload'} onChange={handleImageChange} />
          </label>
          {(samples.length > 0) && <div className={styles.results}>
              <h3>Image in:</h3>
              <label htmlFor='imageUpload'>
                  <ImagePreview canvas={canvas} width={previewWidth} height={previewHeight} />
              </label>
              <br /><br />
              <h3>Colours out:</h3><br />
              {centroids.map(centroid => <Swatch colour={centroid} key={JSON.stringify(centroid)} />)}
              <br /><br />
              <p className={styles.text}>
                  Derived from these {samples.length} randomly picked samples, to be clustered into groups of similar colours, and then compared against known names to give the above set of named colour swatches.
              </p>
              <SwatchGrid swatches={samples} className={styles.gridSwatch} />
              <br /><br />
              {/*<p className={styles.text}>*/}
              {/*<label>*/}
              {/*    Remove greys: <input type='checkbox' checked={filterGreys} onChange={() => setFilterGreys(!filterGreys)} /><br />*/}
              {/*</label>*/}
              {/*</p>*/}
              {/*<h2>Visualisation of process:</h2>*/}
              <br />
              <h2>Thoughts and explanation.</h2>
              <p className={styles.text}>
                  Compare the colours you see in the swatches, randomly sampled from the image, to the colours that come to mind when looking at the source image.
                  </p>
              <p className={styles.text}>
              Does the dominant colour change?
                  </p>
              <p className={styles.text}>
                  Are the colours that you pick out first actually the most common colours, or are you assigning more importance to certain objects or certain shades?
                  </p>
              <p className={styles.text}>
                  It's fascinating to me that when you take an image of, say, a tree you think "well, it's green" but then the colour samples often show that this idea of 'green' is much more derived from the context of it being a tree, than the actual colour data.
              </p>
              <p className={styles.text}>The way humans percieve colour is intimately wrapped up with the layers of meaning we apply to the world in general, our eyes and brains pick out certain objects or evolutionarily important colours and present a view of the world which is abstracted from reality from the very moment of perception.
              </p>
              <p className={styles.text}>
                  Sometimes a colour happens to be named in a way that seems eerily accurate, for example a photo of a road might be labelled 'concrete grey', or a sky might get tagged 'cloudy blue'. If you didn't know about the underlying algorithm, you might give the AI more credit than it's due. Let's pull back the curtain and see there's no ghost in this machine :)
              </p>

              <p className={styles.text}>
                  If we plot these colour samples into a 3d space, with hue, saturation and value as the axes, we can start to pick out groups (or 'clusters') of similar colours. Note that I'm projecting these into a cube shaped space because it was easier, but <em>really</em> it should be a cylinder because that's how HSV was designed - for the purposes of this it works well enough, but there's plenty of room for improvement.
              </p>
              <Scatter3dColours
                  className={styles.plotly}
                  title={`Your image plotted in ${colourSpace}`}
                  type={colourSpace}
                  hovertemplate={hovertemplates[colourSpace]}
                  points={samples}
              />
                <p className={styles.text}>
                    You might already be able to see a few distinct groupings of colours. Our goal is to get the computer to see them too. By applying the k-means clustering algorithm to the data, we end up with a small number of single points which each sit in the middle of one of these clusters. We call these points centroids. The next step for <strong>Prism</strong> is simply to find the nearest named colour to each centroid.
                </p>
              <Scatter3dColours
                  className={styles.plotly}
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
              <strong>Prism</strong> takes colour samples from an image, clusters them into a few groups of similar colours, and then compares the center of those clusters to pre-named colours, to output for example 'blue and yellow' from an image of a beach. Try it out!<br /><br />
              The webcomic <a href='https://blog.xkcd.com/2010/05/03/color-survey-results/'>xkcd</a> once ran an experiment where 5 million random colours were named by 222,500 visitors. The visualisation below shows the most common {colours.length} names, which are the data we use to name the colours - hover over a colour point to see its name.<br /><br />
              Small brag: I got a shoutout <a href='https://blog.xkcd.com/2010/05/15/miscellaneous/comment-page-1/'>from Randall</a> for a similar visualisation :)
          </p>
          <Scatter3dColours
              className={styles.plotly}
              title={'xkcd colour names'}
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
              For the purposes of <strong>Prism</strong> I have removed colours with undesirable names such as Puke Green <Swatch colour={{r: 154, g: 174, b: 7}} /> and judgemental names like Ugly Purple <Swatch colour={{r: 164, g: 66, b: 160}} /> (I actually quite like that one), leaving us with a space of {colours.length} named colours. I've thought about removing colours that are very close to each other too. But then, maybe Cobalt Blue <Swatch colour={{r: 3, g: 10, b: 167}} />really is different to Royal Blue <Swatch colour={{r: 5, g: 4, b: 170}} />
          <br /><br />
          Did you know 'ecru' is a colour? I was on the verge of removing it because I'd never heard of it, but this sparked a thought about the responsibility we have and the impact it has on our culture and language. Not just when filtering, sanitising, and removing outliers, but when creating tools and publishing information more generally too. Who am I to remove 'ecru' just because I think it's a rarely used word. Clearly it's common enough to feature in the top {colours.length}.
              <br /><br />
              We must be careful not to bake our biases into the software we write.
          </p>
          <hr className={styles.hr} />
          <p className={styles.text}>
              Who made this? <strong>Hi!</strong> I'm <a href={'https://solidred.co.uk'}>Howard Yeend</a>, a lead engineer at <a href={'https://os.uk'}>Ordnance Survey</a>. My pronouns are he/they, and I love the web. I'm keen on building happy teams who collaborate fluidly to create innovative solutions to strategically relevant problems.
          </p>
          <Swatch colour={{r: 254, g: 255, b: 202, label:'{ecru, apparently}'}} />
      </main>
    </div>
  );
}
