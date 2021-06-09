import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'umd',
      name: 'gifViewer',
      sourcemap: true
    },
    {
      file: 'lib/index.esm.js',
      format: 'es',
      name: 'gifViewer',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    typescript(),
    serve(),
    livereload()
  ]
}
