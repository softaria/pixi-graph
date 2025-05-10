import {ITextStyle, Text} from '@pixi/text';
import {BitmapText} from '@pixi/text-bitmap';

export enum TextType {
  TEXT = 'TEXT',
  BITMAP_TEXT = 'BITMAP_TEXT',
  // TODO: SDF_TEXT
  // see https://github.com/PixelsCommander/pixi-sdf-text/issues/12
}

export function textToPixi(type: TextType, content: string, style: Partial<ITextStyle>) {
  let text;
  if (type === TextType.TEXT) {
    // TODO: convert to bitmap font with BitmapFont.from?
    text = new Text(content, style);
  } else if (type === TextType.BITMAP_TEXT) {
    text = new BitmapText(content, {
      fontName: Array.isArray(style.fontFamily) ? undefined : style.fontFamily,
      fontSize: Number(style.fontSize)
    });
  } else {
    throw new Error('Invalid state');
  }
  text.roundPixels = true;
  return text;
}