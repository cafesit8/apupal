<template>
  <main class="relative flex gap-5 m-auto max-w-[900px] w-full h-dvh poppins-regular p-4 md:py-10">
    <section class="w-full flex flex-col items-center gap-5">
      <h1 class="poppins-bold text-2xl self-start">Canchas de tenis Apupal</h1>
      
      <calendar-date ref="calendarRef" :selected="selected" :value="selected" @change="onChange">
        <svg slot="previous" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
        <calendar-month></calendar-month>
        <svg slot="next" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
      </calendar-date>

      <!-- Mensaje de éxito -->
      <div v-if="success" class="w-full p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
        <h3 class="font-bold">¡Reserva confirmada! ✅</h3>
        <p>Código: <strong>{{ reservaInfo?.codigo }}</strong></p>
        <div class="mt-2">
          <p class="font-semibold">Horarios reservados:</p>
          <ul class="list-disc list-inside text-sm">
            <li v-for="(hora, idx) in reservaInfo?.horarios" :key="idx">
              {{ hora.fecha }} - {{ hora.hora12 }}
            </li>
          </ul>
        </div>
        <p class="mt-2">Te enviamos un email de confirmación a: {{ userDataInfo.email }}</p>
        <button @click="success = false; selectedHours = []" class="mt-2 text-sm underline">
          Hacer otra reserva
        </button>
      </div>

      <!-- Formulario -->
      <article v-else class="w-full overflow-auto flex flex-col gap-4">
        <h3 class="poppins-semibold font-semibold">Detalles de la Reserva</h3>
        
        <!-- Mensaje de error -->
        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Horarios seleccionados -->
        <div v-if="selectedHours.length > 0" class="p-3 bg-clay-light rounded-lg">
          <p class="font-semibold text-sm mb-2">Horarios seleccionados ({{ selectedHours.length }}):</p>
          <div class="flex flex-col gap-1 max-h-32 overflow-y-auto">
            <div 
              v-for="(hora, index) in selectedHours" 
              :key="`${hora.fecha}-${hora.hora_id}`"
              class="flex justify-between items-center bg-white p-2 rounded text-xs"
            >
              <span>{{ hora.fecha }} - {{ hora.hora12 }}</span>
              <button 
                @click="removerHora(index)"
                class="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
          <p class="text-sm font-bold mt-2">
            Total: S/ {{ montoTotal.toFixed(2) }} 
            <span class="text-xs font-normal">({{ selectedHours.length }} × S/ {{ PRECIO_POR_HORA.toFixed(2) }})</span>
          </p>
        </div>
        <div v-else class="p-3 bg-clay-light rounded-lg text-sm">
          ℹ️ Selecciona uno o más horarios para continuar
        </div>

        <form @submit.prevent="processPaymentSimple" class="flex flex-col gap-2">
          <!-- Datos personales -->
          <InputField type="text" v-model="userDataInfo.name" placeholder="Juan" label="Nombre" required />
          <InputField type="text" v-model="userDataInfo.lastname" placeholder="Pérez" label="Apellido" required />
          <InputField type="number" maxlength="7" v-model="userDataInfo.dni" placeholder="76543210" label="DNI" required />
          <InputField type="email" v-model="userDataInfo.email" placeholder="example@gmail.com" label="Correo Electrónico" required />
          <InputField type="tel" maxlength="9" v-model="userDataInfo.phoneNumber" placeholder="987654321" label="Número de Teléfono" required />
          
          <!-- Datos de la tarjeta -->
          <h4 class="poppins-semibold text-sm mt-4">Datos de la Tarjeta</h4>
          <InputField 
            type="text" 
            v-model="cardData.cardNumber" 
            placeholder="4111 1111 1111 1111" 
            label="Número de Tarjeta"
            maxlength="19"
            required 
          />
          <InputField 
            type="text" 
            v-model="cardData.cardholderName" 
            placeholder="JUAN PEREZ" 
            label="Nombre en la Tarjeta"
            required 
          />
          <div class="grid grid-cols-3 gap-2">
            <InputField 
              type="text" 
              v-model="cardData.expirationMonth" 
              placeholder="12" 
              label="Mes"
              maxlength="2"
              required 
            />
            <InputField 
              type="text" 
              v-model="cardData.expirationYear" 
              placeholder="2025" 
              label="Año"
              maxlength="4"
              required 
            />
            <InputField 
              type="text" 
              v-model="cardData.securityCode" 
              placeholder="123" 
              label="CVV"
              maxlength="3"
              required 
            />
          </div>

          <button 
            type="submit"
            :disabled="!isFormValid || loadingPayment"
            class="w-full mt-2 flex justify-center items-center text-sm bg-clay-main/70 text-clay-light py-2 px-3 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loadingPayment ? 'Procesando...' : `Pagar S/ ${montoTotal.toFixed(2)}` }}
          </button>
        </form>
      </article>
    </section>

    <aside class="w-full overflow-auto mt-13">
      <h2 class="poppins-semibold text-lg mb-4">Horas Disponibles</h2>
      <p v-if="loadingHorarios">Cargando...</p>
      <p v-else-if="schedule.length === 0" class="text-sm text-gray-500">
        No hay horarios disponibles para esta fecha
      </p>
      <section v-else class="w-full flex flex-col gap-3.5">
        <article 
          v-for="time in schedule" 
          :key="time.id"
          class="reserve-card w-full rounded-lg p-3 flex justify-between items-center transition-colors h-[52px]"
          :class="{ 
            'bg-clay-main/20': isHoraSeleccionada(time) || time.reservada
          }"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-sm font-semibold">{{ time.hora12 }}</span>
            <span class="text-clay-main text-xs font-bold">• {{ time.academy ? 'academia' : 'arcilla' }}</span>
          </div>
          <button 
            v-if="!time.reservada || isHoraSeleccionada(time)"
            @click="seleccionarHora(time)"
            class="text-sm py-1 px-3 rounded-2xl cursor-pointer transition-colors bg-clay-main/70 hover:bg-clay-main/90 text-clay-light"
            :class="{ 'reserve-button': !isHoraSeleccionada(time)}"
          >
            {{ isHoraSeleccionada(time) ? 'X' : 'Seleccionar' }}
          </button>
        </article>
      </section>
    </aside>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { loadMercadoPago } from '@mercadopago/sdk-js'
import InputField from "../components/InputField.vue";
import "cally";
import { MP_PUBLIC_KEY } from "../const/yape";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const calendarRef = ref<any | null>(null) 
const selected = ref("")
const selectedHours = ref<any[]>([]) // Array de horarios seleccionados
const mp = ref<any | null>(null)
const schedule = ref<any[]>([])
const loadingHorarios = ref(false)
const loadingPayment = ref(false)
const userDataInfo = ref({
  dni: '',
  phoneNumber: '',
  email: '',
  name: '',
  lastname: ''
})

// Datos de la tarjeta
const cardData = ref({
  cardNumber: '',
  cardholderName: '',
  expirationMonth: '',
  expirationYear: '',
  securityCode: ''
})

const error = ref("")
const success = ref(false)
const reservaInfo = ref<any>(null)

const PRECIO_POR_HORA = 20.00;

// Calcular monto total
const montoTotal = computed(() => {
  return selectedHours.value.length * PRECIO_POR_HORA;
});

const isFormValid = computed(() => {
  return selectedHours.value.length > 0 && 
         userDataInfo.value.email && 
         userDataInfo.value.name && 
         userDataInfo.value.lastname &&
         userDataInfo.value.dni &&
         userDataInfo.value.phoneNumber &&
         cardData.value.cardNumber &&
         cardData.value.cardholderName &&
         cardData.value.expirationMonth &&
         cardData.value.expirationYear &&
         cardData.value.securityCode;
});

function onChange(event: any) {
  selected.value = event.target.value;
  cargarHorarios();
}

async function cargarHorarios() {
  if (!selected.value) return;
  
  loadingHorarios.value = true;
  error.value = "";
  
  try {
    const response = await fetch(`${API_URL}/api/horarios/${selected.value}`);
    const data = await response.json();
    
    if (data.success) {
      schedule.value = data.schedule
    } else {
      error.value = "Error al cargar horarios";
    }
  } catch (err) {
    console.error('Error cargando horarios:', err);
    error.value = "Error de conexión con el servidor";
  } finally {
    loadingHorarios.value = false;
  }
}

function seleccionarHora(horario: any) {
  const horaConFecha = {
    ...horario,
    fecha: selected.value
  };
  
  // Verificar si ya está seleccionado
  const index = selectedHours.value.findIndex(
    h => h.fecha === horaConFecha.fecha && h.hora_id === horaConFecha.hora_id
  );
  
  if (index > -1) {
    // Si ya está, lo removemos
    selectedHours.value.splice(index, 1);
  } else {
    // Si no está, lo agregamos
    selectedHours.value.push(horaConFecha);
  }
  
  error.value = "";
}

function removerHora(index: number) {
  selectedHours.value.splice(index, 1);
}

function isHoraSeleccionada(horario: any) {
  return selectedHours.value.some(
    h => h.fecha === selected.value && h.hora_id === horario.hora_id
  );
}

const processPaymentSimple = async () => {
  if (!isFormValid.value) {
    error.value = "Por favor completa todos los campos y selecciona al menos un horario";
    return;
  }

  loadingPayment.value = true;
  error.value = "";
  
  try {
    // Preparar horarios para el backend
    const horariosReservar = selectedHours.value.map(h => ({
      fecha: h.fecha,
      horaId: h.hora_id,
      hora12: h.hora12
    }));

    // Preparar datos de la tarjeta para el backend
    const cardDataFormatted = {
      cardNumber: cardData.value.cardNumber.replace(/\s/g, ''),
      cardholderName: cardData.value.cardholderName,
      cardExpirationMonth: cardData.value.expirationMonth.padStart(2, '0'),
      cardExpirationYear: cardData.value.expirationYear,
      securityCode: cardData.value.securityCode,
      identificationType: 'DNI',
      identificationNumber: userDataInfo.value.dni
    };

    // Enviar datos al backend (el backend creará el token)
    const response = await fetch(`${API_URL}/api/procesar-pago-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardData: cardDataFormatted,
        monto: montoTotal.value,
        email: userDataInfo.value.email,
        nombre: `${userDataInfo.value.name} ${userDataInfo.value.lastname}`,
        horarios: horariosReservar,
        dni: userDataInfo.value.dni,
        phoneNumber: userDataInfo.value.phoneNumber
      })
    });

    const result = await response.json();

    if (result.success && result.pago.approved) {
      success.value = true;
      reservaInfo.value = result.reserva;
      
      // Limpiar formulario
      selectedHours.value = [];
      cardData.value = {
        cardNumber: '',
        cardholderName: '',
        expirationMonth: '',
        expirationYear: '',
        securityCode: ''
      };
      
      // Recargar horarios
      cargarHorarios();
    } else {
      error.value = result.error || 'Pago rechazado';
    }

  } catch (err: any) {
    console.error('Error:', err);
    error.value = err.message || 'Error procesando el pago';
  } finally {
    loadingPayment.value = false;
  }
};

onMounted(async () => {
  const MercadoPago: any = await loadMercadoPago();
  const mp = new MercadoPago(MP_PUBLIC_KEY)
  console.log(mp)
  const cardToken = await mp.createCardToken({
    cardNumber: "4111111111111111",  // Sin espacios
    cardholderName: "APRO",
    cardExpirationMonth: "11",
    cardExpirationYear: "25",  // Solo últimos 2 dígitos
    securityCode: "123",
    identificationType: "DNI",
    identificationNumber: "12345678"
  });

  console.log('✅ Token creado:', cardToken);

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

.reserve-card {
  transition: all 0.1s linear;
}

.reserve-card:has(.reserve-button:hover) {
  transition: background-color 0.1s linear;
  background-color: #aa4b440b;
}
</style>