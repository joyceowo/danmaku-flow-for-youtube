<template>
  <div class="others-section">
    <v-switch
      v-model="hideFullscreenChat"
      class="mt-0 pt-0"
      label="Hide Chat After Page Load"
      hint="Turn this on to hide the chat panel after the page finishes loading."
      persistent-hint
      dense
    />
    <v-switch
      v-model="chatVisible"
      class="mt-0 pt-0"
      label="Always Show Chat"
      hint="By default, the chat is hidden for YouTube Premieres."
      persistent-hint
      dense
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { settingsStore } from '~/store'

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
