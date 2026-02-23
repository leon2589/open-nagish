const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isDev = process.argv.includes('--dev');

const commonOptions = {
  entryPoints: ['src/accessibionid.js'],
  bundle: true,
  sourcemap: isDev,
  target: ['es2018'],
  define: {
    'process.env.NODE_ENV': isDev ? '"development"' : '"production"',
  },
};

async function build() {
  fs.mkdirSync('dist', { recursive: true });

  await esbuild.build({
    ...commonOptions,
    outfile: 'dist/accessibionid.min.js',
    format: 'iife',
    globalName: 'AccessibioNid',
    minify: !isDev,
    banner: {
      js: `/*! AccessibioNid v1.0.0 | MIT License | https://github.com/accessibionid */`,
    },
  });

  await esbuild.build({
    ...commonOptions,
    outfile: 'dist/accessibionid.esm.js',
    format: 'esm',
    minify: !isDev,
  });

  const stat = fs.statSync('dist/accessibionid.min.js');
  console.log(`Built dist/accessibionid.min.js (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log('Built dist/accessibionid.esm.js');

  if (isDev) {
    const ctx = await esbuild.context({
      ...commonOptions,
      outfile: 'dist/accessibionid.min.js',
      format: 'iife',
      globalName: 'AccessibioNid',
    });
    await ctx.serve({
      servedir: '.',
      port: 3000,
    });
    console.log('Dev server running at http://localhost:3000/demo.html');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
