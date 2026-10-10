const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const { parseComponent } = require('vue-template-compiler')

const component = parseComponent(
  fs.readFileSync(path.join(__dirname, '../src/components/App.vue'), 'utf8')
)
const source = ts.transpileModule(component.scriptSetup.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2019,
  },
}).outputText
const now = 1800000000000
const lifetime = 24 * 60 * 60 * 1000
const clone = (value) => JSON.parse(JSON.stringify(value))

const openPopup = async (initialStorage = {}, pathname = '/popup.html') => {
  const storage = clone(initialStorage)
  const writes = []
  let mounted
  const context = {
    exports: {},
    module: { exports: {} },
    Date: class extends Date {
      static now() {
        return now
      }
    },
    location: { pathname },
    chrome: {
      storage: {
        local: {
          get: async () => clone(storage),
          set: async (value) => {
            writes.push(clone(value))
            Object.assign(storage, clone(value))
          },
        },
      },
    },
    require: (id) => {
      if (id === 'vue') {
        return {
          computed: (get) => ({
            get value() {
              return get()
            },
          }),
          nextTick: async () => {},
          onMounted: (callback) => {
            mounted = callback
          },
          ref: (value) => ({ value }),
          watch: () => {},
        }
      }
      if (id === '~/store') return { settingsStore: { language: 'en' } }
      if (id === '~/utils/i18n') return { setLocale: () => {} }
      return {}
    },
  }
  vm.runInNewContext(
    source +
      '\nmodule.exports = { releaseNoticeVisible, dismissReleaseNotice }',
    context
  )
  await mounted()
  return { ...context.module.exports, storage, writes }
}

test('shows v0.1.7 to users who dismissed or expired v0.1.6', async () => {
  for (const dismissed of [true, false]) {
    const popup = await openPopup({
      releaseNotice: {
        version: '0.1.6',
        firstShownAt: now - lifetime,
        dismissed,
      },
    })
    assert.equal(popup.releaseNoticeVisible.value, true)
    assert.deepEqual(popup.storage.releaseNotice, {
      version: '0.1.7',
      firstShownAt: now,
      dismissed: false,
    })
  }
})

test('shows v0.1.7 on first use and ignores legacy v0.1.6 dismissal', async () => {
  for (const storage of [
    {},
    {
      dismissedReleaseVersion: '0.1.6',
      releaseNoticeFirstShownAt: now - lifetime,
    },
  ]) {
    const popup = await openPopup(storage)
    assert.equal(popup.releaseNoticeVisible.value, true)
    assert.equal(popup.storage.releaseNotice.version, '0.1.7')
    assert.equal(popup.storage.releaseNotice.firstShownAt, now)
  }
})

test('dismissal persists when the popup is reopened', async () => {
  const popup = await openPopup()
  await popup.dismissReleaseNotice()
  assert.equal(popup.releaseNoticeVisible.value, false)
  const reopened = await openPopup(popup.storage)
  assert.equal(reopened.releaseNoticeVisible.value, false)
  assert.equal(reopened.writes.length, 0)
})

test('reopening an active notice preserves its first shown time', async () => {
  const popup = await openPopup({
    releaseNotice: {
      version: '0.1.7',
      firstShownAt: now - lifetime + 1,
      dismissed: false,
    },
  })
  assert.equal(popup.releaseNoticeVisible.value, true)
  assert.equal(popup.writes.length, 0)
})

test('expires the notice after 24 hours', async () => {
  const popup = await openPopup({
    releaseNotice: {
      version: '0.1.7',
      firstShownAt: now - lifetime,
      dismissed: false,
    },
  })
  assert.equal(popup.releaseNoticeVisible.value, false)
  assert.equal(popup.storage.releaseNotice.dismissed, true)
})

test('opening options does not consume the popup notice', async () => {
  const popup = await openPopup({}, '/options.html')
  assert.equal(popup.releaseNoticeVisible.value, false)
  assert.equal(popup.writes.length, 0)
})
