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

## Step 3: Label Editing and Node Creation

In this step, we've added two major features to make our mindmap truly interactive: editable labels and the ability to create new connected nodes. Here's what we've implemented:

### Label Editing

We've made the node labels editable, allowing users to modify the content of any node in the mindmap. This includes:

- Direct text editing of node labels
- Validation of label content
- Visual feedback during editing

### Node Creation with Connections

When clicking the add button on a node, the following happens:

- A new node is created
- An edge is automatically added connecting the parent and new node
- The new node's label is immediately editable

### Technical Implementation Details

#### 1. Label Editing System

To enable label editing, we need to implement several components:

1. **Configure Edit Label Feature in `di.config.ts`**
```typescript
// Add EditLabelUI to the container
configureModelElement(context, 'edit-label', EditLabelUI, EditLabelView);

// Enable command palette and editing
bind(EditLabelKeyListener).toSelf().inSingletonScope();
bind(TYPES.ICommandPaletteActionProvider).to(EditLabelActionProvider);
```

2. **Implement Label Validation in `mindmap-model-source.ts`**

```typescript
@injectable()
export class MindmapModelSource extends LocalModelSource {
    // ... existing code ...

    handleValidateLabelEdit(action: ValidateLabelEditAction): Action[] {
        const text = action.text;
        if (text.length < 1) {
            return [
                createValidationResult(false, 'Label must not be empty')
            ];
        }
        return [
            createValidationResult(true)
        ];
    }
}
```

1. **Add Edit Label Action Handler**
```typescript
@injectable()
export class MindmapModelSource extends LocalModelSource {
    // ... existing code ...

    handleApplyLabelEdit(action: ApplyLabelEditAction): Action[] {
        const label = this.findElement(action.labelId);
        if (label instanceof SLabelImpl) {
            label.text = action.text;
            return [
                UpdateModelAction.create(this.currentRoot)
            ];
        }
        return [];
    }
}
```

#### 2. Node and Edge Creation

When a user clicks the add button, we need to:

1. **Create New Node with Unique ID**
```typescript
private createNewNode(parentId: string): SNode {
    const nodeId = `node${this.nodeCounter++}`;
    return {
        id: nodeId,
        type: 'node',
        position: this.calculateNewPosition(parentId),
        layout: 'vbox',
        children: [
            <SLabel>{
                id: `label${nodeId}`,
                type: 'label',
                text: 'New Idea'
            }
        ]
    };
}
```

2. **Create Edge Between Nodes**
```typescript
private createEdge(sourceId: string, targetId: string): SEdge {
    return {
        id: `edge${this.edgeCounter++}`,
        type: 'edge',
        sourceId: sourceId,
        targetId: targetId
    };
}
```

3. **Handle Add Button Click**
```typescript
@injectable()
export class AddButtonHandler extends AbstractUIExtension {
    handle(action: AddButtonClickAction): Action[] {
        const node = this.findElement(action.nodeId);
        if (node) {
            const newNode = this.createNewNode(node.id);
            const edge = this.createEdge(node.id, newNode.id);

            // Add new elements to the model
            this.addElements([newNode, edge]);

            // Start editing the new node's label
            return [
                EditLabelAction.create(newNode.children[0].id)
            ];
        }
        return [];
    }
}
```

The implementation follows these key principles:
- Each node has a unique ID generated incrementally
- New nodes are positioned relative to their parent
- Edges are created automatically when adding nodes
- Label editing is triggered immediately for new nodes
- All changes are validated before being applied to the model

This implementation provides a smooth user experience where:
1. Users can double-click any label to edit it
2. Clicking the add button creates a connected node
3. New nodes are immediately editable
4. Empty labels are prevented through validation

This step transforms our mindmap from a static visualization into a fully interactive diagram where users can both edit existing content and expand their ideas by adding new connected nodes.
