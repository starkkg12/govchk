<template>
    <div class="app-container">
       <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
          <el-form-item label="メニュー名" prop="menuName">
             <el-input
                v-model="queryParams.menuName"
                placeholder="メニュー名を入力してください"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
             />
          </el-form-item>
          <el-form-item label="ステータス" prop="status">
             <el-select v-model="queryParams.status" placeholder="ステータス" clearable style="width: 200px">
                <el-option
                   v-for="dict in sys_normal_disable"
                   :key="dict.value"
                   :label="dict.label"
                   :value="dict.value"
                />
             </el-select>
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
                v-hasPermi="['system:menu:add']"
             >追加</el-button>
          </el-col>
          <el-col :span="1.5">
             <el-button 
                type="info"
                plain
                icon="Sort"
                @click="toggleExpandAll"
             >展開/折りたたむ</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
       </el-row>
 
       <el-table
          v-if="refreshTable"
          v-loading="loading"
          :data="menuList"
          row-key="menuId"
          :default-expand-all="isExpandAll"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
       >
          <el-table-column prop="menuName" label="メニュー名" :show-overflow-tooltip="true" width="160"></el-table-column>
          <el-table-column prop="icon" label="アイコン" align="center" width="100">
             <template #default="scope">
                <svg-icon :icon-class="scope.row.icon" />
             </template>
          </el-table-column>
          <el-table-column prop="orderNum" label="ソート" width="60"></el-table-column>
          <el-table-column prop="perms" label="権限" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="component" label="構成子" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="status" label="ステータス" width="80">
             <template #default="scope">
                <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
             </template>
          </el-table-column>
          <el-table-column label="作成日　時" align="center" width="160" prop="createTime">
             <template #default="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="210" class-name="small-padding fixed-width">
             <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']">編集</el-button>
                <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">追加</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']">削除</el-button>
             </template>
          </el-table-column>
       </el-table>
 
       <!-- 新規、編集 -->
       <el-dialog :title="title" v-model="open" width="680px" append-to-body>
          <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
             <el-row>
                <el-col :span="24">
                   <el-form-item label="親メニュー">
                      <el-tree-select
                         v-model="form.parentId"
                         :data="menuOptions"
                         :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                         value-key="menuId"
                         placeholder="親メニュー選択"
                         check-strictly
                      />
                   </el-form-item>
                </el-col>
                <el-col :span="24">
                   <el-form-item label="メニュータイプ" prop="menuType">
                      <el-radio-group v-model="form.menuType">
                         <el-radio label="M">目次</el-radio>
                         <el-radio label="C">メニュー</el-radio>
                         <el-radio label="F">ボタン</el-radio>
                      </el-radio-group>
                   </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.menuType != 'F'">
                   <el-form-item label="メニューアイコン" prop="icon">
                      <el-popover
                         placement="bottom-start"
                         :width="540"
                         trigger="click"
                      >
                         <template #reference>
                            <el-input v-model="form.icon" placeholder="選択" @blur="showSelectIcon" readonly>
                               <template #prefix>
                                  <svg-icon
                                     v-if="form.icon"
                                     :icon-class="form.icon"
                                     class="el-input__icon"
                                     style="height: 32px;width: 16px;"
                                  />
                                  <el-icon v-else style="height: 32px;width: 16px;"><search /></el-icon>
                               </template>
                            </el-input>
                         </template>
                         <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon" />
                      </el-popover>
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="メニュー名" prop="menuName">
                      <el-input v-model="form.menuName" placeholder="メニュー名を入力してください" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="ソート" prop="orderNum">
                      <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType != 'F'">
                   <el-form-item>
                      <template #label>
                         <span>
                            <el-tooltip content="外部リンクの場合`http(s)://`で始まるが必要" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>外部リンク
                         </span>
                      </template>
                      <el-radio-group v-model="form.isFrame">
                         <el-radio label="0">是</el-radio>
                         <el-radio label="1">否</el-radio>
                      </el-radio-group>
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType != 'F'">
                   <el-form-item prop="path">
                      <template #label>
                         <span>
                            <el-tooltip content="アクセスするルートアドレス、例：`user`。外部リンクの場合`http(s)://`で始まるが必要" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            ルートアドレス
                         </span>
                      </template>
                      <el-input v-model="form.path" placeholder="ルートアドレスを入力してください" />
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType == 'C'">
                   <el-form-item prop="component">
                      <template #label>
                         <span>
                            <el-tooltip content="アクセスされるコンポーネントのパス、例：`system/user/index`，デフォルトは`views`" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            コンポーネントパス
                         </span>
                      </template>
                      <el-input v-model="form.component" placeholder="コンポーネントパスを入力してください" />
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType != 'M'">
                   <el-form-item>
                      <el-input v-model="form.perms" placeholder="権限文字列を入力してください" maxlength="100" />
                      <template #label>
                         <span>
                            <el-tooltip content="コントローラーで定義された権限文字列、例：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            権限文字列
                         </span>
                      </template>
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType == 'C'">
                   <el-form-item>
                      <el-input v-model="form.query" placeholder="ルートパラメータを入力してください" maxlength="255" />
                      <template #label>
                         <span>
                            <el-tooltip content='ルートのデフォルトのパラメータ、例：`{"id": 1, "name": "ry"}`' placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            ルートパラメータ
                         </span>
                      </template>
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType == 'C'">
                   <el-form-item>
                      <template #label>
                         <span>
                            <el-tooltip content="選択された場合`keep-alive`キャッシュが有効になり、コンポーネントの`name`とアドレスが一致している必要があります" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            キャッシュする
                         </span>
                      </template>
                      <el-radio-group v-model="form.isCache">
                         <el-radio label="0">キャッシュ</el-radio>
                         <el-radio label="1">しない</el-radio>
                      </el-radio-group>
                   </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.menuType != 'F'">
                   <el-form-item>
                      <template #label>
                         <span>
                            <el-tooltip content="選択を非表示にすると、そのルートはサイドバーに表示されませんが、アクセスは引き続き可能です" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            表示ステータス
                         </span>
                      </template>
                      <el-radio-group v-model="form.visible">
                         <el-radio
                            v-for="dict in sys_show_hide"
                            :key="dict.value"
                            :label="dict.value"
                         >{{ dict.label }}</el-radio>
                      </el-radio-group>
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item>
                      <template #label>
                         <span>
                            <el-tooltip content="選択を停止すると、そのルートはサイドバーに表示されず、アクセスもできなくなります" placement="top">
                               <el-icon><question-filled /></el-icon>
                            </el-tooltip>
                            メニューステータス
                         </span>
                      </template>
                      <el-radio-group v-model="form.status">
                         <el-radio
                            v-for="dict in sys_normal_disable"
                            :key="dict.value"
                            :label="dict.value"
                         >{{ dict.label }}</el-radio>
                      </el-radio-group>
                   </el-form-item>
                </el-col>
             </el-row>
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
 
 <script setup name="Menu">
 import { addMenu, delMenu, getMenu, listMenu, updateMenu } from "@/api/system/menu";
 import SvgIcon from "@/components/SvgIcon";
 import IconSelect from "@/components/IconSelect";
 
 const { proxy } = getCurrentInstance();
 const { sys_show_hide, sys_normal_disable } = proxy.useDict("sys_show_hide", "sys_normal_disable");
 
 const menuList = ref([]);
 const open = ref(false);
 const loading = ref(true);
 const showSearch = ref(true);
 const title = ref("");
 const menuOptions = ref([]);
 const isExpandAll = ref(false);
 const refreshTable = ref(true);
 const iconSelectRef = ref(null);
 
 const data = reactive({
   form: {},
   queryParams: {
     menuName: undefined,
     visible: undefined
   },
   rules: {
     menuName: [{ required: true, message: "メニュー名は必須", trigger: "blur" }],
     orderNum: [{ required: true, message: "メニューソートは必須", trigger: "blur" }],
     path: [{ required: true, message: "ルートアドレスは必須", trigger: "blur" }]
   },
 });
 
 const { queryParams, form, rules } = toRefs(data);
 
 /** リスト取得 */
 function getList() {
   loading.value = true;
   listMenu(queryParams.value).then(response => {
     menuList.value = proxy.handleTree(response.data, "menuId");
     loading.value = false;
   });
 }
 /** メニューのドロップダウンツリー構造を取得 */
 function getTreeselect() {
   menuOptions.value = [];
   listMenu().then(response => {
     const menu = { menuId: 0, menuName: "主メニュー", children: [] };
     menu.children = proxy.handleTree(response.data, "menuId");
     menuOptions.value.push(menu);
   });
 }
 /** キャンセルボタン */
 function cancel() {
   open.value = false;
   reset();
 }
 /** リセット */
 function reset() {
   form.value = {
     menuId: undefined,
     parentId: 0,
     menuName: undefined,
     icon: undefined,
     menuType: "M",
     orderNum: undefined,
     isFrame: "1",
     isCache: "0",
     visible: "0",
     status: "0"
   };
   proxy.resetForm("menuRef");
 }
 /** ドロップダウンアイコンを表示 */
 function showSelectIcon() {
   iconSelectRef.value.reset();
 }
 /** アイコン選択する */
 function selected(name) {
   form.value.icon = name;
 }
 /** 検索処理 */
 function handleQuery() {
   getList();
 }
 /** リセット処理*/
 function resetQuery() {
   proxy.resetForm("queryRef");
   handleQuery();
 }
 /** 追加処理 */
 function handleAdd(row) {
   reset();
   getTreeselect();
   if (row != null && row.menuId) {
     form.value.parentId = row.menuId;
   } else {
     form.value.parentId = 0;
   }
   open.value = true;
   title.value = "メニュー追加";
 }
 /** 展開/折りたたむ */
 function toggleExpandAll() {
   refreshTable.value = false;
   isExpandAll.value = !isExpandAll.value;
   nextTick(() => {
     refreshTable.value = true;
   });
 }
 /** 編集処理 */
 async function handleUpdate(row) {
   reset();
   await getTreeselect();
   getMenu(row.menuId).then(response => {
     form.value = response.data;
     open.value = true;
     title.value = "メニュー編集";
   });
 }
 /** コミット */
 function submitForm() {
   proxy.$refs["menuRef"].validate(valid => {
     if (valid) {
       if (form.value.menuId != undefined) {
         updateMenu(form.value).then(response => {
           proxy.$modal.msgSuccess("編集成功");
           open.value = false;
           getList();
         });
       } else {
         addMenu(form.value).then(response => {
           proxy.$modal.msgSuccess("新規成功");
           open.value = false;
           getList();
         });
       }
     }
   });
 }
 /** 削除ボタン操作 */
 function handleDelete(row) {
  proxy.$modal.confirm('メニュー"' + row.menuName + '"を削除してもよろしいでしょうか？').then(function () {
     return delMenu(row.menuId);
   }).then(() => {
     getList();
     proxy.$modal.msgSuccess("削除成功");
   }).catch(() => {});
 }
 
 getList();
 </script>
 