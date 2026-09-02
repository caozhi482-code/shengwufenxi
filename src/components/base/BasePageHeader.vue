<template>
  <div class="mb-5">
    <div v-if="title" class="text-xl font-bold text-[--foreground] tracking-tight">{{ title }}</div>
    <div v-if="subtitle" class="text-sm text-[--muted-foreground] mt-1">{{ subtitle }}</div>
    <div v-if="$slots.extra" class="mt-2 flex gap-2 flex-wrap">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string; subtitle?: string }>();
</script>
