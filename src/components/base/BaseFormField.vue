<template>
  <div class="w-full">
    <label v-if="label" class="block text-xs font-semibold text-[--text-main] mb-1.5">
      {{ label }}
      <span v-if="required" class="text-[--danger] ml-0.5">*</span>
    </label>
    <div class="relative">
      <input
        v-if="(type ?? 'text') === 'text' || type === 'number'"
        :type="type === 'number' ? 'number' : 'text'"
        v-model="model"
        :placeholder="placeholder"
        :readonly="readonly"
        class="w-full px-3 py-2 border border-[--border] rounded-md text-sm outline-none bg-white transition-all duration-150 focus:border-[--primary] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] placeholder:text-[--text-tertiary]"
        @input="$emit('update:modelValue', type === 'number' ? (parseFloat(($event.target as HTMLInputElement).value) || 0) : ($event.target as HTMLInputElement).value)"
      />
      <select
        v-else-if="type === 'select'"
        v-model="model"
        :class="['w-full px-3 py-2 border border-[--border] rounded-md text-sm outline-none bg-white appearance-none transition-all duration-150 focus:border-[--primary] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)]', error ? 'border-[--danger]' : '']"
      >
        <option value="">{{ required ? (placeholder || '请选择') : (placeholder || '不选择') }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input
        v-else-if="type === 'date'"
        type="date"
        v-model="model"
        class="w-full px-3 py-2 border border-[--border] rounded-md text-sm outline-none bg-white transition-all duration-150 focus:border-[--primary] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)]"
      />
      <input
        v-else-if="type === 'datetime-local'"
        type="datetime-local"
        v-model="model"
        class="w-full px-3 py-2 border border-[--border] rounded-md text-sm outline-none bg-white transition-all duration-150 focus:border-[--primary] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)]"
      />
      <textarea
        v-else-if="type === 'textarea'"
        v-model="model"
        :placeholder="placeholder"
        rows="3"
        class="w-full px-3 py-2 border border-[--border] rounded-md text-sm outline-none bg-white transition-all duration-150 focus:border-[--primary] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] placeholder:text-[--text-tertiary] resize-vertical"
      />
      <div v-else-if="type === 'radio'" class="flex gap-4 flex-wrap">
        <label v-for="opt in options" :key="opt.value" class="inline-flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" :value="opt.value" v-model="model" class="accent-[--primary]" />
          {{ opt.label }}
        </label>
      </div>
      <div v-if="error" class="text-xs text-[--danger] mt-1">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'datetime-local' | 'textarea' | 'radio';
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  options?: { label: string; value: string | number }[];
  error?: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [v: any] }>();
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
</script>
