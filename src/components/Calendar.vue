<template>
  <calendar-date ref="calendarRef" :selected="selected" :value="selected" @change="onChange">
    <svg slot="previous" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
    <calendar-month></calendar-month>
    <svg slot="next" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
  </calendar-date>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import "cally";

defineProps<{
  selected: string,
}>()

const calendarRef = ref<any | null>(null) 
const emit = defineEmits(['change'])

function onChange(event: any) {
  emit('change', event.target.value);
}

onMounted(() => {
  if (calendarRef.value) {  
    calendarRef.value.isDateDisallowed = (date: Date) => {  
      const dayOfWeek = date.getDay()  
      return dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4  
    }  
  }
})
</script>
<style scoped>
calendar-date {
  --color-accent: #AA4A44;
  --color-text-on-accent: #fff;

    svg {
      height: 16px;
      width: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
    }

    path {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    &::part(button) {
      border: none;
      border-radius: 100%;
      background-color: var(--color-accent);
      color: var(--color-text-on-accent);
      width: 30px;
      height: 30px;
    }
}

calendar-month {
  --color-accent: #AA4A44;
  --color-text-on-accent: #fff;

  &::part(button) {
      border-radius: 100%;
    }
}
</style>