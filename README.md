# Interactive Color Theory Explorer

An immersive React + Vite website for learning and experimenting with color theory through hands-on interactive tools.

This project is built as an educational web experience where users can:
- understand color fundamentals,
- create and inspect color palettes,
- compare additive vs subtractive mixing,
- build gradients,
- copy production-ready color values instantly.

## What This Website Includes

The app is organized into 7 interactive learning sections:

1. Color Theory 101
- Guided explanation of primary, secondary, and tertiary colors.
- Interactive wheel walkthrough for harmony concepts.
- Practical mini UI demo showing how schemes affect interfaces.

2. Color Wheel
- Interactive HSL wheel (drag/click to pick hue and saturation).
- Scroll or sliders for lightness control.
- Contrast ratio checks against white/black (AA/AAA indicators).
- Color blindness simulation previews.
- Tints/shades generation and copy-to-clipboard actions.

3. Color Schemes
- Generates schemes: complementary, analogous, triadic, split, tetradic, monochromatic.
- Interactive markers on a wheel to visualize relationships.
- Palette variations per hue and lightness.

4. RGB Mixer
- Real-time additive RGB sliders.
- Live preview, HEX/RGB/HSL readout, and complementary suggestion.
- Presets and direct HEX input.

5. Paint Mixer
- Simulates subtractive-style pigment blending.
- Supports three-color blending (A/B/C), ratio control, and blend steps.
- Switchable modes: subtractive, additive, and average mix.

6. Additive vs Subtractive Lab
- Side-by-side RGB and CMYK style controls.
- Interactive learning insights based on current values.
- Compare mode to blend output behavior and understand differences.

7. Gradient Builder
- Build linear, radial, and conic gradients.
- Add/remove/edit color stops.
- Live preview and CSS output copy.
- Canvas color picking from gradient result.

## Extra UX Features

- Sticky section navigation.
- Animated hero and atmospheric background (starfield + floating letters).
- Theme toggle: dark, light, and cream.
- Unified global color flow across modules.
- Toast feedback when values are copied.

## Tech Stack

- React 19
- Vite 7
- Plain CSS (custom properties + animations)
- Canvas API for wheel/gradient rendering
- Utility-first color math helpers in `src/utils/colorUtils.js`

Note:
- The repository also contains `HarmonyGenerator.jsx` (3D palette visualization using @react-three/fiber and three), but it is not currently mounted in `App.jsx`.

## Project Structure

```text
.
|- index.html
|- src/
|  |- App.jsx
|  |- main.jsx
|  |- index.css
|  |- components/
|  |  |- ColorTheoryGuide.jsx
|  |  |- ColorWheel.jsx
|  |  |- ColorSchemes.jsx
|  |  |- RGBModel.jsx
|  |  |- PaintMixer.jsx
|  |  |- AdditiveSubtractiveLab.jsx
|  |  |- GradientBuilder.jsx
|  |- utils/
|     |- colorUtils.js
|- package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (recommended)

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Then open the local URL shown by Vite (usually http://localhost:5173).

## Available Scripts

- `npm run dev` - start local development server.
- `npm run build` - create production build.
- `npm run preview` - preview production build locally.
- `npm run lint` - run ESLint.

## Build for Production

```bash
npm run build
npm run preview
```

## Educational Purpose

This website is designed to make color theory practical, not just theoretical. Users can test relationships, compare models, and export useful values for UI/design work directly from the interface.

## License

See `LICENSE` for license details.
