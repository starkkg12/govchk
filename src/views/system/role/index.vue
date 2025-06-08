<template>
   <cardShadow>
     <template #header-title>
      メニュー管理
     </template>
  
     <el-row style="margin-top:80px" :gutter="10" class="mb8" v-if="false">
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

     <!-- テーブルデータ -->
     <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange" @sort-change="sortData">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="ロールID" prop="roleId" width="120" /> -->
        <el-table-column label="ID" prop="roleId" width="120" />
        <el-table-column label="権限名" prop="roleName" :show-overflow-tooltip="true"   />
        <!-- <el-table-column label="ロール" prop="roleKey" :show-overflow-tooltip="true" width="150" /> -->
        <!-- <el-table-column label="表示順" prop="roleSort" width="100" />   -->
        <el-table-column label="利用可否" align="center" width="100">
           <template #default="scope">
            <div>
               <el-tag v-if="scope.row.status === '0'" type="success">はい</el-tag>
               <el-tag v-else type="danger">いいえ</el-tag>
            </div>
              <!-- <el-switch
                 v-model="scope.row.status"
                 active-value="0"
                 inactive-value="1"
                 @change="handleStatusChange(scope.row)"
              ></el-switch> -->
           </template>
        </el-table-column>
        <el-table-column label="作成日" width="160" align="center" prop="createTime" sortable >
         <template #default="scope">
            <!-- only show to minutes -->
             <div style="white-space: pre-line;">{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</div>
         </template>
        </el-table-column>
        <!-- <el-table-column label="作成時間" align="center" prop="createTime">
           <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
           </template>
        </el-table-column> -->
        <el-table-column label="操作" width="120" align="center" class-name="small-padding fixed-width">
           <template #default="scope">
            <!-- 編集 v-hasPermi="['system:role:edit']"-->
             <el-tooltip content="編集" placement="top">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" ></el-button>
             </el-tooltip>
             <!-- 参照 v-hasPermi="['system:role:remove']"-->
             <el-tooltip content="詳細" placement="top">
               <el-button link type="primary" icon="View" @click="handleUpdate(scope.row,true)" ></el-button>
             </el-tooltip>

             <!-- <el-tooltip content="削除" placement="top" v-if="scope.row.roleId !== 1">
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']"></el-button>
             </el-tooltip>
             <el-tooltip content="データ権限" placement="top" v-if="scope.row.roleId !== 1">
               <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
             </el-tooltip>
             <el-tooltip content="ユーザーを割り当て" placement="top" v-if="scope.row.roleId !== 1">
               <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
             </el-tooltip> -->
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

     <!-- 追加、編集 -->
     <el-drawer  v-model="open" width="90%" append-to-body size="90%">
      <h1>{{ title }}</h1>
      <el-row style="margin-top: 3%">
        <el-col :offset="4" :span="16">
          <el-form ref="roleRef" :model="form" :rules="rules" label-width="120px" :disabled="formDisable" style="width:70%;">
<!--           <el-form-item label="ID" prop="roleId" style="width:60%;">-->
<!--              <el-input v-model="form.roleId"/>-->
<!--           </el-form-item>-->
           <el-form-item label="権限名" prop="roleName" style="width:60%;">
              <el-input v-model="form.roleName" maxlength="30" show-word-limit/>
           </el-form-item>
           <el-form-item prop="roleKey" style="width:60%;">
              <template #label>
                 <span>
                    <el-tooltip content="コントローラー内で確かに定義されたロールの例：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                       <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    権限
                 </span>
              </template>
              <el-input v-model="form.roleKey" maxlength="100" show-word-limit/>
           </el-form-item>
           <el-form-item label="権限オーダー" prop="roleSort">
              <el-input-number v-model="form.roleSort" controls-position="right" :min="0"/>
           </el-form-item>
           <el-form-item label="ステータス">
              <el-radio-group v-model="form.status">
                 <el-radio
                    v-for="dict in sys_normal_disable"
                    :key="dict.value"
                    :label="dict.value"
                 >{{ dict.label }}</el-radio>
              </el-radio-group>
           </el-form-item>
           <el-form-item label="メニュー権限">
              <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展開/折りたたむ</el-checkbox>
              <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全選択/全選択解除</el-checkbox>
              <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">親 - 子リンケージ</el-checkbox>
              <el-tree
                 class="tree-border"
                 :data="menuOptions"
                 show-checkbox
                 ref="menuRef"
                 node-key="id"
                 :check-strictly="!form.menuCheckStrictly"
                 empty-text="読み込み中，お待ちください"
                 :props="{ label: 'label', children: 'children' }"
              ></el-tree>
           </el-form-item>
           <el-form-item label="備考">
              <el-input v-model="form.remark" type="textarea" placeholder="備考を入力してください"></el-input>
           </el-form-item>
          </el-form>
        </el-col>
      </el-row>
     
        <template #footer>
           <div class="dialog-footer">
              <el-button type="primary" v-if="!formDisable" @click="submitForm">確認</el-button>
              <el-button v-if="formDisable" @click="cancel">×　閉じる</el-button>
              <el-button v-if="!formDisable" @click="cancel">キャンセル</el-button>
           </div>
        </template>
     </el-drawer>
  </cardShadow>
</template>

<script setup name="Role">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from "@/api/system/role";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";
import cardShadow from "@/components/Customized/cardShadow.vue";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const roleList = ref([]);
const open = ref(false);
const loading = ref(false); // todo
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref([]);
const openDataScope = ref(false);
const menuRef = ref(null);
const deptRef = ref(null);

const formDisable =ref(false)
const data = reactive({
 form: {},
 queryParams: {
   pageNum: 1,
   pageSize: 10,
   roleName: undefined,
   roleKey: undefined,
   status: undefined,
   orderByColumn: null,
   isAsc: 'asc',
 },
 rules: {
   roleName: [{ required: true, message: "権限名を入力してください", trigger: "blur" }],
   roleKey: [{ required: true, message: "権限キーを入力してください", trigger: "blur" }],
   //roleSort: [{ required: true, message: "権限ソートを入力してください", trigger: "blur" }, {message: "4桁数以内で入力してください", trigger: "blur" }]
   roleSort:[{ required: true, validator: roleSortLength, trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);
const disabled = ref(false);

/** コーナーリストをクエリします */
function getList() {
 loading.value = true;
 listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
   roleList.value = response.rows;
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
 handleQuery();
}
/** 削除ボタン */
function handleDelete(row) {
 const roleIds = row.roleId || ids.value;
 proxy.$modal.confirm('ロール"' + roleIds + '"を削除してもよろしいでしょうか？').then(function () {
   return delRole(roleIds);
 }).then(() => {
   getList();
   proxy.$modal.msgSuccess("削除成功");
 }).catch(() => {});
}
/** 出力ボタン */
function handleExport() {
 proxy.download("system/role/export", {
   ...queryParams.value,
 }, `role_${new Date().getTime()}.xlsx`);
}
/** マルチ選択ボックスはデータを選択します */
function handleSelectionChange(selection) {
 ids.value = selection.map(item => item.roleId);
 single.value = selection.length != 1;
 multiple.value = !selection.length;
}
/** 角色ステータス編集 */
function handleStatusChange(row) {
 let text = row.status === "0" ? "有効" : "無効";
 proxy.$modal.confirm('"' + row.roleName + '"を' + text + 'にしてよろしいでしょうか？').then(function () {
   return changeRoleStatus(row.roleId, row.status);
 }).then(() => {
   proxy.$modal.msgSuccess(text + "成功");
 }).catch(function () {
   row.status = row.status === "0" ? "1" : "0";
 });
}
/** 上記以外のボタン処理 */
function handleCommand(command, row) {
 switch (command) {
   case "handleDataScope":
     handleDataScope(row);
     break;
   case "handleAuthUser":
     handleAuthUser(row);
     break;
   default:
     break;
 }
}
/** ユーザーを割り当てます */
function handleAuthUser(row) {
 router.push("/system/role-auth/user/" + row.roleId);
}
/** クエリメニューツリー構造 */
function getMenuTreeselect() {
 menuTreeselect().then(response => {
   menuOptions.value = response.data;
 });
}
/** すべての部門ノードデータ */
function getDeptAllCheckedKeys() {
 // 選択した部門ノードが現在選択されています
 let checkedKeys = deptRef.value.getCheckedKeys();
 // ハーフ選挙での部門ノード
 let halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
 checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
 return checkedKeys;
}
/** リセット  */
function reset() {
 if (menuRef.value != undefined) {
   menuRef.value.setCheckedKeys([]);
 }
 menuExpand.value = false;
 menuNodeAll.value = false;
 deptExpand.value = true;
 deptNodeAll.value = false;
 form.value = {
   roleId: undefined,
   roleName: undefined,
   roleKey: undefined,
   roleSort: 0,
   status: "0",
   menuIds: [],
   deptIds: [],
   menuCheckStrictly: true,
   deptCheckStrictly: true,
   remark: undefined
 };
 proxy.resetForm("roleRef");
}
/** 役割を追加します */
function handleAdd() {
 reset();
 getMenuTreeselect();
 open.value = true;
 title.value = "ロールを追加します";
}
/** 編集 */
function handleUpdate(row,viewFlag) {
 formDisable.value = viewFlag === true ? true : false;
 reset();
 const roleId = row.roleId || ids.value;

 const roleMenu = getRoleMenuTreeselect(roleId);
 getRole(roleId).then(response => {
   form.value = response.data;
   form.value.roleSort = Number(form.value.roleSort);
   open.value = true;
   nextTick(() => {
     roleMenu.then((res) => {
       let checkedKeys = res.checkedKeys;
       checkedKeys.forEach((v) => {
         nextTick(() => {
           menuRef.value.setChecked(v, true, false);
         });
       });
     });
   });
   title.value = "メニュー管理 詳細情報";
 });
 
}
/** 役割によるとIDクエリメニューツリー構造 */
function getRoleMenuTreeselect(roleId) {
 return roleMenuTreeselect(roleId).then(response => {
   menuOptions.value = response.menus;
   return response;
 });
}
/** 役割によるとIDクエリ部門のツリー構造 */
function getDeptTree(roleId) {
 return deptTreeSelect(roleId).then(response => {
   deptOptions.value = response.depts;
   return response;
 });
}
/** ツリーの展開を制御（拡大する/折り畳み）*/
function handleCheckedTreeExpand(value, type) {
 if (type == "menu") {
   let treeList = menuOptions.value;
   for (let i = 0; i < treeList.length; i++) {
     menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
   }
 } else if (type == "dept") {
   let treeList = deptOptions.value;
   for (let i = 0; i < treeList.length; i++) {
     deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
   }
 }
}
/** 値に基づいて、特定のタイプ（type）のツリー内のすべてのノードをチェックまたはチェック解除する（すべて選択/すべてを選択してください） */
function handleCheckedTreeNodeAll(value, type) {
 if (type == "menu") {
   menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
 } else if (type == "dept") {
   deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
 }
}
/** 値に基づいて、特定のタイプ（type）のツリーでチェックの厳格さを制御する（父 - ソンリンケージ） */
function handleCheckedTreeConnect(value, type) {
 if (type == "menu") {
   form.value.menuCheckStrictly = value ? true : false;
 } else if (type == "dept") {
   form.value.deptCheckStrictly = value ? true : false;
 }
}
/** すべてのメニューノードデータ */
function getMenuAllCheckedKeys() {
 // 選択したメニューノードが現在選択されています
 let checkedKeys = menuRef.value.getCheckedKeys();
 // セミ選出のメニューノード
 let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
 checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
 return checkedKeys;
}
/** [提出]ボタン */
function submitForm() {
 proxy.$refs["roleRef"].validate(valid => {
   if (valid) {
     if (form.value.roleId != undefined) {
       form.value.menuIds = getMenuAllCheckedKeys();
       updateRole(form.value).then(response => {
         proxy.$modal.msgSuccess("編集成功");
         open.value = false;
         getList();
       });
     } else {
       form.value.menuIds = getMenuAllCheckedKeys();
       addRole(form.value).then(response => {
         proxy.$modal.msgSuccess("新規成功");
         open.value = false;
         getList();
       });
     }
   }
 });
}
/** キャンセルボタン */
function cancel() {
 open.value = false;
 reset();
}
/** 特定のロールで以下の処理を実行 */
function dataScopeSelectChange(value) {
 if (value !== "2") {
   deptRef.value.setCheckedKeys([]);
 }
}
/** データ権限を分配する処理 */
function handleDataScope(row) {
 reset();
 const deptTreeSelect = getDeptTree(row.roleId);
 getRole(row.roleId).then(response => {
   form.value = response.data;
   openDataScope.value = true;
   nextTick(() => {
     deptTreeSelect.then(res => {
       nextTick(() => {
         if (deptRef.value) {
           deptRef.value.setCheckedKeys(res.checkedKeys);
         }
       });
     });
   });
   title.value = "分配データ権限";
 });
}
/** [提出]ボタン（データ権限） */
function submitDataScope() {
   // confirm message
   proxy.$confirm("###title", "###内容", {
       confirmButtonText: "確認",
       cancelButtonText: "キャンセル",
       type: "warning"
    }).then(() => {
       // submit
       if (form.value.roleId != undefined) {
         form.value.deptIds = getDeptAllCheckedKeys();
         dataScope(form.value).then(response => {
           proxy.$modal.msgSuccess("編集成功");
           openDataScope.value = false;
           getList();
         });
       }
       // todo 追加の場合
    }).catch(() => {
       proxy.$modal.msgInfo("キャンセル");
    });
}

/** キャンセルボタン（データ権限）*/
function cancelDataScope() {
 openDataScope.value = false;
 reset();
}

function  roleSortLength (rule, value, callback)  {
  //console.log('value',value);
  if (value==null || value==undefined) {
    callback(new Error("権限ソートを入力してください。"));
  } else if(value>9999){
    callback(new Error("4桁数以内で入力してください。"));
  }else {
    callback();
  }
};

function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  getList();
}
getList();
</script>
