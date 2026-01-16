# Building Camunda BPMN Comparer

This guide provides instructions on how to build the Camunda BPMN Comparer from source for different operating systems.

## Prerequisites

Regardless of your operating system, you will need the following installed:

1.  **Node.js**: [Download and install Node.js](https://nodejs.org/) (LTS recommended).
2.  **Rust**: [Install Rust](https://www.rust-lang.org/tools/install) using `rustup`.

## Platform-Specific Setup

Follow the instructions for your specific operating system to install the necessary build tools.

### Windows

1.  **Visual Studio Build Tools**:
    -   Download the [Visual Studio Installer](https://visualstudio.microsoft.com/downloads/).
    -   Select the **"Desktop development with C++"** workload.
    -   Ensure "MSVC v143 - VS 2022 C++ x64/x86 build tools" and "Windows 11 SDK" (or Windows 10 SDK) are checked.
2.  **WebView2**: (Usually included with Windows 10/11) If not present, download the [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### macOS

1.  **Xcode Command Line Tools**:
    -   Open a terminal and run:
        ```bash
        xcode-select --install
        ```

### Linux

You will need to install several system dependencies. For Debian/Ubuntu-based distributions:

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

> [!NOTE]
> If you are using a different distribution, please refer to the [Tauri Linux Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites#linux) for specific package names.

---

## Build Options

Once you have the prerequisites installed, follow these steps to build the application.

### 1. Install Dependencies

In the project root directory, run:

```bash
npm install
```

### 2. Build the Application

There are several build options available via `npm` scripts defined in `package.json`.

#### Standard Production Build
This will generate installers (e.g., `.msi` for Windows, `.deb` for Linux, `.dmg` for macOS).

```bash
npm run tauri:build
```
The output can be found in `src-tauri/target/release/bundle/`.

#### Portable Versions (All Platforms)

Tauri allows generating standalone, portable versions of the application.

-   **Windows**: This script builds the application and copies the standalone executable to a `portable/` folder.
    ```bash
    npm run build:portable
    ```
    The portable executable will be located at `portable/camunda-7-flow-comparer.exe`.

-   **Linux (AppImage)**: This script generates a single `.AppImage` file that runs on most Linux distributions without installation.
    ```bash
    npm run build:portable:linux
    ```
    The output is in `src-tauri/target/release/bundle/appimage/`.

-   **macOS (.app)**: This script generates a standalone `.app` bundle (packaged in a `.dmg` for distribution).
    ```bash
    npm run build:portable:mac
    ```
    The output is in `src-tauri/target/release/bundle/dmg/`.

> [!IMPORTANT]
> To build for a specific platform, you generally need to be running that operating system (e.g., you must build the macOS version on a Mac). For automatic cross-platform builds, see the **Cloud Builds (Recommended)** section.

---

## Cloud Builds (Recommended)

If you don't have access to all operating systems, you can use **GitHub Actions** to build for Windows, macOS, and Linux automatically.

1.  Create a folder named `.github/workflows/` in the project root.
2.  Create a file named `release.yml` inside it.
3.  Add the standard [Tauri Action](https://github.com/tauri-apps/tauri-action) configuration to build and release your app.

---

## Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run tauri:dev
```

## Troubleshooting

-   **Rust Path**: Ensure that `~/.cargo/bin` (or `%USERPROFILE%\.cargo\bin` on Windows) is in your system `PATH`.
-   **Node Version**: If you encounter issues, try using the latest LTS version of Node.js.
-   **Tauri CLI**: If the `npm run tauri` commands fail, you might need to install the Tauri CLI globally: `npm install -g @tauri-apps/cli`.
