# Integrating Basketball Shot Analyzer into Your Portfolio

Since you already have a GitHub Pages portfolio at `https://shubh-go.github.io/`, here's how to add the basketball shot analyzer as a new project.

## Option 1: Add as a New Page (Recommended)

### Step 1: Add Files to Your Repository

In your `shubh-go.github.io` repository, create a new folder or add files:

```
shubh-go.github.io/
├── index.html          (your existing portfolio)
├── shot-analyzer.html  (new file - rename index.html to this)
├── style.css           (or shot-analyzer.css if you want separate styling)
└── app.js              (or shot-analyzer.js)
```

### Step 2: Update Your Portfolio to Link to It

Add a link in your portfolio's `index.html`:

```html
<a href="shot-analyzer.html">🏀 Basketball Shot Form Analyzer</a>
```

Or add it to your "What I'm Working On" section:

```html
<div class="project">
  <h3>Basketball Shot Form Analyzer</h3>
  <p>Real-time pose detection and form analysis using MediaPipe</p>
  <a href="shot-analyzer.html" class="btn">Try It</a>
</div>
```

## Option 2: Add as a Subdirectory

### Step 1: Create a Subdirectory

```
shubh-go.github.io/
├── index.html
├── shot-analyzer/
│   ├── index.html
│   ├── style.css
│   └── app.js
```

### Step 2: Link from Portfolio

```html
<a href="shot-analyzer/">🏀 Basketball Shot Analyzer</a>
```

The URL will be: `https://shubh-go.github.io/shot-analyzer/`

## Option 3: Embed as a Section (Iframe)

You can embed it directly in your portfolio:

```html
<section id="shot-analyzer">
  <h2>Basketball Shot Form Analyzer</h2>
  <iframe src="shot-analyzer.html" width="100%" height="800px" frameborder="0"></iframe>
</section>
```

## Quick Integration Steps

1. **Copy files to your repository:**
   ```bash
   cd /path/to/shubh-go.github.io
   # Copy the files
   cp /path/to/MVP_Test/index.html shot-analyzer.html
   cp /path/to/MVP_Test/style.css shot-analyzer-style.css  # or use existing
   cp /path/to/MVP_Test/app.js shot-analyzer.js
   ```

2. **Update shot-analyzer.html to use correct paths:**
   ```html
   <link rel="stylesheet" href="shot-analyzer-style.css">
   <script src="shot-analyzer.js"></script>
   ```

3. **Add to your portfolio index.html:**
   ```html
   <a href="shot-analyzer.html" class="project-link">
     🏀 Basketball Shot Form Analyzer
   </a>
   ```

4. **Commit and push:**
   ```bash
   git add shot-analyzer.html shot-analyzer-style.css shot-analyzer.js
   git commit -m "Add basketball shot form analyzer"
   git push
   ```

## Styling to Match Your Portfolio

If you want it to match your existing portfolio style, you can:

1. Use your existing CSS classes
2. Add a wrapper class to match your portfolio theme
3. Keep it separate for a distinct look

## Example Portfolio Entry

Add this to your "What I'm Working On" or "Highlighted Work" section:

```html
<div class="project-card">
  <h3>🏀 Basketball Shot Form Analyzer</h3>
  <p>
    Real-time pose detection and shooting form analysis using MediaPipe.js. 
    Compare your shot to a benchmark and get instant feedback.
  </p>
  <div class="tech-stack">
    <span>JavaScript</span>
    <span>MediaPipe</span>
    <span>Computer Vision</span>
  </div>
  <a href="shot-analyzer.html" class="btn">Try It Live</a>
</div>
```

## URL Structure

After deployment:
- Main portfolio: `https://shubh-go.github.io/`
- Shot analyzer: `https://shubh-go.github.io/shot-analyzer.html`
- Or as subdirectory: `https://shubh-go.github.io/shot-analyzer/`

