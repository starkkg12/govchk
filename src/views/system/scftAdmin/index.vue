<template>
    <cardShadow>
       <template #header-title>
            SCFTアカウント管理
       </template> 

       <el-row style="margin-top:80px" :gutter="10" class="mb8">
          <el-col :span="1.5">
             <!-- v-hasPermi="['system:user:add']" -->
             <el-button type="primary" plain icon="Plus" @click="handleAdd" size="normal"
                >新規</el-button>
          </el-col> 
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
       </el-row>
 
       <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <!-- <el-table-column type="selection" width="50" align="center" /> -->
          <el-table-column label="ID" align="center" key="userId" prop="userId" v-if="columns[0].visible" sortable />
          <el-table-column label="アカウント" align="center" key="email" prop="email" v-if="columns[1].visible"
             :show-overflow-tooltip="true" />
          <el-table-column label="利用可否" align="center" key="status" v-if="columns[5].visible">
             <template #default="scope">
                <el-tag type="success" effect="plain" v-if="scope.row.status == 0">はい</el-tag>
                <el-tag type="danger" effect="plain" v-if="scope.row.status == 1">いいえ</el-tag>
             </template>
          </el-table-column>
          <el-table-column label="最後ログイン" align="center" prop="loginDate" v-if="columns[6].visible" width="160">
             <template #default="scope">
                <span>{{ parseTime(scope.row.loginDate) }}</span>
             </template>
          </el-table-column>
          <el-table-column label="作成日" align="center" prop="createTime" v-if="columns[6].visible" width="160">
             <template #default="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
             <template #default="scope">
                <!-- v-if="scope.row.userId !== 1" -->
                <el-tooltip content="編集" placement="top" >
                   <el-button link type="primary" icon="Edit" @click="handleUpdateOrView(scope.row, 'edit')"></el-button>
                </el-tooltip>
                <!-- v-if="scope.row.userId !== 1" -->
                <el-tooltip content="参照" placement="top"  >
                   <el-button link type="primary" icon="View" @click="handleUpdateOrView(scope.row, 'view')"></el-button>
                </el-tooltip>
                
                <!-- v-hasPermi="['system:user:remove']"  v-if="scope.row.userId !== 1" :disabled="scope.row.userId !== 1"-->
                <el-tooltip content="削除" placement="top" >
                   <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
                </el-tooltip>
                <!-- <el-tooltip content="パスワードリセット" placement="top" v-if="scope.row.userId !== 1">
                   <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)"
                      v-hasPermi="['system:user:resetPwd']"></el-button>
                </el-tooltip>
                <el-tooltip content="ロールの割り当て" placement="top" v-if="scope.row.userId !== 1">
                   <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)"
                      v-hasPermi="['system:user:edit']"></el-button>
                </el-tooltip> -->
             </template>
          </el-table-column>
       </el-table>
       <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize" @pagination="getList" />
    </cardShadow>
 
    <!-- 新規または編集 -->
    <el-drawer :title="title" v-model="open" width="600px" size="60%" append-to-body>
       <el-form :model="form" :rules="rules" ref="userRef" label-width="160px">
          <el-row>
             <el-col :span="12">
                <el-form-item label="ニックネーム" prop="nickName">
                   <el-input v-model="form.nickName" placeholder="ニックネームを入力してください" maxlength="30" :disabled="!canEdit"/>
                </el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item label="所属する部門" prop="deptId" >
                   <el-tree-select v-model="form.deptId" :data="deptOptions" :disabled="!canEdit"
                      :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id"
                      placeholder="所属する部門を選んでください" check-strictly />
                </el-form-item>
             </el-col>
          </el-row>
          <el-row>
             <el-col :span="12">
                <el-form-item label="電話番号" prop="phonenumber">
                   <el-input v-model="form.phonenumber" placeholder="電話番号を入力してください" maxlength="11" :disabled="!canEdit"/>
                </el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item label="郵便" prop="email">
                   <el-input v-model="form.email" placeholder="郵便番号を入力してください" maxlength="50" :disabled="!canEdit"/>
                </el-form-item>
             </el-col>
          </el-row>
          <el-row>
             <el-col :span="12">
                <el-form-item v-if="form.userId == undefined" label="ユーザー名" prop="userName">
                   <el-input v-model="form.userName" placeholder="ユーザー名を入力してください" maxlength="30" :disabled="!canEdit"/>
                </el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item v-if="form.userId == undefined" label="パスワード" prop="password">
                   <el-input v-model="form.password" placeholder="パスワードを入力してください" type="password" maxlength="20"
                      show-password :disabled="!canEdit"/>
                </el-form-item>
             </el-col>
          </el-row>
          <el-row>
             <el-col :span="12">
                <el-form-item label="性別">
                   <el-select v-model="form.sex" placeholder="選んでください" :disabled="!canEdit">
                      <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label"
                         :value="dict.value" ></el-option>
                   </el-select>
                </el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item label="ステータス">
                   <el-radio-group v-model="form.status">
                      <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value" :disabled="!canEdit">{{ dict.label
                         }}</el-radio>
                   </el-radio-group>
                </el-form-item>
             </el-col>
          </el-row>
          <el-row>
             <el-col :span="12">
                <el-form-item label="役職">
                   <el-select v-model="form.postIds" multiple placeholder="選んでください" :disabled="!canEdit">
                      <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName"
                         :value="item.postId" :disabled="item.status == 1" ></el-option>
                   </el-select>
                </el-form-item>
             </el-col>
             <el-col :span="12">
                <el-form-item label="ロール">
                   <el-select v-model="form.roleIds" multiple placeholder="選んでください" :disabled="!canEdit">
                      <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName"
                         :value="item.roleId" :disabled="item.status == 1" ></el-option>
                   </el-select>
                </el-form-item>
             </el-col>
          </el-row>
          <el-row>
             <el-col :span="24">
                <el-form-item label="備考">
                   <el-input v-model="form.remark" type="textarea" placeholder="備考を入力してください" :disabled="!canEdit"></el-input>
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
    </el-drawer>
 
    <!-- user Input -->
    <el-drawer :title="upload.title" v-model="upload.open" width="400px"  size="60%" append-to-body>
       <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">ここにファイルをドラッグするか、または<em>クリックしてアップロードしてください。</em></div>
          <template #tip>
             <div class="el-upload__tip text-center">
                <div class="el-upload__tip">
                   <el-checkbox v-model="upload.updateSupport" />既存のユーザーデータの更新
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
 
 <script setup name="scftAdmin">
 import { getToken } from "@/utils/auth";
 import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user";
 import cardShadow from "@/components/Customized/cardShadow.vue";
 
 const router = useRouter();
 const { proxy } = getCurrentInstance();
 const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");
 
 const canEdit = ref(true);
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
 /*** ユーザー入力変数 */
 const upload = reactive({
    // ポップアップレイヤーを表示するかどうか（ユーザー入力）
    open: false,
    // ポップアップレイヤータイトル（ユーザー入力）
    title: "",
    // アップロードを無効にするかどうか
    isUploading: false,
    // 既存のユーザーデータの更新
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
    { key: 4, label: `電話番号`, visible: true },
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
       userName: [{ required: true, message: "ユーザー名は必須", trigger: "blur" }, { min: 2, max: 20, message: "2文字以上20文字以内を入力してください", trigger: "blur" }],
       nickName: [{ required: true, message: "ニックネームは必須", trigger: "blur" }],
       password: [{ required: true, message: "パスワードは必須", trigger: "blur" }, { min: 5, max: 20, message: "5文字以上20文字以内を入力してください", trigger: "blur" }],
       email: [{ type: "email", message: "正しいEメールを入力してください", trigger: ["blur", "change"] }],
       phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい電話番号を入力してください", trigger: "blur" }]
    }
 });
 
 const { queryParams, form, rules } = toRefs(data);
 
 /** 条件付きでノードをフィルターします  */
 const filterNode = (value, data) => {
    if (!value) return true;
    return data.label.indexOf(value) !== -1;
 };
 /** 名前に基づいて部門ツリーをフィルタリングする */
 watch(deptName, val => {
    proxy.$refs["deptTreeRef"].filter(val);
 });
 /** 部門のドロップダウンツリー構造を取得 */
 function getDeptTree() {
    deptTreeSelect().then(response => {
       deptOptions.value = response.data;
    });
 };
 /** クエリユーザーリスト */
 function getList() {
    loading.value = true;
    listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
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
 /** 再読み込みボタンアクション */
 function resetQuery() {
    dateRange.value = [];
    proxy.resetForm("queryRef");
    queryParams.value.deptId = undefined;
    proxy.$refs.deptTreeRef.setCurrentKey(null);
    handleQuery();
 };
 /** 削除ボタンアクション */
 function handleDelete(row) {
    const userIds = row.userId || ids.value;
    proxy.$modal.confirm('ユーザーID"' + userIds + '"を削除してもよろしいでしょうか？').then(function () {
       return delUser(userIds);
    }).then(() => {
       getList();
       proxy.$modal.msgSuccess("削除成功");
    }).catch(() => { });
 };
 /** 役割の割り当て */
 function handleAuthRole(row) {
    const userId = row.userId;
    router.push("/system/user-auth/role/" + userId);
 };
 /** PWDリセット */
 function handleResetPwd(row) {
    proxy.$prompt('"' + row.userName + '"の新しいパスワードを入力してください', "ヒント", {
       confirmButtonText: "確認",
       cancelButtonText: "キャンセル",
       closeOnClickModal: false,
       inputPattern: /^.{5,20}$/,
       inputErrorMessage: "5文字以上20文字以内を入力してください",
    }).then(({ value }) => {
       resetUserPwd(row.userId, value).then(response => {
          proxy.$modal.msgSuccess("編集しました。新しいパスワードは：" + value);
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
    proxy.$refs["uploadRef"].submit();
 };
 /** 再読み込みのform */
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
 /** 選ぶ選ぶり除くボタン */
 function cancel() {
    open.value = false;
    reset();
 };
 /** 追加ボタンアクション */
 function handleAdd() {
    canEdit.value = true;
    reset();
    getUser().then(response => {
       postOptions.value = response.posts;
       roleOptions.value = response.roles;
       open.value = true;
       title.value = "ユーザー情報設定";
       form.value.password = initPassword.value;
    });
 };
 
 /** 編集ボタンアクション */
 function handleUpdateOrView(row, type) {
    if (type == "view") {
       canEdit.value = false;
    } else if (type == "edit") {
       canEdit.value = true;
    }
    reset();
    const userId = row.userId || ids.value;
    getUser(userId).then(response => {
       form.value = response.data;
       postOptions.value = response.posts;
       roleOptions.value = response.roles;
       form.value.postIds = response.postIds;
       form.value.roleIds = response.roleIds;
       open.value = true;
       title.value = "ユーザー編集";
       form.password = "";
    });
 };
 /** [提出]ボタン */
 function submitForm() {
    proxy.$refs["userRef"].validate(valid => {
       if (valid) {
          if (form.value.userId != undefined) {
             updateUser(form.value).then(response => {
                proxy.$modal.msgSuccess("編集成功");
                open.value = false;
                getList();
             });
          } else {
             addUser(form.value).then(response => {
                proxy.$modal.msgSuccess("新規成功");
                open.value = false;
                getList();
             });
          }
       }
    });
 };
 
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