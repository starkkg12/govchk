<template>
   <cardShadow>
      <template #header-title>
         ユーザー管理
      </template>
            
      <el-form :model="queryParams" :rules="searchRules" ref="queryRef" :inline="true" v-show="showSearch" label-width="120px" v-if="!isAdmin">
         <el-row>
            <el-col :span="16">
               <el-form-item label="アカウント" prop="userName" sortable>
                  <el-input v-model="queryParams.userName" clearable class="inputArea" @keyup.enter="handleQuery" />
               </el-form-item>
            </el-col>
            <el-col :span="8" style="text-align: end;">
               <el-form-item>
                  <el-button class="buttonShadow" type="primary" icon="Refresh" @click="resetQuery" plain size="normal">リセット</el-button>
                  <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery" size="normal">検索</el-button>
               </el-form-item>
            </el-col>
            <el-col :span="15">
               <el-col :span="24">
                  <el-form-item label="最終ログイン" prop="loginStartTime" class="first_picker">
                     <el-date-picker clearable v-model="queryParams.loginStartTime" type="date" value-format="YYYY-MM-DD"
                        class="narrowDatePicker">
                     </el-date-picker>
                     <span style="padding: 0 6px;">～</span>
                     <el-date-picker clearable v-model="queryParams.loginEndTime" type="date" value-format="YYYY-MM-DD"
                        class="narrowDatePicker">
                     </el-date-picker>
                  </el-form-item>
               </el-col> 
            </el-col>
            <el-col :span="9" v-if="showUploading" align="end" min-width="200px">
               <el-form-item>
                  <el-button type="info" :loading="uploadLoading" icon="Upload" class="buttonShadow" @click="$refs.file.click()">一括登録を実行</el-button>
                  <el-dropdown>
                     <el-button class="buttonShadow" icon="Download" type="warning">
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
         </el-row>
         <el-row>
            <el-col :span="6">
               <el-form-item label="利用可否" prop="status" width="120px">
                  <el-select v-model="queryParams.status" clearable placeholder=" ">
                     <el-option label="" value="">
                     </el-option>
                     <el-option label="はい" value="0">
                        <el-tag type="success">はい</el-tag>
                     </el-option>
                     <el-option label="いいえ" value="1">
                        <el-tag type="danger">いいえ</el-tag>
                     </el-option>
                  </el-select>
               </el-form-item>
            </el-col>
      </el-row>
   </el-form>

      <el-row :gutter="10" class="mb8" v-hasPermi="['system:user:add']">
         <el-col :span="1">
            <el-button type="primary" class="buttonShadow" plain icon="Plus" @click="handleAdd" size="normal"
               >新規</el-button>
         </el-col>
         <el-col :span="23" align="end" min-width="200px" v-if="isAdmin && showUploading" style="display: flex; justify-content: end;">
            <el-form-item>
               <el-button type="info" icon="Upload" :loading="uploadLoading" class="buttonShadow" @click="$refs.file.click()">一括登録を実行</el-button>
               <el-dropdown>
                  <el-button class="buttonShadow" icon="Download" type="warning">
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
         <!-- <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar> -->
      </el-row>
      <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" @sort-change="sortData">
         <el-table-column label="自治体名" align="center" key="userId" prop="govName" sortable>
            <template #default="scope">
               <div style="width: 100%; text-align: left;"> {{ scope.row.govName }} </div>
             </template>
         </el-table-column>
         <el-table-column label="職員番号" align="center" key="userName" prop="userName" 
            :show-overflow-tooltip="true">
            <template #default="scope">
               <div style="width: 100%; text-align: left;"> {{ scope.row.userName }} </div>
             </template>
         </el-table-column>
         <el-table-column label="氏名" align="center" key="name" prop="name" :show-overflow-tooltip="true">
            <template #default="scope">
               <div style="width: 100%; text-align: left;"> {{ scope.row.name }} </div>
             </template>
         </el-table-column>   
         <el-table-column label="利用可否" align="center" key="status">
            <template #default="scope">
               <el-tag type="success" effect="plain" v-if="scope.row.status == 0">はい</el-tag>
               <el-tag type="danger" effect="plain" v-if="scope.row.status == 1">いいえ</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="最終ログイン" align="center" prop="loginDate" width="160px" sortable="custom">
            <template #default="scope">
               <div style="white-space: pre-line;">{{ parseTime(scope.row.loginDate, '{y}-{m}-{d} {h}:{i}') }}</div>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="編集" placement="top" >
                  <el-button :disabled="perms2.edit === false && scope.row.userId !== self" link type="primary" icon="Edit" @click="handleUpdateOrView(scope.row, 'edit')"></el-button>
               </el-tooltip>
               <el-tooltip content="参照" placement="top"  >
                  <el-button link type="primary" icon="View" @click="handleUpdateOrView(scope.row, 'view')"></el-button>
               </el-tooltip>
               
               <el-tooltip content="削除" placement="top" >
                  <el-button :disabled="perms2.remove === false || userStore.id === scope.row.userId " link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
               </el-tooltip>
            </template>
         </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />
   </cardShadow>

   <!-- 新規または編集のサブ画面 -->
   <el-drawer  v-model="open" width="600px" size="90%" append-to-body>
      <cardShadow>
         <template #header-title>
           {{ title }}
         </template>
         <userEdit :userId="userId" :self="self" :userRoleId="userRoleId" @close="handleClose"  v-if="open" :mode="mode" :roleId="roleId"></userEdit>
      </cardShadow>
   </el-drawer>

   <!-- user Input -->
   <el-drawer :title="upload.title" v-model="upload.open" width="400px"  size="60%" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
         :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
         :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
         <el-icon class="el-icon--upload"><upload-filled /></el-icon>
         <div class="el-upload__text">ここでファイルをドラッグします，または<em>クリックしてアップロードします</em></div>
         <template #tip>
            <div class="el-upload__tip text-center">
               <div class="el-upload__tip">
                  <el-checkbox v-model="upload.updateSupport" />既存ユーザーデータを更新します
               </div>
               <span>ただxls、xlsxフォーマットファイルできます</span>
               <el-link type="primary" :underline="false" style="font-size:14px;vertical-align: baseline;"
                  @click="importTemplate">テンプレートをダウンロードします</el-link>
            </div>
         </template>
      </el-upload>
      <template #footer>
         <div class="dialog-footer">
            <el-button class="buttonShadow" type="primary" @click="submitFileForm">確認</el-button>
            <el-button class="buttonShadow" @click="upload.open = false">キャンセル</el-button>
         </div>
      </template>
   </el-drawer>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect,listUserByCondition, importData } from "@/api/system/user";
import cardShadow from "@/components/Customized/cardShadow.vue";
import userEdit from  "@/views/system/user/profile/userEdit.vue";
import {ROLE_GROUP,ROLE_KEY} from '@/utils/const'
import useUserStore from "@/store/modules/user";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

const canEdit = ref(true);
const currentUserRoleKey = useUserStore().roles[0]
const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'
const roleId=ROLE_KEY[currentUserRoleKey]
const userStore = useUserStore();
const userRoleId = ref(null);
const showUploading = ref(false);
const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const uploadLoading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);

// 操作するユーザーID
const userId =ref(null)
const mode=ref(null)

const self = ref(userStore.id);

const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  edit: perms.indexOf('system:user:edit') != -1 ? true : false,
  remove: perms.indexOf('system:user:remove') != -1 ? true : false,
})

/*** ユーザー入力データ */
const upload = reactive({
   // ポップアップレイヤーを表示するかどうか（ユーザー入力データ）
   open: false,
   // ポップアップレイヤータイトル（ユーザー入力データ）
   title: "",
   // アップロードを無効にするかどうか
   isUploading: false,
   // 既存ユーザーデータを更新するかどうか
   updateSupport: 0,
   // リクエストヘッダーを設定します
   headers: { Authorization: "Bearer " + getToken() },
   // アップロードされたアドレス
   url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// Lycum Hidden情報
const columns = ref([
   { key: 0, label: `ユーザーID`, visible: true },
   { key: 1, label: `ユーザー名`, visible: true },
   { key: 2, label: `ニックネーム`, visible: true },
   { key: 3, label: `部門`, visible: true },
   { key: 4, label: `携帯電話番号`, visible: true },
   { key: 5, label: `ステータス`, visible: true },
   { key: 6, label: `作成日　`, visible: true }
]);

const checkTime = (rule, value, callback) => {
  if (queryParams.value.loginStartTime > queryParams.value.loginEndTime) {
    return callback(new Error('「最終ログインまで」に「最終ログインから」より未来の日時を設定してください。'));
  } else {
    callback();
  }
};
const checkVal = (rule, value, callback) => {
  if (
    queryParams.value.userName !== undefined && 
    queryParams.value.userName !== null &&
    queryParams.value.userName.length  > 30) {
    return callback(new Error('文字数を30文字以内にしてください。'));
  } else {
    callback();
  }
}

const data = reactive({
   form: {},
   queryParams: {
      userPage: '1',
      pageNum: 1,
      pageSize: 10,
      userName: undefined,
      phonenumber: undefined,
      status: undefined,
      deptId: undefined,
      orderByColumn: null,
      isAsc: 'asc',
   },
   searchRules: {
    userName:[
      { validator: checkVal, message: "文字数を30文字以内にしてください。", trigger: "blur"}
    ],
    loginStartTime: [
      { validator: checkTime, message:"「最終ログインまで」に「最終ログインから」より未来の日時を設定してください。", trigger: "blur" }
    ],
  },
   rules: {
      userName: [{ required: true, message: "ユーザー名を入力してください", trigger: "blur" }, { min: 2, max: 50, message: "2文字以上50文字以内を入力してください", trigger: "blur" }],
      nickName: [{ required: true, message: "ニックネームを入力してください", trigger: "blur" }],
      password: [{ required: true, message: "パスワードを入力してください", trigger: "blur" }, { min: 6, max: 20, message: "6文字以上20文字以内を入力してください", trigger: "blur" }],
      email: [{ type: "email", message: "正しいEメールを入力してください", trigger: ["blur", "change"] }],
      phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい携帯電話番号を入力してください", trigger: "blur" }]
   }
});

const { queryParams, form, searchRules, rules } = toRefs(data);


/** 条件付きでノードをフィルターします  */
const filterNode = (value, data) => {
   if (!value) return true;
   return data.label.indexOf(value) !== -1;
};
/** 名称より部門をピックする */
watch(deptName, val => {
   proxy.$refs["deptTreeRef"].filter(val);
});
/** 部門ツリー取得 */
function getDeptTree() {
   deptTreeSelect().then(response => {
      deptOptions.value = response.data;
   });
};
/** クエリユーザーリスト */
function getList() {
   if(roleId){
      queryParams.value.roleId=roleId
   }
   loading.value = true;
   listUserByCondition(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
      loading.value = false;
      userList.value = res.rows;
      total.value = res.total;
   });
};

/** 検索ボタンアクション */
function handleQuery() {
   if (isAdmin) {
      queryParams.value.pageNum = 1;
      getList();
   } else {
      proxy.$refs["queryRef"].validate((valid) => {
        if (valid) {
           queryParams.value.pageNum = 1;
           getList();
         }
      });
   }
   
};
/** リセット処理 */
function resetQuery() {
   dateRange.value = [];
   queryParams.value.loginEndTime = null; 
   proxy.resetForm("queryRef");
   //queryParams.value.deptId = undefined;
   //proxy.$refs.deptTreeRef.setCurrentKey(null);
   handleQuery();
};
/** 削除ボタンアクション */
function handleDelete(row) {
   if (perms2.remove === false || userStore.id === row.userId) {
      return ;
   } else {
      const userIds = row.userId || ids.value;
      if (userStore.id != userIds) {
         proxy.$modal.confirm('アカウント"' + row.userName + '"を削除してもよろしいでしょうか？').then(function () {
            return delUser(userIds);
         }).then(() => {
            getList();
            proxy.$modal.msgSuccess("削除成功");
         }).catch(() => { });
      }
   }
};
/** ユーザーロールに遷移処理 */
function handleAuthRole(row) {
   const userId = row.userId;
   router.push("/system/user-auth/role/" + userId);
};
/** パスワードリセット処理 */
function handleResetPwd(row) {
   proxy.$prompt('"' + row.userName + '"の新しいパスワードを入力してください', "ヒント", {
      confirmButtonText: "確認",
      cancelButtonText: "キャンセル",
      closeOnClickModal: false,
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: "6文字以上20文字以内のパスワードを入力してください",
   }).then(({ value }) => {
      resetUserPwd(row.userId, value).then(response => {
         proxy.$modal.msgSuccess("リセット処理成功しました。新しいパスワードは：" + value + " です。");
      });
   }).catch(() => { });
};
/** 選択の数  */
function handleSelectionChange(selection) {
   ids.value = selection.map(item => item.userId);
   single.value = selection.length != 1;
   multiple.value = !selection.length;
};

/** テンプレートをダウンロードしますアクション */
function importTemplate() {
   proxy.download("system/user/importTemplate", {
   }, `user_template_${new Date().getTime()}.xlsx`);
};
/**ファイルアップロード処理 */
const handleFileUploadProgress = (event, file, fileList) => {
   upload.isUploading = true;
};
/** ファイルアップロードに正常に処理します */
const handleFileSuccess = (response, file, fileList) => {
   upload.open = false;
   upload.isUploading = false;
   proxy.$refs["uploadRef"].handleRemove(file);
   proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "入力結果", { dangerouslyUseHTMLString: true });
   getList();
};
/** アップロードファイルを送信します */
function submitFileForm() {
   form.value.userName=form.value.email
   proxy.$refs["uploadRef"].submit();
};
/** リセット処理 */
function reset() {
   form.value = {
      userId: undefined,
      deptId: undefined,
      userName: undefined,
      nickName: undefined,
      password: undefined,
      phonenumber: undefined,
      email: undefined,
      sex: undefined,
      status: "0",
      remark: undefined,
      postIds: [],
      roleIds: []
   };
   proxy.resetForm("userRef");
};
/** キャンセル処理 */
function cancel() {
   open.value = false;
   reset();
};
/** 追加処理 */
function handleAdd() {
   title.value = "ユーザー 新規"
   mode.value='add'
   userId.value= isAdmin ? null : userStore.id;
   open.value = true
};

/** 更新・プレビュー処理 */
function handleUpdateOrView(row, type) {
   open.value = true;
   userId.value=row.userId
   userRoleId.value = row.roles[0].roleId;
   if(type=='view'){
      title.value = "ユーザーアカウント 参照"
   }else {
      title.value = "ユーザーアカウント 変更"
   }
   
   mode.value=type
   
}
/** 保存処理 */
function submitForm() {
   proxy.$refs["userRef"].validate(valid => {
      if (valid) {
         if (form.value.userId != undefined && mode.value !== 'add') {
            updateUser(form.value).then(response => {
               //proxy.$modal.msgSuccess("編集成功");
               open.value = false;
               getList();
            });
         } else {
            addUser(form.value).then(response => {
               //proxy.$modal.msgSuccess("新規成功");
               open.value = false;
               getList();
            });
         }
      }
   });
};

function handleClose(){
   open.value=false
   mode.value=null
   getList();
}

function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  handleQuery();

}

const handleImport = (e) => {
   uploadLoading.value = true;
  let form = new FormData();
  form.append('file', e.target.files[0]);
  proxy.$modal.confirm('ファイル名: "' +e.target.files[0].name+ '"をアップロードしてもよろしいでしょうか？').then(function () {
      return importData(form);
  }).then(() => {
    uploadLoading.value = false;
    proxy.$modal.msgSuccess("ファイルアップロード成功しました");
    reset();
    getList();
  }).catch(() => {
    uploadLoading.value = false;
  });

}

/** 出力ボタンアクション */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  }, `ユーザー管理_${new Date().getTime()}.xlsx`);
}
function handleExportSample() {
  proxy.download("system/user/exportSample", {
    ...queryParams.value,
  }, `ユーザー管理_${new Date().getTime()}.xlsx`);
}


getDeptTree();
getList();
</script>

<style scoped>
.el-date-editor,
.el-date-editor--date {
   width: 100px;
   background-color: blueviolet;
}

.el-input div {
   width: 100px;
}
.first_picker{
  margin-right:3px
}
</style>