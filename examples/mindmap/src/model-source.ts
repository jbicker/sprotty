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
import { LocalModelSource } from 'sprotty';
import {
    SGraph, SLabel, SModelRoot, SNode
} from 'sprotty-protocol';

@injectable()
export class MindmapModelSource extends LocalModelSource {
    constructor() {
        super();
        this.currentRoot = this.initializeModel();
    }

    initializeModel(): SModelRoot {
        const node0: SNode = {
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
            ]
        };
        const graph: SGraph = {
            id: 'graph',
            type: 'graph',
            children: [node0 ]
        };
        return graph;
    }
}
