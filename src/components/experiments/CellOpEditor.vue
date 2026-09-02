<template>
  <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
    <div class="absolute inset-0 bg-black/30" @click="close" />
    <div class="relative ml-auto w-full max-w-2xl bg-white shadow-2xl flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b border-[--border]">
        <div>
          <h3 class="text-base font-bold text-[--foreground]">编辑格子执行说明</h3>
          <div class="text-xs text-[--muted-foreground] mt-0.5">格子位置：{{ cellRow }}{{ cellCol }}</div>
        </div>
        <button class="text-[--muted-foreground] hover:text-[--foreground]" @click="close">✕</button>
      </div>

      <div class="flex-1 overflow-y-auto p-5 space-y-3">
        <div v-for="(op, i) in operations" :key="op.id" class="border border-[--border] rounded-md p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[--muted-foreground]">执行说明 {{ i + 1 }}</span>
            <button v-if="!readOnly" class="text-xs text-[--danger] hover:underline" @click="removeOp(op.id)">删除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseFormField label="执行说明" placeholder="如：加内标工作液" v-model="op.action" :readonly="readOnly" required />
            <BaseFormField label="样品/溶液名称" placeholder="如：IS-WS" v-model="op.substance" :readonly="readOnly" />
            <BaseFormField label="样品编号" placeholder="如：STD8" v-model="op.sampleId" :readonly="readOnly" />
            <BaseFormField label="设备" placeholder="如：移液器-001" v-model="op.equipment" :readonly="readOnly" />
            <BaseFormField label="加入量" type="number" placeholder="如：30" v-model="op.volume" :readonly="readOnly" />
            <BaseFormField label="单位" placeholder="如：μL" v-model="op.unit" :readonly="readOnly" />
            <BaseFormField label="扫码对象" type="select" :options="scanObjectOptions" v-model="op.scanObject" :readonly="readOnly" />
            <BaseFormField
              label="是否必填"
              type="select"
              :options="requiredOptions"
              :modelValue="op.required ? 'true' : 'false'"
              :readonly="readOnly"
              @update:modelValue="op.required = $event === 'true'"
            />
            <BaseFormField label="关联步骤" placeholder="如：第 1 步" v-model="op.step" :readonly="readOnly" />
            <BaseFormField label="备注" type="textarea" placeholder="可选备注" v-model="op.note" :readonly="readOnly" class="col-span-2" />
          </div>
        </div>

        <button v-if="!readOnly" class="text-sm text-[--primary] hover:underline font-medium" @click="addOp">+ 新增执行说明</button>
      </div>

      <div class="px-5 py-4 border-t border-[--border] flex justify-end gap-2">
        <BaseButton variant="secondary" @click="close">取消</BaseButton>
        <BaseButton v-if="!readOnly" variant="primary" @click="saveOps">保存</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';

const props = defineProps<{
  open: boolean;
  readOnly?: boolean;
  cellRow: string;
  cellCol: number;
  operations: any[];
}>();

const emit = defineEmits<{
  close: [];
  save: [ops: any[]];
}>();

const operations = ref<any[]>([]);
const scanObjectOptions = [
  { label: '设备', value: 'device' },
  { label: '试剂', value: 'reagent' },
  { label: '样品', value: 'sample' },
  { label: '耗材', value: 'consumable' },
];
const requiredOptions = [
  { label: '必填', value: 'true' },
  { label: '选填', value: 'false' },
];

watch(
  () => props.open,
  (val) => {
    if (val) operations.value = JSON.parse(JSON.stringify(props.operations));
  },
  { immediate: true },
);

function addOp() {
  operations.value.push({
    id: `op-${Date.now()}`,
    action: '',
    substance: '',
    sampleId: '',
    volume: 0,
    unit: 'μL',
    scanned: false,
    equipment: '',
    scanObject: '',
    required: false,
    note: '',
    step: '',
  });
}

function removeOp(id: string) {
  operations.value = operations.value.filter(o => o.id !== id);
}

function saveOps() {
  emit('save', operations.value);
  emit('close');
}

function close() {
  emit('close');
}
</script>