<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="160px">
         <el-form-item label="ログインIP" prop="ipaddr">
            <el-input
               v-model="queryParams.ipaddr"
               placeholder="ログインIPを入力してください"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ユーザー名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザー名を入力してください"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="登録ステータス"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_common_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="時間" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD HH:mm:ss"
               type="daterange"
               range-separator="-"
               start-placeholder="開始日"
               end-placeholder="終了日"
               :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:logininfor:remove']"
            > 削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               @click="handleClean"
               v-hasPermi="['monitor:logininfor:remove']"
            >クリア</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Unlock"
               :disabled="single"
               @click="handleUnlock"
               v-hasPermi="['monitor:logininfor:unlock']"
            >ロック解除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:logininfor:export']"
            >出力</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table ref="logininforRef" v-loading="loading" :data="logininforList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="アクセス番号" align="center" prop="infoId" />
         <el-table-column label="ユーザー名" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
         <el-table-column label="住所" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
         <el-table-column label="オペレーティング·システム" align="center" prop="os" :show-overflow-tooltip="true" />
         <el-table-column label="ブラウザ" align="center" prop="browser" :show-overflow-tooltip="true" />
         <el-table-column label="登録ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="説明" align="center" prop="msg" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン時間" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />
   </div>
</template>

<script setup name="Logininfor">
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from "@/api/monitor/logininfor";

const { proxy } = getCurrentInstance();
const { sys_common_status } = proxy.useDict("sys_common_status");

const logininforList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const selectName = ref("");
const total = ref(0);
const dateRange = ref([]);
const defaultSort = ref({ prop: "loginTime", order: "descending" });

// クエリパラメーター
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
  status: undefined,
  orderByColumn: undefined,
  isAsc: undefined
});

/** クエリログインログリスト */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    logininforList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 検索ボタン */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 再読み込みボタン */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.pageNum = 1;
  proxy.$refs["logininforRef"].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** マルチ選択ボックスはデータを選択 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.infoId);
  multiple.value = !selection.length;
  single.value = selection.length != 1;
  selectName.value = selection.map(item => item.userName);
}
/** ソートトリガーイベント */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/**  削除ボタン */
function handleDelete(row) {
  const infoIds = row.infoId || ids.value;
  proxy.$modal.confirm('アクセス番号"' + infoIds + '"を削除してもよろしいでしょうか？').then(function () {
    return delLogininfor(infoIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除しました");
  }).catch(() => {});
}
/** 空のボタン */
function handleClean() {
  proxy.$modal.confirm("クリアしてよろしいでしょうか?").then(function () {
    return cleanLogininfor();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("クリアしました");
  }).catch(() => {});
}
/** ロック解除ボタン */
function handleUnlock() {
  const username = selectName.value;
  proxy.$modal.confirm('ユーザー"' + username + '"のロックを解除してよろしいでしょうか？').then(function () {
    return unlockLogininfor(username);
  }).then(() => {
    proxy.$modal.msgSuccess("ユーザー" + username + "のロックを解除しました");
  }).catch(() => {});
}
/** 出力ボタン操作 */
function handleExport() {
  proxy.download("monitor/logininfor/export", {
    ...queryParams.value,
  }, `config_${new Date().getTime()}.xlsx`);
}

getList();
</script>
