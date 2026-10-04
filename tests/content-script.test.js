const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const source = process.env.CHAT_SCRIPT_BUNDLE
  ? fs.readFileSync(path.resolve(process.env.CHAT_SCRIPT_BUNDLE), 'utf8')
  : ts.transpileModule(
      fs.readFileSync(path.join(__dirname, '../src/content-script.ts'), 'utf8'),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2019,
        },
      }
    ).outputText
const flush = () => new Promise((resolve) => setImmediate(resolve))

const createPage = async (options = {}) => {
  const listeners = new Map()
  const observers = []
  let onMessage
  let onStorageChanged
  const storageRead =
    options.storageRead ||
    Promise.resolve({
      vuex: JSON.stringify({
        settings: options.legacySettings
          ? {}
          : { hideFullscreenChat: options.hidden !== false },
      }),
    })
  let pending = []
  let mutationQueued = false
  const state = { resizes: 0, clicks: 0, mutations: 0 }
  const logs = []
  const notify = (record) => {
    pending.push(record)
    if (mutationQueued) return
    mutationQueued = true
    queueMicrotask(() => {
      const records = pending
      pending = []
      mutationQueued = false
      for (const observer of observers) {
        const filtered = records.filter((record) =>
          record.type === 'childList'
            ? observer.options.childList
            : observer.options.attributeFilter.includes(record.attributeName)
        )
        if (filtered.length) {
          state.mutations += 1
          observer.callback(filtered)
        }
      }
    })
  }

  class Element {
    constructor(tagName, id = '', className = '') {
      this.tagName = tagName
      this.id = id
      this.className = className
      this.theater = false
      this.attributes = new Map()
      const properties = new Map()
      this.style = {
        getPropertyValue: (name) => properties.get(name)?.value || '',
        getPropertyPriority: (name) => properties.get(name)?.priority || '',
        setProperty: (name, value, priority = '') => {
          const previous = properties.get(name)
          if (previous?.value === value && previous?.priority === priority)
            return
          properties.set(name, { value, priority })
          notify({ type: 'attributes', attributeName: 'style', target: this })
        },
        removeProperty: (name) => {
          if (properties.delete(name)) {
            notify({ type: 'attributes', attributeName: 'style', target: this })
          }
        },
      }
    }
    matches(selectors) {
      return selectors.split(',').some((value) => {
        const selector = value.trim()
        if (selector.startsWith('#')) return this.id === selector.slice(1)
        if (selector.startsWith('.')) {
          return selector
            .slice(1)
            .split('.')
            .every((name) => this.className.split(' ').includes(name))
        }
        return selector === `${this.tagName}[theater]`
          ? this.theater
          : selector === this.tagName
      })
    }
    querySelector() {
      return null
    }
    setAttribute(name, value) {
      this.attributes.set(name, value)
    }
    getAttribute(name) {
      return this.attributes.get(name) ?? null
    }
    hasAttribute() {
      return true
    }
  }

  const watch = new Element('ytd-watch-flexy')
  watch.theater = !!options.theater
  const player = new Element('div', '', 'html5-video-player')
  const chat = new Element('ytd-live-chat-frame')
  const panel = new Element('div', 'panels-full-bleed-container')
  if (options.originalDisplay) {
    chat.style.setProperty('display', options.originalDisplay, 'important')
  }
  const elements = options.delayed
    ? [watch, player]
    : [watch, player, chat, panel]
  const document = {
    readyState: options.readyState || 'loading',
    documentElement: new Element('html'),
    fullscreenElement: options.fullscreen ? player : null,
    addEventListener: (name, callback) => listeners.set(name, callback),
    querySelector: (selector) =>
      selector === '#show-hide-button a'
        ? {
            click: () => {
              state.clicks += 1
            },
          }
        : elements.find((el) => el.matches(selector)),
    querySelectorAll: (selector) =>
      elements.filter((el) => el.matches(selector)),
  }
  const location = {
    href: options.url || 'https://www.youtube.com/watch?v=test',
  }
  const context = {
    require: () => ({
      querySelectorAsync: async (selector) =>
        selector === 'ytd-live-chat-frame'
          ? chat
          : {
              click: () => {
                state.clicks += 1
              },
            },
    }),
    exports: {},
    console: { info: (...args) => logs.push(args) },
    document,
    location,
    Element,
    URL,
    Event,
    MutationObserver: class {
      constructor(callback) {
        this.callback = callback
      }
      observe(_target, settings) {
        this.options = settings
        observers.push(this)
      }
    },
    clearInterval: () => {},
    window: {
      dispatchEvent: () => {
        state.resizes += 1
        // Bound the simulated feedback so a broken implementation fails the
        // assertion instead of starving the test runner's event loop forever.
        if (options.resetChatOnResize && state.resizes < 20) {
          chat.style.removeProperty('display')
        }
      },
      setInterval: (callback) => {
        queueMicrotask(callback)
        return 1
      },
      setTimeout,
    },
    chrome: {
      storage: {
        local: { get: () => storageRead },
        onChanged: {
          addListener: (callback) => {
            onStorageChanged = callback
          },
        },
      },
      runtime: {
        sendMessage: async () => {
          throw new Error('Background unavailable')
        },
        onMessage: {
          addListener: (callback) => {
            onMessage = callback
          },
        },
      },
    },
  }
  vm.runInNewContext(source, context)
  const initialized =
    document.readyState === 'loading'
      ? listeners.get('DOMContentLoaded')()
      : undefined
  if (!options.storageRead) await initialized
  await flush()

  return {
    chat,
    panel,
    state,
    logs,
    elements,
    document,
    location,
    initialized,
    async storedSettings(hidden) {
      onStorageChanged(
        {
          vuex: {
            newValue: JSON.stringify({
              settings: { hideFullscreenChat: hidden },
            }),
          },
        },
        'local'
      )
      await flush()
    },
    assertHidden(expected, containers = [chat, panel]) {
      for (const container of containers) {
        assert.equal(
          container.style.getPropertyValue('display'),
          expected ? 'none' : ''
        )
        assert.equal(
          container.style.getPropertyPriority('display'),
          expected ? 'important' : ''
        )
      }
    },
    async theater(value) {
      watch.theater = value
      notify({ type: 'attributes', attributeName: 'theater', target: watch })
      await flush()
    },
    async fullscreen(value, playerClassOnly = false) {
      document.fullscreenElement = value && !playerClassOnly ? player : null
      player.className = `html5-video-player${value ? ' ytp-fullscreen' : ''}`
      notify({ type: 'attributes', attributeName: 'class', target: player })
      if (!playerClassOnly) listeners.get('fullscreenchange')()
      await flush()
    },
    async settings(hidden) {
      await new Promise((resolve) =>
        onMessage(
          {
            type: 'settings-changed',
            data: { settings: { hideFullscreenChat: hidden } },
          },
          {},
          resolve
        )
      )
      await flush()
    },
    async addChat() {
      elements.push(chat, panel)
      notify({
        type: 'childList',
        target: document.documentElement,
        addedNodes: [chat, panel],
        removedNodes: [],
      })
      await flush()
    },
    async replaceChat() {
      const replacement = new Element('ytd-live-chat-frame')
      elements.splice(elements.indexOf(chat), 1, replacement)
      notify({
        type: 'childList',
        target: document.documentElement,
        addedNodes: [replacement],
        removedNodes: [chat],
      })
      await flush()
      return replacement
    },
    async navigate(href) {
      location.href = href
      await new Promise((resolve) =>
        onMessage({ type: 'url-changed' }, {}, resolve)
      )
      await flush()
    },
  }
}

test('hides at startup in fullscreen and theater, including after DOMContentLoaded', async () => {
  for (const options of [
    { fullscreen: true },
    { theater: true },
    { fullscreen: true, readyState: 'complete' },
  ]) {
    const page = await createPage(options)
    page.assertHidden(true)
    assert.equal(page.state.clicks, 0)
  }
  const normal = await createPage()
  normal.assertHidden(false)
})

test('normal → theater → fullscreen → theater → normal restores chat', async () => {
  const page = await createPage()
  await page.theater(true)
  page.assertHidden(true)
  await page.fullscreen(true)
  page.assertHidden(true)
  await page.fullscreen(false)
  page.assertHidden(true)
  await page.theater(false)
  page.assertHidden(false)
  await page.fullscreen(true)
  page.assertHidden(true)
  await page.fullscreen(false)
  page.assertHidden(false)
})

test('recognizes YouTube fullscreen player class', async () => {
  const page = await createPage()
  await page.fullscreen(true, true)
  page.assertHidden(true)
  await page.fullscreen(false, true)
  page.assertHidden(false)
})

test('hides late chat and replacement containers in either viewing mode', async () => {
  for (const mode of ['fullscreen', 'theater']) {
    const page = await createPage({ [mode]: true, delayed: true })
    await page.addChat()
    page.assertHidden(true)
    const replacement = await page.replaceChat()
    page.assertHidden(true, [replacement, page.panel])
    page.assertHidden(false, [page.chat])
  }
})

test('reapplies overwritten styles without an observer or resize loop', async () => {
  const page = await createPage({ fullscreen: true })
  page.chat.style.removeProperty('display')
  await flush()
  page.assertHidden(true)
  const counts = { ...page.state }
  await flush()
  assert.deepEqual(page.state, counts)
  assert.ok(page.state.mutations < 10)
})

test('player toggle restores the original display value and priority', async () => {
  const page = await createPage({ theater: true, originalDisplay: 'flex' })
  page.assertHidden(true)
  await page.settings(false)
  assert.equal(page.chat.style.getPropertyValue('display'), 'flex')
  assert.equal(page.chat.style.getPropertyPriority('display'), 'important')
  page.assertHidden(false, [page.panel])
  await page.settings(true)
  page.assertHidden(true)
})

test('keeps visibility monitoring across SPA navigation', async () => {
  const page = await createPage({ theater: true })
  await page.navigate('https://www.youtube.com/')
  page.assertHidden(false)
  await page.navigate('https://www.youtube.com/watch?v=next')
  page.assertHidden(true)
  await page.theater(false)
  page.assertHidden(false)
})

test('reads true directly from storage when the background is unavailable', async () => {
  for (const mode of ['fullscreen', 'theater']) {
    const page = await createPage({ [mode]: true })
    page.assertHidden(true)
  }
})

test('respects false and reacts to persisted setting changes', async () => {
  const page = await createPage({ fullscreen: true, hidden: false })
  page.assertHidden(false)
  await page.storedSettings(true)
  page.assertHidden(true)
  await page.storedSettings(false)
  page.assertHidden(false)
})

test('uses the options default for legacy settings without the hide field', async () => {
  const page = await createPage({ theater: true, legacySettings: true })
  page.assertHidden(true)
})

test('a late initial storage read does not overwrite a newer setting', async () => {
  let resolveStorage
  const storageRead = new Promise((resolve) => {
    resolveStorage = resolve
  })
  const page = await createPage({ theater: true, storageRead })
  page.assertHidden(false)
  await page.storedSettings(false)
  resolveStorage({
    vuex: JSON.stringify({ settings: { hideFullscreenChat: true } }),
  })
  await page.initialized
  page.assertHidden(false)
})

test('does not repeat resize when the page resets chat styles on resize', async () => {
  const page = await createPage({ fullscreen: true, resetChatOnResize: true })
  page.assertHidden(true)
  assert.equal(page.state.resizes, 1)
  const counts = { ...page.state }
  await flush()
  assert.deepEqual(page.state, counts)
})

test('does not print temporary diagnostics or annotate the page', async () => {
  const page = await createPage({ theater: true })
  assert.equal(page.logs.length, 0)
  assert.equal(
    page.document.documentElement.getAttribute('data-ylcf-chat-status'),
    null
  )
  await page.theater(true)
  assert.equal(page.logs.length, 0)
})

test('hides chat on the reported /live URL in fullscreen and theater mode', async () => {
  for (const mode of ['fullscreen', 'theater']) {
    const page = await createPage({
      url: 'https://www.youtube.com/live/1MZ5Xs9XPGE',
      [mode]: true,
    })
    page.assertHidden(true)
    await page[mode](false)
    page.assertHidden(false)
  }
})

test('hides late-loading chat on a /live URL and keeps the setting toggle working', async () => {
  const page = await createPage({
    url: 'https://www.youtube.com/live/1MZ5Xs9XPGE?feature=share',
    theater: true,
    delayed: true,
  })
  await page.addChat()
  page.assertHidden(true)
  await page.settings(false)
  page.assertHidden(false)
  await page.settings(true)
  page.assertHidden(true)
})

test('supports navigation between /live and /watch and restores chat on the home page', async () => {
  const page = await createPage({ theater: true })
  await page.navigate('https://www.youtube.com/live/1MZ5Xs9XPGE/')
  page.assertHidden(true)
  await page.navigate('https://www.youtube.com/watch?v=1MZ5Xs9XPGE')
  page.assertHidden(true)
  await page.navigate('https://www.youtube.com/')
  page.assertHidden(false)
  await page.navigate('https://www.youtube.com/live/1MZ5Xs9XPGE')
  page.assertHidden(true)
})

test('does not treat non-video routes as /live video pages', async () => {
  for (const pathname of [
    '/live',
    '/live/',
    '/live/id/extra',
    '/feed/subscriptions',
  ]) {
    const page = await createPage({
      url: `https://www.youtube.com${pathname}`,
      theater: true,
    })
    page.assertHidden(false)
  }
})
