<template>
  <div v-if="props.isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div v-if="isSuccess" class="success-message">
        <div class="success-icon">✓</div>
        <div>Payment successful! Thank you.</div>
      </div>

      <form v-else @submit.prevent="handlePayment" novalidate>
        <div class="card-preview" aria-hidden="true">
          <!-- Mostrar el nombre de la marca si es Visa / Mastercard / American Express -->
          <div class="card-logo">
            {{ displayBrandName }}
          </div>

          <div class="card-number-display">{{ cardDisplay }}</div>
          <div class="card-details">
            <div class="card-name">{{ nameDisplay }}</div>
            <div class="card-expiry">{{ expiryDisplay }}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nombre en la tarjeta</label>
          <input
            v-model="cardData.cardholderName"
            type="text"
            placeholder="John Doe"
            class="form-input"
          />
          <div v-if="errors.name" class="error-message">
            Por favor, introduce un nombre válido
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Número de tarjeta</label>
          <input
            v-model="cardData.cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            class="form-input"
          />
          <div v-if="errors.card" class="error-message">
            Por favor, introduce un número de tarjeta válido
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha de vencimiento</label>
            <input
              type="text"
              class="form-input"
              :value="`${cardData.expirationMonth ? cardData.expirationMonth.padStart(2, '0') : ''}${cardData.expirationYear ? '/' + cardData.expirationYear : ''}`"
              placeholder="MM/YYYY"
              maxlength="7"
              @input="handleExpiryInput"
            />
            <div v-if="errors.expiry" class="error-message">Fecha de vencimiento no válida</div>
          </div>

          <div class="form-group">
            <label class="form-label">CVV</label>
            <input
              v-model="cardData.securityCode"
              type="text"
              placeholder="123"
              maxlength="4"
              class="form-input"
            />
            <div v-if="errors.cvv" class="error-message">CVV no válido</div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <template v-if="isLoading">
            <span class="spinner"></span>
          </template>
          <template v-else>Pagar</template>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { CardData } from "../types/calendar";

const isLoading = ref(false);
const isSuccess = ref(false);

const cardData = ref<CardData>({
  cardNumber: "4111111111111111",
  cardholderName: "Juan Perez",
  identificationType: "DNI",
  expirationMonth: "11",
  expirationYear: "2028",
  securityCode: "123",
});

const errors = ref({
  name: false,
  card: false,
  expiry: false,
  cvv: false,
});

const props = defineProps<{
  isOpen: boolean;
}>();
const emit = defineEmits<{
  (e: "close-modal", payload: boolean): void;
  (e: "handle-payment", payload: CardData): void;
}>();

function detectCardBrand(number: string) {
  const n = (number || "").replace(/\s+/g, "");
  if (!n) return { brand: "desconocido", nice: "Desconocido" };

  const len = n.length;
  const first1 = Number(n.slice(0, 1)) || 0;
  const first2 = Number(n.slice(0, 2)) || 0;
  const first3 = Number(n.slice(0, 3)) || 0;
  const first4 = Number(n.slice(0, 4)) || 0;

  if (first1 === 4 && [13, 16, 19].includes(len))
    return { brand: "visa", nice: "Visa" };
  if (
    (first2 >= 51 && first2 <= 55 && len === 16) ||
    (first4 >= 2221 && first4 <= 2720 && len === 16)
  )
    return { brand: "mastercard", nice: "Mastercard" };
  if ((first2 === 34 || first2 === 37) && len === 15)
    return { brand: "amex", nice: "American Express" };
  if (
    ((first3 >= 300 && first3 <= 305) ||
      first2 === 36 ||
      first2 === 38 ||
      first2 === 39) &&
    len === 14
  )
    return { brand: "diners", nice: "Diners Club" };

  return { brand: "desconocido", nice: "Desconocido" };
}

const detectedBrand = ref({ brand: "desconocido", nice: "Desconocido" });

/* === COMPUTEDS === */
const cardDisplay = computed(() => {
  const clean = cardData.value.cardNumber.replace(/\s/g, "");
  if (!clean) return "•••• •••• •••• ••••";
  return clean.padStart(16, "•").replace(/(\d{4})(?=\d)/g, "$1 ");
});

const displayBrandName = computed(() => {
  const b = detectedBrand.value.brand;
  if (b === "visa" || b === "mastercard" || b === "amex") {
    return detectedBrand.value.nice;
  }
  return "desconocido";
});

const nameDisplay = computed(() => cardData.value.cardholderName || "Tu nombre");
const expiryDisplay = computed(() => {
  const { expirationMonth, expirationYear } = cardData.value;
  if (!expirationMonth && !expirationYear) return "MM/YYYY";
  const mm = expirationMonth.padStart(2, "0");
  return `${mm}/${expirationYear}`;
});

watch(
  () => cardData.value.securityCode,
  (val) => {
    cardData.value.securityCode = (val || "").replace(/\D/g, "").slice(0, 4);
  }
);

watch(
  () => cardData.value.cardNumber,
  (val) => {
    cardData.value.cardNumber = (val || "")
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .slice(0, 19);
    detectedBrand.value = detectCardBrand(cardData.value.cardNumber);
  },
  { immediate: true }
);

function handleExpiryInput(e: Event) {
  const target = e.target as HTMLInputElement;
  let clean = target.value.replace(/[^\d]/g, "").slice(0, 6);

  if (clean.length >= 3) {
    const mm = clean.slice(0, 2);
    const yyyy = clean.slice(2);
    target.value = `${mm}/${yyyy}`;
    cardData.value.expirationMonth = mm.padStart(2, "0");
    cardData.value.expirationYear = yyyy;
  } else {
    target.value = clean;
    if (clean.length >= 2) {
      cardData.value.expirationMonth = clean.slice(0, 2).padStart(2, "0");
    }
  }
}

function validateForm() {
  errors.value = { name: false, card: false, expiry: false, cvv: false };
  let valid = true;

  if (cardData.value.cardholderName.trim().length < 3) {
    errors.value.name = true;
    valid = false;
  }

  const digitsCard = cardData.value.cardNumber.replace(/\s/g, "");
  if (detectedBrand.value.brand === "amex") {
    if (digitsCard.length !== 15) {
      errors.value.card = true;
      valid = false;
    }
  } else if (digitsCard.length !== 16) {
    errors.value.card = true;
    valid = false;
  }

  const mm = Number(cardData.value.expirationMonth);
  const yyyy = Number(cardData.value.expirationYear);
  if (
    !(mm >= 1 && mm <= 12 && yyyy >= 1900 && yyyy <= 3000) ||
    !cardData.value.expirationMonth ||
    !cardData.value.expirationYear
  ) {
    errors.value.expiry = true;
    valid = false;
  }

  if (cardData.value.securityCode.length < 3) {
    errors.value.cvv = true;
    valid = false;
  }

  return valid;
}

function handlePayment() {
  if (!validateForm()) return;
  isLoading.value = true;
  emit("handle-payment", cardData.value);
}

function closeModal() {
  emit("close-modal", false);
  isSuccess.value = false;
  isLoading.value = false;
  cardData.value.cardholderName = "";
  cardData.value.cardNumber = "";
  cardData.value.expirationMonth = "";
  cardData.value.expirationYear = "";
  cardData.value.securityCode = "";
  errors.value = { name: false, card: false, expiry: false, cvv: false };
  detectedBrand.value = { brand: "desconocido", nice: "Desconocido" };
}
</script>


<style scoped>
* {
  box-sizing: border-box;
}

/* Button trigger */
.trigger-btn {
  padding: 12px 24px;
  background: white;
  color: #aa4a44;
  border: 2px solid #aa4a44;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}
.trigger-btn:hover {
  background: #aa4a44;
  color: white;
}

/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* Modal */
.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  padding: 24px;
  animation: slideIn 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form layout */
form {
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  font-family: "Courier New", monospace;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: white;
}
.form-input:focus {
  outline: none;
  border-color: #aa4a44;
  box-shadow: 0 0 0 3px var(--color-clay-light);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Card preview */
.card-preview {
  background: linear-gradient(
    135deg,
    #aa4a44 0%,
    #8b3a35 100%
  );
  border-radius: 10px;
  color: #fff;
  padding: 18px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  box-shadow: 0 6px 16px rgba(170, 74, 68, 0.3);
}
.card-logo {
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.card-number-display {
  font-family: "Courier New", monospace;
  font-size: 18px;
  letter-spacing: 2px;
  margin: 12px 0;
}
.card-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 12px;
  opacity: 0.9;
}

/* Error states */
.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

/* Security note */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 16px;
}
.security-badge::before {
  content: "🔒";
}

/* Button */
.submit-btn {
  width: 100%;
  padding: 12px;
  background: #aa4a44;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(170, 74, 68, 0.3);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success */
.success-message {
  text-align: center;
  padding: 24px;
  background: #ecfdf5;
  color: #047857;
  border-radius: 8px;
  margin-bottom: 16px;
}
.success-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

@media (max-width: 480px) {
  .modal {
    max-width: 90%;
    padding: 20px;
  }
}
</style>