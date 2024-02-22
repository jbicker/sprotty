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
import '@vscode/codicons/dist/codicon.css';
import { Container, ContainerModule, inject, injectable } from 'inversify';
import {
    configureViewerOptions, SGraphView,
    loadDefaultModules,
    SGraphImpl, configureModelElement, RectangularNodeView, SLabelImpl, SLabelView, TYPES, SButtonImpl,
    layoutableChildFeature,
    configureButtonHandler,
    IButtonHandler,
    editLabelFeature,
    configureCommand,
    CreateElementCommand,
    SEdgeImpl,
    PolylineEdgeView,
    DeleteElementCommand,
    deletableFeature
} from 'sprotty';
import { MindmapModelSource } from './mindmap-model-source';
import { AddButtonView } from './mindmap-views';
import { Action } from 'sprotty-protocol';
import { MindmapNodeImpl } from './model';
import { AddNodeAction } from './actions';

export default (containerId: string) => {
    require('sprotty/css/sprotty.css');
    require('../css/mindmap.css');

    const mindmapModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        bind(TYPES.ModelSource).to(MindmapModelSource).inSingletonScope();

        const context = { bind, unbind, isBound, rebind };

        configureModelElement(context, 'graph', SGraphImpl, SGraphView);
        configureModelElement(context, 'node', MindmapNodeImpl, RectangularNodeView);
        configureModelElement(context, 'edge', SEdgeImpl, PolylineEdgeView);
        configureModelElement(context, 'label', SLabelImpl, SLabelView, {
            enable: [editLabelFeature]
        });
        configureModelElement(context, 'button:add', SButtonImpl, AddButtonView, {
            disable: [layoutableChildFeature], enable: [deletableFeature]
        });

        configureButtonHandler(context, 'button:add', AddButtonHandler);

        configureCommand(context, CreateElementCommand);
        configureCommand(context, DeleteElementCommand);

        configureViewerOptions(context, {
            needsClientLayout: true,
            baseDiv: containerId
        });
    });

    const container = new Container();
    loadDefaultModules(container);
    container.load(mindmapModule);
    return container;
};

@injectable()
class AddButtonHandler implements IButtonHandler {
    @inject(TYPES.ModelSource) protected modelSource: MindmapModelSource;

    buttonPressed(button: SButtonImpl): (Action | Promise<Action>)[] {
        const createAction =  AddNodeAction.create({predecessorId: button.parent.id});
        return [createAction];
    }
}
