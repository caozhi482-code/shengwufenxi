<template>
  <div class="space-y-5">
    <BasePageHeader title="方法管理" subtitle="集中维护积分方法文件管理库与采集方法库，供实验员新增、查询和后续实验任务引用">
      <template #extra>
        <BaseButton variant="primary" @click="openCreateDrawer(activeKind)">新增{{ activeKindLabel }}</BaseButton>
      </template>
    </BasePageHeader>

    <BaseSummaryCard :cards="summaryCards" />

    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="entry in methodLibraryKinds"
        :key="entry.value"
        type="button"
        :class="[
          'text-left rounded-[--radius-lg] border bg-white p-5 shadow-[var(--shadow-card)] transition-all',
          activeKind === entry.value ? 'border-[--primary] ring-2 ring-[--primary-soft]' : 'border-[--border] hover:border-[--primary-border]'
        ]"
        @click="selectKind(entry.value)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-base font-bold text-[--foreground]">{{ entry.label }}</div>
            <div class="mt-2 text-sm leading-6 text-[--muted-foreground]">{{ entry.description }}</div>
          </div>
          <BaseTag :tone="activeKind === entry.value ? 'success' : 'neutral'">{{ kindCount(entry.value) }} 条</BaseTag>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-[--border] pt-3 text-xs text-[--muted-foreground]">
          <span>实验员维护入口</span>
          <span class="text-[--primary] font-medium">进入台账 →</span>
        </div>
      </button>
    </div>

    <BaseCard>
      <template #header>
        <div class="flex items-center justify-between w-full gap-3">
          <div>
            <div class="text-base font-bold text-[--foreground]">{{ activeKindLabel }}</div>
            <div class="mt-1 text-xs text-[--muted-foreground]">字段已按甲方提供的《副本方法模板.xlsx》拆分，后续可继续补充校验和审批流</div>
          </div>
          <BaseButton variant="primary" size="sm" @click="openCreateDrawer(activeKind)">新增{{ activeKindLabel }}</BaseButton>
        </div>
      </template>

      <div class="grid grid-cols-4 gap-3 items-end mb-4">
        <BaseFormField label="搜索" placeholder="方法名称 / 编号 / 分析物 / 项目编号" v-model="search" />
        <BaseFormField label="状态" type="select" :options="methodLibraryStatuses" v-model="statusFilter" />
        <BaseFormField label="负责人" placeholder="实验员姓名" v-model="ownerFilter" />
        <div class="flex gap-2">
          <BaseButton variant="primary" size="sm" @click="applySearch">查询</BaseButton>
          <BaseButton variant="secondary" size="sm" @click="resetFilters">重置</BaseButton>
        </div>
      </div>

      <BaseTable
        :data="tableRows"
        :columns="columns"
        :pagination="pagination"
        @row-click="openDetail"
        @page-change="page = $event"
      >
        <template #cell-methodName="{ row }">
          <div class="space-y-1">
            <div class="font-semibold text-[--text-main]">{{ row.methodName }}</div>
            <div class="text-xs text-[--muted-foreground] line-clamp-1">{{ row.remark }}</div>
          </div>
        </template>
        <template #cell-methodCode="{ row }">
          <div class="font-mono text-xs font-semibold text-[--primary]">{{ row.methodCode }}</div>
        </template>
        <template #cell-version="{ row }">
          <BaseTag tone="neutral">{{ row.version }}</BaseTag>
        </template>
        <template #cell-status="{ row }">
          <BaseTag :tone="statusTone(row.status)">{{ statusLabel(row.status) }}</BaseTag>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2 flex-wrap">
            <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="openDetail(row)">详情</button>
            <button class="text-[--info] text-xs font-medium hover:underline" @click.stop="openCreateDrawer(row.kind)">新增同类</button>
            <button class="text-[--muted-foreground] text-xs hover:underline" @click.stop="archiveRecord(row)">归档</button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseDrawer :open="drawerOpen" :title="drawerTitle" width-class="max-w-5xl" @close="closeDrawer">
      <div class="space-y-5">
        <div class="rounded-lg border border-[--primary-border] bg-[--primary-soft] p-4">
          <div class="text-sm font-semibold text-[--primary]">{{ drawerKindLabel }}</div>
          <div class="mt-1 text-xs leading-5 text-[--muted-foreground]">
            {{ drawerKind === 'integration' ? '字段来自 Excel 的「积分方法」页，支持一个方法下录入多个积分对象参数。' : '字段来自 Excel 的「采集方法」页，按色谱条件、洗脱程序、切换阀、质谱条件和 MRM 参数分组录入。' }}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <BaseFormField label="方法名称" placeholder="如：ZCT-V1" v-model="draftForm.methodName" />
          <BaseFormField label="方法编号" placeholder="可后续自动生成" v-model="draftForm.methodCode" />
          <BaseFormField label="版本" placeholder="如：V1.0 / VAL1" v-model="draftForm.version" />
          <BaseFormField label="适用项目" placeholder="项目编号或项目名称" v-model="draftForm.projectCode" />
          <BaseFormField label="分析物" placeholder="如：AAAA / ZCT" v-model="draftForm.analyte" />
          <BaseFormField label="负责人" placeholder="实验员" v-model="draftForm.owner" />
        </div>

        <template v-if="drawerKind === 'integration'">
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-[--foreground]">积分对象参数</div>
                <div class="text-xs text-[--muted-foreground] mt-1">每行对应 Excel 中一个积分对象，如待测物或内标。</div>
              </div>
              <BaseButton variant="secondary" size="sm" @click="addIntegrationRow">新增积分对象</BaseButton>
            </div>
            <div class="overflow-x-auto rounded-lg border border-[--border]">
              <table class="w-full min-w-[1200px] text-sm">
                <thead class="bg-[--surface-muted] text-xs text-[--muted-foreground]">
                  <tr>
                    <th v-for="column in integrationColumns" :key="column.key" class="px-3 py-2 text-left font-semibold">{{ column.label }}</th>
                    <th class="px-3 py-2 text-left font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in draftForm.integrationRows" :key="index" class="border-t border-[--border]">
                    <td v-for="column in integrationColumns" :key="column.key" class="px-2 py-2">
                      <input v-model="row[column.key]" class="w-full rounded border border-[--border] px-2 py-1.5 outline-none focus:border-[--primary]" />
                    </td>
                    <td class="px-3 py-2">
                      <button class="text-xs text-[--danger] hover:underline" @click="removeIntegrationRow(index)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="space-y-3">
            <div class="text-sm font-bold text-[--foreground]">色谱条件</div>
            <div class="grid grid-cols-2 gap-3">
              <BaseFormField label="色谱柱" v-model="draftForm.acquisition.chromatographicColumn" />
              <BaseFormField label="预柱" v-model="draftForm.acquisition.guardColumn" />
              <BaseFormField label="流动相A（Mobile Phase A）" v-model="draftForm.acquisition.mobilePhaseA" />
              <BaseFormField label="流动相B（Mobile Phase B）" v-model="draftForm.acquisition.mobilePhaseB" />
              <BaseFormField label="流速（Flow Rate）" v-model="draftForm.acquisition.flowRate" />
              <BaseFormField label="柱温（Column Temperature）" v-model="draftForm.acquisition.columnTemperature" />
              <BaseFormField label="自动进样器温度" v-model="draftForm.acquisition.sampleTrayTemperature" />
              <BaseFormField label="进样体积（Injection Volume）" v-model="draftForm.acquisition.injectionVolume" />
              <BaseFormField label="自动进样清洗模式（Rinse Mode）" v-model="draftForm.acquisition.rinseMode" />
              <BaseFormField label="自动进样器洗针体积" v-model="draftForm.acquisition.rinsingVolume" />
              <BaseFormField label="进样针清洗浸泡时间" v-model="draftForm.acquisition.rinseDipTime" />
              <BaseFormField label="进样针清洗方法" v-model="draftForm.acquisition.rinseMethod" />
              <BaseFormField label="进样针清洗时间" v-model="draftForm.acquisition.rinseTime" />
              <BaseFormField label="自动进样器清洗液" v-model="draftForm.acquisition.rinseSolution" />
            </div>
          </section>

          <EditableMiniTable title="洗脱程序" :columns="gradientColumns" :rows="draftForm.gradientRows" add-label="新增洗脱行" @add="addGradientRow" @remove="removeGradientRow" />
          <EditableMiniTable title="切换阀（Integrate Valve）" :columns="valveColumns" :rows="draftForm.valveRows" add-label="新增切换阀行" @add="addValveRow" @remove="removeValveRow" />

          <section class="space-y-3">
            <div class="text-sm font-bold text-[--foreground]">质谱条件</div>
            <div class="grid grid-cols-2 gap-3">
              <BaseFormField label="离子源" v-model="draftForm.acquisition.ionSource" />
              <BaseFormField label="离子化模式（Ionization）" v-model="draftForm.acquisition.ionization" />
              <BaseFormField label="检测模式（Mode）" v-model="draftForm.acquisition.detectionMode" />
              <BaseFormField label="碰撞池气体（Collision Gas）" v-model="draftForm.acquisition.collisionGas" />
              <BaseFormField label="气帘气（Curtain Gas）" v-model="draftForm.acquisition.curtainGas" />
              <BaseFormField label="雾化气（GS1）" v-model="draftForm.acquisition.gs1" />
              <BaseFormField label="辅助气（GS2）" v-model="draftForm.acquisition.gs2" />
              <BaseFormField label="电喷雾电压" v-model="draftForm.acquisition.ionSprayVoltage" />
              <BaseFormField label="涡旋离子喷雾温度" v-model="draftForm.acquisition.turboIonSprayTemperature" />
              <BaseFormField label="质谱分辨率" v-model="draftForm.acquisition.resolution" />
            </div>
          </section>

          <EditableMiniTable title="其他质谱参数 / MRM" :columns="mrmColumns" :rows="draftForm.mrmRows" add-label="新增 MRM 行" @add="addMrmRow" @remove="removeMrmRow" />
        </template>

        <BaseFormField label="备注" type="textarea" placeholder="可记录方法用途、来源、适用范围等说明" v-model="draftForm.remark" />
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeDrawer">取消</BaseButton>
        <BaseButton variant="primary" @click="saveDraft">保存记录</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseSummaryCard from '@/components/base/BaseSummaryCard.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import { methodLibraryKinds, methodLibraryRecords, methodLibraryStatuses } from '@/api/mock/method-management';
import type { MethodLibraryKind, MethodLibraryRecord, MethodLibraryStatus } from '@/api/mock/method-management';

type DraftForm = ReturnType<typeof createEmptyDraft>;
type EditableRow = Record<string, string>;

const EditableMiniTable = defineComponent({
  name: 'EditableMiniTable',
  props: {
    title: { type: String, required: true },
    addLabel: { type: String, required: true },
    columns: { type: Array as () => Array<{ key: string; label: string }>, required: true },
    rows: { type: Array as () => EditableRow[], required: true },
  },
  emits: ['add', 'remove'],
  setup(props, { emit }) {
    return () => h('section', { class: 'space-y-3' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', { class: 'text-sm font-bold text-[--foreground]' }, props.title),
        h(BaseButton, { variant: 'secondary', size: 'sm', onClick: () => emit('add') }, () => props.addLabel),
      ]),
      h('div', { class: 'overflow-x-auto rounded-lg border border-[--border]' }, [
        h('table', { class: 'w-full min-w-[900px] text-sm' }, [
          h('thead', { class: 'bg-[--surface-muted] text-xs text-[--muted-foreground]' }, [
            h('tr', [
              ...props.columns.map(column => h('th', { class: 'px-3 py-2 text-left font-semibold', key: column.key }, column.label)),
              h('th', { class: 'px-3 py-2 text-left font-semibold' }, '操作'),
            ]),
          ]),
          h('tbody', props.rows.map((row, index) => h('tr', { class: 'border-t border-[--border]', key: index }, [
            ...props.columns.map(column => h('td', { class: 'px-2 py-2', key: column.key }, [
              h('input', {
                class: 'w-full rounded border border-[--border] px-2 py-1.5 outline-none focus:border-[--primary]',
                value: row[column.key],
                onInput: (event: Event) => { row[column.key] = (event.target as HTMLInputElement).value; },
              }),
            ])),
            h('td', { class: 'px-3 py-2' }, [h('button', { class: 'text-xs text-[--danger] hover:underline', onClick: () => emit('remove', index) }, '删除')]),
          ]))),
        ]),
      ]),
    ]);
  },
});

const records = ref<MethodLibraryRecord[]>([...methodLibraryRecords]);
const activeKind = ref<MethodLibraryKind>('integration');
const search = ref('');
const statusFilter = ref('');
const ownerFilter = ref('');
const page = ref(1);
const pageSize = 8;
const drawerOpen = ref(false);
const drawerKind = ref<MethodLibraryKind>('integration');
const draftForm = ref<DraftForm>(createEmptyDraft('integration'));

const integrationColumns = [
  { key: 'objectName', label: '积分对象' },
  { key: 'minPeakHeight', label: '最小峰高 / Min Peak Height' },
  { key: 'smoothingWidth', label: '平滑宽度 / Smoothing Width' },
  { key: 'expectedRt', label: '预期保留时间 Expected RT(min)' },
  { key: 'rtWindow', label: '保留时间窗 / RT Window(sec)' },
  { key: 'noisePercent', label: '噪声比 / Noise Percent' },
  { key: 'peakSplittingFactor', label: '峰分裂因子 / Peak Splitting Factor' },
  { key: 'baseSubWindow', label: '基线子窗口 / Base Sub Window(min)' },
  { key: 'fitType', label: '回归类型 / Fit Type' },
  { key: 'weighting', label: '权重 / Weighting' },
];

const gradientColumns = [
  { key: 'time', label: 'Time(min)' },
  { key: 'module', label: 'Module' },
  { key: 'event', label: 'Event' },
  { key: 'parameter', label: 'Parameter(%)' },
];
const valveColumns = [
  { key: 'time', label: 'Time(min)' },
  { key: 'position', label: 'Position' },
];
const mrmColumns = [
  { key: 'compoundType', label: '化合物类别' },
  { key: 'compoundName', label: '化合物名称（代码）' },
  { key: 'mrm', label: '监测离子对（MRM）' },
  { key: 'dwellTime', label: '停留时间(ms)' },
  { key: 'dp', label: '去簇电压 DP(V)' },
  { key: 'ep', label: '入口电压 EP(V)' },
  { key: 'ce', label: '碰撞能量 CE(V)' },
  { key: 'cxp', label: '碰撞室出口电压 CXP(V)' },
];

const columns = [
  { key: 'methodName', label: '方法名称' },
  { key: 'methodCode', label: '方法编号' },
  { key: 'version', label: '版本' },
  { key: 'projectCode', label: '适用项目' },
  { key: 'analyte', label: '分析物' },
  { key: 'instrument', label: '平台/仪器' },
  { key: 'owner', label: '负责人' },
  { key: 'status', label: '状态' },
  { key: 'updatedAt', label: '更新时间' },
  { key: 'actions', label: '操作' },
];

const activeKindLabel = computed(() => kindLabel(activeKind.value));
const drawerKindLabel = computed(() => kindLabel(drawerKind.value));
const drawerTitle = computed(() => `新增${drawerKindLabel.value}`);

const filteredRecords = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  const ownerKeyword = ownerFilter.value.trim().toLowerCase();
  return records.value.filter(record => {
    if (record.kind !== activeKind.value) return false;
    if (statusFilter.value && record.status !== statusFilter.value) return false;
    if (ownerKeyword && !record.owner.toLowerCase().includes(ownerKeyword)) return false;
    if (keyword) {
      const haystack = [record.methodName, record.methodCode, record.projectCode, record.analyte, record.instrument, record.owner].join(' ').toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });
});

const tableRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRecords.value.slice(start, start + pageSize);
});

const pagination = computed(() => ({
  page: page.value,
  total: filteredRecords.value.length,
  pages: Math.max(1, Math.ceil(filteredRecords.value.length / pageSize)),
}));

const summaryCards = computed(() => [
  { label: '方法总数', value: records.value.length },
  { label: '积分方法文件', value: records.value.filter(record => record.kind === 'integration').length },
  { label: '采集方法', value: records.value.filter(record => record.kind === 'acquisition').length },
  { label: '启用中', value: records.value.filter(record => record.status === 'enabled').length },
]);

function selectKind(kind: MethodLibraryKind) {
  activeKind.value = kind;
  page.value = 1;
}

function kindLabel(kind: MethodLibraryKind) {
  return methodLibraryKinds.find(entry => entry.value === kind)?.label ?? '方法库';
}

function kindCount(kind: MethodLibraryKind) {
  return records.value.filter(record => record.kind === kind).length;
}

function statusLabel(status: MethodLibraryStatus): string {
  const map: Record<MethodLibraryStatus, string> = { draft: '草稿', enabled: '启用', archived: '归档' };
  return map[status];
}

function statusTone(status: MethodLibraryStatus): 'success' | 'warning' | 'neutral' {
  const map: Record<MethodLibraryStatus, 'success' | 'warning' | 'neutral'> = { enabled: 'success', draft: 'warning', archived: 'neutral' };
  return map[status];
}

function applySearch() { page.value = 1; }
function resetFilters() {
  search.value = '';
  statusFilter.value = '';
  ownerFilter.value = '';
  page.value = 1;
}

function openCreateDrawer(kind: MethodLibraryKind) {
  drawerKind.value = kind;
  draftForm.value = createEmptyDraft(kind);
  drawerOpen.value = true;
}

function closeDrawer() { drawerOpen.value = false; }

function saveDraft() {
  const kind = drawerKind.value;
  const next: MethodLibraryRecord = {
    id: `${kind === 'integration' ? 'INT' : 'ACQ'}-${String(records.value.filter(record => record.kind === kind).length + 1).padStart(3, '0')}`,
    kind,
    methodName: draftForm.value.methodName || `未命名${kindLabel(kind)}`,
    methodCode: draftForm.value.methodCode || '待生成',
    version: draftForm.value.version || '待定',
    projectCode: draftForm.value.projectCode || '待关联',
    analyte: draftForm.value.analyte || inferredAnalyte(),
    instrument: kind === 'integration' ? '积分软件待定' : (draftForm.value.acquisition.detectionMode || '采集仪器待定'),
    owner: draftForm.value.owner || '当前实验员',
    status: 'draft',
    updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    remark: draftForm.value.remark || methodSummary(kind),
  };
  records.value.unshift(next);
  activeKind.value = kind;
  closeDrawer();
}

function openDetail(row: MethodLibraryRecord) {
  alert(`${kindLabel(row.kind)}\n${row.methodName}\n后续可扩展为完整详情页，展示本次录入字段。`);
}

function archiveRecord(row: MethodLibraryRecord) {
  row.status = 'archived';
  row.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false });
}

function addIntegrationRow() { draftForm.value.integrationRows.push(createIntegrationRow()); }
function removeIntegrationRow(index: number) {
  if (draftForm.value.integrationRows.length <= 1) return;
  draftForm.value.integrationRows.splice(index, 1);
}
function addGradientRow() { draftForm.value.gradientRows.push(createGradientRow()); }
function removeGradientRow(index: number) {
  if (draftForm.value.gradientRows.length <= 1) return;
  draftForm.value.gradientRows.splice(index, 1);
}
function addValveRow() { draftForm.value.valveRows.push(createValveRow()); }
function removeValveRow(index: number) {
  if (draftForm.value.valveRows.length <= 1) return;
  draftForm.value.valveRows.splice(index, 1);
}
function addMrmRow() { draftForm.value.mrmRows.push(createMrmRow()); }
function removeMrmRow(index: number) {
  if (draftForm.value.mrmRows.length <= 1) return;
  draftForm.value.mrmRows.splice(index, 1);
}

function inferredAnalyte() {
  return draftForm.value.integrationRows.find(row => row.objectName)?.objectName || draftForm.value.mrmRows.find(row => row.compoundName)?.compoundName || '待填写';
}

function methodSummary(kind: MethodLibraryKind) {
  if (kind === 'integration') return `包含 ${draftForm.value.integrationRows.length} 个积分对象参数`;
  return `包含 ${draftForm.value.gradientRows.length} 条洗脱程序、${draftForm.value.valveRows.length} 条切换阀、${draftForm.value.mrmRows.length} 条 MRM 参数`;
}

function createEmptyDraft(kind: MethodLibraryKind) {
  return {
    kind,
    methodName: kind === 'integration' ? 'ZCT-V1' : '',
    methodCode: '',
    version: '',
    projectCode: '',
    analyte: '',
    owner: '',
    remark: '',
    integrationRows: [
      createIntegrationRow({ objectName: '待测物（ZCT）', minPeakHeight: '160', smoothingWidth: '3', expectedRt: '1.84', rtWindow: '30', noisePercent: '95', peakSplittingFactor: '2', baseSubWindow: '1', fitType: 'None', weighting: 'None' }),
      createIntegrationRow({ objectName: '内标（IS）', minPeakHeight: '160', smoothingWidth: '3', expectedRt: '1.83', rtWindow: '30', noisePercent: '95', peakSplittingFactor: '2', baseSubWindow: '1' }),
    ],
    acquisition: {
      chromatographicColumn: 'YMC-Triart C18 50mm*2.0mm，5μm，12nm',
      guardColumn: '菲罗门',
      mobilePhaseA: '含0.5%甲酸的水溶液',
      mobilePhaseB: '含0.5%甲酸的乙腈溶液',
      flowRate: '0.800 mL/min',
      columnTemperature: '40.0℃',
      sampleTrayTemperature: '4.0℃',
      injectionVolume: '2.0 μL',
      rinseMode: '进样前及进样后（Before and after aspiration）',
      rinsingVolume: '500.0 μL',
      rinseDipTime: '5 sec',
      rinseMethod: 'Rinse Pump Then Port',
      rinseTime: '1 sec',
      rinseSolution: '四合一溶液',
      ionSource: 'Electrospray Ionization（ESI）',
      ionization: '正离子模式（Positive）',
      detectionMode: '多反应检测（MRM）',
      collisionGas: '8 psi',
      curtainGas: '40 psi',
      gs1: '35 psi',
      gs2: '55 psi',
      ionSprayVoltage: '4000 V',
      turboIonSprayTemperature: '650 ℃',
      resolution: 'unit',
    },
    gradientRows: [
      createGradientRow({ time: '0', module: 'Pumps', event: 'Pump B Conc.', parameter: '12' }),
      createGradientRow({ time: '2', module: 'Pumps', event: 'Pump B Conc.', parameter: '30' }),
      createGradientRow({ time: '2.1', module: 'Pumps', event: 'Pump B Conc.', parameter: '95' }),
      createGradientRow({ time: '4.2', module: 'Pumps', event: 'Pump B Conc.', parameter: '95' }),
      createGradientRow({ time: '4.3', module: 'Pumps', event: 'Pump B Conc.', parameter: '12' }),
      createGradientRow({ time: '5.5', module: 'Controller', event: 'Stop', parameter: 'NA' }),
    ],
    valveRows: [
      createValveRow({ time: '0.5', position: 'B（质谱）' }),
      createValveRow({ time: '2', position: 'A（切换阀）' }),
    ],
    mrmRows: [
      createMrmRow({ compoundType: '待测物', compoundName: 'AAAA（A）', mrm: '107.4/95.2', dwellTime: '125', dp: '70', ep: '14', ce: '25', cxp: '6' }),
      createMrmRow({ compoundType: '内标', compoundName: 'AAAA-d5（IS）', mrm: '112.3/95.2', dwellTime: '125', dp: '70', ep: '14', ce: '25', cxp: '6' }),
    ],
  };
}

function createIntegrationRow(values: Partial<EditableRow> = {}): EditableRow {
  return { objectName: '', minPeakHeight: '', smoothingWidth: '', expectedRt: '', rtWindow: '', noisePercent: '', peakSplittingFactor: '', baseSubWindow: '', fitType: '', weighting: '', ...values };
}
function createGradientRow(values: Partial<EditableRow> = {}): EditableRow {
  return { time: '', module: '', event: '', parameter: '', ...values };
}
function createValveRow(values: Partial<EditableRow> = {}): EditableRow {
  return { time: '', position: '', ...values };
}
function createMrmRow(values: Partial<EditableRow> = {}): EditableRow {
  return { compoundType: '', compoundName: '', mrm: '', dwellTime: '', dp: '', ep: '', ce: '', cxp: '', ...values };
}
</script>
