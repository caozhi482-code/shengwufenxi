<template>
  <div class="space-y-5 pb-24">
    <!-- 顶部任务信息 -->
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-3">
      <div v-if="task" class="flex items-center gap-4 mb-3">
        <div>
          <div class="text-xs text-[--muted-foreground]">任务编号</div>
          <div class="text-sm font-bold text-[--foreground]">{{ task.id }}</div>
        </div>
        <div class="w-px h-8 bg-[--border]" />
        <div>
          <div class="text-xs text-[--muted-foreground]">任务名称</div>
          <div class="text-sm font-medium text-[--text-main]">{{ task.taskName }}</div>
        </div>
        <div class="w-px h-8 bg-[--border]" />
        <div>
          <div class="text-xs text-[--muted-foreground]">考察项</div>
          <div class="text-sm font-medium text-[--text-main]">{{ task.itemCode }} {{ task.itemName }}</div>
        </div>
        <div class="w-px h-8 bg-[--border]" />
        <div>
          <div class="text-xs text-[--muted-foreground]">方法文件</div>
          <div class="text-sm font-medium text-[--text-main]">{{ task.methodCode }} / {{ task.methodVersion }}</div>
        </div>
        <div class="w-px h-8 bg-[--border]" />
        <div>
          <div class="text-xs text-[--muted-foreground]">样本批次</div>
          <div class="text-sm font-medium text-[--text-main]">{{ task.sampleBatch || '—' }}</div>
        </div>
        <div v-if="templateName" class="w-px h-8 bg-[--border]" />
        <div v-if="templateName">
          <div class="text-xs text-[--muted-foreground]">模板实例</div>
          <div class="text-sm font-medium text-[--text-main]">{{ templateName }}</div>
        </div>
        <div class="ml-auto flex gap-2">
          <BaseButton variant="secondary" size="sm" @click="goBack">返回任务列表</BaseButton>
          <BaseButton variant="primary" size="sm" :disabled="!canSubmit" @click="submitExecution">提交复核</BaseButton>
        </div>
      </div>
      <div v-else class="flex items-center justify-between">
        <div class="text-sm text-[--danger]">
          <div class="font-semibold mb-1">无法加载任务</div>
          <div class="text-xs text-[--muted-foreground]">taskId={{ effectiveTaskId }} | planCode={{ planCode }}</div>
        </div>
        <BaseButton variant="secondary" size="sm" @click="goBack">返回</BaseButton>
      </div>
    </div>

    <!-- 步骤进度条 -->
    <div v-if="task && steps.length > 0" class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-3">
      <div class="flex items-center gap-1 overflow-x-auto">
        <div v-for="(step, i) in steps" :key="step.id" class="flex items-center gap-1 shrink-0">
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all text-xs"
            :class="i < currentStep ? 'bg-[--success-soft] text-[--success] font-semibold' : i === currentStep ? 'bg-[--primary-soft] text-[--primary] font-semibold border border-[--primary-border]' : 'text-[--muted-foreground] hover:bg-[--neutral-soft]'"
            @click="i <= currentStep && (currentStep = i)"
          >
            <div class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="i < currentStep ? 'bg-[--success] text-white' : i === currentStep ? 'bg-[--primary] text-white' : 'bg-[--neutral-soft] text-[--text-tertiary]'"
            >{{ i < currentStep ? '✓' : i + 1 }}</div>
            <span class="max-w-[100px] truncate">{{ step.action.slice(0, 12) }}{{ step.action.length > 12 ? '...' : '' }}</span>
          </div>
          <div v-if="i < steps.length - 1" class="flex-1 h-px bg-[--border] min-w-[20px]" />
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <template v-if="task">
      <div class="grid grid-cols-3 gap-5">
        <!-- 左侧：方法步骤 + 模板列表 -->
        <div class="col-span-1 space-y-4">
          <BaseCard>
            <template #header>
              <span class="text-sm font-bold text-[--foreground]">方法文件步骤</span>
            </template>
            <div class="space-y-2 max-h-[320px] overflow-y-auto">
              <div
                v-for="(step, i) in steps"
                :key="step.id"
                :class="['p-3 rounded-md border cursor-pointer transition-all',
                  currentStep === i ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-[--surface-muted] hover:border-[--primary-border]']"
                @click="currentStep = i"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="w-5 h-5 rounded-full bg-[--primary] text-white text-xs font-bold flex items-center justify-center">{{ i + 1 }}</span>
                  <span class="text-xs font-semibold text-[--text-main]">第{{ i + 1 }}步</span>
                  <span v-if="step.expected.length" class="text-xs text-[--warning] font-medium">
                    {{ step.expected.map(e => `${e.value}${e.unit}`).join('、') }}
                  </span>
                </div>
                <div class="text-xs text-[--muted-foreground] leading-relaxed pl-7">{{ step.action }}</div>
                <div v-if="step.notes" class="text-[10px] text-[--muted-foreground] mt-1 pl-7">⚠ {{ step.notes }}</div>
              </div>
              <div v-if="steps.length === 0" class="text-xs text-[--muted-foreground] text-center py-4">
                该步骤由模板格子配置定义，参考右侧预期内容
              </div>
            </div>
          </BaseCard>

          <BaseCard>
            <template #header>
              <span class="text-sm font-bold text-[--foreground]">关联模板实例</span>
            </template>
            <div class="space-y-2">
              <div
                v-for="(form, fi) in workspaceForms"
                :key="form.instanceId"
                :class="['flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer',
                  activeFormIndex === fi ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-[--surface-muted] hover:border-[--primary-border]']"
                @click="activeFormIndex = fi"
              >
                <div>
                  <div class="text-sm font-medium text-[--text-main]">{{ form.template?.templateName || '模板实例' }}</div>
                  <div class="text-[10px] text-[--muted-foreground] font-mono">{{ form.instanceId }}</div>
                </div>
                <BaseTag :label="form.template?.previewMode === 'plate' ? '孔板图' : '表格'" tone="neutral" />
              </div>
              <div v-if="workspaceForms.length === 0" class="text-xs text-[--muted-foreground] text-center py-4">
                暂无模板数据（请先在计划编辑中配置模板）
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- 右侧：模板格子 + 实际录入 -->
        <div class="col-span-2 space-y-4">
          <!-- 预期格子内容（来自计划编辑） -->
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[--foreground]">
                  预期格子内容（计划编辑配置）
                </span>
                <div class="flex items-center gap-2">
                  <BaseTag tone="info" label="只读参考" />
                  <span class="text-[10px] text-[--muted-foreground]">实验员参照此配置执行</span>
                </div>
              </div>
            </template>
            <div v-if="activeForm && activeForm.template?.previewMode === 'plate'" class="overflow-x-auto">
              <SequenceGrid
                :cells="activeForm.cells"
                :footer="activeForm.footer"
                :read-only="true"
              />
            </div>
            <div v-else-if="activeForm" class="py-6 text-center">
              <div class="text-xs text-[--muted-foreground]">
                模板类型：{{ activeForm.template?.templateName || '未配置' }}
              </div>
              <div class="text-xs text-[--muted-foreground] mt-1">
                预览模式：{{ activeForm.template?.previewMode || '—' }}
              </div>
            </div>
            <div v-else class="py-6 text-center">
              <div class="text-sm text-[--muted-foreground]">暂无模板格子数据</div>
              <div class="text-xs text-[--muted-foreground] mt-1">请在实验计划编辑中配置模板内容</div>
            </div>
          </BaseCard>

          <!-- 实际执行录入 -->
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[--foreground]">
                  实际执行录入（第 {{ currentStep + 1 }} 步）
                </span>
                <BaseTag :label="`${currentStep + 1} / ${steps.length}`" tone="neutral" />
              </div>
            </template>

            <div v-if="currentStepData" class="space-y-5">
              <!-- 步骤说明 -->
              <div class="p-3 rounded-lg bg-[--surface-muted] border border-[--border]">
                <div class="text-xs font-semibold text-[--text-main] mb-1">操作步骤</div>
                <div class="text-sm text-[--text-main]">{{ currentStepData.action }}</div>
                <div v-if="currentStepData.notes" class="text-xs text-[--warning] mt-1">⚠ {{ currentStepData.notes }}</div>
              </div>

              <!-- 预期值 -->
              <div v-if="currentStepData.expected.length > 0">
                <div class="text-xs font-semibold text-[--text-main] mb-2">预期值（计划配置）</div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(exp, ei) in currentStepData.expected"
                    :key="ei"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[--warning-soft] text-[--warning] text-sm font-semibold border border-[--warning-border]"
                  >
                    {{ exp.value }} {{ exp.unit }}
                  </span>
                </div>
              </div>

              <!-- 扫码对象 -->
              <div v-if="currentStepData.scanObjects.length > 0">
                <div class="text-xs font-semibold text-[--text-main] mb-2">扫码对象</div>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="obj in currentStepData.scanObjects" :key="obj.type + '-' + obj.name">
                    <BaseFormField
                      :label="objTypeLabel(obj.type) + ' — ' + obj.name"
                      type="text"
                      :placeholder="obj.type === 'device' ? '扫码或输入设备编号' : obj.type === 'reagent' ? '扫码或输入试剂批号' : obj.type === 'sample' ? '扫码或输入样品编号' : '扫码或输入耗材编号'"
                      v-model="scanValues[obj.type + '-' + obj.name]"
                      class="col-span-1"
                    />
                  </div>
                </div>
              </div>

              <!-- 记录字段 -->
              <div>
                <div class="text-xs font-semibold text-[--text-main] mb-2">记录实际数据</div>
                <div class="grid grid-cols-2 gap-4">
                  <BaseFormField
                    v-for="field in currentStepData.requiredFields"
                    :key="field"
                    :label="fieldLabels[field]"
                    :type="(fieldTypes[field] as any)"
                    :required="true"
                    :placeholder="fieldPlaceholders[field]"
                    v-model="formData[field]"
                    :error="fieldErrors[field]"
                  />
                </div>
              </div>

              <!-- 偏差提示 -->
              <div v-if="deviationWarning" class="p-3 rounded-md bg-[--warning-soft] border border-[--warning-border]">
                <div class="text-sm text-[--warning] font-medium">⚠️ 实际值与预期值存在偏差，请填写备注说明原因</div>
                <div class="mt-2">
                  <BaseFormField label="偏差备注" type="textarea" placeholder="请说明偏差原因" v-model="deviationNote" />
                </div>
              </div>
            </div>

            <!-- 无步骤时显示模板录入区域 -->
            <div v-else class="py-6 text-center space-y-3">
              <div class="text-2xl">🧪</div>
              <div class="text-sm font-medium text-[--text-main]">请按模板格子内容执行操作</div>
              <div class="text-xs text-[--muted-foreground]">在上方格子图中查看预期配置，并在下方录入实际操作数据</div>
              <div class="pt-4">
                <BaseFormField
                  label="操作备注"
                  type="textarea"
                  placeholder="记录实际操作中的特殊情况或备注"
                  v-model="executionNote"
                  class="max-w-md mx-auto"
                />
              </div>
            </div>
          </BaseCard>

          <!-- 操作按钮 -->
          <div class="flex justify-between items-center bg-white border border-[--border] rounded-[--radius-lg] px-5 py-3">
            <BaseButton variant="secondary" :disabled="currentStep === 0" @click="prevStep">上一步</BaseButton>
            <div class="flex gap-2">
              <BaseButton variant="secondary" @click="saveDraft">保存草稿</BaseButton>
              <BaseButton
                variant="primary"
                :disabled="!canNext"
                @click="nextStep"
              >
                {{ currentStep === steps.length - 1 ? '提交复核' : '下一步' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import SequenceGrid from '@/components/experiments/SequenceGrid.vue';
import { tasks } from '@/api/mock/tasks';
import { formTemplates } from '@/api/mock/form-templates';
import type { Task, TaskStep, SequenceCell, FormStepBlock } from '@/types/experiments';

const route = useRoute();
const router = useRouter();

const taskId = (route.params.taskId as string) || '';
const effectiveTaskId = taskId;
const planCode = (route.query.planCode as string) || '';
const projectId = (route.query.projectId as string) || '';

const task = computed<Task | undefined>(() =>
  tasks.find((t: any) => t.id === effectiveTaskId)
);

const steps = computed<TaskStep[]>(() => task.value?.steps ?? []);
const currentStep = ref(0);
const formData = ref<Record<string, any>>({});
const fieldErrors = ref<Record<string, string>>({});
const scanValues = ref<Record<string, string>>({});
const deviationNote = ref('');
const executionNote = ref('');
const activeFormIndex = ref(0);
const workspaceForms = ref<any[]>([]);
const templateName = ref('');

// 字段标签映射
const fieldLabels: Record<string, string> = {
  actualVolume: '实际体积', actualVolume1: '实际体积1', actualVolume2: '实际体积2',
  deviceId: '设备编号', deviceIds: '设备编号',
  reagentBatch: '试剂批号', sampleId: '样品编号',
  time: '操作时间', environment: '环境条件',
  vortexTime: '涡旋时间 (min)', centrifugeRpm: '离心转速 (rpm)', centrifugeTime: '离心时间 (min)',
  lightType: '光源类型', temperature: '温度 (℃)', humidity: '湿度 (%)',
  startTime: '开始时间', endTime: '结束时间', deviationNote: '偏差备注',
};

const fieldTypes: Record<string, string> = {
  actualVolume: 'number', actualVolume1: 'number', actualVolume2: 'number',
  deviceId: 'text', deviceIds: 'text', reagentBatch: 'text', sampleId: 'text',
  time: 'datetime-local', environment: 'select',
  vortexTime: 'number', centrifugeRpm: 'number', centrifugeTime: 'number',
  lightType: 'select', temperature: 'number', humidity: 'number',
  startTime: 'datetime-local', endTime: 'datetime-local', deviationNote: 'textarea',
};

const fieldPlaceholders: Record<string, string> = {
  actualVolume: '输入实际体积', actualVolume1: '输入实际体积', actualVolume2: '输入实际体积',
  deviceId: '扫码或输入', deviceIds: '扫码或输入', reagentBatch: '扫码或输入批号', sampleId: '扫码或输入编号',
  time: '', environment: '请选择', vortexTime: '', centrifugeRpm: '', centrifugeTime: '',
  lightType: '请选择', temperature: '', humidity: '', startTime: '', endTime: '', deviationNote: '',
};

const objTypeLabel = (type: string) => {
  const map: Record<string, string> = { device: '设备', reagent: '试剂', sample: '样品', consumable: '耗材' };
  return map[type] ?? type;
};

const activeForm = computed(() => workspaceForms.value[activeFormIndex.value] ?? null);

const currentStepData = computed(() => steps.value[currentStep.value]);

const deviationWarning = computed(() => {
  const expected = currentStepData.value?.expected ?? [];
  if (expected.length === 0) return false;
  const field = currentStepData.value?.requiredFields?.[0];
  if (!field) return false;
  const actual = formData.value[field];
  if (!actual) return false;
  return Math.abs(Number(actual) - expected[0].value) > 2;
});

const canNext = computed(() => {
  if (steps.value.length === 0) return true;
  if (!currentStepData.value) return true;
  for (const field of currentStepData.value.requiredFields) {
    if (field === 'deviationNote') continue;
    if (!formData.value[field]) return false;
  }
  return true;
});

const canSubmit = computed(() => {
  if (steps.value.length === 0) return true;
  return currentStep.value >= steps.value.length - 1 && canNext.value;
});

function loadWorkspaceState() {
  const taskFormTemplates = task.value?.formTemplates ?? [];
  const taskMethodCode = task.value?.methodCode ?? '';

  // 遍历所有 localStorage 中的 workspace 数据，寻找匹配的模板
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('plan-workspace::')) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const state = JSON.parse(raw) as {
        workspaceForms?: Array<{
          instanceId: string;
          templateId: string;
          cells: SequenceCell[];
          footer?: any;
          stepBlocks?: FormStepBlock[];
          recordModel?: any;
        }>;
        planCode?: string;
      };
      if (!state.workspaceForms?.length) continue;

      // 匹配：表单的 templateId 对应的模板名称在任务的 formTemplates 列表中
      const matchingForms = state.workspaceForms
        .filter(form => {
          if (!taskFormTemplates.length) return true;
          const tpl = formTemplates.find((f: any) => f.id === form.templateId);
          return tpl && taskFormTemplates.includes(tpl.templateName);
        })
        .map(form => {
          const tpl = formTemplates.find((f: any) => f.id === form.templateId) ?? null;
          return { ...form, template: tpl };
        });

      if (matchingForms.length > 0) {
        workspaceForms.value = matchingForms;
        templateName.value = matchingForms[0].template?.templateName ?? '';
        break;
      }
    } catch (e) {
      // 忽略解析错误
    }
  }
}

function prevStep() { if (currentStep.value > 0) currentStep.value--; }

function nextStep() {
  if (!canNext.value) return;
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
    formData.value = {};
    scanValues.value = {};
    deviationNote.value = '';
  }
}

function saveDraft() {
  alert('草稿已保存（模拟）');
}

function submitExecution() {
  if (!canSubmit.value) return;
  alert('提交复核成功（模拟）');
}

function goBack() {
  router.push(`/experiments/plans/${planCode}/tasks`);
}

onMounted(() => {
  loadWorkspaceState();
});
</script>
