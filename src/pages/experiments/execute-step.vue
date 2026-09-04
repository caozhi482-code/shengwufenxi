<template>
  <div class="h-[calc(100vh-64px)] flex flex-col bg-[--surface]">
    <!-- 顶部固定信息条 -->
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
          <div class="w-px h-9 bg-[--border]" />
          <div>
            <div class="text-[10px] text-[--muted-foreground] leading-none mb-1">关联模板</div>
            <div class="text-sm font-medium text-[--text-main]">{{ templateNames.join('、') || '—' }}</div>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <div class="text-xs text-[--muted-foreground]">
            已完成 <span class="text-[--success] font-semibold">{{ completedCellCount }}</span> /
            <span class="font-semibold">{{ totalConfiguredCells }}</span> 格
          </div>
          <div class="w-px h-5 bg-[--border]" />
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
        <span class="text-xs text-[--muted-foreground]">当前：{{ activeCellKey ? activeCellKey : '未选择格子' }}</span>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="flex-1 flex gap-5 p-5 overflow-hidden">
      <!-- 左侧：导航 -->
      <aside class="w-[220px] shrink-0 flex flex-col gap-4 overflow-y-auto">
        <!-- 模板实例列表 -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[--foreground]">模板实例</span>
              <BaseTag :label="`${workspaceForms.length}`" tone="info" />
            </div>
          </template>
          <div class="space-y-1.5">
            <div
              v-for="(form, fi) in workspaceForms"
              :key="form.instanceId"
              class="rounded-lg border px-3 py-2.5 cursor-pointer transition-all"
              :class="activeFormIndex === fi ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] hover:border-[--primary-border]'"
              @click="activeFormIndex = fi"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-[--text-main] truncate flex-1">{{ form.template?.templateName ?? '模板实例' }}</span>
                <BaseTag :label="form.template?.previewMode === 'plate' ? '孔板' : '表格'" tone="neutral" />
              </div>
              <div class="text-[10px] text-[--muted-foreground] font-mono">{{ form.instanceId.slice(-10) }}</div>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-[10px] text-[--success]">✓ {{ formCellCompletedCount(form) }}</span>
                <span class="text-[10px] text-[--danger]">✕ {{ formCellFailedCount(form) }}</span>
                <span class="text-[10px] text-[--muted-foreground]">共 {{ totalCellsInForm(form) }} 格</span>
              </div>
            </div>
            <div v-if="workspaceForms.length === 0" class="text-xs text-[--muted-foreground] text-center py-4">
              暂无模板实例数据<br /><span class="text-[10px]">请先在计划编辑中配置模板</span>
            </div>
          </div>
        </BaseCard>

        <!-- 方法步骤导航 -->
        <BaseCard>
          <template #header>
            <span class="text-sm font-bold text-[--foreground]">方法步骤</span>
          </template>
          <div class="space-y-1.5 max-h-[280px] overflow-y-auto">
            <div
              v-for="(step, i) in methodSteps"
              :key="step.id"
              :class="['p-2.5 rounded-lg border cursor-pointer transition-all',
                activeStepIndex === i ? 'border-[--primary] bg-[--primary-soft]' : 'border-[--border] hover:border-[--primary-border]']"
              @click="activeStepIndex = i"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="w-5 h-5 rounded-full bg-[--primary] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{{ i + 1 }}</span>
                <span class="text-xs font-semibold text-[--text-main] truncate">{{ step.action.slice(0, 18) }}{{ step.action.length > 18 ? '…' : '' }}</span>
              </div>
              <div v-if="step.expected.length" class="text-[10px] text-[--warning] ml-7">
                {{ step.expected.map(e => `${e.value}${e.unit}`).join('、') }}
              </div>
            </div>
            <div v-if="methodSteps.length === 0" class="text-xs text-[--muted-foreground] text-center py-3">
              暂无方法步骤
            </div>
          </div>
        </BaseCard>

        <!-- 状态图例 -->
        <BaseCard>
          <template #header><span class="text-sm font-bold text-[--foreground]">状态图例</span></template>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded border-2 border-[--border] bg-[--surface-muted] shrink-0" />
              <span class="text-[--muted-foreground]">未开始（无计划配置）</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded border-2 border-[--primary-border] bg-[--primary-soft] shrink-0" />
              <span class="text-[--primary]">已选中</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-[--success] shrink-0" />
              <span class="text-[--success]">比对通过</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-[--danger] shrink-0" />
              <span class="text-[--danger]">比对失败</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-[--warning] shrink-0" />
              <span class="text-[--warning]">录入中</span>
            </div>
          </div>
        </BaseCard>
      </aside>

      <!-- 中间：模板格子工作区 -->
      <main class="flex-1 overflow-y-auto">
        <div v-if="!activeForm" class="h-full flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-4">🧪</div>
            <div class="text-sm font-medium text-[--text-main]">请选择左侧模板实例</div>
            <div class="text-xs text-[--muted-foreground] mt-1">从左侧列表选择一个模板实例，查看格子执行状态</div>
          </div>
        </div>
        <div v-else-if="activeForm.template?.previewMode === 'plate'" class="h-full flex flex-col">
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
                <BaseTag tone="info" label="计划指令悬停查看" />
              </div>
            </div>
          </div>
          <div class="flex-1 bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-4 overflow-auto">
            <SequenceGrid
              :cells="gridCells"
              :read-only="true"
              :active-key="activeCellKey"
              @cell-select="onCellSelect"
            />
          </div>
        </div>
        <div v-else class="bg-white border border-[--border] rounded-[--radius-lg] shadow-[var(--shadow-card)] p-8">
          <div class="text-center py-12">
            <div class="text-3xl mb-3">📋</div>
            <div class="text-sm font-bold text-[--text-main] mb-1">{{ activeForm.template?.templateName }}</div>
            <div class="text-xs text-[--muted-foreground] mb-4">该模板为表格类型，无格子配置</div>
            <div class="text-xs text-[--muted-foreground]">可通过右侧面板查看执行录入</div>
          </div>
        </div>
      </main>

      <!-- 右侧：执行详情面板 -->
      <aside class="w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto">
        <!-- 当前格子信息 -->
        <BaseCard v-if="selectedCell">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[--foreground]">格子 {{ selectedCellKey }}</span>
              <BaseTag
                :label="getCellExecutionState(selectedCellKey).statusLabel"
                :tone="getCellExecutionState(selectedCellKey).statusTone"
              />
            </div>
          </template>

          <!-- 计划指令区 -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1 h-4 bg-[--warning] rounded-full" />
              <span class="text-xs font-bold text-[--text-main]">计划指令</span>
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
                  <div v-if="op.note"><span class="text-[--text-main]">备注：</span>{{ op.note }}</div>
                  <div v-if="op.required" class="col-span-2"><span class="text-[--danger]">* 必填项</span></div>
                </div>
              </div>
              <div v-if="selectedCell.operations.length === 0" class="text-xs text-[--muted-foreground] py-2 text-center">
                该格子暂无计划配置
              </div>
            </div>
          </div>

          <!-- 实际执行区 -->
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1 h-4 bg-[--primary] rounded-full" />
              <span class="text-xs font-bold text-[--text-main]">实际执行</span>
            </div>
            <div class="space-y-2">
              <!-- 扫码比对 -->
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
                <!-- 物质/样品 -->
                <div v-if="op.substance" class="mb-1.5">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">样品 / 物质</div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-[--text-main]">{{ op.substance }}</span>
                    <span v-if="getCellExecData().substance !== op.substance && getCellExecData().substance" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().substance }}
                    </span>
                  </div>
                </div>
                <!-- 样品编号 -->
                <div v-if="op.sampleId" class="mb-1.5">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">样品编号</div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-[--text-main]">{{ op.sampleId }}</span>
                    <span v-if="getCellExecData().sampleId !== op.sampleId && getCellExecData().sampleId" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().sampleId }}
                    </span>
                  </div>
                </div>
                <!-- 加入量 -->
                <div v-if="op.volume !== undefined" class="mb-1.5">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">加入量</div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-[--text-main]">{{ op.volume }}{{ op.unit }}</span>
                    <span v-if="getCellExecData().volume !== op.volume && getCellExecData().volume !== undefined" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().volume }}{{ getCellExecData().unit || op.unit }}
                    </span>
                    <span v-if="getCellExecData().volume === op.volume && getCellExecData().volume !== undefined" class="text-[10px] text-[--success]">
                      ✓ {{ getCellExecData().volume }}{{ op.unit }}
                    </span>
                  </div>
                </div>
                <!-- 设备 -->
                <div v-if="op.equipment" class="mb-1.5">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">设备编号</div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-[--text-main]">{{ op.equipment }}</span>
                    <span v-if="getCellExecData().equipment !== op.equipment && getCellExecData().equipment" class="text-[10px] text-[--danger]">
                      → {{ getCellExecData().equipment }}
                    </span>
                    <span v-if="getCellExecData().equipment === op.equipment" class="text-[10px] text-[--success]">✓ 匹配</span>
                  </div>
                </div>
                <!-- 扫码状态 -->
                <div v-if="op.scanObject" class="mb-1.5">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">扫码对象</div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-[--text-main]">{{ op.scanObject }}</span>
                    <span v-if="getCellExecData().scanned" class="text-[10px] text-[--success]">✓ 已扫码</span>
                    <span v-else class="text-[10px] text-[--warning]">△ 未扫码</span>
                  </div>
                </div>
                <!-- 备注 -->
                <div v-if="op.note" class="mb-1.5">
                  <div class="text-[10px] text-[--muted-foreground] mb-0.5">计划备注</div>
                  <div class="text-xs text-[--muted-foreground]">{{ op.note }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实际录入表单 -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1 h-4 bg-[--info] rounded-full" />
              <span class="text-xs font-bold text-[--text-main]">录入实际操作</span>
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
              <BaseCheckbox
                :checked="getCellExecData().scanned"
                @update:checked="v => { getCellExecData().scanned = v; onCellDataChange(); }"
              />
              <span class="text-xs text-[--text-main]">扫码已确认</span>
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
            <div class="text-sm font-bold text-[--text-main]">选择格子开始执行</div>
            <div class="text-xs text-[--muted-foreground] leading-relaxed">
              在左侧格子图中点击任意格子<br />查看计划指令并录入实际执行数据
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
              <span v-if="activeCellKey" class="text-[--text-main] font-medium">{{ activeCellKey }}</span>
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
import { tasks } from '@/api/mock/tasks';
import { formTemplates } from '@/api/mock/form-templates';
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
};

// ── 路由 & 任务 ──────────────────────────────────────────────────
const route = useRoute();
const router = useRouter();
const taskId = (route.params.taskId as string) || '';
const planCode = (route.query.planCode as string) || '';
const projectId = (route.query.projectId as string) || '';

const task = computed<Task | undefined>(() => tasks.find((t: any) => t.id === taskId));
const effectiveTaskId = taskId;

// ── 方法步骤 ─────────────────────────────────────────────────────
const methodSteps = computed<TaskStep[]>(() => task.value?.steps ?? []);
const activeStepIndex = ref(0);
const currentStepData = computed(() => methodSteps.value[activeStepIndex.value] ?? null);

// ── 模板实例 & 工作区 ────────────────────────────────────────────
const workspaceForms = ref<WorkspaceForm[]>([]);
const activeFormIndex = ref(0);
const templateNames = computed(() =>
  workspaceForms.value.map(f => f.template?.templateName).filter(Boolean)
);

const activeForm = computed<WorkspaceForm | null>(() => workspaceForms.value[activeFormIndex.value] ?? null);

// ── 格子执行状态 map ────────────────────────────────────────────
const cellExecDataMap = ref<Record<string, CellExecData>>({});

function getCellKey(row: string, col: number): string {
  return `${row}-${col}`;
}

function getCellExecData(): CellExecData {
  if (!selectedCellKey.value) return emptyExecData();
  const key = selectedCellKey.value;
  if (!cellExecDataMap.value[key]) {
    cellExecDataMap.value[key] = emptyExecData();
  }
  return cellExecDataMap.value[key]!;
}

function emptyExecData(): CellExecData {
  return { scanned: false, status: 'pending', errors: [] };
}

function ensureCellExec(key: string): CellExecData {
  if (!cellExecDataMap.value[key]) {
    cellExecDataMap.value[key] = emptyExecData();
  }
  return cellExecDataMap.value[key]!;
}

// ── 格子选中 ─────────────────────────────────────────────────────
const activeCellKey = ref<string | null>(null);

const selectedCell = computed<SequenceCell | null>(() => {
  if (!activeCellKey.value || !activeForm.value) return null;
  const [row, colStr] = activeCellKey.value.split('-');
  const col = parseInt(colStr, 10);
  return activeForm.value.cells.find(c => c.row === row && c.col === col) ?? null;
});

const selectedCellKey = computed(() => activeCellKey.value);

function onCellSelect(row: string, col: number) {
  activeCellKey.value = getCellKey(row, col);
}

// ── 格子数据变化回调 ─────────────────────────────────────────────
function onCellDataChange() {
  if (!selectedCellKey.value) return;
  const data = getCellExecData();
  data.status = 'in_progress';
  data.errors = validateCell(selectedCell.value!, data);
  if (data.errors.length === 0 && hasAnyPlanOp) {
    data.status = 'pass';
  } else if (data.errors.length > 0) {
    data.status = 'fail';
  }
}

// ── 比对逻辑 ─────────────────────────────────────────────────────
function validateCell(cell: SequenceCell, data: CellExecData): string[] {
  const errors: string[] = [];
  for (const op of cell.operations) {
    if (op.substance && data.substance && data.substance !== op.substance) {
      errors.push(`物质不匹配：计划「${op.substance}」 vs 实际「${data.substance}」`);
    }
    if (op.sampleId && data.sampleId && data.sampleId !== op.sampleId) {
      errors.push(`样品编号不匹配：计划「${op.sampleId}」 vs 实际「${data.sampleId}」`);
    }
    if (op.volume !== undefined && data.volume !== undefined && data.volume !== op.volume) {
      errors.push(`加入量不匹配：计划「${op.volume}${op.unit}」 vs 实际「${data.volume}${data.unit || op.unit}」`);
    }
    if (op.equipment && data.equipment && data.equipment !== op.equipment) {
      errors.push(`设备编号不匹配：计划「${op.equipment}」 vs 实际「${data.equipment}」`);
    }
  }
  if (data.scanned && cell.operations.some(op => op.scanObject)) {
    // 扫码确认
  }
  return errors;
}

function compareOpResult(op: SequenceOperation): 'pass' | 'fail' | 'pending' {
  const data = getCellExecData();
  if (data.status === 'pending') return 'pending';
  if (data.status === 'pass') return 'pass';
  if (data.status === 'fail') return 'fail';
  return 'pending';
}

// ── 格子状态统计 ─────────────────────────────────────────────────
const hasAnyPlanOp = computed(() => activeForm.value?.cells.some(c => c.operations.length > 0) ?? false);

function formCellCompletedCount(form: WorkspaceForm): number {
  return form.cells.filter(c => {
    const key = getCellKey(c.row, c.col);
    return ensureCellExec(key).status === 'pass';
  }).length;
}

function formCellFailedCount(form: WorkspaceForm): number {
  return form.cells.filter(c => {
    const key = getCellKey(c.row, c.col);
    return ensureCellExec(key).status === 'fail';
  }).length;
}

function totalCellsInForm(form: WorkspaceForm): number {
  return form.cells.filter(c => c.operations.length > 0).length;
}

const completedCellCount = computed(() =>
  Object.values(cellExecDataMap.value).filter(d => d.status === 'pass').length
);

const inProgressCellCount = computed(() =>
  Object.values(cellExecDataMap.value).filter(d => d.status === 'in_progress').length
);

const failedCellCount = computed(() =>
  Object.values(cellExecDataMap.value).filter(d => d.status === 'fail').length
);

const totalConfiguredCells = computed(() =>
  workspaceForms.value.reduce((sum, f) => sum + f.cells.filter(c => c.operations.length > 0).length, 0)
);

const progressPercent = computed(() => {
  if (totalConfiguredCells.value === 0) return 0;
  return Math.round(completedCellCount.value / totalConfiguredCells.value * 100);
});

const allCellsCompleted = computed(() =>
  totalConfiguredCells.value > 0 && completedCellCount.value === totalConfiguredCells.value
);

const gridCells = computed<SequenceCell[]>(() => {
  if (!activeForm.value) return [];
  return activeForm.value.cells.map(cell => {
    const key = getCellKey(cell.row, cell.col);
    const exec = ensureCellExec(key);
    // 返回原格子，状态通过外部样式控制
    return cell;
  });
});

const cellStatusSummaryLabel = computed(() => {
  if (totalConfiguredCells.value === 0) return '无配置';
  if (allCellsCompleted.value) return '全部完成';
  if (completedCellCount.value === 0) return '待开始';
  return `${completedCellCount.value}/${totalConfiguredCells.value} 完成`;
});

const cellStatusSummaryTone = computed((): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (allCellsCompleted.value) return 'success';
  if (failedCellCount.value > 0) return 'danger';
  if (completedCellCount.value > 0) return 'warning';
  return 'neutral';
});

function getCellExecutionState(key: string): { statusLabel: string; statusTone: 'success' | 'warning' | 'danger' | 'neutral' } {
  const data = cellExecDataMap.value[key];
  if (!data) return { statusLabel: '未开始', statusTone: 'neutral' };
  const map = {
    pending: { label: '未开始', tone: 'neutral' as const },
    in_progress: { label: '录入中', tone: 'warning' as const },
    pass: { label: '比对通过', tone: 'success' as const },
    fail: { label: '比对失败', tone: 'danger' as const },
  };
  return map[data.status] ?? map.pending;
}

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
          return { ...form, template: tpl } as WorkspaceForm;
        });
      if (matchingForms.length > 0) {
        workspaceForms.value = matchingForms;
        break;
      }
    } catch { /* ignore */ }
  }
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
    activeFormIndex,
    activeCellKey,
    savedAt: new Date().toISOString(),
  };
  const draftKey = `exec-draft::${taskId}`;
  localStorage.setItem(draftKey, JSON.stringify(draft));
  // 同时存到全局可检索位置
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
