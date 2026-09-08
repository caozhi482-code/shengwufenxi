<template>
  <div class="ui-summary grid grid-cols-2 xl:grid-cols-4 gap-4">
    <div v-for="(card, i) in cards" :key="i" class="ui-summary-item bg-white p-5 border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)]">
      <div class="text-xs text-[--muted-foreground] mb-1">{{ card.label }}</div>
      <div :class="['text-2xl font-bold', card.color || 'text-[--foreground]']">{{ card.value }}</div>
      <div v-if="card.sub" class="text-xs text-[--muted-foreground] mt-1">{{ card.sub }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cards: { label: string; value: string | number; sub?: string; color?: string }[];
}>();
</script>
