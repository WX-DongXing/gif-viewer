import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const isProd = process.env.NODE_ENV === 'production'

const devPlugins = isProd ? [] : [serve(), livereload()]

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'umd',
      name: 'GifViewer',
      sourcemap: !isProd
    },
    {
      file: 'lib/index.esm.js',
      format: 'es',
      sourcemap: !isProd
    }
  ],
  plugins: [
    nodeResolve(),
    typescript({
      useTsconfigDeclarationDir: true
    }),
    ...devPlugins
  ]
}
