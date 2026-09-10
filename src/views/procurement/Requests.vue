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
          <button v-if="row.status === 'draft'" class="text-[--success] text-xs font-medium hover:underline" @click.stop="submitRequest(row)">提交审批</button>
          <button v-if="row.status === 'pending'" class="text-[--warning] text-xs font-medium hover:underline" @click.stop="withdrawRequest(row)">撤回</button>
          <button v-if="['draft','rejected','withdrawn'].includes(row.status)" class="text-[--danger] text-xs font-medium hover:underline" @click.stop="deleteRequest(row)">删除</button>
        </div>
      </template>
    </BaseTable>

    <!-- 新增申请抽屉 -->
    <BaseDrawer v-if="showCreateDrawer" :open="showCreateDrawer" title="新增采购申请" @close="closeCreateDrawer">
      <div class="space-y-4">
        <div class="rounded-lg border border-[--border] bg-[--surface-muted] px-3 py-2 text-xs text-[--muted-foreground]">
          填写采购申请基本信息，提交后将进入审批流程。
        </div>
        <div class="grid grid-cols-2 gap-3">
          <BaseFormField label="申请单号" :value="newRequestCode" disabled class="col-span-2" />
          <BaseFormField label="申请人" value="何晓明" disabled />
          <BaseFormField label="申请部门" value="生物分析部" disabled />
          <BaseFormField label="关联项目" type="select" :options="projectOptions" v-model="createForm.projectId" />
          <BaseFormField label="采购分类" type="select" :options="categoryOptions" v-model="createForm.category" />
          <BaseFormField label="采购用途" placeholder="请输入采购用途" v-model="createForm.purpose" class="col-span-2" />
          <BaseFormField label="申请日期" :value="today" disabled class="col-span-2" />
        </div>
        <div>
          <div class="text-xs font-bold text-[--text-main] mb-2">物品明细</div>
          <div class="border border-[--border] rounded-lg overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-[--surface-muted]">
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">物品名称</th>
                  <th class="px-3 py-2 text-left font-medium text-[--muted-foreground]">物品类型</th>
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
import type { ProcurementRequest } from '@/api/mock/warehouse';

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
  { label: '审批中', value: 'pending' },
  { label: '已驳回', value: 'rejected' },
  { label: '已撤回', value: 'withdrawn' },
  { label: '待采购', value: 'purchasing' },
  { label: '已完成', value: 'completed' },
];

const categoryOptions = [
  { label: '试剂', value: 'reagent' },
  { label: '耗材', value: 'consumable' },
  { label: '设备', value: 'equipment' },
  { label: '标准品', value: 'standard' },
  { label: '其他', value: 'other' },
];

const projectOptions = computed(() =>
  projects.map(p => ({ label: p.name, value: p.id }))
);

const itemTypeOptions = [
  { label: '试剂', value: 'reagent' },
  { label: '耗材', value: 'consumable' },
  { label: '设备', value: 'equipment' },
  { label: '标准品', value: 'standard' },
];

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
    draft: '草稿', pending: '审批中', approved: '已审批', rejected: '已驳回',
    withdrawn: '已撤回', purchasing: '待采购', received: '处理中', completed: '已完成',
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
  notes: '',
  items: [{ name: '', type: 'reagent', qty: 1, unit: '瓶' }],
});

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
  createForm.notes = '';
  createForm.items = [{ name: '', type: 'reagent', qty: 1, unit: '瓶' }];
}

function addItem() {
  createForm.items.push({ name: '', type: 'reagent', qty: 1, unit: '瓶' });
}

function saveDraft() {
  const request: ProcurementRequest = {
    id: createForm.id || `PR-${String(procurementRequests.length + 1).padStart(4, '0')}`,
    code: createForm.code,
    applicant: '何晓明',
    department: '生物分析部',
    projectId: createForm.projectId,
    projectName: projects.find(p => p.id === createForm.projectId)?.name ?? '—',
    category: createForm.category,
    purpose: createForm.purpose,
    status: 'draft',
    currentNode: '—',
    date: today,
    items: createForm.items.map(i => ({
      itemId: '',
      itemName: i.name,
      itemType: i.type,
      qty: i.qty,
      unit: i.unit,
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
  row.status = 'pending';
  row.currentNode = '部门主管审批';
}

function withdrawRequest(row: ProcurementRequest) {
  row.status = 'withdrawn';
  row.currentNode = '—';
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
