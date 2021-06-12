import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'umd',
      name: 'GifViewer',
      sourcemap: true
    },
    {
      file: 'lib/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    typescript({
      useTsconfigDeclarationDir: true
    }),
    serve(),
    livereload()
  ]
}
