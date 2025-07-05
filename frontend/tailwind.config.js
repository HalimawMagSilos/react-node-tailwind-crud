// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // The 'content' array tells Tailwind CSS where to look for class names
  // It scans these files during the build process to generate only the CSS you need.
  content: [
    "./index.html",            // Your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // All JavaScript, TypeScript, JSX, and TSX files in the 'src' directory
                               // This is where your React components will be.
  ],
  theme: {
    extend: {}, // Use 'extend' to add your custom theme values (colors, fonts, etc.)
  },
  plugins: [], // Add any Tailwind CSS plugins here (e.g., @tailwindcss/forms)
}