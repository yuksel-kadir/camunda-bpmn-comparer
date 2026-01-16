# Specification: Camunda BPMN Comparer

## Overview
The Camunda BPMN Comparer is a desktop application designed to provide a high-precision, side-by-side visual comparison of BPMN 2.0 process models. It specifically targets Camunda 7 workflows, highlighting structural and attribute-level changes between two versions of a process.

## Target Environment
- **Platform**: Windows (Desktop) via Tauri.
- **Runtime**: Webview2 (Windows).
- **Primary Use Case**: Developers and Process Architects comparing local BPMN files or git-tracked versions of workflows.

## Technical Specifications
### Input Requirements
- **Format**: BPMN 2.0 XML (.bpmn, .xml).
- **Compatibility**: Optimized for Camunda 7 namespace extensions (e.g., `camunda:asyncBefore`, `camunda:class`, etc.).
- **File Access**: Local filesystem via standard file pickers.

### Core Logic
- **Comparison Engine**: Performs a deep comparison of two BPMN XML trees.
- **Identity Matching**: Elements are primarily matched by their `id`. Changes are detected based on differences in:
    - Element Type (e.g., Service Task vs. Script Task).
    - Geometric Position/Layout (DI information).
    - Attributes (Implementation, Listeners, Input/Output mappings).
- **Diff Categories**:
    - `Added`: Exists only in the modified version.
    - `Removed`: Exists only in the base version.
    - `Modified`: Exists in both but has different properties or sub-elements.
- **Session History**:
    - Persist the list of recently compared files across sessions.
    - Validate file existence upon application launch or history access.

### Performance Targets
- **Large Model Handling**: Capable of rendering and comparing models with 100+ nodes without UI freezing.
- **Synchronization**: Real-time visual synchronization between viewers during pan/zoom operations using GPU acceleration.
- **Startup Time**: Optimized Tauri bundle for fast application launch.

## Security & Privacy
- **Local-Only**: All processing happens on the user's machine. No process XML or data is sent to external servers.
- **Sandboxing**: Utilizes Tauri's security model to restrict filesystem access to user-selected files.
