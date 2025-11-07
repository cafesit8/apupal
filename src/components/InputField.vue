<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-700 mb-1">{{ props.label }}</label>
    <input
      :name="props.name"
      v-model="inputValue"
      :type="props.type"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-clay-main focus:border-clay-main transition-colors placeholder:text-sm text-sm"
      :placeholder="props.placeholder"
      v-bind="attrs"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'text'
  },
  name: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = computed<string>({
  get: () => props.modelValue,
  set: (val: string | number) => emit('update:modelValue', String(val))
})

// forward any additional (native) attributes like maxlength, minlength,
// autocomplete, required, disabled, etc. Parents pass them directly to the
// component and they will be spread onto the internal <input> via `v-bind="attrs"`.
const attrs = useAttrs()
</script>