<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/30" @click="open = false" />
    <div class="relative bg-white rounded-[--radius-lg] shadow-2xl w-full max-w-sm p-6">
      <p class="text-sm text-[--text-main] mb-6">{{ message }}</p>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" size="sm" @click="handleCancel">取消</BaseButton>
        <BaseButton :variant="danger ? 'danger' : 'primary'" size="sm" @click="handleConfirm">确认</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from './BaseButton.vue';
defineProps<{ message: string; danger?: boolean }>();
const open = ref(true);
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const handleConfirm = () => { open.value = false; emit('confirm'); };
const handleCancel = () => { open.value = false; emit('cancel'); };
</script>
