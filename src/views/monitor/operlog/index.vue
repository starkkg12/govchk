<template>
   <cardShadow>
      <template #header-title>
         利用履歴一覧
         <!-- K-1-1-1-->
      </template>
      <el-form :model="queryParams" ref="queryRef" :rules="searchRules" :inline="true" v-show="showSearch" label-width="100px">
         <el-row>
            <el-col :span="10">
               <el-form-item label="ユーザー" prop="keyWord">
                  <el-input
                     v-model="queryParams.keyWord"
                     placeholder="ユーザーを入力してください"
                     clearable
                     style="width: 240px;"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
            </el-col>
            <el-col :span="14" align="end" min-width="200px">
            <el-form-item>
               <el-button class="buttonShadow" icon="Refresh" @click="resetQuery">リセット</el-button>
               <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery">検索</el-button>
            </el-form-item>
            </el-col>
         </el-row>
         <el-row>
            <el-col :span="10" >
               <el-form-item label="操作日時" prop="createdStartTime" style="width: 100%">
                  <!-- <el-date-picker
                     v-model="dateRange"
                     value-format="YYYY-MM-DD HH:mm:ss"
                     type="daterange"
                     range-separator="-"
                     start-placeholder="開始日"
                     end-placeholder="終了日"
                     :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                  ></el-date-picker> -->
                  <el-date-picker clearable v-model="queryParams.beginTime" type="date" value-format="YYYY-MM-DD"
                     class="narrowDatePicker">
                     </el-date-picker>
                     <span style="padding: 0 6px;">～</span>
                     <el-date-picker clearable 
                       v-model="queryParams.endTime" type="date" 
                       value-format="YYYY-MM-DD"
                       min
                     class="narrowDatePicker">
                     </el-date-picker>
               </el-form-item>
            </el-col>
            <el-col :span="14" align="end" min-width="200px">
              <el-form-item>
                <el-button class="buttonShadow"
                    type="warning"
                    plain
                    icon="Download"
                    @click="handleExport(null)"
                >出力</el-button>
              </el-form-item>
            </el-col>
         </el-row>
      </el-form>
      <el-table ref="operlogRef" v-loading="loading" :data="operlogList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
         <el-table-column label="画面・機能" align="center" prop="title" :show-overflow-tooltip="true">
            <template #default="scope">
               <div style="width: 100%; text-align: left">{{ scope.row.title }} </div>
             </template>
         </el-table-column>
         <el-table-column label="アクション" align="center" prop="businessType">
            <template #default="scope">
               <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
            </template>
         </el-table-column>
         <el-table-column label="ユーザー" align="center" width="310" prop="operName" :show-overflow-tooltip="true" >
            <template #default="scope">
               <div style="width: 100%; text-align: left">{{ scope.row.operName }} </div>
             </template>
         </el-table-column>
         <el-table-column label="IP" align="center" prop="operIp">
            <template #default="scope">
               <div style="width: 100%; text-align: left">{{ scope.row.operIp }} </div>
             </template>
         </el-table-column>
         <el-table-column label="ステータス" align="center" prop="status">
            <template #default="scope">
               <div v-if="scope.row.status === 0">成功</div>
               <div v-else-if="scope.row.status === 1">失敗</div>
            </template>
         </el-table-column >
         <el-table-column label="操作日時" align="center" prop="operTime" width="180"  :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ parseTime(scope.row.operTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="詳細" align="center" prop="keyWord">
            <template #default="scope">
               <div style="width: 100%; text-align: left">{{ scope.row.keyWord }} </div>
            </template>
         </el-table-column >

      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 操作ログの詳細 -->
      <el-drawer  v-model="open" width="800px" append-to-body size="90%">
         <h1>利用履歴</h1>
         <el-form :model="form" >
            <el-row>
               <el-col :span="12">
                  <el-form-item label="アクション：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
                  <el-form-item
                    label="稼働IP："
                  >{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="稼働URL：">{{ form.operUrl }}</el-form-item>
                  <el-form-item label="リクエスト方法：">{{ form.requestMethod }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="アクション方法：">{{ form.method }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="リクエストパラメーター：">{{ form.operParam }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="パラメーターを返します：">{{ form.jsonResult }}</el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="アクションステータス：">
                     <div v-if="form.status === 0">正常</div>
                     <div v-else-if="form.status === 1">失敗</div>
                  </el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="実施時間：">{{ form.costTime }}ミリ秒</el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="稼働時間：">{{ parseTime(form.operTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="エラー情報：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button class="buttonShadow" @click="open = false">×　閉じる</el-button>
            </div>
         </template>
      </el-drawer>
</cardShadow>
</template>

<script setup name="Operlog">
import cardShadow from './../../../components/Customized/cardShadow.vue'
import { list, delOperlog, cleanOperlog } from "@/api/monitor/operlog";

const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  query: perms.indexOf('monitor:operlog:query') != -1 ? true : false,
  export: perms.indexOf('monitor:operlog:export') != -1 ? true : false
})

const { proxy } = getCurrentInstance();
const { sys_oper_type, sys_common_status } = proxy.useDict("sys_oper_type","sys_common_status");

const operlogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const defaultSort = ref({ prop: "operTime", order: "descending" });

const checkTime = (rule, value, callback) => {
   console.log(queryParams.value);
  if (queryParams.value.beginTime > queryParams.value.endTime) {
    return callback(new Error('「操作日時まで」に「操作日時から」より未来の日時を設定してください。'));
  } else {
    callback();
  }
};

const data = reactive({
  form: {

  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    operIp: undefined,
    title: undefined,
    keyWord: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined,
    beginTime: null,
    endTime: null
  },
  searchRules: {
   createdStartTime: [
      { validator: checkTime, message:"「提出日まで」に「提出日から」より未来の日時を設定してください。", trigger: "blur" }
    ],
  }
});

const { queryParams, form, searchRules } = toRefs(data);

/** クエリログインログ */
function getList() {
  loading.value = true;
  list(queryParams.value).then(response => {
    operlogList.value = response.rows;
    console.log(operlogList.value);
    total.value = response.total;
    loading.value = false;
  });
}
/** 操作ログのタイプ辞書 */
function typeFormat(row, column) {
  return proxy.selectDictLabel(sys_oper_type.value, row.businessType);
}
/** 検索ボタン */
function handleQuery() {
  queryParams.value.pageNum = 1;
  queryParams.value.beginTime = queryParams.value.beginTime !== undefined && queryParams.value.beginTime !== null ? 
                                 queryParams.value.beginTime.indexOf('00:00:00') <= -1 ?
                                   queryParams.value.beginTime + ' 00:00:00' :  queryParams.value.beginTime :
                                 null;
  queryParams.value.endTime = queryParams.value.endTime !== undefined && queryParams.value.endTime !== null? 
                                 queryParams.value.endTime.indexOf('23:59:59') <= -1 ?
                                   queryParams.value.endTime + ' 23:59:59' :  queryParams.value.endTime :  
                                 null;
   proxy.$refs["queryRef"].validate((valid) => {
      if (valid) {
         getList();
      }
   });
}
/** 再読み込みボタン */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.pageNum = 1;
  queryParams.value.beginTime = null;
  queryParams.value.endTime = null;
  proxy.$refs["operlogRef"].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** マルチ選択ボックスはデータを選択 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.operId);
  multiple.value = !selection.length;
}
/** ソートトリガーイベント */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 詳細ボタン */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/**  削除ボタン */
function handleDelete(row) {
  const operIds = row.operId || ids.value;
  proxy.$modal.confirm('操作ID"' + operIds + '"を削除してもよろしいでしょうか？').then(function () {
    return delOperlog(operIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除しました");
  }).catch(() => {});
}
/** 空のボタン */
function handleClean() {
  proxy.$modal.confirm("クリアしてよろしいでしょうか？").then(function () {
    return cleanOperlog();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("クリアしました");
  }).catch(() => {});
}
/** 出力ボタン */
function handleExport(operId) {
  if (operId === undefined || operId === null) {
   queryParams.value.beginTime = queryParams.value.beginTime !== undefined && queryParams.value.beginTime !== null ? 
                                 queryParams.value.beginTime.indexOf('00:00:00') <= -1 ?
                                   queryParams.value.beginTime + ' 00:00:00' :  queryParams.value.beginTime :
                                 null;
   queryParams.value.endTime = queryParams.value.endTime !== undefined && queryParams.value.endTime !== null? 
                                 queryParams.value.endTime.indexOf('23:59:59') <= -1 ?
                                   queryParams.value.endTime + ' 23:59:59' :  queryParams.value.endTime :  
                                 null;
  } else {
     queryParams.value.beginTime = null;
     queryParams.value.endTime = null;
     queryParams.value.operId = operId;
  }


  proxy.download("monitor/operlog/export",{
    ...queryParams.value,
  }, `利用履歴_${new Date().getTime()}.xlsx`);
}

getList();
</script>