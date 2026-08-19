<template>
  <v-app>
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
import { settingsStore } from '~/store'
import { setLocale, t } from '~/utils/i18n'

setLocale(settingsStore.language)

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
  border-color: #d32f2f !important;
  color: #d32f2f;
}
</style>
