<template>
    <cardShadow>
        <template #header-title>
          自治体DB管理一覧
        </template>
        <el-row style="margin-top:80px" :gutter="10" class="mb8">
            <el-col :span="1.5">
               <el-button
                  type="primary"
                  plain
                  icon="Plus"
                  @click="handleAdd"
                  v-hasPermi="['system:role:add']"
               >追加</el-button>
            </el-col>
        </el-row>

        <el-table v-loading="loading" :data="list">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="ID" align="center" prop="id" sortable />
            <el-table-column label="ファイル名" align="left" prop="name" />
            <el-table-column label="生成日" align="left" prop="createdTime" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button link type="primary" icon="Delete" @click="handleDeleteConfirm(scope.row.id, scope.row.name)" v-hasPermi="['system:condition:remove']">削除</el-button>
                </template>
              </el-table-column>
        </el-table>
         <!-- 追加、編集 -->
     <el-drawer :title="title" v-model="open" width="500px" append-to-body>
        <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
           <el-form-item label="ファイル" prop="roleId">
                <input type="file" @change="uploadFile" />
                <el-row>
                    <el-button @click="cancel">キャンセル</el-button>
                    <el-button type="primary" @click="submitForm">確認</el-button>
                </el-row>
           </el-form-item>
        </el-form>
     </el-drawer>
    </cardShadow>
</template>
<script setup name="Database">
import { listInfo, uploadDBFile, delDBfile } from "@/api/system/database/info";
import cardShadow from "@/components/Customized/cardShadow";
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // ファイルサーバーアドレスをアップロードします
const { proxy } = getCurrentInstance();


const list = ref([]);
const open = ref(false);
const file = ref(null);
const delId = ref(null);
function getList() {
    listInfo().then((response) => {
        list.value = response.data;
    })
}

function handleAdd() {
  open.value = true;
}

function uploadFile(e) {
    file.value = e.target.files[0];
}
function submitForm() {
    const formData = new FormData();
    formData.append('file', file.value);
    uploadDBFile(formData).then((response) => {
        if (response.code === 200) {
            open.value = false;
            getList();
        }
    })
} 
function handleDeleteConfirm(id, name) {
  　proxy.$modal.confirm('ファイル名"' + name + '"を削除してもよろしいでしょうか？').then(function () {
    　　return delDBfile(id);
  　}).then((response) => {

    　　getList();
    　　proxy.$modal.msgSuccess("削除成功");
  　}).catch(() => { });
}


// アップロードしたファイルの形式とサイズをチェック
function handleBeforeUpload(file) {
  // ファイルタイプが指定されている場合

  return true;
}
// アップロードエラーが発生した場合の処理
function handleUploadError(err) {
  proxy.$modal.msgError("ファイルのアップロード中にエラーが発生しました");
}
// ファイルの数が上限を超えた場合の処理
function handleExceed() {
  proxy.$modal.msgError(`アップロード可能なファイルの数は、${props.limit} 個を超えることはできません！`);
}

// 正常にアップロードします
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    console.log("upload ok")
  } else {
    console.error(res.msg);
    
  }
}
getList();
</script>
 