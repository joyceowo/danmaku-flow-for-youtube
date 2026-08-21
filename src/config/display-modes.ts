import {
  DisplayMode,
  EmojiStyle,
  HeightType,
  Overflow,
  Settings,
  StackDirection,
} from '~/models'

export type PresetDisplayMode = Exclude<DisplayMode, 'custom'>

export type DisplayModePreset = Pick<
  Settings,
  | 'background'
  | 'backgroundOpacity'
  | 'delayTime'
  | 'displayTime'
  | 'emojiStyle'
  | 'heightType'
  | 'lines'
  | 'maxActiveDisplays'
  | 'maxDisplays'
  | 'maxLines'
  | 'maxWidth'
  | 'opacity'
  | 'outlineRatio'
  | 'overflow'
  | 'stackDirection'
>

export const displayModePresets: Record<PresetDisplayMode, DisplayModePreset> =
  {
    video: {
      background: false,
      backgroundOpacity: 0.4,
      displayTime: 5,
      delayTime: 0,
      emojiStyle: 'image' as EmojiStyle,
      heightType: 'flexible' as HeightType,
      lines: 20,
      maxActiveDisplays: 5,
      maxDisplays: 0,
      maxLines: 3,
      maxWidth: 200,
      opacity: 0.85,
      outlineRatio: 0.015,
      overflow: 'overlay' as Overflow,
      stackDirection: 'top_to_bottom' as StackDirection,
    },
    chat: {
      background: false,
      backgroundOpacity: 0.4,
      displayTime: 6,
      delayTime: 0,
      emojiStyle: 'image' as EmojiStyle,
      heightType: 'flexible' as HeightType,
      lines: 20,
      maxActiveDisplays: 14,
      maxDisplays: 0,
      maxLines: 0,
      maxWidth: 200,
      opacity: 0.8,
      outlineRatio: 0.015,
      overflow: 'overlay' as Overflow,
      stackDirection: 'top_to_bottom' as StackDirection,
    },
    default: {
      background: false,
      backgroundOpacity: 0.4,
      displayTime: 5,
      delayTime: 0,
      emojiStyle: 'image' as EmojiStyle,
      heightType: 'flexible' as HeightType,
      lines: 20,
      maxActiveDisplays: 0,
      maxDisplays: 0,
      maxLines: 0,
      maxWidth: 200,
      opacity: 0.75,
      outlineRatio: 0.015,
      overflow: 'overlay' as Overflow,
      stackDirection: 'top_to_bottom' as StackDirection,
    },
  }
