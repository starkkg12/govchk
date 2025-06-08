<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="ジョブ名" prop="jobName">
            <el-input
               v-model="queryParams.jobName"
               placeholder="ジョブ名を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ジョブグループ名" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" placeholder="ジョブグループ名を選んでください" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="ジョブステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="ジョブステータスを選んでください" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">再読み込み</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['monitor:job:add']"
            ></el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['monitor:job:edit']"
            >更新</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:job:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:job:export']"
            >出力</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Operation"
               @click="handleJobLog"
               v-hasPermi="['monitor:job:query']"
            >ログ</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="ジョブ番号" width="100" align="center" prop="jobId" />
         <el-table-column label="ジョブ名" align="center" prop="jobName" :show-overflow-tooltip="true" />
         <el-table-column label="ジョブグループ名" align="center" prop="jobGroup">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column label="ターゲット" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column label="cron" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
         <el-table-column label="ステータス" align="center">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="アクション" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['monitor:job:edit']"></el-button>
               </el-tooltip>
               <el-tooltip content="削除" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:job:remove']"></el-button>
               </el-tooltip>
               <el-tooltip content="1回実行します" placement="top">
                  <el-button link type="primary" icon="CaretRight" @click="handleRun(scope.row)" v-hasPermi="['monitor:job:changeStatus']"></el-button>
               </el-tooltip>
               <el-tooltip content="ジョブ詳細" placement="top">
                  <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
               <el-tooltip content="操作ログ" placement="top">
                  <el-button link type="primary" icon="Operation" @click="handleJobLog(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
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

      !-- 追加または修正された定期的なジョブダイアログ -->
      <el-dialog :title="title" v-model="open" width="820px" append-to-body>
         <el-form ref="jobRef" :model="form" :rules="rules" label-width="180px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="ジョブ名" prop="jobName">
                     <el-input v-model="form.jobName" placeholder="ジョブ名を入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ジョブグループ" prop="jobGroup">
                     <el-select v-model="form.jobGroup" placeholder="選んでください">
                        <el-option
                           v-for="dict in sys_job_group"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item prop="invokeTarget" style="width: 50%;">
                     <template #label>
                        <span>
                           実行ターゲット
                           <el-tooltip placement="top">
                              <template #content>
                                 <div>
                                    Bean呼び出しの例：ryTask.ryParams('ry')
                                    <br />Class呼び出しの例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                                    <br />パラメータの説明: 文字列、ブール値、長整数、浮動小数点数、整数をサポートします
                                 </div>
                              </template>
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                        </span>
                     </template>
                     <el-input v-model="form.invokeTarget" placeholder="実行ターゲット文字列を入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="cronジョブスケジュール" prop="cronExpression">
                     <el-input v-model="form.cronExpression" placeholder="cronを入力してください">
                        <template #append>
                           <el-button type="primary" @click="handleShowCron">
                              スケジュール生成
                              <i class="el-icon-time el-icon--right"></i>
                           </el-button>
                        </template>
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.jobId !== undefined">
                  <el-form-item label="ステータス">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_job_status"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="16">
                  <el-form-item label="ミスファイアポリシー" prop="misfirePolicy">
                     <el-radio-group v-model="form.misfirePolicy">
                        <el-radio-button label="1">即時実行</el-radio-button>
                        <el-radio-button label="2">1回実行</el-radio-button>
                        <el-radio-button label="3">実行しない</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="同時実行" prop="concurrent" label-width="100px">
                     <el-radio-group v-model="form.concurrent">
                        <el-radio-button label="0">許可</el-radio-button>
                        <el-radio-button label="1">禁止</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確認</el-button>
               <el-button @click="cancel">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>

     <el-dialog title="Cronジョブスケジュール生成器" v-model="openCron" append-to-body destroy-on-close>
       <crontab ref="crontabRef" @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
     </el-dialog>

      <!-- ジョブログ詳細 -->
      <el-dialog title="ジョブ詳細" v-model="openView" width="700px" append-to-body>
         <el-form :model="form" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="ジョブ番号：">{{ form.jobId }}</el-form-item>
                  <el-form-item label="ジョブ名：">{{ form.jobName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ジョブグループ：">{{ jobGroupFormat(form) }}</el-form-item>
                  <el-form-item label="作成時間：">{{ form.createTime }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="cronジョブスケジュール：">{{ form.cronExpression }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="次の実行時間：">{{ parseTime(form.nextValidTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="ターゲットメソッドを呼び出します：">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ジョブステータス：">
                     <div v-if="form.status == 0">正常</div>
                     <div v-else-if="form.status == 1">停止</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="同時実行：">
                     <div v-if="form.concurrent == 0">許可</div>
                     <div v-else-if="form.concurrent == 1">禁止</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ミスファイアポリシー：">
                     <div v-if="form.misfirePolicy == 0">デフォルトのミスファイアポリシー</div>
                     <div v-else-if="form.misfirePolicy == 1">即時実行</div>
                     <div v-else-if="form.misfirePolicy == 2">1回実行</div>
                     <div v-else-if="form.misfirePolicy == 3">実行しない</div>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="openView = false">×　閉じる</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Job">
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job";
import Crontab from '@/components/Crontab'
const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_job_group, sys_job_status } = proxy.useDict("sys_job_group", "sys_job_status");

const jobList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const openView = ref(false);
const openCron = ref(false);
const expression = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  },
  rules: {
    jobName: [{ required: true, message: "ジョブ名を入力してください", trigger: "blur" }],
    invokeTarget: [{ required: true, message: "ターゲット文字列を入力してください", trigger: "blur" }],
    cronExpression: [{ required: true, message: "cronジョブスケジュールを入力してください", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** ジョブリスト取得 */
function getList() {
  loading.value = true;
  listJob(queryParams.value).then(response => {
    jobList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** ジョブグループフォーマット */
function jobGroupFormat(row, column) {
  return proxy.selectDictLabel(sys_job_group.value, row.jobGroup);
}
/** キャンセル */
function cancel() {
  open.value = false;
  reset();
}
/** リセット */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: "0"
  };
  proxy.resetForm("jobRef");
}
/** 検索処理 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** リセット処理 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
// 選択肢変換する時の処理
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.jobId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
// アクション処理
function handleCommand(command, row) {
  switch (command) {
    case "handleRun":
      handleRun(row);
      break;
    case "handleView":
      handleView(row);
      break;
    case "handleJobLog":
      handleJobLog(row);
      break;
    default:
      break;
  }
}
// ジョブステータス編集
function handleStatusChange(row) {
  let text = row.status === "0" ? "実行" : "停止";
  proxy.$modal.confirm('ジョブ"' + row.jobName + '"を' + text　+ 'してよろしいでしょうか？').then(function () {
    return changeJobStatus(row.jobId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功しました");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/* すぐに1回実行します */
function handleRun(row) {
  proxy.$modal.confirm('ジョブ"' + row.jobName + '"' + 'を即時実行してよろしいでしょうか？').then(function () {
    return runJob(row.jobId, row.jobGroup);
  }).then(() => {
    proxy.$modal.msgSuccess("実行成功しました");})
  .catch(() => {});
}
/** タスクの詳細 */
function handleView(row) {
  getJob(row.jobId).then(response => {
    form.value = response.data;
    openView.value = true;
  });
}
/** cronジョブスケジュール */
function handleShowCron() {
  expression.value = form.value.cronExpression;
  openCron.value = true;
}
/** Cronジョブスケジュールの値を設定する */
function crontabFill(value) {
  form.value.cronExpression = value;
}
/** ジョブログ処理 */
function handleJobLog(row) {
  const jobId = row.jobId || 0;
  router.push('/monitor/job-log/index/' + jobId)
}
/** 追加処理 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "ジョブ追加";
}
/** 更新処理 */
function handleUpdate(row) {
  reset();
  const jobId = row.jobId || ids.value;
  getJob(jobId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "ジョブ更新";
  });
}
/** [提案します]ボタン */
function submitForm() {
  proxy.$refs["jobRef"].validate(valid => {
    if (valid) {
      if (form.value.jobId != undefined) {
        updateJob(form.value).then(response => {
          proxy.$modal.msgSuccess("更新しました");
          open.value = false;
          getList();
        });
      } else {
        addJob(form.value).then(response => {
          proxy.$modal.msgSuccess("新規しました");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 削除ボタンアクション */
function handleDelete(row) {
  const jobIds = row.jobId || ids.value;
  proxy.$modal.confirm('ジョブ"' + jobIds + '"を削除してもよろしいでしょうか？').then(function () {
    return delJob(jobIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除しました");
  }).catch(() => {});
}
/** 出力ボタンアクション */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `job_${new Date().getTime()}.xlsx`);
}

getList();
</script>
