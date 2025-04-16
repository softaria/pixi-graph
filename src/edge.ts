import { Container } from '@pixi/display';
import { InteractionEvent } from '@pixi/interaction';
import { IPointData } from '@pixi/math';
import { TypedEmitter } from 'tiny-typed-emitter';
import { createEdge, updateEdgeStyle, updateEdgeVisibility } from './renderers/edge';
import { EdgeStyle } from './utils/style';
import { TextureCache } from './texture-cache';

interface PixiEdgeEvents {
  mousemove: (event: MouseEvent) => void;
  mouseover: (event: MouseEvent) => void;
  mouseout: (event: MouseEvent) => void;
  mousedown: (event: MouseEvent) => void;
  mouseup: (event: MouseEvent) => void;
}

export class PixiEdge extends TypedEmitter<PixiEdgeEvents> {
  edgeGfx: Container;
  edgePlaceholderGfx: Container;

  hovered: boolean = false;

  constructor() {
    super();

    this.edgeGfx = this.createEdge();
    this.edgePlaceholderGfx = new Container();
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

  updatePosition(sourceNodePosition: IPointData, targetNodePosition: IPointData, sourceNodeHeight: number, targetNodeHeight: number) {
    const sourcePoint = {
      x: sourceNodePosition.x,
      y: sourceNodePosition.y + sourceNodeHeight / 2,
    };
    const targetPoint = {
      x: targetNodePosition.x,
      y: targetNodePosition.y - targetNodeHeight / 2,
    };
    const edgeCenter = {
      x: (sourcePoint.x + targetPoint.x) / 2,
      y: (sourcePoint.y + targetPoint.y) / 2,
    };
    const rotation = -Math.atan2(
        targetPoint.x - sourcePoint.x,
        targetPoint.y - sourcePoint.y
    );
    const length = Math.hypot(
        targetPoint.x - sourcePoint.x,
        targetPoint.y - sourcePoint.y
    );
    this.edgeGfx.position.copyFrom(edgeCenter);
    this.edgeGfx.rotation = rotation;
    this.edgeGfx.height = length;
  }

  updateStyle(edgeStyle: EdgeStyle, textureCache: TextureCache) {
    updateEdgeStyle(this.edgeGfx, edgeStyle, textureCache);
  }

  updateVisibility(zoomStep: number) {
    updateEdgeVisibility(this.edgeGfx, zoomStep);
  }
}