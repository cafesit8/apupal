<template>
  <main class="relative flex sm:flex-row flex-col gap-5 m-auto max-w-[900px] w-full min-h-dvh poppins-regular p-4 md:py-10">
    <section class="w-full flex flex-col items-center gap-5">
      <Header />
      <Calendar :selected="selected" @change="onChange" />
      <!-- Formulario -->
      <article class="w-full flex flex-col gap-4" v-auto-animate>
        <h3 class="poppins-semibold font-semibold">Detalles de la Reserva</h3>
        <!-- Horarios seleccionados -->
        <div v-if="selectedHours.length > 0" class="p-3 bg-clay-light rounded-lg">
          <p class="font-semibold text-sm mb-2">Horarios seleccionados ({{ selectedHours.length }}):</p>
          <div class="flex flex-col gap-1 max-h-32 overflow-y-auto" v-auto-animate>
            <div 
              v-for="(hora, index) in selectedHours"
              :key="`${hora.fecha}-${hora.hora_id}`"
              class="flex justify-between items-center bg-white p-2 rounded text-xs"
            >
              <span>{{ hora.fecha }} - {{ hora.hora12 }}</span>
              <button 
                @click="removerHora(index)"
                class="text-red-600 hover:text-red-700 rounded-full text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
          <p class="text-sm font-bold mt-2 flex flex-col gap-1.5">
            <span class="text-xs font-normal w-full border border-clay-main/70 p-2 rounded-lg text-clay-main">Costo por hora S/25. A partir de las 6pm costo es de S/30</span>
          </p>
        </div>
        <div v-else class="p-3 bg-clay-light rounded-lg text-sm flex items-center gap-1 justify-center">
          <ion-icon class="text-lg" name="alert-circle-outline"></ion-icon> Selecciona uno o más horarios para continuar
        </div>
        <Form :selected-hours="selectedHours" @payment-result="onPaymentResult" />
      </article>
    </section>
    
    <AvailableTimes 
      :loading-horarios="loadingHorarios"
      :schedule="schedule"
      :selected-hours="selectedHours"
      :selected="selected"
      @selected-time="onSelectedTime"
    />
    <Toast
      v-if="toastInfo.visible"
      :message="toastInfo.message"
      :type="toastInfo.type"
      @close="toastInfo.visible = false"
    />
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted} from "vue";
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import Header from "../components/Header.vue";
import Calendar from "../components/Calendar.vue";
import Form from "../components/Form.vue";
import AvailableTimes from "../components/AvailableTimes.vue";
import Toast from "../components/Toast.vue";
import type { RootSchedulePerDay, Schedule, SchedulePerDay } from "../types/calendar";
import type { ToastInfo } from "../types/toast";

const calendarRef = ref<any | null>(null) 
const selected = ref("")
const selectedHours = ref<Schedule[]>([])
const schedule = ref<SchedulePerDay[]>([])
const loadingHorarios = ref(false)
const error = ref("")
const toastInfo = ref<ToastInfo>({
  visible: false,
  message: "",
  type: "info"
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function onChange(dateSelected: string) {
  selected.value = dateSelected
  cargarHorarios();
}

async function cargarHorarios() {
  if (!selected.value) return;
  
  loadingHorarios.value = true;
  try {
    const response = await fetch(`${API_URL}/api/horarios/${selected.value}`);
    const data: RootSchedulePerDay = await response.json();
    
    if (data.success) {
      schedule.value = data.schedule
    } else {
      toastInfo.value.visible = true;
      toastInfo.value.message = "Error al cargar horarios";
      toastInfo.value.type = "error";
    }
  } catch (err) {
    toastInfo.value.visible = true;
    toastInfo.value.message = "Error de conexión con el servidor";
    toastInfo.value.type = "error";
  } finally {
    loadingHorarios.value = false;
  }
}

function removerHora(index: number) {
  selectedHours.value.splice(index, 1);
}

function onSelectedTime(payload: { errorMessage: string, selected: Schedule[] }) {
  error.value = payload.errorMessage;
  selectedHours.value = payload.selected;
}

function onPaymentResult(payload: { success: boolean, reserva: any, error: string }) {
  console.log({payload})
  if (payload.success) {
    toastInfo.value.visible = true;
    toastInfo.value.message = "Reserva exitosa!";
    toastInfo.value.type = "success";
    selectedHours.value = [];
    cargarHorarios();
  } else {
    error.value = payload.error;
    toastInfo.value.visible = true;
    toastInfo.value.message = payload.error;
    toastInfo.value.type = "error";
  }
}

onMounted(async () => {
  const date = new Date()
  const fullDay = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  selected.value = fullDay

  if (calendarRef.value) {  
    calendarRef.value.isDateDisallowed = (date: Date) => {  
      const dayOfWeek = date.getDay()  
      return dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4  
    }  
  }

  cargarHorarios();
})
</script>

<style scoped>
body {
  background-color: #fcf4f4;
}
</style>