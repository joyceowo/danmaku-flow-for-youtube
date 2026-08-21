import { Settings } from '~/models'
import { querySelectorAsync } from '~/utils/dom-helper'

let settings: Settings
let flowMessagesEnabled = true

const sendMessage = async <T>(message: object): Promise<T | undefined> => {
  try {
    return await chrome.runtime.sendMessage(message)
  } catch (_error) {
    return undefined
  }
}

const getInitialData = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const data = await sendMessage<{ settings: Settings; enabled: boolean }>({
      type: 'content-loaded',
    })
    if (data) {
      return data
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250))
  }
}

const isVideoUrl = () => new URL(location.href).pathname === '/watch'

const waitForChatContainer = async (timeout = 15000) => {
  const existing = document.querySelector<HTMLElement>(
    '#panels-full-bleed-container'
  )
  if (existing) {
    return existing
  }

  return await new Promise<HTMLElement | null>((resolve) => {
    const expireTime = Date.now() + timeout
    const observer = new MutationObserver(() => {
      const container = document.querySelector<HTMLElement>(
        '#panels-full-bleed-container'
      )
      if (container) {
        observer.disconnect()
        resolve(container)
        return
      }
      if (Date.now() > expireTime) {
        observer.disconnect()
        resolve(null)
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    window.setTimeout(() => {
      observer.disconnect()
      resolve(
        document.querySelector<HTMLElement>('#panels-full-bleed-container')
      )
    }, timeout)
  })
}

const applyChatVisibility = async () => {
  if (!isVideoUrl() || !settings) {
    return
  }

  const chatContainer = await waitForChatContainer()
  if (!chatContainer) {
    return
  }

  if (settings.hideFullscreenChat === true && flowMessagesEnabled) {
    chatContainer.style.setProperty('display', 'none', 'important')
    return
  }

  chatContainer.style.removeProperty('display')
}

const waitCollapsed = async () => {
  const iframe = await querySelectorAsync('ytd-live-chat-frame')
  return new Promise<boolean>((resolve) => {
    const expireTime = Date.now() + 1000
    const timer = window.setInterval(async () => {
      const collapsed = iframe?.hasAttribute('collapsed') ?? false
      if (collapsed || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(collapsed)
      }
    }, 100)
  })
}

const init = async () => {
  if (!isVideoUrl()) {
    return
  }

  await applyChatVisibility()

  if (!settings.chatVisible) {
    return
  }

  const collapsed = await waitCollapsed()
  if (!collapsed) {
    return
  }

  const button = await querySelectorAsync<HTMLAnchorElement>(
    '#show-hide-button a'
  )
  button && button.click()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type, data } = message
  switch (type) {
    case 'url-changed':
      init().then(() => sendResponse())
      return true
    case 'enabled-changed':
      flowMessagesEnabled = data.enabled
      applyChatVisibility().then(() => sendResponse())
      return true
    case 'settings-changed':
      settings = data.settings
      applyChatVisibility().then(() => sendResponse())
      return true
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await getInitialData()
  if (!data) {
    return
  }

  settings = data.settings
  flowMessagesEnabled = data.enabled
  await init()
})
