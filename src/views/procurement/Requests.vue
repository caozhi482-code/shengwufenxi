<template>
  <div class="space-y-4 pb-24">
    <!-- 顶部工具栏 -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-[--muted-foreground]">采购管理 / 采购申请</div>
      <div class="flex gap-2">
        <BaseButton variant="secondary" size="sm">导出</BaseButton>
        <BaseButton variant="primary" size="sm" @click="showCreateDrawer = true">新增申请</BaseButton>
      </div>
    </div>

    <!-- 筛选栏 -->
    <BaseCard>
      <div class="flex flex-wrap gap-3 items-end">
        <BaseFormField label="搜索" placeholder="申请单号 / 物品名称" v-model="search" style="flex:1;min-width:200px;" />
        <BaseFormField label="状态" type="select" :options="statusOptions" v-model="statusFilter" style="width:130px;" />
        <BaseFormField label="分类" type="select" :options="categoryOptions" v-model="categoryFilter" style="width:140px;" />
        <BaseFormField label="项目" type="select" :options="projectOptions" v-model="projectFilter" style="width:160px;" />
        <BaseButton variant="primary" size="sm">查询</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="reset">重置</BaseButton>
      </div>
    </BaseCard>

    <!-- 数据表格 -->
    <BaseTable
      :data="filteredRequests"
      :columns="columns"
      :loading="loading"
      :pagination="{ page, total: filteredRequests.length, pages: 1 }"
      @page-change="page = $event"
      @row-click="viewRequest"
    >
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" :label="statusLabel(row.status)" />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex gap-2 flex-wrap">
          <button class="text-[--primary] text-xs font-medium hover:underline" @click.stop="viewRequest(row)">查看</button>
          <button v-if="row.status === 'draft'" class="text-[--info] text-xs font-medium hover:underline" @click.stop="editRequest(row)">编辑</button>
          <button v-if="row.status === 'draft'" class="text-[--success] text-xs font-medium hover:underline" @click.stop="submitRequest(row)">提交申请</button>
          <button v-if="row.status === 'submitted'" class="text-[--warning] text-xs font-medium hover:underline" @click.stop="withdrawRequest(row)">撤回</button>
          <button v-if="['submitted', 'processing', 'ordered'].includes(row.status)" class="text-[--info] text-xs font-medium hover:underline" @click.stop="processRequest(row)">采购处理</button>
          <button v-if="['draft','rejected','withdrawn'].includes(row.status)" class="text-[--danger] text-xs font-medium hover:underline" @click.stop="deleteRequest(row)">删除</button>
        </div>
      </template>
    </BaseTable>

    <!-- 新增申请抽屉 -->
    <BaseDrawer v-if="showCreateDrawer" :open="showCreateDrawer" title="新增采购申请" @close="closeCreateDrawer">
      <div class="space-y-4">
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] px-3 py-2 text-xs text-[--muted-foreground]">
          填写申请基本信息和物品分类字段，提交后由采购负责人处理，采购完成后关联仓库验收。
        </div>
        <div class="grid grid-cols-2 gap-3">
          <BaseFormField label="申请单号" :value="newRequestCode" disabled class="col-span-2" />
          <BaseFormField label="申请人" value="何晓明" disabled />
          <BaseFormField label="申请部门" value="生物分析部" disabled />
          <BaseFormField label="关联项目" type="select" :options="projectOptions" v-model="createForm.projectId" required />
          <BaseFormField label="采购分类" type="select" :options="categoryOptions" v-model="createForm.category" required />
          <BaseFormField label="需求用途" placeholder="如：日常办公 / 项目使用 / 方法验证" v-model="createForm.purpose" required class="col-span-2" />
          <BaseFormField label="预算归属" placeholder="成本中心 / 预算科目" v-model="createForm.budgetOwner" />
          <BaseFormField label="期望到货日期" type="date" v-model="createForm.expectedArrivalDate" required />
          <BaseFormField label="审批人" v-model="createForm.approver" readonly />
          <BaseFormField label="申请日期" :model-value="today" readonly />
        </div>
        <div>
          <div class="text-xs font-bold text-[--text-main] mb-2">物品明细</div>
          <div class="border border-[--border] rounded-lg overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-[--surface-muted]">
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">产品名称</th>
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">产品类型</th>
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">规格 / 品牌</th>
                  <th class="px-3 py-2 text-center font-medium text-[--muted-foreground]">数量</th>
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">单位</th>
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in createForm.items" :key="i" class="border-t border-[--border]">
                  <td class="px-2 py-1.5"><input v-model="item.name" class="w-full border border-[--border] rounded px-2 py-1" placeholder="物品名称" /></td>
                  <td class="px-2 py-1.5">
                    <select v-model="item.type" class="w-full border border-[--border] rounded px-2 py-1">
                      <option v-for="t in itemTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
                    </select>
                  </td>
                  <td class="px-2 py-1.5">
                    <input v-model="item.spec" class="w-full border border-[--border] rounded px-2 py-1 mb-1" placeholder="规格参数" />
                    <input v-model="item.brand" class="w-full border border-[--border] rounded px-2 py-1" placeholder="品牌要求" />
                  </td>
                  <td class="px-2 py-1.5"><input v-model.number="item.qty" type="number" class="w-full border border-[--border] rounded px-2 py-1 text-center" /></td>
                  <td class="px-2 py-1.5"><input v-model="item.unit" class="w-full border border-[--border] rounded px-2 py-1" /></td>
                  <td class="px-2 py-1.5 text-center">
                    <button class="text-[--danger] hover:underline text-xs" @click="createForm.items.splice(i, 1)">删除</button>
                  </td>
                </tr>
                <tr>
                  <td colspan="5" class="px-3 py-2">
                    <button class="text-xs text-[--primary] hover:underline" @click="addItem">+ 添加物品</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="createForm.category" class="rounded-lg border border-[--primary-border] bg-[--primary-soft]/40 p-3">
          <div class="text-xs font-bold text-[--primary] mb-3">{{ categoryLabel(createForm.category) }}分类字段</div>
          <div class="grid grid-cols-2 gap-3">
            <template v-if="createForm.category === 'reagent'">
              <BaseFormField label="中文名称 / 英文名称" v-model="createForm.items[0].name" required />
              <BaseFormField label="CAS 号" v-model="createForm.items[0].casNo" required />
              <BaseFormField label="试剂级别" type="select" :options="reagentGradeOptions" v-model="createForm.items[0].purityLevel" />
              <BaseFormField label="危险性分类" type="select" :options="hazardOptions" v-model="createForm.items[0].hazardClass" />
              <BaseFormField label="订货货号 Cat.No" v-model="createForm.items[0].catalogNo" />
            </template>
            <template v-else-if="createForm.category === 'chromatographyColumn'">
              <BaseFormField label="物品大类" type="select" :options="columnTypeOptions" v-model="createForm.items[0].productType" required />
              <BaseFormField label="品牌" v-model="createForm.items[0].brand" required />
              <BaseFormField label="系列型号" v-model="createForm.items[0].spec" required />
              <BaseFormField label="货号" v-model="createForm.items[0].catalogNo" />
              <BaseFormField label="柱长 L × 内径 I.D." v-model="createForm.items[0].columnSize" required />
              <BaseFormField label="填料粒径" v-model="createForm.items[0].particleSize" />
              <BaseFormField label="孔径 Å" v-model="createForm.items[0].poreSize" />
            </template>
            <template v-else-if="createForm.category === 'equipment'">
              <BaseFormField label="设备名称" v-model="createForm.items[0].name" required />
              <BaseFormField label="安装地点" v-model="createForm.items[0].installLocation" required />
              <BaseFormField label="型号" v-model="createForm.items[0].spec" />
              <BaseFormField label="技术参数" type="textarea" v-model="createForm.items[0].technicalParams" class="col-span-2" />
            </template>
            <template v-else-if="createForm.category === 'standard'">
              <BaseFormField label="物料名称（中文 / 英文）" v-model="createForm.items[0].name" required />
              <BaseFormField label="CAS 号" v-model="createForm.items[0].casNo" required />
              <BaseFormField label="来源类型" type="select" :options="standardSourceOptions" v-model="createForm.items[0].sourceType" required />
              <BaseFormField label="规格包装" v-model="createForm.items[0].spec" required />
              <BaseFormField label="是否需要冷链" type="select" :options="coldChainOptions" v-model="createForm.items[0].coldChain" />
            </template>
            <template v-else-if="createForm.category === 'blankMatrix'">
              <BaseFormField label="基质类型" type="select" :options="matrixTypeOptions" v-model="createForm.items[0].matrixType" required />
              <BaseFormField label="物种来源" v-model="createForm.items[0].species" required />
              <BaseFormField label="抗凝剂" v-model="createForm.items[0].anticoagulant" />
              <BaseFormField label="基质规格" v-model="createForm.items[0].spec" required />
              <BaseFormField label="是否冷链" type="select" :options="coldChainOptions" v-model="createForm.items[0].coldChain" />
              <BaseFormField label="基质要求" type="textarea" v-model="createForm.items[0].matrixRequirement" class="col-span-2" />
            </template>
            <template v-else>
              <BaseFormField label="货号 Cat.No" v-model="createForm.items[0].catalogNo" />
              <BaseFormField label="规格参数" v-model="createForm.items[0].spec" />
              <BaseFormField label="材质" v-model="createForm.items[0].material" />
              <BaseFormField label="包装规格" v-model="createForm.items[0].packaging" />
              <BaseFormField v-if="createForm.category === 'consumable'" label="洁净等级" v-model="createForm.items[0].cleanGrade" />
            </template>
          </div>
        </div>
        <BaseFormField label="备注" type="textarea" placeholder="可选" v-model="createForm.notes" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeCreateDrawer">取消</BaseButton>
        <BaseButton variant="primary" @click="saveDraft">保存草稿</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import StatusTag from '@/components/procurement/StatusTag.vue';
import { procurementRequests, projects } from '@/api/mock/warehouse';
import type { ProcurementRequest, ProcurementCategory } from '@/api/mock/warehouse';

const router = useRouter();
const loading = ref(false);
const page = ref(1);
const search = ref('');
const statusFilter = ref('');
const categoryFilter = ref('');
const projectFilter = ref('');
const showCreateDrawer = ref(false);

const today = new Date().toLocaleDateString('zh-CN');

const statusOptions = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已提交', value: 'submitted' },
  { label: '采购处理中', value: 'processing' },
  { label: '已下单', value: 'ordered' },
  { label: '待仓库验收', value: 'accepted' },
  { label: '已入库', value: 'stocked' },
  { label: '已驳回', value: 'rejected' },
  { label: '已撤回', value: 'withdrawn' },
];

const categoryOptions = [
  { label: '办公用品', value: 'office' },
  { label: '色谱柱', value: 'chromatographyColumn' },
  { label: '仪器设备', value: 'equipment' },
  { label: '标准品', value: 'standard' },
  { label: '试剂', value: 'reagent' },
  { label: '耗材', value: 'consumable' },
  { label: '空白基质', value: 'blankMatrix' },
  { label: '其他', value: 'other' },
];

const projectOptions = computed(() =>
  projects.map(p => ({ label: p.name, value: p.id }))
);

const itemTypeOptions = categoryOptions.filter(option => option.value);
const reagentGradeOptions = ['HPLC', 'AR', 'CP', 'GR', 'ACS'].map(value => ({ label: value, value }));
const hazardOptions = ['普通化学品', '易制毒', '易制爆', '腐蚀性', '易燃'].map(value => ({ label: value, value }));
const columnTypeOptions = ['液相色谱柱', '气相毛细管柱', '离子色谱柱', '保护柱'].map(value => ({ label: value, value }));
const standardSourceOptions = ['中检院对照品', 'EP', 'USP', 'TRC', 'LGC', '自制标定对照品'].map(value => ({ label: value, value }));
const coldChainOptions = ['是', '否'].map(value => ({ label: value, value }));
const matrixTypeOptions = ['血浆', '血清', '全血', '尿液', '粪便', '肝组织', '其他组织'].map(value => ({ label: value, value }));

const columns = [
  { key: 'code', label: '申请单号' },
  { key: 'applicant', label: '申请人' },
  { key: 'department', label: '申请部门' },
  { key: 'projectName', label: '关联项目' },
  { key: 'category', label: '采购分类' },
  { key: 'purpose', label: '采购用途' },
  { key: 'status', label: '状态' },
  { key: 'currentNode', label: '当前审批节点' },
  { key: 'date', label: '申请日期' },
  { key: 'actions', label: '操作' },
];

const filteredRequests = computed(() =>
  procurementRequests.filter(r => {
    if (search.value && !r.code.includes(search.value) && !r.items.some(i => i.itemName.includes(search.value))) return false;
    if (statusFilter.value && r.status !== statusFilter.value) return false;
    if (categoryFilter.value && r.category !== categoryFilter.value) return false;
    if (projectFilter.value && r.projectId !== projectFilter.value) return false;
    return true;
  })
);

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    draft: '草稿', submitted: '已提交', processing: '采购处理中', ordered: '已下单',
    accepted: '待仓库验收', stocked: '已入库', rejected: '已驳回', withdrawn: '已撤回',
  };
  return map[s] ?? s;
}

function newRequestCode(): string {
  const max = procurementRequests.reduce((m, r) => {
    const n = parseInt(r.code.replace('PR-', ''));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `PR-${String(max + 1).padStart(4, '0')}`;
}

const createForm = reactive({
  id: '',
  code: '',
  projectId: '',
  category: '',
  purpose: '',
  budgetOwner: '',
  expectedArrivalDate: '',
  approver: '武琴',
  notes: '',
  items: [emptyItem()],
});

function emptyItem() {
  return {
    name: '',
    type: 'reagent' as ProcurementCategory,
    qty: 1,
    unit: '瓶',
    spec: '',
    brand: '',
    casNo: '',
    catalogNo: '',
    purityLevel: '',
    hazardClass: '',
    productType: '',
    columnSize: '',
    particleSize: '',
    poreSize: '',
    installLocation: '',
    technicalParams: '',
    sourceType: '',
    coldChain: '',
    matrixType: '',
    species: '',
    anticoagulant: '',
    matrixRequirement: '',
    material: '',
    cleanGrade: '',
    packaging: '',
  };
}

function closeCreateDrawer() {
  showCreateDrawer.value = false;
  resetForm();
}

function resetForm() {
  createForm.id = '';
  createForm.code = newRequestCode();
  createForm.projectId = '';
  createForm.category = '';
  createForm.purpose = '';
  createForm.budgetOwner = '';
  createForm.expectedArrivalDate = '';
  createForm.approver = '武琴';
  createForm.notes = '';
  createForm.items = [emptyItem()];
}

function addItem() {
  createForm.items.push(emptyItem());
}

function saveDraft() {
  const request: ProcurementRequest = {
    id: createForm.id || `PR-${String(procurementRequests.length + 1).padStart(4, '0')}`,
    code: createForm.code,
    applicant: '何晓明',
    department: '生物分析部',
    projectId: createForm.projectId,
    projectName: projects.find(p => p.id === createForm.projectId)?.name ?? '—',
    category: createForm.category as ProcurementCategory,
    purpose: createForm.purpose,
    budgetOwner: createForm.budgetOwner,
    expectedArrivalDate: createForm.expectedArrivalDate,
    approver: createForm.approver,
    approvalFlow: '部门负责人 → 采购负责人',
    status: 'draft',
    currentNode: '—',
    date: today,
    items: createForm.items.map(i => ({
      itemId: '',
      productCode: `MAT-${String(procurementRequests.length + 1).padStart(4, '0')}`,
      projectCode: projects.find(p => p.id === createForm.projectId)?.code ?? '',
      itemName: i.name,
      itemType: i.type,
      productType: i.productType || categoryLabel(i.type),
      brand: i.brand,
      spec: i.spec,
      purityLevel: i.purityLevel,
      catalogNo: i.catalogNo,
      casNo: i.casNo,
      material: i.material,
      cleanGrade: i.cleanGrade,
      hazardClass: i.hazardClass,
      columnSize: i.columnSize,
      particleSize: i.particleSize,
      poreSize: i.poreSize,
      installLocation: i.installLocation,
      technicalParams: i.technicalParams,
      sourceType: i.sourceType,
      coldChain: i.coldChain,
      matrixType: i.matrixType,
      species: i.species,
      anticoagulant: i.anticoagulant,
      matrixRequirement: i.matrixRequirement,
      qty: i.qty,
      unit: i.unit,
      expectedArrivalDate: createForm.expectedArrivalDate,
      receivedQty: 0,
      pendingQty: i.qty,
    })),
  };
  procurementRequests.unshift(request);
  closeCreateDrawer();
  router.push({ path: `/procurement/requests/${request.id}` });
}

function viewRequest(row: ProcurementRequest) {
  router.push({ path: `/procurement/requests/${row.id}` });
}

function editRequest(row: ProcurementRequest) {
  router.push({ path: `/procurement/requests/${row.id}` });
}

function submitRequest(row: ProcurementRequest) {
  row.status = 'submitted';
  row.currentNode = '采购负责人处理';
}

function withdrawRequest(row: ProcurementRequest) {
  row.status = 'withdrawn';
  row.currentNode = '—';
}

function processRequest(row: ProcurementRequest) {
  row.status = row.status === 'ordered' ? 'accepted' : 'processing';
  row.currentNode = row.status === 'accepted' ? '仓库验收' : '采购负责人确认采购信息';
}

function categoryLabel(category: string): string {
  return categoryOptions.find(option => option.value === category)?.label ?? category;
}

function deleteRequest(row: ProcurementRequest) {
  if (confirm('确认删除此采购申请？')) {
    const idx = procurementRequests.indexOf(row);
    if (idx >= 0) procurementRequests.splice(idx, 1);
  }
}

function reset() {
  search.value = '';
  statusFilter.value = '';
  categoryFilter.value = '';
  projectFilter.value = '';
}
</script>
