<template>
  <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
    <div class="absolute inset-0 bg-black/30" @click="emit('close')" />
    <div class="relative ml-auto w-full max-w-lg bg-white shadow-2xl flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b border-[--border]">
        <h3 class="text-base font-bold text-[--foreground]">{{ title }}</h3>
        <button class="text-[--muted-foreground] hover:text-[--foreground]" @click="emit('close')">✕</button>
      </div>
      <div class="flex-1 overflow-y-auto p-5">
        <slot />
      </div>
      <div v-if="$slots.footer" class="px-5 py-4 border-t border-[--border] flex justify-end gap-2">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; open: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>
