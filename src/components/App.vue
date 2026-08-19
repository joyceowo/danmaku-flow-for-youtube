<template>
  <v-app :class="{ 'dark-theme': theme === 'dark' }">
    <v-main class="fill-height">
      <v-container fluid>
        <div class="subtitle-2">{{ t('sectionGeneral') }}</div>
        <general-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">{{ t('sectionAppearance') }}</div>
        <appearance-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">{{ t('sectionBehavior') }}</div>
        <behavior-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">{{ t('sectionOthers') }}</div>
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
import GeneralSection from '~/components/GeneralSection.vue'
import OthersSection from '~/components/OthersSection.vue'
import { computed, watch } from 'vue'
import { Theme } from '~/models'
import { applyTheme } from '~/plugins/vuetify'
import { settingsStore } from '~/store'
import { setLocale, t } from '~/utils/i18n'

setLocale(settingsStore.language)

const theme = computed<Theme>(() => settingsStore.theme || 'light')

watch(theme, applyTheme, { immediate: true })

const handleClickReset = () => {
  settingsStore.resetState()
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
