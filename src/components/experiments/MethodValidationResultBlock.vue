<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[22%]" />
        <col class="w-[12%]" />
        <col class="w-[66%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="mt-title" colspan="3">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">方法学验证分析批考察结果判断表</div>
              <div class="text-[16px] font-medium">BA-SBR17 / 3V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="mt-label" colspan="2">项目编号</td>
          <td class="mt-cell"><CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" /></td>
        </tr>
        <tr>
          <td class="mt-label" colspan="2">分析批编号</td>
          <td class="mt-cell"><CellEditor :value="model.context.analysisBatchNo" :editable="editable" @update="updateContext('analysisBatchNo', $event)" /></td>
        </tr>
        <tr>
          <td class="mt-label" colspan="2">Run ID</td>
          <td class="mt-cell"><CellEditor :value="model.context.runId" :editable="editable" @update="updateContext('runId', $event)" /></td>
        </tr>
        <tr>
          <td class="mt-label" colspan="2">分析物</td>
          <td class="mt-cell"><CellEditor :value="model.context.analyte" :editable="editable" @update="updateContext('analyte', $event)" /></td>
        </tr>
        <tr>
          <td class="mt-section" colspan="3">考察结果判断</td>
        </tr>
        <tr>
          <td class="mt-head text-center">分析批考察内容</td>
          <td class="mt-head text-center">是否满足接受标准</td>
          <td class="mt-head text-center">备注</td>
        </tr>
        <tr v-for="(item, i) in model.items" :key="i" class="h-[36px]">
          <td class="mt-cell bg-[#f3efe0] font-medium">{{ item.label }}</td>
          <td class="mt-cell">
            <div v-if="editable" class="flex items-center gap-3 text-[12px]">
              <label class="inline-flex items-center gap-1"><input type="radio" :value="'pass'" v-model="item.result" @change="updateItem(i, 'result', 'pass')" /><span>是</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" :value="'fail'" v-model="item.result" @change="updateItem(i, 'result', 'fail')" /><span>否</span></label>
              <label v-if="item.partialAllowed" class="inline-flex items-center gap-1"><input type="radio" :value="'partial'" v-model="item.result" @change="updateItem(i, 'result', 'partial')" /><span>部分满足</span></label>
            </div>
            <span v-else :class="resultTone(item.result)">{{ resultLabel(item.result) }}</span>
          </td>
          <td class="mt-cell">
            <CellEditor :value="item.remark" :editable="editable" @update="updateItem(i, 'remark', $event)" />
          </td>
        </tr>
        <tr>
          <td class="mt-label" colspan="2">考察时长</td>
          <td class="mt-cell">
            <div v-if="editable" class="flex items-center gap-2">
              <CellEditor :value="String(model.duration)" :editable="editable" type="number" @update="updateField('duration', Number($event) || 0)" />
              <span class="text-[12px] text-[--muted-foreground]">h</span>
            </div>
            <span v-else>{{ model.duration || '—' }}h</span>
          </td>
        </tr>
        <tr>
          <td class="mt-section" colspan="3">结果判断</td>
        </tr>
        <tr>
          <td class="mt-label">分析批是否通过</td>
          <td class="mt-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-4">
              <label class="inline-flex items-center gap-1"><input type="radio" value="pass" v-model="model.passFail" @change="updateField('passFail', 'pass')" /><span>是</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="fail" v-model="model.passFail" @change="updateField('passFail', 'fail')" /><span>否</span></label>
            </div>
            <span v-else>{{ model.passFail === 'pass' ? '是' : model.passFail === 'fail' ? '否' : '—' }}</span>
          </td>
        </tr>
        <tr>
          <td class="mt-label">考察项是否通过</td>
          <td class="mt-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-4 flex-wrap">
              <label class="inline-flex items-center gap-1"><input type="radio" value="pass" v-model="model.itemPass" @change="updateField('itemPass', 'pass')" /><span>是</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="fail" v-model="model.itemPass" @change="updateField('itemPass', 'fail')" /><span>否</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="partial" v-model="model.itemPass" @change="updateField('itemPass', 'partial')" /><span>部分通过</span></label>
            </div>
            <span v-else>{{ itemPassLabel(model.itemPass) }}</span>
          </td>
        </tr>
        <tr>
          <td class="mt-label">分析批是否有异常情况</td>
          <td class="mt-cell" colspan="2">
            <div v-if="editable" class="flex items-center gap-4">
              <label class="inline-flex items-center gap-1"><input type="radio" value="yes" v-model="model.hasException" @change="updateField('hasException', 'yes')" /><span>是</span></label>
              <label class="inline-flex items-center gap-1"><input type="radio" value="no" v-model="model.hasException" @change="updateField('hasException', 'no')" /><span>否</span></label>
            </div>
            <span v-else>{{ model.hasException === 'yes' ? '是' : model.hasException === 'no' ? '否' : '—' }}</span>
          </td>
        </tr>
        <tr v-if="model.exceptionRemark">
          <td class="mt-label">异常情况说明</td>
          <td class="mt-cell" colspan="2">
            <CellEditor :value="model.exceptionRemark" :editable="editable" @update="updateField('exceptionRemark', $event)" />
          </td>
        </tr>
      </tbody>
    </table>

    <table class="mt-4 w-full min-w-[900px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup><col class="w-[15%]"/><col class="w-[85%]"/></colgroup>
      <tbody>
        <tr><td class="mt-section" colspan="2">签字区</td></tr>
        <tr><td class="mt-label">项目负责人 / 日期</td><td class="mt-cell"><CellEditor :value="model.signatures.lead" :editable="editable" @update="updateSignature('lead', $event)" /></td></tr>
        <tr><td class="mt-label">审核人 / 日期</td><td class="mt-cell"><CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" /></td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
interface Item { label: string; result: 'pass'|'fail'|'partial'|''; remark: string; partialAllowed?: boolean; }
interface ModelValue {
  context: { projectCode?: string; analysisBatchNo?: string; runId?: string; analyte?: string };
  items: Item[];
  duration: number;
  passFail: 'pass'|'fail'|'';
  itemPass: 'pass'|'fail'|'partial'|'';
  hasException: 'yes'|'no'|'';
  exceptionRemark: string;
  signatures: { lead: string; auditor: string };
}
const props = withDefaults(defineProps<{ modelValue: ModelValue; editable?: boolean }>(), { editable: false });
const emit = defineEmits<{ 'update:modelValue': [value: ModelValue] }>();
const model = computed(() => props.modelValue);
const CellEditor = defineComponent({
  props: { value: { type: [String, Number], default: '' }, editable: { type: Boolean, default: false }, type: { type: String, default: 'text' } },
  emits: ['update'],
  setup(cp, { emit: ce }) {
    return () => cp.editable
      ? h('input', { value: cp.value, type: cp.type === 'number' ? 'number' : 'text', class: 'cell-input', onInput: (e: Event) => ce('update', (e.target as HTMLInputElement).value) })
      : h('span', { class: 'block min-h-6 whitespace-pre-wrap' }, cp.value || ' ');
  },
});
function patch(next: Partial<ModelValue>) { emit('update:modelValue', { ...props.modelValue, ...next }); }
function updateContext(k: keyof ModelValue['context'], v: string) { patch({ context: { ...props.modelValue.context, [k]: v } }); }
function updateField(k: string, v: any) { patch({ [k]: v } as Partial<ModelValue>); }
function updateSignature(k: 'lead' | 'auditor', v: string) { patch({ signatures: { ...props.modelValue.signatures, [k]: v } }); }
function updateItem(i: number, k: keyof Item, v: any) { const items = [...props.modelValue.items]; items[i] = { ...items[i], [k]: v }; patch({ items }); }
function resultLabel(r: string) { return { pass: '是', fail: '否', partial: '部分满足' }[r] || '—'; }
function resultTone(r: string) { return { pass: 'text-[--primary] font-semibold', fail: 'text-[--danger] font-semibold', partial: 'text-[--warning] font-semibold' }[r] || 'text-[--muted-foreground]'; }
function itemPassLabel(v: string) { return { pass: '是', fail: '否', partial: '部分通过' }[v] || '—'; }
</script>
<style scoped>
.mt-cell, .mt-label, .mt-section, .mt-title, .mt-head { border: 1px solid #222; padding: 9px 10px; vertical-align: middle; background: #fff; }
.mt-title { text-align: center; padding: 14px 10px; }
.mt-section, .mt-label, .mt-head { font-weight: 600; background: #f7f5ee; }
.mt-section { font-size: 16px; text-align: left; }
.cell-input { width: 100%; border: 0; outline: none; background: transparent; font-size: 13px; color: var(--text-main); }
</style>
