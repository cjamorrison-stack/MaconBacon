# Repair Network Prototype

A React + Vite prototype for finding technicians and replacement parts for African processing plants.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the printed local URL in your browser.

## Build for production

```bash
npm run build
```

## Deploy to a live website

This app is ready for static hosting. Use one of these options:

- **Netlify**: connect the project repository, set `npm run build` as the build command, and `dist` as the publish directory.
- **Vercel**: import the repo, use `npm run build`, and publish from `dist`. A `vercel.json` file is included.
- **GitHub Pages**: build locally and deploy the `dist` folder.

### Netlify config

A `netlify.toml` file is included so Netlify can build and serve the app correctly.

### Vercel config

A `vercel.json` file is included so Vercel can detect the static build and route all requests to `index.html`.

## What is included

- African technician and parts directory data
- Live search and location filtering
- Job request logging and technician quote capture
- Modern responsive UI
- Production build output via Vite
- Static hosting deployment configuration
