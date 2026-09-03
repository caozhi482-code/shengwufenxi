<template>
  <div class="space-y-5 pb-24">
    <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-5 py-4">
      <StepWizard :steps="steps" :current="4" />
    </div>

    <BasePageHeader
      title="已选表单工作台"
      :subtitle="`${selectedProject?.name ?? '—'} · ${planCode} · ${currentItem?.name ?? '当前考察项'}`"
    >
      <template #extra>
        <BaseButton variant="secondary" size="sm" @click="backToItems">返回考察项</BaseButton>
      </template>
    </BasePageHeader>

    <div v-if="!selectedProject || selectedFiles.length === 0 || selectedItems.length === 0" class="grid grid-cols-4 gap-5">
      <div class="col-span-3">
        <BaseCard>
          <template #header>
            <span class="text-base font-bold text-[--foreground]">无法继续</span>
          </template>
          <div class="py-12 text-center space-y-3">
            <div class="text-sm font-medium text-[--text-main]">请先完成项目、关联文件和考察项选择</div>
            <div class="text-xs text-[--muted-foreground]">工作台依赖上一步传入的计划上下文。</div>
            <BaseButton variant="primary" @click="backToItems">返回考察项选择</BaseButton>
          </div>
        </BaseCard>
      </div>
      <div class="col-span-1">
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">上下文摘要</span>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">计划编号</span>
              <span class="font-mono text-xs font-medium text-[--primary]">{{ planCode }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">当前步骤</span>
              <span class="font-medium text-[--danger]">表单集合页</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-2 gap-5">
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[--foreground]">已选考察项</span>
              <span class="text-xs text-[--muted-foreground]">{{ selectedItems.length }} 项</span>
            </div>
          </template>

          <div class="space-y-2">
            <button
              v-for="item in selectedItems"
              :key="item.id"
              type="button"
              class="w-full rounded-lg border p-3 text-left transition-all"
              :class="currentItem?.id === item.id ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-white hover:border-[--primary-border]'"
              @click="currentItemId = item.id"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-[--text-main]">{{ item.name }}</div>
                  <div class="mt-1 font-mono text-[10px] text-[--primary]">{{ item.id }}</div>
                </div>
                <BaseTag :label="`${selectionCount(item.id)} 个表单`" tone="success" />
              </div>
              <div class="mt-2 text-xs text-[--muted-foreground]">点击查看该考察项下已选表单</div>
            </button>
          </div>
        </BaseCard>

        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">表单状态</span>
          </template>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">未编辑</span>
              <span class="font-semibold text-[--danger]">{{ statusCount('unedited') }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">编辑中</span>
              <span class="font-semibold text-[--warning]">{{ statusCount('editing') }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-[--muted-foreground]">已完成</span>
              <span class="font-semibold text-[--primary]">{{ statusCount('done') }}</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <BaseCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm font-bold text-[--foreground]">{{ currentItem?.name ?? '当前考察项' }} 的已选表单</div>
              <div class="text-xs text-[--muted-foreground] mt-0.5">同一考察项下的多个表单会一起展示，支持逐个编辑和统一保存。</div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <BaseButton variant="secondary" size="sm" @click="saveCurrent">保存当前表单</BaseButton>
            </div>
          </div>
        </template>

        <div class="mb-4 rounded-lg border border-[--border] bg-[--surface-muted] p-3 text-xs text-[--muted-foreground]">
          选择的模板会生成计划下的模板实例，返回该页面时会根据路由和上下文恢复当前考察项与已选表单。
        </div>

        <div class="grid grid-cols-[240px_1fr] gap-4">
          <div class="space-y-2">
            <button
              v-for="form in currentForms"
              :key="form.instanceId"
              type="button"
              class="w-full rounded-xl border p-3 text-left transition-all"
              :class="activeFormId === form.instanceId ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] bg-white hover:border-[--primary-border]'"
              @click="activeFormId = form.instanceId"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-[--text-main]">{{ form.template.templateName }}</div>
                  <div class="mt-1 font-mono text-[10px] text-[--primary]">{{ form.instanceId }}</div>
                </div>
                <BaseTag :label="statusLabel(form.status)" :tone="statusTone(form.status)" />
              </div>
              <div class="mt-2 text-xs text-[--muted-foreground]">{{ form.template.templateCode }} · {{ form.template.version }}</div>
            </button>
          </div>

          <div v-if="activeForm" class="space-y-4">
            <BaseCard>
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="text-sm font-bold text-[--foreground]">{{ activeForm.template.templateName }}</div>
                    <div class="text-xs text-[--muted-foreground] mt-0.5">{{ activeForm.template.templateCode }} · {{ activeForm.template.version }} · {{ activeForm.instanceId }}</div>
                  </div>
                  <BaseTag :label="statusLabel(activeForm.status)" :tone="statusTone(activeForm.status)" />
                </div>
              </template>

              <div class="grid grid-cols-4 gap-3 text-sm">
                <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
                  <div class="text-xs text-[--muted-foreground]">表单状态</div>
                  <div class="mt-1 font-semibold text-[--text-main]">{{ statusLabel(activeForm.status) }}</div>
                </div>
                <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
                  <div class="text-xs text-[--muted-foreground]">模板来源</div>
                  <div class="mt-1 font-semibold text-[--text-main] truncate">表单模板中心</div>
                </div>
                <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
                  <div class="text-xs text-[--muted-foreground]">表单类型</div>
                  <div class="mt-1 font-semibold text-[--text-main]">{{ formTypeLabel(activeForm) }}</div>
                </div>
                <div class="rounded-lg border border-[--border] bg-[--surface-muted] p-3">
                  <div class="text-xs text-[--muted-foreground]">当前考察项</div>
                  <div class="mt-1 font-semibold text-[--text-main] truncate">{{ currentItem?.name ?? '—' }}</div>
                </div>
              </div>
            </BaseCard>

            <BaseCard>
              <template #header>
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div class="text-sm font-bold text-[--foreground]">表单内容编辑</div>
                  </div>
                </div>
              </template>

              <template v-if="isGenericPlateTemplate(activeForm.template)">
                <SequenceGrid
                  :cells="activeForm.cells"
                  :footer="activeForm.footer"
                  :read-only="false"
                  :active-key="activeCellKey"
                  @edit-cell="openCellEditor"
                  @select-all="selectAll"
                  @invert="invert"
                  @clear="clear"
                  @batch="batchPanelOpen = !batchPanelOpen"
                  @import="fillRecommended(activeForm.instanceId)"
                  @update:footer="updateFooter"
                />
              </template>

              <div v-else class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[--border] bg-[--surface-muted] px-3 py-2 text-xs text-[--muted-foreground]">
                  <span>{{ isWorkSolutionTemplate(activeForm.template) ? '表单已按模板中心样式展开，可直接编辑表体。' : '当前模板会按模板中心的样式直接展开，表头和结构区保持原样，只编辑表体内容。' }}</span>
                  <div class="flex flex-wrap gap-2">
                    <BaseButton variant="secondary" size="sm" @click="fillRecommended(activeForm.instanceId)">一键填充推荐</BaseButton>
                  </div>
                </div>

                <SolutionPrepTableBlock
                  v-if="isSolutionPrepTemplate(activeForm.template)"
                  :top-rows="activeForm.solutionTopRows"
                  :bottom-rows="activeForm.solutionBottomRows"
                  editable
                  @update:top-rows="updateSolutionTopRows"
                  @update:bottom-rows="updateSolutionBottomRows"
                />
                <ReferenceStockTableBlock
                  v-else-if="isReferenceStockTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <MSSolutionTableBlock
                  v-else-if="isMSSolutionTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @configure-cell="openMsCellDrawer"
                  @update:model-value="updateActiveRecordModel"
                />
                <InjectionSequenceTableBlock
                  v-else-if="isInjectionSequenceTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <AdditionSequenceTableBlock
                  v-else-if="isAdditionSequenceTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <WorkSolutionTableBlock
                  v-else-if="isWorkSolutionTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  :demo-cell-configured="workSolutionDemoConfigured"
                  @configure-demo-cell="openWorkSolutionDemoCell"
                  @update:model-value="updateActiveRecordModel"
                />
                <SplitRecordTableBlock
                  v-else-if="isSplitTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <MatrixSampleTableBlock
                  v-else-if="isMatrixSampleTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <InjectionLCMSRecordTableBlock
                  v-else-if="isInjectionLCMSTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <StabilitySampleTableBlock
                  v-else-if="isStabilityTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <DilutionRecordTableBlock
                  v-else-if="isDilutionTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <PureSolutionStabilityTableBlock
                  v-else-if="isPureSolutionStabilityTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <FreezeThawStabilityTableBlock
                  v-else-if="isFreezeThawTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <MatrixSampleStabilityTableBlock
                  v-else-if="isMatrixSampleStabilityTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <MethodValidationResultBlock
                  v-else-if="isMethodValidationResultTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <ReanalysisApplicationBlock
                  v-else-if="isReanalysisApplicationTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <ISStockSolutionBlock
                  v-else-if="isISStockSolutionTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <ReanalysisSummaryDoubleBlock
                  v-else-if="isReanalysisSummaryDoubleTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <ReanalysisSummarySingleBlock
                  v-else-if="isReanalysisSummarySingleTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <UnconventionalStabilityBlock
                  v-else-if="isUnconventionalStabilityTemplate(activeForm.template)"
                  :model-value="activeForm.recordModel as any"
                  editable
                  @update:model-value="updateActiveRecordModel"
                />
                <div v-else class="space-y-4">
                  <div class="overflow-x-auto rounded-xl border border-[--border] bg-white">
                    <table class="min-w-[980px] w-full border-collapse text-sm text-[--text-main]">
                      <tbody>
                        <tr>
                          <td class="generic-title" :colspan="genericColumnSpan(activeForm)">
                            <div class="flex items-center justify-between gap-3">
                              <span>{{ activeForm.template.templateName }}</span>
                              <span class="text-sm font-medium">{{ activeForm.template.templateCode }} / {{ activeForm.template.version }}</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td class="generic-label">项目编号</td>
                          <td class="generic-cell"><input :value="activeForm.recordModel.context.projectCode" class="generic-input" @input="updateGenericContext('projectCode', ($event.target as HTMLInputElement).value)" /></td>
                          <td class="generic-label">计划编号</td>
                          <td class="generic-cell"><input :value="activeForm.recordModel.context.planCode" class="generic-input" @input="updateGenericContext('planCode', ($event.target as HTMLInputElement).value)" /></td>
                          <td class="generic-label">方法文件</td>
                          <td class="generic-cell" :colspan="Math.max(1, genericColumnSpan(activeForm) - 5)"><input :value="activeForm.recordModel.context.methodCode" class="generic-input" @input="updateGenericContext('methodCode', ($event.target as HTMLInputElement).value)" /></td>
                        </tr>
                        <tr>
                          <td class="generic-section" :colspan="genericColumnSpan(activeForm)">结构区域</td>
                        </tr>
                        <tr>
                          <td class="generic-cell" :colspan="genericColumnSpan(activeForm)">
                            <div class="flex flex-wrap gap-2">
                              <BaseTag v-for="section in activeForm.template.structure.sections" :key="section" :label="section" tone="neutral" />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td class="generic-section" :colspan="genericColumnSpan(activeForm)">关键字段</td>
                        </tr>
                        <tr>
                          <td class="generic-cell" :colspan="genericColumnSpan(activeForm)">
                            <div class="grid grid-cols-3 gap-2">
                              <label v-for="field in activeForm.template.structure.fields" :key="field" class="rounded border border-[--border] bg-[--surface-muted] px-3 py-2">
                                <span class="mb-1 block text-xs font-semibold text-[--muted-foreground]">{{ field }}</span>
                                <input :value="activeForm.recordModel.fields[field]" class="generic-input rounded border border-[--border] bg-white px-2 py-1" @input="updateGenericField(field, ($event.target as HTMLInputElement).value)" />
                              </label>
                            </div>
                          </td>
                        </tr>
                        <template v-if="activeForm.recordModel.tableColumns.length > 0">
                          <tr>
                            <td class="generic-section" :colspan="genericColumnSpan(activeForm)">明细表</td>
                          </tr>
                          <tr>
                            <td v-for="column in activeForm.recordModel.tableColumns" :key="column" class="generic-head">{{ column }}</td>
                          </tr>
                          <tr v-for="(row, rowIndex) in activeForm.recordModel.rows" :key="rowIndex">
                            <td v-for="(_, cellIndex) in activeForm.recordModel.tableColumns" :key="cellIndex" class="generic-cell">
                              <input :value="row[Number(cellIndex)] ?? ''" class="generic-input" @input="updateGenericTableCell(Number(rowIndex), Number(cellIndex), ($event.target as HTMLInputElement).value)" />
                            </td>
                          </tr>
                        </template>
                        <tr v-if="activeForm.template.structure.notes?.length">
                          <td class="generic-label">注意事项</td>
                          <td class="generic-cell text-xs text-[--muted-foreground]" :colspan="Math.max(1, genericColumnSpan(activeForm) - 1)">{{ activeForm.template.structure.notes.join('；') }}</td>
                        </tr>
                        <tr>
                          <td class="generic-section" :colspan="genericColumnSpan(activeForm)">签字区</td>
                        </tr>
                        <tr>
                          <td v-for="label in activeForm.recordModel.signatureLabels" :key="label" class="generic-cell" :colspan="Math.max(1, Math.floor(genericColumnSpan(activeForm) / activeForm.recordModel.signatureLabels.length))">
                            <span class="mb-1 block text-xs font-semibold text-[--muted-foreground]">{{ label }}</span>
                            <input :value="activeForm.recordModel.signatures[label]" class="generic-input" @input="updateGenericSignature(label, ($event.target as HTMLInputElement).value)" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="flex justify-end gap-2">
                    <BaseButton variant="secondary" size="sm" @click="addGenericRow">新增一行</BaseButton>
                    <BaseButton variant="secondary" size="sm" :disabled="activeForm.recordModel.rows.length <= 1" @click="removeGenericRow">删除最后一行</BaseButton>
                  </div>
                </div>
              </div>
            </BaseCard>

            <BaseCard v-if="isGenericPlateTemplate(activeForm.template)">
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="text-sm font-bold text-[--foreground]">批量设置</div>
                    <div class="text-xs text-[--muted-foreground] mt-0.5">对当前表单中已选格子统一覆盖执行说明。</div>
                  </div>
                  <BaseTag :label="`${selectedCellCount} 个格子`" tone="neutral" />
                </div>
              </template>

              <div v-if="batchPanelOpen" class="space-y-4">
                <div class="grid grid-cols-4 gap-3">
                  <BaseFormField v-model="batchForm.action" label="执行说明" placeholder="如：加内标工作液" />
                  <BaseFormField v-model="batchForm.substance" label="样品 / 溶液" placeholder="如：IS-WS" />
                  <BaseFormField v-model="batchForm.sampleId" label="样品编号" placeholder="如：STD8" />
                  <BaseFormField v-model="batchForm.equipment" label="设备" placeholder="如：移液器-001" />
                  <BaseFormField v-model="batchForm.volume" label="加入量" type="number" placeholder="如：50" />
                  <BaseFormField v-model="batchForm.unit" label="单位" placeholder="如：μL" />
                  <BaseFormField v-model="batchForm.scanObject" label="扫码对象" type="select" :options="scanObjectOptions" />
                  <BaseFormField v-model="batchForm.required" label="是否必填" type="select" :options="requiredOptions" />
                  <BaseFormField v-model="batchForm.step" label="关联步骤" placeholder="如：第 1 步" class="col-span-2" />
                  <BaseFormField v-model="batchForm.note" label="备注" type="textarea" placeholder="批量备注" class="col-span-2" />
                </div>
                <div class="flex items-center justify-between gap-3">
                  <div class="text-xs text-[--muted-foreground]">当前已选 {{ selectedCellCount }} 个格子。</div>
                  <div class="flex gap-2">
                    <BaseButton variant="secondary" size="sm" @click="batchPanelOpen = false">取消</BaseButton>
                    <BaseButton variant="primary" size="sm" :disabled="selectedCellCount === 0" @click="applyBatch">应用到已选格子</BaseButton>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-[--muted-foreground]">展开后可对多个格子统一编辑。</div>
            </BaseCard>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <span class="text-sm font-bold text-[--foreground]">所有已选表单</span>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="form in currentForms" :key="form.instanceId" class="rounded-xl border border-[--border] bg-[--surface-muted] p-3 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-sm font-semibold text-[--text-main]">{{ form.template.templateName }}</div>
                <div class="font-mono text-[10px] text-[--primary]">{{ form.instanceId }}</div>
              </div>
              <BaseTag :label="statusLabel(form.status)" :tone="statusTone(form.status)" />
            </div>
            <div class="text-xs text-[--muted-foreground]">{{ form.template.templateCode }} · {{ form.template.version }}</div>
          </div>
        </div>
      </BaseCard>
    </div>


    <CellOpEditor
      v-if="activeForm && (isGenericPlateTemplate(activeForm.template) || isWorkSolutionTemplate(activeForm.template))"
      :open="cellEditorOpen"
      :read-only="false"
      :cell-row="editingCell?.row ?? workSolutionDemoCell?.row ?? ''"
      :cell-col="editingCell?.col ?? workSolutionDemoCell?.col ?? 1"
      :operations="currentOps"
      @close="closeCellEditor"
      @save="saveCellOps"
    />
    <BaseDrawer v-if="msCellDrawerOpen" :open="msCellDrawerOpen" title="编辑格子执行说明" @close="closeMsCellDrawer">
      <div class="space-y-4">
        <div class="text-xs text-[--muted-foreground]">格子位置：{{ msEditingLabel }}</div>
        <div v-for="(op, index) in msCellOperations" :key="op.id" class="border border-[--border] rounded-lg p-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[--muted-foreground]">执行说明 {{ index + 1 }}</span>
            <button class="text-xs text-[--danger] hover:underline" @click="removeMsOperation(op.id)">删除</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseFormField v-model="op.action" label="执行说明" placeholder="如：加内标工作液" />
            <BaseFormField v-model="op.substance" label="样品 / 溶液名称" placeholder="如：IS-WS" />
            <BaseFormField v-model="op.sampleId" label="样品编号" placeholder="如：STD8" />
            <BaseFormField v-model="op.equipment" label="设备" placeholder="如：移液器-001" />
            <BaseFormField v-model="op.volume" label="加入量" type="number" placeholder="如：30" />
            <BaseFormField v-model="op.unit" label="单位" placeholder="如：μL" />
            <BaseFormField v-model="op.scanObject" label="扫码对象" type="select" :options="scanObjectOptions" />
            <BaseFormField v-model="msCellRequired[index]" label="是否必填" type="select" :options="requiredOptions" />
            <BaseFormField v-model="op.step" label="关联步骤" placeholder="如：第 1 步" />
            <BaseFormField v-model="op.note" label="备注" type="textarea" class="col-span-2" placeholder="可选备注" />
          </div>
        </div>
        <button class="text-sm text-[--primary] hover:underline font-medium" @click="addMsOperation">+ 新增步骤</button>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="closeMsCellDrawer">取消</BaseButton>
        <BaseButton variant="primary" @click="saveMsCellDrawer">保存</BaseButton>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BasePageHeader from '@/components/base/BasePageHeader.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import StepWizard from '@/components/experiments/StepWizard.vue';
import SequenceGrid from '@/components/experiments/SequenceGrid.vue';
import CellOpEditor from '@/components/experiments/CellOpEditor.vue';
import PureSolutionStabilityTableBlock from '@/components/experiments/PureSolutionStabilityTableBlock.vue';
import FreezeThawStabilityTableBlock from '@/components/experiments/FreezeThawStabilityTableBlock.vue';
import MatrixSampleStabilityTableBlock from '@/components/experiments/MatrixSampleStabilityTableBlock.vue';
import MethodValidationResultBlock from '@/components/experiments/MethodValidationResultBlock.vue';
import ReanalysisApplicationBlock from '@/components/experiments/ReanalysisApplicationBlock.vue';
import ISStockSolutionBlock from '@/components/experiments/ISStockSolutionBlock.vue';
import ReanalysisSummaryDoubleBlock from '@/components/experiments/ReanalysisSummaryDoubleBlock.vue';
import ReanalysisSummarySingleBlock from '@/components/experiments/ReanalysisSummarySingleBlock.vue';
import UnconventionalStabilityBlock from '@/components/experiments/UnconventionalStabilityBlock.vue';
import WorkSolutionTableBlock from '@/components/experiments/WorkSolutionTableBlock.vue';
import ReferenceStockTableBlock from '@/components/experiments/ReferenceStockTableBlock.vue';
import SolutionPrepTableBlock from '@/components/experiments/SolutionPrepTableBlock.vue';
import MSSolutionTableBlock from '@/components/experiments/MSSolutionTableBlock.vue';
import SplitRecordTableBlock from '@/components/experiments/SplitRecordTableBlock.vue';
import MatrixSampleTableBlock from '@/components/experiments/MatrixSampleTableBlock.vue';
import InjectionSequenceTableBlock from '@/components/experiments/InjectionSequenceTableBlock.vue';
import AdditionSequenceTableBlock from '@/components/experiments/AdditionSequenceTableBlock.vue';
import InjectionLCMSRecordTableBlock from '@/components/experiments/InjectionLCMSRecordTableBlock.vue';
import StabilitySampleTableBlock from '@/components/experiments/StabilitySampleTableBlock.vue';
import DilutionRecordTableBlock from '@/components/experiments/DilutionRecordTableBlock.vue';
import { evaluationItems } from '@/api/mock/evaluation';
import { files, getFilesByProject } from '@/api/mock/files';
import { projects } from '@/api/mock/projects';
import { formTemplates } from '@/api/mock/form-templates';
import type { EvaluationItem } from '@/api/mock/evaluation';
import type { FileItem } from '@/api/mock/files';
import type { SequenceCell, SequenceOperation, FormTemplateRecord } from '@/types/experiments';

type FormStatus = 'unedited' | 'editing' | 'done';
type TemplateFooter = { location?: string; time?: string; owner?: string; reviewer?: string };
type WorkspaceForm = {
  itemId: string;
  templateId: string;
  instanceId: string;
  template: FormTemplateRecord;
  cells: SequenceCell[];
  footer: TemplateFooter;
  status: FormStatus;
  recordModel: any;
  solutionTopRows: string[][];
  solutionBottomRows: string[][];
};

const router = useRouter();
const route = useRoute();

const steps = [
  { label: '选择项目', sub: '确定计划所属项目' },
  { label: '选择关联文件', sub: '选择方法 / 方案 / SOP' },
  { label: '选择考察项', sub: '确定本次计划范围' },
  { label: '选择模板表单', sub: '为考察项绑定表单模板' },
  { label: '编辑模板内容', sub: '编辑计划下模板实例' },
  { label: '确认创建', sub: '确认并创建实验计划' },
];

const currentItemId = ref(parseSingle(route.params.itemId) || parseSingle(route.query.activeItemId));
const activeFormId = ref(parseSingle(route.query.instanceId));
const preferredTemplateId = ref(parseSingle(route.query.currentTemplateId));
const editingCell = ref<{ row: string; col: number } | null>(null);
const cellEditorOpen = ref(false);
const batchPanelOpen = ref(false);
const workspaceForms = ref<WorkspaceForm[]>([]);
const workSolutionDemoConfigured = ref(false);
const workSolutionDemoCell = ref<{ row: string; col: number } | null>(null);
const msCellDrawerOpen = ref(false);
const msEditingCell = ref<{ row: number; col: number } | null>(null);
const msCellOperations = ref<SequenceOperation[]>([]);
const msCellRequired = ref<string[]>([]);

watch(activeFormId, () => {
  editingCell.value = null;
  cellEditorOpen.value = false;
  batchPanelOpen.value = false;
  msCellDrawerOpen.value = false;
  msEditingCell.value = null;
  workSolutionDemoConfigured.value = false;
  workSolutionDemoCell.value = null;
});
const batchForm = reactive({
  action: '',
  substance: '',
  sampleId: '',
  equipment: '',
  volume: 0,
  unit: 'μL',
  scanObject: '',
  required: 'true',
  step: '',
  note: '',
});

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

const projectId = computed(() => parseSingle(route.query.projectId));
const fileIds = computed(() => parseList(route.query.fileIds));
const itemIds = computed(() => parseList(route.query.itemIds));
const templateIds = computed(() => parseTemplatePairs(route.query.templateIds));
const planCode = computed(() => parseSingle(route.query.planCode) || 'PLAN-DRAFT');

const selectedProject = computed(() => {
  const id = projectId.value;
  return id ? projects.find(p => p.id === id) ?? null : null;
});

const selectedFiles = computed<FileItem[]>(() => {
  const ids = new Set(fileIds.value);
  const base = selectedProject.value ? getFilesByProject(selectedProject.value.id) : files;
  return base.filter(file => ids.has(file.id));
});

const selectedItems = computed<EvaluationItem[]>(() => evaluationItems.filter(item => itemIds.value.includes(item.id)));
const currentItem = computed<EvaluationItem | null>(() => selectedItems.value.find(item => item.id === currentItemId.value) ?? selectedItems.value[0] ?? null);
const currentForms = computed(() => workspaceForms.value.filter(form => form.itemId === currentItem.value?.id));
const activeForm = computed(() => currentForms.value.find(form => form.instanceId === activeFormId.value) ?? currentForms.value[0] ?? null);
const currentOps = computed<SequenceOperation[]>(() => {
  if (!activeForm.value || !editingCell.value) return [];
  return getCell(activeForm.value, editingCell.value.row, editingCell.value.col).operations;
});
const msActiveKey = computed(() => msEditingCell.value ? `${msEditingCell.value.row}-${msEditingCell.value.col}` : '');
const msEditingLabel = computed(() => msEditingCell.value ? `${String.fromCharCode(65 + msEditingCell.value.row)}${msEditingCell.value.col + 1}` : '');
const activeCellKey = computed(() => editingCell.value ? `${editingCell.value.row}-${editingCell.value.col}` : null);
const selectedCellCount = computed(() => activeForm.value?.cells.filter(cell => cell.selected).length ?? 0);
const hasAnySelection = computed(() => currentForms.value.length > 0);

watch(
  [selectedItems, templateIds],
  () => {
    hydrateWorkspace();
  },
  { immediate: true, deep: true },
);

watch(
  () => route.params.itemId,
  (value) => {
    currentItemId.value = parseSingle(value) || currentItemId.value || selectedItems.value[0]?.id || '';
  },
  { immediate: true },
);

watch(
  () => route.query.currentTemplateId,
  (value) => {
    preferredTemplateId.value = parseSingle(value);
  },
  { immediate: true },
);

watch(
  () => route.query.instanceId,
  (value) => {
    const next = parseSingle(value);
    if (next) activeFormId.value = next;
  },
  { immediate: true },
);

function parseSingle(value: unknown): string {
  return Array.isArray(value) ? value[0] ?? '' : typeof value === 'string' ? value : '';
}

function parseList(value: unknown): string[] {
  const raw = parseSingle(value);
  return raw ? raw.split(',').map(v => v.trim()).filter(Boolean) : [];
}

function parseTemplatePairs(value: unknown): Array<{ itemId: string; templateId: string }> {
  return parseList(value).map((pair) => {
    const [itemId, templateId] = pair.split(':');
    return { itemId: itemId?.trim() ?? '', templateId: templateId?.trim() ?? '' };
  }).filter(pair => pair.itemId && pair.templateId);
}

function hydrateWorkspace() {
  const existing = new Map(workspaceForms.value.map(form => [form.instanceId, form] as const));
  const nextForms: WorkspaceForm[] = [];

  for (const item of selectedItems.value) {
    const ids = templateIds.value.filter(pair => pair.itemId === item.id).map(pair => pair.templateId);
    for (const templateId of ids) {
      const template = formTemplates.find(record => record.id === templateId);
      if (!template) continue;
      const instanceId = instanceCode(item.id, template.id);
      const prev = existing.get(instanceId);
      nextForms.push(prev ?? createWorkspaceForm(item.id, template));
    }
  }

  workspaceForms.value = nextForms;
  if (!currentItemId.value && selectedItems.value[0]) currentItemId.value = selectedItems.value[0].id;
  if (!currentForms.value.some(form => form.instanceId === activeFormId.value)) {
    activeFormId.value = currentForms.value.find(form => form.templateId === preferredTemplateId.value)?.instanceId
      ?? currentForms.value[0]?.instanceId
      ?? '';
  }
}

function createWorkspaceForm(itemId: string, template: FormTemplateRecord): WorkspaceForm {
  return {
    itemId,
    templateId: template.id,
    instanceId: instanceCode(itemId, template.id),
    template,
    cells: createCells(template),
    footer: { location: '', time: '', owner: '', reviewer: '' },
    status: 'unedited',
    recordModel: createRecordModel(template),
    solutionTopRows: createSolutionTopRows(template),
    solutionBottomRows: createSolutionBottomRows(template),
  };
}

function isGenericPlateTemplate(template: FormTemplateRecord): boolean {
  return template.previewMode === 'plate' && template.templateCode !== 'BA-SBR07';
}

function createCells(template: FormTemplateRecord): SequenceCell[] {
  return template.structure.plate && isGenericPlateTemplate(template)
    ? template.structure.plate.rows.flatMap(row => Array.from({ length: template.structure.plate?.cols ?? 0 }, (_, index) => ({ row, col: index + 1, operations: [], selected: false })))
    : template.structure.tableRows?.map((_, index) => ({ row: `R${index + 1}`, col: 1, operations: [], selected: false })) ?? [];
}

function createRecordModel(template: FormTemplateRecord): any {
  if (template.templateCode === 'BA-SBR07') {
    const rows = template.structure.plate?.rows ?? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const cols = template.structure.plate?.cols ?? 12;
    return {
      context: {
        projectCode: selectedProject.value?.code ?? '',
        analysisBatchNo: '',
        runId: '',
        plateId: '',
      },
      rows,
      cells: rows.flatMap(row => Array.from({ length: cols }, (_, index) => ({
        row,
        col: index + 1,
        operations: [],
        selected: false,
      }))),
      placementLocation: '',
      placementTime: '',
      signatureOperator: '',
      signatureReviewer: '',
      signatureAuditor: '',
    };
  }

  if (template.templateCode === 'BA-SBR02') {
    return {
      basic: {
        recordType: '',
        referenceCode: '',
        referenceName: '',
        referenceBatch: '',
        referenceState: '',
        referenceExpiry: '',
        correctionFactor: '',
        balanceCode: '',
        pipetteCode: '',
      },
      rows: [
        { stockCode: '', concentration: '', weight: '', volume: '', calc: '', container: '', finishedAt: '' },
        { stockCode: '', concentration: '', weight: '', volume: '', calc: '', container: '', finishedAt: '' },
      ],
      solventCode: '',
      solventBatch: '',
      diluentName: '',
      diluentBatch: '',
      diluentManufacturer: '',
      diluentExpiry: '',
      containerMaterial: '',
      color: '',
      lightCondition: '',
      disposalMethod: '',
      storageRef: '',
      batchLabel: '',
      signatures: { operator: '', reviewer: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR03') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '' },
      rows: [
        { solutionCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, sourceMerge: '', diluentVolume: '', finalVolume: '', finalConcentration: '' },
        { solutionCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, sourceMerge: '', diluentVolume: '', finalVolume: '', finalConcentration: '' },
      ],
      sourceBatch: '',
      diluentInfo: '',
      pureReagentInfo: '',
      pipetteNo: '',
      containerMaterial: '',
      containerColor: '',
      lightCondition: '',
      batchLabel: '',
      completedAt: '',
      disposalMethod: '',
      controlledPaperNo: '',
      refrigeratorNo: '',
      signatures: { operator: '', reviewer: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR08') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '' },
      rows: [
        { solutionCode: '', analyteCode: '', analyteVolume: 0, isVolume: 0, reconstitutionVolume: 0, finalVolume: 0 },
        { solutionCode: '', analyteCode: '', analyteVolume: 0, isVolume: 0, reconstitutionVolume: 0, finalVolume: 0 },
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
    };
  }

  if (template.templateCode === 'BA-SBR09') {
    return {
      context: {
        projectCode: selectedProject.value?.code ?? '',
        methodVersion: '',
        analysisBatchNo: '',
        runId: '',
        operatorInfo: '',
        reviewerInfo: '',
        auditorInfo: '',
      },
      rows: Array.from({ length: 20 }, (_, index) => ({
        seq: String(index + 1),
        sampleId: '',
        dilutionFactor: '',
        wellPosition: '',
        remark: '',
      })),
    };
  }

  if (template.templateCode === 'BA-SBR04') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '' },
      rows: [
        { id: 'split-1', sourceCode: '', splitCount: '', volumePerPortion: '', splitCode: '', splitBy: '', storageLocation: '', storageStartedAt: '' },
        { id: 'split-2', sourceCode: '', splitCount: '', volumePerPortion: '', splitCode: '', splitBy: '', storageLocation: '', storageStartedAt: '' },
      ],
      sourceBatch: '',
      containerMaterial: '',
      color: '',
      lightCondition: '',
      disposalMethod: '',
      signatures: { packager: '', reviewer: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR06') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '' },
      rows: [
        { id: 'mx-1', sampleCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, blankMatrixVolume: 0, finalVolume: 0, blankMatrixCode: '', finalConcentration: '' },
        { id: 'mx-2', sampleCode: '', sourceCode: '', sourceConcentration: '', sourceVolume: 0, blankMatrixVolume: 0, finalVolume: 0, blankMatrixCode: '', finalConcentration: '' },
      ],
      sourceBatch: '',
      blankMatrixDisposition: '',
      blankMatrixFridgeNo: '',
      pipetteNo: '',
      containerMaterial: '',
      containerColor: '',
      lightConditions: [],
      tempConditions: [],
      batchLabel: '',
      completedAt: '',
      disposalMethod: '',
      controlledPaperNo: '',
      refrigeratorNo: '',
      signatures: { operator: '', reviewer: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR10') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '', analysisBatchNo: '', runId: '' },
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

  if (template.templateCode === 'BA-SBR12') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '' },
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

  if (template.templateCode === 'BA-SBR13') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', analysisBatchNo: '', runId: '' },
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
    };
  }

  if (template.templateCode === 'BA-SBR14') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '' },
      shortTerm: { label: '纯溶液短期稳定性考察', rows: [{ sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }] },
      longTerm: { label: '纯溶液长期稳定性考察', rows: [{ sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }] },
      signatures: { packager: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR15') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '' },
      rows20: [{ category: '-20℃冻融稳定性', sampleCode: '', fridgeId: '', removeTime: '', tempConditions: [], lightConditions: [], putBackTime: '', analysisBatch: '' }],
      rows80: [{ category: '-80℃冻融稳定性', sampleCode: '', fridgeId: '', removeTime: '', tempConditions: [], lightConditions: [], putBackTime: '', analysisBatch: '' }],
      signatures: { packager: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR16') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '' },
      rowsShort: [{ category: '短期稳定性考察', sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }],
      rowsLong: [{ category: '长期稳定性考察', sampleCode: '', position: '', startTime: '', endTime: '', duration: 0, analysisBatch: '' }],
      signatures: { packager: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR17') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', analysisBatchNo: '', runId: '', analyte: '' },
      items: [
        { label: '系统适用性', result: '', remark: '' },
        { label: '称量准确度', result: '', remark: '' },
        { label: '标准曲线', result: '', remark: '' },
        { label: '质控样品', result: '', remark: '' },
        { label: '残留', result: '', remark: '' },
        { label: '干扰', result: '', remark: '' },
        { label: '精密度与准确度', result: '', remark: '□P&A1、□P&A2、□P&A3，其他：', partialAllowed: true },
        { label: '稀释可靠性', result: '', remark: '' },
        { label: '选择性', result: '', remark: '' },
        { label: '基质效应', result: '', remark: '' },
        { label: '高脂效应', result: '', remark: '' },
        { label: '溶血效应', result: '', remark: '' },
        { label: '回收率', result: '', remark: '' },
        { label: '重新进样重现性', result: '', remark: '' },
        { label: '耐用性', result: '', remark: '□人员 □仪器' },
        { label: '纯溶液稳定性', result: '', remark: '' },
      ],
      duration: 0,
      passFail: '',
      itemPass: '',
      hasException: '',
      exceptionRemark: '',
      signatures: { lead: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR19') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', analyteName: '', linearRange: '' },
      rows: [{ id: 'ra-1', sampleId: '', initialResult: '', initialBatch: '', reason: '', count: 0, reBatch: '' }],
      signatures: { summarizer: '', lead: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR20') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '', isName: '', isCode: '', isExpiry: '', pipetteNo: '', isMass: '', isCount: 0, totalVolume: '' },
      rows: [{ stockCode: '', concentration: '', calculation: '' }],
      process: { firstAddition: '', shake: false, transferVolume: '', rinseCount: 0, finalAddition: '', mix: false, completedAt: '', solventInfo: '' },
      storage: { containerMaterial: '', color: '', lightConditions: [], disposalMethod: '', fridgeNo: '', batchLabel: '' },
      signatures: { operator: '', reviewer: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR21') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', analyteName: '', linearRange: '' },
      rows: [{ id: 'sr-1', sampleId: '', initialResult: '', initialBatch: '', reason: '', reResult: '', reBatch: '' }],
      signatures: { summarizer: '', lead: '', auditor: '' },
    };
  }

  if (template.templateCode === 'BA-SBR22') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', analyteName: '', linearRange: '' },
      rows: [{ id: 'sr-1', sampleId: '', initialResult: '', initialBatch: '', reason: '', reResult: '', reBatch: '' }],
      signatures: { summarizer: '', lead: '', qc: '' },
    };
  }

  if (template.templateCode === 'BA-SBR23') {
    return {
      context: { projectCode: selectedProject.value?.code ?? '', methodVersion: '' },
      equipment: { incubatorId: '', centrifugeId: '', pipetteId: '' },
      blood: { rows: [{ id: 'bx-1', sampleCode: '', sourceCode: '', sourceVolume: 0, blankBloodVolume: 0, finalVolume: 0 }], sourceBatch: '', blankBloodCode: '', lightConditions: [], tempConditions: [] },
      incubation: { startTime: '', duration: 0, endTime: '', aliquotCount: 0, containerMaterial: '', color: '' },
      stability: { rows: [{ id: 'st-1', sampleCode: '', stabilityCode: '', startTime: '', conditions: [], endTime: '' }], description: '', containerMaterial: '', color: '', storageCondition: '' },
      signatures: { operator: '', reviewer: '', auditor: '' },
    };
  }

  return createGenericRecordModel(template);
}

function createGenericRecordModel(template: FormTemplateRecord) {
  const signatureLabels = template.structure.signatureLabels?.length
    ? template.structure.signatureLabels
    : ['操作人 / 日期', '现场复核人 / 日期', '审核人 / 日期'];
  const tableColumns = template.structure.tableColumns?.length
    ? template.structure.tableColumns
    : template.structure.fields;
  const sourceRows = template.structure.tableRows?.length
    ? template.structure.tableRows
    : [Array.from({ length: tableColumns.length || 1 }, () => '')];

  return {
    context: {
      projectCode: selectedProject.value?.code ?? '',
      planCode: planCode.value,
      methodCode: template.context.methodCode,
    },
    fields: Object.fromEntries(template.structure.fields.map(field => [field, ''])),
    tableColumns,
    rows: sourceRows.map(row => [...row, ...Array(Math.max(0, tableColumns.length - row.length)).fill('')].slice(0, Math.max(1, tableColumns.length))),
    signatureLabels,
    signatures: Object.fromEntries(signatureLabels.map(label => [label, ''])),
  };
}

function isPureSolutionStabilityTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR14'; }
function isFreezeThawTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR15'; }
function isMatrixSampleStabilityTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR16'; }
function isMethodValidationResultTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR17'; }
function isReanalysisApplicationTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR19'; }
function isISStockSolutionTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR20'; }
function isReanalysisSummaryDoubleTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR21'; }
function isReanalysisSummarySingleTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR22'; }
function isUnconventionalStabilityTemplate(template: FormTemplateRecord): boolean { return template.templateCode === 'BA-SBR23'; }

function genericColumnSpan(form: WorkspaceForm): number {
  return Math.max(6, form.template.structure.tableColumns?.length ?? form.template.structure.fields.length ?? 6);
}

function updateGenericContext(key: string, value: string) {
  if (!activeForm.value) return;
  activeForm.value.recordModel.context = { ...activeForm.value.recordModel.context, [key]: value };
  activeForm.value.status = 'editing';
}

function updateGenericField(field: string, value: string) {
  if (!activeForm.value) return;
  activeForm.value.recordModel.fields = { ...activeForm.value.recordModel.fields, [field]: value };
  activeForm.value.status = 'editing';
}

function updateGenericTableCell(rowIndex: number, cellIndex: number, value: string) {
  if (!activeForm.value) return;
  activeForm.value.recordModel.rows = activeForm.value.recordModel.rows.map((row: string[], idx: number) => idx === rowIndex ? row.map((cell, ci) => ci === cellIndex ? value : cell) : [...row]);
  activeForm.value.status = 'editing';
}

function updateGenericSignature(label: string, value: string) {
  if (!activeForm.value) return;
  activeForm.value.recordModel.signatures = { ...activeForm.value.recordModel.signatures, [label]: value };
  activeForm.value.status = 'editing';
}

function addGenericRow() {
  if (!activeForm.value) return;
  const width = activeForm.value.recordModel.tableColumns?.length ?? activeForm.value.template.structure.fields.length ?? 1;
  activeForm.value.recordModel.rows = [...activeForm.value.recordModel.rows, Array.from({ length: width }, () => '')];
  activeForm.value.status = 'editing';
}

function removeGenericRow() {
  if (!activeForm.value || activeForm.value.recordModel.rows.length <= 1) return;
  activeForm.value.recordModel.rows = activeForm.value.recordModel.rows.slice(0, -1);
  activeForm.value.status = 'editing';
}

function createSolutionTopRows(template: FormTemplateRecord): string[][] {
  if (template.templateCode !== 'FT-SOL-004') return [];
  return [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];
}

function createSolutionBottomRows(template: FormTemplateRecord): string[][] {
  if (template.templateCode !== 'FT-SOL-004') return [];
  const rows = (template.structure.tableRows ?? []).map(row => row.map(() => ''));
  return normalizeRows(rows, 10, 7);
}

function normalizeRows(rows: string[][], width: number, minRows: number): string[][] {
  const normalized = rows.map(row => [...row, ...Array(Math.max(0, width - row.length)).fill('')].slice(0, width));
  return [...normalized, ...Array.from({ length: Math.max(0, minRows - normalized.length) }, () => Array(width).fill(''))];
}

function instanceCode(itemId: string, templateId: string): string {
  return `${planCode.value}-${itemId.replace(/\./g, '')}-${templateId}-INS`;
}

function getCell(form: WorkspaceForm, row: string, col: number): SequenceCell {
  return form.cells.find(cell => cell.row === row && cell.col === col) ?? { row, col, operations: [], selected: false };
}

function statusLabel(status: FormStatus): string {
  const map: Record<FormStatus, string> = { unedited: '未编辑', editing: '编辑中', done: '已完成' };
  return map[status];
}

function statusTone(status: FormStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  const map: Record<FormStatus, 'success' | 'warning' | 'danger' | 'neutral'> = { unedited: 'danger', editing: 'warning', done: 'success' };
  return map[status];
}

function selectionCount(itemId: string) {
  return workspaceForms.value.filter(form => form.itemId === itemId).length;
}

function statusCount(status: FormStatus) {
  return workspaceForms.value.filter(form => form.status === status).length;
}

function activeFormIndex() {
  return currentForms.value.findIndex(form => form.instanceId === activeFormId.value);
}

function saveCurrent() {
  if (!activeForm.value) return;
  activeForm.value.status = 'done';
  activeFormId.value = activeForm.value.instanceId;
}

function saveAll() {
  workspaceForms.value.forEach(form => {
    form.status = 'done';
  });
}

function fillRecommended(instanceId: string) {
  const form = workspaceForms.value.find(item => item.instanceId === instanceId);
  if (!form) return;
  form.cells = form.cells.map((cell, index) => {
    if (index % 12 === 0 || index === 1) {
      return {
        ...cell,
        operations: [{
          id: `rec-${cell.row}${cell.col}`,
          action: `${form.template.templateName} 执行说明`,
          substance: currentItem.value?.name ?? '样品/溶液',
          sampleId: currentItem.value?.id ?? 'ITEM',
          volume: 50,
          unit: 'μL',
          scanned: false,
          equipment: '移液器-001',
          scanObject: 'sample',
          required: true,
          step: '第 1 步',
          note: '推荐模板示例',
        }],
        selected: true,
      };
    }
    return cell;
  });
  form.status = 'editing';
}

function updateActiveRecordModel(nextModel: any) {
  if (!activeForm.value) return;
  activeForm.value.recordModel = { ...nextModel };
  activeForm.value.status = 'editing';
}

function openMsCellDrawer(rowIndex: number, colIndex: number) {
  if (!activeForm.value) return;
  msEditingCell.value = { row: rowIndex, col: colIndex };
  const key = `${rowIndex}-${colIndex}`;
  const source = activeForm.value.recordModel.cellOperations?.[key] ?? [];
  msCellOperations.value = source.length > 0 ? source.map((op: SequenceOperation) => ({ ...op })) : [newMsOperation()];
  msCellRequired.value = msCellOperations.value.map(op => op.required ? 'true' : 'false');
  msCellDrawerOpen.value = true;
}

function newMsOperation(): SequenceOperation {
  return {
    id: `ms-${Date.now()}`,
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

function addMsOperation() {
  msCellOperations.value.push(newMsOperation());
  msCellRequired.value.push('false');
}

function removeMsOperation(id: string) {
  const nextOps = msCellOperations.value.filter(op => op.id !== id);
  msCellOperations.value = nextOps;
  msCellRequired.value = nextOps.map(op => op.required ? 'true' : 'false');
}

function saveMsCellDrawer() {
  if (!activeForm.value || !msEditingCell.value) return;
  const key = `${msEditingCell.value.row}-${msEditingCell.value.col}`;
  activeForm.value.recordModel.cellOperations = activeForm.value.recordModel.cellOperations ?? {};
  activeForm.value.recordModel.cellOperations[key] = msCellOperations.value.map((op, index) => ({ ...op, required: msCellRequired.value[index] === 'true' }));
  activeForm.value.status = 'editing';
  msCellDrawerOpen.value = false;
}

function closeMsCellDrawer() {
  msCellDrawerOpen.value = false;
}

function updateSolutionTopRows(nextRows: string[][]) {
  if (!activeForm.value) return;
  activeForm.value.solutionTopRows = nextRows;
  activeForm.value.status = 'editing';
}

function updateSolutionBottomRows(nextRows: string[][]) {
  if (!activeForm.value) return;
  activeForm.value.solutionBottomRows = nextRows;
  activeForm.value.status = 'editing';
}

function isSolutionPrepTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'FT-SOL-004';
}

function isReferenceStockTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR02';
}

function isWorkSolutionTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR03';
}

function isMSSolutionTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR08';
}

function isInjectionSequenceTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR09';
}

function isAdditionSequenceTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR07';
}

function isSplitTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR04';
}

function isMatrixSampleTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR06';
}

function isInjectionLCMSTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR10';
}

function isStabilityTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR12';
}

function isDilutionTemplate(template: FormTemplateRecord): boolean {
  return template.templateCode === 'BA-SBR13';
}

function formTypeLabel(form: WorkspaceForm): string {
  if (form.template.previewMode === 'plate') return '96 孔板 / 格子模板';
  if (isSolutionPrepTemplate(form.template)) return '溶液配制表';
  if (isReferenceStockTemplate(form.template)) return '对照品称量及储备液配制记录表';
  if (isWorkSolutionTemplate(form.template)) return '工作溶液配制表';
  if (isMSSolutionTemplate(form.template)) return 'MS 溶液配制表';
  if (isInjectionSequenceTemplate(form.template)) return '进样序列表';
  if (isSplitTemplate(form.template)) return '分装记录表';
  if (isMatrixSampleTemplate(form.template)) return '含基质样品配制表';
  if (isInjectionLCMSTemplate(form.template)) return '液质联用仪提交及结果定量记录表';
  if (isStabilityTemplate(form.template)) return '采集稳定性样品制备表';
  if (isDilutionTemplate(form.template)) return '样品稀释过程记录表';
  return `${form.template.templateName} · 记录表模板`;
}

function selectAll() {
  if (!activeForm.value) return;
  activeForm.value.cells = activeForm.value.cells.map(cell => ({ ...cell, selected: true }));
}

function invert() {
  if (!activeForm.value) return;
  activeForm.value.cells = activeForm.value.cells.map(cell => ({ ...cell, selected: !cell.selected }));
}

function clear() {
  if (!activeForm.value) return;
  activeForm.value.cells = activeForm.value.cells.map(cell => ({ ...cell, selected: false }));
}

function applyBatch() {
  if (!activeForm.value) return;
  const selected = activeForm.value.cells.filter(cell => cell.selected);
  if (selected.length === 0) {
    alert('请先选择格子');
    return;
  }
  const op: SequenceOperation = {
    id: `batch-${Date.now()}`,
    action: batchForm.action.trim() || batchForm.substance.trim() || '执行步骤',
    substance: batchForm.substance.trim(),
    sampleId: batchForm.sampleId.trim(),
    equipment: batchForm.equipment.trim(),
    volume: Number.isFinite(Number(batchForm.volume)) ? Number(batchForm.volume) : 0,
    unit: batchForm.unit.trim() || 'μL',
    scanObject: batchForm.scanObject.trim(),
    required: batchForm.required === 'true',
    step: batchForm.step.trim(),
    note: batchForm.note.trim(),
    scanned: false,
  };
  selected.forEach(cell => {
    cell.operations = [{ ...op, id: `${op.id}-${cell.row}${cell.col}` }];
  });
  activeForm.value.status = 'editing';
  batchPanelOpen.value = false;
}

function openCellEditor(row: string, col: number) {
  editingCell.value = { row, col };
  cellEditorOpen.value = true;
  if (activeForm.value && activeForm.value.status === 'unedited') activeForm.value.status = 'editing';
}

function openWorkSolutionDemoCell(row = 'R1', col = 2) {
  workSolutionDemoCell.value = { row, col };
  editingCell.value = { row, col };
  workSolutionDemoConfigured.value = true;
  cellEditorOpen.value = true;
}

function closeCellEditor() {
  cellEditorOpen.value = false;
}

function saveCellOps(ops: SequenceOperation[]) {
  if (!activeForm.value || !editingCell.value) return;
  const cell = getCell(activeForm.value, editingCell.value.row, editingCell.value.col);
  cell.operations = ops.map(op => ({ ...op }));
  cell.selected = true;
  activeForm.value.status = 'editing';
  cellEditorOpen.value = false;
}

function updateFooter(nextFooter: TemplateFooter) {
  if (!activeForm.value) return;
  activeForm.value.footer = { ...nextFooter };
  if (activeForm.value.status === 'unedited') activeForm.value.status = 'editing';
}

function backToItems() {
  router.push({
    path: '/experiments/plans/new/items',
    query: {
      planCode: planCode.value,
      projectId: selectedProject.value?.id ?? '',
      fileIds: fileIds.value.join(','),
      itemIds: itemIds.value.join(','),
      ...(currentItem.value?.id ? { activeItemId: currentItem.value.id } : {}),
      ...(preferredTemplateId.value ? { currentTemplateId: preferredTemplateId.value } : {}),
      ...(activeFormId.value ? { instanceId: activeFormId.value } : {}),
      ...(templateIds.value.length > 0 ? { templateIds: templateIds.value.map(pair => `${pair.itemId}:${pair.templateId}`).join(',') } : {}),
    },
  });
}
</script>

<style scoped>
.generic-cell,
.generic-label,
.generic-head,
.generic-section,
.generic-title {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.generic-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.generic-label,
.generic-head,
.generic-section {
  font-weight: 600;
  background: #f7f5ee;
}

.generic-section {
  font-size: 16px;
  text-align: left;
}

.generic-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-main);
}
</style>
