const esbuild = require('esbuild')

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require('esbuild-node-externals')

esbuild.build({
  entryPoints: ['./app/index.ts', './app/types.ts', './app/database.ts', './app/utils.ts'],
  outdir: './lib',
  bundle: true,
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node14',
  plugins: [nodeExternalsPlugin()]
}).catch(() => process.exit(1))