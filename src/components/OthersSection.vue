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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { settingsStore } from '~/store'
import { setLocale, t } from '~/utils/i18n'

const languages = [
  { text: 'English', value: 'en' },
  { text: '日本語', value: 'ja' },
  { text: '繁體中文', value: 'zh_TW' },
  { text: '한국어', value: 'ko' },
]

const language = computed({
  get: () => settingsStore.language || 'en',
  set: (value) => {
    setLocale(value)
    settingsStore.setLanguage({ language: value })
  },
})

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
