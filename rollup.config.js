import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const bundle = (format, filename, options = {}) => ({
  input: 'src/index.ts',
  output: {
    file: filename,
    format: format,
    name: 'PixiGraph',
    sourcemap: true,
  },
  external: [
    ...Object.keys(pkg.peerDependencies),
    ...(!options.resolve ? Object.keys(pkg.dependencies) : []),
  ],
  plugins: [
    ...(options.resolve ? [resolve({ preferBuiltins: false })] : []),
    commonjs(),
    typescript({
      typescript: require('typescript'),
      clean: options.stats,
    }),
    ...(options.minimize ? [terser()] : []),
    ...(options.stats ? [visualizer({
      filename: filename + '.stats.html',
    })] : []),
  ],
});

export default [
  bundle('cjs', pkg.main),
  bundle('es', pkg.module),
  bundle('iife', pkg.browser, { resolve: true }),
  {
    input: 'src/index.ts',
    output: {
      name: "PixiGraph",
      file: pkg.browser.replace('.min', ''),
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      resolve({
        browser: true,
        module: true,
        preferBuiltins: false
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      builtins(),
      globals(),
      nodePolyfills({'include': ['events', 'url']})
    ]
  }
]
 
