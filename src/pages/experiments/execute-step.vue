<template>
  <div class="flex gap-5 h-[calc(100vh-140px)]">
    <!-- 左侧步骤导航 -->
    <div class="w-48 shrink-0 bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4">
      <div class="text-sm font-bold text-[--foreground] mb-4">执行步骤</div>
      <div class="space-y-1">
        <div v-for="(step, i) in steps" :key="i"
          :class="['flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-all',
            currentStep === i ? 'bg-[--primary-soft] border border-[--primary-border] text-[--primary]' :
            i < currentStep ? 'bg-[--surface-muted] text-[--primary]' :
            'text-[--muted-foreground] hover:bg-[--neutral-soft]']"
          @click="i <= currentStep && (currentStep = i)">
          <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            i < currentStep ? 'bg-[--primary] text-white' :
            i === currentStep ? 'bg-[--primary] text-white' :
            'bg-[--neutral-soft] text-[--text-tertiary]']">
            {{ i < currentStep ? '✓' : i + 1 }}
          </div>
          <div class="text-xs font-medium leading-tight">{{ step.label }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="flex-1 flex flex-col gap-4 overflow-y-auto">
      <!-- 顶部 chips -->
      <div class="flex gap-2 flex-wrap">
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[--primary-soft] text-[--primary] border border-[--primary-soft-border]">
          📋 分析方法 VAL1
        </span>
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[--info-soft] text-[--info] border border-[--info-border]">
          📄 预处理记录表
        </span>
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[--neutral-soft] text-[--neutral-text] border border-[--neutral-border]">
          🔬 基质样品预处理-蛋白沉淀法
        </span>
      </div>

      <!-- 当前步骤内容 -->
      <BaseCard>
        <div class="mb-4">
          <div class="text-base font-bold text-[--foreground] mb-1">{{ currentStepData.action }}</div>
          <div class="text-sm text-[--muted-foreground]">{{ currentStepData.notes }}</div>
        </div>

        <!-- 预期值标签 -->
        <div class="flex gap-2 flex-wrap mb-4">
          <span v-for="exp in currentStepData.expected" :key="exp.value"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[--warning-soft] text-[--warning] text-sm font-semibold border border-[--warning-border]">
            预期 {{ exp.value }} {{ exp.unit }}
          </span>
        </div>

        <!-- 扫码区 -->
        <div v-if="currentStepData.scanObjects.length > 0" class="mb-5">
          <div class="text-sm font-semibold text-[--text-main] mb-3">扫码对象</div>
          <ScanArea :objects="scanObjects" @scan="handleScan" />
        </div>

        <!-- 记录区 -->
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField
            v-for="field in currentStepData.requiredFields"
            :key="field"
            :label="fieldLabels[field]"
            :type="(fieldTypes[field] as 'text' | 'number' | 'select' | 'date' | 'datetime-local' | 'textarea' | 'radio')"
            :required="true"
            :error="fieldErrors[field]"
            v-model="formData[field]"
          />
        </div>

        <!-- 偏差提示 -->
        <div v-if="deviationWarning" class="mt-4 p-3 rounded-md bg-[--warning-soft] border border-[--warning-border] text-sm text-[--warning]">
          ⚠️ 实际值与预期值存在偏差，请填写备注说明原因
        </div>

        <!-- 备注 -->
        <div v-if="deviationWarning" class="mt-3">
          <BaseFormField label="偏差备注" type="textarea" placeholder="请说明偏差原因" v-model="formData['deviationNote']" />
        </div>
      </BaseCard>

      <!-- 操作按钮 -->
      <div class="flex justify-between items-center">
        <BaseButton variant="secondary" :disabled="currentStep === 0" @click="prevStep">上一步</BaseButton>
        <div class="flex gap-2">
          <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
          <BaseButton variant="primary" :disabled="!canNext" @click="nextStep">
            {{ currentStep === steps.length - 1 ? '提交复核' : '下一步' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import ScanArea from '@/components/experiments/ScanArea.vue';
import { methods } from '@/api/mock/methods';

const route = useRoute();
const method = methods[0]; // VAL1
const currentStep = ref(0);

const steps = computed(() => method.steps.map((s: any, i: number) => ({
  label: `第${i + 1}步 ${s.action.slice(0, 12)}${s.action.length > 12 ? '...' : ''}`,
  status: i < currentStep.value ? 'done' : i === currentStep.value ? 'current' : 'pending',
})));

const currentStepData = computed(() => method.steps[currentStep.value]);

const fieldLabels: Record<string, string> = {
  actualVolume: '实际体积', actualVolume1: '实际体积1', actualVolume2: '实际体积2',
  time: '操作时间', environment: '环境条件',
  vortexTime: '涡旋时间 (min)', centrifugeRpm: '离心转速 (rpm)', centrifugeTime: '离心时间 (min)',
  lightType: '光源类型', temperature: '温度 (℃)', humidity: '湿度 (%)',
  startTime: '开始时间', endTime: '结束时间', deviationNote: '偏差备注',
};
const fieldTypes: Record<string, string> = {
  actualVolume: 'number', actualVolume1: 'number', actualVolume2: 'number',
  time: 'datetime-local', environment: 'select',
  vortexTime: 'number', centrifugeRpm: 'number', centrifugeTime: 'number',
  lightType: 'select', temperature: 'number', humidity: 'number',
  startTime: 'datetime-local', endTime: 'datetime-local', deviationNote: 'textarea',
};

const formData = ref<Record<string, any>>({});
const fieldErrors = ref<Record<string, string>>({});
const scannedObjects = ref<Set<string>>(new Set());

const scanObjects = computed(() =>
  currentStepData.value.scanObjects.map((type: string, i: number) => ({
    id: `${type}-${i}`,
    name: type === 'reagent' ? '内标工作液 IS-WS' : type === 'sample' ? '基质样品' : '移液器-001',
    code: 'CODE-' + String(1000 + i),
    batch: 'BATCH-' + String(2026001 + i),
    scanned: scannedObjects.value.has(`${type}-${i}`),
  }))
);

function handleScan(obj: any) { scannedObjects.value.add(obj.id); }

const deviationWarning = computed(() => {
  const expected = currentStepData.value.expected;
  if (expected.length === 0) return false;
  const actual = formData.value['actualVolume'] ?? formData.value['actualVolume1'];
  if (!actual) return false;
  return Math.abs(actual - expected[0].value) > 2;
});

const canNext = computed(() => {
  for (const field of currentStepData.value.requiredFields) {
    if (field === 'deviationNote') continue;
    if (!formData.value[field]) return false;
  }
  return true;
});

function prevStep() { if (currentStep.value > 0) currentStep.value--; }
function nextStep() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  } else {
    alert('已提交复核');
  }
}
function saveDraft() { /* mock */ }
</script>
