import {Plotly} from "./next-plotly";

function rgb2hsv (r, g, b) {
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
        diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}

const rgb2xyz = (r, g, b) => {
    // via: https://dev.to/bytebodger/using-different-color-spaces-to-compare-colors-5agg
    const convert = color => {
        color = color / 255;
        color = color > 0.04045 ? Math.pow(((color + 0.055) / 1.055), 2.4) : color / 12.92;
        color = color * 100;
        return color;
    }

    const red = convert(r);
    const green = convert(g);
    const blue = convert(b);
    const x = (red * 0.4124564) + (green * 0.3575761) + (blue * 0.1804375);
    const y = (red * 0.2126729) + (green * 0.7151522) + (blue * 0.0721750);
    const z = (red * 0.0193339) + (green * 0.1191920) + (blue * 0.9503041);
    return {
        x,
        y,
        z,
    };
};

const TYPES = {
    HSV: 'HSV',
    RGB: 'RGB',
    XYZ: 'XYZ'
};

// TODO: define the types for the props
const Scatter3dColours = ({points, title = 'scatter plot', type=TYPES.RGB, hovertemplate = 'rgb(%{r}, %{g}, %{b})'}) => {
    // example: https://plotly.com/javascript/3d-scatter-plots/

    let xTitle = 'Red';
    let yTitle = 'Green';
    let zTitle = 'Blue';

    if (type === TYPES.HSV) {
        points = points.map(p => {
            const {h, s, v} = rgb2hsv(p.r, p.g, p.b);
            return {
                ...p,
                x: h,
                y: s,
                z: v
            };
        });
        xTitle = 'Hue';
        yTitle = 'Saturation';
        zTitle = 'Value';
    } else if (type === TYPES.XYZ) {
        points = points.map(p => {
            const {x, y, z} = rgb2xyz(p.r, p.g, p.b);
            return {
                ...p,
                x,
                y,
                z
            };
        });
        xTitle = 'X';
        yTitle = 'Y';
        zTitle = 'Z';
    }

    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    const z = points.map(p => p.z);
    const colours = points.map(p => `rgb(${p.r}, ${p.g}, ${p.b})`);
    const customdata = points.map(p => p.label);

    return <Plotly
            data={[
                {
                    x,
                    y,
                    z,
                    customdata,
                    hovertemplate,
                    type: 'scatter3d',
                    mode: 'markers',
                    marker: {color: colours, size: 5},
                    name: ''
                }
            ]}

            layout={ {
                paper_bgcolor: '#fafafa',
                width: 1000,
                height: 1000,
                title: {text: title},
                scene: {
                    xaxis: {title: {text: xTitle}},
                    yaxis: {title: {text: yTitle}},
                    zaxis: {title: {text: zTitle}}
                }
            } }
        />;
};

export default Scatter3dColours;

export {
    TYPES,
    Scatter3dColours
};
