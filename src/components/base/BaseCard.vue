<template>
  <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-5">
    <div v-if="$slots.header" class="flex items-center gap-2 mb-4 pb-3 border-b border-[--border]">
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-[--border] flex justify-end gap-2">
      <slot name="footer" />
    </div>
  </div>
</template>
