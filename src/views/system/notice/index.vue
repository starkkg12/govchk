<template>
   <cardShadow>
     <template #header-title>
      お知らせ管理
     </template>
      <el-row :gutter="10" class="mb8">
         <el-col :span="1">
            <el-button
               class="buttonShadow"
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:notice:add']"
            >新規</el-button>
         </el-col>
         <el-col :span="23" v-if="showUploading" align="end" min-width="200px" style="display: flex; justify-content: end;">
          <el-form-item>
            <el-button type="info" icon="Upload" class="buttonShadow" @click="$refs.file.click()">一括登録を実行</el-button>
            <el-dropdown>
              <el-button icon="Download" class="buttonShadow" type="warning">
                ダウンロード
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Download" @click="handleExport">データダウンロード</el-dropdown-item>
                  <el-dropdown-item icon="Download" @click="handleExportSample">雛形ダウンロード</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
        </el-col>
        <input type="file" ref="file" style="display:none" @change="handleImport" accept=".xls,.xlsx"  @click="$event.target.value=''" />
      </el-row>

      <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
         <el-table-column label="ID" align="center" prop="noticeId" width="100">
           <template #default="scope">
             <div style="width: 100%; text-align: right;"> {{ scope.row.noticeId }} </div>
           </template>
         </el-table-column>
         <el-table-column label="お知らせ" align="center" prop="noticeTitle" :show-overflow-tooltip="true" min-width="250px">
          <template #default="scope">
            <div style="width: 100%; text-align: left;"> {{ scope.row.noticeTitle }} </div>
          </template>
         </el-table-column>
        
         <el-table-column label="有効期限　" align="center"  width="290">
          　<template #default="scope">
              <span  style="width: 100%; text-align: left;" v-if="scope.row.validTimeStart !== null || scope.row.validTimeEnd !== null">{{ parseTime(scope.row.validTimeStart, '{y}年{m}月{d}日') }} ～ {{ parseTime(scope.row.validTimeEnd, '{y}年{m}月{d}日') }}</span>
            </template>
         </el-table-column>
         <el-table-column label="タイプ" prop="noticeType" width="120">
            <template #default="scope">
               <el-tag type="warning" v-if="scope.row.noticeType==0">メンテナンス</el-tag>
               <el-tag type="success" v-if="scope.row.noticeType==1">お知らせ</el-tag>

            </template>
         </el-table-column>
         <el-table-column label="作成者" align="center" prop="createBy" width="180">
          <template #default="scope">
            <div style="width: 100%; text-align: left;"> {{ scope.row.createBy }} </div>
          </template>
        </el-table-column>
         <el-table-column label="投稿日" align="center" prop="createTime" width="130">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
         </el-table-column>
         
         <el-table-column  label="操作" width="160" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="編集" placement="top">
                <el-button :disabled="perms2.edit === false" link type="primary" icon="Edit" @click="handleUpdate(scope.row, 'edit')" ></el-button>
              </el-tooltip>
              <el-tooltip content="詳細" placement="top" >
								<el-button  link type="primary" icon="view" @click="handleUpdate(scope.row, 'view')" />
							</el-tooltip>
              <el-tooltip content="削除" placement="top" >
                <el-button :disabled="perms2.remove === false" link type="primary" title="削除" icon="Delete" @click="handleDelete(scope.row)"  ></el-button>
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

      <!-- ダイアログボックスを新規または改修します -->
      <el-drawer  v-model="open" width="90%" append-to-body size="90%">
        <h1>{{ title }}</h1>
        <el-row style="margin-top: 5%">
          <el-col :offset="4" :span="16">
            <el-form ref="noticeRef" :model="form" :rules="rules" >
              <el-row>
                <el-col :span="10">
                    <el-form-item label="お知らせ" prop="noticeTitle">
                      <el-input :disabled="!editNotice" v-model="form.noticeTitle" placeholder="お知らせを入力してください" maxlength="50" show-word-limit/>
                    </el-form-item>
                </el-col>
                <el-col :span="12" :offset="2">
                  <div>
                    <el-form-item label="投稿日" prop="createTime" :style="{marginLeft: '-12px'}">
                      <el-date-picker :disabled="!editNotice" clearable v-model="form.createTime" type="date" value-format="YYYY-MM-DD"
                         class="narrowDatePicker">
                      </el-date-picker>
                    </el-form-item>
                  </div>
                </el-col>
                <el-col :span="10">
                  <div>
                    <el-form-item label="お知らせタイプ" prop="noticeType" style="margin-left: -3em;">
                      <el-select :disabled="!editNotice" v-model="form.noticeType" placeholder="選んでください">
                          <el-option label="メンテナンス" value="0"></el-option>
                          <el-option label="お知らせ" value="1"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </el-col>
                <el-col :span="12" :offset="2">
                  <el-form-item label="有効期限" prop="validTime" style="margin-left: -1em;">
                    <el-date-picker :disabled="!editNotice" clearable v-model="form.validTime" type="datetimerange" time-format="HH:mm"
                      value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm" start-placeholder="開始日"
                      end-placeholder="終了日">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
                
                </el-row>
                <el-row>
                <el-col :span="24">
                    <el-form-item label="内容" label-width="80px">
                      <el-input :disabled="!editNotice" v-model="form.noticeContent" :rows="5" type="textarea" maxlength="2000" show-word-limit/>
                    </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-col>
        </el-row>
        
         <template #footer>
            <div class="dialog-footer">
               <el-button class="buttonShadow" v-if="editNotice" type="primary" @click="submitForm">確認</el-button>
               <el-button class="buttonShadow" v-if="editNotice" @click="cancel">キャンセル</el-button>
               <el-button class="buttonShadow" v-if="!editNotice" @click="cancel">×　閉じる</el-button>
            </div>
         </template>
      </el-drawer>
   </cardShadow>
</template>

<script setup name="Notice">
import { listNotice, getNotice, delNotice, addNotice, updateNotice, importData } from "@/api/system/notice";
import cardShadow from "@/components/Customized/cardShadow.vue";
const { proxy } = getCurrentInstance();
const noticeList = ref([]);
const open = ref(false);
const editNotice = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const showUploading = ref(false);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: undefined,
    createBy: undefined,
    status: undefined
  },
  rules: {
    createTime: [
      { required: true, message: "投稿日を入力してください。", trigger: "blur" },

    ],
    validTime: [
      { required: false, message: "有効期限を入力してください。", trigger: "blur" },

    ],
    noticeTitle: [{ required: true, message: "お知らせを入力してください。", trigger: "blur" }],
    noticeType: [{ required: true, message: "お知らせタイプを選択してください。", trigger: "change" }],
    noticeContent: [{ max: 2000, message: "文字数を2000文字以内にしてください。"}]
  },
});

const { queryParams, form, rules } = toRefs(data);

const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  edit: perms.indexOf('system:notice:edit') != -1 ? true : false,
  remove: perms.indexOf('system:notice:remove') != -1 ? true : false,
})

/** クエリアナウンスリスト */
function getList() {
  loading.value = true;
  listNotice(queryParams.value).then(response => {
    noticeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** キャンセル */
function cancel() {
  open.value = false;
  reset();
}
/** リセット */
function reset() {
  form.value = {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    validTime: undefined,
    createTime: undefined,
    status: "0"
  };
  proxy.resetForm("noticeRef");
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
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.noticeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** お知らせ追加 */
function handleAdd() {
  editNotice.value = true;
  reset();
  open.value = true;
  title.value = "お知らせ 新規";
}
/** お知らせ編集 */
function handleUpdate(row, status) {
  reset();
  const noticeId = row.noticeId || ids.value;
  getNotice(noticeId).then(response => {
    form.value = response.data;
    form.value.validTime = [response.data.validTimeStart, response.data.validTimeEnd];
    open.value = true;
    editNotice.value = status === 'edit' ? true : false;
    title.value =  status === 'edit' ? "お知らせ編集" : "お知らせ詳細情報";
  });
}
/** コミット */
function submitForm() {
  let data =  {
    noticeId: form.value.noticeId,
    noticeTitle: form.value.noticeTitle,
    noticeType: form.value.noticeType,
    noticeContent: form.value.noticeContent,
    validTimeStart: form.value.validTime !== undefined && form.value.validTime !== null && form.value.validTime[0] !== undefined ? form.value.validTime[0] : '',
    validTimeEnd: form.value.validTime !== undefined && form.value.validTime !== null && form.value.validTime[1] !== undefined? form.value.validTime[1] : '' ,
    createTime: form.value.createTime,
    status: form.value.status
  };
  proxy.$refs["noticeRef"].validate(valid => {
    if (valid) {
      if (form.value.noticeId != undefined) {
        updateNotice(data).then(response => {
          proxy.$modal.msgSuccess("編集成功");
          open.value = false;
          getList();
        });
      } else {
        addNotice(data).then(response => {
          proxy.$modal.msgSuccess("新規成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 削除ボタンアクション */
function handleDelete(row) {
  const noticeIds = row.noticeId || ids.value
  proxy.$modal.confirm('お知らせ"' + row.noticeTitle + '"を削除してもよろしいでしょうか？').then(function () {
    return delNotice(noticeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => {});
}

const handleImport = (e) => {
  let form = new FormData();
  form.append('file', e.target.files[0]);
  proxy.$modal.confirm('ファイル名: "' +e.target.files[0].name+ '"をアップロードしてもよろしいでしょうか？').then(function () {
      return importData(form);
  }).then(() => {
    proxy.$modal.msgSuccess("ファイルアップロード成功しました");
    getList();
  });

}

/** 出力ボタンアクション */
function handleExport() {
  proxy.download("system/notice/export", {
    ...queryParams.value,
  }, `お知らせ管理_${new Date().getTime()}.xlsx`);
}

function handleExportSample() {
  proxy.download("system/notice/exportSample", {
    ...queryParams.value,
  }, `お知らせ管理_${new Date().getTime()}.xlsx`);
}

getList();
</script>
