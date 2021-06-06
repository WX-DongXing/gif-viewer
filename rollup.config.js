import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'gifViewer'
  },
  plugins: [
    nodeResolve(),
    typescript(),
    serve('dist'),
    livereload('dist')
  ]
}
