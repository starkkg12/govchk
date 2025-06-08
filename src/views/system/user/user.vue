<template>
   <cardShadow>
      <template #header-title>
         ユーザー管理
         <!-- M-1-5-1-->
      </template>
      <!--ユーザーデータ-->
      
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px" v-if="!isAdmin">
         <el-row>
            <el-col :span="16">
               <el-form-item label="アカウント" prop="email" sortable>
                  <el-input v-model="queryParams.email" clearable style="width:280px" @keyup.enter="handleQuery" />
               </el-form-item>
               <el-form-item label="最後ログイン" prop="createdTime">
                  <el-date-picker clearable v-model="queryParams.loginStartTime" type="date" value-format="YYYY-MM-DD"
                     class="narrowDatePicker">
                  </el-date-picker>
                  &nbsp;～&nbsp;
                  <el-date-picker clearable v-model="queryParams.loginEndTime" type="date" value-format="YYYY-MM-DD"
                     class="narrowDatePicker">
                  </el-date-picker>
               </el-form-item>
               <el-form-item label="作成日" prop="createdTime">
                  <el-date-picker clearable v-model="queryParams.createStartTime" type="date" value-format="YYYY-MM-DD"
                     class="narrowDatePicker">
                  </el-date-picker>
                  &nbsp;～&nbsp;
                  <el-date-picker clearable v-model="queryParams.createEndTime" type="date" value-format="YYYY-MM-DD"
                     class="narrowDatePicker">
                  </el-date-picker>
               </el-form-item>
            </el-col>
            <el-col :span="8" style="text-align: end;">
               <el-form-item>
                  <el-button type="primary" icon="Refresh" @click="resetQuery" plain size="normal">リセット</el-button>
                  <el-button type="primary" icon="Search" @click="handleQuery" size="normal">検索</el-button>
               </el-form-item>
            </el-col>
         </el-row>
         <el-row>
            <el-col>
               <el-form-item label="利用可否" prop="status">
                  <el-select v-model="queryParams.status" clearable placeholder=" " style="width:120px">
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

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" size="normal"
               >新規</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
         <el-table-column label="ID" align="center" key="userId" prop="userId" v-if="columns[0].visible" sortable />
         <el-table-column label="アカウント" align="center" key="email" prop="email" v-if="columns[1].visible"
            :show-overflow-tooltip="true" />
         <el-table-column label="利用可否" align="center" key="status" v-if="columns[5].visible">
            <template #default="scope">
               <!-- <el-switch v-model="scope.row.status" active-value="0" inactive-value="1"
                           @change="handleStatusChange(scope.row)"></el-switch> -->
               <el-tag type="success" effect="plain" v-if="scope.row.status == 0">はい</el-tag>
               <el-tag type="danger" effect="plain" v-if="scope.row.status == 1">いいえ</el-tag>
            </template>
         </el-table-column>
         <el-table-column label="最後ログイン" align="center" prop="loginDate" v-if="columns[6].visible" width="160">
            <template #default="scope">
               <div style="white-space: pre-line;">{{ parseTime(scope.row.loginDate, '{y}-{m}-{d}\n{h}:{i}') }}</div>
            </template>
         </el-table-column>
         <el-table-column label="作成日" align="center" prop="createTime" v-if="columns[6].visible" width="160">
            <template #default="scope">
               <div style="white-space: pre-line;">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}\n{h}:{i}') }}</div>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="編集" placement="top" >
                  <el-button link type="primary" icon="Edit" @click="handleUpdateOrView(scope.row, 'edit')"></el-button>
               </el-tooltip>
               <el-tooltip content="参照" placement="top"  >
                  <el-button link type="primary" icon="View" @click="handleUpdateOrView(scope.row, 'view')"></el-button>
               </el-tooltip>
            </template>
         </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize" @pagination="getList" />
   </cardShadow>

   <!-- 新規または編集のサブ画面 -->
   <el-drawer :title="title" v-model="open" width="600px" size="90%" append-to-body>
      <userEdit :userId="userId" @close="handleClose"  v-if="open" :mode="mode" :roleId="roleId"></userEdit>
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
            <el-button type="primary" @click="submitFileForm">確認</el-button>
            <el-button @click="upload.open = false">キャンセル</el-button>
         </div>
      </template>
   </el-drawer>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect,listUserByCondition } from "@/api/system/user";
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

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
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

const data = reactive({
   form: {},
   queryParams: {
      pageNum: 1,
      pageSize: 10,
      userName: undefined,
      phonenumber: undefined,
      status: undefined,
      deptId: undefined
   },
   rules: {
      userName: [{ required: true, message: "ユーザー名を入力してください", trigger: "blur" }, { min: 2, max: 20, message: "2文字以上20文字以内を入力してください", trigger: "blur" }],
      nickName: [{ required: true, message: "ニックネームを入力してください", trigger: "blur" }],
      password: [{ required: true, message: "パスワードを入力してください", trigger: "blur" }, { min: 5, max: 20, message: "5文字以上20文字以内を入力してください", trigger: "blur" }],
      email: [{ type: "email", message: "正しいEメールを入力してください", trigger: ["blur", "change"] }],
      phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい携帯電話番号を入力してください", trigger: "blur" }]
   }
});

const { queryParams, form, rules } = toRefs(data);

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
   queryParams.value.pageNum = 1;
   getList();
};
/** リセット処理 */
function resetQuery() {
   dateRange.value = [];
   proxy.resetForm("queryRef");
   //queryParams.value.deptId = undefined;
   //proxy.$refs.deptTreeRef.setCurrentKey(null);
   handleQuery();
};
/** 削除ボタンアクション */
function handleDelete(row) {
   const userIds = row.userId || ids.value;
   proxy.$modal.confirm('ユーザーID"' + userIds + '"を削除してもよろしいでしょうか？').then(function () {
      return delUser(userIds);
   }).then(() => {
      getList();
      //proxy.$modal.msgSuccess("削除成功");
   }).catch(() => { });
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
   open.value = true
   mode.value='add'
   userId.value=null
};

/** 更新・プレビュー処理 */
function handleUpdateOrView(row, type) {
   open.value = true;
   userId.value=row.userId
   title.value = "ユーザーアカウント 変更"
   mode.value=type
   
}
/** 保存処理 */
function submitForm() {
   proxy.$refs["userRef"].validate(valid => {
      if (valid) {
         if (form.value.userId != undefined) {
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
</style>