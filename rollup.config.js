// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default [{
  input: 'src/demos/playground/index.ts',
  output: {
    dir: 'output/demos/playground',
    format: 'iife'
  },
  plugins: [typescript()]
}, {
  input: 'src/demos/example/index2.ts',
  output: {
    dir: 'output/demos/example',
    format: 'iife'
  },
  plugins: [typescript()]
}];