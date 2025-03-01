import dynamic from "next/dynamic";
import {forwardRef, useEffect, useId, useImperativeHandle, useRef, useState} from "react";

export const Plotly = dynamic(() =>
        // via: https://dev.to/composite/how-to-integrate-plotlyjs-on-nextjs-14-with-app-router-1loj
        import('plotly.js-dist-min').then(({ newPlot, purge }) => {
            const Plotly = forwardRef(({ id, className, data, layout, config }, ref) => {
                const originId = useId();
                const realId = id || originId;
                const originRef = useRef(null);
                const [handle, setHandle] = useState(undefined);

                useEffect(() => {
                    let instance;
                    originRef.current &&
                    newPlot(originRef.current, data, layout, config).then((ref) => setHandle((instance = ref)));
                    return () => {
                        instance && purge(instance);
                    };
                }, [data]);

                useImperativeHandle(
                    ref,
                    () => (handle ?? originRef.current ?? document.createElement('div')),
                    [handle]
                );

                return <div id={realId} ref={originRef} className={className}></div>;
            });
            Plotly.displayName = 'Plotly';
            return Plotly;
        }),
    { ssr: false }
);
