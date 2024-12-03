import deepmerge from 'deepmerge';
import { BaseNodeAttributes, BaseEdgeAttributes } from '../attributes';
import { TextType } from './text';

export interface GraphStyle {
  node: {
    width: number;
    height: number;
    roundingFactor: number;
    color: string;
    border: {
      width: number;
      color: string;
    };
    text: {
      content: string[];
      type: TextType;
      fontFamily: string;
      fontSize: number;
      color: string;
    };
    label: {
      content: string;
      type: TextType;
      fontFamily: string;
      fontSize: number;
      color: string;
      backgroundColor: string;
      padding: number;
    };
    circleStatus: {
      size: number;
      color: string;
      x: number;
      y: number;
    }
  };
  edge: {
    width: number;
    color: string;
  };
}

export type NodeStyle = GraphStyle['node'];
export type EdgeStyle = GraphStyle['edge'];

export type StyleDefinition<Style, Attributes> =
  ((attributes: Attributes) => Style) |
  {[Key in keyof Style]?: StyleDefinition<Style[Key], Attributes>} |
  Style;

export type NodeStyleDefinition<NodeAttributes extends BaseNodeAttributes = BaseNodeAttributes> = StyleDefinition<NodeStyle, NodeAttributes>;
export type EdgeStyleDefinition<EdgeAttributes extends BaseEdgeAttributes = BaseEdgeAttributes> = StyleDefinition<EdgeStyle, EdgeAttributes>;

export interface GraphStyleDefinition<NodeAttributes extends BaseNodeAttributes = BaseNodeAttributes, EdgeAttributes extends BaseEdgeAttributes = BaseEdgeAttributes> {
  node?: NodeStyleDefinition<NodeAttributes>;
  edge?: EdgeStyleDefinition<EdgeAttributes>;
}

export function resolveStyleDefinition<Style, Attributes>(styleDefinition: StyleDefinition<Style, Attributes>, attributes: Attributes): Style {

  if (styleDefinition instanceof Function) {
    return styleDefinition(attributes);
  }
  if (Array.isArray(styleDefinition)) {
    return (styleDefinition.map(style => resolveStyleDefinition(style, attributes))) as Style;
  }
  if (typeof styleDefinition === 'object' && styleDefinition !== null) {
    return Object.fromEntries(
      Object.entries(styleDefinition).map(([key, styleDefinition]) => {
        return [key, resolveStyleDefinition(styleDefinition, attributes)];
      })
    ) as Style;
  }
  
  return styleDefinition;
}

export function resolveStyleDefinitions<Style, Attributes>(styleDefinitions: (StyleDefinition<Style, Attributes> | undefined)[], attributes: Attributes): Style {
  const styles = styleDefinitions.filter(x => !!x).map(styleDefinition => resolveStyleDefinition(styleDefinition!, attributes));
  const style = deepmerge.all<Style>(styles);
  return style;
}