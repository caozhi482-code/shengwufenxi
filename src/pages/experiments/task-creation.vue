<template>
  <div class="space-y-5">
    <!-- 计划上下文 -->
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 flex items-center gap-6 flex-wrap">
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">计划编号</div>
        <div class="text-sm font-bold text-[--foreground]">{{ planCode }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">项目名称</div>
        <div class="text-sm font-medium text-[--text-main]">{{ planName }}</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">方案版本</div>
        <div class="text-sm font-medium text-[--text-main]">MV-2025-048 / 1V</div>
      </div>
      <div class="w-px h-10 bg-[--border]" />
      <div>
        <div class="text-xs text-[--muted-foreground] mb-0.5">方法文件</div>
        <div class="text-sm font-medium text-[--text-main]">BRH-MN-202506059 / VAL1</div>
      </div>
    </div>

    <!-- 左侧：方法文件 + 右侧：表单区 -->
    <div class="grid grid-cols-3 gap-5">
      <!-- 左侧：方法文件步骤 -->
      <div class="col-span-1 space-y-5">
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">方法文件步骤</span>
          </template>
          <BaseFormField label="方法文件" type="select" :options="methodOptions" v-model="selectedMethodId" class="mb-3" />
          <div class="space-y-2 mt-3 max-h-[400px] overflow-y-auto">
            <div
              v-for="step in currentSteps"
              :key="step.seq"
              :class="['p-3 rounded-md border cursor-pointer transition-all',
                editingStepId === String(step.seq) ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-[--surface-muted] hover:border-[--border-strong]']"
              @click="editingStepId = String(step.seq)"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="w-5 h-5 rounded-full bg-[--primary] text-white text-xs font-bold flex items-center justify-center">{{ step.seq }}</span>
                <span class="text-xs font-semibold text-[--text-main]">第{{ step.seq }}步</span>
                <span v-if="step.expected.length" class="text-xs text-[--warning] font-medium">
                  {{ step.expected.map(e => `${e.value}${e.unit}`).join('、') }}
                </span>
              </div>
              <div class="text-xs text-[--muted-foreground] leading-relaxed pl-7">{{ step.action }}</div>
              <div v-if="step.notes" class="text-[10px] text-[--muted-foreground] mt-1 pl-7 bg-yellow-50 rounded px-1.5 py-0.5">⚠ {{ step.notes }}</div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-[--border]">
            <BaseButton variant="secondary" size="sm" class="w-full" @click="uploadMethod">上传方法文件</BaseButton>
          </div>
        </BaseCard>

        <!-- 步骤编排 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-[--foreground]">步骤编排</span>
              <div class="flex gap-2 items-center">
                <span v-if="steps.length === 0" class="text-xs text-[--danger]">至少保留一个步骤</span>
                <BaseButton variant="primary" size="sm" @click="addStep">+ 新增步骤</BaseButton>
              </div>
            </div>
          </template>
          <div v-if="steps.length === 0" class="text-center py-8 text-[--muted-foreground] text-sm">
            暂无步骤，请从左侧方法文件选择步骤或手动新增
          </div>
          <div v-for="(step, index) in steps" :key="step.id" class="mb-3 border border-[--border] rounded-md overflow-hidden">
            <div class="flex items-center gap-2 px-4 py-3 bg-[--surface-muted] border-b border-[--border]">
              <span class="w-6 h-6 rounded-full bg-[--primary] text-white text-xs font-bold flex items-center justify-center shrink-0">{{ step.seq }}</span>
              <input v-model="step.action" class="flex-1 text-sm font-medium bg-transparent outline-none border-b border-dashed border-transparent focus:border-[--primary] px-1" placeholder="输入步骤动作文本" />
              <div class="flex items-center gap-1 shrink-0">
                <button :disabled="index === 0" class="p-1 rounded hover:bg-[--neutral-soft] disabled:opacity-30" @click="moveStep(index, -1)" title="上移">↑</button>
                <button :disabled="index === steps.length - 1" class="p-1 rounded hover:bg-[--neutral-soft] disabled:opacity-30" @click="moveStep(index, 1)" title="下移">↓</button>
                <button class="p-1 rounded hover:bg-[--danger-soft] text-[--danger]" @click="deleteStep(step.id)" title="删除">🗑</button>
              </div>
            </div>
            <div class="p-4 space-y-3">
              <div>
                <div class="text-xs font-semibold text-[--text-main] mb-1.5">预期值</div>
                <div class="flex flex-wrap gap-2">
                  <div v-for="(exp, ei) in step.expected" :key="ei" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-[--warning-soft] text-[--warning] text-xs font-semibold border border-[--warning-border]">
                    {{ exp.value }} {{ exp.unit }}
                    <button class="ml-0.5 text-[--warning] hover:text-[--danger]" @click="removeExpected(step.id, ei)">×</button>
                  </div>
                  <button class="text-xs text-[--info] hover:underline" @click="addExpected(step.id)">+ 添加预期值</button>
                </div>
                <div v-if="addingExpectedId === step.id" class="mt-2 flex gap-2 items-center">
                  <input v-model="newExpectedValue" type="number" placeholder="数值" class="w-20 px-2 py-1 border border-[--border] rounded text-sm" />
                  <input v-model="newExpectedUnit" type="text" placeholder="单位（如 μL）" class="w-24 px-2 py-1 border border-[--border] rounded text-sm" />
                  <BaseButton variant="primary" size="sm" @click="confirmAddExpected(step.id)">确认</BaseButton>
                  <BaseButton variant="secondary" size="sm" @click="cancelAddExpected">取消</BaseButton>
                </div>
              </div>
              <div>
                <div class="text-xs font-semibold text-[--text-main] mb-1.5">扫码对象</div>
                <div class="space-y-1.5">
                  <div v-for="objType in ['device', 'reagent', 'sample', 'consumable']" :key="objType">
                    <div class="text-xs text-[--muted-foreground] mb-1">{{ objTypeLabels[objType] }}</div>
                    <div class="flex flex-wrap gap-1.5">
                      <label v-for="opt in scanOptions[objType]" :key="opt.value" class="inline-flex items-center gap-1 px-2 py-1 border border-[--border] rounded text-xs cursor-pointer hover:bg-[--surface-muted]">
                        <BaseCheckbox :checked="step.scanObjects.some(s => s.type === opt.value)" @update:checked="step.scanObjects = step.scanObjects.some(s => s.type === opt.value) ? step.scanObjects.filter(s => s.type !== opt.value) : [...step.scanObjects, { type: opt.value as any, name: opt.label }]" />
                        {{ opt.label }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <BaseFormField label="备注 / 例外说明" type="textarea" placeholder="如 Solvent/DB 加稀释液2" v-model="step.notes" />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 右侧：任务基础信息 + 表单卡片 -->
      <div class="col-span-2 space-y-5">
        <!-- 任务基础信息 -->
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">任务基础信息</span>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <BaseFormField label="任务名称" placeholder="请输入任务名称" v-model="formRef.taskName" :error="errors.taskName" required />
            <BaseFormField label="考察项" type="select" :options="evaluationOptions" v-model="formRef.itemCode" :error="errors.itemCode" required />
            <BaseFormField label="任务类型" type="select" :options="taskTypeOptions.map(t => ({ label: t.label, value: t.value }))" v-model="formRef.taskType" :error="errors.taskType" required />
            <BaseFormField label="实验负责人" type="select" :options="personOptions.map(p => ({ label: p.label, value: p.value }))" v-model="formRef.responsiblePerson" :error="errors.responsiblePerson" required />
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-[--text-main] mb-1.5">实验员 <span class="text-[--danger]">*</span></label>
              <div class="flex flex-wrap gap-2">
                <label v-for="p in personOptions" :key="p.value" class="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm cursor-pointer transition-colors hover:bg-[--surface-muted]"
                  :class="formRef.investigators.includes(p.value) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'">
                  <BaseCheckbox :checked="formRef.investigators.includes(p.value)" @update:checked="toggleField('investigators', p.value)" />
                  {{ p.label }}
                </label>
              </div>
              <div v-if="errors.investigators" class="text-xs text-[--danger] mt-1">{{ errors.investigators }}</div>
            </div>
            <BaseFormField label="计划日期" type="date" v-model="formRef.planDate" :error="errors.planDate" required />
            <BaseFormField label="样本批次" placeholder="如 BL-2026-001" v-model="formRef.sampleBatch" :error="errors.sampleBatch" required />
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-[--text-main] mb-1.5">仪器 <span class="text-[--danger]">*</span></label>
              <div class="flex flex-wrap gap-2">
                <label v-for="inst in instrumentOptions" :key="inst.value" class="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-sm cursor-pointer transition-colors hover:bg-[--surface-muted]"
                  :class="formRef.instruments.includes(inst.value) ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'">
                  <BaseCheckbox :checked="formRef.instruments.includes(inst.value)" @update:checked="toggleField('instruments', inst.value)" />
                  {{ inst.label }}
                </label>
              </div>
              <div v-if="errors.instruments" class="text-xs text-[--danger] mt-1">{{ errors.instruments }}</div>
            </div>
          </div>
        </BaseCard>

        <!-- 表单卡片列表（选择考察项后自动带出） -->
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">
              表单配置
              <span v-if="formCards.length > 0" class="text-xs font-normal text-[--muted-foreground] ml-2">
                （{{ formCards.filter(c => c.status === 'done').length }}/{{ formCards.length }} 已配置）
              </span>
              <span v-else class="text-xs font-normal text-[--danger] ml-2">请先选择考察项</span>
            </span>
          </template>
          <div v-if="formCards.length === 0" class="py-6 text-center text-[--muted-foreground] text-sm">
            请选择考察项后自动带出绑定的表单模板
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <div
              v-for="card in formCards"
              :key="card.id"
              class="border rounded-lg p-4 transition-all"
              :class="card.status === 'done' ? 'border-[--success-border] bg-[--success-soft]' : card.status === 'editing' ? 'border-[--warning-border] bg-[--warning-soft]' : 'border-[--border] bg-[--surface-muted]'"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <div class="text-sm font-semibold text-[--text-main]">{{ card.name }}</div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">
                    {{ card.grid.rows.join('') }} × {{ card.grid.cols }} 格子
                  </div>
                </div>
                <BaseTag :tone="card.statusTag.tone" :label="card.statusTag.label" />
              </div>
              <div class="text-[10px] text-[--muted-foreground] mb-3">
                字段：{{ card.fields.join('、') }}
              </div>
              <BaseButton variant="primary" size="sm" class="w-full" @click="editFormCard(card)">
                {{ card.status === 'done' ? '重新编辑' : '编辑表单' }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- 底部操作 -->
        <div class="flex justify-between items-center">
          <BaseButton variant="secondary" @click="goBack">取消</BaseButton>
          <div class="flex gap-2">
            <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
            <BaseButton variant="primary" :disabled="!canSave" @click="saveAndPublish">保存并发布</BaseButton>
          </div>
        </div>
        <div v-if="!canSave" class="text-xs text-[--danger]">请填写所有必填项：任务名称、考察项、实验负责人、实验员、计划日期；表单至少配置一项</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import { methods, formTemplates, scanObjectOptions, taskTypeOptions, personOptions, instrumentOptions } from '@/api/mock/methods';
import { evaluationItems } from '@/api/mock/evaluation';
import type { TaskStep, FormCell } from '@/types/experiments';

const router = useRouter();
const route = useRoute();
const selectedMethodId = ref('M001');
const planCode = (route.params.id as string).toUpperCase();
const planName = '布洛芬 bio 分析';

const methodOptions = methods.map(m => ({ label: `${m.code} / ${m.version} - ${m.name}`, value: m.id }));
const evaluationOptions = evaluationItems.map(e => ({ label: `${e.id} ${e.name}`, value: e.id }));
const objTypeLabels: Record<string, string> = { device: '设备', reagent: '试剂', sample: '样品', consumable: '耗材' };
const scanOptions = scanObjectOptions;

const currentSteps = computed(() => {
  const m = methods.find(m => m.id === selectedMethodId.value);
  return m ? m.steps : [];
});

const steps = ref<TaskStep[]>([]);

watch(selectedMethodId, () => {
  const m = methods.find(m => m.id === selectedMethodId.value);
  if (m) {
    steps.value = m.steps.map((s, i) => ({
      ...s,
      id: `S${i + 1}`,
      scanObjects: s.scanObjects.map(t => ({ type: t as any, name: `${t}-${i + 1}` })),
    }));
  }
});

// 表单卡片：根据选择的考察项自动带出
const formCards = computed(() => {
  if (!formRef.value.itemCode) return [];
  const item = evaluationItems.find(e => e.id === formRef.value.itemCode);
  if (!item) return [];
  return item.formTemplates.map(name => {
    const ft = formTemplates.find(f => f.name === name);
    const editedKeys = Object.keys(formEditState.value);
    const isEdited = editedKeys.some(k => k.includes(name));
    const allDone = isEdited && editedKeys.some(k => k.includes(name) && formEditState.value[k]);
    return {
      id: name,
      name,
      grid: ft ? { rows: ft.grid.rows, cols: ft.grid.cols } : { rows: ['A', 'B', 'C'], cols: 6 },
      cellLabel: ft?.cellLabel ?? 'none',
      fields: ft?.fields ?? [],
      status: allDone ? 'done' : isEdited ? 'editing' : 'unedit',
      statusTag: allDone ? { tone: 'success' as const, label: '已编辑' }
        : isEdited ? { tone: 'warning' as const, label: '编辑中' }
        : { tone: 'neutral' as const, label: '未编辑' },
    };
  });
});

const formRef = ref({
  taskName: '', itemCode: '', taskType: '', responsiblePerson: '武琴',
  investigators: ['李依璇'] as string[], planDate: '', sampleBatch: '', instruments: [] as string[],
});
const errors = ref<Record<string, string>>({});

const formEditState = ref<Record<string, boolean>>({});

const canSave = computed(() => {
  const v = formRef.value;
  const hasFormConfig = formCards.value.some(c => c.status === 'done' || formEditState.value[c.id]);
  return v.taskName.trim() && v.itemCode && v.responsiblePerson
    && v.investigators.length > 0 && v.planDate && v.sampleBatch && v.instruments.length > 0
    && hasFormConfig;
});

function validate(): boolean {
  const e: Record<string, string> = {};
  if (!formRef.value.taskName.trim()) e.taskName = '请输入任务名称';
  if (!formRef.value.itemCode) e.itemCode = '请选择考察项';
  if (!formRef.value.responsiblePerson) e.responsiblePerson = '请选择实验负责人';
  if (formRef.value.investigators.length === 0) e.investigators = '请选择至少一名实验员';
  if (!formRef.value.planDate) e.planDate = '请选择计划日期';
  if (!formRef.value.sampleBatch.trim()) e.sampleBatch = '请输入样本批次';
  if (formRef.value.instruments.length === 0) e.instruments = '请选择至少一台仪器';
  errors.value = e;
  return Object.keys(e).length === 0;
}

function editFormCard(card: any) {
  const itemId = formRef.value.itemCode;
  router.push(`/experiments/tasks/T001/forms/${card.id}?itemCode=${itemId}`);
}

function addStep() {
  const newId = `S${Date.now()}`;
  steps.value.push({ id: newId, seq: steps.value.length + 1, action: '', expected: [], scanObjects: [] as any, requiredFields: ['actualVolume', 'time'], notes: '' });
}
function deleteStep(id: string) {
  if (steps.value.length <= 1) return;
  if (!confirm('确定删除此步骤？')) return;
  steps.value = steps.value.filter(s => s.id !== id).map((s, i) => ({ ...s, seq: i + 1 }));
}
function moveStep(index: number, dir: number) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= steps.value.length) return;
  [steps.value[index], steps.value[newIndex]] = [steps.value[newIndex], steps.value[index]];
  steps.value = steps.value.map((s, i) => ({ ...s, seq: i + 1 }));
}

function toggleField(field: 'investigators' | 'instruments', value: string) {
  const arr = (formRef.value as any)[field];
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(value);
  (formRef.value as any)[field] = arr;
}

const editingStepId = ref<string | null>(null);
const addingExpectedId = ref<string | null>(null);
const newExpectedValue = ref<number>(0);
const newExpectedUnit = ref<string>('μL');

function addExpected(stepId: string) { addingExpectedId.value = stepId; newExpectedValue.value = 0; newExpectedUnit.value = 'μL'; }
function confirmAddExpected(stepId: string) {
  const step = steps.value.find(s => s.id === stepId);
  if (step && newExpectedValue.value > 0) step.expected.push({ value: newExpectedValue.value, unit: newExpectedUnit.value });
  addingExpectedId.value = null;
}
function cancelAddExpected() { addingExpectedId.value = null; }
function removeExpected(stepId: string, index: number) {
  const step = steps.value.find(s => s.id === stepId);
  if (step) step.expected.splice(index, 1);
}

function saveDraft() { if (!validate()) return; alert('草稿已保存'); router.push(`/experiments/plans/${planCode}/tasks`); }
function saveAndPublish() { if (!validate()) return; alert('任务已保存并发布'); router.push(`/experiments/plans/${planCode}/tasks`); }
function goBack() { router.push(`/experiments/plans/${planCode}/tasks`); }
function uploadMethod() { /* mock */ }
</script>
