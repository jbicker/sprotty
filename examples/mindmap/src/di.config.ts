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
import { Container, ContainerModule, injectable } from 'inversify';
import {
    configureViewerOptions, SGraphView,
    loadDefaultModules,
    SGraphImpl, configureModelElement, SNodeImpl, RectangularNodeView, SLabelImpl, SLabelView, TYPES, SButtonImpl,
    layoutableChildFeature,
    configureButtonHandler,
    IButtonHandler} from 'sprotty';
import { MindmapModelSource } from './mindmap-model-source';
import { AddButtonView } from './mindmap-views';
import { Action } from 'sprotty-protocol';

export default (containerId: string) => {
    require('sprotty/css/sprotty.css');
    require('../css/mindmap.css');

    const mindmapModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        bind(TYPES.ModelSource).to(MindmapModelSource).inSingletonScope();

        const context = { bind, unbind, isBound, rebind };

        configureModelElement(context, 'graph', SGraphImpl, SGraphView);
        configureModelElement(context, 'node', SNodeImpl, RectangularNodeView);
        configureModelElement(context, 'label', SLabelImpl, SLabelView);
        configureModelElement(context, 'button:add', SButtonImpl, AddButtonView, {
            disable: [layoutableChildFeature]
        });

        configureButtonHandler(context, 'button:add', AddButtonHandler);

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
    buttonPressed(button: SButtonImpl): (Action | Promise<Action>)[] {
        throw new Error('Method not implemented.');
    }
}
