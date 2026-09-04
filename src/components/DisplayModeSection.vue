<template>
  <div class="display-mode-section">
    <div class="display-mode-heading">
      <div class="subtitle-2">{{ t('displayMode') }}</div>
    </div>
    <div class="display-mode-hint caption mt-1">{{ t('displayModeHint') }}</div>
    <div class="display-mode-toggle">
      <v-btn
        v-for="mode in modes"
        :key="mode.value"
        class="display-mode-button"
        :class="{
          'display-mode-button--active': currentDisplayMode === mode.value,
        }"
        text
        @click="applyMode(mode.value)"
      >
        {{ mode.text }}
      </v-btn>
    </div>
    <div class="display-mode-description caption mt-2">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { DisplayMode } from '~/models'
import { settingsStore } from '~/store'
import { t } from '~/utils/i18n'

const modes = [
  { text: t('displayModeDefault'), value: 'default' },
  { text: t('displayModeVideo'), value: 'video' },
  { text: t('displayModeChat'), value: 'chat' },
  { text: t('displayModeCustom'), value: 'custom' },
] as const

const currentDisplayMode = computed<DisplayMode>(() => {
  const mode = settingsStore.displayMode
  const legacyModes: Record<string, DisplayMode> = {
    compact: 'video',
    standard: 'chat',
    dense: 'default',
    all: 'default',
  }
  if (legacyModes[mode]) return legacyModes[mode]
  if (['video', 'chat', 'default', 'custom'].includes(mode)) {
    return mode as DisplayMode
  }
  return 'custom'
})

const description = computed(() => {
  const descriptions: Record<DisplayMode, string> = {
    video: t('displayModeVideoHint'),
    chat: t('displayModeChatHint'),
    default: t('displayModeDefaultHint'),
    custom: t('displayModeCustomHint'),
  }
  return descriptions[currentDisplayMode.value]
})

const applyMode = async (mode: DisplayMode) => {
  settingsStore.applyDisplayMode({ displayMode: mode })
  await nextTick()
  window.setTimeout(() => {
    settingsStore.finishApplyingDisplayMode({ displayMode: mode })
  }, 0)
}
</script>

<style lang="scss" scoped>
.display-mode-toggle {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-left: 12px;
  margin-right: 12px;
  margin-top: 6px;
  width: calc(100% - 24px);
}

.display-mode-description {
  margin-left: 12px;
  margin-right: 12px;
}

.display-mode-hint {
  color: rgba(0, 0, 0, 0.6);
}

.display-mode-button {
  background: transparent !important;
  min-width: 0 !important;
  text-transform: none;

  &--active {
    background: rgba(25, 118, 210, 0.12) !important;
    color: #1976d2 !important;
  }
}

.display-mode-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
</style>
