<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="toast"
      :class="toastClass"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <ion-icon :name="iconName" class="toast-icon" :class="{ 'text-green-600': props.type === 'success', 'text-red-600': props.type === 'error' }"></ion-icon>
      <span class="toast-message" :class="{ 'text-green-600': props.type === 'success', 'text-red-600': props.type === 'error' }">{{ message }}</span>
      <button class="toast-close" @click="closeToast">
        <ion-icon name="close-outline"></ion-icon>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

const props = defineProps<{
  message: string;
  type?: "error" | "warning" | "info" | "success";
  duration?: number; // default 3000ms
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const visible = ref(true);
const timer = ref<number | null>(null);

const duration = computed(() => props.duration ?? 4000);

// Determinar ícono según tipo
const iconName = computed(() => {
  switch (props.type) {
    case "error":
      return "alert-circle-outline";
    case "warning":
      return "warning-outline";
    case "info":
      return "information-circle-outline";
    case "success":
      return "checkmark-circle-outline";
    default:
      return "information-circle-outline";
  }
});

// Determinar clase según tipo
const toastClass = computed(() => {
  return {
    "toast-error": props.type === "error",
    "toast-warning": props.type === "warning",
    "toast-info": props.type === "info",
    "toast-success": props.type === "success",
  };
});

function closeToast() {
  visible.value = false;
  emit("close");
}

function startTimer() {
  timer.value = window.setTimeout(() => {
    closeToast();
  }, duration.value);
}

function pauseTimer() {
  if (timer.value) clearTimeout(timer.value);
}

function resumeTimer() {
  startTimer();
}

onMounted(() => startTimer());
onUnmounted(() => {
  if (timer.value) clearTimeout(timer.value);
});
</script>

<style scoped>
/* === Base === */
.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 280px;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  color: #333;
  font-size: 14px;
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  animation: slide-up 0.3s ease;
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  display: flex;
  align-items: center;
}

.toast-close ion-icon {
  font-size: 18px;
}

/* === Colors === */
.toast-error {
  border-left: 5px solid #e74c3c;
}

.toast-warning {
  border-left: 5px solid #f1c40f;
}

.toast-info {
  border-left: 5px solid #3498db;
}

.toast-success {
  border-left: 5px solid #2ecc71;
}

/* === Transitions === */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slide-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
