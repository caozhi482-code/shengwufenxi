<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1200px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[16%]" />
        <col class="w-[12%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
        <col class="w-[16%]" />
        <col class="w-[14%]" />
        <col class="w-[14%]" />
      </colgroup>
      <tbody>
        <!-- 标题行 -->
        <tr>
          <td class="fz-title" colspan="7">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">冻融循环稳定性考察记录表</div>
              <div class="text-[16px] font-medium">BA-SBR15 / 2V</div>
            </div>
          </td>
        </tr>

        <!-- 上下文区 -->
        <tr>
          <td class="fz-label" colspan="2">项目编号</td>
          <td class="fz-cell" colspan="5">
            <CellEditor :value="model.context.projectCode" :editable="editable" @update="updateContext('projectCode', $event)" />
          </td>
        </tr>

        <!-- 主表格 -->
        <tr>
          <td class="fz-section" colspan="7">冻融循环考察记录</td>
        </tr>
        <tr>
          <td class="fz-head text-center">考察类别</td>
          <td class="fz-head text-center">样品代码</td>
          <td class="fz-head text-center">冰箱编号</td>
          <td class="fz-head text-center">取出人/日期时间</td>
          <td class="fz-head text-center">融化条件</td>
          <td class="fz-head text-center">放入人/日期时间</td>
          <td class="fz-head text-center">所用分析批</td>
        </tr>

        <!-- -20℃ 冻融行 -->
        <template v-for="(row, ri) in model.rows20" :key="`20-${ri}`">
          <tr class="h-[42px]">
            <td class="fz-cell bg-[#f3efe0]">
              <CellEditor v-if="ri === 0" :value="row.category" :editable="editable" @update="update20(ri, 'category', $event)" />
              <span v-else class="text-[--muted-foreground]">—</span>
            </td>
            <td class="fz-cell"><CellEditor :value="row.sampleCode" :editable="editable" @update="update20(ri, 'sampleCode', $event)" /></td>
            <td class="fz-cell"><CellEditor :value="row.fridgeId" :editable="editable" @update="update20(ri, 'fridgeId', $event)" /></td>
            <td class="fz-cell"><CellEditor :value="row.removeTime" :editable="editable" type="datetime-local" @update="update20(ri, 'removeTime', $event)" /></td>
            <td class="fz-cell">
              <div v-if="editable" class="flex items-center gap-3 text-[11px] flex-wrap">
                <span class="text-[--muted-foreground]">温度：</span>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.tempConditions?.includes('RT')" @update:checked="toggle20Temp(ri, 'RT')" />
                  <span>RT</span>
                </label>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.tempConditions?.includes('WI')" @update:checked="toggle20Temp(ri, 'WI')" />
                  <span>WI</span>
                </label>
                <span class="text-[--muted-foreground] ml-2">光照：</span>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.lightConditions?.includes('白色荧光灯')" @update:checked="toggle20Light(ri, '白色荧光灯')" />
                  <span>白色荧光灯</span>
                </label>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.lightConditions?.includes('黄光灯')" @update:checked="toggle20Light(ri, '黄光灯')" />
                  <span>黄光灯</span>
                </label>
              </div>
              <span v-else class="text-[11px]">{{ buildConditionDisplay(row) }}</span>
            </td>
            <td class="fz-cell"><CellEditor :value="row.putBackTime" :editable="editable" type="datetime-local" @update="update20(ri, 'putBackTime', $event)" /></td>
            <td class="fz-cell"><CellEditor :value="row.analysisBatch" :editable="editable" @update="update20(ri, 'analysisBatch', $event)" /></td>
          </tr>
        </template>

        <!-- -80℃ 冻融行 -->
        <template v-for="(row, ri) in model.rows80" :key="`80-${ri}`">
          <tr class="h-[42px]">
            <td class="fz-cell bg-[#f3efe0]">
              <CellEditor v-if="ri === 0" :value="row.category" :editable="editable" @update="update80(ri, 'category', $event)" />
              <span v-else class="text-[--muted-foreground]">—</span>
            </td>
            <td class="fz-cell"><CellEditor :value="row.sampleCode" :editable="editable" @update="update80(ri, 'sampleCode', $event)" /></td>
            <td class="fz-cell"><CellEditor :value="row.fridgeId" :editable="editable" @update="update80(ri, 'fridgeId', $event)" /></td>
            <td class="fz-cell"><CellEditor :value="row.removeTime" :editable="editable" type="datetime-local" @update="update80(ri, 'removeTime', $event)" /></td>
            <td class="fz-cell">
              <div v-if="editable" class="flex items-center gap-3 text-[11px] flex-wrap">
                <span class="text-[--muted-foreground]">温度：</span>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.tempConditions?.includes('RT')" @update:checked="toggle80Temp(ri, 'RT')" />
                  <span>RT</span>
                </label>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.tempConditions?.includes('WI')" @update:checked="toggle80Temp(ri, 'WI')" />
                  <span>WI</span>
                </label>
                <span class="text-[--muted-foreground] ml-2">光照：</span>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.lightConditions?.includes('白色荧光灯')" @update:checked="toggle80Light(ri, '白色荧光灯')" />
                  <span>白色荧光灯</span>
                </label>
                <label class="inline-flex items-center gap-1">
                  <BaseCheckbox :checked="row.lightConditions?.includes('黄光灯')" @update:checked="toggle80Light(ri, '黄光灯')" />
                  <span>黄光灯</span>
                </label>
              </div>
              <span v-else class="text-[11px]">{{ buildConditionDisplay(row) }}</span>
            </td>
            <td class="fz-cell"><CellEditor :value="row.putBackTime" :editable="editable" type="datetime-local" @update="update80(ri, 'putBackTime', $event)" /></td>
            <td class="fz-cell"><CellEditor :value="row.analysisBatch" :editable="editable" @update="update80(ri, 'analysisBatch', $event)" /></td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- 新增行按钮 -->
    <div v-if="editable" class="mt-3 flex gap-4">
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="add20Row">+ -20℃ 新增一行</button>
      <button class="text-[--primary] text-sm font-medium hover:underline" @click="add80Row">+ -80℃ 新增一行</button>
    </div>

    <!-- 签字区 -->
    <table class="mt-4 w-full min-w-[1200px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[15%]" />
        <col class="w-[85%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="fz-section" colspan="2">签字区</td>
        </tr>
        <tr>
          <td class="fz-label">分装人 / 日期</td>
          <td class="fz-cell">
            <CellEditor :value="model.signatures.packager" :editable="editable" @update="updateSignature('packager', $event)" />
          </td>
        </tr>
        <tr>
          <td class="fz-label">审核人 / 日期</td>
          <td class="fz-cell">
            <CellEditor :value="model.signatures.auditor" :editable="editable" @update="updateSignature('auditor', $event)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';

interface FreezeThawRow {
  category: string;
  sampleCode: string;
  fridgeId: string;
  removeTime: string;
  tempConditions: string[];
  lightConditions: string[];
  putBackTime: string;
  analysisBatch: string;
}

interface ModelValue {
  context: { projectCode?: string };
  rows20: FreezeThawRow[];
  rows80: FreezeThawRow[];
  signatures: { packager: string; auditor: string };
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
          type: componentProps.type === 'datetime-local' ? 'datetime-local' : 'text',
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

function updateSignature(key: 'packager' | 'auditor', value: string) {
  patch({ signatures: { ...props.modelValue.signatures, [key]: value } });
}

function update20(index: number, key: keyof FreezeThawRow, value: any) {
  const rows = [...props.modelValue.rows20];
  rows[index] = { ...rows[index], [key]: value };
  patch({ rows20: rows });
}

function update80(index: number, key: keyof FreezeThawRow, value: any) {
  const rows = [...props.modelValue.rows80];
  rows[index] = { ...rows[index], [key]: value };
  patch({ rows80: rows });
}

function toggle20Temp(index: number, condition: string) {
  const rows = [...props.modelValue.rows20];
  const current = [...(rows[index].tempConditions || [])];
  const i = current.indexOf(condition);
  if (i >= 0) current.splice(i, 1); else current.push(condition);
  rows[index] = { ...rows[index], tempConditions: current };
  patch({ rows20: rows });
}

function toggle20Light(index: number, condition: string) {
  const rows = [...props.modelValue.rows20];
  const current = [...(rows[index].lightConditions || [])];
  const i = current.indexOf(condition);
  if (i >= 0) current.splice(i, 1); else current.push(condition);
  rows[index] = { ...rows[index], lightConditions: current };
  patch({ rows20: rows });
}

function toggle80Temp(index: number, condition: string) {
  const rows = [...props.modelValue.rows80];
  const current = [...(rows[index].tempConditions || [])];
  const i = current.indexOf(condition);
  if (i >= 0) current.splice(i, 1); else current.push(condition);
  rows[index] = { ...rows[index], tempConditions: current };
  patch({ rows80: rows });
}

function toggle80Light(index: number, condition: string) {
  const rows = [...props.modelValue.rows80];
  const current = [...(rows[index].lightConditions || [])];
  const i = current.indexOf(condition);
  if (i >= 0) current.splice(i, 1); else current.push(condition);
  rows[index] = { ...rows[index], lightConditions: current };
  patch({ rows80: rows });
}

function newRow(prefix: string): FreezeThawRow {
  return {
    category: '',
    sampleCode: '',
    fridgeId: prefix,
    removeTime: '',
    tempConditions: [],
    lightConditions: [],
    putBackTime: '',
    analysisBatch: '',
  };
}

function add20Row() {
  patch({ rows20: [...props.modelValue.rows20, newRow('IE-FZ-20d-')] });
}

function add80Row() {
  patch({ rows80: [...props.modelValue.rows80, newRow('IE-FZ-80d-')] });
}

function buildConditionDisplay(row: FreezeThawRow): string {
  const parts: string[] = [];
  if (row.tempConditions?.length) parts.push(row.tempConditions.join(' / '));
  if (row.lightConditions?.length) parts.push(row.lightConditions.join(' / '));
  return parts.join('  ') || '—';
}
</script>

<style scoped>
.fz-cell,
.fz-label,
.fz-section,
.fz-title,
.fz-head {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.fz-title {
  text-align: center;
  padding: 14px 10px;
}

.fz-section,
.fz-label,
.fz-head {
  font-weight: 600;
  background: #f7f5ee;
}

.fz-section {
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
