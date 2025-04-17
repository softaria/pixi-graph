import { Container } from '@pixi/display';
import { InteractionEvent } from '@pixi/interaction';
import { IPointData } from '@pixi/math';
import { TypedEmitter } from 'tiny-typed-emitter';
import { createEdge, updateEdgeStyle, updateEdgeVisibility } from './renderers/edge';
import { EdgeStyle } from './utils/style';
import { TextureCache } from './texture-cache';
import { Graphics } from '@pixi/graphics';

interface PixiEdgeEvents {
  mousemove: (event: MouseEvent) => void;
  mouseover: (event: MouseEvent) => void;
  mouseout: (event: MouseEvent) => void;
  mousedown: (event: MouseEvent) => void;
  mouseup: (event: MouseEvent) => void;
}

export class PixiEdge extends TypedEmitter<PixiEdgeEvents> {
  edgeGfx: Container;
  line: Graphics;
  edgePlaceholderGfx: Container;

  hovered: boolean = false;

  constructor() {
    super();

    this.edgeGfx = this.createEdge();
    this.edgePlaceholderGfx = new Container();
    this.line = new Graphics();
    this.edgeGfx.addChild(this.line);

    this.edgeGfx.interactive = true;
    this.edgeGfx.buttonMode = true;

    this.edgeGfx.on('mousemove', (event: InteractionEvent) =>
        this.emit('mousemove', event.data.originalEvent as MouseEvent)
    );
    this.edgeGfx.on('mouseover', (event: InteractionEvent) =>
        this.emit('mouseover', event.data.originalEvent as MouseEvent)
    );
    this.edgeGfx.on('mouseout', (event: InteractionEvent) =>
        this.emit('mouseout', event.data.originalEvent as MouseEvent)
    );
    this.edgeGfx.on('mousedown', (event: InteractionEvent) =>
        this.emit('mousedown', event.data.originalEvent as MouseEvent)
    );
    this.edgeGfx.on('mouseup', (event: InteractionEvent) =>
        this.emit('mouseup', event.data.originalEvent as MouseEvent)
    );
  }

  createEdge() {
    const edgeGfx = new Container();
    edgeGfx.interactive = true;
    edgeGfx.buttonMode = true;
    edgeGfx.on('mousemove', (event: InteractionEvent) => this.emit('mousemove', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mouseover', (event: InteractionEvent) => this.emit('mouseover', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mouseout', (event: InteractionEvent) => this.emit('mouseout', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mousedown', (event: InteractionEvent) => this.emit('mousedown', event.data.originalEvent as MouseEvent));
    edgeGfx.on('mouseup', (event: InteractionEvent) => this.emit('mouseup', event.data.originalEvent as MouseEvent));
    createEdge(edgeGfx);
    return edgeGfx;
  }

  updatePosition(
      sourceNodePosition: IPointData,
      targetNodePosition: IPointData,
      sourceNodeWidth: number,
      sourceNodeHeight: number,
      targetNodeWidth: number,
      targetNodeHeight: number
  ) {
    const dx = targetNodePosition.x - sourceNodePosition.x;
    const dy = targetNodePosition.y - sourceNodePosition.y;

    if ((Math.abs(dx) < targetNodeWidth / 2) || (Math.abs(dy) < targetNodeHeight / 2)) {
      this.draw1Line(dx, dy, sourceNodePosition, sourceNodeWidth, targetNodePosition, targetNodeHeight, sourceNodeHeight, targetNodeWidth);
    } else {
      this.draw2Lines(dx, dy, sourceNodePosition, sourceNodeWidth, targetNodePosition, targetNodeHeight, sourceNodeHeight, targetNodeWidth);
    }
  }

  private draw2Lines(dx: number, dy: number, sourceNodePosition: IPointData, sourceNodeWidth: number, targetNodePosition: IPointData, targetNodeHeight: number, sourceNodeHeight: number, targetNodeWidth: number) {
    let sourcePoint: IPointData;
    let targetPoint: IPointData;

    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    const xDirection = Math.sign(dx);
    const yDirection = Math.sign(dy);

    if (isHorizontal) {
      sourcePoint = {
        x: sourceNodePosition.x + xDirection * (sourceNodeWidth / 2),
        y: sourceNodePosition.y,
      };
      targetPoint = {
        x: targetNodePosition.x,
        y: targetNodePosition.y - yDirection * (targetNodeHeight / 2),
      };
    } else {
      sourcePoint = {
        x: sourceNodePosition.x,
        y: sourceNodePosition.y + yDirection * (sourceNodeHeight / 2),
      };
      targetPoint = {
        x: targetNodePosition.x - xDirection * (targetNodeWidth / 2),
        y: targetNodePosition.y,
      };
    }
    // breaking point
    const midPoint: IPointData = isHorizontal
        ? {x: targetPoint.x, y: sourcePoint.y} // ┌ or ┘
        : {x: sourcePoint.x, y: targetPoint.y}; // └ or ┐
    this.line.clear();
    this.line.lineStyle(2, 0x000000, 1);
    this.line.moveTo(sourcePoint.x, sourcePoint.y);
    this.line.lineTo(midPoint.x, midPoint.y);
    this.line.lineTo(targetPoint.x, targetPoint.y);
  }

  private draw1Line(dx: number, dy: number, sourceNodePosition: IPointData, sourceNodeWidth: number, targetNodePosition: IPointData, targetNodeHeight: number, sourceNodeHeight: number, targetNodeWidth: number) {
    let sourcePoint: IPointData;
    let targetPoint: IPointData;

    const isHorizontal = Math.abs(dy) < targetNodeHeight
    const xDirection = Math.sign(dx);
    const yDirection = Math.sign(dy);

    if (isHorizontal) {
      sourcePoint = {
        x: sourceNodePosition.x + xDirection * (sourceNodeWidth / 2),
        y: sourceNodePosition.y,
      };
      targetPoint = {
        x: targetNodePosition.x - xDirection * (targetNodeWidth / 2),
        y: sourceNodePosition.y,
      };
    } else {
      sourcePoint = {
        x: sourceNodePosition.x,
        y: sourceNodePosition.y + yDirection * (sourceNodeHeight / 2),
      };
      targetPoint = {
        x: sourceNodePosition.x,
        y: targetNodePosition.y - yDirection * (targetNodeHeight / 2),
      };
    }
    this.line.clear();
    this.line.lineStyle(2, 0x000000, 1);
    this.line.moveTo(sourcePoint.x, sourcePoint.y);
    this.line.lineTo(targetPoint.x, targetPoint.y);
  }

  updateStyle(edgeStyle: EdgeStyle, textureCache: TextureCache) {
    updateEdgeStyle(this.edgeGfx, edgeStyle, textureCache);
  }

  updateVisibility(zoomStep: number) {
    updateEdgeVisibility(this.edgeGfx, zoomStep);
  }
}