const SwatchGrid = ({swatches}) => {
    const px = 20;
    return <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${px}px)`,
        gap: '1px',
        width: '100%',
        height: '100%',
    }}>
        {swatches.map((sample, i) => <div key={i} style={{
            backgroundColor: `rgb(${sample.r}, ${sample.g}, ${sample.b})`,
            width: `${px}px`,
            height: `${px}px`,
        }} />)}
    </div>
};

export default SwatchGrid;
