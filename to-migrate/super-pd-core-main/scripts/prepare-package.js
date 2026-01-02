import url from 'url';
import path from 'path';
import fse from 'fs-extra';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyFile(file) {
  const buildPath = path.resolve(__dirname, '../dist/', path.basename(file.to || file.from))
  await fse.copy(file.from, buildPath)
  console.log(`Copied ${file.from} to ${buildPath}`)
}

async function createPackageFile() {
  const packageData = await fse.readFile(path.resolve(__dirname, '../package.json'), 'utf8')
  const newPackageData = {
    ...JSON.parse(packageData),
    scripts: undefined,
    devDependencies: undefined,
    main: './index.js',
    'umd:main': './index.umd.cjs',
    unpkg: './index.umd.cjs',
    jsdelivr: './index.umd.cjs',
    module: './index.js',
    types: './index.d.ts',
    exports: {
      '.': {
        import: './index.js',
        require: './index.umd.cjs',
        types: './index.d.ts',
      },
      './style.css': {
        import: './style.css',
        require: './style.css'
      }
    },
  }
  const buildPath = path.resolve(__dirname, '../dist/package.json')

  await fse.writeFile(buildPath, JSON.stringify(newPackageData, null, 2), 'utf8')
  console.log(`Created package.json in ${buildPath}`)

  return newPackageData
}

async function run() {
  await Promise.all(
    [
      { from: './README.md' },
      { from: './LICENSE' },
    ].map((file) => copyFile(file))
  )
  await createPackageFile()
}

run();
