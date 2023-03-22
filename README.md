`npm run dev` allows auto-compilation and reload!

`npx jest` runs unit tests!

Adding `devtool: 'source-map'` makes it possible to see sources and put breakpoints in them in dev tools.

Added custom.d.ts file to avoid typescript compilation issues in `import spacerock from './assets/spacerock.jpg'`

Pitfalls:
- Renaming index.js to main.js and updating package.json main to be main.js causes everything to break
