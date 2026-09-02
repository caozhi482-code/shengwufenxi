<template>
  <div class="space-y-3">
    <div v-for="obj in objects" :key="obj.id"
      :class="['flex items-center gap-3 p-3 rounded-md border transition-all',
        obj.scanned ? 'border-[--primary-border] bg-[--primary-soft]' : 'border-[--border] bg-white']">
      <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        obj.scanned ? 'bg-[--primary] text-white' : 'bg-[--neutral-soft] text-[--muted-foreground]']">
        <svg v-if="obj.scanned" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-[--text-main]">{{ obj.name }}</div>
        <div v-if="obj.scanned" class="text-xs text-[--muted-foreground] mt-0.5">
          编号：{{ obj.code }} · 批号：{{ obj.batch }}
        </div>
      </div>
      <BaseButton v-if="!obj.scanned" variant="primary" size="sm" @click="$emit('scan', obj)">扫码</BaseButton>
      <BaseTag v-else tone="success">已扫码</BaseTag>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
defineProps<{ objects: { id: string; name: string; code?: string; batch?: string; scanned: boolean }[] }>();
defineEmits<{ scan: [obj: any] }>();
</script>
