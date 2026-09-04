import { Settings } from '~/models'
import { querySelectorAsync } from '~/utils/dom-helper'

let settings: Settings

const sendMessage = async <T>(message: object): Promise<T | undefined> => {
  try {
    return await chrome.runtime.sendMessage(message)
  } catch (_error) {
    return undefined
  }
}

const getInitialData = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const data = await sendMessage<{ settings: Settings }>({
      type: 'content-loaded',
    })
    if (data) {
      return data
    }
    await new Promise((resolve) => window.setTimeout(resolve, 250))
  }
}

const isVideoUrl = () => new URL(location.href).pathname === '/watch'

const chatContainerSelector =
  '#panels-full-bleed-container, ytd-live-chat-frame'

const getChatContainers = () =>
  Array.from(document.querySelectorAll<HTMLElement>(chatContainerSelector))

const waitForChatContainers = async (timeout = 15000) => {
  const existing = getChatContainers()
  if (existing.length > 0) {
    return existing
  }

  return await new Promise<HTMLElement[]>((resolve) => {
    const expireTime = Date.now() + timeout
    const observer = new MutationObserver(() => {
      const containers = getChatContainers()
      if (containers.length > 0) {
        observer.disconnect()
        resolve(containers)
        return
      }
      if (Date.now() > expireTime) {
        observer.disconnect()
        resolve([])
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    window.setTimeout(() => {
      observer.disconnect()
      resolve(getChatContainers())
    }, timeout)
  })
}

const applyChatVisibility = async () => {
  if (!isVideoUrl() || !settings) {
    return
  }

  const chatContainers = await waitForChatContainers()
  if (chatContainers.length === 0) {
    return
  }

  if (settings.hideFullscreenChat && document.fullscreenElement) {
    chatContainers.forEach((container) => {
      container.style.setProperty('display', 'none', 'important')
    })
    window.dispatchEvent(new Event('resize'))
    return
  }

  chatContainers.forEach((container) => {
    container.style.removeProperty('display')
  })
  window.dispatchEvent(new Event('resize'))
}

const showChatVisibility = async () => {
  if (!isVideoUrl()) {
    return
  }

  const chatContainers = await waitForChatContainers()
  chatContainers.forEach((container) => {
    container.style.removeProperty('display')
  })
  window.dispatchEvent(new Event('resize'))
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
  if (!isVideoUrl() || !settings) {
    return
  }

  await applyChatVisibility()

  if (settings.hideFullscreenChat && document.fullscreenElement) {
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
  await init()

  document.addEventListener('fullscreenchange', () => {
    if (!settings) {
      return
    }

    if (!document.fullscreenElement && settings.hideFullscreenChat) {
      void showChatVisibility()
      return
    }
    void applyChatVisibility()
  })
})
