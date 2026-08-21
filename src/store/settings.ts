import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { DisplayModePreset } from '~/config/display-modes'
import {
  AuthorType,
  DisplayMode,
  EmojiStyle,
  HeightType,
  Locale,
  MessageType,
  Overflow,
  Settings,
  StackDirection,
  Style,
  Theme,
} from '~/models'

const initialState: Settings = {
  background: false,
  backgroundOpacity: 0.4,
  displayMode: 'default',
  hideFullscreenChat: true,
  maxActiveDisplays: 0,
  chatVisible: true,
  delayTime: 0,
  displayTime: 5,
  emojiStyle: 'image',
  extendedStyle: '',
  heightType: 'flexible',
  lineHeight: 64,
  language: 'en',
  lines: 20,
  maxDisplays: 0,
  maxLines: 0,
  maxWidth: 200,
  opacity: 0.75,
  outlineRatio: 0.015,
  overflow: 'overlay',
  stackDirection: 'top_to_bottom',
  theme: 'light',
  styles: {
    guest: {
      avatar: false,
      color: '#ffffff',
      template: 'one-line-without-author',
    },
    member: {
      avatar: true,
      color: '#ccffcc',
      template: 'one-line-without-author',
    },
    moderator: {
      avatar: true,
      color: '#ccccff',
      template: 'two-line',
    },
    owner: {
      avatar: true,
      color: '#ffffcc',
      template: 'two-line',
    },
    you: {
      avatar: true,
      color: '#ffcccc',
      template: 'one-line-with-author',
    },
  },
  visibilities: {
    guest: true,
    member: true,
    moderator: true,
    owner: true,
    you: true,
    'super-chat': true,
    'super-sticker': true,
    membership: true,
  },
}

let isApplyingDisplayMode = false

const setCustomDisplayMode = (settings: { displayMode: DisplayMode }) => {
  if (!isApplyingDisplayMode) settings.displayMode = 'custom'
}

@Module({ name: 'settings' })
export default class SettingsModule extends VuexModule {
  background = initialState.background
  backgroundOpacity = initialState.backgroundOpacity
  displayMode = initialState.displayMode
  hideFullscreenChat = initialState.hideFullscreenChat
  maxActiveDisplays = initialState.maxActiveDisplays
  chatVisible = true
  delayTime = initialState.delayTime
  displayTime = initialState.displayTime
  emojiStyle = initialState.emojiStyle
  extendedStyle = initialState.extendedStyle
  heightType = initialState.heightType
  lineHeight = initialState.lineHeight
  language = initialState.language
  lines = initialState.lines
  maxDisplays = initialState.maxDisplays
  maxLines = initialState.maxLines
  maxWidth = initialState.maxWidth
  opacity = initialState.opacity
  outlineRatio = initialState.outlineRatio
  overflow = initialState.overflow
  stackDirection = initialState.stackDirection
  theme = initialState.theme
  styles = initialState.styles
  visibilities = initialState.visibilities

  @Mutation
  updateStyle({
    authorType,
    ...params
  }: { authorType: AuthorType } & Partial<Style>) {
    this.styles = {
      ...this.styles,
      [authorType]: {
        ...this.styles[authorType],
        ...params,
      },
    }
  }
  @Mutation
  setVisibility({
    type,
    visibility,
  }: {
    type: AuthorType | MessageType
    visibility: boolean
  }) {
    this.visibilities[type] = visibility
  }
  @Mutation
  setBackground({ background }: { background: boolean }) {
    if (this.background === background) return
    this.background = background
    setCustomDisplayMode(this)
  }
  @Mutation
  setBackgroundOpacity({ backgroundOpacity }: { backgroundOpacity: number }) {
    if (this.backgroundOpacity === backgroundOpacity) return
    this.backgroundOpacity = backgroundOpacity
    setCustomDisplayMode(this)
  }
  @Mutation
  setDisplayMode({ displayMode }: { displayMode: DisplayMode }) {
    this.displayMode = displayMode
  }
  @Mutation
  applyDisplayMode({
    displayMode,
    ...preset
  }: { displayMode: Exclude<DisplayMode, 'custom'> } & DisplayModePreset) {
    isApplyingDisplayMode = true
    Object.assign(this, preset)
    this.displayMode = displayMode
  }
  @Mutation
  finishApplyingDisplayMode({ displayMode }: { displayMode: DisplayMode }) {
    isApplyingDisplayMode = false
    this.displayMode = displayMode
  }
  @Mutation
  setHideFullscreenChat({
    hideFullscreenChat,
  }: {
    hideFullscreenChat: boolean
  }) {
    this.hideFullscreenChat = hideFullscreenChat
  }
  @Mutation
  setMaxActiveDisplays({ maxActiveDisplays }: { maxActiveDisplays: number }) {
    if (this.maxActiveDisplays === maxActiveDisplays) return
    this.maxActiveDisplays = maxActiveDisplays
    setCustomDisplayMode(this)
  }
  @Mutation
  setChatVisible({ chatVisible }: { chatVisible: boolean }) {
    this.chatVisible = chatVisible
  }
  @Mutation
  setDelayTime({ delayTime }: { delayTime: number }) {
    if (this.delayTime === delayTime) return
    this.delayTime = delayTime
    setCustomDisplayMode(this)
  }
  @Mutation
  setDisplayTime({ displayTime }: { displayTime: number }) {
    if (this.displayTime === displayTime) return
    this.displayTime = displayTime
    setCustomDisplayMode(this)
  }
  @Mutation
  setEmojiStyle({ emojiStyle }: { emojiStyle: EmojiStyle }) {
    if (this.emojiStyle === emojiStyle) return
    this.emojiStyle = emojiStyle
    setCustomDisplayMode(this)
  }
  @Mutation
  setExtendedStyle({ extendedStyle }: { extendedStyle: string }) {
    if (this.extendedStyle === extendedStyle) return
    this.extendedStyle = extendedStyle
    setCustomDisplayMode(this)
  }
  @Mutation
  setHeightType({ heightType }: { heightType: HeightType }) {
    if (this.heightType === heightType) return
    this.heightType = heightType
    setCustomDisplayMode(this)
  }
  @Mutation
  setLineHeight({ lineHeight }: { lineHeight: number }) {
    if (this.lineHeight === lineHeight) return
    this.lineHeight = lineHeight
    setCustomDisplayMode(this)
  }
  @Mutation
  setLanguage({ language }: { language: Locale }) {
    this.language = language
  }
  @Mutation
  setLines({ lines }: { lines: number }) {
    if (this.lines === lines) return
    this.lines = lines
    setCustomDisplayMode(this)
  }
  @Mutation
  setMaxDisplays({ maxDisplays }: { maxDisplays: number }) {
    if (this.maxDisplays === maxDisplays) return
    this.maxDisplays = maxDisplays
    setCustomDisplayMode(this)
  }
  @Mutation
  setMaxLines({ maxLines }: { maxLines: number }) {
    if (this.maxLines === maxLines) return
    this.maxLines = maxLines
    setCustomDisplayMode(this)
  }
  @Mutation
  setMaxWidth({ maxWidth }: { maxWidth: number }) {
    if (this.maxWidth === maxWidth) return
    this.maxWidth = maxWidth
    setCustomDisplayMode(this)
  }
  @Mutation
  setOpacity({ opacity }: { opacity: number }) {
    if (this.opacity === opacity) return
    this.opacity = opacity
    setCustomDisplayMode(this)
  }
  @Mutation
  setOutlineRatio({ outlineRatio }: { outlineRatio: number }) {
    if (this.outlineRatio === outlineRatio) return
    this.outlineRatio = outlineRatio
    setCustomDisplayMode(this)
  }
  @Mutation
  setOverflow({ overflow }: { overflow: Overflow }) {
    if (this.overflow === overflow) return
    this.overflow = overflow
    setCustomDisplayMode(this)
  }
  @Mutation
  setStackDirection({ stackDirection }: { stackDirection: StackDirection }) {
    if (this.stackDirection === stackDirection) return
    this.stackDirection = stackDirection
    setCustomDisplayMode(this)
  }
  @Mutation
  setTheme({ theme }: { theme: Theme }) {
    this.theme = theme
  }
  @Mutation
  resetState() {
    isApplyingDisplayMode = true
    for (const [k, v] of Object.entries(initialState)) {
      ;(this as any)[k] = v // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}
