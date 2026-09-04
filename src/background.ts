import iconOn from '~/assets/livecanvas-icon-on.png'
import { Settings } from '~/models'
import { readyStore } from '~/store'

interface TabState {
  following: boolean
}

const initialState = { following: true }
let tabStates: { [tabId: number]: TabState } = {}
let latestSettings: Settings | undefined

const cloneSettings = (settings: Settings) => {
  return JSON.parse(JSON.stringify(settings)) as Settings
}

const getSettings = async (): Promise<Settings> => {
  if (latestSettings) {
    return cloneSettings(latestSettings)
  }

  const persistedState = await chrome.storage.local.get('vuex')
  try {
    const persistedSettings = JSON.parse(persistedState.vuex)
      .settings as Settings
    if (persistedSettings) {
      latestSettings = persistedSettings
      return cloneSettings(latestSettings)
    }
  } catch (_error) {
    // Fall back to the restored Vuex state when storage has not been initialized.
  }

  const store = await readyStore()
  const restoredSettings = store.state.settings as Settings
  latestSettings = restoredSettings
  return cloneSettings(restoredSettings)
}

const setIcon = async (tabId: number) => {
  await chrome.action.setIcon({ tabId, path: iconOn })
}

const contentLoaded = async () => {
  const settings = await getSettings()
  return { settings }
}

const iframeLoaded = async (tabId: number) => {
  const following = initialState.following
  tabStates = { ...tabStates, [tabId]: { following } }

  await setIcon(tabId)

  const settings = await getSettings()

  return { following, settings }
}

const toggleChatVisibility = async () => {
  const settings = await getSettings()
  await settingsChanged({
    ...settings,
    hideFullscreenChat: !settings.hideFullscreenChat,
  })
}

const toggleFollowing = async (tabId: number) => {
  const following = !(tabStates[tabId] && tabStates[tabId].following)
  initialState.following = following
  tabStates = {
    ...tabStates,
    [tabId]: { ...(tabStates[tabId] ?? {}), following },
  }

  await setIcon(tabId)

  await chrome.tabs.sendMessage(tabId, {
    type: 'following-changed',
    data: { following },
  })
}

const settingsChanged = async (settings?: unknown) => {
  const currentSettings = (settings || (await getSettings())) as Settings
  latestSettings = currentSettings
  await chrome.storage.local.set({
    vuex: JSON.stringify({ settings: currentSettings }),
  })
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    try {
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'settings-changed',
          data: { settings: currentSettings },
        })
      }
    } catch (e) {} // eslint-disable-line no-empty
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.url) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'url-changed' })
    } catch (e) {} // eslint-disable-line no-empty
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type } = message
  const { tab } = sender
  switch (type) {
    case 'content-loaded':
      contentLoaded().then((data) => sendResponse(data))
      return true
    case 'iframe-loaded':
      if (tab?.id) {
        iframeLoaded(tab.id).then((data) => sendResponse(data))
        return true
      }
      return
    case 'chat-visibility-button-clicked':
      if (tab?.id) {
        toggleChatVisibility().then(() => sendResponse())
        return true
      }
      return
    case 'menu-button-clicked':
      if (tab?.id) {
        toggleFollowing(tab.id).then(() => sendResponse())
        return true
      }
      return
    case 'settings-changed':
      settingsChanged(message.data?.settings).then(() => sendResponse())
      return true
  }
})
