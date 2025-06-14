<template>
   <!-- 認確かにユーザー -->
   <el-dialog title="ユーザーを選択してください" v-model="visible" width="800px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="ユーザー名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザー名を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="電話番号" prop="phonenumber">
            <el-input
               v-model="queryParams.phonenumber"
               placeholder="電話番号を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
         </el-form-item>
      </el-form>
      <el-row>
         <el-table @row-click="clickRow" ref="refTable" :data="userList" @selection-change="handleSelectionChange" height="260px">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="ユーザー名" prop="userName" :show-overflow-tooltip="true" />
            <el-table-column label="ニックネーム" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column label="Eメール" prop="email" :show-overflow-tooltip="true" />
            <el-table-column label="携帯電話" prop="phonenumber" :show-overflow-tooltip="true" />
            <el-table-column label="ステータス" align="center" prop="status">
               <template #default="scope">
                  <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
               </template>
            </el-table-column>
            <el-table-column label="作成日　" align="center" prop="createTime" width="180">
               <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
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
      </el-row>
      <template #footer>
         <div class="dialog-footer">
            <el-button type="primary" @click="handleSelectUser">確認</el-button>
            <el-button @click="visible = false">キャンセル</el-button>
         </div>
      </template>
   </el-dialog>
</template>

<script setup name="SelectUser">
import { authUserSelectAll, unallocatedUserList } from "@/api/system/role";

const props = defineProps({
  roleId: {
    type: [Number, String]
  }
});

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const visible = ref(false);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined
});

// 爆弾フレームを表示します
function show() {
  queryParams.roleId = props.roleId;
  getList();
  visible.value = true;
}
/**選択 */
function clickRow(row) {
  proxy.$refs["refTable"].toggleRowSelection(row);
}
// マルチ選択ボックスはデータを選択します
function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId);
}
// クエリテーブルデータ
function getList() {
  unallocatedUserList(queryParams).then(res => {
    userList.value = res.rows;
    total.value = res.total;
  });
}
/** 検索ボタン操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
/** 再読み込みボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
const emit = defineEmits(["ok"]);
/** 選択認確かにユーザー操作 */
function handleSelectUser() {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(",");
  if (uIds == "") {
    proxy.$modal.msgError("割り当てるユーザーを選択してください");
    return;
  }
  authUserSelectAll({ roleId: roleId, userIds: uIds }).then(res => {
    proxy.$modal.msgSuccess(res.msg);
    if (res.code === 200) {
      visible.value = false;
      emit("ok");
    }
  });
}

defineExpose({
  show,
});
</script>
