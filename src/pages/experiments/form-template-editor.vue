<template>
  <div class="space-y-5">
    <BasePageHeader :title="template?.templateName ?? '模板编辑'" subtitle="在原始记录表格单元格内编辑模板内容">
      <template #extra>
        <BaseButton variant="secondary" @click="goBack">返回详情</BaseButton>
        <BaseButton variant="secondary" @click="goPreview">预览</BaseButton>
        <BaseButton variant="secondary" @click="copyTemplate">复制模板</BaseButton>
        <BaseButton variant="secondary" @click="setDefault">设为默认模板</BaseButton>
        <BaseButton variant="secondary" @click="addRow">新增明细行</BaseButton>
        <BaseButton variant="primary" @click="saveDraft">保存草稿</BaseButton>
        <BaseButton variant="primary" @click="saveAndEnable">保存并启用</BaseButton>
      </template>
    </BasePageHeader>

    <div v-if="template?.templateCode === 'BA-SBR08'" class="space-y-4">
      <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4 text-sm text-[--text-main] max-w-[1200px] mx-auto">
        <div class="flex flex-wrap gap-6 items-center">
          <span>项目编号：{{ model.context.projectCode || '继承自计划' }}</span>
          <span>方法版本号：{{ model.context.methodVersion || '继承自计划' }}</span>
          <span>文件编号：BA-SBR08</span>
          <span>版本：2V</span>
        </div>
      </div>
      <div class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1200px] mx-auto">
        <MSSolutionTableBlock v-model:model-value="model" editable @configure-cell="openCellDrawer" />
      </div>
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR09'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1200px] mx-auto">
      <InjectionSequenceTableBlock v-model:model-value="injectionSequenceModel" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR07'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
      <AdditionSequenceTableBlock :model-value="additionSequenceModel as any" editable />
    </div>

    <div v-else-if="template?.group === 'work'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
      <WorkSolutionTableBlock v-model:model-value="workModel" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR06'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
      <MatrixSampleTableBlock :model-value="matrixSampleModel as any" editable />
    </div>

    <div v-else-if="template?.group === 'split'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
      <SplitRecordTableBlock v-model:model-value="splitModel" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR02'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto">
      <ReferenceStockTableBlock v-model:model-value="referenceModel" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR10'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
      <InjectionLCMSRecordTableBlock v-model:model-value="lcmModel" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR12'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
      <StabilitySampleTableBlock v-model:model-value="stabilityModel" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR13'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1200px] mx-auto">
      <DilutionRecordTableBlock :model-value="dilutionModel as any" editable />
    </div>

    <div v-else-if="template?.templateCode === 'BA-SBR14'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
      <PureSolutionStabilityTableBlock :model-value="pureStabilityModel as any" editable />
    </div>

    <div v-else-if="template?.templateCode === 'FT-SOL-004'" class="bg-white border border-[--border] shadow-[var(--shadow-card)] p-4 overflow-x-auto max-w-[1400px] mx-auto">
      <SolutionPrepTableBlock v-model:top-rows="solTopRows" v-model:bottom-rows="solBottomRows" editable />
    </div>

    <div v-else class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-10 text-center text-[--muted-foreground]">
      <div class="text-3xl mb-2">📄</div>
      <div>模板不存在，无法编辑</div>
      <BaseButton class="mt-4" variant="secondary" @click="goBack">返回详情</BaseButton>
    </div>

    <BaseDrawer v-if="drawerOpen" :open="drawerOpen" :title="drawerTitle" @close="closeCellDrawer">
      <div class="space-y-4">
        <div class="text-xs text-[--muted-foreground]">格子位置：{{ activeCellLabel }}</div>
        <div v-for="(op, index) in cellOperations" :key="op.id" class="border border-[--border] rounded-lg p-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[--muted-foreground]">执行说明 {{ index + 1 }}</span>
            <button class="text-xs text-[--danger] hover:underline" @click="removeOperation(op.id)">删除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseFormField v-model="op.action" label="执行说明" placeholder="如：加内标工作液" />
            <BaseFormField v-model="op.substance" label="样品 / 溶液名称" placeholder="如：IS-WS" />
            <BaseFormField v-model="op.sampleId" label="样品编号" placeholder="如：STD8" />
            <BaseFormField v-model="op.equipment" label="设备" placeholder="如：移液器-001" />
            <BaseFormField v-model="op.volume" label="加入量" type="number" placeholder="如：30" />
            <BaseFormField v-model="op.unit" label="单位" placeholder="如：μL" />
            <BaseFormField v-model="op.scanObject" label="扫码对象" type="select" :options="scanObjectOptions" />
            <BaseFormField v-model="requiredValue[index]" label="是否必填" type="select" :options="requiredOptions" />
            <BaseFormField v-model="op.step" label="关联步骤" placeholder="如：第 1 步" />
            <BaseFormField v-model="op.note" label="备注" type="textarea" class="col-span-2" placeholder="可选备注" />
          </div>
        </div>

        <button class="text-sm text-[--primary] hover:underline font-medium" @click="addOperation">+ 新增步骤</button>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeCellDrawer">取消</BaseButton>
        <BaseButton variant="primary" @click="saveCellDrawer">保存</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import WorkSolutionTableBlock from '@/components/experiments/WorkSolutionTableBlock.vue';
import MSSolutionTableBlock from '@/components/experiments/MSSolutionTableBlock.vue';
import MatrixSampleTableBlock from '@/components/experiments/MatrixSampleTableBlock.vue';
import SplitRecordTableBlock from '@/components/experiments/SplitRecordTableBlock.vue';
import ReferenceStockTableBlock from '@/components/experiments/ReferenceStockTableBlock.vue';
import InjectionSequenceTableBlock from '@/components/experiments/InjectionSequenceTableBlock.vue';
import AdditionSequenceTableBlock from '@/components/experiments/AdditionSequenceTableBlock.vue';
import DilutionRecordTableBlock from '@/components/experiments/DilutionRecordTableBlock.vue';
import PureSolutionStabilityTableBlock from '@/components/experiments/PureSolutionStabilityTableBlock.vue';
import InjectionLCMSRecordTableBlock from '@/components/experiments/InjectionLCMSRecordTableBlock.vue';
import StabilitySampleTableBlock from '@/components/experiments/StabilitySampleTableBlock.vue';
import SolutionPrepTableBlock from '@/components/experiments/SolutionPrepTableBlock.vue';
import { getFormTemplateById } from '@/api/mock/form-templates';
import type { SequenceOperation } from '@/types/experiments';

const router = useRouter();
const route = useRoute();
const templateId = computed(() => route.params.id as string);
const template = computed(() => getFormTemplateById(templateId.value));

const model = ref(createMsModel());
const workModel = ref(createWorkModel());
const matrixSampleModel = ref(createMatrixModel());
const splitModel = ref(createSplitModel());
const referenceModel = ref(createReferenceModel());
const injectionSequenceModel = ref(createInjectionSequenceModel());
const additionSequenceModel = ref(createAdditionSequenceModel());
const lcmModel = ref(createLCMModel());
const stabilityModel = ref(createStabilityModel());
const dilutionModel = ref(createDilutionModel());
const pureStabilityModel = ref(createPureStabilityModel());
const solTopRows = ref<string[][]>([
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
  ['', '', '', '', '', '', ''],
]);
const solBottomRows = ref<string[][]>(Array.from({ length: 3 }, () => Array(10).fill('')));

const drawerOpen = ref(false);
const activeRowIndex = ref(0);
const activeColIndex = ref(0);
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

const cellOperations = ref<SequenceOperation[]>([]);
const requiredValue = ref<string[]>([]);
const drawerTitle = computed(() => `编辑格子执行说明`);
const activeCellLabel = computed(() => `${String.fromCharCode(65 + activeRowIndex.value)}${activeColIndex.value + 1}`);

function openCellDrawer(rowIndex: number, colIndex: number) {
  activeRowIndex.value = rowIndex;
  activeColIndex.value = colIndex;
  ensureOperations();
  const key = `${activeRowIndex.value}-${activeColIndex.value}`;
  cellOperations.value = model.value.cellOperations![key].map(op => ({ ...op }));
  requiredValue.value = cellOperations.value.map(op => op.required ? 'true' : 'false');
  drawerOpen.value = true;
}

function ensureOperations() {
  const key = `${activeRowIndex.value}-${activeColIndex.value}`;
  if (!model.value.cellOperations) model.value.cellOperations = {};
  if (!model.value.cellOperations[key]) {
    model.value.cellOperations[key] = [newOperation()];
  }
}

function newOperation(): SequenceOperation {
  return {
    id: `op-${Date.now()}`,
    action: '',
    substance: '',
    sampleId: '',
    equipment: '',
    volume: 0,
    unit: 'μL',
    scanObject: '',
    required: false,
    step: '',
    note: '',
    scanned: false,
  };
}

function addOperation() {
  cellOperations.value.push(newOperation());
  requiredValue.value.push('false');
}

function removeOperation(id: string) {
  cellOperations.value = cellOperations.value.filter(op => op.id !== id);
  requiredValue.value = cellOperations.value.map(op => op.required ? 'true' : 'false');
}

function saveCellDrawer() {
  const key = `${activeRowIndex.value}-${activeColIndex.value}`;
  model.value.cellOperations![key] = cellOperations.value.map((op, index) => ({ ...op, required: requiredValue.value[index] === 'true' }));
  drawerOpen.value = false;
}

function closeCellDrawer() {
  drawerOpen.value = false;
}

function createMsModel() {
  return {
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
  };
}

function createWorkModel() { return { context: { projectCode: '', methodVersion: '' }, rows: [], sourceBatch: '', diluentInfo: '', pureReagentInfo: '', pipetteNo: '', containerMaterial: '', containerColor: '', lightCondition: '', batchLabel: '', completedAt: '', disposalMethod: '', controlledPaperNo: '', refrigeratorNo: '', signatures: { operator: '', reviewer: '', auditor: '' } }; }
function createMatrixModel() { return { context: { projectCode: '', methodVersion: '' }, rows: [], sourceBatch: '', blankMatrixDisposition: '', blankMatrixFridgeNo: '', pipetteNo: '', containerMaterial: '', containerColor: '', lightConditions: [], tempConditions: [], batchLabel: '', completedAt: '', disposalMethod: '', controlledPaperNo: '', refrigeratorNo: '', signatures: { operator: '', reviewer: '', auditor: '' } }; }
function createSplitModel() { return { context: { projectCode: '' }, rows: [], signatures: { packager: '', reviewer: '', auditor: '' } }; }
function createReferenceModel() { return { basic: { recordType: '分析物', referenceCode: '', referenceName: '', referenceBatch: '', referenceState: '', referenceExpiry: '', correctionFactor: '', balanceCode: '', pipetteCode: '' }, rows: [], solventCode: '', solventBatch: '', diluentName: '', diluentBatch: '', diluentManufacturer: '', diluentExpiry: '', containerMaterial: '', color: '', lightCondition: '', disposalMethod: '', storageRef: '', batchLabel: '', signatures: { operator: '', reviewer: '', auditor: '' } }; }
function createInjectionSequenceModel() {
  return {
    context: { projectCode: '', methodVersion: '', analysisBatchNo: '', runId: '', operatorInfo: '', reviewerInfo: '', auditorInfo: '' },
    rows: Array.from({ length: 12 }, (_, index) => ({ seq: String(index + 1), sampleId: '', dilutionFactor: '', wellPosition: '', remark: '' })),
  };
}

function createAdditionSequenceModel() {
  return {
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
  };
}

function createLCMModel() {
  return {
    context: { projectCode: '', methodVersion: '', analysisBatchNo: '', runId: '' },
    instrumentSubmission: {
      submitType: 'first' as 'first' | 'follow',
      instrumentId: '',
      platePosition: '',
      columnId: '',
      mobilePhaseABatch: '',
      mobilePhaseBBatch: '',
      washPumpBatch: '',
      washPortBatch: '',
      isPureReagent: false,
      isPureReagentStr: 'false',
      reagentName: '',
      reagentBatch: '',
      reagentManufacturer: '',
      reagentExpiry: '',
      injectionVolume: 10,
      acquisitionMethod: '',
      followedBatchNo: '',
    },
    instrumentSignatures: { operator: '', reviewer: '', auditor: '' },
    resultIntegration: {
      disposalMethod: 'discard' as 'discard' | 'store',
      storageLocation: '',
      integrationMethod: '',
      resultSaveName: '',
    },
    resultSignatures: { operator: '', reviewer: '', auditor: '' },
  };
}

function createStabilityModel() {
  return {
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
  };
}

function createDilutionModel() {
  return {
    context: { projectCode: '', analysisBatchNo: '', runId: '' },
    rows: [],
    blankMatrixCode: '',
    pipetteNo: '',
    containerMaterial: '',
    containerColor: '',
    lightConditions: [],
    tempConditions: [],
    completionTime: '',
    signatures: { operator: '', reviewer: '', auditor: '' },
  };
}

function createPureStabilityModel() {
  return {
    context: { projectCode: '' },
    shortTerm: {
      label: '纯溶液短期稳定性考察',
      rows: [newStabilityRow()],
    },
    longTerm: {
      label: '纯溶液长期稳定性考察',
      rows: [newStabilityRow()],
    },
    signatures: { packager: '', auditor: '' },
  };
}

function newStabilityRow() {
  return { sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' };
}

function addRow() { if (!model.value.rows.length) return; model.value.rows.push({ ...model.value.rows[model.value.rows.length - 1], solutionCode: `MS-${String(model.value.rows.length + 1).padStart(2, '0')}` }); }
function copyTemplate() { if (!template.value) return; alert(`已复制模板：${template.value.templateName}`); }
function setDefault() { if (!template.value) return; alert(`已设为默认模板：${template.value.templateName}`); }
function saveDraft() { alert('草稿已保存'); }
function saveAndEnable() { alert('模板已保存并启用'); }
function goBack() { router.push(`/experiments/form-templates/${templateId.value}`); }
function goPreview() { router.push(`/experiments/form-templates/${templateId.value}/preview`); }
</script>
