<template>
  <div class="others-section">
    <div class="caption">{{ t('language') }}</div>
    <v-select
      v-model="language"
      :items="languages"
      dense
      single-line
      class="mt-1 pt-0"
    />
    <div class="caption">{{ t('theme') }}</div>
    <v-select
      v-model="theme"
      :items="themes"
      dense
      single-line
      class="mt-1 pt-0"
    />
    <v-switch
      v-model="hideFullscreenChat"
      class="mt-0 pt-0"
      :label="t('hideChatAfterLoad')"
      :hint="t('hideChatAfterLoadHint')"
      persistent-hint
      dense
    />
    <v-switch
      v-model="chatVisible"
      class="mt-0 pt-0"
      :label="t('alwaysShowChat')"
      :hint="t('alwaysShowChatHint')"
      persistent-hint
      dense
    />
    <div class="support-card mt-5">
      <div class="d-flex align-center subtitle-2">
        <v-icon class="support-heading-icon mr-2" small
          >mdi-heart-outline</v-icon
        >
        {{ t('supportDevelopment') }}
      </div>
      <div class="caption mt-1">{{ t('supportDevelopmentHint') }}</div>
      <v-btn
        class="support-button mt-3"
        href="https://paypal.me/OwOJoyce"
        target="_blank"
        rel="noopener noreferrer"
        small
        outlined
      >
        <v-icon left small>mdi-heart-outline</v-icon>
        {{ t('supportViaPayPal') }}
        <v-icon right small>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Locale, Theme } from '~/models'
import { settingsStore } from '~/store'
import { setLocale, t } from '~/utils/i18n'

const languages = [
  { text: 'English', value: 'en' },
  { text: '日本語', value: 'ja' },
  { text: '繁體中文', value: 'zh_TW' },
  { text: '한국어', value: 'ko' },
]

const themes = [
  { text: t('themeLight'), value: 'light' },
  { text: t('themeDark'), value: 'dark' },
]

const language = computed({
  get: () => settingsStore.language || 'en',
  set: (value: Locale) => {
    setLocale(value)
    settingsStore.setLanguage({ language: value })
  },
})

const theme = computed({
  get: (): Theme => settingsStore.theme || 'light',
  set: (value: Theme) => {
    settingsStore.setTheme({ theme: value })
  },
})

watch(language, setLocale, { immediate: true })

const hideFullscreenChat = computed({
  get: () => {
    return settingsStore.hideFullscreenChat
  },
  set: (value) => {
    settingsStore.setHideFullscreenChat({
      hideFullscreenChat: value,
    })
  },
})

const chatVisible = computed({
  get: () => {
    return settingsStore.chatVisible
  },
  set: (value) => {
    settingsStore.setChatVisible({
      chatVisible: value,
    })
  },
})
</script>

<style lang="scss" scoped>
.support-card {
  background: linear-gradient(135deg, #f8f5ff 0%, #eee7ff 100%);
  border: 1px solid #d9cef7;
  border-radius: 8px;
  color: #25213d;
  padding: 16px;

  .caption {
    color: #625d78;
  }
}

.support-heading-icon {
  color: #8064c7;
}

.support-button {
  background: #e6dcff;
  border-color: #8064c7 !important;
  color: #5d43a3 !important;
  font-weight: 500;

  ::v-deep .v-icon {
    color: #5d43a3 !important;
  }

  &:hover {
    background: #8064c7;
    color: #ffffff !important;

    ::v-deep .v-icon {
      color: #ffffff !important;
    }
  }
}
</style>
