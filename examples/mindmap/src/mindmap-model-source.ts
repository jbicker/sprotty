/********************************************************************************
 * Copyright (c) 2024 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable } from 'inversify';
import { ActionHandlerRegistry, LocalModelSource } from 'sprotty';
import {
    Action,
    HoverFeedbackAction,
    SGraph, SLabel, SModelRoot, SButton, SEdge, CreateElementAction, DeleteElementAction
} from 'sprotty-protocol';
import { MindmapNode } from './model';
import { AddNodeAction } from './actions';

@injectable()
export class MindmapModelSource extends LocalModelSource {
    constructor() {
        super();
        this.currentRoot = this.initializeModel();
    }

    override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);
        registry.register(HoverFeedbackAction.KIND, this);
        registry.register(AddNodeAction.KIND, this);
    }

    initializeModel(): SModelRoot {
        const node0: MindmapNode = {
            id: 'node0',
            type: 'node',
            position: {
                x: 300,
                y: 300
            },
            layout: 'vbox',
            children: [
                <SLabel>{
                    id: 'label0',
                    type: 'label',
                    text: 'My Idea'
                },
            ],
            successors: 0,
            predecessors: 0
        };
        const graph: SGraph = {
            id: 'graph',
            type: 'graph',
            children: [node0]
        };
        return graph;
    }

    handleHoverAction(action: HoverFeedbackAction): void {
        const element = {
            element: {
                id: action.mouseoverElement + '-add-button',
                type: 'button:add',
                pressed: false,
                enabled: true
            } as SButton,
            parentId: action.mouseoverElement
        };
        if (action.mouseIsOver) {
            this.actionDispatcher.dispatch(CreateElementAction.create(element.element, { containerId: element.parentId }));
        } else if (!action.mouseIsOver) {
            this.actionDispatcher.dispatch(DeleteElementAction.create([element.element.id]));
        };
    }

    async handleAddNodeAction(action: AddNodeAction): Promise<void> {
        const root = this.currentRoot as SGraph;
        const parentNode = root.children.find(child => child.id === action.predecessorId) as MindmapNode;
        const parentPosition = parentNode.position;
        const parentSize = parentNode.size;
        const parentSuccessorCount = parentNode.successors;
        const id = `${parentNode.id}_successor_${parentSuccessorCount}`;
        const newNode: MindmapNode = {
            id,
            type: 'node',
            position: {
                x: (parentPosition?.x ?? 0) + (parentSize?.width ?? 0) + 100,
                y: (parentPosition?.y ?? 0) + parentSuccessorCount * 100
            },
            layout: 'vbox',
            children: [
                <SLabel>{
                    id: `${id}_label`,
                    type: 'label',
                    text: 'New Idea'
                },
            ],
            successors: 0,
            predecessors: 1
        };
        const newEdge = <SEdge>{
            id: `${parentNode.id}_to_${id}`,
            type: 'edge',
            sourceId: parentNode.id,
            targetId: id,
            cssClasses: ['mindmap-edge']
        };
        parentNode.successors += 1;
        root.children.push(newNode, newEdge);
        this.setModel(root);
    }

    override handle(action: Action): void {
        super.handle(action);
        if (action.kind === HoverFeedbackAction.KIND) {
            this.handleHoverAction(action as HoverFeedbackAction);
        } else if (action.kind === AddNodeAction.KIND) {
            this.handleAddNodeAction(action as AddNodeAction);
        }
    }
}
