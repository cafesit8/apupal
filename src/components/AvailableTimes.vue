<template>
    <aside class="w-full h-full flex flex-col gap-4">
      <AvailableTimeSkeleton v-if="loadingHorarios" />
      <p v-else-if="schedule.length === 0" class="text-sm text-gray-500">
        No hay horarios disponibles para esta fecha
      </p>
      <section v-else class="w-full flex flex-col gap-3.5">
        <article 
          v-for="time in schedule" 
          :key="time.id"
          class="reserve-card w-full rounded-lg p-3 flex justify-between items-center transition-colors h-[52px]"
          :class="{ 
            'bg-clay-main/20': isScheduleSelected(time) || time.reservada
          }"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-sm font-semibold">{{ time.hora12 }}</span>
            <span class="text-clay-main text-xs font-bold">• {{ time.academy ? 'academia' : 'arcilla' }}</span>
          </div>
          <button 
            v-if="!time.reservada || isScheduleSelected(time)"
            @click="selectSchedule(time)"
            class="text-sm py-1 px-3 cursor-pointer transition-colors bg-clay-main/70 hover:bg-clay-main/90 text-clay-light grid place-content-center"
            :class="{ 'reserve-button rounded-2xl': !isScheduleSelected(time), 'rounded-full size-7 text-xl': isScheduleSelected(time)}"
          >
            <ion-icon v-if="isScheduleSelected(time)" name="close-outline"></ion-icon>
            <span v-else>Seleccionar</span>
          </button>
        </article>
      </section>
    </aside>
</template>

<script setup lang="ts">
import AvailableTimeSkeleton from '../skeleton/AvailableTimeSkeleton.vue';
import type { Schedule, SchedulePerDay } from '../types/calendar';


const props = defineProps<{
  loadingHorarios: boolean,
  schedule: SchedulePerDay[],
  selectedHours: Schedule[],
  selected: string
}>()

const emit = defineEmits<{
  (e: 'selected-time', payload: { errorMessage: string, selected: Schedule[] }): void
}>()

function isScheduleSelected(horario: any): boolean {
  return props.selectedHours.some(
    h => h.fecha === props.selected && h.hora_id === horario.hora_id
  );
}

function selectSchedule(time: any) {
  const horaConFecha = {
    ...time,
    fecha: props.selected
  };
  const selectedScheduleUpdate = props.selectedHours
  
  const index = props.selectedHours.findIndex(
    h => h.fecha === horaConFecha.fecha && h.hora_id === horaConFecha.hora_id
  );
  
  if (index > -1) {
    selectedScheduleUpdate.splice(index, 1);
  } else {
    selectedScheduleUpdate.push(horaConFecha);
  }
  
  emit('selected-time', { errorMessage: '', selected: selectedScheduleUpdate });
}
</script>
<style scoped>
.reserve-card {
  transition: all 0.1s linear;
}

.reserve-card:has(.reserve-button:hover) {
  transition: background-color 0.1s linear;
  background-color: #aa4b440b;
}
</style>