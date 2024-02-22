/********************************************************************************
 * Copyright (c) 2017-2023 TypeFox and others.
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

import { injectable, inject } from 'inversify';
import { GetViewportAction, ResponseAction, SetViewportAction, TriggerResizeAction, ViewportResult } from 'sprotty-protocol/lib/actions';
import { Viewport } from 'sprotty-protocol/lib/model';
import { Point } from 'sprotty-protocol/lib/utils/geometry';
import { SModelElementImpl, SModelRootImpl } from '../../base/model/smodel';
import { MergeableCommand, ICommand, CommandExecutionContext, CommandReturn, Command } from '../../base/commands/command';
import { Animation } from '../../base/animations/animation';
import { isViewport, limitViewport } from './model';
import { TYPES } from '../../base/types';
import { ModelRequestCommand } from '../../base/commands/request-command';
import { ViewerOptions } from '../../base/views/viewer-options';
import { InitializeCanvasBoundsAction } from '../../base/features/initialize-canvas';
import { IActionDispatcher } from '../../base/actions/action-dispatcher';
import { getWindowScroll } from '../../utils/browser';

@injectable()
export class SetViewportCommand extends MergeableCommand {
    static readonly KIND = SetViewportAction.KIND;

    @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions;
    protected element: SModelElementImpl & Viewport;
    protected oldViewport: Viewport;
    protected newViewport: Viewport;

    constructor(@inject(TYPES.Action) protected readonly action: SetViewportAction) {
        super();
        this.newViewport = action.newViewport;
    }

    execute(context: CommandExecutionContext): CommandReturn {
        const model = context.root;
        const element = model.index.getById(this.action.elementId);
        if (element && isViewport(element)) {
            this.element = element;
            this.oldViewport = {
                scroll: this.element.scroll,
                zoom: this.element.zoom,
            };
            const { zoomLimits, horizontalScrollLimits, verticalScrollLimits } = this.viewerOptions;
            this.newViewport = limitViewport(this.newViewport, model.canvasBounds, horizontalScrollLimits, verticalScrollLimits, zoomLimits);
            return this.setViewport(element, this.oldViewport, this.newViewport, context);
        }
        return context.root;
    }

    protected setViewport(element: SModelElementImpl, oldViewport: Viewport, newViewport: Viewport, context: CommandExecutionContext): CommandReturn {
        if (element && isViewport(element)) {
            if (this.action.animate) {
                return new ViewportAnimation(element, oldViewport, newViewport, context).start();
            } else {
                element.scroll = newViewport.scroll;
                element.zoom = newViewport.zoom;
            }
        }
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        return this.setViewport(this.element, this.newViewport, this.oldViewport, context);
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return this.setViewport(this.element, this.oldViewport, this.newViewport, context);
    }

    override merge(command: ICommand, context: CommandExecutionContext): boolean {
        if (!this.action.animate && command instanceof SetViewportCommand && this.element === command.element) {
            this.newViewport = command.newViewport;
            return true;
        }
        return false;
    }
}

export class GetViewportCommand extends ModelRequestCommand {
    static readonly KIND = GetViewportAction.KIND;

    constructor(@inject(TYPES.Action) protected readonly action: GetViewportAction) {
        super();
    }

    protected retrieveResult(context: CommandExecutionContext): ResponseAction {
        const elem = context.root;
        let viewport: Viewport;
        if (isViewport(elem)) {
            viewport = { scroll: elem.scroll, zoom: elem.zoom };
        } else {
            viewport = { scroll: Point.ORIGIN, zoom: 1 };
        }
        return ViewportResult.create(viewport, elem.canvasBounds, this.action.requestId);
    }
}

/**
 * Command for triggering resize handling without window.resize event.
*/
@injectable()
export class TriggerResizeHandlingCommand extends Command {
    static readonly KIND = 'resize';

    @inject(TYPES.IActionDispatcher) protected actionDispatcher: IActionDispatcher;
    @inject(TYPES.ViewerOptions) protected options: ViewerOptions;

    constructor(@inject(TYPES.Action) protected readonly action: TriggerResizeAction) {
        super();
    }

    protected getBoundsInPage(element: Element) {
        const bounds = element.getBoundingClientRect();
        const scroll = getWindowScroll();
        return {
            x: bounds.left + scroll.x,
            y: bounds.top + scroll.y,
            width: bounds.width,
            height: bounds.height
        };
    }


    execute(context: CommandExecutionContext): CommandReturn {
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv !== null) {
            const newBounds = this.getBoundsInPage(baseDiv as Element);
            this.actionDispatcher.dispatch(InitializeCanvasBoundsAction.create(newBounds));
        }
        return { model: context.root, modelChanged: false };
    }

    undo(context: CommandExecutionContext): CommandReturn {
        return { model: context.root, modelChanged: false };
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return { model: context.root, modelChanged: false };
    }



}

export class ViewportAnimation extends Animation {

    protected zoomFactor: number;

    constructor(protected element: SModelElementImpl & Viewport,
                protected oldViewport: Viewport,
                protected newViewport: Viewport,
                protected override context: CommandExecutionContext) {
        super(context);
        this.zoomFactor = Math.log(newViewport.zoom / oldViewport.zoom);
    }

    tween(t: number, context: CommandExecutionContext): SModelRootImpl {
        this.element.scroll = {
            x: (1 - t) * this.oldViewport.scroll.x + t * this.newViewport.scroll.x,
            y: (1 - t) * this.oldViewport.scroll.y + t * this.newViewport.scroll.y
        };
        this.element.zoom = this.oldViewport.zoom * Math.exp(t * this.zoomFactor);
        return context.root;
    }
}
