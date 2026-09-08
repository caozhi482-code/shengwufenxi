<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="step - 1" />
    </div>

    <BasePageHeader
      title="项目资源调配"
      :subtitle="selectedProject ? `${selectedProject.name} · ${selectedProject.code}` : '先选择项目，再带入关联文件并规划资源'"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="$router.push('/experiments/plans')">返回列表</BaseButton>
        <BaseButton variant="primary" size="sm" :disabled="!canSaveProject" @click="saveDraft">保存项目资源</BaseButton>
      </template>
    </BasePageHeader>

    <div class="grid grid-cols-4 gap-5">
      <div class="col-span-3 space-y-5">
        <BaseCard v-if="step === 1">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <span class="text-base font-bold text-[--foreground]">选择管理项目</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">项目由 SD 负责人先确认并保存，实验负责人后续从计划列表进入项目编辑实验计划。</div>
              </div>
              <BaseButton variant="secondary" size="sm" @click="resetSelection">重置</BaseButton>
            </div>
          </template>

          <div class="space-y-4">
            <BaseFormField v-model="projectSearch" label="搜索项目" placeholder="输入项目名称或编号" />

            <div v-if="projectLoading" class="py-10 text-center text-sm text-[--muted-foreground]">加载中...</div>
            <div v-else-if="filteredProjects.length === 0" class="py-10 text-center text-sm text-[--muted-foreground]">未找到匹配项目</div>
            <div v-else class="space-y-2">
              <button
                v-for="proj in filteredProjects"
                :key="proj.id"
                type="button"
                class="w-full flex items-start gap-4 p-4 border rounded-lg transition-all text-left"
                :class="selectedProject?.id === proj.id ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] hover:border-[--border-strong]'"
                @click="selectProject(proj)"
              >
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5"
                  :class="selectedProject?.id === proj.id ? 'border-[--primary] bg-[--primary] text-white' : 'border-[--border]'">
                  <span v-if="selectedProject?.id === proj.id" class="text-xs">✓</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium text-[--text-main]">{{ proj.name }}</span>
                    <BaseTag :tone="proj.status === 'active' ? 'success' : 'neutral'" :label="proj.status === 'active' ? '现行' : '已归档'" />
                  </div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">{{ proj.code }}</div>
                  <div class="text-xs text-[--muted-foreground] mt-0.5">{{ proj.department }} · {{ proj.manager }} · {{ proj.researchArea }}</div>
                </div>
              </button>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-else-if="step === 2">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <span class="text-base font-bold text-[--foreground]">选择关联文件</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">
                  已选项目：<span class="font-medium text-[--text-main]">{{ selectedProject?.name }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <BaseButton variant="secondary" size="sm" @click="step = 1">← 返回</BaseButton>
                <BaseButton variant="secondary" size="sm" @click="selectAllFiles">全选可用文件</BaseButton>
                <BaseButton variant="primary" size="sm" :disabled="selectedFileIds.length === 0" @click="step = 3">下一步：资源配置 →</BaseButton>
              </div>
            </div>
          </template>

          <div v-if="fileLoading" class="py-10 text-center text-sm text-[--muted-foreground]">文件自动带入中...</div>
          <div v-else-if="projectFiles.length === 0" class="py-10 text-center text-sm text-[--muted-foreground]">该项目暂无可用文件</div>
          <div v-else class="space-y-5">
            <template v-for="group in fileGroups" :key="group.type">
              <div v-if="group.files.length > 0" class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-[--text-main]">{{ fileTypeLabel(group.type) }}</span>
                  <span class="text-xs text-[--muted-foreground]">{{ group.files.length }} 份</span>
                  <span class="text-xs font-medium text-[--primary]">已选 {{ selectedFilesByType(group.type).length }} 份</span>
                </div>
                <div class="space-y-2">
                  <button
                    v-for="file in group.files"
                    :key="file.id"
                    type="button"
                    class="w-full flex items-start gap-4 p-3 border rounded-lg text-left transition-all"
                    :class="selectedFileIds.includes(file.id) ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-white hover:border-[--border-strong]'"
                    @click="toggleFile(file)"
                  >
                    <BaseCheckbox :checked="selectedFileIds.includes(file.id)" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-medium text-[--text-main]">{{ file.name }}</span>
                        <BaseTag :tone="file.status === 'deprecated' ? 'danger' : 'success'" :label="file.status === 'deprecated' ? '已废止' : '现行'" />
                      </div>
                      <div class="text-xs text-[--muted-foreground] mt-0.5">{{ file.code }} / {{ file.version }} · {{ file.publishDate }}</div>
                      <div class="text-xs text-[--muted-foreground] mt-0.5">{{ file.description }}</div>
                    </div>
                    <BaseTag :tone="selectedFileIds.includes(file.id) ? 'success' : 'neutral'" :label="selectedFileIds.includes(file.id) ? '已带入' : '未带入'" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </BaseCard>

        <BaseCard v-else>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span class="text-base font-bold text-[--foreground]">项目资源调配</span>
                <div class="text-xs text-[--muted-foreground] mt-0.5">在这里配置本项目关联文件所需的试剂、耗材和设备；保存项目资源后，SD 角色操作结束。</div>
              </div>
              <div class="flex flex-wrap gap-2">
                <BaseButton variant="secondary" size="sm" @click="step = 2">← 返回文件</BaseButton>
                <BaseButton variant="secondary" size="sm" @click="autoGenerateResources">自动生成建议</BaseButton>
                <BaseButton variant="primary" size="sm" @click="openAddDrawer">+ 新增资源</BaseButton>
              </div>
            </div>
          </template>

          <div class="grid grid-cols-5 gap-4">
            <div class="col-span-2 space-y-4">
              <BaseCard>
                <template #header>
                  <span class="text-sm font-bold text-[--foreground]">项目摘要</span>
                </template>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between gap-3">
                    <span class="text-[--muted-foreground]">项目编号</span>
                    <span class="font-mono text-xs font-medium text-[--primary]">{{ selectedProject?.code ?? '—' }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-[--muted-foreground]">SD负责人</span>
                    <BaseFormField v-model="sdOwner" type="select" :options="ownerOptions" class="!w-[180px] !mb-0" />
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-[--muted-foreground]">关联文件</span>
                    <span class="font-medium text-[--text-main]">{{ selectedFileRecords.length }} 份</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-[--muted-foreground]">资源条目</span>
                    <span class="font-medium text-[--text-main]">{{ resourceItems.length }} 条</span>
                  </div>
                </div>
              </BaseCard>

              <BaseCard>
                <template #header>
                  <span class="text-sm font-bold text-[--foreground]">已选文件</span>
                </template>
                <div class="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  <button
                    v-for="file in selectedFileRecords"
                    :key="file.id"
                    type="button"
                    class="w-full rounded-lg border px-3 py-2 text-left transition-all"
                    :class="activeFileId === file.id ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-white hover:border-[--border-strong]'"
                    @click="activeFileId = file.id"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="min-w-0">
                        <div class="text-sm font-medium text-[--text-main] truncate">{{ file.name }}</div>
                        <div class="mt-1 text-[10px] font-mono text-[--primary]">{{ file.code }}</div>
                      </div>
                      <BaseTag :label="fileTypeLabel(file.type)" tone="neutral" />
                    </div>
                    <div class="mt-2 text-xs text-[--muted-foreground]">{{ resourceCountByFile(file.id) }} 条资源</div>
                  </button>
                </div>
              </BaseCard>
            </div>

            <div class="col-span-3 space-y-4">
              <BaseCard>
                <template #header>
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <span class="text-sm font-bold text-[--foreground]">资源清单</span>
                      <div class="text-xs text-[--muted-foreground] mt-0.5">当前文件：{{ activeFile?.name ?? '请选择一个关联文件' }}</div>
                    </div>
                    <BaseTag :label="resourceStatusLabel" :tone="resourceStatusTone" />
                  </div>
                </template>

                <div v-if="!activeFile" class="py-12 text-center text-sm text-[--muted-foreground]">请选择一个文件后开始配置资源</div>
                <div v-else>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="border-b border-[--border] bg-[--surface-muted]">
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">名称</th>
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">编码</th>
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">类型</th>
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">规格</th>
                          <th class="text-right px-3 py-2 font-semibold text-[--muted-foreground]">计划量</th>
                          <th class="text-right px-3 py-2 font-semibold text-[--muted-foreground]">库存</th>
                          <th class="text-right px-3 py-2 font-semibold text-[--muted-foreground]">缺口</th>
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">状态</th>
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">来源</th>
                          <th class="text-left px-3 py-2 font-semibold text-[--muted-foreground]">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in activeResourceItems" :key="item.id" class="border-b border-[--border] hover:bg-[--surface-muted]">
                          <td class="px-3 py-2 font-medium text-[--text-main]">{{ item.name }}</td>
                          <td class="px-3 py-2 font-mono text-[--muted-foreground]">{{ item.materialCode || '—' }}</td>
                          <td class="px-3 py-2"><BaseTag :label="resourceTypeLabel(item.type)" :tone="resourceTypeTone(item.type)" /></td>
                          <td class="px-3 py-2 text-[--muted-foreground]">{{ item.specification || '—' }}</td>
                          <td class="px-3 py-2 text-right font-medium">{{ item.plannedQty }}</td>
                          <td class="px-3 py-2 text-right">{{ item.currentStock }}</td>
                          <td class="px-3 py-2 text-right"><span :class="item.gapQty > 0 ? 'text-[--danger] font-semibold' : 'text-[--success]'">{{ item.gapQty > 0 ? item.gapQty : '—' }}</span></td>
                          <td class="px-3 py-2"><BaseTag :label="resourceStatusText(item.status)" :tone="resourceStatusToneMap(item.status)" /></td>
                          <td class="px-3 py-2"><BaseTag :label="sourceLabel(item.source)" :tone="sourceTone(item.source)" /></td>
                          <td class="px-3 py-2">
                            <div class="flex items-center gap-2 text-[--info]">
                              <button type="button" class="hover:underline" @click="editResource(item)">编辑</button>
                              <button type="button" class="hover:underline" @click="copyResource(item)">复制</button>
                              <button type="button" class="text-[--danger] hover:underline" @click="deleteResource(item)">删除</button>
                            </div>
                          </td>
                        </tr>
                        <tr v-if="activeResourceItems.length === 0">
                          <td colspan="10" class="px-3 py-10 text-center text-sm text-[--muted-foreground]">当前文件暂无资源条目</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </BaseCard>

              <BaseCard>
                <template #header>
                  <span class="text-sm font-bold text-[--foreground]">带入概览</span>
                </template>
                <div class="grid grid-cols-4 gap-3 text-center text-sm">
                  <div class="rounded-lg bg-[--primary-soft] p-3">
                    <div class="text-xl font-bold text-[--primary]">{{ selectedFileRecords.length }}</div>
                    <div class="text-[10px] text-[--muted-foreground] mt-1">文件</div>
                  </div>
                  <div class="rounded-lg bg-[--info-soft] p-3">
                    <div class="text-xl font-bold text-[--info]">{{ resourceItems.length }}</div>
                    <div class="text-[10px] text-[--muted-foreground] mt-1">资源</div>
                  </div>
                  <div class="rounded-lg bg-[--warning-soft] p-3">
                    <div class="text-xl font-bold text-[--warning]">{{ shortageCount }}</div>
                    <div class="text-[10px] text-[--muted-foreground] mt-1">缺口</div>
                  </div>
                  <div class="rounded-lg bg-[--success-soft] p-3">
                    <div class="text-xl font-bold text-[--success]">{{ confirmedCount }}</div>
                    <div class="text-[10px] text-[--muted-foreground] mt-1">已确认</div>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="col-span-1 space-y-4">
        <BaseCard>
          <template #header><span class="text-sm font-bold text-[--foreground]">流程摘要</span></template>
          <div v-if="!selectedProject" class="py-6 text-center text-xs text-[--muted-foreground]">
            SD 先选择项目，再进入文件和资源配置。
          </div>
          <div v-else class="space-y-2 text-sm">
            <div class="flex justify-between gap-3"><span class="text-[--muted-foreground]">项目</span><span class="font-medium text-[--text-main] text-right truncate max-w-[150px]">{{ selectedProject.name }}</span></div>
            <div class="flex justify-between gap-3"><span class="text-[--muted-foreground]">文件</span><span class="font-medium text-[--text-main]">{{ selectedFileRecords.length }} 份</span></div>
            <div class="flex justify-between gap-3"><span class="text-[--muted-foreground]">资源</span><span class="font-medium text-[--text-main]">{{ resourceItems.length }} 条</span></div>
            <div class="flex justify-between gap-3"><span class="text-[--muted-foreground]">状态</span><BaseTag :label="resourceStatusLabel" :tone="resourceStatusTone" /></div>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header><span class="text-sm font-bold text-[--foreground]">可用文件</span></template>
          <div class="space-y-2 text-xs max-h-[300px] overflow-y-auto pr-1">
            <div v-for="file in projectFiles" :key="file.id" class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
              <div class="flex items-center justify-between gap-2">
                <span class="font-medium text-[--text-main] truncate">{{ file.name }}</span>
                <BaseTag :label="fileTypeLabel(file.type)" tone="neutral" />
              </div>
              <div class="mt-1 text-[--muted-foreground]">{{ file.code }} · {{ file.version }}</div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseDrawer :open="drawerOpen" :title="drawerMode === 'add' ? '新增资源' : '编辑资源'" @close="drawerOpen = false">
      <div class="space-y-4">
        <!-- 来源切换标签 -->
        <div class="flex gap-1 p-1 bg-[--surface-muted] rounded-lg border border-[--border]">
          <button
            v-for="tab in drawerTabs"
            :key="tab.value"
            type="button"
            class="flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all"
            :class="drawerSource === tab.value ? 'bg-white text-[--text-main] shadow-sm' : 'text-[--muted-foreground] hover:text-[--text-main]'"
            @click="drawerSource = tab.value; drawerSearch = ''"
          >{{ tab.label }}</button>
        </div>

        <!-- 仓库台账 -->
        <template v-if="drawerSource === 'warehouseLedger'">
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <input
                type="text"
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
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">库存: {{ item.stock }}{{ item.unit }} · {{ item.shelf }}</div>
              </div>
              <div class="shrink-0">
                <BaseTag :label="warehouseStockStatusLabel(item)" :tone="warehouseStockStatusTone(item)" />
              </div>
            </div>
            <div v-if="filteredWarehouseLedger.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">无匹配结果</div>
          </div>
          <div class="text-[10px] text-[--muted-foreground]">点击条目自动填充表单，可在下方手动调整</div>
        </template>

        <!-- 样品台账 -->
        <template v-else-if="drawerSource === 'sampleLedger'">
          <div class="flex gap-2 items-center">
            <div class="relative flex-1">
              <input
                type="text"
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
                <div class="text-[10px] text-[--muted-foreground] mt-0.5">库存: {{ item.stock }}{{ item.unit }} · {{ item.location }}</div>
              </div>
              <div class="shrink-0">
                <BaseTag :label="sampleStockStatusLabel(item)" :tone="sampleStockStatusTone(item)" />
              </div>
            </div>
            <div v-if="filteredSampleLedger.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">无匹配结果</div>
          </div>
          <div class="text-[10px] text-[--muted-foreground]">点击条目自动填充表单，可在下方手动调整</div>
        </template>

        <!-- 仪器台账 -->
        <template v-else-if="drawerSource === 'equipmentLedger'">
          <div class="relative">
            <input
              type="text"
              v-model="drawerSearch"
              class="w-full h-8 pl-3 pr-3 text-xs bg-white border border-[--border] rounded-md outline-none focus:border-[--primary]"
              placeholder="搜索设备名称、编号、型号…"
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
            <div v-if="filteredEquipmentLedger.length === 0" class="text-xs text-[--muted-foreground] text-center py-6">无匹配结果</div>
          </div>
          <div class="text-[10px] text-[--muted-foreground]">点击条目自动填充表单，可在下方手动调整</div>
        </template>

        <!-- 特殊资源 -->
        <template v-else>
          <div class="text-[10px] text-[--warning] bg-[--warning-soft]/50 border border-[--warning-border] rounded-md px-2 py-1.5 mb-3">
            该资源未在上述台账中找到，请手动录入信息
          </div>
        </template>

        <!-- 来源摘要 -->
        <div v-if="drawerSource !== 'special'" class="rounded-md border border-[--border] bg-[--surface-muted] px-3 py-2 text-xs">
          <div class="font-medium text-[--text-main] mb-1">已选来源</div>
          <div class="text-[--muted-foreground]">
            <span v-if="drawerSource === 'warehouseLedger'">来源：仓库台账 · {{ editForm.materialCode || '未选中条目' }}</span>
            <span v-else-if="drawerSource === 'sampleLedger'">来源：样品台账 · {{ editForm.materialCode || '未选中条目' }}</span>
            <span v-else-if="drawerSource === 'equipmentLedger'">来源：仪器台账 · {{ editForm.materialCode || '未选中条目' }}</span>
          </div>
        </div>

        <!-- 公共表单 -->
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="资源名称" placeholder="输入资源名称" v-model="editForm.name" />
          <BaseFormField label="物料编码" placeholder="如：REG-2026-001" v-model="editForm.materialCode" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="资源类型" type="select" :options="resourceTypeOptions" v-model="editForm.type" />
          <BaseFormField label="单位" placeholder="瓶 / 支 / 盒" v-model="editForm.unit" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="规格型号" placeholder="如：10mL/瓶" v-model="editForm.specification" />
          <BaseFormField label="品牌" placeholder="如：Sigma" v-model="editForm.brand" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <BaseFormField label="计划数量" type="number" placeholder="0" v-model.number="editForm.plannedQty" />
          <BaseFormField label="当前库存" type="number" placeholder="0" v-model.number="editForm.currentStock" />
          <BaseFormField label="状态" type="select" :options="resourceStatusOptions" v-model="editForm.status" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseFormField label="预计到位时间" type="date" v-model="editForm.expectedArrival" />
          <BaseFormField label="优先级" type="select" :options="priorityOptions" v-model="editForm.priority" />
        </div>
        <div class="flex items-center gap-2">
          <BaseCheckbox :checked="editForm.isCritical" @update:checked="v => (editForm.isCritical = v)" />
          <span class="text-xs text-[--text-main]">关键物料</span>
        </div>
        <BaseFormField label="备注" type="textarea" placeholder="可选备注" v-model="editForm.remark" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="drawerOpen = false">取消</BaseButton>
        <BaseButton variant="primary" @click="saveResource">保存</BaseButton>
      </template>
    </BaseDrawer>

    <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="confirmDelete = null" />
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
        <div class="text-base font-bold text-[--text-main] mb-2">确认删除</div>
        <div class="text-sm text-[--muted-foreground] mb-4">确定要删除资源「{{ confirmDelete?.name }}」吗？</div>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="confirmDelete = null">取消</BaseButton>
          <BaseButton variant="danger" size="sm" @click="confirmDeleteResource">确认删除</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import BaseDrawer from '@/components/base/BaseDrawer.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import { projects, searchProjects } from '@/api/mock/projects';
import { getFilesByProject, getFileTypeLabel } from '@/api/mock/files';
import type { FileItem, FileType } from '@/api/mock/files';
import type { Project } from '@/api/mock/projects';
import type { SDResourceSource, SDResourceStatus, SDResourceType } from '@/types/experiments';
import { sampleLedger, warehouseLedger, equipmentLedger } from '@/api/mock/ledgers';
import type { SampleLedgerItem, WarehouseLedgerItem, EquipmentLedgerItem } from '@/api/mock/ledgers';

interface AllocationResourceItem {
  id: string;
  fileId: string;
  fileName: string;
  fileType: FileType;
  itemId: string;
  itemName: string;
  templateId: string;
  templateName: string;
  name: string;
  materialCode: string;
  type: SDResourceType;
  specification: string;
  unit: string;
  plannedQty: number;
  currentStock: number;
  gapQty: number;
  brand: string;
  expectedArrival: string;
  isCritical: boolean;
  priority: 'high' | 'medium' | 'low';
  status: SDResourceStatus;
  remark: string;
  source: SDResourceSource;
}
type AllocationState = {
  projectId: string;
  selectedFileIds: string[];
  activeFileId: string;
  sdOwner: string;
  resources: AllocationResourceItem[];
};

const router = useRouter();
const step = ref(1);
const projectSearch = ref('');
const projectLoading = ref(false);
const fileLoading = ref(false);
const selectedProject = ref<Project | null>(null);
const selectedFileIds = ref<string[]>([]);
const activeFileId = ref('');
const sdOwner = ref('');
const resourceItems = ref<AllocationResourceItem[]>([]);
const drawerOpen = ref(false);
const drawerMode = ref<'add' | 'edit'>('add');
const drawerSource = ref<SDResourceSource>('warehouseLedger');
const drawerSearch = ref('');
const drawerSampleFilter = ref('全部');
const drawerWarehouseFilter = ref('全部');
const confirmDelete = ref<AllocationResourceItem | null>(null);
const editingId = ref('');
const editForm = ref<Partial<AllocationResourceItem>>({
  fileId: '', fileName: '', fileType: 'sop', name: '', materialCode: '', type: 'reagent', specification: '',
  unit: '', plannedQty: 0, currentStock: 0, gapQty: 0, brand: '', expectedArrival: '', isCritical: false,
  priority: 'medium', status: 'pending', remark: '', source: 'special', itemId: '', itemName: '', templateId: '', templateName: '',
});

const steps = [
  { label: '选择项目', sub: '由 SD 负责人确定计划项目' },
  { label: '选择关联文件', sub: '自动带入并确认项目文件' },
  { label: '项目资源调配', sub: 'SD 保存项目资源' },
];

const projectFiles = computed(() => {
  if (!selectedProject.value) return [] as FileItem[];
  return getFilesByProject(selectedProject.value.id).filter(file => file.status !== 'archived');
});
const selectedFileRecords = computed(() => {
  const ids = new Set(selectedFileIds.value);
  return projectFiles.value.filter(file => ids.has(file.id));
});
const activeFile = computed(() => selectedFileRecords.value.find(file => file.id === activeFileId.value) ?? selectedFileRecords.value[0] ?? null);
const activeResourceItems = computed(() => resourceItems.value.filter(item => item.fileId === activeFile.value?.id));
const filteredProjects = computed(() => searchProjects(projectSearch.value));
const canSaveProject = computed(() => !!selectedProject.value && selectedFileRecords.value.length > 0 && resourceItems.value.length > 0);
const fileGroups = computed(() => ([
  { type: 'sop' as FileType, files: projectFiles.value.filter(file => file.type === 'sop') },
  { type: 'method' as FileType, files: projectFiles.value.filter(file => file.type === 'method') },
  { type: 'protocol' as FileType, files: projectFiles.value.filter(file => file.type === 'protocol') },
]));
const ownerOptions = computed(() => ['张明', '李华', '王芳', '赵强', '孙丽', '周伟'].map(name => ({ label: name, value: name })));

const resourceTypeOptions = [
  { value: 'reagent', label: '试剂' },
  { value: 'consumable', label: '耗材' },
  { value: 'equipment', label: '设备' },
  { value: 'standard', label: '标准品' },
  { value: 'control', label: '对照品' },
  { value: 'other', label: '其他' },
];

const resourceStatusOptions = [
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'reserved', label: '已预留' },
  { value: 'purchasing', label: '待采购' },
  { value: 'arrived', label: '已到位' },
  { value: 'shortage', label: '缺货' },
];

const priorityOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const localStorageKey = computed(() => selectedProject.value ? `project-resource-allocation::${selectedProject.value.id}` : 'project-resource-allocation::draft');

const drawerTabs = [
  { label: '仓库台账', value: 'warehouseLedger' },
  { label: '样品台账', value: 'sampleLedger' },
  { label: '仪器台账', value: 'equipmentLedger' },
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
  return { reagent: '试剂', consumable: '耗材', solvent: '溶剂', other: '其他' }[t] ?? t;
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
  return { available: '可用', in_use: '使用中', maintenance: '维护中', calibration: '校准中' }[s] ?? s;
}

function equipStatusTone(s: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  return { available: 'success', in_use: 'info', maintenance: 'warning', calibration: 'warning' }[s] ?? 'neutral';
}

function sourceLabel(s: SDResourceSource): string {
  return { warehouseLedger: '仓库台账', sampleLedger: '样品台账', equipmentLedger: '仪器台账', special: '特殊资源' }[s] ?? '未知';
}

function sourceTone(s: SDResourceSource): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  return { warehouseLedger: 'info', sampleLedger: 'success', equipmentLedger: 'warning', special: 'neutral' }[s] ?? 'neutral';
}

function fileTypeLabel(type: FileType): string {
  return getFileTypeLabel(type);
}

function resourceTypeLabel(type: SDResourceType): string {
  return { reagent: '试剂', consumable: '耗材', equipment: '设备', standard: '标准品', control: '对照品', other: '其他' }[type] ?? type;
}

function resourceTypeTone(type: SDResourceType): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<SDResourceType, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    reagent: 'info',
    consumable: 'neutral',
    equipment: 'warning',
    standard: 'success',
    control: 'success',
    other: 'neutral',
  };
  return map[type] ?? 'neutral';
}

function resourceStatusText(status: SDResourceStatus): string {
  return { pending: '待确认', confirmed: '已确认', reserved: '已预留', purchasing: '待采购', arrived: '已到位', shortage: '缺货' }[status] ?? status;
}

function resourceStatusToneMap(status: SDResourceStatus): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  const map: Record<SDResourceStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'neutral',
    confirmed: 'success',
    reserved: 'info',
    purchasing: 'warning',
    arrived: 'success',
    shortage: 'danger',
  };
  return map[status] ?? 'neutral';
}

const resourceStatusLabel = computed(() => {
  if (resourceItems.value.length === 0) return '未规划';
  if (shortageCount.value > 0) return '存在缺口';
  if (confirmedCount.value > 0) return '部分确认';
  return '规划中';
});

const resourceStatusTone = computed(() => {
  if (resourceItems.value.length === 0) return 'neutral' as const;
  if (shortageCount.value > 0) return 'danger' as const;
  if (confirmedCount.value > 0) return 'warning' as const;
  return 'info' as const;
});

const shortageCount = computed(() => resourceItems.value.filter(item => item.gapQty > 0).length);
const confirmedCount = computed(() => resourceItems.value.filter(item => item.status === 'confirmed' || item.status === 'arrived').length);

function selectProject(proj: Project) {
  selectedProject.value = proj;
  projectSearch.value = '';
  step.value = 2;
}

function resetSelection() {
  selectedProject.value = null;
  selectedFileIds.value = [];
  activeFileId.value = '';
  sdOwner.value = '';
  resourceItems.value = [];
  step.value = 1;
}

function selectAllFiles() {
  selectedFileIds.value = projectFiles.value.map(file => file.id);
  activeFileId.value = selectedFileIds.value[0] ?? '';
  persistState();
}

function toggleFile(file: FileItem) {
  const idx = selectedFileIds.value.indexOf(file.id);
  if (idx >= 0) {
    selectedFileIds.value.splice(idx, 1);
    resourceItems.value = resourceItems.value.filter(item => item.fileId !== file.id);
    if (activeFileId.value === file.id) activeFileId.value = selectedFileIds.value[0] ?? '';
  } else {
    selectedFileIds.value.push(file.id);
    activeFileId.value = file.id;
  }
  persistState();
}

function selectedFilesByType(type: FileType): FileItem[] {
  return selectedFileRecords.value.filter(file => file.type === type);
}

function resourceCountByFile(fileId: string): number {
  return resourceItems.value.filter(item => item.fileId === fileId).length;
}

function buildResourceFromFile(file: FileItem): AllocationResourceItem[] {
  const base: Array<Pick<AllocationResourceItem, 'name' | 'materialCode' | 'type' | 'specification' | 'unit' | 'plannedQty' | 'currentStock' | 'brand' | 'expectedArrival' | 'isCritical' | 'priority' | 'status' | 'remark' | 'source'>> = [];
  if (file.type === 'method') {
    base.push(
      { name: 'LC-MS/MS', materialCode: 'EQ-LCMS-001', type: 'equipment', specification: 'API 5500', unit: '台', plannedQty: 1, currentStock: 1, brand: 'SCIEX', expectedArrival: '', isCritical: true, priority: 'high', status: 'confirmed', remark: '方法对应主分析设备', source: 'equipmentLedger' },
      { name: '内标工作液', materialCode: 'STD-IS-001', type: 'standard', specification: '10μg/mL', unit: '瓶', plannedQty: 2, currentStock: 1, brand: '内部配制', expectedArrival: '', isCritical: true, priority: 'high', status: 'pending', remark: '与方法文件关联的内标', source: 'sampleLedger' },
      { name: '复溶液', materialCode: 'REG-RES-001', type: 'reagent', specification: '500mL', unit: '瓶', plannedQty: 2, currentStock: 1, brand: 'Millipore', expectedArrival: '', isCritical: false, priority: 'medium', status: 'pending', remark: '用于样品复溶', source: 'warehouseLedger' },
    );
  } else if (file.type === 'sop') {
    base.push(
      { name: '离心管', materialCode: 'CON-TUBE-015', type: 'consumable', specification: '15mL', unit: '盒', plannedQty: 3, currentStock: 2, brand: 'Corning', expectedArrival: '', isCritical: false, priority: 'medium', status: 'pending', remark: '样品前处理耗材', source: 'warehouseLedger' },
      { name: '吸头', materialCode: 'CON-TIP-200', type: 'consumable', specification: '200μL', unit: '盒', plannedQty: 4, currentStock: 1, brand: 'Eppendorf', expectedArrival: '', isCritical: false, priority: 'medium', status: 'pending', remark: '移液耗材', source: 'warehouseLedger' },
      { name: '乙腈', materialCode: 'REG-ACN-001', type: 'reagent', specification: 'HPLC级', unit: '瓶', plannedQty: 2, currentStock: 1, brand: 'Merck', expectedArrival: '', isCritical: true, priority: 'high', status: 'pending', remark: 'SOP 常用试剂', source: 'warehouseLedger' },
    );
  } else {
    base.push(
      { name: '标准品', materialCode: 'STD-GEN-001', type: 'standard', specification: '1000μg/mL', unit: '支', plannedQty: 2, currentStock: 1, brand: 'USP', expectedArrival: '', isCritical: true, priority: 'high', status: 'pending', remark: '方案对应标准品', source: 'sampleLedger' },
      { name: '空白基质', materialCode: 'MAT-GEN-001', type: 'reagent', specification: '人血浆', unit: '瓶', plannedQty: 3, currentStock: 1, brand: 'Bioreclamation', expectedArrival: '', isCritical: true, priority: 'high', status: 'pending', remark: '方案对应基质材料', source: 'sampleLedger' },
    );
  }

  return base.map((item, index) => ({
    id: `${file.id}-${Date.now().toString(36)}-${index}`,
    fileId: file.id,
    fileName: file.name,
    fileType: file.type,
    itemId: '',
    itemName: '',
    templateId: '',
    templateName: '',
    gapQty: Math.max(0, item.plannedQty - item.currentStock),
    ...item,
  }));
}

function autoGenerateResources() {
  if (!activeFile.value) return;
  const generated = buildResourceFromFile(activeFile.value);
  const existingNames = new Set(activeResourceItems.value.map(item => item.name));
  const fresh = generated.filter(item => !existingNames.has(item.name));
  if (fresh.length === 0) {
    alert('当前文件没有可自动生成的建议资源，建议手动新增。');
    return;
  }
  resourceItems.value.push(...fresh);
  persistState();
}

function openAddDrawer() {
  if (!activeFile.value) return;
  drawerMode.value = 'add';
  drawerSource.value = 'warehouseLedger';
  drawerSearch.value = '';
  drawerSampleFilter.value = '全部';
  drawerWarehouseFilter.value = '全部';
  editingId.value = '';
  editForm.value = {
    fileId: activeFile.value.id,
    fileName: activeFile.value.name,
    fileType: activeFile.value.type,
    name: '', materialCode: '', type: 'reagent', specification: '', unit: '', plannedQty: 0, currentStock: 0,
    gapQty: 0, brand: '', expectedArrival: '', isCritical: false, priority: 'medium', status: 'pending', remark: '',
    source: 'special', itemId: '', itemName: '', templateId: '', templateName: '',
  };
  drawerOpen.value = true;
}

function fillFromWarehouseLedger(item: WarehouseLedgerItem) {
  drawerSource.value = 'warehouseLedger';
  drawerSearch.value = '';
  const typeMap: Record<string, SDResourceType> = { reagent: 'reagent', consumable: 'consumable', solvent: 'reagent', other: 'other' };
  editForm.value = {
    fileId: activeFile.value?.id ?? '',
    fileName: activeFile.value?.name ?? '',
    fileType: activeFile.value?.type ?? 'sop',
    name: item.name, materialCode: item.code, type: typeMap[item.type] ?? 'other',
    specification: item.specification, unit: item.unit, brand: item.brand,
    currentStock: item.stock, plannedQty: item.stock,
    expectedArrival: '', isCritical: item.type === 'reagent',
    priority: item.type === 'reagent' ? 'high' : 'medium',
    status: item.status === 'out_of_stock' ? 'shortage' : item.status === 'low_stock' ? 'purchasing' : 'pending',
    remark: `台账ID: ${item.id} · 批次: ${item.batch}${item.shelf ? ` · 货位: ${item.shelf}` : ''}${item.status !== 'in_stock' ? ` · [${item.status === 'low_stock' ? '低库存' : '缺货'}]` : ''}`,
    source: 'warehouseLedger',
    gapQty: 0, itemId: '', itemName: '', templateId: '', templateName: '',
  };
}

function fillFromSampleLedger(item: SampleLedgerItem) {
  drawerSource.value = 'sampleLedger';
  drawerSearch.value = '';
  const typeMap: Record<string, SDResourceType> = { '标准品': 'standard', '内标': 'standard', '质控品': 'control', '基质': 'other' };
  editForm.value = {
    fileId: activeFile.value?.id ?? '',
    fileName: activeFile.value?.name ?? '',
    fileType: activeFile.value?.type ?? 'sop',
    name: item.name, materialCode: item.code, type: typeMap[item.type] ?? 'other',
    specification: item.specification, unit: item.unit, brand: item.brand,
    currentStock: item.stock, plannedQty: Math.ceil(item.stock * 0.8),
    expectedArrival: item.expiryDate, isCritical: item.type === '标准品' || item.type === '内标',
    priority: item.type === '标准品' ? 'high' : 'medium',
    status: item.stock === 0 ? 'shortage' : item.status === 'out_of_stock' ? 'shortage' : 'pending',
    remark: `台账ID: ${item.id} · 批次: ${item.batch} · 存放: ${item.location}${item.status === 'out_of_stock' ? ' · [缺货]' : ''}`,
    source: 'sampleLedger',
    gapQty: 0, itemId: '', itemName: '', templateId: '', templateName: '',
  };
}

function fillFromEquipmentLedger(item: EquipmentLedgerItem) {
  drawerSource.value = 'equipmentLedger';
  drawerSearch.value = '';
  editForm.value = {
    fileId: activeFile.value?.id ?? '',
    fileName: activeFile.value?.name ?? '',
    fileType: activeFile.value?.type ?? 'sop',
    name: item.name, materialCode: item.code, type: 'equipment',
    specification: item.model, unit: '台', brand: item.brand,
    currentStock: item.status === 'available' ? 1 : 0,
    plannedQty: 1,
    expectedArrival: item.nextCalibration, isCritical: true,
    priority: 'high',
    status: item.status === 'available' ? 'confirmed' : item.status === 'in_use' ? 'reserved' : item.status === 'maintenance' ? 'purchasing' : 'pending',
    remark: `台账ID: ${item.id} · 序列号: ${item.serialNumber} · 位置: ${item.location}${item.nextCalibration ? ` · 下次校准: ${item.nextCalibration}` : ''}${item.remark ? ` · ${item.remark}` : ''}`,
    source: 'equipmentLedger',
    gapQty: 0, itemId: '', itemName: '', templateId: '', templateName: '',
  };
}

function editResource(item: AllocationResourceItem) {
  drawerMode.value = 'edit';
  drawerSource.value = item.source;
  drawerSearch.value = '';
  editingId.value = item.id;
  editForm.value = { ...item };
  drawerOpen.value = true;
}

function copyResource(item: AllocationResourceItem) {
  const next: AllocationResourceItem = { ...item, id: `${item.id}-copy-${Date.now().toString(36)}`, name: `${item.name}（副本）` };
  resourceItems.value.push(next);
  persistState();
}

function deleteResource(item: AllocationResourceItem) {
  confirmDelete.value = item;
}

function confirmDeleteResource() {
  if (!confirmDelete.value) return;
  resourceItems.value = resourceItems.value.filter(item => item.id !== confirmDelete.value?.id);
  confirmDelete.value = null;
  persistState();
}

function saveResource() {
  if (!editForm.value.name || !editForm.value.fileId) {
    alert('请先选择文件并填写资源名称');
    return;
  }
  const payload: AllocationResourceItem = {
    id: editingId.value || `${editForm.value.fileId}-${Date.now().toString(36)}`,
    fileId: editForm.value.fileId ?? '',
    fileName: editForm.value.fileName ?? '',
    fileType: (editForm.value.fileType ?? 'sop') as FileType,
    itemId: editForm.value.itemId ?? '',
    itemName: editForm.value.itemName ?? '',
    templateId: editForm.value.templateId ?? '',
    templateName: editForm.value.templateName ?? '',
    name: editForm.value.name ?? '',
    materialCode: editForm.value.materialCode ?? '',
    type: (editForm.value.type ?? 'reagent') as SDResourceType,
    specification: editForm.value.specification ?? '',
    unit: editForm.value.unit ?? '',
    plannedQty: Number(editForm.value.plannedQty ?? 0),
    currentStock: Number(editForm.value.currentStock ?? 0),
    gapQty: Math.max(0, Number(editForm.value.plannedQty ?? 0) - Number(editForm.value.currentStock ?? 0)),
    brand: editForm.value.brand ?? '',
    expectedArrival: editForm.value.expectedArrival ?? '',
    isCritical: Boolean(editForm.value.isCritical),
    priority: (editForm.value.priority ?? 'medium') as 'high' | 'medium' | 'low',
    status: (editForm.value.status ?? 'pending') as SDResourceStatus,
    remark: editForm.value.remark ?? '',
    source: drawerSource.value as SDResourceSource,
  };
  if (drawerMode.value === 'add') {
    resourceItems.value.push(payload);
  } else {
    const idx = resourceItems.value.findIndex(item => item.id === editingId.value);
    if (idx >= 0) resourceItems.value[idx] = payload;
  }
  drawerOpen.value = false;
  persistState();
}

function saveDraft() {
  persistState();
  alert('项目资源已保存，可由实验负责人进入项目编辑实验计划');
}

function persistState() {
  if (typeof window === 'undefined' || !selectedProject.value) return;
  const state: AllocationState = {
    projectId: selectedProject.value.id,
    selectedFileIds: selectedFileIds.value,
    activeFileId: activeFileId.value,
    sdOwner: sdOwner.value,
    resources: resourceItems.value,
  };
  window.localStorage.setItem(localStorageKey.value, JSON.stringify(state));
}

function hydrateProjectState(projectId: string, allowFallback = true) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(`project-resource-allocation::${projectId}`);
  if (raw) {
    try {
      const state = JSON.parse(raw) as Partial<AllocationState>;
      if (Array.isArray(state.selectedFileIds)) selectedFileIds.value = state.selectedFileIds.filter(Boolean);
      if (typeof state.activeFileId === 'string') activeFileId.value = state.activeFileId;
      if (typeof state.sdOwner === 'string') sdOwner.value = state.sdOwner;
      if (Array.isArray(state.resources)) resourceItems.value = state.resources as AllocationResourceItem[];
      if (selectedFileIds.value.length === 0 && allowFallback) {
        selectedFileIds.value = projectFiles.value.map(file => file.id);
      }
      if (!selectedFileIds.value.includes(activeFileId.value)) activeFileId.value = selectedFileIds.value[0] ?? '';
      return;
    } catch {
      // ignore malformed cache
    }
  }
  selectedFileIds.value = projectFiles.value.map(file => file.id);
  activeFileId.value = selectedFileIds.value[0] ?? '';
  sdOwner.value = selectedProject.value?.manager ?? '';
  resourceItems.value = [];
}

watch(selectedProject, (proj) => {
  if (!proj) return;
  fileLoading.value = true;
  hydrateProjectState(proj.id);
  setTimeout(() => { fileLoading.value = false; }, 250);
}, { immediate: true });

watch([selectedFileIds, activeFileId, sdOwner, resourceItems], () => {
  persistState();
}, { deep: true });

onMounted(() => {
  if (!selectedProject.value) return;
  hydrateProjectState(selectedProject.value.id);
  if (!sdOwner.value) sdOwner.value = selectedProject.value.manager;
});
</script>
