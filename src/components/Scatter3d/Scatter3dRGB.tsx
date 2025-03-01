import {Plotly} from "./next-plotly";

// TODO: define the types for the props
const Scatter3dRGB = ({points, title = 'scatter plot'}) => {
    // https://plotly.com/javascript/3d-scatter-plots/

    const x = points.map(p => p.r);
    const y = points.map(p => p.g);
    const z = points.map(p => p.b);
    const colours = points.map(p => `rgb(${p.r}, ${p.g}, ${p.b})`);

    return <Plotly
            data={[
                {
                    x,
                    y,
                    z,
                    type: 'scatter3d',
                    mode: 'markers',
                    marker: {color: colours, size: 5},
                    hovertemplate: 'rgb(%{x}, %{y}, %{z})',
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
