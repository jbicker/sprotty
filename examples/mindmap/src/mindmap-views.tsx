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

/** @jsx svg */
import { svg } from 'sprotty/lib/lib/jsx';

import { RenderingContext, SShapeElementImpl, ShapeView } from "sprotty";
import { Hoverable } from "sprotty-protocol";
import { VNode } from 'snabbdom';

export class AddButtonView extends ShapeView {
    override render(node: Readonly<SShapeElementImpl & Hoverable>, context: RenderingContext): VNode | undefined {
        const radius = 8;
        const parentSize = (node.parent as SShapeElementImpl).size;
        return <g transform={`translate(${parentSize?.width - radius}, ${-radius})`}>
            <circle class-sprotty-button-bg={true} r={radius} cx={radius} cy={radius}></circle>
            {/* a path that creates a plus sign */}
            <path class-sprotty-icon={true} d={`M ${radius} ${radius - 4} L ${radius} ${radius + 4} M ${radius - 4} ${radius} L ${radius + 4} ${radius}`}></path>
        </g>;
    }
}
