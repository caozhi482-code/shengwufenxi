<template>
  <div class="ui-step-wizard flex gap-3">
    <div v-for="(step, i) in steps" :key="i" class="flex items-center gap-2 flex-1 last:flex-none">
      <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
        i < current ? 'bg-[--primary] text-white' :
        i === current ? 'bg-[--primary] text-white ring-2 ring-[--primary-soft] ring-offset-1' :
        'bg-[--neutral-soft] text-[--text-tertiary]']">
        {{ i < current ? '✓' : i + 1 }}
      </div>
      <div class="hidden sm:block">
        <div :class="['text-xs font-semibold', i <= current ? 'text-[--text-main]' : 'text-[--text-tertiary]']">{{ step.label }}</div>
        <div v-if="step.sub" class="text-[10px] text-[--text-tertiary]">{{ step.sub }}</div>
      </div>
      <div v-if="i < steps.length - 1" class="flex-1 h-px bg-[--border] mx-1 hidden sm:block" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ steps: { label: string; sub?: string }[]; current: number }>();
</script>
