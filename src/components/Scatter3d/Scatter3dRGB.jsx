import {Plotly} from "./next-plotly";

// TODO: define the types for the props
const Scatter3dRGB = ({points, title = 'scatter plot', hovertemplate = 'rgb(%{x}, %{y}, %{z})'}) => {
    // https://plotly.com/javascript/3d-scatter-plots/

    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    const z = points.map(p => p.z);
    const colours = points.map(p => `rgb(${p.r || p.x}, ${p.g || p.y}, ${p.b || p.z})`);
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
                    xaxis: {title: {text: 'Red'}},
                    yaxis: {title: {text: 'Green'}},
                    zaxis: {title: {text: 'Blue'}}
                }
            } }
        />;
};

export default Scatter3dRGB;
