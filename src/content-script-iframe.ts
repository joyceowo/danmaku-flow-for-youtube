import chat from '~/assets/chat.svg'
import downArrow from '~/assets/down-arrow.svg'
import refresh from '~/assets/refresh.svg'
import { querySelectorAsync } from '~/utils/dom-helper'
import FlowController from '~/utils/flow-controller'
import { setLocale, t } from '~/utils/i18n'

const controller = new FlowController()
let observer: MutationObserver | undefined

const menuButtonConfigs = [
  {
    svg: downArrow,
    titleKey: 'followNewMessages',
    className: 'ylcf-follow-button',
    onclick: async () =>
      await chrome.runtime.sendMessage({ type: 'menu-button-clicked' }),
    isActive: () => controller.following,
  },
  {
    svg: refresh,
    titleKey: 'reloadFrame',
    className: 'ylcf-reload-button',
    onclick: () => window.location.reload(),
    isActive: () => false,
  },
]

const updateControlButton = () => {
  const button = parent.document.querySelector('.ylcf-control-button')
  button && button.setAttribute('data-enabled', String(controller.enabled))
}

const removeControlButton = () => {
  const button = parent.document.querySelector('.ylcf-control-button')
  button && button.remove()
}

const addControlButton = () => {
  removeControlButton()

  const controls = parent.document.querySelector(
    '.ytp-chrome-bottom .ytp-chrome-controls .ytp-right-controls'
  )
  if (!controls) {
    return
  }

  const button = document.createElement('button')
  button.classList.add('ylcf-control-button')
  button.title = t('flowMessages')
  button.setAttribute('aria-label', t('flowMessages'))
  button.onclick = async () =>
    await chrome.runtime.sendMessage({ type: 'control-button-clicked' })
  button.innerHTML = chat

  // Change SVG viewBox
  const svg = button.querySelector('svg')
  if (svg) {
    svg.setAttribute('viewBox', '-8 -8 40 40')
    svg.setAttribute('height', '100%')
    svg.setAttribute('width', '100%')
  }

  const autoplayToggle = controls.querySelector('.ytp-autonav-toggle-button')
  const autoplayContainer = autoplayToggle?.parentElement
  if (autoplayContainer?.parentElement === controls) {
    autoplayContainer.insertAdjacentElement('afterend', button)
  } else {
    controls.prepend(button)
  }

  updateControlButton()
}

const updateMenuButtons = () => {
  for (const config of menuButtonConfigs) {
    const button = document.querySelector(`.${config.className}`)
    if (!button) {
      return
    }
    if (config.isActive()) {
      button.classList.add('ylcf-active-menu-button')
    } else {
      button.classList.remove('ylcf-active-menu-button')
    }
  }
}

const addMenuButtons = () => {
  const refIconButton = document.querySelector(
    '#chat-messages > yt-live-chat-header-renderer > yt-icon-button'
  )
  if (!refIconButton) {
    return
  }

  for (const config of menuButtonConfigs) {
    const icon = document.createElement('yt-icon')
    icon.classList.add('yt-live-chat-header-renderer', 'style-scope')

    const iconButton = document.createElement('yt-icon-button')
    iconButton.id = 'overflow'
    iconButton.classList.add(
      'yt-live-chat-header-renderer',
      'style-scope',
      'ylcf-menu-button',
      config.className
    )
    iconButton.title = t(config.titleKey)
    iconButton.onclick = config.onclick
    iconButton.append(icon)

    refIconButton.parentElement?.insertBefore(iconButton, refIconButton)

    // insert svg after wrapper button appended
    icon.innerHTML = config.svg
  }

  updateMenuButtons()
}

const addVideoEventListener = () => {
  const video = parent.document.querySelector<HTMLVideoElement>(
    'ytd-watch-flexy video.html5-main-video'
  )
  if (!video) {
    return
  }

  video.addEventListener('play', () => controller.play())
  video.addEventListener('pause', () => controller.pause())
}

const observe = async () => {
  await controller.observe()

  const itemList = await querySelectorAsync('#item-list.yt-live-chat-renderer')
  if (!itemList) {
    return
  }

  observer = new MutationObserver(async () => {
    await controller.observe()
  })
  observer.observe(itemList, { childList: true })
}

const disconnect = () => {
  controller.disconnect()
  observer?.disconnect()
}

const init = async () => {
  disconnect()
  controller.clear()
  removeControlButton()

  addVideoEventListener()
  addControlButton()
  addMenuButtons()

  await observe()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type, data } = message
  switch (type) {
    case 'url-changed':
      init().then(() => sendResponse())
      return true
    case 'enabled-changed':
      controller.enabled = data.enabled
      updateControlButton()
      return sendResponse()
    case 'following-changed':
      controller.following = data.following
      updateMenuButtons()
      return sendResponse()
    case 'settings-changed':
      controller.settings = data.settings
      setLocale(data.settings.language)
      init().then(() => sendResponse())
      return true
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.runtime.sendMessage({ type: 'iframe-loaded' })

  controller.enabled = data.enabled
  controller.following = data.following
  controller.settings = data.settings
  setLocale(data.settings.language)

  await init()

  window.addEventListener('pagehide', () => {
    disconnect()
    controller.clear()
    removeControlButton()
  })
})
