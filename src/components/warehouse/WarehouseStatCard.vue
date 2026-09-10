<template>
  <div :class="['ui-summary-card bg-white border border-[--border] rounded-[10px] shadow-sm p-4 flex items-center gap-4', className]">
    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconBg]">
      <slot name="icon">
        <component :is="icon" :size="18" :stroke-width="2" />
      </slot>
    </div>
    <div class="min-w-0 flex-1">
      <div class="text-xs text-[--muted-foreground] mb-0.5">{{ label }}</div>
      <div :class="['text-xl font-bold truncate', valueColor]">{{ value }}</div>
      <div v-if="sub" class="text-xs text-[--muted-foreground] mt-0.5">{{ sub }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Package, ShoppingCart, CheckCircle2, TrendingUp, LayoutGrid } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  label: string;
  value: string | number;
  sub?: string;
  icon?: unknown;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}>(), {
  tone: 'neutral',
  className: '',
});

const iconMap: Record<string, unknown> = {
  primary: Package,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: ArrowDownRight,
  info: ArrowUpRight,
  neutral: LayoutGrid,
};

const resolvedIcon = computed(() => props.icon || iconMap[props.tone]);

const iconBgMap: Record<string, string> = {
  primary: 'bg-[--primary-soft] text-[--primary]',
  success: 'bg-[--success-soft] text-[--success]',
  warning: 'bg-[--warning-soft] text-[--warning]',
  danger: 'bg-[--danger-soft] text-[--danger]',
  info: 'bg-[--info-soft] text-[--info]',
  neutral: 'bg-[--neutral-soft] text-[--muted-foreground]',
};

const valueColorMap: Record<string, string> = {
  primary: 'text-[--primary]',
  success: 'text-[--success]',
  warning: 'text-[--warning]',
  danger: 'text-[--danger]',
  info: 'text-[--info]',
  neutral: 'text-[--foreground]',
};

const iconBg = computed(() => iconBgMap[props.tone]);
const valueColor = computed(() => valueColorMap[props.tone]);
</script>
