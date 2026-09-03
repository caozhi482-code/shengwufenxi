<template>
  <input
    type="checkbox"
    class="h-4 w-4 rounded border-[--border] bg-white text-[--primary] accent-[--primary] cursor-pointer focus:ring-1 focus:ring-[--primary] focus:ring-offset-0"
    :checked="checked"
    :disabled="disabled"
    @change="$emit('update:checked', ($event.target as HTMLInputElement).checked)"
  />
</template>

<script setup lang="ts">
defineProps<{
  checked: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()
</script>
