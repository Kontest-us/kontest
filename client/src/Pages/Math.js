import MathJax from 'react-mathjax2';
import React from 'react';

function Math(props) {
    let text = props.text;

    return (
        <MathJax.Context
            input="ascii"
            onLoad={() => { }}
            onError={(MathJax, error) => {
                console.warn(error);
                console.log(
                    'Encountered a math formatting error, re-attempting a typeset!',
                );
                MathJax.Hub.Queue(MathJax.Hub.Typeset());
            }}
            script="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML"
            options={{
                asciimath2jax: {
                    useMathMLspacing: true,
                    delimiters: [['{', '}']],
                    preview: 'none',
                },
                // this adds in automatic line breaks
                CommonHTML: { linebreaks: { automatic: true } },
                // "HTML-CSS": { linebreaks: { automatic: true } },
                // SVG: { linebreaks: { automatic: true } }
            }}
        >
            <MathJax.Text text={text} />
        </MathJax.Context>
    );
}

export default Math;