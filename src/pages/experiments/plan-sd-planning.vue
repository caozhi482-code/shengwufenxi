<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="6" />
    </div>

    <BasePageHeader
      title="SD负责人资源预规划"
      :subtitle="`${selectedProject?.name ?? '—'} · ${planCode}`"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="backToPublish">上一步</BaseButton>
        <BaseButton variant="primary" size="sm" @click="goToTaskAssignment">
          下一步：任务分配
        </BaseButton>
      </template>
    </BasePageHeader>

    <div v-if="!canContinue" class="grid grid-cols-4 gap-5">
      <div class="col-span-3">
        <BaseCard>
          <template #header><span class="text-base font-bold text-[--foreground]">无法进行资源规划</span></template>
          <div class="py-12 text-center space-y-3">
            <div class="text-sm font-medium text-[--text-main]">{{ emptyReason }}</div>
            <div class="text-xs text-[--muted-foreground]">{{ emptyReasonDetail }}</div>
            <BaseButton variant="primary" @click="backToPublish">返回确认页</BaseButton>
          </div>
        </BaseCard>
      </div>
      <div class="col-span-1">
        <BaseCard>
          <template #header><span class="text-sm font-bold text-[--foreground]">上下文摘要</span></template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">计划编号</span>
              <span class="font-mono text-xs font-medium text-[--primary]">{{ planCode }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">当前步骤</span>
              <span class="font-medium text-[--warning]">SD资源规划</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <template v-else>
      <!-- 顶部信息条 -->
      <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-3">
        <div class="flex items-center gap-6 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-xs text-[--muted-foreground]">项目编号</span>
            <span class="text-xs font-mono font-medium text-[--primary]">{{ selectedProject?.code ?? '—' }}</span>
          </div>
          <div class="w-px h-5 bg-[--border]" />
          <div class="flex items-center gap-2">
            <span class="text-xs text-[--muted-foreground]">考察项</span>
            <span class="text-xs font-medium text-[--text-main]">{{ selectedItems.length }} 项</span>
          </div>
          <div class="w-px h-5 bg-[--border]" />
          <div class="flex items-center gap-2">
            <span class="text-xs text-[--muted-foreground]">模板实例</span>
            <span class="text-xs font-medium text-[--text-main]">{{ allForms.length }} 个</span>
          </div>
          <div class="w-px h-5 bg-[--border]" />
          <div class="flex items-center gap-2">
            <span class="text-xs text-[--muted-foreground]">SD负责人</span>
            <BaseFormField
              type="select"
              :options="sdOwnerOptions"
              v-model="sdOwner"
              class="!w-[140px] !mb-0"
            />
          </div>
          <div class="w-px h-5 bg-[--border]" />
          <div class="flex items-center gap-2">
            <span class="text-xs text-[--muted-foreground]">规划状态</span>
            <BaseTag :label="planningStatusLabel" :tone="planningStatusTone" />
          </div>
          <div class="w-px h-5 bg-[--border]" />
          <div class="flex items-center gap-2">
            <span class="text-xs text-[--muted-foreground]">资源条目</span>
            <span class="text-xs font-medium text-[--text-main]">{{ totalResourceItems }} 条</span>
          </div>
          <div class="ml-auto flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="autoGenerate">
              自动生成建议清单
            </BaseButton>
            <BaseButton variant="secondary" size="sm" @click="saveDraft">保存草稿</BaseButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-6 gap-5">
        <!-- 左侧：模板实例列表 -->
        <div class="col-span-2 space-y-4">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[--foreground]">模板实例</span>
                <BaseTag :label="`${selectedForms.length} 个`" tone="info" />
              </div>
            </template>
            <div class="space-y-1.5 max-h-[400px] overflow-y-auto">
              <div
                v-for="form in selectedForms"
                :key="form.instanceId"
                class="rounded-lg border px-3 py-2.5 cursor-pointer transition-all"
                :class="activeInstanceId === form.instanceId
                  ? 'border-[--primary] bg-[--primary-soft]'
                  : 'border-[--border] bg-white hover:border-[--primary-border]'"
                @click="activeInstanceId = form.instanceId"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-mono text-[--muted-foreground]">{{ form.instanceId.slice(-8) }}</span>
                  <BaseTag :label="getResourceStatusLabel(getResourceStatus(form.instanceId))" :tone="getResourceStatusTone(getResourceStatus(form.instanceId))" />
                </div>
                <div class="text-sm font-medium text-[--text-main] truncate">{{ form.template.templateName }}</div>
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">
                  {{ form.template.templateCode }} · {{ form.template.version }}
                </div>
                <div class="text-[10px] text-[--muted-foreground]">
                  {{ form.itemId }} {{ getItemName(form.itemId) }}
                </div>
              </div>
              <div v-if="selectedForms.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">
                暂无模板实例
              </div>
            </div>
          </BaseCard>

          <!-- 批量操作 -->
          <BaseCard>
            <template #header><span class="text-sm font-bold text-[--foreground]">批量操作</span></template>
            <div class="space-y-3 text-xs">
              <div>
                <div class="text-[--muted-foreground] mb-1.5">批量设置状态</div>
                <div class="flex flex-wrap gap-1.5">
                  <label
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    class="inline-flex items-center gap-1 px-2 py-1 border rounded cursor-pointer transition-colors hover:bg-[--surface-muted]"
                    :class="batchStatus === opt.value ? 'border-[--primary] bg-[--primary-soft] text-[--primary]' : 'border-[--border]'"
                    @click="batchStatus = opt.value"
                  >
                    <BaseTag :label="opt.label" :tone="opt.tone" />
                  </label>
                </div>
              </div>
              <BaseButton variant="secondary" size="sm" class="w-full" @click="batchSetStatus">
                应用到选中实例
              </BaseButton>
              <BaseButton variant="secondary" size="sm" class="w-full" @click="batchSetOwner">
                批量设置SD负责人
              </BaseButton>
            </div>
          </BaseCard>

          <!-- 右侧汇总 -->
          <BaseCard>
            <template #header><span class="text-sm font-bold text-[--foreground]">资源汇总</span></template>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">总条目</span>
                <span class="font-semibold text-[--text-main]">{{ totalResourceItems }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">试剂</span>
                <span class="font-semibold text-[--text-main]">{{ countByType('reagent') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">耗材</span>
                <span class="font-semibold text-[--text-main]">{{ countByType('consumable') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">设备</span>
                <span class="font-semibold text-[--text-main]">{{ countByType('equipment') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">标准品</span>
                <span class="font-semibold text-[--text-main]">{{ countByType('standard') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">对照品</span>
                <span class="font-semibold text-[--text-main]">{{ countByType('control') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">已确认</span>
                <span class="font-semibold text-[--success]">{{ countByStatus('confirmed') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5 border-b border-[--border]">
                <span class="text-[--muted-foreground]">有缺口</span>
                <span class="font-semibold text-[--danger]">{{ countByStatus('shortage') }}</span>
              </div>
              <div class="flex justify-between gap-3 py-1.5">
                <span class="text-[--muted-foreground]">待采购</span>
                <span class="font-semibold text-[--warning]">{{ countByStatus('purchasing') }}</span>
              </div>
              <div class="mt-3 pt-2 border-t border-[--border]">
                <div class="flex justify-between gap-3 mb-1">
                  <span class="text-[--muted-foreground]">规划完成度</span>
                  <span class="font-semibold text-[--primary]">{{ completionRate }}%</span>
                </div>
                <div class="h-1.5 rounded-full bg-[--neutral-soft] overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="completionRate >= 80 ? 'bg-[--success]' : completionRate >= 50 ? 'bg-[--warning]' : 'bg-[--danger]'"
                    :style="{ width: completionRate + '%' }"
                  />
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- 中间：资源规划工作台 -->
        <div class="col-span-4 space-y-4">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-[--foreground]">
                  资源规划 — {{ activeForm?.template?.templateName ?? '请选择模板实例' }}
                </span>
                <div class="flex items-center gap-2">
                  <BaseTag
                    v-if="activeForm"
                    :label="`${getItemName(activeForm.itemId)}`"
                    tone="neutral"
                  />
                  <BaseButton variant="primary" size="sm" @click="openAddDrawer">+ 新增资源</BaseButton>
                </div>
              </div>
            </template>

            <div v-if="!activeForm" class="py-12 text-center">
              <div class="text-sm text-[--muted-foreground]">请在左侧选择一个模板实例开始规划</div>
            </div>

            <template v-else>
              <!-- 资源表格 -->
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-[--border] bg-[--surface-muted]">
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground] w-8">
                        <BaseCheckbox :checked="allSelected" @update:checked="toggleSelectAll" />
                      </th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">资源名称</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">编码</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">类型</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">规格</th>
                      <th class="text-right px-3 py-2 font-semibold text-[--muted-foreground]">计划量</th>
                      <th class="text-right px-3 py-2 font-semibold text-[--muted-foreground]">库存</th>
                      <th class="text-right px-3 py-2 font-semibold text-[--muted-foreground]">缺口</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">品牌</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">到位时间</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">关键</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">优先级</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">状态</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">备注</th>
                      <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground] w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="item in activeResourceItems"
                      :key="item.id"
                      class="border-b border-[--border] hover:bg-[--surface-muted] transition-colors"
                      :class="selectedIds.includes(item.id) ? 'bg-[--primary-soft]/50' : ''"
                    >
                      <td class="px-3 py-2">
                        <BaseCheckbox :checked="selectedIds.includes(item.id)" @update:checked="v => toggleSelect(item.id, v)" />
                      </td>
                      <td class="px-3 py-2 font-medium text-[--text-main]">{{ item.name }}</td>
                      <td class="px-3 py-2 font-mono text-[--muted-foreground]">{{ item.materialCode || '—' }}</td>
                      <td class="px-3 py-2">
                        <BaseTag :label="resourceTypeLabel(item.type)" :tone="resourceTypeTone(item.type)" />
                      </td>
                      <td class="px-3 py-2 text-[--muted-foreground]">{{ item.specification || '—' }}</td>
                      <td class="px-3 py-2 text-right font-medium">{{ item.plannedQty }}</td>
                      <td class="px-3 py-2 text-right">{{ item.currentStock }}</td>
                      <td class="px-3 py-2 text-right">
                        <span :class="item.gapQty > 0 ? 'text-[--danger] font-semibold' : 'text-[--success]'">
                          {{ item.gapQty > 0 ? item.gapQty : '—' }}
                        </span>
                      </td>
                      <td class="px-3 py-2 text-[--muted-foreground]">{{ item.brand || '—' }}</td>
                      <td class="px-3 py-2 text-[--muted-foreground]">{{ item.expectedArrival || '—' }}</td>
                      <td class="px-3 py-2">
                        <BaseCheckbox :checked="item.isCritical" @update:checked="v => updateField(item.id, 'isCritical', v)" />
                      </td>
                      <td class="px-3 py-2">
                        <BaseTag :label="priorityLabel(item.priority)" :tone="priorityTone(item.priority)" />
                      </td>
                      <td class="px-3 py-2">
                        <BaseTag :label="getResourceStatusLabel(item.status)" :tone="getResourceStatusTone(item.status)" />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          v-model="item.remark"
                          class="w-full bg-transparent border-none outline-none text-[--muted-foreground] placeholder-[--muted-foreground]/50"
                          placeholder="备注"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <div class="flex items-center gap-1">
                          <button class="text-[--info] hover:underline" @click="editResource(item)">编辑</button>
                          <button class="text-[--muted-foreground] hover:underline ml-1" @click="copyResource(item)">复制</button>
                          <button class="text-[--danger] hover:underline ml-1" @click="deleteResource(item)">删除</button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="activeResourceItems.length === 0">
                      <td colspan="15" class="px-3 py-12 text-center">
                        <div class="text-sm text-[--muted-foreground] mb-2">暂无资源条目</div>
                        <div class="text-xs text-[--muted-foreground]">可从模板或方法文件生成建议清单，或手动新增</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 批量操作栏 -->
              <div v-if="activeResourceItems.length > 0" class="flex items-center justify-between pt-3 border-t border-[--border]">
                <div class="text-xs text-[--muted-foreground]">
                  已选 {{ selectedIds.length }} 条
                  <span v-if="selectedIds.length > 0" class="text-[--warning] ml-2">
                    缺口总计：{{ selectedGapTotal }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <BaseButton variant="secondary" size="sm" @click="batchUpdateStatus">批量修改状态</BaseButton>
                  <BaseButton variant="secondary" size="sm" @click="deleteSelected">批量删除</BaseButton>
                </div>
              </div>
            </template>
          </BaseCard>

          <!-- 底部操作 -->
          <div class="flex justify-between items-center bg-white border border-[--border] rounded-[--radius-lg] px-5 py-3">
            <BaseButton variant="secondary" size="sm" @click="backToPublish">返回确认页</BaseButton>
            <div class="flex gap-2">
              <BaseButton variant="secondary" size="sm" @click="saveDraft">保存草稿</BaseButton>
              <BaseButton variant="primary" size="sm" @click="goToTaskAssignment">
                下一步：任务分配
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 新增/编辑资源抽屉 -->
    <BaseDrawer :open="drawerOpen" :title="drawerTitle" @close="drawerOpen = false">
      <div class="space-y-4">
        <!-- 台账选择标签 -->
        <div class="flex gap-1 p-1 bg-[--surface-muted] rounded-lg border border-[--border]">
          <button
            v-for="tab in drawerTabs"
            :key="tab.value"
            class="flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all"
            :class="drawerSource === tab.value ? 'bg-white text-[--text-main] shadow-sm' : 'text-[--muted-foreground] hover:text-[--text-main]'"
            @click="drawerSource = tab.value; drawerSearch = ''"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 样品管理部台账 -->
        <template v-if="drawerSource === 'sampleLedger'">
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <input
                v-model="drawerSearch"
                class="w-full h-8 pl-3 pr-3 text-xs bg-white border border-[--border] rounded-md outline-none focus:border-[--primary]"
                placeholder="搜索标准品、对照品、内标、质控品、基质…"
              />
            </div>
            <select
              v-model="drawerSampleFilter"
              class="h-8 px-2 text-xs border border-[--border] rounded-md bg-white text-[--muted-foreground] outline-none"
            >
              <option value="全部">全部</option>
              <option value="标准品">标准品</option>
              <option value="内标">内标</option>
              <option value="质控品">质控品</option>
              <option value="基质">基质</option>
            </select>
          </div>
          <div class="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            <div
              v-for="item in filteredSampleLedger"
              :key="item.id"
              class="flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-[--primary-border] hover:bg-[--primary-soft]/30"
              :class="item.status === 'out_of_stock' ? 'opacity-50 border-dashed' : 'border-[--border]'"
              @click="fillFromSampleLedger(item)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-[--text-main] truncate">{{ item.name }}</span>
                  <BaseTag :label="item.type" :tone="sampleTypeTone(item.type)" />
                </div>
                <div class="text-[10px] text-[--muted-foreground] font-mono mt-0.5">{{ item.code }} · {{ item.specification }} · {{ item.brand }}</div>
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">
                  库存: {{ item.stock }}{{ item.unit }} · {{ item.location }}
                </div>
              </div>
              <div class="shrink-0">
                <BaseTag :label="sampleStockStatusLabel(item)" :tone="sampleStockStatusTone(item)" />
              </div>
            </div>
            <div v-if="filteredSampleLedger.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">
              无匹配结果
            </div>
          </div>
          <div class="text-[10px] text-[--muted-foreground]">点击条目自动填充表单，可在下方手动调整</div>
        </template>

        <!-- 仓库台账 -->
        <template v-else-if="drawerSource === 'warehouseLedger'">
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <input
                v-model="drawerSearch"
                class="w-full h-8 pl-3 pr-3 text-xs bg-white border border-[--border] rounded-md outline-none focus:border-[--primary]"
                placeholder="搜索试剂、耗材、溶剂…"
              />
            </div>
            <select
              v-model="drawerWarehouseFilter"
              class="h-8 px-2 text-xs border border-[--border] rounded-md bg-white text-[--muted-foreground] outline-none"
            >
              <option value="全部">全部</option>
              <option value="reagent">试剂</option>
              <option value="consumable">耗材</option>
              <option value="solvent">溶剂</option>
            </select>
          </div>
          <div class="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            <div
              v-for="item in filteredWarehouseLedger"
              :key="item.id"
              class="flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-[--primary-border] hover:bg-[--primary-soft]/30"
              :class="item.status === 'out_of_stock' ? 'opacity-50 border-dashed' : 'border-[--border]'"
              @click="fillFromWarehouseLedger(item)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-[--text-main] truncate">{{ item.name }}</span>
                  <BaseTag :label="warehouseTypeLabel(item.type)" :tone="warehouseTypeTone(item.type)" />
                </div>
                <div class="text-[10px] text-[--muted-foreground] font-mono mt-0.5">{{ item.code }} · {{ item.specification }} · {{ item.brand }}</div>
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">
                  库存: {{ item.stock }}{{ item.unit }} · {{ item.shelf }}
                </div>
              </div>
              <div class="shrink-0">
                <BaseTag :label="warehouseStockStatusLabel(item)" :tone="warehouseStockStatusTone(item)" />
              </div>
            </div>
            <div v-if="filteredWarehouseLedger.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">
              无匹配结果
            </div>
          </div>
          <div class="text-[10px] text-[--muted-foreground]">点击条目自动填充表单，可在下方手动调整</div>
        </template>

        <!-- 仪器设备台账 -->
        <template v-else-if="drawerSource === 'equipmentLedger'">
          <div class="relative">
            <input
              v-model="drawerSearch"
              class="w-full h-8 pl-3 pr-3 text-xs bg-white border border-[--border] rounded-md outline-none focus:border-[--primary]"
              placeholder="搜索设备名称…"
            />
          </div>
          <div class="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            <div
              v-for="item in filteredEquipmentLedger"
              :key="item.id"
              class="flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-[--primary-border] hover:bg-[--primary-soft]/30"
              :class="item.status !== 'available' ? 'opacity-60 border-dashed' : 'border-[--border]'"
              @click="fillFromEquipmentLedger(item)"
            >
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-[--text-main]">{{ item.name }}</div>
                <div class="text-[10px] text-[--muted-foreground] font-mono mt-0.5">{{ item.code }} · {{ item.model }} · {{ item.brand }}</div>
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">{{ item.location }} · 序列号: {{ item.serialNumber }}</div>
              </div>
              <div class="shrink-0">
                <BaseTag :label="equipStatusLabel(item.status)" :tone="equipStatusTone(item.status)" />
              </div>
            </div>
            <div v-if="filteredEquipmentLedger.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">
              无匹配结果
            </div>
          </div>
          <div class="text-[10px] text-[--muted-foreground]">点击条目自动填充表单，可在下方手动调整</div>
        </template>

        <!-- 特殊资源（手动录入） -->
        <template v-else>
          <div class="text-[10px] text-[--warning] bg-[--warning-soft]/50 border border-[--warning-border] rounded-md px-2 py-1.5 mb-3">
            该资源未在上述台账中找到，请手动录入信息
          </div>
        </template>

        <!-- 公共表单 -->
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="资源名称" placeholder="输入资源名称" v-model="editForm.name" />
          <BaseFormField label="物料编码" placeholder="如：REG-2025-001" v-model="editForm.materialCode" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="资源类型" type="select" :options="resourceTypeOptions" v-model="editForm.type" />
          <BaseFormField label="单位" placeholder="如：瓶、支、盒" v-model="editForm.unit" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="规格型号" placeholder="如：10mL/瓶" v-model="editForm.specification" />
          <BaseFormField label="品牌" placeholder="如：Sigma、Waters" v-model="editForm.brand" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <BaseFormField label="计划数量" type="number" placeholder="0" v-model.number="editForm.plannedQty" />
          <BaseFormField label="当前库存" type="number" placeholder="0" v-model.number="editForm.currentStock" />
          <BaseFormField
            label="状态"
            type="select"
            :options="resourceStatusOptions"
            v-model="editForm.status"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="预计到位时间" type="date" v-model="editForm.expectedArrival" />
          <BaseFormField label="优先级" type="select" :options="priorityOptions" v-model="editForm.priority" />
        </div>
        <div class="flex items-center gap-2">
          <BaseCheckbox :checked="editForm.isCritical" @update:checked="v => editForm.isCritical = v" />
          <span class="text-xs text-[--text-main]">关键物料</span>
        </div>
        <BaseFormField label="备注" type="textarea" placeholder="可选备注" v-model="editForm.remark" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="drawerOpen = false">取消</BaseButton>
        <BaseButton variant="primary" @click="saveResource">保存</BaseButton>
      </template>
    </BaseDrawer>

    <!-- 确认删除弹层 -->
    <div
      v-if="confirmDelete"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/30" @click="confirmDelete = null" />
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <div class="text-base font-bold text-[--text-main] mb-2">确认删除</div>
        <div class="text-sm text-[--muted-foreground] mb-4">
          确定要删除资源「{{ confirmDelete?.name }}」吗？此操作不可撤销。
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="confirmDelete = null">取消</BaseButton>
          <BaseButton variant="danger" size="sm" @click="confirmDeleteResource">确认删除</BaseButton>
        </div>
      </div>
    </div>

    <!-- 批量状态设置弹层 -->
    <div
      v-if="showBatchStatusModal"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/30" @click="showBatchStatusModal = false" />
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <div class="text-base font-bold text-[--text-main] mb-3">批量设置状态</div>
        <div class="space-y-2">
          <label
            v-for="opt in resourceStatusOptions"
            :key="opt.value"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-[--surface-muted] transition-colors"
            :class="batchStatusModal === opt.value ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border]'"
            @click="batchStatusModal = opt.value"
          >
            <BaseTag :label="opt.label" :tone="opt.tone" />
          </label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <BaseButton variant="secondary" @click="showBatchStatusModal = false">取消</BaseButton>
          <BaseButton variant="primary" @click="applyBatchStatus">确认</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/form-templates';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FormTemplateRecord } from '@/types/experiments';
import type { SDResourceItem, SDResourceType, SDResourceStatus, SDResourceSource } from '@/types/experiments';
import { sampleLedger, warehouseLedger, equipmentLedger } from '@/api/mock/ledgers';
import type { SampleLedgerItem, WarehouseLedgerItem, EquipmentLedgerItem } from '@/api/mock/ledgers';

type FormStatus = 'unedited' | 'editing' | 'done';

type WorkspaceForm = {
  itemId: string;
  templateId: string;
  instanceId: string;
  template: FormTemplateRecord;
  status: FormStatus;
};

type BatchStatusOption = { label: string; value: SDResourceStatus; tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral' };

function getResourceStatusLabel(status: SDResourceStatus): string {
  const map: Record<SDResourceStatus, string> = {
    pending: '待确认', confirmed: '已确认', reserved: '已预留',
    purchasing: '待采购', arrived: '已到位', shortage: '缺货',
  };
  return map[status] ?? '待确认';
}

function getResourceStatusTone(status: SDResourceStatus): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<SDResourceStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'neutral', confirmed: 'success', reserved: 'info',
    purchasing: 'warning', arrived: 'success', shortage: 'danger',
  };
  return map[status] ?? 'neutral';
}

const router = useRouter();
const route = useRoute();

const steps = [
  { label: '选择项目', sub: '确定计划所属项目' },
  { label: '选择关联文件', sub: '选择方法 / 方案 / SOP' },
  { label: '选择考察项', sub: '确定本次计划范围' },
  { label: '选择模板表单', sub: '为考察项绑定表单模板' },
  { label: '编辑模板内容', sub: '编辑计划下模板实例' },
  { label: '确认创建', sub: '确认并创建实验计划' },
  { label: 'SD资源规划', sub: '规划试剂、耗材、设备等资源' },
  { label: '任务分配', sub: '为每个任务分配执行资源' },
];

const parseSingle = (value: unknown): string =>
  Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';

const parseList = (value: unknown): string[] => {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
};

const parseTemplatePairs = (value: unknown): Array<{ itemId: string; templateId: string }> =>
  parseList(value).map(pair => {
    const [itemId, templateId] = pair.split(':');
    return { itemId: itemId?.trim() ?? '', templateId: templateId?.trim() ?? '' };
  }).filter(p => p.itemId && p.templateId);

const planCode = computed(() => parseSingle(route.query.planCode) || 'PLAN-DRAFT');
const projectId = computed(() => parseSingle(route.query.projectId));
const itemIds = computed(() => parseList(route.query.itemIds));
const templateIds = computed(() => parseTemplatePairs(route.query.templateIds));

const localStorageKey = computed(() => `sd-planning::${planCode.value}::${projectId.value}`);

const selectedProject = computed(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedItems = computed<EvaluationItem[]>(() =>
  evaluationItems.filter(item => itemIds.value.includes(item.id))
);

const allForms = computed<WorkspaceForm[]>(() => {
  const result: WorkspaceForm[] = [];
  for (const pair of templateIds.value) {
    const template = formTemplates.find(t => t.id === pair.templateId);
    if (!template) continue;
    const instanceId = `${planCode.value}-${pair.itemId.replace(/\./g, '')}-${template.id}-INS`;
    result.push({ itemId: pair.itemId, templateId: pair.templateId, instanceId, template, status: 'unedited' });
  }
  return result;
});

const selectedForms = computed(() => allForms.value);

const canContinue = computed(() =>
  !!selectedProject.value && selectedItems.value.length > 0 && allForms.value.length > 0
);

const emptyReason = computed(() => {
  if (!selectedProject.value) return '未选择项目';
  if (selectedItems.value.length === 0) return '未选择考察项';
  if (allForms.value.length === 0) return '未选择模板表单';
  return '';
});
const emptyReasonDetail = computed(() => '请返回上一步完成前置配置后再进行SD资源规划。');

const activeInstanceId = ref('');
const sdOwner = ref('');
const selectedIds = ref<string[]>([]);
const batchStatus = ref<SDResourceStatus>('pending');
const batchStatusModal = ref<SDResourceStatus>('confirmed');
const showBatchStatusModal = ref(false);
const confirmDelete = ref<{ item: SDResourceItem; index: number } | null>(null);
const drawerOpen = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const drawerTitle = computed(() => drawerMode.value === 'add' ? '新增资源' : '编辑资源');
const drawerSource = ref<SDResourceSource>('warehouseLedger');
const drawerSearch = ref('');
const drawerSampleFilter = ref('全部');
const drawerWarehouseFilter = ref('全部');

const editForm = ref<Partial<SDResourceItem>>({
  name: '', materialCode: '', type: 'reagent', specification: '', unit: '',
  plannedQty: 0, currentStock: 0, brand: '', expectedArrival: '',
  isCritical: false, priority: 'medium', status: 'pending', remark: '',
});

const resourceItems = ref<SDResourceItem[]>([]);

function getItemName(itemId: string): string {
  return selectedItems.value.find(i => i.id === itemId)?.name ?? itemId;
}

function getResourceItems(instanceId: string): SDResourceItem[] {
  return resourceItems.value.filter(item => item.instanceId === instanceId);
}

function getResourceStatus(instanceId: string): SDResourceStatus {
  const items = resourceItems.value.filter(i => i.instanceId === instanceId);
  if (items.length === 0) return 'pending';
  if (items.some(i => i.status === 'shortage')) return 'shortage';
  if (items.every(i => i.status === 'arrived')) return 'arrived';
  if (items.every(i => i.status === 'confirmed' || i.status === 'arrived')) return 'confirmed';
  return 'pending';
}

const activeForm = computed(() => allForms.value.find(f => f.instanceId === activeInstanceId.value) ?? allForms.value[0] ?? null);

watch(activeForm, (form) => {
  if (form && !activeInstanceId.value) {
    activeInstanceId.value = form.instanceId;
  }
}, { immediate: true });

const activeResourceItems = computed(() => getResourceItems(activeInstanceId.value));

const allSelected = computed(() =>
  activeResourceItems.value.length > 0 && activeResourceItems.value.every(i => selectedIds.value.includes(i.id))
);

function toggleSelect(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id);
  } else {
    selectedIds.value = selectedIds.value.filter(x => x !== id);
  }
}

function toggleSelectAll(checked: boolean) {
  if (checked) {
    selectedIds.value = activeResourceItems.value.map(i => i.id);
  } else {
    selectedIds.value = [];
  }
}

const totalResourceItems = computed(() => resourceItems.value.length);
const selectedGapTotal = computed(() =>
  selectedIds.value.reduce((sum, id) => {
    const item = resourceItems.value.find(i => i.id === id);
    return sum + (item?.gapQty ?? 0);
  }, 0)
);

const completionRate = computed(() => {
  if (resourceItems.value.length === 0) return 0;
  const confirmed = resourceItems.value.filter(i => i.status === 'confirmed' || i.status === 'arrived').length;
  return Math.round(confirmed / resourceItems.value.length * 100);
});

const planningStatusLabel = computed(() => {
  if (resourceItems.value.length === 0) return '未规划';
  if (completionRate.value >= 80) return '基本完成';
  if (completionRate.value >= 50) return '进行中';
  return '待开始';
});

const planningStatusTone = computed((): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (completionRate.value >= 80) return 'success';
  if (completionRate.value >= 50) return 'warning';
  return 'danger';
});

const canProceed = computed(() => {
  if (resourceItems.value.length === 0) return true;
  return completionRate.value >= 30 || resourceItems.value.some(i => i.status === 'shortage');
});

const resourceTypeOptions = [
  { value: 'reagent', label: '试剂' },
  { value: 'consumable', label: '耗材' },
  { value: 'equipment', label: '设备' },
  { value: 'standard', label: '标准品' },
  { value: 'control', label: '对照品' },
  { value: 'other', label: '其他' },
];

const resourceStatusOptions = [
  { value: 'pending', label: '待确认', tone: 'neutral' as const },
  { value: 'confirmed', label: '已确认', tone: 'success' as const },
  { value: 'reserved', label: '已预留', tone: 'info' as const },
  { value: 'purchasing', label: '待采购', tone: 'warning' as const },
  { value: 'arrived', label: '已到位', tone: 'success' as const },
  { value: 'shortage', label: '缺货', tone: 'danger' as const },
];

const priorityOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const sdOwnerOptions = computed(() => {
  const owners = ['张明', '李华', '王芳', '赵强', '孙丽', '周伟'];
  return owners.map(o => ({ label: o, value: o }));
});

const statusOptions: BatchStatusOption[] = [
  { label: '待确认', value: 'pending', tone: 'neutral' },
  { label: '已确认', value: 'confirmed', tone: 'success' },
  { label: '已预留', value: 'reserved', tone: 'info' },
  { label: '待采购', value: 'purchasing', tone: 'warning' },
  { label: '已到位', value: 'arrived', tone: 'success' },
  { label: '缺货', value: 'shortage', tone: 'danger' },
];

function resourceTypeLabel(type: SDResourceType): string {
  return { reagent: '试剂', consumable: '耗材', equipment: '设备', standard: '标准品', control: '对照品', other: '其他' }[type] ?? type;
}

function resourceTypeTone(type: SDResourceType): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<SDResourceType, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    reagent: 'info', consumable: 'neutral', equipment: 'warning',
    standard: 'success', control: 'success', other: 'neutral',
  };
  return map[type] ?? 'neutral';
}

function priorityLabel(p: string): string {
  return { high: '高', medium: '中', low: '低' }[p] ?? p;
}

function priorityTone(p: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  return { high: 'danger', medium: 'warning', low: 'neutral' }[p] ?? 'neutral';
}

function countByType(type: SDResourceType): number {
  return resourceItems.value.filter(i => i.type === type).length;
}

function countByStatus(status: SDResourceStatus): number {
  return resourceItems.value.filter(i => i.status === status).length;
}

function generateId(): string {
  return 'SR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function openAddDrawer() {
  drawerMode.value = 'add';
  drawerSource.value = 'warehouseLedger';
  drawerSearch.value = '';
  drawerSampleFilter.value = '全部';
  drawerWarehouseFilter.value = '全部';
  editForm.value = {
    name: '', materialCode: '', type: 'reagent', specification: '', unit: '',
    plannedQty: 0, currentStock: 0, brand: '', expectedArrival: '',
    isCritical: false, priority: 'medium', status: 'pending', remark: '',
  };
  drawerOpen.value = true;
}

function editResource(item: SDResourceItem) {
  drawerMode.value = 'edit';
  drawerSource.value = item.source;
  drawerSearch.value = '';
  editForm.value = { ...item };
  drawerOpen.value = true;
}

function fillFromSampleLedger(item: SampleLedgerItem) {
  drawerSource.value = 'sampleLedger';
  drawerSearch.value = '';
  const typeMap: Record<string, SDResourceType> = { '标准品': 'standard', '内标': 'standard', '质控品': 'control', '基质': 'other' };
  editForm.value = {
    name: item.name, materialCode: item.code, type: typeMap[item.type] ?? 'other',
    specification: item.specification, unit: item.unit, brand: item.brand,
    currentStock: item.stock, plannedQty: Math.ceil(item.stock * 0.8),
    expectedArrival: item.expiryDate, isCritical: item.type === '标准品' || item.type === '内标',
    priority: item.type === '标准品' ? 'high' : 'medium',
    status: item.stock === 0 ? 'shortage' : item.status === 'out_of_stock' ? 'shortage' : 'pending',
    remark: `台账ID: ${item.id} · 批次: ${item.batch} · 存放: ${item.location}${item.status === 'out_of_stock' ? ' · [缺货]' : ''}`,
  };
}

function fillFromWarehouseLedger(item: WarehouseLedgerItem) {
  drawerSource.value = 'warehouseLedger';
  drawerSearch.value = '';
  const typeMap: Record<string, SDResourceType> = { reagent: 'reagent', consumable: 'consumable', solvent: 'reagent', other: 'other' };
  editForm.value = {
    name: item.name, materialCode: item.code, type: typeMap[item.type] ?? 'other',
    specification: item.specification, unit: item.unit, brand: item.brand,
    currentStock: item.stock, plannedQty: item.stock,
    expectedArrival: '', isCritical: item.type === 'reagent',
    priority: item.type === 'reagent' ? 'high' : 'medium',
    status: item.status === 'out_of_stock' ? 'shortage' : item.status === 'low_stock' ? 'purchasing' : 'pending',
    remark: `台账ID: ${item.id} · 批次: ${item.batch}${item.shelf ? ` · 货位: ${item.shelf}` : ''}${item.status !== 'in_stock' ? ` · [${item.status === 'low_stock' ? '低库存' : '缺货'}]` : ''}`,
  };
}

function fillFromEquipmentLedger(item: EquipmentLedgerItem) {
  drawerSource.value = 'equipmentLedger';
  drawerSearch.value = '';
  editForm.value = {
    name: item.name, materialCode: item.code, type: 'equipment',
    specification: item.model, unit: '台', brand: item.brand,
    currentStock: item.status === 'available' ? 1 : 0,
    plannedQty: item.status !== 'available' ? 1 : 1,
    expectedArrival: item.nextCalibration, isCritical: true,
    priority: 'high',
    status: item.status === 'available' ? 'confirmed' : item.status === 'in_use' ? 'reserved' : item.status === 'maintenance' ? 'purchasing' : 'pending',
    remark: `台账ID: ${item.id} · 序列号: ${item.serialNumber} · 位置: ${item.location}${item.nextCalibration ? ` · 下次校准: ${item.nextCalibration}` : ''}${item.remark ? ` · ${item.remark}` : ''}`,
  };
}

function saveResource() {
  if (!editForm.value.name) { alert('请输入资源名称'); return; }
  const instanceId = activeInstanceId.value;
  const form = allForms.value.find(f => f.instanceId === instanceId);
  const itemId = form?.itemId ?? '';
  const templateName = form?.template?.templateName ?? '';

  const payload = {
    name: editForm.value.name,
    materialCode: editForm.value.materialCode ?? '',
    type: (editForm.value.type ?? 'reagent') as SDResourceType,
    specification: editForm.value.specification ?? '',
    unit: editForm.value.unit ?? '',
    plannedQty: editForm.value.plannedQty ?? 0,
    currentStock: editForm.value.currentStock ?? 0,
    gapQty: Math.max(0, (editForm.value.plannedQty ?? 0) - (editForm.value.currentStock ?? 0)),
    brand: editForm.value.brand ?? '',
    expectedArrival: editForm.value.expectedArrival ?? '',
    isCritical: editForm.value.isCritical ?? false,
    priority: (editForm.value.priority ?? 'medium') as 'high' | 'medium' | 'low',
    status: (editForm.value.status ?? 'pending') as SDResourceStatus,
    remark: editForm.value.remark ?? '',
    source: drawerSource.value,
  };

  if (drawerMode.value === 'add') {
    resourceItems.value.push({
      id: generateId(), instanceId, itemId,
      itemName: getItemName(itemId),
      templateId: form?.templateId ?? '', templateName,
      ...payload,
    });
  } else {
    const idx = resourceItems.value.findIndex(i => i.id === editForm.value.id);
    if (idx >= 0) {
      resourceItems.value[idx] = { ...resourceItems.value[idx], ...payload };
    }
  }
  drawerOpen.value = false;
  persistState();
}

function updateField(id: string, field: string, value: any) {
  const item = resourceItems.value.find(i => i.id === id);
  if (!item) return;
  (item as any)[field] = value;
  if (field === 'plannedQty' || field === 'currentStock') {
    item.gapQty = Math.max(0, item.plannedQty - item.currentStock);
  }
  persistState();
}

function copyResource(item: SDResourceItem) {
  const newItem: SDResourceItem = {
    ...item,
    id: generateId(),
    name: item.name + '（副本）',
    materialCode: '',
  };
  resourceItems.value.push(newItem);
  persistState();
}

function deleteResource(item: SDResourceItem) {
  confirmDelete.value = { item, index: resourceItems.value.indexOf(item) };
}

function confirmDeleteResource() {
  if (!confirmDelete.value) return;
  const idx = resourceItems.value.findIndex(i => i.id === confirmDelete.value!.item.id);
  if (idx >= 0) resourceItems.value.splice(idx, 1);
  selectedIds.value = selectedIds.value.filter(id => id !== confirmDelete.value!.item.id);
  confirmDelete.value = null;
  persistState();
}

function deleteSelected() {
  if (selectedIds.value.length === 0) return;
  const count = selectedIds.value.length;
  if (!confirm(`确定删除 ${count} 条资源条目？`)) return;
  resourceItems.value = resourceItems.value.filter(i => !selectedIds.value.includes(i.id));
  selectedIds.value = [];
  persistState();
}

function batchSetStatus() {
  if (!activeInstanceId.value) return;
  resourceItems.value
    .filter(i => i.instanceId === activeInstanceId.value)
    .forEach(i => { i.status = batchStatus.value; i.gapQty = Math.max(0, i.plannedQty - i.currentStock); });
  persistState();
  alert(`已将当前实例下所有资源状态设为「${resourceStatusOptions.find(o => o.value === batchStatus.value)?.label}」`);
}

function batchUpdateStatus() {
  if (selectedIds.value.length === 0) { alert('请先选择资源条目'); return; }
  showBatchStatusModal.value = true;
  batchStatusModal.value = 'confirmed';
}

function applyBatchStatus() {
  for (const id of selectedIds.value) {
    const item = resourceItems.value.find(i => i.id === id);
    if (item) item.status = batchStatusModal.value;
  }
  showBatchStatusModal.value = false;
  selectedIds.value = [];
  persistState();
}

function batchSetOwner() {
  const owner = sdOwner.value;
  if (!owner) { alert('请先选择SD负责人'); return; }
  alert(`已将SD负责人设为「${owner}」`);
}

function autoGenerate() {
  const keywords: Array<{ kw: string; type: SDResourceType; name: string; spec: string; unit: string; brand: string }> = [
    { kw: '移液', type: 'consumable', name: '移液器吸头', spec: '200μL', unit: '盒', brand: 'Eppendorf' },
    { kw: '离心', type: 'consumable', name: '离心管', spec: '15mL', unit: '盒', brand: 'Corning' },
    { kw: '涡旋', type: 'equipment', name: '涡旋振荡仪', spec: 'VC-300', unit: '台', brand: 'SCIEX' },
    { kw: '内标', type: 'standard', name: '内标工作液 IS-WS', spec: '10μg/mL', unit: '瓶', brand: '内部配制' },
    { kw: '基质', type: 'reagent', name: '空白基质', spec: '人血浆', unit: '瓶', brand: 'Bioreclamation' },
    { kw: '沉淀剂', type: 'reagent', name: '沉淀剂（0.1%甲酸甲醇）', spec: '500mL', unit: '瓶', brand: 'Merck' },
    { kw: '复溶液', type: 'reagent', name: '复溶液（超纯水）', spec: '500mL', unit: '瓶', brand: 'Millipore' },
    { kw: '标准', type: 'standard', name: '标准品布洛芬', spec: '1000μg/mL', unit: '支', brand: 'USP' },
    { kw: '对照', type: 'control', name: '质控样品LQC', spec: '低浓度', unit: '支', brand: '内部配制' },
    { kw: '对照', type: 'control', name: '质控样品HQC', spec: '高浓度', unit: '支', brand: '内部配制' },
    { kw: '孔板', type: 'consumable', name: '96孔板', spec: '平底', unit: '盒', brand: 'Costar' },
    { kw: 'LC-MS', type: 'equipment', name: 'LC-MS/MS', spec: 'API 5500', unit: '台', brand: 'SCIEX' },
  ];

  const activeFormTemplate = activeForm.value?.template;
  const templateText = [
    activeFormTemplate?.templateName,
    activeFormTemplate?.description,
    activeFormTemplate?.structure?.notes?.join(' '),
  ].join(' ').toLowerCase();

  const generated: SDResourceItem[] = [];
  const used = new Set<string>();

  for (const kw of keywords) {
    if (templateText.includes(kw.kw) && !used.has(kw.name)) {
      used.add(kw.name);
      const plannedQty = kw.type === 'equipment' ? 1 : Math.ceil((activeForm.value?.template?.structure?.plate?.rows?.length ?? 4) * 2);
      const item: SDResourceItem = {
        id: generateId(),
        instanceId: activeInstanceId.value,
        itemId: activeForm.value?.itemId ?? '',
        itemName: getItemName(activeForm.value?.itemId ?? ''),
        templateId: activeForm.value?.templateId ?? '',
        templateName: activeForm.value?.template?.templateName ?? '',
        name: kw.name,
        materialCode: `${kw.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        type: kw.type,
        specification: kw.spec,
        unit: kw.unit,
        plannedQty,
        currentStock: kw.type === 'equipment' ? 1 : Math.floor(plannedQty * 0.6),
        gapQty: 0,
        brand: kw.brand,
        expectedArrival: '',
        isCritical: kw.type === 'standard' || kw.type === 'control',
        priority: kw.type === 'equipment' ? 'high' : 'medium',
        status: 'pending',
        remark: '',
      };
      item.gapQty = Math.max(0, item.plannedQty - item.currentStock);
      generated.push(item);
    }
  }

  if (generated.length === 0) {
    alert('未识别到自动建议关键词，请手动新增资源条目。');
    return;
  }

  resourceItems.value.push(...generated);
  persistState();
  alert(`已自动生成 ${generated.length} 条资源建议，请检查并补充完善。`);
}

function saveDraft() {
  persistState();
  alert('草稿已保存（模拟）');
}

function persistState() {
  if (typeof window === 'undefined') return;
  const state = {
    sdOwner: sdOwner.value,
    resourceItems: resourceItems.value,
    activeInstanceId: activeInstanceId.value,
  };
  window.localStorage.setItem(localStorageKey.value, JSON.stringify(state));
}

function restoreState() {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(localStorageKey.value);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    if (state.sdOwner) sdOwner.value = state.sdOwner;
    if (state.resourceItems?.length) resourceItems.value = state.resourceItems;
    if (state.activeInstanceId) activeInstanceId.value = state.activeInstanceId;
  } catch { /* ignore */ }
}

const drawerTabs = [
  { label: '仓库台账', value: 'warehouseLedger' },
  { label: '样品管理部台账', value: 'sampleLedger' },
  { label: '仪器设备台账', value: 'equipmentLedger' },
  { label: '特殊资源', value: 'special' },
];

const filteredSampleLedger = computed<SampleLedgerItem[]>(() => {
  let items = sampleLedger;
  if (drawerSampleFilter.value !== '全部') {
    items = items.filter(i => i.type === drawerSampleFilter.value);
  }
  if (drawerSearch.value) {
    const q = drawerSearch.value.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
  }
  return items;
});

const filteredWarehouseLedger = computed<WarehouseLedgerItem[]>(() => {
  let items = warehouseLedger;
  if (drawerWarehouseFilter.value !== '全部') {
    items = items.filter(i => i.type === drawerWarehouseFilter.value);
  }
  if (drawerSearch.value) {
    const q = drawerSearch.value.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
  }
  return items;
});

const filteredEquipmentLedger = computed<EquipmentLedgerItem[]>(() => {
  if (!drawerSearch.value) return equipmentLedger;
  const q = drawerSearch.value.toLowerCase();
  return equipmentLedger.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
});

function sampleTypeTone(t: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    '标准品': 'success', '对照品': 'info', '内标': 'warning', '质控品': 'neutral', '基质': 'neutral',
  };
  return map[t] ?? 'neutral';
}

function sampleStockStatusLabel(item: SampleLedgerItem): string {
  if (item.status === 'out_of_stock') return '缺货';
  if (item.stock === 0) return '缺货';
  return `${item.stock}${item.unit}`;
}

function sampleStockStatusTone(item: SampleLedgerItem): 'success' | 'warning' | 'danger' | 'neutral' {
  if (item.status === 'out_of_stock' || item.stock === 0) return 'danger';
  if (item.stock <= 3) return 'warning';
  return 'success';
}

function warehouseTypeLabel(t: string): string {
  const map: Record<string, string> = { reagent: '试剂', consumable: '耗材', solvent: '溶剂', other: '其他' };
  return map[t] ?? t;
}

function warehouseTypeTone(t: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    reagent: 'info', consumable: 'neutral', solvent: 'info', other: 'neutral',
  };
  return map[t] ?? 'neutral';
}

function warehouseStockStatusLabel(item: WarehouseLedgerItem): string {
  if (item.status === 'out_of_stock') return '缺货';
  if (item.status === 'low_stock') return '低库存';
  return `${item.stock}${item.unit}`;
}

function warehouseStockStatusTone(item: WarehouseLedgerItem): 'success' | 'warning' | 'danger' | 'neutral' {
  if (item.status === 'out_of_stock') return 'danger';
  if (item.status === 'low_stock') return 'warning';
  return 'success';
}

function equipStatusLabel(s: string): string {
  const map: Record<string, string> = {
    available: '可用', in_use: '使用中', maintenance: '维护中', calibration: '校准中',
  };
  return map[s] ?? s;
}

function equipStatusTone(s: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    available: 'success', in_use: 'info', maintenance: 'warning', calibration: 'warning',
  };
  return map[s] ?? 'neutral';
}

function backToPublish() {
  router.push({
    path: '/experiments/plans/new/publish',
    query: {
      planCode: planCode.value,
      projectId: projectId.value,
      itemIds: itemIds.value.join(','),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(p => `${p.itemId}:${p.templateId}`).join(',') } : {}),
    },
  });
}

function goToTaskAssignment() {
  persistState();
  router.push({
    path: '/experiments/plans/new/task-assignment',
    query: {
      planCode: planCode.value,
      projectId: projectId.value,
      itemIds: itemIds.value.join(','),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(p => `${p.itemId}:${p.templateId}`).join(',') } : {}),
    },
  });
}

onMounted(() => {
  restoreState();
  if (!activeInstanceId.value && allForms.value.length > 0) {
    activeInstanceId.value = allForms.value[0].instanceId;
  }
});
</script>
