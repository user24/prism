import css from './swatchgrid.module.css'

const SwatchGrid = ({swatches}) => {
    return <div className={css.grid}>
        {swatches.map((sample, i) => <div key={i} className={css.swatch} style={{
            backgroundColor: `rgb(${sample.r}, ${sample.g}, ${sample.b})`
        }} />)}
    </div>
};

export default SwatchGrid;
