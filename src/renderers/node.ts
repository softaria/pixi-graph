import { Container } from '@pixi/display';
import { RoundedRectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { textToPixi } from '../utils/text';
import { TextureCache } from '../texture-cache';
import { CENTER_POSITION, DELIMETER, MAX_ZOOM, MAX_ZOOM_BORDER, NODE_CIRCLE_STATUS, NODE_ICON, NODE_RECTANGLE, NODE_RECTANGLE_BORDER, TEXT_DELIMETER, TOP_LEFT_CORNER_COEFFICIENT, WHITE } from '../constants/Constants';

export function createNode(nodeGfx: Container) {
  // nodeGfx
  nodeGfx.hitArea = new RoundedRectangle(0, 0);

  // nodeGfx -> nodeRectangle
  const nodeRectangle = new Sprite();
  nodeRectangle.name = NODE_RECTANGLE;
  nodeRectangle.anchor.set(CENTER_POSITION);
  nodeGfx.addChild(nodeRectangle);

  // nodeGfx -> nodeRectangleBorder
  const nodeRectangleBorder = new Sprite();
  nodeRectangleBorder.name = NODE_RECTANGLE_BORDER;
  nodeRectangleBorder.anchor.set(CENTER_POSITION);
  nodeGfx.addChild(nodeRectangleBorder);

  // nodeGfx -> nodeIcon
  const nodeIcon = new Sprite();
  nodeIcon.name = NODE_ICON;
  nodeIcon.anchor.set(CENTER_POSITION);
  nodeGfx.addChild(nodeIcon);

  // nodeGfx -> nodeCircleStatus
  const nodeCircleStatus = new Sprite();
  nodeCircleStatus.name = NODE_CIRCLE_STATUS;
  nodeCircleStatus.anchor.set(CENTER_POSITION);
  nodeGfx.addChild(nodeCircleStatus);
}

export function updateNodeStyle(nodeGfx: Container, nodeStyle: NodeStyle, textureCache: TextureCache) {
  const nodeRectangleTextureKey = [NODE_RECTANGLE, nodeStyle.width, nodeStyle.height, nodeStyle.roundingFactor].join(DELIMETER);
  const nodeRectangleTexture = textureCache.get(nodeRectangleTextureKey, () => {
    const graphics = new Graphics();
    graphics.beginFill(WHITE, 1.0, true);
    graphics.drawRoundedRect(nodeStyle.width, nodeStyle.height, nodeStyle.width, nodeStyle.height, nodeStyle.width * nodeStyle.roundingFactor);
    return graphics;
  });

  const nodeRectangleBorderTextureKey = [NODE_RECTANGLE_BORDER, nodeStyle.width, nodeStyle.height, nodeStyle.border.width, nodeStyle.roundingFactor].join(DELIMETER);
  const nodeRectangleBorderTexture = textureCache.get(nodeRectangleBorderTextureKey, () => {
    const graphics = new Graphics();
    graphics.lineStyle(nodeStyle.border.width, WHITE);
    graphics.drawRoundedRect(nodeStyle.width, nodeStyle.height, nodeStyle.width, nodeStyle.height, nodeStyle.width * nodeStyle.roundingFactor);
    return graphics;
  });

  const nodeIconTextureKey = [NODE_ICON, nodeStyle.text.fontFamily, nodeStyle.text.fontSize, ...nodeStyle.text.content].join(DELIMETER);
  const nodeIconTexture = textureCache.get(nodeIconTextureKey, () => {
    const text = textToPixi(nodeStyle.text.type, nodeStyle.text.content.join(TEXT_DELIMETER), {
      fontFamily: nodeStyle.text.fontFamily,
      fontSize: nodeStyle.text.fontSize
    });
    return text;
  });

  const nodeCircleStatusTextureKey = [NODE_CIRCLE_STATUS, nodeStyle.circleStatus.size].join(DELIMETER)
  const nodeCircleStatusTexture = textureCache.get(nodeCircleStatusTextureKey, () => {
    const graphics = new Graphics();
    graphics.beginFill(WHITE, 1.0, true);
    graphics.drawCircle(nodeStyle.circleStatus.x, nodeStyle.circleStatus.y, nodeStyle.circleStatus.size)
    return graphics;
  });

  // nodeGfx -> hitArea
  const hitArea = nodeGfx.hitArea as RoundedRectangle
  hitArea.width = nodeStyle.width;
  hitArea.height = nodeStyle.height;
  hitArea.x = TOP_LEFT_CORNER_COEFFICIENT * nodeStyle.width;
  hitArea.y = TOP_LEFT_CORNER_COEFFICIENT * nodeStyle.height;

  // nodeGfx -> nodeRectangle
  const nodeRectangle = nodeGfx.getChildByName!(NODE_RECTANGLE) as Sprite;
  nodeRectangle.texture = nodeRectangleTexture;
  [nodeRectangle.tint, nodeRectangle.alpha] = colorToPixi(nodeStyle.color);

  // nodeGfx -> nodeRectangleBorder
  const nodeRectangleBorder = nodeGfx.getChildByName!(NODE_RECTANGLE_BORDER) as Sprite;
  nodeRectangleBorder.texture = nodeRectangleBorderTexture;
  [nodeRectangleBorder.tint, nodeRectangleBorder.alpha] = colorToPixi(nodeStyle.border.color);

  // nodeGfx -> nodeIcon
  const nodeIcon = nodeGfx.getChildByName!(NODE_ICON) as Sprite;
  nodeIcon.texture = nodeIconTexture;
  [nodeIcon.tint, nodeIcon.alpha] = colorToPixi(nodeStyle.text.color);
  nodeGfx.addChild(nodeIcon);

  // nodeGfx -> nodeCircleStatus
  const nodeCircleStatus = nodeGfx.getChildByName!(NODE_CIRCLE_STATUS) as Sprite;
  nodeCircleStatus.texture = nodeCircleStatusTexture;
  [nodeCircleStatus.tint, nodeCircleStatus.alpha] = colorToPixi(nodeStyle.circleStatus.color);
  nodeCircleStatus.x = nodeStyle.circleStatus.x;
  nodeCircleStatus.y = nodeStyle.circleStatus.y;
  nodeGfx.addChild(nodeCircleStatus);
}

export function updateNodeVisibility(nodeGfx: Container, zoomStep: number) {
  // nodeGfx -> nodeRectangleBorder
  const nodeRectangleBorder = nodeGfx.getChildByName!(NODE_RECTANGLE_BORDER) as Sprite;
  nodeRectangleBorder.visible = nodeRectangleBorder.visible && zoomStep >= MAX_ZOOM_BORDER;

  // nodeGfx -> nodeIcon
  const nodeIcon = nodeGfx.getChildByName!(NODE_ICON) as Sprite;
  nodeIcon.visible = nodeIcon.visible && zoomStep >= MAX_ZOOM;

  // nodeGfx -> nodeCircleStatus
  const nodeCircleStatus = nodeGfx.getChildByName!(NODE_CIRCLE_STATUS) as Sprite;
  nodeCircleStatus.visible = nodeIcon.visible && zoomStep >= MAX_ZOOM;
}