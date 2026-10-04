import { querySelectorAsync } from '~/utils/dom-helper'

let hideFullscreenChat: boolean | undefined
let settingsRevision = 0
let previousVisibility: boolean | undefined
let resizePending = false

const getHideChatSetting = (settings?: { hideFullscreenChat?: unknown }) =>
  typeof settings?.hideFullscreenChat === 'boolean'
    ? settings.hideFullscreenChat
    : true

const getStoredHideChatSetting = (value?: string) => {
  if (!value) {
    return true
  }
  return getHideChatSetting(JSON.parse(value).settings)
}

const isVideoUrl = () => {
  const pathname = new URL(location.href).pathname
  return pathname === '/watch' || /^\/live\/[^/]+\/?$/.test(pathname)
}

const isWidePlayerMode = () =>
  Boolean(
    document.fullscreenElement ||
      document.querySelector(
        'ytd-watch-flexy[theater], .html5-video-player.ytp-fullscreen'
      )
  )

const chatContainerSelector =
  '#panels-full-bleed-container, ytd-live-chat-frame'

const getChatContainers = () =>
  Array.from(document.querySelectorAll<HTMLElement>(chatContainerSelector))

const hiddenChatContainers = new Map<
  HTMLElement,
  { display: string; priority: string }
>()

const shouldHideChat = () =>
  isVideoUrl() && hideFullscreenChat === true && isWidePlayerMode()

const applyChatVisibility = () => {
  if (hideFullscreenChat === undefined) {
    return
  }

  const chatContainers = getChatContainers()
  const hidden = shouldHideChat()
  let changed = false
  if (hidden !== previousVisibility) {
    previousVisibility = hidden
    resizePending = true
  }

  for (const [container, original] of hiddenChatContainers) {
    if (!hidden || !chatContainers.includes(container)) {
      if (original.display) {
        container.style.setProperty(
          'display',
          original.display,
          original.priority
        )
      } else {
        container.style.removeProperty('display')
      }
      hiddenChatContainers.delete(container)
      changed = true
    }
  }

  if (hidden) {
    for (const container of chatContainers) {
      if (!hiddenChatContainers.has(container)) {
        hiddenChatContainers.set(container, {
          display: container.style.getPropertyValue('display'),
          priority: container.style.getPropertyPriority('display'),
        })
      }
      // YouTube can replace the inline style while moving or rebuilding chat.
      if (
        container.style.getPropertyValue('display') !== 'none' ||
        container.style.getPropertyPriority('display') !== 'important'
      ) {
        container.style.setProperty('display', 'none', 'important')
        changed = true
      }
    }
  }

  // Resize once per visibility transition. Reapplying a style after YouTube
  // resets it must not fire resize again and create an observer feedback loop.
  if (changed && resizePending) {
    resizePending = false
    window.dispatchEvent(new Event('resize'))
  }
}

const observeChatVisibility = () => {
  const relevantSelector = `${chatContainerSelector}, ytd-watch-flexy, .html5-video-player`
  const containsRelevantElement = (node: Node) =>
    node instanceof Element &&
    (node.matches(relevantSelector) || node.querySelector(relevantSelector))

  const observer = new MutationObserver((mutations) => {
    const relevant = mutations.some((mutation) => {
      if (mutation.type === 'childList') {
        return [...mutation.addedNodes, ...mutation.removedNodes].some(
          containsRelevantElement
        )
      }
      const target = mutation.target as Element
      if (mutation.attributeName === 'style') {
        return target.matches(chatContainerSelector)
      }
      return target.matches('ytd-watch-flexy, .html5-video-player')
    })
    if (relevant) {
      applyChatVisibility()
    }
  })
  observer.observe(document.documentElement, {
    childList: true,
    attributes: true,
    attributeFilter: ['theater', 'class', 'style'],
    subtree: true,
  })
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
  applyChatVisibility()

  if (!isVideoUrl() || hideFullscreenChat === undefined) {
    return
  }

  if (shouldHideChat()) {
    return
  }

  const collapsed = await waitCollapsed()
  if (!collapsed || shouldHideChat() || !isVideoUrl()) {
    return
  }

  const button = await querySelectorAsync<HTMLAnchorElement>(
    '#show-hide-button a'
  )
  if (button && !shouldHideChat() && isVideoUrl()) {
    button.click()
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type, data } = message
  switch (type) {
    case 'url-changed':
      init().then(() => sendResponse())
      return true
    case 'settings-changed':
      settingsRevision += 1
      hideFullscreenChat = getHideChatSetting(data.settings)
      applyChatVisibility()
      return sendResponse()
  }
})

const start = async () => {
  document.addEventListener('fullscreenchange', applyChatVisibility)
  observeChatVisibility()

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.vuex) {
      return
    }
    settingsRevision += 1
    try {
      hideFullscreenChat = getStoredHideChatSetting(changes.vuex.newValue)
    } catch (_error) {
      // Keep the current setting if the stored value cannot be parsed.
    }
    applyChatVisibility()
  })

  const revision = settingsRevision
  try {
    // Read the same persisted setting as the options UI. Chat visibility must
    // not depend on the service worker responding to an initialization message.
    const stored = await chrome.storage.local.get('vuex')
    if (revision === settingsRevision) {
      hideFullscreenChat = getStoredHideChatSetting(stored.vuex)
    }
  } catch (_error) {
    // Keep any setting already received from a runtime or storage update.
  }

  await init()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true })
} else {
  void start()
}
