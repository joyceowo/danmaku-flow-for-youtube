export type AuthorType = 'guest' | 'member' | 'moderator' | 'owner' | 'you'
export type MessageType = 'super-chat' | 'super-sticker' | 'membership'
export type EmojiStyle = 'image' | 'text' | 'none'
export type HeightType = 'flexible' | 'fixed'
export type StackDirection = 'top_to_bottom' | 'bottom_to_top'
export type Theme = 'light' | 'dark'
export type Overflow = 'overlay' | 'hidden'
export type DisplayMode = 'video' | 'chat' | 'default' | 'custom'
export type Locale =
  | 'en'
  | 'ja'
  | 'zh_TW'
  | 'ko'
  | 'id'
  | 'vi'
  | 'th'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt_BR'
  | 'tr'
export type Styles = { [authorType in AuthorType]: Style }
export type Visibilities = { [type in AuthorType | MessageType]: boolean }

export type Template =
  | 'one-line-without-author'
  | 'one-line-with-author'
  | 'two-line'

export type Style = {
  avatar: boolean
  color: string
  template: Template
}

export type ModeSettings = {
  background: boolean
  backgroundOpacity: number
  delayTime: number
  displayTime: number
  emojiStyle: EmojiStyle
  extendedStyle: string
  heightType: HeightType
  lineHeight: number
  lines: number
  maxActiveDisplays: number
  maxDisplays: number
  maxLines: number
  maxWidth: number
  opacity: number
  outlineRatio: number
  overflow: Overflow
  stackDirection: StackDirection
}

export type ModeProfiles = Record<DisplayMode, ModeSettings>

export type Settings = {
  background: boolean
  backgroundOpacity: number
  displayMode: DisplayMode
  hideFullscreenChat: boolean
  maxActiveDisplays: number
  chatVisible: boolean
  delayTime: number
  displayTime: number
  emojiStyle: EmojiStyle
  extendedStyle: string
  heightType: HeightType
  lineHeight: number
  language: Locale
  lines: number
  maxDisplays: number
  maxLines: number
  maxWidth: number
  modeProfiles: ModeProfiles
  opacity: number
  outlineRatio: number
  overflow: Overflow
  stackDirection: StackDirection
  theme: Theme
  styles: Styles
  visibilities: Visibilities
}
