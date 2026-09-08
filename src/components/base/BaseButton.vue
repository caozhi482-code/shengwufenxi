<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150',
      'ui-button',
      `ui-button--${variant || 'secondary'}`,
      `ui-button--${size || 'md'}`,
      baseClass,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="!disabled && emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  baseClass?: string;
}>();
const emit = defineEmits<{ click: [e: MouseEvent] }>();
</script>
