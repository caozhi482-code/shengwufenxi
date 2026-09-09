<template>
  <div class="h-[calc(100vh-64px)] flex flex-col bg-[--surface]">
    <!-- 顶部信息条 -->
    <header class="bg-white border-b border-[--border] px-5 py-3 shrink-0">
      <div class="flex items-center gap-5 flex-wrap">
        <div class="flex items-center gap-5 flex-wrap">
          <div>
            <div class="text-[10px] text-[--muted-foreground] leading-none mb-1">任务编号</div>
            <div class="text-sm font-bold text-[--foreground]">{{ task?.id ?? effectiveTaskId }}</div>
          </div>
          <div class="w-px h-9 bg-[--border]" />
          <div>
            <div class="text-[10px] text-[--muted-foreground] leading-none mb-1">任务名称</div>
            <div class="text-sm font-medium text-[--text-main]">{{ task?.taskName ?? '—' }}</div>
          </div>
          <div class="w-px h-9 bg-[--border]" />
          <div>
            <div class="text-[10px] text-[--muted-foreground] leading-none mb-1">考察项</div>
            <div class="text-sm font-medium text-[--text-main]">{{ task?.itemCode }} {{ task?.itemName }}</div>
          </div>
          <div class="w-px h-9 bg-[--border]" />
          <div>
            <div class="text-[10px] text-[--muted-foreground] leading-none mb-1">方法文件</div>
            <div class="text-sm font-medium text-[--text-main]">{{ task?.methodCode }} / {{ task?.methodVersion }}</div>
          </div>
          <div class="w-px h-9 bg-[--border]" />
          <div>
            <div class="text-[10px] text-[--muted-foreground] leading-none mb-1">样本批次</div>
            <div class="text-sm font-medium text-[--text-main]">{{ task?.sampleBatch ?? '—' }}</div>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <div class="text-xs text-[--muted-foreground] text-right">
            <div class="font-semibold text-[--text-main]">
              已完成 <span class="text-[--success]">{{ completedCellCount }}</span> /
              录入中 <span class="text-[--warning]">{{ inProgressCellCount }}</span> /
              异常 <span class="text-[--danger]">{{ failedCellCount }}</span>
            </div>
            <div class="text-[10px] text-[--muted-foreground]">
              共 <span class="text-[--text-main]">{{ totalConfiguredCells }}</span> 格已配置 · 进度 {{ progressPercent }}%
            </div>
          </div>
          <div class="w-px h-9 bg-[--border]" />
          <BaseButton variant="danger" size="sm" @click="openExceptionDrawer">
            ⚠ 异常提交
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="openMethodUpdateDrawer">
            方法更新申请
          </BaseButton>
          <BaseButton variant="secondary" size="sm" @click="goBack">返回任务列表</BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            :disabled="!allCellsCompleted"
            @click="submitExecution"
          >
            {{ allCellsCompleted ? '提交复核' : '保存草稿' }}
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- 执行进度条 -->
    <div class="bg-white border-b border-[--border] px-5 py-2 shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-xs font-semibold text-[--muted-foreground] whitespace-nowrap">执行进度</span>
        <div class="flex-1 h-1.5 rounded-full bg-[--neutral-soft] overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="progressPercent >= 80 ? 'bg-[--success]' : progressPercent >= 40 ? 'bg-[--warning]' : 'bg-[--danger]'"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
        <span class="text-xs font-semibold text-[--text-main] w-10 text-right">{{ progressPercent }}%</span>
        <div class="w-px h-4 bg-[--border]" />
        <span class="text-xs text-[--success]">✓ {{ completedCellCount }} 完成</span>
        <span class="text-xs text-[--warning]">△ {{ inProgressCellCount }} 录入中</span>
        <span class="text-xs text-[--danger]">✕ {{ failedCellCount }} 异常</span>
        <span class="text-xs text-[--muted-foreground] ml-2">|</span>
        <span class="text-xs text-[--muted-foreground]">当前：{{ selectedCellLabel || '未选择格子' }}</span>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="flex-1 flex gap-5 p-5 overflow-hidden">
      <!-- 格子工作区 -->
      <div class="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0">
        <!-- 模板实例选择栏 -->
        <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] px-4 py-2.5 shrink-0">
          <div class="flex items-center gap-3 overflow-x-auto">
            <span class="text-xs font-semibold text-[--muted-foreground] whitespace-nowrap shrink-0">当前模板：</span>
            <div v-for="(form, fi) in workspaceForms" :key="form.instanceId"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all shrink-0"
              :class="activeFormIndex === fi ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] hover:border-[--primary-border]'"
              @click="activeFormIndex = fi"
            >
              <span class="text-xs font-medium text-[--text-main]">{{ form.template?.templateName ?? '模板' }}</span>
              <span class="text-[10px] text-[--muted-foreground] font-mono">{{ form.instanceId.slice(-8) }}</span>
              <BaseTag :label="form.template?.previewMode === 'plate' ? '孔板' : '表格'" tone="neutral" />
            </div>
            <div v-if="workspaceForms.length === 0" class="text-xs text-[--muted-foreground]">暂无模板实例数据</div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto min-h-0">
          <div v-if="!activeForm" class="h-full flex items-center justify-center">
            <div class="text-center">
              <div class="text-4xl mb-4">🧪</div>
              <div class="text-sm font-medium text-[--text-main]">请选择模板实例</div>
              <div class="text-xs text-[--muted-foreground] mt-1">从上方列表选择一个模板实例，查看格子执行状态</div>
              <div v-if="sheetMockAvailable()" class="mt-4">
                <BaseButton size="sm" @click="loadSheetMock">加载测试数据（S002 预处理记录表）</BaseButton>
              </div>
            </div>
          </div>
          <div v-else-if="activeForm.template?.previewMode === 'plate'">
            <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 mb-4 shrink-0">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="text-sm font-bold text-[--foreground]">
                    {{ activeForm.template?.templateName }}
                  </div>
                  <div class="text-[10px] text-[--muted-foreground] mt-0.5">
                    {{ activeForm.template?.templateCode }} · v{{ activeForm.template?.version }}
                    · {{ activeForm.instanceId.slice(-12) }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <BaseTag :label="cellStatusSummaryLabel" :tone="cellStatusSummaryTone" />
                  <span class="text-[10px] text-[--muted-foreground]">悬停看计划 · 点击录入实际</span>
                </div>
              </div>
              <!-- 图例 -->
              <div class="flex items-center gap-4 text-[10px] text-[--muted-foreground]">
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[--surface-muted] border border-[--border]" />未开始</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[--warning-soft] border border-[--warning]" />录入中</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[--success-soft] border border-[--success]" />完成</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[--danger-soft] border border-[--danger]" />异常</div>
              </div>
            </div>

            <div class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 overflow-auto">
              <!-- 表格头 -->
              <div class="flex items-center gap-1 mb-1">
                <div class="w-8 shrink-0" />
                <div v-for="c in 12" :key="c" class="flex-1 text-center text-xs font-semibold text-[--muted-foreground]">{{ c }}</div>
              </div>
              <div v-for="row in rows" :key="row" class="flex items-center gap-1 mb-1">
                <div class="w-8 shrink-0 text-xs font-bold text-[--muted-foreground] flex items-center justify-center">{{ row }}</div>
                <div v-for="col in 12" :key="col" class="flex-1">
                  <div
                    :class="[
                      'relative rounded-md border-2 transition-all duration-150 min-h-[60px] flex flex-col justify-center items-center text-center p-1 cursor-pointer',
                      getCellExecState(getCellKey(row, col)).status === 'fail'
                        ? 'border-[--danger] bg-[--danger-soft] hover:border-[--danger]/80'
                        : getCellExecState(getCellKey(row, col)).status === 'pass'
                          ? 'border-[--success] bg-[--success-soft] hover:border-[--success]/80'
                          : getCellExecState(getCellKey(row, col)).status === 'in_progress'
                            ? 'border-[--warning] bg-[--warning-soft]/50 hover:border-[--warning]/80'
                            : !hasPlanOp(row, col)
                              ? 'border-[--border] bg-[--surface-muted] cursor-not-allowed opacity-50'
                              : 'border-[--border] bg-white hover:border-[--primary-border]',
                    ]"
                    @click="hasPlanOp(row, col) && selectCell(row, col)"
                    @mouseenter="hoverKey = `${row}-${col}`"
                    @mouseleave="hoverKey = null"
                    :title="getCellTitle(row, col)"
                  >
                    <!-- 无配置 -->
                    <template v-if="!hasPlanOp(row, col)">
                      <div class="text-[10px] text-[--muted-foreground]">无计划</div>
                    </template>
                    <!-- 有计划配置 -->
                    <template v-else>
                      <div class="text-[10px] leading-tight">
                        <span :class="getCellExecState(getCellKey(row, col)).status === 'pass' ? 'text-[--success]' : 'text-[--text-main]'">
                          {{ getCellSummary(row, col) }}
                        </span>
                      </div>
                      <!-- 完成/异常角标 -->
                      <div
                        v-if="getCellExecState(getCellKey(row, col)).status === 'pass'"
                        class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[--success] text-white flex items-center justify-center text-[9px]"
                      >✓</div>
                      <div
                        v-else-if="getCellExecState(getCellKey(row, col)).status === 'fail'"
                        class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[--danger] text-white flex items-center justify-center text-[9px]"
                      >!</div>
                    </template>
                    <!-- Hover 浮层 -->
                    <div
                      v-if="hoverKey === `${row}-${col}` && hasPlanOp(row, col)"
                      class="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[--foreground] text-white text-[11px] rounded-md p-2.5 shadow-xl pointer-events-none"
                    >
                      <div class="font-semibold text-[--warning] mb-1.5 flex items-center gap-1">
                        <span>📋</span> 计划内容
                      </div>
                      <div v-for="op in getCell(row, col).operations" :key="op.id" class="mb-1 last:mb-0 space-y-0.5">
                        <div class="font-semibold text-white">{{ op.action || op.substance || '操作步骤' }}</div>
                        <div class="text-[--text-tertiary]">
                          <span v-if="op.substance">物质：{{ op.substance }}</span>
                          <span v-if="op.substance && op.sampleId"> · </span>
                          <span v-if="op.sampleId">样品：{{ op.sampleId }}</span>
                        </div>
                        <div class="text-[--text-tertiary]">
                          <span v-if="op.volume !== undefined">加入量：{{ op.volume }}{{ op.unit }}</span>
                          <span v-if="op.volume !== undefined && op.equipment"> · </span>
                          <span v-if="op.equipment">设备：{{ op.equipment }}</span>
                        </div>
                        <div class="text-[--text-tertiary]">
                          <span v-if="op.step">步骤：{{ op.step }}</span>
                          <span v-if="op.scanObject"> · 扫码：{{ objTypeLabel(op.scanObject) }}</span>
                        </div>
                        <div v-if="op.note" class="text-[--text-tertiary]">备注：{{ op.note }}</div>
                      </div>
                      <!-- 执行状态摘要 -->
                      <div class="mt-1.5 pt-1.5 border-t border-white/20 text-[10px]">
                        <span :class="getCellExecState(getCellKey(row, col)).status === 'pass' ? 'text-[--success]' : getCellExecState(getCellKey(row, col)).status === 'fail' ? 'text-[--danger]' : 'text-[--warning]'">
                          {{ getCellExecState(getCellKey(row, col)).statusLabel }}
                        </span>
                        <span v-if="getCellExecState(getCellKey(row, col)).status === 'fail'" class="text-[--danger] ml-1">
                          · {{ getCellExecState(getCellKey(row, col)).errors[0] }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="tableFormComponent" class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 overflow-auto">
            <component :is="tableFormComponent" v-bind="tableFormProps as any" />
          </div>
          <div v-else class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-8">
            <div class="text-center py-12">
              <div class="text-3xl mb-3">📋</div>
              <div class="text-sm font-bold text-[--text-main] mb-1">{{ activeForm.template?.templateName }}</div>
              <div class="text-xs text-[--muted-foreground]">该模板暂未接入执行态渲染组件</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：执行详情面板 -->
      <aside class="w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto">
        <!-- 当前格子信息 -->
        <BaseCard v-if="selectedCell">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[--foreground]">格子执行详情</span>
              <BaseTag
                :label="getCellExecState(selectedCellKey).statusLabel"
                :tone="getCellExecState(selectedCellKey).statusTone"
              />
            </div>
          </template>

          <div class="mb-3 text-xs text-[--muted-foreground]">
            当前格子：<span class="font-medium text-[--text-main]">{{ selectedCellLabel }}</span>
          </div>

          <!-- 计划内容区 -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1 h-4 bg-[--warning] rounded-full" />
              <span class="text-xs font-bold text-[--text-main]">计划内容（负责人配置）</span>
            </div>
            <div class="space-y-1.5">
              <div
                v-for="op in selectedCell.operations"
                :key="op.id"
                class="p-2 rounded-md bg-[--warning-soft] border border-[--warning-border] text-xs"
              >
                <div class="font-semibold text-[--warning] mb-1">{{ op.action || op.substance || '操作步骤' }}</div>
                <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[--muted-foreground]">
                  <div v-if="op.substance"><span class="text-[--text-main]">物质：</span>{{ op.substance }}</div>
                  <div v-if="op.sampleId"><span class="text-[--text-main]">样品：</span>{{ op.sampleId }}</div>
                  <div v-if="op.volume !== undefined"><span class="text-[--text-main]">加入量：</span>{{ op.volume }}{{ op.unit }}</div>
                  <div v-if="op.equipment"><span class="text-[--text-main]">设备：</span>{{ op.equipment }}</div>
                  <div v-if="op.step"><span class="text-[--text-main]">步骤：</span>{{ op.step }}</div>
                  <div v-if="op.scanObject"><span class="text-[--text-main]">扫码：</span>{{ objTypeLabel(op.scanObject) }}</div>
                  <div v-if="op.note"><span class="text-[--text-main]">备注：</span>{{ op.note }}</div>
                  <div v-if="op.required" class="col-span-2"><span class="text-[--danger]">* 必填项</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实际执行对比区 -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1 h-4 bg-[--primary] rounded-full" />
              <span class="text-xs font-bold text-[--text-main]">实际执行（实验员录入）</span>
            </div>
            <div class="space-y-2">
              <div
                v-for="op in selectedCell.operations"
                :key="op.id"
                class="p-2 rounded-md border"
                :class="compareOpResult(op) === 'pass' ? 'bg-[--success-soft] border-[--success-border]' : compareOpResult(op) === 'fail' ? 'bg-[--danger-soft] border-[--danger-border]' : 'bg-[--surface-muted] border-[--border]'"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold text-[--text-main]">{{ op.action || op.substance || '操作' }}</span>
                  <span v-if="compareOpResult(op) === 'pass'" class="text-[10px] text-[--success] font-semibold">✓ 匹配</span>
                  <span v-if="compareOpResult(op) === 'fail'" class="text-[10px] text-[--danger] font-semibold">✕ 不匹配</span>
                  <span v-if="compareOpResult(op) === 'pending'" class="text-[10px] text-[--warning] font-semibold">△ 待录入</span>
                </div>
                <div v-if="op.substance" class="mb-1">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">样品 / 物质</div>
                  <div class="flex items-center gap-1 flex-wrap">
                    <span class="text-xs text-[--text-main]">{{ op.substance }}</span>
                    <span v-if="getCellExecData().substance && getCellExecData().substance !== op.substance" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().substance }}
                    </span>
                    <span v-else-if="getCellExecData().substance" class="text-[10px] text-[--success]">✓ {{ getCellExecData().substance }}</span>
                  </div>
                </div>
                <div v-if="op.sampleId" class="mb-1">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">样品编号</div>
                  <div class="flex items-center gap-1 flex-wrap">
                    <span class="text-xs text-[--text-main]">{{ op.sampleId }}</span>
                    <span v-if="getCellExecData().sampleId && getCellExecData().sampleId !== op.sampleId" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().sampleId }}
                    </span>
                    <span v-else-if="getCellExecData().sampleId" class="text-[10px] text-[--success]">✓ {{ getCellExecData().sampleId }}</span>
                  </div>
                </div>
                <div v-if="op.volume !== undefined" class="mb-1">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">加入量</div>
                  <div class="flex items-center gap-1 flex-wrap">
                    <span class="text-xs text-[--text-main]">{{ op.volume }}{{ op.unit }}</span>
                    <span v-if="getCellExecData().volume !== undefined" :class="getCellExecData().volume === op.volume ? 'text-[10px] text-[--success]' : 'text-[10px] text-[--danger]'">
                      → {{ getCellExecData().volume }}{{ getCellExecData().unit || op.unit }}
                    </span>
                    <span v-else class="text-[10px] text-[--warning]">待录入</span>
                  </div>
                </div>
                <div v-if="op.equipment" class="mb-1">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">设备编号</div>
                  <div class="flex items-center gap-1 flex-wrap">
                    <span class="text-xs text-[--text-main]">{{ op.equipment }}</span>
                    <span v-if="getCellExecData().equipment && getCellExecData().equipment !== op.equipment" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().equipment }}
                    </span>
                    <span v-else-if="getCellExecData().equipment" class="text-[10px] text-[--success]">✓ 匹配</span>
                  </div>
                </div>
                <div v-if="op.scanObject" class="mb-1">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">扫码状态</div>
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-[--text-main]">{{ objTypeLabel(op.scanObject) }}</span>
                    <span v-if="getCellExecData().scanned" class="text-[10px] text-[--success]">✓ 已扫码</span>
                    <span v-else class="text-[10px] text-[--warning]">△ 未扫码</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实际录入表单 -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1 h-4 bg-[--info] rounded-full" />
              <span class="text-xs font-bold text-[--text-main]">录入实际数据</span>
            </div>
            <div class="space-y-2">
              <BaseFormField
                v-if="selectedCell.operations.some(op => op.substance)"
                label="实际物质"
                type="text"
                placeholder="输入实际物质名称"
                v-model="getCellExecData().substance"
                @update:model-value="onCellDataChange"
              />
              <BaseFormField
                v-if="selectedCell.operations.some(op => op.sampleId)"
                label="实际样品编号"
                type="text"
                placeholder="扫码或输入样品编号"
                v-model="getCellExecData().sampleId"
                @update:model-value="onCellDataChange"
              />
              <div class="grid grid-cols-2 gap-2">
                <BaseFormField
                  v-if="selectedCell.operations.some(op => op.volume !== undefined)"
                  label="实际加入量"
                  type="number"
                  placeholder="输入体积"
                  v-model.number="getCellExecData().volume"
                  @update:model-value="onCellDataChange"
                />
                <BaseFormField
                  label="单位"
                  type="select"
                  :options="volumeUnitOptions"
                  v-model="getCellExecData().unit"
                  @update:model-value="onCellDataChange"
                />
              </div>
              <BaseFormField
                v-if="selectedCell.operations.some(op => op.equipment)"
                label="实际设备编号"
                type="text"
                placeholder="扫码或输入设备编号"
                v-model="getCellExecData().equipment"
                @update:model-value="onCellDataChange"
              />
              <div class="flex items-center gap-2 py-1">
                <BaseCheckbox
                  :checked="getCellExecData().scanned"
                  @update:checked="v => { getCellExecData().scanned = v; onCellDataChange(); }"
                />
                <span class="text-xs text-[--text-main]">扫码已确认</span>
                <span v-if="getCellExecData().scanned" class="text-[10px] text-[--success]">✓</span>
              </div>
              <BaseFormField
                label="执行备注"
                type="textarea"
                placeholder="记录特殊情况或偏差说明"
                v-model="getCellExecData().note"
                @update:model-value="onCellDataChange"
              />
            </div>
          </div>
        </BaseCard>

        <!-- 无格子选中时的提示 -->
        <BaseCard v-else>
          <div class="py-8 text-center space-y-3">
            <div class="text-3xl">🔬</div>
            <div class="text-sm font-bold text-[--text-main]">点击任意格子开始执行</div>
            <div class="text-xs text-[--muted-foreground] leading-relaxed">
              在左侧模板中点击已配置的格子<br />查看计划内容并录入实际执行数据
            </div>
            <div class="text-[10px] text-[--muted-foreground] pt-2 border-t border-[--border]">
              <div class="flex items-center justify-center gap-2 mb-1">
                <div class="w-2 h-2 rounded-full bg-[--success-soft] border border-[--success]" /> 已完成
                <div class="w-2 h-2 rounded-full bg-[--warning-soft] border border-[--warning]" /> 录入中
                <div class="w-2 h-2 rounded-full bg-[--danger-soft] border border-[--danger]" /> 有偏差
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 步骤执行指导 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[--foreground]">当前步骤指导</span>
              <BaseTag :label="`第 ${activeStepIndex + 1} / ${methodSteps.length}`" tone="info" />
            </div>
          </template>
          <div v-if="currentStepData" class="space-y-3">
            <div class="p-3 rounded-md bg-[--surface-muted] border border-[--border]">
              <div class="text-xs font-semibold text-[--text-main] mb-1">操作步骤</div>
              <div class="text-sm text-[--text-main] leading-relaxed">{{ currentStepData.action }}</div>
              <div v-if="currentStepData.notes" class="text-[10px] text-[--warning] mt-1.5">⚠ {{ currentStepData.notes }}</div>
            </div>
            <div v-if="currentStepData.expected.length > 0">
              <div class="text-xs font-semibold text-[--text-main] mb-1.5">预期参数</div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="(exp, ei) in currentStepData.expected"
                  :key="ei"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[--warning-soft] text-[--warning] text-xs font-semibold border border-[--warning-border]"
                >
                  {{ exp.value }} {{ exp.unit }}
                </span>
              </div>
            </div>
            <div v-if="currentStepData.scanObjects.length > 0">
              <div class="text-xs font-semibold text-[--text-main] mb-1.5">扫码对象</div>
              <div class="space-y-1">
                <div
                  v-for="obj in currentStepData.scanObjects"
                  :key="obj.type + '-' + obj.name"
                  class="flex items-center gap-2 text-xs"
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-[--info] shrink-0" />
                  <span class="text-[--muted-foreground]">{{ objTypeLabel(obj.type) }}</span>
                  <span class="font-medium text-[--text-main]">{{ obj.name }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-[--muted-foreground] text-center py-4">
            当前步骤无详细指导信息
          </div>
        </BaseCard>

        <!-- 底部操作 -->
        <div class="bg-white border border-[--border] rounded-[--radius-lg] px-4 py-3 shrink-0">
          <div class="flex items-center justify-between">
            <div class="text-xs text-[--muted-foreground]">
              <span v-if="selectedCellLabel" class="text-[--text-main] font-medium">{{ selectedCellLabel }}</span>
              <span v-else>未选择格子</span>
            </div>
            <div class="flex gap-2">
              <BaseButton variant="secondary" size="sm" @click="saveDraft">保存草稿</BaseButton>
              <BaseButton variant="primary" size="sm" @click="markCellDone" :disabled="!selectedCell">
                标记完成
              </BaseButton>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 异常提交抽屉 -->
    <div v-if="showExceptionDrawer" class="fixed inset-0 z-50 flex justify-end" @click.self="showExceptionDrawer = false">
      <div class="absolute inset-0 bg-black/40" />
      <div class="relative w-[520px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[--border] bg-[--danger-soft]">
          <div>
            <div class="text-sm font-bold text-[--danger]">⚠ 提交异常</div>
            <div class="text-[10px] text-[--danger]/70 mt-0.5">正式登记执行偏差，用于质量追溯</div>
          </div>
          <button @click="showExceptionDrawer = false" class="text-[--muted-foreground] hover:text-[--text-main] text-lg leading-none">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <!-- 基础信息 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--danger] rounded-full" />基础信息
            </div>
            <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div><span class="text-[--muted-foreground]">计划编号：</span><span class="font-mono text-[--text-main]">{{ task?.planCode || '—' }}</span></div>
              <div><span class="text-[--muted-foreground]">任务编号：</span><span class="font-mono text-[--text-main]">{{ task?.id ?? effectiveTaskId }}</span></div>
              <div><span class="text-[--muted-foreground]">考察项：</span><span>{{ task?.itemCode }} {{ task?.itemName }}</span></div>
              <div><span class="text-[--muted-foreground]">当前格子：</span><span class="font-mono text-[--warning]">{{ selectedCellLabel || '未选择' }}</span></div>
              <div><span class="text-[--muted-foreground]">当前步骤：</span><span>{{ currentStepData?.action?.slice(0, 20) || '—' }}</span></div>
              <div><span class="text-[--muted-foreground]">触发人：</span><span>{{ dailySheets.find((s: any) => s.id === effectiveTaskId)?.investigator || '—' }}</span></div>
            </div>
          </div>
          <!-- 现象类型 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--danger] rounded-full" />现象类型 <span class="text-[--danger]">*</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5">
              <button v-for="t in exceptionTypes" :key="t.value"
                @click="exceptionForm.type = t.value"
                class="text-[10px] px-2 py-1.5 rounded-md border transition-all text-center"
                :class="exceptionForm.type === t.value
                  ? 'border-[--danger] bg-[--danger-soft] text-[--danger] font-semibold'
                  : 'border-[--border] text-[--muted-foreground] hover:border-[--danger]/40'"
              >{{ t.label }}</button>
            </div>
          </div>
          <!-- 现象描述 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--danger] rounded-full" />现象描述 <span class="text-[--danger]">*</span>
            </div>
            <BaseFormField type="textarea" v-model="exceptionForm.reason" :required="true"
              placeholder="请详细描述异常发生的原因、过程及现场情况..." />
          </div>
          <!-- 异常详情 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--danger] rounded-full" />异常详情
            </div>
            <div class="bg-[--surface] rounded-md border border-[--border] p-3 space-y-2 text-xs">
              <div class="grid grid-cols-2 gap-x-3">
                <div><span class="text-[--muted-foreground]">计划值：</span><span class="text-[--warning] font-mono">{{ getSelectedCellPlanDisplay() || '—' }}</span></div>
                <div><span class="text-[--muted-foreground]">实际值：</span><span class="text-[--text-main] font-mono">{{ getSelectedCellActualDisplay() || '—' }}</span></div>
              </div>
              <div class="flex gap-4 text-[--muted-foreground]">
                <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" v-model="exceptionForm.affectsNext" class="accent-[--danger]" /> 影响后续步骤</label>
                <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" v-model="exceptionForm.needsRetake" class="accent-[--danger]" /> 需重新执行</label>
                <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" v-model="exceptionForm.pauseTask" class="accent-[--danger]" /> 暂停当前任务</label>
              </div>
            </div>
          </div>
          <!-- 处理建议 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--danger] rounded-full" />处理建议
            </div>
            <select v-model="exceptionForm.handling"
              class="w-full text-xs border border-[--border] rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[--danger]/40 bg-white"
            >
              <option v-for="h in exceptionHandlingOptions" :key="h.value" :value="h.value">{{ h.label }}</option>
            </select>
          </div>
          <!-- 证明材料 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--danger] rounded-full" />证明材料
            </div>
            <div class="border-2 border-dashed border-[--border] rounded-md p-4 text-center text-[10px] text-[--muted-foreground] hover:border-[--danger]/40 cursor-pointer transition-colors">
              <div class="text-lg mb-1">📎</div>
              <div>点击上传截图、照片或扫码结果</div>
              <div class="text-[9px] mt-0.5">支持 JPG/PNG/PDF，最大 10MB</div>
            </div>
          </div>
        </div>
        <div class="px-5 py-4 border-t border-[--border] flex items-center justify-end gap-2 bg-[--surface]">
          <BaseButton variant="secondary" size="sm" @click="showExceptionDrawer = false">取消</BaseButton>
          <BaseButton variant="danger" size="sm" @click="submitException">提交异常申请</BaseButton>
        </div>
      </div>
    </div>

    <!-- 方法更新申请抽屉 -->
    <div v-if="showMethodUpdateDrawer" class="fixed inset-0 z-50 flex justify-end" @click.self="showMethodUpdateDrawer = false">
      <div class="absolute inset-0 bg-black/40" />
      <div class="relative w-[520px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[--info-border] bg-[--info-soft]">
          <div>
            <div class="text-sm font-bold text-[--info]">方法更新申请</div>
            <div class="text-[10px] text-[--info]/70 mt-0.5">申请替换或补充当前执行方法，需审批后生效</div>
          </div>
          <button @click="showMethodUpdateDrawer = false" class="text-[--muted-foreground] hover:text-[--text-main] text-lg leading-none">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <!-- 基础信息 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--info] rounded-full" />基础信息
            </div>
            <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <div><span class="text-[--muted-foreground]">计划编号：</span><span class="font-mono text-[--text-main]">{{ task?.planCode || '—' }}</span></div>
              <div><span class="text-[--muted-foreground]">任务编号：</span><span class="font-mono text-[--text-main]">{{ task?.id ?? effectiveTaskId }}</span></div>
              <div><span class="text-[--muted-foreground]">考察项：</span><span>{{ task?.itemCode }} {{ task?.itemName }}</span></div>
              <div><span class="text-[--muted-foreground]">当前格子：</span><span class="font-mono text-[--info]">{{ selectedCellLabel || '未选择' }}</span></div>
              <div><span class="text-[--muted-foreground]">当前步骤：</span><span>{{ currentStepData?.action?.slice(0, 20) || '—' }}</span></div>
              <div><span class="text-[--muted-foreground]">当前方法：</span><span class="font-mono text-[--text-main]">{{ task?.methodCode }} / v{{ task?.methodVersion }}</span></div>
            </div>
          </div>
          <!-- 原方法信息 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--muted-foreground] rounded-full" />原方法信息
            </div>
            <div class="bg-[--surface] rounded-md border border-[--border] p-3 space-y-1.5 text-xs">
              <div class="flex justify-between"><span class="text-[--muted-foreground]">方法名称</span><span class="font-mono text-[--text-main]">{{ task?.methodCode || 'BRH-MN-202506059' }}</span></div>
              <div class="flex justify-between"><span class="text-[--muted-foreground]">方法版本</span><span class="font-mono text-[--text-main]">v{{ task?.methodVersion || 'VAL1' }}</span></div>
              <div class="flex justify-between"><span class="text-[--muted-foreground]">用途</span><span>{{ task?.itemName || '基质效应考察' }}</span></div>
              <div class="flex justify-between"><span class="text-[--muted-foreground]">当前状态</span>
                <BaseTag label="已生效" tone="success" />
              </div>
            </div>
          </div>
          <!-- 新方法信息 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--info] rounded-full" />新方法信息 <span class="text-[--info]">*</span>
            </div>
            <div class="space-y-2">
              <BaseFormField label="新方法名称" type="text" v-model="methodUpdateForm.newMethodName" :required="true" placeholder="如：HPLC-UV-积分方法 v2.0" />
              <div class="grid grid-cols-2 gap-2">
                <BaseFormField label="新方法版本" type="text" v-model="methodUpdateForm.newMethodVersion" placeholder="如：VAL2" />
                <BaseFormField label="适用范围" type="select" v-model="methodUpdateForm.scope"
                  :options="[{label:'仅当前任务',value:'current'},{label:'当前模板实例',value:'template'},{label:'整个项目后续任务',value:'project'},{label:'跨项目复用',value:'cross'}]" />
              </div>
              <BaseFormField label="新方法说明" type="textarea" v-model="methodUpdateForm.newMethodDesc"
                placeholder="描述新方法的具体改进内容、适用场景..." />
              <BaseFormField label="是否建议后续项目复用" type="radio" v-model="methodUpdateForm.crossProject"
                :options="[{label:'是',value:'yes'},{label:'否',value:'no'}]" />
            </div>
          </div>
          <!-- 更新原因 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--info] rounded-full" />更新原因 <span class="text-[--info]">*</span>
            </div>
            <BaseFormField label="详细说明" type="textarea" v-model="methodUpdateForm.reason" :required="true"
              placeholder="请说明：为什么不能继续使用原方法？新方法是否经过现场验证？是否影响结果解释？" />
            <div class="mt-1.5 flex flex-wrap gap-1.5">
              <button v-for="r in methodUpdateReasons" :key="r.value" @click="methodUpdateForm.reasons.push(r.value)"
                class="text-[10px] px-2 py-0.5 rounded-full border border-[--info-border] text-[--info] hover:bg-[--info-soft] transition-colors"
              >{{ r.label }}</button>
            </div>
          </div>
          <!-- 影响范围 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--info] rounded-full" />影响范围
            </div>
            <div class="space-y-1.5">
              <label v-for="opt in methodUpdateScopeOptions" :key="opt.value" class="flex items-center gap-2 text-xs cursor-pointer py-1">
                <input type="checkbox" v-model="methodUpdateForm.affectedScope" :value="opt.value" class="accent-[--info]" />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>
          <!-- 风险与备注 -->
          <div>
            <div class="text-xs font-bold text-[--text-main] mb-2 flex items-center gap-1.5">
              <div class="w-1 h-3 bg-[--info] rounded-full" />风险与备注
            </div>
            <BaseFormField label="风险评估" type="select" v-model="methodUpdateForm.riskLevel"
              :options="[{label:'低 — 不影响结果判定',value:'low'},{label:'中 — 可能影响部分结果',value:'medium'},{label:'高 — 可能影响全部结果',value:'high'}]" />
            <BaseFormField label="补充说明" type="textarea" v-model="methodUpdateForm.notes"
              placeholder="其他需要说明的情况..." />
            <div class="border-2 border-dashed border-[--border] rounded-md p-3 text-center text-[10px] text-[--muted-foreground] hover:border-[--info]/40 cursor-pointer transition-colors mt-2">
              <div>📎 上传相关证明材料（方法验证报告、软件截图等）</div>
            </div>
          </div>
        </div>
        <div class="px-5 py-4 border-t border-[--border] flex items-center justify-end gap-2 bg-[--surface]">
          <BaseButton variant="secondary" size="sm" @click="showMethodUpdateDrawer = false">取消</BaseButton>
          <BaseButton variant="primary" size="sm" @click="submitMethodUpdate">提交申请</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseFormField from '@/components/base/BaseFormField.vue';
import BaseCheckbox from '@/components/base/BaseCheckbox.vue';
import BaseTag from '@/components/base/BaseTag.vue';
import SequenceGrid from '@/components/experiments/SequenceGrid.vue';
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
import PureSolutionStabilityTableBlock from '@/components/experiments/PureSolutionStabilityTableBlock.vue';
import FreezeThawStabilityTableBlock from '@/components/experiments/FreezeThawStabilityTableBlock.vue';
import MatrixSampleStabilityTableBlock from '@/components/experiments/MatrixSampleStabilityTableBlock.vue';
import MethodValidationResultBlock from '@/components/experiments/MethodValidationResultBlock.vue';
import ReanalysisApplicationBlock from '@/components/experiments/ReanalysisApplicationBlock.vue';
import ISStockSolutionBlock from '@/components/experiments/ISStockSolutionBlock.vue';
import ReanalysisSummaryDoubleBlock from '@/components/experiments/ReanalysisSummaryDoubleBlock.vue';
import ReanalysisSummarySingleBlock from '@/components/experiments/ReanalysisSummarySingleBlock.vue';
import UnconventionalStabilityBlock from '@/components/experiments/UnconventionalStabilityBlock.vue';
import { tasks } from '@/api/mock/tasks';
import { getDemoTask } from '@/api/mock/demoContext';
import { formTemplates } from '@/api/mock/form-templates';
import { dailySheets } from '@/api/mock/sheets';
import type { Task, TaskStep, SequenceCell, SequenceOperation, FormTemplateRecord } from '@/types/experiments';

// ── 执行态格子数据 ──────────────────────────────────────────────
interface CellExecData {
  substance?: string;
  sampleId?: string;
  volume?: number;
  unit?: string;
  equipment?: string;
  scanObject?: string;
  scanned: boolean;
  note?: string;
  status: 'pending' | 'in_progress' | 'pass' | 'fail';
  errors: string[];
}

type WorkspaceForm = {
  itemId: string;
  templateId: string;
  instanceId: string;
  template: FormTemplateRecord | null;
  cells: SequenceCell[];
  footer?: { location?: string; time?: string; owner?: string; reviewer?: string };
  recordModel?: any;
  solutionTopRows?: string[][];
  solutionBottomRows?: string[][];
};

// ── 路由 & 任务 ──────────────────────────────────────────────────
const route = useRoute();
const router = useRouter();
const taskId = (route.params.taskId as string) || (route.params.id as string) || (route.query.taskId as string) || '';
const planCode = (route.query.planCode as string) || '';
const projectId = (route.query.projectId as string) || '';

const task = computed<Task | undefined>(() => tasks.find((t: any) => t.id === taskId) ?? getDemoTask(taskId));
const effectiveTaskId = taskId;

// ── 方法步骤 ─────────────────────────────────────────────────────
const methodSteps = computed<TaskStep[]>(() => task.value?.steps ?? []);
const activeStepIndex = ref(0);
const currentStepData = computed(() => methodSteps.value[activeStepIndex.value] ?? null);

// ── 模板实例 & 工作区 ────────────────────────────────────────────
const workspaceForms = ref<WorkspaceForm[]>([]);
const activeFormIndex = ref(0);
const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const activeForm = computed<WorkspaceForm | null>(() => workspaceForms.value[activeFormIndex.value] ?? null);
const activeTemplateCode = computed(() => activeForm.value?.template?.templateCode ?? '');
const tableFormComponent = computed(() => {
  switch (activeTemplateCode.value) {
    case 'FT-SOL-004': return SolutionPrepTableBlock;
    case 'BA-SBR02': return ReferenceStockTableBlock;
    case 'BA-SBR03': return WorkSolutionTableBlock;
    case 'BA-SBR04': return SplitRecordTableBlock;
    case 'BA-SBR06': return MatrixSampleTableBlock;
    case 'BA-SBR07': return AdditionSequenceTableBlock;
    case 'BA-SBR08': return MSSolutionTableBlock;
    case 'BA-SBR09': return InjectionSequenceTableBlock;
    case 'BA-SBR10': return InjectionLCMSRecordTableBlock;
    case 'BA-SBR12': return StabilitySampleTableBlock;
    case 'BA-SBR13': return DilutionRecordTableBlock;
    case 'BA-SBR14': return PureSolutionStabilityTableBlock;
    case 'BA-SBR15': return FreezeThawStabilityTableBlock;
    case 'BA-SBR16': return MatrixSampleStabilityTableBlock;
    case 'BA-SBR17': return MethodValidationResultBlock;
    case 'BA-SBR19': return ReanalysisApplicationBlock;
    case 'BA-SBR20': return ISStockSolutionBlock;
    case 'BA-SBR21': return ReanalysisSummaryDoubleBlock;
    case 'BA-SBR22': return ReanalysisSummarySingleBlock;
    case 'BA-SBR23': return UnconventionalStabilityBlock;
    default: return null;
  }
});
const tableFormProps = computed(() => {
  const form = activeForm.value;
  if (!form) return {};
  return {
    modelValue: form.recordModel ?? {},
    editable: false,
  };
});

// ── 格子执行状态 ──────────────────────────────────────────────────
const cellExecDataMap = ref<Record<string, CellExecData>>({});
const hoverKey = ref<string | null>(null);
const activeCellKey = ref<string | null>(null);
const activeTableCellKey = ref<string | null>(null);

function getCellKey(row: string, col: number): string {
  return `${row}-${col}`;
}

function getCell(row: string, col: number): SequenceCell {
  if (!activeForm.value) return { row, col, operations: [], selected: false };
  return activeForm.value.cells.find(c => c.row === row && c.col === col)
    ?? { row, col, operations: [], selected: false };
}

function hasPlanOp(row: string, col: number): boolean {
  return getCell(row, col).operations.length > 0;
}

function getCellSummary(row: string, col: string | number): string {
  const key = typeof col === 'string' ? col : `${row}-${col}`;
  const ops = getCell(row, typeof col === 'number' ? col : parseInt(col, 10)).operations;
  if (ops.length === 0) return '';
  const op = ops[0];
  return op.substance || op.action || '—';
}

function getCellTitle(row: string, col: number): string {
  const ops = getCell(row, col).operations;
  if (ops.length === 0) return '该格子无计划配置';
  return ops.map(op => `${op.action || op.substance || '操作'} · ${op.sampleId || '—'} · ${op.volume ?? '—'}${op.unit}`).join('\n');
}

function getCellExecState(key: string): {
  status: CellExecData['status'];
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'danger' | 'neutral';
  errors: string[];
} {
  const data = cellExecDataMap.value[key];
  if (!data) return { status: 'pending', statusLabel: '未开始', statusTone: 'neutral' as const, errors: [] };
  return {
    status: data.status,
    statusLabel: { pending: '未开始', in_progress: '录入中', pass: '比对通过', fail: '有偏差' }[data.status],
    statusTone: { pending: 'neutral', in_progress: 'warning', pass: 'success', fail: 'danger' }[data.status],
    errors: data.errors,
  };
}

function ensureCellExec(key: string): CellExecData {
  if (!cellExecDataMap.value[key]) {
    cellExecDataMap.value[key] = { scanned: false, status: 'pending', errors: [] };
  }
  return cellExecDataMap.value[key]!;
}

function getCellExecData(): CellExecData {
  const key = selectedCellKey.value;
  if (!key) return ensureCellExec('__none__');
  return ensureCellExec(key);
}

// ── 格子选中 ─────────────────────────────────────────────────────
const selectedCell = computed<SequenceCell | null>(() => {
  if (!activeForm.value || !activeCellKey.value) return null;
  const [row, colStr] = activeCellKey.value.split('-');
  const col = parseInt(colStr, 10);
  return activeForm.value.cells.find(c => c.row === row && c.col === col) ?? null;
});

const selectedCellKey = computed(() => activeCellKey.value);

const selectedCellLabel = computed(() => {
  if (!activeCellKey.value) return null;
  const [row, colStr] = activeCellKey.value.split('-');
  const col = parseInt(colStr, 10);
  return `${row}${col}`;
});

function selectCell(row: string, col: number) {
  if (!hasPlanOp(row, col)) return;
  activeCellKey.value = getCellKey(row, col);
  ensureCellExec(getCellKey(row, col));
}

// ── 格子数据变化回调 ─────────────────────────────────────────────
function onCellDataChange() {
  if (!selectedCellKey.value) return;
  const key = selectedCellKey.value;
  const data = cellExecDataMap.value[key]!;
  data.status = 'in_progress';
  data.errors = validateCell(selectedCell.value!, data);
  if (data.errors.length === 0 && selectedCell.value?.operations.length > 0) {
    data.status = 'pass';
  } else if (data.errors.length > 0) {
    data.status = 'fail';
  }
  // 同步到当前选中格的 SequenceCell（用于 hover 浮层显示）
  if (selectedCell.value) {
    const [row, colStr] = key.split('-');
    const col = parseInt(colStr, 10);
    const cell = activeForm.value?.cells.find(c => c.row === row && c.col === col);
    if (cell) cell.selected = true;
  }
}

// ── 比对逻辑 ─────────────────────────────────────────────────────
function validateCell(cell: SequenceCell, data: CellExecData): string[] {
  const errors: string[] = [];
  for (const op of cell.operations) {
    if (op.substance && data.substance && data.substance !== op.substance) {
      errors.push(`物质不匹配：计划「${op.substance}」vs 实际「${data.substance}」`);
    }
    if (op.sampleId && data.sampleId && data.sampleId !== op.sampleId) {
      errors.push(`样品编号不匹配：计划「${op.sampleId}」vs 实际「${data.sampleId}」`);
    }
    if (op.volume !== undefined && data.volume !== undefined && data.volume !== op.volume) {
      errors.push(`加入量不匹配：计划「${op.volume}${op.unit}」vs 实际「${data.volume}${data.unit || op.unit}」`);
    }
    if (op.equipment && data.equipment && data.equipment !== op.equipment) {
      errors.push(`设备编号不匹配：计划「${op.equipment}」vs 实际「${data.equipment}」`);
    }
  }
  // 必填项检查
  for (const op of cell.operations) {
    if (op.required && op.substance && !data.substance) {
      errors.push(`「${op.substance}」为必填项，请录入实际物质`);
    }
    if (op.required && op.sampleId && !data.sampleId) {
      errors.push(`「${op.sampleId}」为必填项，请录入实际样品编号`);
    }
  }
  return errors;
}

function compareOpResult(op: SequenceOperation): 'pass' | 'fail' | 'pending' {
  const data = getCellExecData();
  if (data.status === 'pass') return 'pass';
  if (data.status === 'fail') return 'fail';
  return 'pending';
}

// ── 格子统计 ─────────────────────────────────────────────────────
const completedCellCount = computed(() =>
  Object.values(cellExecDataMap.value).filter(d => d.status === 'pass').length
);
const inProgressCellCount = computed(() =>
  Object.values(cellExecDataMap.value).filter(d => d.status === 'in_progress').length
);
const failedCellCount = computed(() =>
  Object.values(cellExecDataMap.value).filter(d => d.status === 'fail').length
);

const totalConfiguredCells = computed(() => {
  let total = 0;
  for (const form of workspaceForms.value) {
    total += form.cells.filter(c => c.operations.length > 0).length;
  }
  return total;
});

const progressPercent = computed(() => {
  if (totalConfiguredCells.value === 0) return 0;
  return Math.round(completedCellCount.value / totalConfiguredCells.value * 100);
});

const allCellsCompleted = computed(() =>
  totalConfiguredCells.value > 0 && completedCellCount.value === totalConfiguredCells.value
);

const cellStatusSummaryLabel = computed(() => {
  if (totalConfiguredCells.value === 0) return '无配置';
  if (allCellsCompleted.value) return '全部完成';
  if (failedCellCount.value > 0) return `进行中 · ${failedCellCount.value} 异常`;
  if (completedCellCount.value > 0) return `${completedCellCount.value}/${totalConfiguredCells.value} 完成`;
  return '待开始';
});

const cellStatusSummaryTone = computed((): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (allCellsCompleted.value) return 'success';
  if (failedCellCount.value > 0) return 'danger';
  if (completedCellCount.value > 0) return 'warning';
  return 'neutral';
});

// ── 工具函数 ─────────────────────────────────────────────────────
const volumeUnitOptions = [
  { value: 'μL', label: 'μL' },
  { value: 'mL', label: 'mL' },
  { value: 'L', label: 'L' },
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
];

const objTypeLabel = (type: string) => {
  const map: Record<string, string> = { device: '设备', reagent: '试剂', sample: '样品', consumable: '耗材' };
  return map[type] ?? type;
};

// ── 加载工作区数据 ───────────────────────────────────────────────
function loadWorkspaceState() {
  const taskFormTemplates = task.value?.formTemplates ?? [];

  // Sheet ID 场景：跳过 localStorage，直接提示手动加载 mock
  if (taskId && !task.value && !planCode) {
    const sheet = dailySheets.find((s: any) => s.id === taskId);
    if (sheet && sheet.status !== 'submitted') {
      return; // 由 sheetMockAvailable() 和 loadSheetMock() 处理
    }
  }

  // 1. 从 localStorage 恢复
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('plan-workspace::')) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const state = JSON.parse(raw) as {
        workspaceForms?: Array<{
          instanceId: string;
          templateId: string;
          cells: SequenceCell[];
          footer?: any;
          recordModel?: any;
          solutionTopRows?: string[][];
          solutionBottomRows?: string[][];
        }>;
        planCode?: string;
      };
      if (!state.workspaceForms?.length) continue;
      const matchingForms = state.workspaceForms
        .filter(form => {
          if (!taskFormTemplates.length) return true;
          const tpl = formTemplates.find((f: any) => f.id === form.templateId);
          return tpl && taskFormTemplates.includes(tpl.templateName);
        })
        .map(form => {
          const tpl = formTemplates.find((f: any) => f.id === form.templateId) ?? null;
          return {
            ...form,
            template: tpl,
            recordModel: (form as any).recordModel,
            solutionTopRows: (form as any).solutionTopRows,
            solutionBottomRows: (form as any).solutionBottomRows,
          } as WorkspaceForm;
        });
      if (matchingForms.length > 0) {
        workspaceForms.value = matchingForms;
        break;
      }
    } catch { /* ignore */ }
  }

  // 2. 如果没有加载到数据，使用 mock 测试数据
  if (workspaceForms.value.length === 0 && taskFormTemplates.includes('工作溶液配制表')) {
    const tpl = formTemplates.find((f: FormTemplateRecord) => f.templateCode === 'BA-SBR03') ?? null;
    if (tpl) {
      const mockOps: Record<string, SequenceOperation[]> = {
        'A-1': [{ id: 'ws-plan-1', action: '确认工作溶液编号', substance: 'WS-01', sampleId: '工作溶液 01', volume: 0, unit: 'μL', scanned: false, equipment: '标签核对', scanObject: 'sample', required: true, step: '步骤一', note: '由计划生成工作溶液编号' }],
        'A-2': [{ id: 'ws-plan-2', action: '核对源溶液代码', substance: 'IS-01', sampleId: '内标工作液', volume: 0, unit: 'μL', scanned: false, equipment: '扫码枪', scanObject: 'reagent', required: true, step: '步骤一', note: '源溶液需与计划一致' }],
        'A-3': [{ id: 'ws-plan-3', action: '核对源溶液浓度', substance: '1000 ng/mL', sampleId: '浓度记录', volume: 0, unit: 'μL', scanned: false, equipment: '读数核对', scanObject: 'reagent', required: true, step: '步骤一', note: '执行时检查标准浓度' }],
        'A-4': [{ id: 'ws-plan-4', action: '移取源溶液', substance: 'IS-01', sampleId: '源溶液', volume: 50, unit: 'μL', scanned: false, equipment: '移液器-001', scanObject: 'device', required: true, step: '步骤二', note: '按计划体积移取' }],
        'A-5': [{ id: 'ws-plan-5', action: '合并源溶液', substance: '已移取样液', sampleId: '工作容器', volume: 0, unit: 'μL', scanned: false, equipment: '工作台', scanObject: 'consumable', required: true, step: '步骤二', note: '与稀释液合并' }],
        'A-6': [{ id: 'ws-plan-6', action: '加入稀释液', substance: '稀释液', sampleId: 'Diluent-A', volume: 450, unit: 'μL', scanned: false, equipment: '移液器-001', scanObject: 'reagent', required: true, step: '步骤二', note: '补足至终体积' }],
        'A-7': [{ id: 'ws-plan-7', action: '确认终体积', substance: '工作液', sampleId: '终体积 500 μL', volume: 500, unit: 'μL', scanned: false, equipment: '容器核对', scanObject: 'consumable', required: true, step: '步骤三', note: '终体积应与计划一致' }],
        'A-8': [{ id: 'ws-plan-8', action: '确认最终浓度', substance: '100 ng/mL', sampleId: '浓度确认', volume: 0, unit: 'μL', scanned: false, equipment: '记录核对', scanObject: 'sample', required: true, step: '步骤三', note: '最终浓度按计划填写' }],
        'B-1': [{ id: 'ws-plan-9', action: '确认工作溶液编号', substance: 'WS-02', sampleId: '工作溶液 02', volume: 0, unit: 'μL', scanned: false, equipment: '标签核对', scanObject: 'sample', required: true, step: '步骤一', note: '第二组工作溶液编号' }],
        'B-4': [{ id: 'ws-plan-10', action: '移取源溶液', substance: 'IS-02', sampleId: '源溶液', volume: 40, unit: 'μL', scanned: false, equipment: '移液器-002', scanObject: 'device', required: true, step: '步骤二', note: '第二行采用不同配比' }],
        'B-6': [{ id: 'ws-plan-11', action: '加入稀释液', substance: '稀释液', sampleId: 'Diluent-B', volume: 360, unit: 'μL', scanned: false, equipment: '移液器-002', scanObject: 'reagent', required: true, step: '步骤二', note: '第二组定容' }],
        'B-7': [{ id: 'ws-plan-12', action: '确认终体积', substance: '工作液', sampleId: '终体积 400 μL', volume: 400, unit: 'μL', scanned: false, equipment: '容器核对', scanObject: 'consumable', required: true, step: '步骤三', note: '终体积应与计划一致' }],
        'B-8': [{ id: 'ws-plan-13', action: '确认最终浓度', substance: '80 ng/mL', sampleId: '浓度确认', volume: 0, unit: 'μL', scanned: false, equipment: '记录核对', scanObject: 'sample', required: true, step: '步骤三', note: '第二组最终浓度' }],
      };

      const cells: SequenceCell[] = [];
      const rows2 = ['A', 'B'];
      for (const row of rows2) {
        for (let col = 0; col < 12; col++) {
          const colNum = col + 1; // 1-indexed, 与 SequenceCell.col 一致
          cells.push({
            row,
            col: colNum,
            operations: mockOps[`${row}-${colNum}`] ?? [],
            selected: false,
          });
        }
      }

      workspaceForms.value = [{
        itemId: task.value?.itemCode ?? 'ITEM',
        templateId: tpl.id,
        instanceId: `${planCode || 'PLAN'}-BA-SBR03-EXEC-01`,
        template: tpl,
        cells,
        recordModel: {
          context: { projectCode: task.value?.planId ?? '' },
          rows: [
            { solutionCode: 'WS-01', sourceCode: 'IS-01', sourceConcentration: '1000', sourceVolume: '50', sourceMerge: '', diluentVolume: '450', finalVolume: '500', finalConcentration: '100' },
            { solutionCode: 'WS-02', sourceCode: 'IS-02', sourceConcentration: '800', sourceVolume: '40', sourceMerge: '', diluentVolume: '360', finalVolume: '400', finalConcentration: '80' },
          ],
          sourceBatch: 'BL-EXEC-001',
          diluentInfo: 'Diluent-A / BATCH-01',
          pureReagentInfo: '—',
          pipetteNo: 'PIP-001',
          containerMaterial: '玻璃',
          containerColor: '透明',
          lightCondition: '黄光灯',
          batchLabel: 'WORK-SOL-EXEC-001',
          completedAt: '',
          disposalMethod: 'DAU',
          controlledPaperNo: '',
          refrigeratorNo: '',
          signatures: { operator: '', reviewer: '', auditor: '' },
        },
      }];

      // 预置一个"录入中"的格子作为演示
      ensureCellExec('A-3').status = 'in_progress';
      ensureCellExec('A-3').substance = 'IS-01';
      ensureCellExec('A-3').volume = 50;
      ensureCellExec('A-3').unit = 'μL';
      ensureCellExec('A-3').scanned = true;
      ensureCellExec('A-3').errors = [];
    }
  }

  // 3. Sheet mock 数据自动加载已移除，改为通过「加载测试数据」按钮手动触发
}

// ── Sheet Mock 加载（手动触发）─────────────────────────────────
function sheetMockAvailable(): boolean {
  if (workspaceForms.value.length > 0) return false;
  if (!taskId || task.value || planCode) return false;
  return !!dailySheets.find((s: any) => s.id === taskId && s.status !== 'submitted');
}

function loadSheetMock() {
  const sheet = dailySheets.find((s: any) => s.id === taskId);
  if (!sheet || sheet.status === 'submitted') return;
  const tpl = formTemplates.find((f: FormTemplateRecord) => f.templateName === '预处理记录表') ?? null;
  if (!tpl) return;
  const mockOps: Record<string, SequenceOperation[]> = {
    'A-1': [{ id: 'sheet-plan-1', action: '核对样品编号', substance: 'BL-2026-003-01', sampleId: '基质效应样品', volume: 0, unit: 'μL', scanned: false, equipment: '扫码枪', scanObject: 'sample', required: true, step: '步骤一', note: '对照实验单核对样品编号' }],
    'A-2': [{ id: 'sheet-plan-2', action: '加入内标工作液', substance: 'IS-WS-001', sampleId: '内标工作液', volume: 50, unit: 'μL', scanned: false, equipment: '移液器-001', scanObject: 'reagent', required: true, step: '步骤二', note: '加入内标至样品管' }],
    'A-3': [{ id: 'sheet-plan-3', action: '加入沉淀剂', substance: '乙腈/甲醇', sampleId: '沉淀剂', volume: 400, unit: 'μL', scanned: false, equipment: '移液器-001', scanObject: 'reagent', required: true, step: '步骤三', note: '涡旋振荡 30s' }],
    'A-4': [{ id: 'sheet-plan-4', action: '离心条件确认', substance: '—', sampleId: '离心管', volume: 0, unit: 'rpm', scanned: false, equipment: '离心机-001', scanObject: 'device', required: true, step: '步骤四', note: '4000rpm, 10min, 4℃' }],
    'A-5': [{ id: 'sheet-plan-5', action: '取上清液', substance: '上清液', sampleId: '预处理样品', volume: 350, unit: 'μL', scanned: false, equipment: '移液器-001', scanObject: 'consumable', required: true, step: '步骤五', note: '小心转移上清液至新管' }],
    'A-6': [{ id: 'sheet-plan-6', action: '复溶', substance: '复溶液', sampleId: '复溶缓冲液', volume: 150, unit: 'μL', scanned: false, equipment: '移液器-002', scanObject: 'reagent', required: true, step: '步骤六', note: '涡旋 1min' }],
    'B-1': [{ id: 'sheet-plan-7', action: '核对对照样品编号', substance: 'BL-2026-003-QC', sampleId: '质控样品', volume: 0, unit: 'μL', scanned: false, equipment: '扫码枪', scanObject: 'sample', required: true, step: '步骤一', note: '质控样品编号核对' }],
    'B-4': [{ id: 'sheet-plan-8', action: '离心条件确认', substance: '—', sampleId: '离心管', volume: 0, unit: 'rpm', scanned: false, equipment: '离心机-001', scanObject: 'device', required: true, step: '步骤四', note: '4000rpm, 10min, 4℃' }],
    'B-6': [{ id: 'sheet-plan-9', action: '记录处理时间', substance: '—', sampleId: '处理时间记录', volume: 0, unit: 'min', scanned: false, equipment: '记录表', scanObject: 'consumable', required: true, step: '步骤六', note: '记录预处理开始和结束时间' }],
  };

  const cells: SequenceCell[] = [];
  for (const row of ['A', 'B']) {
    for (let col = 0; col < 12; col++) {
      const colNum = col + 1;
      cells.push({ row, col: colNum, operations: mockOps[`${row}-${colNum}`] ?? [], selected: false });
    }
  }

  workspaceForms.value = [{
    itemId: sheet.itemCode ?? 'ITEM',
    templateId: tpl.id,
    instanceId: `${sheet.id}-BA-SBR01-EXEC`,
    template: tpl,
    cells,
    recordModel: {
      context: { projectCode: 'EXP-2026-010' },
      sampleBatch: sheet.sampleBatch,
      investigator: sheet.investigator,
      instrument: sheet.instrument,
      stepVersion: sheet.stepVersion,
      completedAt: '',
    },
  }];

  ensureCellExec('A-3').status = 'in_progress';
  ensureCellExec('A-3').substance = '乙腈/甲醇';
  ensureCellExec('A-3').volume = 400;
  ensureCellExec('A-3').unit = 'μL';
  ensureCellExec('A-3').scanned = false;
  ensureCellExec('A-3').errors = [];
}

// ── 操作 ─────────────────────────────────────────────────────────
function markCellDone() {
  if (!selectedCellKey.value) return;
  const data = ensureCellExec(selectedCellKey.value);
  data.status = 'pass';
  data.errors = [];
  saveDraft();
}

function saveDraft() {
  const draft = {
    planCode,
    taskId,
    cellExecData: cellExecDataMap.value,
    activeFormIndex: activeFormIndex.value,
    activeCellKey: activeCellKey.value,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(draftKey, JSON.stringify(draft));
  const allDrafts = JSON.parse(localStorage.getItem('exec-drafts-index') ?? '[]') as string[];
  if (!allDrafts.includes(draftKey)) allDrafts.push(draftKey);
  localStorage.setItem('exec-drafts-index', JSON.stringify(allDrafts));
  alert('草稿已保存');
}

function submitExecution() {
  if (!allCellsCompleted.value) {
    alert(`尚有 ${totalConfiguredCells.value - completedCellCount.value} 个格子未完成，请完成后提交复核`);
    return;
  }
  alert('提交复核成功（模拟）');
}

function goBack() {
  router.push(`/experiments/plans/${planCode}/tasks`);
}

// ── 异常提交 ───────────────────────────────────────────────────────
const showExceptionDrawer = ref(false);
const exceptionForm = ref({
  type: '',
  reason: '',
  affectsNext: false,
  needsRetake: false,
  pauseTask: false,
  handling: '',
});

interface ExceptionRecord {
  id: string;
  type: string;
  reason: string;
  cell: string;
  step: string;
  affectsNext: boolean;
  needsRetake: boolean;
  handling: string;
  status: 'submitted' | 'pending' | 'approved' | 'rejected' | 'closed';
  createdAt: string;
}

const exceptionRecords = ref<ExceptionRecord[]>([
  {
    id: 'EX-001',
    type: '加样错误',
    reason: '移液器校准过期，加入体积偏差约±15%',
    cell: 'A-3',
    step: '步骤三：加入沉淀剂',
    affectsNext: true,
    needsRetake: true,
    handling: '暂停当前任务',
    status: 'approved',
    createdAt: '2026-09-03 14:30:00',
  },
]);

const exceptionTypes = [
  { value: '操作错误', label: '操作错误' },
  { value: '扫码错误', label: '扫码错误' },
  { value: '加样错误', label: '加样错误' },
  { value: '样品错误', label: '样品错误' },
  { value: '设备错误', label: '设备错误' },
  { value: '计算错误', label: '计算错误' },
  { value: '结果异常', label: '结果异常' },
  { value: '其他', label: '其他' },
];

const exceptionHandlingOptions = [
  { value: 'continue_flag', label: '继续执行并标记偏差' },
  { value: 'pause', label: '暂停当前任务' },
  { value: 'retake', label: '重新录入该格子' },
  { value: 'review', label: '提交复核' },
];

function openExceptionDrawer() {
  showExceptionDrawer.value = true;
  exceptionForm.value = { type: '', reason: '', affectsNext: false, needsRetake: false, pauseTask: false, handling: '' };
}

function getSelectedCellPlanDisplay(): string {
  if (!selectedCell.value) return '';
  return selectedCell.value.operations.map(op =>
    `${op.action}：${op.substance || '—'} ${op.volume ?? '—'}${op.unit || ''} ${op.equipment || ''}`
  ).join('；');
}

function getSelectedCellActualDisplay(): string {
  if (!selectedCell.value) return '';
  const data = getCellExecData();
  return `${data.substance || '—'} ${data.volume ?? '—'}${data.unit || ''} ${data.equipment || ''}`;
}

function submitException() {
  if (!exceptionForm.value.type || !exceptionForm.value.reason.trim()) {
    alert('请填写异常类型和异常原因');
    return;
  }
  const record: ExceptionRecord = {
    id: `EX-${String(exceptionRecords.value.length + 1).padStart(3, '0')}`,
    type: exceptionForm.value.type,
    reason: exceptionForm.value.reason,
    cell: selectedCellLabel.value || '未选择',
    step: currentStepData.value?.action?.slice(0, 30) || '—',
    affectsNext: exceptionForm.value.affectsNext,
    needsRetake: exceptionForm.value.needsRetake,
    handling: exceptionForm.value.handling,
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
  exceptionRecords.value.unshift(record);

  // 标记当前格子为异常状态
  if (selectedCellKey.value) {
    ensureCellExec(selectedCellKey.value).status = 'fail';
    ensureCellExec(selectedCellKey.value).errors = [`异常：${record.type}`];
  }

  showExceptionDrawer.value = false;
  alert(`异常「${record.id}」已提交，等待审批`);
}

// ── 方法更新申请 ───────────────────────────────────────────────────
const showMethodUpdateDrawer = ref(false);
const methodUpdateForm = ref({
  newMethodName: '',
  newMethodVersion: '',
  newMethodDesc: '',
  scope: 'current' as string,
  crossProject: 'no' as string,
  reason: '',
  reasons: [] as string[],
  affectedScope: [] as string[],
  riskLevel: 'low' as string,
  notes: '',
});

interface MethodUpdateRecord {
  id: string;
  oldMethod: string;
  oldVersion: string;
  newMethod: string;
  newVersion: string;
  reason: string;
  scope: string[];
  riskLevel: string;
  status: 'submitted' | 'pending' | 'approved' | 'rejected' | 'closed';
  createdAt: string;
}

const methodUpdateRecords = ref<MethodUpdateRecord[]>([
  {
    id: 'MU-001',
    oldMethod: 'BRH-MN-202506059',
    oldVersion: 'VAL1',
    newMethod: 'BRH-MN-202506059',
    newVersion: 'VAL2',
    reason: '原积分方法对低浓度峰响应不佳，新算法提升定量下限灵敏度',
    scope: ['当前任务', '整个项目后续任务'],
    riskLevel: 'medium',
    status: 'pending',
    createdAt: '2026-09-02 10:15:00',
  },
]);

const methodUpdateReasons = [
  { value: '积分方法需调整', label: '积分方法需调整' },
  { value: '计算方法需优化', label: '计算方法需优化' },
  { value: '处理方法不适用', label: '处理方法不适用' },
  { value: '判定标准需更新', label: '判定标准需更新' },
  { value: '新验证结果支持', label: '新验证结果支持' },
];

const methodUpdateScopeOptions = [
  { value: 'current_cell', label: '仅当前格子' },
  { value: 'current_task', label: '当前任务' },
  { value: 'current_template', label: '当前模板实例' },
  { value: 'project_all', label: '整个项目后续任务' },
];

function openMethodUpdateDrawer() {
  showMethodUpdateDrawer.value = true;
  methodUpdateForm.value = {
    newMethodName: '', newMethodVersion: '', newMethodDesc: '',
    scope: 'current', crossProject: 'no', reason: '',
    reasons: [],
    affectedScope: [], riskLevel: 'low', notes: '',
  };
}

function submitMethodUpdate() {
  if (!methodUpdateForm.value.newMethodName || !methodUpdateForm.value.reason.trim()) {
    alert('请填写新方法名称和更新原因');
    return;
  }
  const record: MethodUpdateRecord = {
    id: `MU-${String(methodUpdateRecords.value.length + 1).padStart(3, '0')}`,
    oldMethod: task.value?.methodCode || '—',
    oldVersion: task.value?.methodVersion || '—',
    newMethod: methodUpdateForm.value.newMethodName,
    newVersion: methodUpdateForm.value.newMethodVersion || '—',
    reason: methodUpdateForm.value.reason,
    scope: methodUpdateForm.value.affectedScope,
    riskLevel: methodUpdateForm.value.riskLevel,
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
  methodUpdateRecords.value.unshift(record);
  showMethodUpdateDrawer.value = false;
  alert(`方法更新申请「${record.id}」已提交，状态：待审批`);
}

onMounted(() => {
  loadWorkspaceState();
  // 恢复草稿
  const draftKey = `exec-draft::${taskId}`;
  const raw = localStorage.getItem(draftKey);
  if (raw) {
    try {
      const draft = JSON.parse(raw);
      if (draft.cellExecData) cellExecDataMap.value = draft.cellExecData;
      if (draft.activeFormIndex !== undefined) activeFormIndex.value = draft.activeFormIndex;
      if (draft.activeCellKey) activeCellKey.value = draft.activeCellKey;
    } catch { /* ignore */ }
  }
});
</script>

<style scoped>
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.2s ease-out;
}
</style>
