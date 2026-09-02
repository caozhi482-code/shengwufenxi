<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full min-w-[1520px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col class="w-[12%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
        <col class="w-[12%]" />
        <col class="w-[12%]" />
        <col class="w-[10%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="mx-title" colspan="9">
            <div class="flex items-center justify-between gap-3">
              <div class="text-[26px] font-bold">含基质样品配制表</div>
              <div class="text-[16px] font-medium">BA-SBR06 / 3V</div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">项目编号</td>
          <td class="mx-cell" colspan="3">&nbsp;</td>
          <td class="mx-label" colspan="2">方法版本号</td>
          <td class="mx-cell" colspan="2">&nbsp;</td>
        </tr>

        <tr>
          <td class="mx-section" colspan="9">主表格区</td>
        </tr>
        <tr>
          <td class="mx-label text-center">样品代码</td>
          <td class="mx-label text-center" colspan="3">源溶液信息</td>
          <td class="mx-label text-center">空白基质体积(μL)</td>
          <td class="mx-label text-center">终体积(μL)</td>
          <td class="mx-label text-center">空白基质编号</td>
          <td class="mx-label text-center">最终浓度(ng/mL)</td>
          <td class="mx-label text-center">操作</td>
        </tr>
        <tr>
          <td class="mx-subhead">样品代码</td>
          <td class="mx-subhead">代码</td>
          <td class="mx-subhead">浓度(ng/mL)</td>
          <td class="mx-subhead">体积(μL)</td>
          <td class="mx-subhead">空白基质体积(μL)</td>
          <td class="mx-subhead">终体积(μL)</td>
          <td class="mx-subhead">空白基质编号</td>
          <td class="mx-subhead">最终浓度(ng/mL)</td>
          <td class="mx-subhead">记录</td>
        </tr>
        <tr v-for="rowIndex in blankRowCount" :key="rowIndex" class="h-[58px]">
          <td class="mx-cell bg-[#f3efe0]"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
          <td class="mx-cell"></td>
        </tr>
      </tbody>
    </table>

    <table class="mt-4 w-full min-w-[1360px] border-collapse table-fixed text-[13px] text-[--text-main]">
      <colgroup>
        <col v-for="n in 12" :key="n" class="w-[8.33%]" />
      </colgroup>
      <tbody>
        <tr>
          <td class="mx-section" colspan="12">底部配制追溯区</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">源溶液批号</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
          <td class="mx-label" colspan="2">剩余空白基质</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">移液器编号：IE-Pipe-</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
          <td class="mx-label" colspan="2">容器材质</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">容器颜色</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
          <td class="mx-label" colspan="2">制备条件</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">该批样品批号</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
          <td class="mx-label" colspan="2">配制完成时间</td>
          <td class="mx-cell" colspan="4">&nbsp;</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="2">样品处置方式</td>
          <td class="mx-cell" colspan="10">&nbsp;</td>
        </tr>
        <tr>
          <td class="mx-note" colspan="12">&nbsp;</td>
        </tr>

        <tr>
          <td class="mx-section" colspan="12">签字区</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="3">操作人 / 日期</td>
          <td class="mx-cell" colspan="3">&nbsp;</td>
          <td class="mx-label" colspan="3">现场复核人 / 日期</td>
          <td class="mx-cell" colspan="3">&nbsp;</td>
        </tr>
        <tr>
          <td class="mx-label" colspan="3">审核人 / 日期</td>
          <td class="mx-cell" colspan="9">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: unknown;
  editable?: boolean;
}>(), {
  editable: false,
});

const blankRowCount = 3;
</script>

<style scoped>
.mx-cell,
.mx-label,
.mx-section,
.mx-title,
.mx-subhead,
.mx-note {
  border: 1px solid #222;
  padding: 9px 10px;
  vertical-align: middle;
  background: #fff;
}

.mx-title {
  text-align: center;
}

.mx-section,
.mx-label,
.mx-subhead {
  font-weight: 600;
  background: #f7f5ee;
}

.mx-section {
  font-size: 16px;
  text-align: left;
}

.mx-note {
  min-height: 52px;
  background: #fffdf6;
}
</style>
