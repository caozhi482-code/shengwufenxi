<template>
  <span :class="[
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
    toneClass
  ]">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
defineProps<{ tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral'; label?: string }>();
const toneClass: Record<string, string> = {
  success: 'bg-[--primary-soft] text-[--primary] border border-[--primary-soft-border]',
  info: 'bg-[--info-soft] text-[--info] border border-[--info-border]',
  warning: 'bg-[--warning-soft] text-[--warning] border border-[--warning-border]',
  danger: 'bg-[--danger-soft] text-[--danger] border border-[--danger-border]',
  neutral: 'bg-[--neutral-soft] text-[--neutral-text] border border-[--neutral-border]',
};
</script>
