<template>
  <v-app :class="{ 'dark-theme': theme === 'dark' }">
    <v-main class="fill-height">
      <v-container fluid>
        <v-card v-if="releaseNoticeVisible" class="release-notice mb-5" flat>
          <div class="d-flex align-start">
            <div>
              <div class="subtitle-2">{{ t('releaseV016Title') }}</div>
              <ul class="release-notice-list caption mt-2 mb-0">
                <li>{{ t('releaseV016ModeProfiles') }}</li>
                <li>{{ t('releaseV016HideChat') }}</li>
              </ul>
            </div>
            <v-btn
              class="ml-auto"
              icon
              small
              :aria-label="t('releaseV016Dismiss')"
              @click="dismissReleaseNotice"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-btn
            class="release-notice-dismiss mt-3"
            small
            outlined
            @click="dismissReleaseNotice"
          >
            {{ t('releaseV016Dismiss') }}
          </v-btn>
        </v-card>

        <display-mode-section class="mb-5" />

        <div class="subtitle-2">{{ t('sectionAppearance') }}</div>
        <appearance-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">{{ t('sectionBehavior') }}</div>
        <behavior-section class="mt-3 mb-5 mx-3" />

        <v-divider class="mb-5" />

        <div class="subtitle-2">{{ t('sectionGeneral') }}</div>
        <div class="caption mt-1">{{ t('sectionGeneralHint') }}</div>

        <div class="subtitle-2 mt-4">{{ t('sectionMessageStyle') }}</div>
        <general-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">{{ t('sectionAppAndChat') }}</div>
        <others-section class="mt-3 mb-5 mx-3" />

        <v-btn
          class="mt-4 reset-button"
          outlined
          block
          @click="handleClickReset"
        >
          {{ t('resetSettings') }}
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppearanceSection from '~/components/AppearanceSection.vue'
import BehaviorSection from '~/components/BehaviorSection.vue'
import DisplayModeSection from '~/components/DisplayModeSection.vue'
import GeneralSection from '~/components/GeneralSection.vue'
import OthersSection from '~/components/OthersSection.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Theme } from '~/models'
import { applyTheme } from '~/plugins/vuetify'
import { settingsStore } from '~/store'
import { setLocale, t } from '~/utils/i18n'

setLocale(settingsStore.language)

const releaseVersion = '0.1.6'
const releaseNoticeStorageKey = 'releaseNotice'
const legacyReleaseNoticeStorageKey = 'dismissedReleaseVersion'
const legacyReleaseNoticeFirstShownAtStorageKey = 'releaseNoticeFirstShownAt'
const legacyReleaseNoticeVersion = '0.1.6'
const releaseNoticeLifetime = 24 * 60 * 60 * 1000
const releaseNoticeVisible = ref(false)

type ReleaseNoticeState = {
  version: string
  firstShownAt: number
  dismissed: boolean
}

const saveReleaseNoticeState = async (state: ReleaseNoticeState) => {
  await chrome.storage.local.set({ [releaseNoticeStorageKey]: state })
}

const theme = computed<Theme>(() => settingsStore.theme || 'light')

watch(theme, applyTheme, { immediate: true })

onMounted(async () => {
  if (!location.pathname.endsWith('/popup.html')) {
    return
  }

  const result = await chrome.storage.local.get([
    releaseNoticeStorageKey,
    legacyReleaseNoticeStorageKey,
    legacyReleaseNoticeFirstShownAtStorageKey,
  ])
  const savedState = result[releaseNoticeStorageKey] as
    | ReleaseNoticeState
    | undefined
  const state =
    savedState?.version === releaseVersion
      ? savedState
      : {
          version: releaseVersion,
          firstShownAt:
            releaseVersion === legacyReleaseNoticeVersion &&
            typeof result[legacyReleaseNoticeFirstShownAtStorageKey] ===
              'number'
              ? result[legacyReleaseNoticeFirstShownAtStorageKey]
              : Date.now(),
          dismissed:
            releaseVersion === legacyReleaseNoticeVersion &&
            result[legacyReleaseNoticeStorageKey] === releaseVersion,
        }

  if (state !== savedState) {
    await saveReleaseNoticeState(state)
  }

  if (state.dismissed) {
    return
  }

  if (Date.now() - state.firstShownAt >= releaseNoticeLifetime) {
    await saveReleaseNoticeState({ ...state, dismissed: true })
    return
  }

  releaseNoticeVisible.value = true
})

const dismissReleaseNotice = async () => {
  releaseNoticeVisible.value = false
  await saveReleaseNoticeState({
    version: releaseVersion,
    firstShownAt: Date.now(),
    dismissed: true,
  })
}

const handleClickReset = async () => {
  settingsStore.resetState()
  await nextTick()
  window.setTimeout(() => {
    settingsStore.finishApplyingDisplayMode({ displayMode: 'default' })
  }, 0)
}
</script>

<style lang="scss">
html {
  overflow-y: auto;
}

body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
.v-application {
  width: 640px;
}

.reset-button {
  background: #ffffff;
  border-color: #d77a7a !important;
  color: #c65d5d;
}

.release-notice {
  background: linear-gradient(135deg, #edf5ff 0%, #e9f0ff 100%);
  border: 1px solid #b9d4f7;
  border-radius: 8px;
  color: #203a5f;
  padding: 16px;
}

.release-notice-list {
  padding-left: 18px;
}

.release-notice-dismiss {
  border-color: #3979bd !important;
  color: #28649f;
}

.dark-theme {
  background: radial-gradient(circle at 50% -10%, #292064 0, transparent 52%),
    #070a32;
  color: #f7f5ff;

  ::v-deep .v-main {
    background: transparent;
  }

  ::v-deep .v-container {
    background: linear-gradient(145deg, #151451 0%, #0d1042 100%);
    border: 1px solid #b36bff;
    border-radius: 18px;
    box-shadow: 0 0 16px rgba(150, 75, 255, 0.65);
    margin: 18px;
    width: calc(100% - 36px);
  }

  ::v-deep .v-input input,
  ::v-deep .v-input textarea,
  ::v-deep .v-select__selection,
  ::v-deep .v-label,
  ::v-deep .caption,
  ::v-deep .subtitle-2 {
    color: #f7f5ff !important;
  }

  ::v-deep .chat-visibility-control-hint {
    color: #d6d0f0;
  }

  ::v-deep .v-text-field > .v-input__control > .v-input__slot::before,
  ::v-deep .v-select__slot::before {
    border-color: rgba(224, 220, 255, 0.55);
  }

  ::v-deep .support-card {
    background: linear-gradient(
      135deg,
      rgba(33, 27, 91, 0.92) 0%,
      rgba(15, 19, 71, 0.92) 100%
    );
    border-color: rgba(179, 107, 255, 0.8);
    color: #f7f5ff;

    .caption {
      color: #d6d0f0;
    }
  }

  ::v-deep .release-notice {
    background: linear-gradient(
      135deg,
      rgba(22, 54, 100, 0.92) 0%,
      rgba(21, 36, 82, 0.92) 100%
    );
    border-color: rgba(118, 179, 255, 0.8);
    color: #edf5ff;
  }

  ::v-deep .release-notice-dismiss {
    border-color: #8ec2ff !important;
    color: #c9e2ff;
  }

  ::v-deep .support-button {
    background: #40318a;
    border-color: #8064c7 !important;
    color: #ffffff !important;

    &:hover {
      background: #8064c7;
    }
  }

  .reset-button {
    background: transparent;
    border-color: #ff8c9b !important;
    color: #ffb1bc;
  }
}
</style>
