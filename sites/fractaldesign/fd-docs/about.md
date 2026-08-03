# fractals-sass Walkthrough

We have successfully developed **fractals-sass** inside `/Users/amrit/mandala/packages/fractals-sass`. 
The system is built in **TypeScript** and supports compiling both standard CSS and **pure indented Sass (tab-indented)**.

---

## 📂 Project Structure

All files are structured inside `/Users/amrit/mandala/packages/fractals-sass`:

- [package.json](file:///Users/amrit/mandala/packages/fractals-sass/package.json): Package metadata, TS compilation config, CLI binary mapping, and exports.
- [tsconfig.json](file:///Users/amrit/mandala/packages/fractals-sass/tsconfig.json): TypeScript compiler options.
- [core.sass](file:///Users/amrit/mandala/packages/fractals-sass/core.sass): Static color and layout classes mapping to CSS custom properties (indented with tabs).
- **`themes/`**
  - [default-dark.sass](file:///Users/amrit/mandala/packages/fractals-sass/themes/default-dark.sass): Default dark mode theme variables under `:root`.
  - [default-light.sass](file:///Users/amrit/mandala/packages/fractals-sass/themes/default-light.sass): Default light mode theme variables under `.theme-light`.
- **`src/`**
  - [index.ts](file:///Users/amrit/mandala/packages/fractals-sass/src/index.ts): Core scanner and style compiler. Matches utilities and `--pxN` custom properties, generating clean CSS or tab-indented `.sass`.
  - [vite.ts](file:///Users/amrit/mandala/packages/fractals-sass/src/vite.ts): Vite JIT plugin providing the virtual module `virtual:fractals.css` with HMR.
  - [postcss.ts](file:///Users/amrit/mandala/packages/fractals-sass/src/postcss.ts): PostCSS plugin replacing `@fractals utilities;` at compile time.
  - [bin/cli.ts](file:///Users/amrit/mandala/packages/fractals-sass/src/bin/cli.ts): CLI compiler with automatic file watcher.
- **`playground/`**
  - [package.json](file:///Users/amrit/mandala/packages/fractals-sass/playground/package.json): Dev dependencies and local `file:..` package link.
  - [vite.config.js](file:///Users/amrit/mandala/packages/fractals-sass/playground/vite.config.js): Integrates the Vite plugin.
  - [index.html](file:///Users/amrit/mandala/packages/fractals-sass/playground/index.html): Premium dark-theme play interface.
  - [main.js](file:///Users/amrit/mandala/packages/fractals-sass/playground/main.js): Sandbox HMR rendering controller.

---

## ⚙️ How it Works

### 1. JIT Compilation
The core engine parses source code for:
1. **Dynamic Classes**: Any class matching `\b(gap|cgap|rgap|pad|padtop|padbot|padleft|padright|margin|margintop|marginbot|marginleft|marginright|height|width)(\d+)(-(xs|sm|bs|lg|xl))?\b` (e.g. `gap32`, `pad20-xs`, `margintop50-lg`).
2. **Dynamic Variables**: Any inline or stylesheet variable matching `\b--px(\d+)\b` (e.g. `--px566`).

It compiles matches dynamically:
- If outputting CSS: Generates classes like `.gap24 { gap: 24px; }` and media-query wrapped blocks.
- If outputting Sass: Generates pure indented Sass blocks with single-tab (`\t`) property indents and no brackets/semicolons.
- For all matched pixel numbers, it automatically appends `--pxN: Npx` inside `:root` variables.

### 2. Decoupled CSS Theme Variables
The static color utility definitions (like `.text-primary`, `.bg-background10`, `.border-primary`) strictly reference CSS variables (`var(--text-primary)`, `var(--background10)`). This decouples them from any selectors, allowing you to define these variables under **any class selector** in your project (`:root`, `.theme-light`, `.this-theme`, etc.) and have the utilities resolve them correctly.

---

## 🚀 How to use in any project

Here are the three ways to integrate **fractals-sass** into new or existing projects:

### Method A: Standalone CLI (Works for Django, Rails, PHP, Vanilla HTML)

1. Add `fractals-sass` as a dependency or run via npm/npx.
2. Run the compiler in watch mode:
   ```bash
   npx fractals-sass -s "src/**/*.html" -o "dist/fractals.sass" -w
   ```
   *(Specifying a `.sass` extension will automatically output pure indented Sass. Specifying `.css` will output CSS).*
3. Import the output file `dist/fractals.sass` or `dist/fractals.css` in your project's main stylesheet.

### Method B: Vite Plugin

1. Install `fractals-sass` in your Vite project:
   ```json
   "dependencies": {
     "fractals-sass": "file:/Users/amrit/mandala/packages/fractals-sass"
   }
   ```
2. Configure `vite.config.js`:
   ```js
   import { defineConfig } from 'vite';
   import fractalsVitePlugin from 'fractals-sass/vite';

   export default defineConfig({
     plugins: [
       fractalsVitePlugin({
         include: ['src/**/*.html', 'src/**/*.js', 'src/**/*.tsx', 'src/**/*.vue']
       })
     ]
   });
   ```
3. Import the virtual stylesheet and core files in your project entry file (`main.js` / `main.ts`):
   ```js
   import 'fractals-sass/core.sass';
   import 'fractals-sass/themes/default-dark.sass'; // optional defaults
   import 'virtual:fractals.css';
   ```

### Method C: PostCSS Plugin (Next.js, Webpack)

1. Configure `postcss.config.js`:
   ```js
   module.exports = {
     plugins: {
       'fractals-sass/postcss': {
         include: ['src/**/*.html', 'src/**/*.js', 'src/**/*.tsx']
       },
       autoprefixer: {}
     }
   };
   ```
2. In your CSS/Sass file, inject the utilities using the `@fractals` directive:
   ```css
   @import 'fractals-sass/core.sass';
   @fractals utilities;
   ```

---

## 🔍 Verification Results

1. **Compilation Check**: `npm run build` inside `packages/fractals-sass` compiles cleanly to ES modules + `.d.ts` declaration files inside `dist/`.
2. **Playground Bundle**: `npm run build` inside `playground/` resolves local imports, compiles `.sass` files, and builds successfully in `192ms`.
3. **CLI Tests**: 
   - Compiling to `cli-output.sass` yields correct, tab-indented old Sass format with media query nesting:
     ```sass
     @media (min-width: 1025px)
     	.margin30-lg
     		margin: 30px
     ```
   - Compiling to `cli-output.css` yields valid CSS with standard rules:
     ```css
     @media (min-width: 1025px) {
       .margin30-lg { margin: 30px; }
     }
     ```
4. **Dev Server Check**: Vite server successfully starts on `http://localhost:3000/`.
