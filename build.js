const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isDev = process.argv.includes('--dev');

const commonOptions = {
  entryPoints: ['src/open-nagish.js'],
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
    outfile: 'dist/open-nagish.min.js',
    format: 'iife',
    globalName: 'OpenNagish',
    minify: !isDev,
    banner: {
      js: `/*! OpenNagish v1.0.1 | MIT License | by Leonid Shoresh | https://github.com/leon2589/open-nagish */`,
    },
  });

  await esbuild.build({
    ...commonOptions,
    outfile: 'dist/open-nagish.esm.js',
    format: 'esm',
    minify: !isDev,
  });

  const stat = fs.statSync('dist/open-nagish.min.js');
  console.log(`Built dist/open-nagish.min.js (${(stat.size / 1024).toFixed(1)} KB)`);
  console.log('Built dist/open-nagish.esm.js');

  if (isDev) {
    const ctx = await esbuild.context({
      ...commonOptions,
      outfile: 'dist/open-nagish.min.js',
      format: 'iife',
      globalName: 'OpenNagish',
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
