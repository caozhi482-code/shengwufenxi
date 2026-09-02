<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1280px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[26%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="lcm-title" colspan="6">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">液质联用仪提交及结果定量记录表</div>
              <div class="text-[16px] font-medium">BA-SBR10 / 2V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="lcm-label">项目编号</td>
          <td class="lcm-cell" colspan="2">{{ model.context.projectCode || '继承自计划' }}</td>
          <td class="lcm-label">方法版本号</td>
          <td class="lcm-cell" colspan="2">{{ model.context.methodVersion || '继承自计划' }}</td>
        </tr>
        <tr>
          <td class="lcm-label">分析批编号</td>
          <td class="lcm-cell"><CellEditor :value="model.context.analysisBatchNo" :editable="editable" @update="updateContext('analysisBatchNo', $event)" /></td>
          <td class="lcm-label">Run ID</td>
          <td class="lcm-cell" colspan="3"><CellEditor :value="model.context.runId" :editable="editable" @update="updateContext('runId', $event)" /></td>
        </tr>

        <tr>
          <td class="lcm-section" colspan="6">一、仪器提交</td>
        </tr>
        <tr>
          <td class="lcm-label">提交情况</td>
          <td class="lcm-cell" colspan="5">
            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="first" v-model="model.instrumentSubmission.submitType" :disabled="!editable" />
                <span>首批提交</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="follow" v-model="model.instrumentSubmission.submitType" :disabled="!editable" />
                <span>紧跟其他批进样</span>
              </label>
            </div>
          </td>
        </tr>
        <tr>
          <td class="lcm-label">液质联用仪编号</td>
          <td class="lcm-cell bg-[#f3efe0]" colspan="2"><CellEditor :value="model.instrumentSubmission.instrumentId" :editable="editable" @update="updateInstrument('instrumentId', $event)" /></td>
          <td class="lcm-label">板位号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.platePosition" :editable="editable" @update="updateInstrument('platePosition', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">色谱柱编号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.columnId" :editable="editable" @update="updateInstrument('columnId', $event)" /></td>
          <td class="lcm-label">流动相A批号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.mobilePhaseABatch" :editable="editable" @update="updateInstrument('mobilePhaseABatch', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">流动相B批号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.mobilePhaseBBatch" :editable="editable" @update="updateInstrument('mobilePhaseBBatch', $event)" /></td>
          <td class="lcm-label">洗针液(Pump)批号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.washPumpBatch" :editable="editable" @update="updateInstrument('washPumpBatch', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">洗针液(Port)批号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.washPortBatch" :editable="editable" @update="updateInstrument('washPortBatch', $event)" /></td>
          <td class="lcm-label">是否纯试剂</td>
          <td class="lcm-cell">
            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="false" v-model="model.instrumentSubmission.isPureReagentStr" :disabled="!editable" @change="togglePureReagent(false)" />
                <span>否</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="true" v-model="model.instrumentSubmission.isPureReagentStr" :disabled="!editable" @change="togglePureReagent(true)" />
                <span>是</span>
              </label>
            </div>
          </td>
        </tr>
        <tr v-if="model.instrumentSubmission.isPureReagent">
          <td class="lcm-label">试剂名称</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.reagentName" :editable="editable" @update="updateInstrument('reagentName', $event)" /></td>
          <td class="lcm-label">试剂批号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.reagentBatch" :editable="editable" @update="updateInstrument('reagentBatch', $event)" /></td>
        </tr>
        <tr v-if="model.instrumentSubmission.isPureReagent">
          <td class="lcm-label">试剂厂家</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.reagentManufacturer" :editable="editable" @update="updateInstrument('reagentManufacturer', $event)" /></td>
          <td class="lcm-label">试剂失效期</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.reagentExpiry" :editable="editable" @update="updateInstrument('reagentExpiry', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">进样体积</td>
          <td class="lcm-cell"><CellEditor :value="String(model.instrumentSubmission.injectionVolume)" :editable="editable" @update="updateInstrument('injectionVolume', Number($event) || 0)" type="number" /></td>
          <td class="lcm-label">μL</td>
          <td class="lcm-label">采集方法名</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.acquisitionMethod" :editable="editable" @update="updateInstrument('acquisitionMethod', $event)" /></td>
        </tr>
        <tr v-if="model.instrumentSubmission.submitType === 'follow'">
          <td class="lcm-label">紧跟的分析批编号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.followedBatchNo" :editable="editable" @update="updateInstrument('followedBatchNo', $event)" /></td>
          <td class="lcm-label">板位号</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSubmission.platePosition" :editable="editable" @update="updateInstrument('platePosition', $event)" /></td>
        </tr>

        <tr>
          <td class="lcm-section" colspan="6">仪器提交签字区</td>
        </tr>
        <tr>
          <td class="lcm-label">操作人 / 日期</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSignatures.operator" :editable="editable" @update="updateSignature('instrumentSignatures', 'operator', $event)" /></td>
          <td class="lcm-label">现场复核人 / 日期</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.instrumentSignatures.reviewer" :editable="editable" @update="updateSignature('instrumentSignatures', 'reviewer', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">审核人 / 日期</td>
          <td class="lcm-cell" colspan="5"><CellEditor :value="model.instrumentSignatures.auditor" :editable="editable" @update="updateSignature('instrumentSignatures', 'auditor', $event)" /></td>
        </tr>

        <tr>
          <td class="lcm-section" colspan="6">二、结果积分</td>
        </tr>
        <tr>
          <td class="lcm-label">进样完成后处置</td>
          <td class="lcm-cell" colspan="5">
            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="discard" v-model="model.resultIntegration.disposalMethod" :disabled="!editable" @change="handleDisposalChange('discard')" />
                <span>直接废弃</span>
              </label>
              <label class="inline-flex items-center gap-1">
                <input type="radio" value="store" v-model="model.resultIntegration.disposalMethod" :disabled="!editable" @change="handleDisposalChange('store')" />
                <span>储存于</span>
              </label>
            </div>
          </td>
        </tr>
        <tr v-if="model.resultIntegration.disposalMethod === 'store'">
          <td class="lcm-label">储存位置</td>
          <td class="lcm-cell" colspan="5"><CellEditor :value="model.resultIntegration.storageLocation" :editable="editable" @update="updateResult('storageLocation', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">积分方法名</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.resultIntegration.integrationMethod" :editable="editable" @update="updateResult('integrationMethod', $event)" /></td>
          <td class="lcm-label">积分结果保存名</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.resultIntegration.resultSaveName" :editable="editable" @update="updateResult('resultSaveName', $event)" /></td>
        </tr>

        <tr>
          <td class="lcm-section" colspan="6">结果积分签字区</td>
        </tr>
        <tr>
          <td class="lcm-label">操作人 / 日期</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.resultSignatures.operator" :editable="editable" @update="updateSignature('resultSignatures', 'operator', $event)" /></td>
          <td class="lcm-label">现场复核人 / 日期</td>
          <td class="lcm-cell" colspan="2"><CellEditor :value="model.resultSignatures.reviewer" :editable="editable" @update="updateSignature('resultSignatures', 'reviewer', $event)" /></td>
        </tr>
        <tr>
          <td class="lcm-label">审核人 / 日期</td>
          <td class="lcm-cell" colspan="5"><CellEditor :value="model.resultSignatures.auditor" :editable="editable" @update="updateSignature('resultSignatures', 'auditor', $event)" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';

interface ModelValue {
  context: {
    projectCode: string;
    methodVersion: string;
    analysisBatchNo: string;
    runId: string;
  };
  instrumentSubmission: {
    submitType: 'first' | 'follow';
    instrumentId: string;
    platePosition: string;
    columnId: string;
    mobilePhaseABatch: string;
    mobilePhaseBBatch: string;
    washPumpBatch: string;
    washPortBatch: string;
    isPureReagent: boolean;
    isPureReagentStr: string;
    reagentName?: string;
    reagentBatch?: string;
    reagentManufacturer?: string;
    reagentExpiry?: string;
    injectionVolume: number;
    acquisitionMethod: string;
    followedBatchNo?: string;
  };
  instrumentSignatures: {
    operator: string;
    reviewer: string;
    auditor: string;
  };
  resultIntegration: {
    disposalMethod: 'discard' | 'store';
    storageLocation?: string;
    integrationMethod: string;
    resultSaveName: string;
  };
  resultSignatures: {
    operator: string;
    reviewer: string;
    auditor: string;
  };
}

const props = withDefaults(defineProps<{
  modelValue: ModelValue;
  editable?: boolean;
}>(), {
  editable: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: ModelValue];
}>();

const model = computed(() => props.modelValue);

const CellEditor = defineComponent({
  props: {
    value: { type: [String, Number], default: '' },
    editable: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
  },
  emits: ['update'],
  setup(componentProps, { emit: componentEmit }) {
    return () => componentProps.editable
      ? h('input', {
          value: componentProps.value,
          type: componentProps.type === 'number' ? 'number' : 'text',
          class: 'cell-input',
          onInput: (event: Event) => componentEmit('update', (event.target as HTMLInputElement).value),
        })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, componentProps.value || ' ');
  },
});

function patch(next: Partial<ModelValue>) {
  emit('update:modelValue', { ...props.modelValue, ...next });
}

function updateContext(key: keyof ModelValue['context'], value: string) {
  patch({ context: { ...props.modelValue.context, [key]: value } });
}

function updateInstrument(key: string, value: any) {
  patch({ instrumentSubmission: { ...props.modelValue.instrumentSubmission, [key]: value } });
}

function updateResult(key: string, value: string) {
  patch({ resultIntegration: { ...props.modelValue.resultIntegration, [key]: value } });
}

function updateSignature(section: 'instrumentSignatures' | 'resultSignatures', key: string, value: string) {
  patch({ [section]: { ...props.modelValue[section], [key]: value } });
}

function togglePureReagent(value: boolean) {
  const next = { ...props.modelValue.instrumentSubmission };
  next.isPureReagent = value;
  next.isPureReagentStr = String(value);
  if (!value) {
    next.reagentName = '';
    next.reagentBatch = '';
    next.reagentManufacturer = '';
    next.reagentExpiry = '';
  }
  patch({ instrumentSubmission: next });
}

function handleDisposalChange(method: 'discard' | 'store') {
  const next = { ...props.modelValue.resultIntegration };
  next.disposalMethod = method;
  if (method === 'discard') {
    next.storageLocation = '';
  }
  patch({ resultIntegration: next });
}
</script>

<style scoped>
.lcm-cell,
.lcm-label,
.lcm-section,
.lcm-title {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.lcm-title {
  text-align: center;
}

.lcm-label,
.lcm-section {
  font-weight: 600;
  background: #f7f5ee;
}

.lcm-section {
  font-size: 16px;
  text-align: left;
}

.cell-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-main);
}
</style>
