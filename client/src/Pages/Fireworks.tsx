import { Fireworks } from 'fireworks/lib/react'
import React, { FunctionComponent } from 'react'; // importing FunctionComponent

let width = window.innerWidth;
let height = window.innerHeight;

let fxProps = {
    count: 1,
    interval: 200,
    colors: ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
    calc: (props: any, i: any) => ({
      ...props,
      x: Math.random() * width - 300,
    y: Math.random() * height,
    })
  }


export const Firework = () => <div>
                    <Fireworks {...fxProps} />
                    </div>;

