`npm run dev` allows auto-compilation and reload!

Adding `devtool: 'source-map'` makes it possible to see sources and put breakpoints in them in dev tools.

Pitfalls:
- Renaming index.js to main.js and updating package.json main to be main.js causes everything to break
