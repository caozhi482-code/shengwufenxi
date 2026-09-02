<template>
  <div class="space-y-5">
    <BasePageHeader :title="template?.templateName ?? '模板预览'" subtitle="只读查看模板完整样式，尽量贴近实验室线下原始记录">
      <template #extra>
        <BaseButton variant="secondary" @click="goBack">返回详情</BaseButton>
        <BaseButton variant="secondary" @click="goList">返回列表</BaseButton>
        <BaseButton variant="secondary" @click="goPlan">跳回计划流程</BaseButton>
        <BaseButton variant="primary" @click="printPreview">导出/打印</BaseButton>
      </template>
    </BasePageHeader>

    <div v-if="loading" class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-10 text-center text-[--muted-foreground]">预览加载中...</div>

    <template v-else-if="template">
      <div v-if="template.templateCode === 'BA-SBR08'" class="space-y-4">
        <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4 text-sm text-[--text-main] max-w-[1200px] mx-auto">
          <div class="flex flex-wrap gap-6 items-center">
            <span>项目编号：{{ msPreviewModel.context.projectCode || '继承自计划' }}</span>
            <span>方法版本号：{{ msPreviewModel.context.methodVersion || '继承自计划' }}</span>
            <span>文件编号：BA-SBR08</span>
            <span>版本：2V</span>
          </div>
        </div>
        <div class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1200px] mx-auto">
          <MSSolutionTableBlock :model-value="msPreviewModel" :readonly-preview="true" />
        </div>
      </div>
      <div v-else-if="template.templateCode === 'BA-SBR09'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1200px] mx-auto">
        <InjectionSequenceTableBlock :model-value="injectionSequenceModel" />
      </div>
      <div v-else-if="template.templateCode === 'BA-SBR07'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
        <AdditionSequenceTableBlock :model-value="additionSequenceModel as any" />
      </div>
      <div v-else-if="template.templateCode === 'BA-SBR10'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1200px] mx-auto">
        <InjectionLCMSRecordTableBlock :model-value="injectionLCMSModel as any" />
      </div>
      <div v-else-if="template.templateCode === 'BA-SBR06'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
        <MatrixSampleTableBlock :model-value="matrixSampleModel as any" />
      </div>
      <div v-else-if="template.group === 'work'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
        <WorkSolutionTableBlock :model-value="workModel" />
      </div>
      <div v-else-if="template.group === 'reference'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
        <ReferenceStockTableBlock :model-value="referencePreviewModel" />
      </div>
      <div v-else-if="template.group === 'solution'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
        <SolutionPrepTableBlock :top-rows="solutionTopRows" :bottom-rows="solutionBottomRows" />
      </div>
      <div v-else-if="template.group === 'split'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
        <SplitRecordTableBlock :model-value="splitModel" />
      </div>
      <div v-else-if="template.templateCode === 'BA-SBR12'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
        <StabilitySampleTableBlock :model-value="stabilityPreviewModel" />
      </div>
      <div v-else class="grid grid-cols-4 gap-5 items-start">
        <div class="col-span-3 space-y-5">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between w-full">
                <span class="text-base font-bold text-[--foreground]">模板上下文区</span>
                <BaseTag :tone="template.status === 'disabled' ? 'danger' : 'success'">{{ template.status === 'disabled' ? '停用模板' : '只读预览' }}</BaseTag>
              </div>
            </template>
            <div class="grid grid-cols-3 gap-3 text-sm">
              <div v-for="item in contextCards" :key="item.label" class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
                <div class="text-xs text-[--muted-foreground]">{{ item.label }}</div>
                <div class="font-mono text-xs font-semibold text-[--primary] mt-1">{{ item.value }}</div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </template>

    <div v-else class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-10 text-center text-[--muted-foreground]">
      <div class="text-3xl mb-2">📄</div>
      <div>模板不存在，无法预览</div>
      <BaseButton class="mt-4" variant="secondary" @click="goBack">返回详情</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import MSSolutionTableBlock from '@/components/experiments/MSSolutionTableBlock.vue';
import WorkSolutionTableBlock from '@/components/experiments/WorkSolutionTableBlock.vue';
import ReferenceStockTableBlock from '@/components/experiments/ReferenceStockTableBlock.vue';
import SolutionPrepTableBlock from '@/components/experiments/SolutionPrepTableBlock.vue';
import SplitRecordTableBlock from '@/components/experiments/SplitRecordTableBlock.vue';
import MatrixSampleTableBlock from '@/components/experiments/MatrixSampleTableBlock.vue';
import InjectionSequenceTableBlock from '@/components/experiments/InjectionSequenceTableBlock.vue';
import AdditionSequenceTableBlock from '@/components/experiments/AdditionSequenceTableBlock.vue';
import StabilitySampleTableBlock from '@/components/experiments/StabilitySampleTableBlock.vue';
import InjectionLCMSRecordTableBlock from '@/components/experiments/InjectionLCMSRecordTableBlock.vue';
import { getFormTemplateById } from '@/api/mock/form-templates';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const templateId = computed(() => route.params.id as string);
const template = computed(() => getFormTemplateById(templateId.value));

const contextCards = computed(() => template.value ? [
  { label: '项目名称', value: template.value.context.projectName ?? '继承自计划' },
  { label: '计划编号', value: template.value.context.planCode },
  { label: '模板名称', value: template.value.templateName },
  { label: '模板版本', value: template.value.version },
  { label: '当前状态', value: template.value.status === 'disabled' ? '停用' : '启用' },
] : []);

const solutionTopRows = computed(() => [
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
]);
const solutionBottomRows = computed(() => Array.from({ length: 3 }, () => Array(10).fill('')));
const referencePreviewModel = computed(() => ({
  basic: { recordType: '分析物', referenceCode: 'REF-STD-001', referenceName: '对照品A', referenceBatch: 'RB-20260829', referenceState: '粉末P', referenceExpiry: '2027-08-29', correctionFactor: '1.000', balanceCode: 'BAL-001', pipetteCode: 'PIP-002' },
  rows: [
    { stockCode: '', concentration: '', weight: '', volume: '', calc: '', container: '', finishedAt: '', remark: '' },
    { stockCode: '', concentration: '', weight: '', volume: '', calc: '', container: '', finishedAt: '', remark: '' },
  ],
  solventCode: '',
  solventBatch: '',
  diluentName: '',
  diluentBatch: '',
  diluentManufacturer: '',
  diluentExpiry: '',
  containerMaterial: '',
  color: '',
  lightCondition: '',
  disposalMethod: '',
  storageRef: '',
  batchLabel: '',
  signatures: { operator: '', reviewer: '', auditor: '' },
}));
const workModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  rows: [
    { solutionCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: '', sourceMerge: '', diluentVolume: '', finalVolume: '', finalConcentration: '' },
    { solutionCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: '', sourceMerge: '', diluentVolume: '', finalVolume: '', finalConcentration: '' },
  ],
  sourceBatch: '',
  diluentInfo: '',
  pureReagentInfo: '',
  pipetteNo: '',
  containerMaterial: '',
  containerColor: '',
  lightCondition: '',
  batchLabel: '',
  completedAt: '',
  disposalMethod: '',
  controlledPaperNo: '',
  refrigeratorNo: '',
  signatures: { operator: '', reviewer: '', auditor: '' },
}));
const splitModel = computed(() => ({
  context: { projectCode: '' },
  rows: [
    { id: 'split-1', sourceCode: '', splitCount: '', volumePerPortion: '', splitCode: '', splitBy: '', storageLocation: '', storageStartedAt: '' },
    { id: 'split-2', sourceCode: '', splitCount: '', volumePerPortion: '', splitCode: '', splitBy: '', storageLocation: '', storageStartedAt: '' },
  ],
  signatures: { packager: '', reviewer: '', auditor: '' },
}));
const matrixSampleModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  rows: [
    { id: 'mx-1', sampleCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, blankMatrixVolume: 0, finalVolume: 0, blankMatrixCode: '', finalConcentration: '' },
    { id: 'mx-2', sampleCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, blankMatrixVolume: 0, finalVolume: 0, blankMatrixCode: '', finalConcentration: '' },
  ],
  sourceBatch: '',
  blankMatrixDisposition: '',
  blankMatrixFridgeNo: '',
  pipetteNo: '',
  containerMaterial: '',
  containerColor: '',
  lightConditions: [],
  tempConditions: [],
  batchLabel: '',
  completedAt: '',
  disposalMethod: '',
  controlledPaperNo: '',
  refrigeratorNo: '',
  signatures: { operator: '', reviewer: '', auditor: '' },
}));
const msPreviewModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  rows: [
    { solutionCode: '', analyteCode: '', analyteVolume: 0, isVolume: 0, reconstitutionVolume: 0, finalVolume: 0 },
    { solutionCode: '', analyteCode: '', analyteVolume: 0, isVolume: 0, reconstitutionVolume: 0, finalVolume: 0 },
  ],
  analyteBatch: '',
  isInfo: '',
  reconstitutionInfo: '',
  pureReagentInfo: '',
  pipetteNo: '',
  containerMaterial: '',
  containerColor: '',
  lightCondition: '',
  batchLabel: '',
  completedAt: '',
  storageCondition: '',
  signatures: { operator: '', reviewer: '', auditor: '' },
  cellOperations: {},
}));
const injectionSequenceModel = computed(() => ({
  context: {
    projectCode: '',
    methodVersion: '',
    analysisBatchNo: '',
    runId: '',
    operatorInfo: '',
    reviewerInfo: '',
    auditorInfo: '',
  },
  rows: Array.from({ length: 12 }, (_, index) => ({
    seq: String(index + 1),
    sampleId: '',
    dilutionFactor: '',
    wellPosition: '',
    remark: '',
  })),
}));
const additionSequenceModel = computed(() => ({
  context: { projectCode: '', analysisBatchNo: '', runId: '', plateId: '' },
  rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  cells: Array.from({ length: 8 }, (_, ri) =>
    Array.from({ length: 12 }, (_, ci) => ({
      row: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][ri],
      col: ci + 1,
      operations: [],
      selected: false,
    }))
  ).flat(),
  placementLocation: '',
  placementTime: '',
  signatureOperator: '',
  signatureReviewer: '',
  signatureAuditor: '',
}));

const injectionLCMSModel = computed(() => ({
  context: { projectCode: 'EXP-2026-013', methodVersion: 'VAL1', analysisBatchNo: 'AB-20260902-01', runId: 'RUN-20260902-001' },
  instrumentSubmission: {
    submitType: 'first' as 'first' | 'follow',
    instrumentId: 'IE-LC/MS-001',
    platePosition: 'A1',
    columnId: 'LC-COL-001',
    mobilePhaseABatch: 'MPA-20260901',
    mobilePhaseBBatch: 'MPB-20260901',
    washPumpBatch: 'WP-20260901',
    washPortBatch: 'WPO-20260901',
    isPureReagent: false,
    isPureReagentStr: 'false',
    reagentName: '',
    reagentBatch: '',
    reagentManufacturer: '',
    reagentExpiry: '',
    injectionVolume: 10,
    acquisitionMethod: 'BA-SBR10-Acq',
    followedBatchNo: '',
  },
  instrumentSignatures: { operator: '', reviewer: '', auditor: '' },
  resultIntegration: { disposalMethod: 'discard' as 'discard' | 'store', storageLocation: '', integrationMethod: 'BA-SBR10-Integration', resultSaveName: 'BA-SBR10-Result' },
  resultSignatures: { operator: '', reviewer: '', auditor: '' },
}));

const stabilityPreviewModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  equipment: { incubatorId: '', centrifugeId: '', pipetteId: '' },
  blood: {
    rows: [
      { sampleCode: '', sourceSolutionCode: '', sourceSolutionVolume: 0, blankBloodVolume: 0, finalVolume: 0 },
      { sampleCode: '', sourceSolutionCode: '', sourceSolutionVolume: 0, blankBloodVolume: 0, finalVolume: 0 },
    ],
    sourceSolutionBatch: '',
    blankBloodCode: '',
    preparationTime: '',
    lightCondition: [],
    tempCondition: [],
    incubationStartTime: '',
    incubationDuration: 0,
    incubationEndTime: '',
    containerMaterial: '',
    color: '',
  },
  stability: {
    rows: [
      { sampleCode: '', stabilitySampleCode: '', startTime: '', conditions: [], endTime: '' },
      { sampleCode: '', stabilitySampleCode: '', startTime: '', conditions: [], endTime: '' },
    ],
    containerMaterial: '',
    color: '',
    storageCondition: '',
  },
  signatures: { operator: '', reviewer: '', auditor: '' },
}));

function goBack() { router.push(`/experiments/form-templates/${templateId.value}`); }
function goList() { router.push('/experiments/form-templates'); }
function goPlan() { router.push('/experiments/plans/new/forms'); }
function printPreview() { alert(`导出/打印：${template.value?.templateName ?? '模板'}`); }
</script>
