<template>
  <div class="appearance-section">
    <div class="d-flex">
      <div class="mr-3">
        <div class="caption">{{ t('height') }}</div>
        <v-select
          v-model="heightType"
          :items="heightTypes"
          dense
          single-line
          class="pt-0 mt-1"
          style="width: 160px"
        />
      </div>
      <div class="flex-grow-1">
        <template v-if="heightType === 'fixed'">
          <div class="caption">{{ t('lineHeight') }}</div>
          <v-slider
            v-model="lineHeight"
            class="align-center mb-5"
            min="1"
            max="256"
            step="1"
            dense
            hide-details
          >
            <template #prepend>
              <v-text-field
                v-model="lineHeight"
                class="mt-0 pt-0"
                dense
                hide-details
                single-line
                type="number"
                min="1"
                max="256"
                step="1"
                suffix="px"
                style="width: 75px"
              />
            </template>
          </v-slider>
        </template>
        <template v-else>
          <div class="caption">{{ t('fontSize') }}</div>
          <v-slider
            v-model="fontSize"
            class="align-center mb-5"
            min="1"
            max="64"
            step="1"
            dense
            hide-details
          >
            <template #prepend>
              <v-text-field
                v-model="fontSize"
                class="mt-0 pt-0"
                dense
                hide-details
                single-line
                type="number"
                min="1"
                max="64"
                step="1"
                suffix="/ 64"
                style="width: 88px"
              />
            </template>
          </v-slider>
          <div class="caption setting-hint">{{ t('fontSizeHint') }}</div>
        </template>
        <div class="caption setting-hint">{{ heightTypeHint }}</div>
      </div>
    </div>

    <div class="caption">{{ t('maxWidth') }}</div>
    <v-slider
      v-model="maxWidth"
      class="align-center mb-5"
      min="0"
      max="300"
      dense
      hide-details
    >
      <template #prepend>
        <v-text-field
          v-model="maxWidth"
          class="mt-0 pt-0"
          dense
          hide-details
          single-line
          type="number"
          min="0"
          max="300"
          suffix="%"
          style="width: 75px"
        />
      </template>
    </v-slider>
    <div class="caption setting-hint">{{ t('maxWidthHint') }}</div>

    <div class="caption">{{ t('opacity') }}</div>
    <v-slider
      v-model="opacityPercent"
      class="align-center mb-5"
      min="0"
      max="100"
      step="10"
      dense
      hide-details
    >
      <template #prepend>
        <v-text-field
          v-model="opacityPercent"
          class="mt-0 pt-0"
          dense
          hide-details
          single-line
          type="number"
          min="0"
          max="100"
          step="10"
          suffix="%"
          style="width: 75px"
        />
      </template>
    </v-slider>
    <div class="caption setting-hint">{{ t('opacityHint') }}</div>

    <div class="caption">{{ t('showBackground') }}</div>
    <v-switch v-model="background" class="mt-0" dense />

    <div class="caption">{{ t('backgroundOpacity') }}</div>
    <v-slider
      v-model="backgroundOpacityPercent"
      class="align-center mb-5"
      min="0"
      max="100"
      step="10"
      dense
      hide-details
    >
      <template #prepend>
        <v-text-field
          v-model="backgroundOpacityPercent"
          class="mt-0 pt-0"
          dense
          hide-details
          single-line
          type="number"
          min="0"
          max="100"
          step="10"
          suffix="%"
          style="width: 75px"
        />
      </template>
    </v-slider>
    <div class="caption setting-hint">{{ t('backgroundOpacityHint') }}</div>

    <div class="caption">{{ t('outlineRatio') }}</div>
    <v-slider
      v-model="outlineRatio"
      class="align-center mb-5"
      min="0"
      max="5"
      step="0.1"
      dense
      hide-details
    >
      <template #prepend>
        <v-text-field
          v-model="outlineRatio"
          class="mt-0 pt-0"
          dense
          hide-details
          single-line
          type="number"
          min="0"
          max="5"
          step="0.1"
          suffix="%"
          style="width: 75px"
        />
      </template>
    </v-slider>
    <div class="caption setting-hint">{{ t('outlineRatioHint') }}</div>

    <div class="caption">{{ t('emojiStyle') }}</div>
    <v-select
      v-model="emojiStyle"
      :items="emojiStyles"
      dense
      single-line
      class="mt-1 pt-0"
    />

    <div class="caption">{{ t('extendedStyle') }}</div>
    <v-textarea
      v-model="extendedStyle"
      placeholder='font-family: "Yu Gothic", YuGothic, Meiryo;'
      dense
      single-line
      rows="1"
      auto-grow
      class="mt-1 pt-0"
    />
    <div class="caption setting-hint">{{ t('extendedStyleHint') }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { settingsStore } from '~/store'
import { t } from '~/utils/i18n'

const heightTypes = [
  { text: t('flexible'), value: 'flexible' },
  { text: t('fixed'), value: 'fixed' },
]

const emojiStyles = [
  { text: t('emojiImage'), value: 'image' },
  { text: t('emojiAlternativeText'), value: 'text' },
  { text: t('none'), value: 'none' },
]

const background = computed({
  get: () => {
    return settingsStore.background
  },
  set: (value) => {
    settingsStore.setBackground({
      background: value,
    })
  },
})
const backgroundOpacityPercent = computed({
  get: () => {
    return settingsStore.backgroundOpacity * 100
  },
  set: (value) => {
    settingsStore.setBackgroundOpacity({
      backgroundOpacity: Number(value) / 100,
    })
  },
})
const emojiStyle = computed({
  get: () => {
    return settingsStore.emojiStyle
  },
  set: (value) => {
    settingsStore.setEmojiStyle({
      emojiStyle: value,
    })
  },
})
const extendedStyle = computed({
  get: () => {
    return settingsStore.extendedStyle
  },
  set: (value) => {
    settingsStore.setExtendedStyle({
      extendedStyle: value,
    })
  },
})
const heightType = computed({
  get: () => {
    return settingsStore.heightType
  },
  set: (value) => {
    settingsStore.setHeightType({
      heightType: value,
    })
  },
})
const heightTypeHint = computed(() => {
  return heightType.value === 'fixed'
    ? t('fixedFontSizeHint')
    : t('flexibleFontSizeHint')
})
const lineHeight = computed({
  get: () => {
    return settingsStore.lineHeight
  },
  set: (value) => {
    settingsStore.setLineHeight({
      lineHeight: Number(value),
    })
  },
})
// Settings store lane count. Reverse it here so larger UI values mean larger text.
const fontSize = computed({
  get: () => {
    return 65 - settingsStore.lines
  },
  set: (value) => {
    settingsStore.setLines({
      lines: 65 - Number(value),
    })
  },
})
const maxWidth = computed({
  get: () => {
    return settingsStore.maxWidth
  },
  set: (value) => {
    settingsStore.setMaxWidth({
      maxWidth: Number(value),
    })
  },
})
const opacityPercent = computed({
  get: () => {
    return settingsStore.opacity * 100
  },
  set: (value) => {
    settingsStore.setOpacity({
      opacity: Number(value) / 100,
    })
  },
})
const outlineRatio = computed({
  get: () => {
    return (settingsStore.outlineRatio * 1000) / 10
  },
  set: (value) => {
    settingsStore.setOutlineRatio({
      outlineRatio: (Number(value) * 10) / 1000,
    })
  },
})
</script>

<style lang="scss" scoped>
.setting-hint {
  color: rgba(0, 0, 0, 0.6);
  margin: -12px 0 12px;
}
</style>
