# Building a Mindmap with Sprotty - Tutorial

## Step 1: Initial Setup

This first step establishes the foundation for our Sprotty mindmap example. Let's break down what we've implemented:

### Basic Application Structure

- Added a new mindmap example to the existing Sprotty examples
- Created the directory structure under `examples/mindmap/` with the necessary files:
  - `mindmap.html` - The main HTML page
  - `css/mindmap.css` - Styling
  - `src/` directory with TypeScript implementation files

### Integration with Sprotty Framework

- Modified `examples/browser-app.ts` to include the mindmap example in the application router
- Added a link to the mindmap example in `examples/index.html`

### Core Components Implementation

#### Dependency Injection (`di.config.ts`)

- Set up the dependency injection configuration
- Configured the basic Sprotty elements (graph, node, label)
- Set up the mindmap module with client-side layout
- Imported necessary styles (including VSCode codicons)

#### Model Source (`model-source.ts`)

- Implemented a basic `MindmapModelSource` class
- Set up a simple initial model with just one node labeled "My Idea"
- Positioned the node at coordinates (300, 300)
- Used a vertical box layout ('vbox')

#### Entry Point (`standalone.ts`)

- Set up the container initialization
- Connected the model source to update the view

### UI/UX Features

- Added responsive layout using Bootstrap
- Implemented platform-specific keyboard shortcuts (Mac vs. Other)
- Added basic styling for nodes (white fill, black stroke)
- Included keyboard shortcuts for common operations:
  - Fit to screen (Cmd/Ctrl+Shift+F)
  - Center selected (Cmd/Ctrl+Shift+C)
  - Export SVG (Cmd/Ctrl+Shift+E)

### Current State

This commit represents the minimal viable setup for a Sprotty mindmap application, featuring:

- A single node in the center
- Basic styling and layout
- Platform-aware keyboard shortcuts
- Integration into the Sprotty examples framework

### Next Steps

The mindmap is currently in its most basic form - just showing a single node with "My Idea" text. In upcoming commits, we'll add:

- Adding/removing nodes
- Connecting nodes
- Editing node content
- Layout algorithms for mindmap-style arrangement
- Interaction handlers for user manipulation

## Step 2: Adding Interactive Features

In this step, we've enhanced the mindmap with interactive features, focusing on node interaction and visual feedback. Here's what we've implemented:

### Enhanced Node Styling

We've added new CSS styles to improve node interactivity:

### New Components

1. **Add Button View (`mindmap-views.tsx`)**
   - Created a new component for the add button
   - Implemented as a circular button with a plus icon
   - Positioned relative to parent node
   - Uses SVG for rendering the button and icon

2. **Enhanced Model Source**
   - Renamed `model-source.ts` to `mindmap-model-source.ts`
   - Added hover feedback handling
   - Implemented dynamic add button showing/hiding on hover
   - Extended action handling for hover feedback

### Dependency Injection Updates

Modified `di.config.ts` to support new features:

- Added button configuration with `configureModelElement`
- Disabled layout features for the add button
- Implemented basic `AddButtonHandler` structure
- Added new imports for button handling and layout features

### Technical Implementation Details

1. **Hover Feedback System**
   - Implemented `HoverFeedbackAction` handling
   - Added dynamic element management for hover states
   - Created button show/hide logic based on mouse position

2. **Button Implementation**
   - Added button type 'button:add'
   - Implemented button view with SVG graphics
   - Set up handler structure for button interactions

This step focuses on making the mindmap more interactive by adding visual feedback and the groundwork for node manipulation features.
