import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { displayModePresets, DisplayModePreset } from '~/config/display-modes'
import {
  AuthorType,
  DisplayMode,
  EmojiStyle,
  HeightType,
  Locale,
  ModeProfiles,
  ModeSettings,
  MessageType,
  Overflow,
  Settings,
  StackDirection,
  Style,
  Theme,
} from '~/models'

const supportedLocales: Locale[] = [
  'en',
  'ja',
  'zh_TW',
  'ko',
  'id',
  'vi',
  'th',
  'es',
  'fr',
  'de',
  'pt_BR',
  'tr',
]

const localeAliases: Record<string, Locale> = {
  pt: 'pt_BR',
  zh: 'zh_TW',
  'zh-hant': 'zh_TW',
  'zh-tw': 'zh_TW',
}

export const getBrowserLocale = (languages?: readonly string[]): Locale => {
  const preferredLanguages =
    languages ??
    (typeof navigator === 'undefined'
      ? []
      : navigator.languages?.length
      ? navigator.languages
      : [navigator.language])

  for (const language of preferredLanguages) {
    const normalized = language.replace('_', '-').toLowerCase()
    const exactMatch = supportedLocales.find(
      (locale) => locale.replace('_', '-').toLowerCase() === normalized
    )
    if (exactMatch) return exactMatch

    const languageCode = normalized.split('-')[0]
    if (localeAliases[normalized] || localeAliases[languageCode]) {
      return localeAliases[normalized] ?? localeAliases[languageCode]
    }

    const languageMatch = supportedLocales.find(
      (locale) => locale.split('_')[0] === languageCode
    )
    if (languageMatch) return languageMatch
  }

  return 'en'
}

const createModeSettings = (preset: DisplayModePreset): ModeSettings => ({
  ...preset,
  extendedStyle: '',
  lineHeight: 64,
})

export const createInitialModeProfiles = (): ModeProfiles => {
  const defaultSettings = createModeSettings(displayModePresets.default)
  return {
    video: createModeSettings(displayModePresets.video),
    chat: createModeSettings(displayModePresets.chat),
    default: defaultSettings,
    custom: { ...defaultSettings },
  }
}

const initialModeProfiles = createInitialModeProfiles()
const defaultModeSettings = initialModeProfiles.default

export const modeSettingKeys: (keyof ModeSettings)[] = [
  'background',
  'backgroundOpacity',
  'delayTime',
  'displayTime',
  'emojiStyle',
  'extendedStyle',
  'heightType',
  'lineHeight',
  'lines',
  'maxActiveDisplays',
  'maxDisplays',
  'maxLines',
  'maxWidth',
  'opacity',
  'outlineRatio',
  'overflow',
  'stackDirection',
]

const initialState: Settings = {
  ...defaultModeSettings,
  displayMode: 'default',
  hideFullscreenChat: true,
  chatVisible: true,
  language: getBrowserLocale(),
  modeProfiles: initialModeProfiles,
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

const updateModeSetting = <K extends keyof ModeSettings>(
  settings: SettingsModule,
  key: K,
  value: ModeSettings[K]
) => {
  settings[key] = value as never
  settings.modeProfiles = {
    ...settings.modeProfiles,
    [settings.displayMode]: {
      ...settings.modeProfiles[settings.displayMode],
      [key]: value,
    },
  }
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
  modeProfiles = initialState.modeProfiles
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
    updateModeSetting(this, 'background', background)
  }
  @Mutation
  setBackgroundOpacity({ backgroundOpacity }: { backgroundOpacity: number }) {
    if (this.backgroundOpacity === backgroundOpacity) return
    updateModeSetting(this, 'backgroundOpacity', backgroundOpacity)
  }
  @Mutation
  setDisplayMode({ displayMode }: { displayMode: DisplayMode }) {
    this.displayMode = displayMode
  }
  @Mutation
  applyDisplayMode({ displayMode }: { displayMode: DisplayMode }) {
    Object.assign(this, this.modeProfiles[displayMode])
    this.displayMode = displayMode
  }
  @Mutation
  finishApplyingDisplayMode({ displayMode }: { displayMode: DisplayMode }) {
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
    updateModeSetting(this, 'maxActiveDisplays', maxActiveDisplays)
  }
  @Mutation
  setChatVisible({ chatVisible }: { chatVisible: boolean }) {
    this.chatVisible = chatVisible
  }
  @Mutation
  setDelayTime({ delayTime }: { delayTime: number }) {
    if (this.delayTime === delayTime) return
    updateModeSetting(this, 'delayTime', delayTime)
  }
  @Mutation
  setDisplayTime({ displayTime }: { displayTime: number }) {
    if (this.displayTime === displayTime) return
    updateModeSetting(this, 'displayTime', displayTime)
  }
  @Mutation
  setEmojiStyle({ emojiStyle }: { emojiStyle: EmojiStyle }) {
    if (this.emojiStyle === emojiStyle) return
    updateModeSetting(this, 'emojiStyle', emojiStyle)
  }
  @Mutation
  setExtendedStyle({ extendedStyle }: { extendedStyle: string }) {
    if (this.extendedStyle === extendedStyle) return
    updateModeSetting(this, 'extendedStyle', extendedStyle)
  }
  @Mutation
  setHeightType({ heightType }: { heightType: HeightType }) {
    if (this.heightType === heightType) return
    updateModeSetting(this, 'heightType', heightType)
  }
  @Mutation
  setLineHeight({ lineHeight }: { lineHeight: number }) {
    if (this.lineHeight === lineHeight) return
    updateModeSetting(this, 'lineHeight', lineHeight)
  }
  @Mutation
  setLanguage({ language }: { language: Locale }) {
    this.language = language
  }
  @Mutation
  setLines({ lines }: { lines: number }) {
    if (this.lines === lines) return
    updateModeSetting(this, 'lines', lines)
  }
  @Mutation
  setMaxDisplays({ maxDisplays }: { maxDisplays: number }) {
    if (this.maxDisplays === maxDisplays) return
    updateModeSetting(this, 'maxDisplays', maxDisplays)
  }
  @Mutation
  setMaxLines({ maxLines }: { maxLines: number }) {
    if (this.maxLines === maxLines) return
    updateModeSetting(this, 'maxLines', maxLines)
  }
  @Mutation
  setMaxWidth({ maxWidth }: { maxWidth: number }) {
    if (this.maxWidth === maxWidth) return
    updateModeSetting(this, 'maxWidth', maxWidth)
  }
  @Mutation
  setOpacity({ opacity }: { opacity: number }) {
    if (this.opacity === opacity) return
    updateModeSetting(this, 'opacity', opacity)
  }
  @Mutation
  setOutlineRatio({ outlineRatio }: { outlineRatio: number }) {
    if (this.outlineRatio === outlineRatio) return
    updateModeSetting(this, 'outlineRatio', outlineRatio)
  }
  @Mutation
  setOverflow({ overflow }: { overflow: Overflow }) {
    if (this.overflow === overflow) return
    updateModeSetting(this, 'overflow', overflow)
  }
  @Mutation
  setStackDirection({ stackDirection }: { stackDirection: StackDirection }) {
    if (this.stackDirection === stackDirection) return
    updateModeSetting(this, 'stackDirection', stackDirection)
  }
  @Mutation
  setTheme({ theme }: { theme: Theme }) {
    this.theme = theme
  }
  @Mutation
  resetState() {
    for (const [k, v] of Object.entries(initialState)) {
      ;(this as any)[k] = v // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}
