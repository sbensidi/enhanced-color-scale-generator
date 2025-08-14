
![Uploading Color Scale Generator - Large.gif…]()

# 🎨 Color Scale Generator

Generate beautiful, accessible color palettes for modern design systems with WCAG AA compliance validation, dark mode variants, and multiple export formats.

## ✨ Features

- **Complete Color Scale Generation** - Create 7-level color scales (100-700) from a single base color
- **WCAG AA Compliance** - Automatic accessibility validation with contrast ratio checking
- **Accessible Alternatives** - Generate accessible color variants when needed
- **Dark Mode Support** - Intelligent dark mode scale generation
- **Real-time Color Naming** - Color names via color.pizza API
- **Multiple Export Formats** - CSS Variables, SCSS, Tailwind, JSON, and JavaScript
- **Responsive Design** - Works beautifully on desktop and mobile
- **Keyboard Shortcuts** - Full keyboard navigation support

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Enter a HEX color code (e.g., `#3791c6`) or use the color picker
3. Choose your preferred scale configuration
4. Click "Generate Scale" or press `Ctrl/Cmd + Enter`
5. Copy individual colors by clicking on them
6. Export your color scale in your preferred format

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Generate color scale
- `Ctrl/Cmd + D` - Toggle dark mode
- `Ctrl/Cmd + C` - Copy export code (when focused on export area)
- `Ctrl/Cmd + /` - Show keyboard shortcuts help
- `Escape` - Close dialogs
- `Tab` - Navigate between elements

## 🎨 Scale Configurations

- **Minimal (2 levels)** - 400, 700
- **Simple (3 levels)** - 300, 400, 600  
- **Standard (5 levels)** - 100, 300, 500, 700, 900
- **Current (7 levels)** - 100, 200, 300, 400, 500, 600, 700 (default)
- **Extended (9 levels)** - 50, 100, 200, 300, 400, 500, 600, 700, 800

## 📊 Export Formats

- **CSS Variables** - `:root { --primary-500: #3791c6; }`
- **SCSS Variables** - `$primary-500: #3791c6;`
- **Tailwind Config** - Ready-to-use Tailwind CSS configuration
- **JSON** - Structured data with hex, rgb, and hsl values
- **JavaScript Object** - Ready-to-import JS object

## 🏗️ Technical Architecture

### Core Modules

- **color-utils.js** - Color format conversions (HEX ↔ RGB ↔ HSL)
- **scale-generator.js** - Piecewise linear interpolation algorithms
- **accessibility.js** - WCAG compliance validation and contrast calculations
- **dark-mode-generator.js** - Intelligent dark mode color mapping
- **color-names-api.js** - Color naming with caching and fallbacks
- **ui-controller.js** - DOM manipulation and application state
- **main.js** - Application initialization and coordination

### Algorithm Details

The generator uses sophisticated **piecewise linear interpolation** with:

- **Dynamic boundaries** calculated from base color characteristics
- **Special handling** for neutral colors (saturation < 10%)
- **Level-specific adjustments** for optimal visual progression
- **Accessibility-first approach** with automatic alternative generation

## 🎯 Accessibility Features

- **WCAG AA Compliance** - 4.5:1 contrast ratio for normal text, 3:1 for large text
- **Screen Reader Support** - Full ARIA labeling and live regions
- **Keyboard Navigation** - Complete keyboard accessibility
- **High Contrast Mode** - Automatic detection and adaptation
- **Reduced Motion** - Respects user motion preferences
- **Skip Links** - Quick navigation for screen readers

## 🌐 Browser Support

- **Modern Browsers** - Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Mobile Browsers** - iOS Safari 12+, Chrome Mobile 70+
- **Required Features** - ES6, Fetch API, CSS Custom Properties

## 📱 Mobile Features

- **Touch-friendly Interface** - Optimized for mobile interaction
- **Responsive Design** - Adaptive layout for all screen sizes
- **Gesture Support** - Swipe gestures for navigation
- **Mobile Action Sheets** - Native-like mobile dialogs

## 🔧 Development

The project is built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance. No build tools required - just open `index.html` in a browser.

### File Structure
```
color-scale-generator/
├── index.html              # Main application
├── css/
│   ├── styles.css          # Core styles
│   ├── light-theme.css     # Light theme variables
│   └── dark-theme.css      # Dark theme variables
├── js/
│   ├── main.js             # Application entry point
│   ├── ui-controller.js    # UI management
│   ├── color-utils.js      # Color utilities
│   ├── scale-generator.js  # Core algorithms
│   ├── accessibility.js    # WCAG compliance
│   ├── dark-mode-generator.js # Dark mode logic
│   └── color-names-api.js  # Color naming API
└── assets/
    └── icons/              # Icon resources
```

## 🚀 Performance

- **Fast Generation** - Color scales generated in <100ms
- **Efficient Caching** - API responses cached for 24 hours
- **Optimized Rendering** - Minimal DOM updates and smooth animations
- **Memory Management** - Automatic cleanup and optimization

## 🎨 Design Philosophy

- **Modern Minimalism** - Clean, focused interface
- **Progressive Disclosure** - Advanced features accessible but not intrusive
- **Visual Feedback** - Smooth animations and micro-interactions
- **Mobile-First** - Designed for touch and responsive layouts

## 📄 License

MIT License - Feel free to use in personal and commercial projects.

## 🤝 Contributing

This is a learning project built with Claude Code. Suggestions and improvements are welcome!

---

Built with ❤️ for designers and developers • WCAG AA Compliant
