<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="作成日　時" prop="createdTime">
        <el-date-picker clearable
          v-model="queryParams.createdTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="作成日　時を選択してください">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="関連ファイルルール" prop="serviceFileLimitId">
        <el-input
          v-model="queryParams.serviceFileLimitId"
          placeholder="関連ファイルルールを入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="ファイル名" prop="filename">
        <el-input
          v-model="queryParams.filename"
          placeholder="ファイル名を入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="ファイルサイズ" prop="fileSize">
        <el-input
          v-model="queryParams.fileSize"
          placeholder="ファイルサイズを入力してください"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="ファイルパス" prop="filePath">
        <el-input
          v-model="queryParams.filePath"
          placeholder="ファイルパスを入力してください"
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
          v-hasPermi="['system:file:add']"
        >追加</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:file:edit']"
        >編集</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:file:remove']"
        >削除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:file:export']"
        >出力</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="作成日　時" align="center" prop="createdTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="外部キー制約" align="center" prop="applicationId" />
      <el-table-column label="関連ファイルルール" align="center" prop="serviceFileLimitId" />
      <el-table-column label="ファイル名" align="center" prop="filename" />
      <el-table-column label="ファイルタイプ" align="center" prop="fileType" />
      <el-table-column label="ファイルサイズ" align="center" prop="fileSize" />
      <el-table-column label="ファイルパス" align="center" prop="filePath" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:file:edit']">編集</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:file:remove']">削除</el-button>
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

    <!-- 追加或申請編集_file对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="fileRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作成日　時" prop="createdTime">
          <el-date-picker clearable
            v-model="form.createdTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="作成日　時を選択してください">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="関連ファイルルール" prop="serviceFileLimitId">
          <el-input v-model="form.serviceFileLimitId" placeholder="関連ファイルルールを入力してください" />
        </el-form-item>
        <el-form-item label="ファイル名" prop="filename">
          <el-input v-model="form.filename" placeholder="ファイル名を入力してください" />
        </el-form-item>
        <el-form-item label="ファイルサイズ" prop="fileSize">
          <el-input v-model="form.fileSize" placeholder="ファイルサイズを入力してください" />
        </el-form-item>
        <el-form-item label="ファイルパス" prop="filePath">
          <el-input v-model="form.filePath" placeholder="ファイルパスを入力してください" />
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

<script setup name="File">
import { listFile, getFile, delFile, addFile, updateFile } from "@/api/system/application/file";

const { proxy } = getCurrentInstance();

const fileList = ref([]);
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
    applicationId: null,
    serviceFileLimitId: null,
    filename: null,
    fileType: null,
    fileSize: null,
    filePath: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** リスト取得 */
function getList() {
  loading.value = true;
  listFile(queryParams.value).then(response => {
    fileList.value = response.rows;
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
    applicationId: null,
    serviceFileLimitId: null,
    filename: null,
    fileType: null,
    fileSize: null,
    filePath: null
  };
  proxy.resetForm("fileRef");
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

/** チェックボックス変更する時の処理 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 追加処理 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "新規";
}

/** 編集処理 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getFile(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "編集";
  });
}

/** コミット処理 */
function submitForm() {
  proxy.$refs["fileRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateFile(form.value).then(response => {
          proxy.$modal.msgSuccess("編集成功");
          open.value = false;
          getList();
        });
      } else {
        addFile(form.value).then(response => {
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
  proxy.$modal.confirm('ファイル"' + _ids + '"を削除してもよろしいでしょうか？').then(function () {
    return delFile(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
}

/** 出力処理 */
function handleExport() {
  proxy.download('system/file/export', {
    ...queryParams.value
  }, `file_${new Date().getTime()}.xlsx`)
}

getList();
</script>
