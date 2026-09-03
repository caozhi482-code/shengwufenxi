<template>
  <div class="space-y-5">
    <BasePageHeader :title="template?.templateName ?? '模板详情'" subtitle="查看模板元信息、结构概览和追溯上下文">
      <template #extra>
        <BaseButton variant="secondary" @click="goBack">返回列表</BaseButton>
        <BaseButton variant="secondary" @click="openPreview">预览</BaseButton>
        <BaseButton variant="secondary" @click="openEditor">编辑</BaseButton>
        <BaseButton variant="primary" @click="copyTemplate">复制模板</BaseButton>
      </template>
    </BasePageHeader>

    <div v-if="loading" class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-10 text-center text-[--muted-foreground]">详情加载中...</div>

    <template v-else-if="template">
      <div class="grid grid-cols-3 gap-5">
        <BaseCard class="col-span-2">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <span class="text-base font-bold text-[--foreground]">模板信息</span>
              <div class="flex items-center gap-2">
                <BaseTag v-if="template.isDefault" tone="success">默认模板</BaseTag>
                <BaseTag :tone="statusTone(template.status)">{{ statusLabel(template.status) }}</BaseTag>
              </div>
            </div>
          </template>
          <div class="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div v-for="item in infoRows" :key="item.label" class="flex justify-between gap-4 border-b border-dashed border-[--border] pb-2">
              <span class="text-[--muted-foreground]">{{ item.label }}</span>
              <span class="font-medium text-[--text-main] text-right">{{ item.value }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">结构概览</span>
          </template>
          <div class="space-y-3 text-sm">
            <div>
              <div class="text-xs text-[--muted-foreground] mb-2">结构区域</div>
              <div class="flex flex-wrap gap-2">
                <BaseTag v-for="section in template.structure.sections" :key="section" tone="neutral">{{ section }}</BaseTag>
              </div>
            </div>
            <div>
              <div class="text-xs text-[--muted-foreground] mb-2">关键字段</div>
              <div class="space-y-2">
                <div v-for="field in template.structure.fields" :key="field" class="rounded-lg border border-[--border] px-3 py-2 bg-white">{{ field }}</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <BaseCard>
        <template #header>
          <span class="text-base font-bold text-[--foreground]">缩略预览</span>
        </template>
        <div v-if="template.templateCode === 'BA-SBR08'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <MSSolutionTableBlock :model-value="msPreviewModel" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR09'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <InjectionSequenceTableBlock :model-value="injectionSequenceModel" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR07'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <AdditionSequenceTableBlock :model-value="additionSequenceModel as any" />
        </div>
        <div v-else-if="template.group === 'work'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <WorkSolutionTableBlock :model-value="workModel" />
        </div>
        <div v-else-if="template.group === 'reference'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <ReferenceStockTableBlock :model-value="referencePreviewModel" />
        </div>
        <div v-else-if="template.group === 'split'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <SplitRecordTableBlock :model-value="splitModel" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR06'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <MatrixSampleTableBlock :model-value="matrixSampleModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR10'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <InjectionLCMSRecordTableBlock :model-value="lcmModel" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR12'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <StabilitySampleTableBlock :model-value="stabilityModel" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR13'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <DilutionRecordTableBlock :model-value="dilutionModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR14'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <PureSolutionStabilityTableBlock :model-value="pureStabilityModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR15'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <FreezeThawStabilityTableBlock :model-value="freezeThawModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR16'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <MatrixSampleStabilityTableBlock :model-value="matrixStabilityModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR17'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <MethodValidationResultBlock :model-value="validationResultModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR19'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <ReanalysisApplicationBlock :model-value="reanalysisAppModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR20'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <ISStockSolutionBlock :model-value="isStockModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR21'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <ReanalysisSummaryDoubleBlock :model-value="reanalysisDoubleModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR22'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <ReanalysisSummarySingleBlock :model-value="reanalysisSingleModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'BA-SBR23'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <UnconventionalStabilityTableBlock :model-value="unconventionalStabilityModel as any" />
        </div>
        <div v-else-if="template.templateCode === 'FT-SOL-004'" class="bg-white border border-[--border] p-2 overflow-x-auto">
          <SolutionPrepTableBlock :top-rows="solTopRows" :bottom-rows="solBottomRows" />
        </div>
        <div v-else class="rounded-xl border border-[--border] bg-[--surface-muted] p-4 text-sm text-[--muted-foreground]">
          当前模板暂无专属缩略预览。
        </div>
      </BaseCard>
    </template>

    <div v-else class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-10 text-center text-[--muted-foreground]">
      <div class="text-3xl mb-2">📄</div>
      <div>模板不存在</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import MSSolutionTableBlock from '@/components/experiments/MSSolutionTableBlock.vue';
import WorkSolutionTableBlock from '@/components/experiments/WorkSolutionTableBlock.vue';
import ReferenceStockTableBlock from '@/components/experiments/ReferenceStockTableBlock.vue';
import SplitRecordTableBlock from '@/components/experiments/SplitRecordTableBlock.vue';
import MatrixSampleTableBlock from '@/components/experiments/MatrixSampleTableBlock.vue';
import InjectionSequenceTableBlock from '@/components/experiments/InjectionSequenceTableBlock.vue';
import AdditionSequenceTableBlock from '@/components/experiments/AdditionSequenceTableBlock.vue';
import InjectionLCMSRecordTableBlock from '@/components/experiments/InjectionLCMSRecordTableBlock.vue';
import StabilitySampleTableBlock from '@/components/experiments/StabilitySampleTableBlock.vue';
import SolutionPrepTableBlock from '@/components/experiments/SolutionPrepTableBlock.vue';
import DilutionRecordTableBlock from '@/components/experiments/DilutionRecordTableBlock.vue';
import PureSolutionStabilityTableBlock from '@/components/experiments/PureSolutionStabilityTableBlock.vue';
import FreezeThawStabilityTableBlock from '@/components/experiments/FreezeThawStabilityTableBlock.vue';
import MatrixSampleStabilityTableBlock from '@/components/experiments/MatrixSampleStabilityTableBlock.vue';
import MethodValidationResultBlock from '@/components/experiments/MethodValidationResultBlock.vue';
import ReanalysisApplicationBlock from '@/components/experiments/ReanalysisApplicationBlock.vue';
import ISStockSolutionBlock from '@/components/experiments/ISStockSolutionBlock.vue';
import ReanalysisSummaryDoubleBlock from '@/components/experiments/ReanalysisSummaryDoubleBlock.vue';
import ReanalysisSummarySingleBlock from '@/components/experiments/ReanalysisSummarySingleBlock.vue';
import UnconventionalStabilityTableBlock from '@/components/experiments/UnconventionalStabilityBlock.vue';
import { getFormTemplateById } from '@/api/mock/form-templates';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const templateId = computed(() => route.params.id as string);
const template = computed(() => getFormTemplateById(templateId.value));

const infoRows = computed(() => template.value ? [
  { label: '模板名称', value: template.value.templateName },
  { label: '模板编号', value: template.value.templateCode },
  { label: '模板版本', value: template.value.version },
  { label: '适用考察项', value: template.value.itemNames.join(' / ') },
  { label: '来源文件', value: template.value.sourceFile },
  { label: '更新时间', value: template.value.updatedAt },
] : []);

const msPreviewModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  rows: [
    { solutionCode: 'MS-01', analyteCode: '', analyteVolume: 0, isVolume: 0, reconstitutionVolume: 0, finalVolume: 0 },
    { solutionCode: 'MS-02', analyteCode: '', analyteVolume: 0, isVolume: 0, reconstitutionVolume: 0, finalVolume: 0 },
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
const referencePreviewModel = computed(() => ({
  basic: { recordType: '分析物', referenceCode: '', referenceName: '', referenceBatch: '', referenceState: '', referenceExpiry: '', correctionFactor: '', balanceCode: '', pipetteCode: '' },
  rows: [], solventCode: '', solventBatch: '', diluentName: '', diluentBatch: '', diluentManufacturer: '', diluentExpiry: '', containerMaterial: '', color: '', lightCondition: '', disposalMethod: '', storageRef: '', batchLabel: '', signatures: { operator: '', reviewer: '', auditor: '' },
}));
const workModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  rows: [], sourceBatch: '', diluentInfo: '', pureReagentInfo: '', pipetteNo: '', containerMaterial: '', containerColor: '', lightCondition: '', batchLabel: '', completedAt: '', disposalMethod: '', controlledPaperNo: '', refrigeratorNo: '', signatures: { operator: '', reviewer: '', auditor: '' },
}));
const splitModel = computed(() => ({ context: { projectCode: '' }, rows: [], signatures: { packager: '', reviewer: '', auditor: '' } }));
const matrixSampleModel = computed(() => ({ context: { projectCode: '', methodVersion: '' }, rows: [{ id: 'mx-1', sampleCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, blankMatrixVolume: 0, finalVolume: 0, blankMatrixCode: '', finalConcentration: '' }, { id: 'mx-2', sampleCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, blankMatrixVolume: 0, finalVolume: 0, blankMatrixCode: '', finalConcentration: '' }], sourceBatch: '', blankMatrixDisposition: '', blankMatrixFridgeNo: '', pipetteNo: '', containerMaterial: '', containerColor: '', lightConditions: [], tempConditions: [], batchLabel: '', completedAt: '', disposalMethod: '', controlledPaperNo: '', refrigeratorNo: '', signatures: { operator: '', reviewer: '', auditor: '' } }));
const injectionSequenceModel = computed(() => ({
  context: { projectCode: '', methodVersion: '', analysisBatchNo: '', runId: '', operatorInfo: '', reviewerInfo: '', auditorInfo: '' },
  rows: Array.from({ length: 12 }, (_, index) => ({ seq: String(index + 1), sampleId: '', dilutionFactor: '', wellPosition: '', remark: '' })),
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

const lcmModel = computed(() => ({
  context: { projectCode: '', methodVersion: '', analysisBatchNo: '', runId: '' },
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

const stabilityModel = computed(() => ({
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

const dilutionModel = computed(() => ({
  context: { projectCode: '', analysisBatchNo: '', runId: '' },
  rows: [
    { id: 'dil-1', sampleId: '', sourceVolume: 0, blankMatrixVolume: 0, totalVolume: 0, dilutionFactor: 0 },
    { id: 'dil-2', sampleId: '', sourceVolume: 0, blankMatrixVolume: 0, totalVolume: 0, dilutionFactor: 0 },
  ],
  blankMatrixCode: '',
  pipetteNo: '',
  containerMaterial: '',
  containerColor: '',
  lightConditions: [],
  tempConditions: [],
  completionTime: '',
  signatures: { operator: '', reviewer: '', auditor: '' },
}));

const freezeThawModel = computed(() => ({
  context: { projectCode: '' },
  rows20: [
    { category: '-20℃冻融稳定性', sampleCode: '', fridgeId: 'IE-FZ-20d-', removeTime: '', tempConditions: [], lightConditions: [], putBackTime: '', analysisBatch: '' },
  ],
  rows80: [
    { category: '-80℃冻融稳定性', sampleCode: '', fridgeId: 'IE-FZ-80d-', removeTime: '', tempConditions: [], lightConditions: [], putBackTime: '', analysisBatch: '' },
  ],
  signatures: { packager: '', auditor: '' },
}));

function newStabilityRow() {
  return { sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' };
}

const pureStabilityModel = computed(() => ({
  context: { projectCode: '' },
  shortTerm: { label: '纯溶液短期稳定性考察', rows: [newStabilityRow()] },
  longTerm: { label: '纯溶液长期稳定性考察', rows: [newStabilityRow()] },
  signatures: { packager: '', auditor: '' },
}));

const solTopRows = computed(() => [
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
]);
const solBottomRows = computed(() => Array.from({ length: 3 }, () => Array(10).fill('')));

const matrixStabilityModel = computed(() => ({
  context: { projectCode: '' },
  rowsShort: [{ category: '短期稳定性考察', sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }],
  rowsLong: [{ category: '长期稳定性考察', sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }],
  signatures: { packager: '', auditor: '' },
}));
const validationResultModel = computed(() => ({
  context: { projectCode: '', analysisBatchNo: '', runId: '', analyte: '' },
  items: [
    { label: '系统适用性', result: '', remark: '' }, { label: '称量准确度', result: '', remark: '' },
    { label: '标准曲线', result: '', remark: '' }, { label: '质控样品', result: '', remark: '' },
    { label: '残留', result: '', remark: '' }, { label: '干扰', result: '', remark: '' },
    { label: '精密度与准确度', result: '', remark: '□P&A1、□P&A2、□P&A3，其他：' },
    { label: '稀释可靠性', result: '', remark: '' }, { label: '选择性', result: '', remark: '' },
    { label: '基质效应', result: '', remark: '' }, { label: '高脂效应', result: '', remark: '' },
    { label: '溶血效应', result: '', remark: '' }, { label: '回收率', result: '', remark: '' },
    { label: '重新进样重现性', result: '', remark: '' }, { label: '耐用性', result: '', remark: '□人员 □仪器' },
    { label: '纯溶液稳定性', result: '', remark: '' },
  ],
  duration: 0, passFail: '', itemPass: '', hasException: '', exceptionRemark: '',
  signatures: { lead: '', auditor: '' },
}));
const reanalysisAppModel = computed(() => ({
  context: { projectCode: '', analyteName: '', linearRange: '' }, rows: [],
  signatures: { summarizer: '', lead: '', auditor: '' },
}));
const isStockModel = computed(() => ({
  context: { projectCode: '', methodVersion: '', isName: '', isCode: '', isExpiry: '', pipetteNo: '', isMass: '', isCount: 0, totalVolume: '' },
  rows: [{ stockCode: '', concentration: '', calculation: '' }],
  process: { firstAddition: '', shake: false, transferVolume: '', rinseCount: 0, finalAddition: '', mix: false, completedAt: '', solventInfo: '' },
  storage: { containerMaterial: '', color: '', lightConditions: [], disposalMethod: '', fridgeNo: '', batchLabel: '' },
  signatures: { operator: '', reviewer: '', auditor: '' },
}));
const reanalysisDoubleModel = computed(() => ({
  context: { projectCode: '', analyteName: '', linearRange: '' }, rows: [],
  signatures: { summarizer: '', lead: '', auditor: '' },
}));
const reanalysisSingleModel = computed(() => ({
  context: { projectCode: '', analyteName: '', linearRange: '' }, rows: [],
  signatures: { summarizer: '', lead: '', qc: '' },
}));
const unconventionalStabilityModel = computed(() => ({
  context: { projectCode: '', methodVersion: '' },
  equipment: { incubatorId: '', centrifugeId: '', pipetteId: '' },
  blood: { rows: [{ id: 'bx-1', sampleCode: '', sourceCode: '', sourceVolume: 0, blankBloodVolume: 0, finalVolume: 0 }], sourceBatch: '', blankBloodCode: '', lightConditions: [], tempConditions: [] },
  incubation: { startTime: '', duration: 0, endTime: '', aliquotCount: 0, containerMaterial: '', color: '' },
  stability: { rows: [{ id: 'st-1', sampleCode: '', stabilityCode: '', startTime: '', conditions: [], endTime: '' }], description: '', containerMaterial: '', color: '', storageCondition: '' },
  signatures: { operator: '', reviewer: '', auditor: '' },
}));

function statusLabel(status: string): string { return ({ enabled: '启用', disabled: '停用', draft: '草稿' } as Record<string, string>)[status] ?? status; }
function statusTone(status: string): 'success' | 'danger' | 'warning' | 'neutral' { return ({ enabled: 'success', disabled: 'danger', draft: 'warning' } as Record<string, 'success' | 'danger' | 'warning' | 'neutral'>)[status] ?? 'neutral'; }
function goBack() { router.push('/experiments/form-templates'); }
function openPreview() { router.push(`/experiments/form-templates/${templateId.value}/preview`); }
function openEditor() { router.push(`/experiments/form-templates/${templateId.value}/editor`); }
function copyTemplate() { if (!template.value) return; alert(`已复制模板：${template.value.templateName}`); }
</script>
