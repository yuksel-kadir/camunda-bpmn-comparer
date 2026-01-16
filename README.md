<div align="center">

</div>

# Camunda BPMN Comparer

A professional, high-performance desktop application for comparing Camunda 7 BPMN process models. Built for process architects and developers who need precision in tracking workflow changes.

> :warning: **Warning:** This project is written completely by Gemini 3 Flash, Gemini 3 Pro and Claude Opus 4.5 models.

## Key Features
- **Visual Side-by-Side Comparison**: Easily spot structural changes between two BPMN files.
- **Ultra-Smooth Synchronization**: Mirror-smooth panning and zooming across both views (60fps).
- **History & File Management**: Track recent comparisons and detect missing files instantly.
- **Portable & Native**: Run without installation on Windows, Linux, and macOS.
- **Detailed Diff Analysis**: Inspect property changes with Camunda-specific context (Listeners, I/O).

## Technical Documentation
For deeper insights into the application, refer to the following:
- [Specification](project-docs/specification.md)
- [Features List](project-docs/features.md)
- [Architecture Overview](project-docs/architecture.md)
- [Design Rules](project-docs/design-rules.md)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/) (for building the Tauri application)

### Run Locally
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run in Development Mode**:
   ```bash
   npm run tauri dev
   ```

### Building for Production
To create a native installer for your OS:
```bash
npm run tauri build
```

---
*Note: This application is optimized for Camunda 7 BPMN extensions.*
