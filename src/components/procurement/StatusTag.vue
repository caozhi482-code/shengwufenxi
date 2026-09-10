<template>
  <BaseTag :label="label" :tone="toneMap[status] || 'neutral'" />
</template>

<script setup lang="ts">
import BaseTag from '@/components/base/BaseTag.vue';

defineProps<{
  status: string;
  label: string;
}>();

const toneMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'info',
  rejected: 'danger',
  withdrawn: 'neutral',
  purchasing: 'info',
  received: 'success',
  completed: 'success',
};
</script>
