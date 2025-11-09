<template>
  <form @submit.prevent="isOpenModal = true" class="flex flex-col gap-2">
    <InputField type="text" v-model="userDataInfo.name" placeholder="Juan" label="Nombre" required />
    <InputField type="text" v-model="userDataInfo.lastname" placeholder="Pérez" label="Apellido" required />
    <InputField type="number" maxlength="7" v-model="userDataInfo.dni" placeholder="76543210" label="DNI" required />
    <InputField type="email" v-model="userDataInfo.email" placeholder="example@gmail.com" label="Correo Electrónico" required />
    <FormCreditCard :is-open="isOpenModal" @close-modal="isOpenModal = false" @handle-payment="processPaymentSimple" />
    <button 
      type="submit"
      :disabled="!isFormValid || loadingPayment"
      class="w-full mt-2 flex justify-center items-center text-sm bg-clay-main/80 text-clay-light py-2 px-3 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
        Ir a pagar {{ `S/ ${montoTotal}` }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import InputField from "./InputField.vue";
import type { CardData, Schedule, UserData } from "../types/calendar";
import FormCreditCard from "./FormCreditCard.vue";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const props = defineProps<{
  selectedHours: Schedule[],
}>()

const emit = defineEmits<{
  (e: 'payment-result', payload: { success: boolean, reserva: any, error: string }): void
}>()

const loadingPayment = ref(false)
const userDataInfo = ref<UserData>({
  dni: '76543211',
  email: 'example@gmail.com',
  name: 'Juan',
  lastname: 'Perez'
})
const isOpenModal = ref(false)

const isFormValid = computed(() => {
  return props.selectedHours.length > 0 && 
         userDataInfo.value.email && 
         userDataInfo.value.name && 
         userDataInfo.value.lastname &&
         userDataInfo.value.dni
});

const montoTotal = computed(() => {
  return props.selectedHours.reduce((acc, cur) => acc + Math.round(cur.price_per_hour), 0);
});

const processPaymentSimple = async (cardData: CardData) => {
  if (!isFormValid) {
    const errorMessage = "Por favor completa todos los campos y selecciona al menos un horario";
    emit('payment-result', { success: false, reserva: null, error: errorMessage });
    return;
  }

  loadingPayment.value = true;
  try {
    const horariosReservar = props.selectedHours.map(h => ({
      fecha: h.fecha,
      horaId: h.hora_id,
      hora12: h.hora12,
      code: crypto.randomUUID()
    }));

    const cardDataFormatted = {
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      cardholderName: cardData.cardholderName,
      cardExpirationMonth: cardData.expirationMonth.padStart(2, '0'),
      cardExpirationYear: Number(cardData.expirationYear),
      securityCode: cardData.securityCode,
      identificationType: 'DNI',
      identificationNumber: userDataInfo.value.dni
    };

    // const response = await fetch(`${API_URL}/api/procesar-pago`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     ...cardDataFormatted,
    //     monto: montoTotal.value,
    //     email: userDataInfo.value.email,
    //     nombre: `${userDataInfo.value.name} ${userDataInfo.value.lastname}`,
    //     horarios: horariosReservar,
    //     dni: userDataInfo.value.dni,
    //   })
    // });

    // const result = await response.json();

    const result = { success: true, reserva: 'Exitoso', error: 'prueba' };
    if (result.success) {
      emit('payment-result', { success: true, reserva: result.reserva, error: '' });
    } else {
      const errorMessage = result.error || 'Pago rechazado';
      emit('payment-result', { success: false, reserva: null, error: errorMessage });
    }

  } catch (err: any) {
    const errorMessage = err.message || 'Error procesando el pago';
    emit('payment-result', { success: false, reserva: null, error: errorMessage });
  } finally {
    loadingPayment.value = false;
    isOpenModal.value = false;
  }
};
</script>