<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="作成日　" prop="createdTime">
        <el-date-picker clearable
          v-model="queryParams.createdTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="作成日　を選択してください">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="作成ユーザー" prop="createdBy">
        <el-input
          v-model="queryParams.createdBy"
          placeholder="作成ユーザーを入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="関連業務の条件のフィールドID" prop="serviceConditionId">
        <el-input
          v-model="queryParams.serviceConditionId"
          placeholder="関連業務の条件のフィールドIDを入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
        <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:condition:add']"
        >新規</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:condition:edit']"
        >編集</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:condition:remove']"
        >削除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:condition:export']"
        >出力</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="conditionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="ID" align="center" prop="id" /> -->
      <el-table-column label="作成日　" align="center" prop="createdTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作成ユーザー" align="center" prop="createdBy" />
      <el-table-column label="関連申請" align="center" prop="applicationId" />
      <el-table-column label="関連業務の条件のフィールドID" align="center" prop="serviceConditionId" />
      <el-table-column label="関連業務の申請のフィールド値" align="center" prop="value" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:condition:edit']">編集</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:condition:remove']">削除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新規、編集条件 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="conditionRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="作成日　" prop="createdTime">
          <el-date-picker clearable
            v-model="form.createdTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="作成日　を選択してください">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="作成ユーザー" prop="createdBy">
          <el-input v-model="form.createdBy" placeholder="作成ユーザーを入力してください" />
        </el-form-item>
        <el-form-item label="関連業務の条件のフィールドID" prop="serviceConditionId">
          <el-input v-model="form.serviceConditionId" placeholder="関連業務の条件のフィールドIDを入力してください" />
        </el-form-item>
        <el-form-item label="関連業務の申請のフィールド値" prop="value">
          <el-input v-model="form.value" type="textarea" placeholder="内容を入力してください" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">確 定</el-button>
          <el-button @click="cancel">キャンセル</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Condition">
import { listCondition, getCondition, delCondition, addCondition, updateCondition } from "@/api/system/application/condition";

const { proxy } = getCurrentInstance();

const conditionList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createdTime: null,
    createdBy: null,
    applicationId: null,
    serviceConditionId: null,
    value: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 条件リスト取得 */
function getList() {
  loading.value = true;
  listCondition(queryParams.value).then(response => {
    conditionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// キャンセル
function cancel() {
  open.value = false;
  reset();
}

// リセット
function reset() {
  form.value = {
    id: null,
    createdTime: null,
    createdBy: null,
    applicationId: null,
    serviceConditionId: null,
    value: null
  };
  proxy.resetForm("conditionRef");
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

// チェックボックス変更する時の処理
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新規処理 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "条件申請新規";
}

/** 編集処理 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCondition(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "条件申請編集";
  });
}

/** コミット処理 */
function submitForm() {
  proxy.$refs["conditionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCondition(form.value).then(response => {
          proxy.$modal.msgSuccess("編集成功");
          open.value = false;
          getList();
        });
      } else {
        addCondition(form.value).then(response => {
          proxy.$modal.msgSuccess("新規成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 削除処理 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('条件"' + _ids + '"を削除してもよろしいでしょうか？').then(function () {
    return delCondition(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
}

/** 出力処理 */
function handleExport() {
  proxy.download('system/condition/export', {
    ...queryParams.value
  }, `condition_${new Date().getTime()}.xlsx`)
}

getList();
</script>
