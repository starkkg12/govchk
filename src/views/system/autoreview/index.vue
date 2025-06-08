<template>
    <cardShadow>
        <template #header-title>
            自動審査一覧
        </template>
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
            <el-row>
              <el-col :span="8">
                <el-form-item label="フロー名：" prop="serviceId" style="width: 100%">
                  <el-input v-model="queryParams.serviceId" clearable @keyup.enter="handleQuery" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8" align="end" style="padding-left: 20px; width: 100%"></el-col>
              <el-col :span="8" align="end">
                <el-form-item>
                  <el-button @click="newWindow" style="background-color: #D5E8D4">新規フロー図</el-button>
                  <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
                  <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row class="autoreviewdate">
              <el-col :span="8">
                <el-form-item label="時間：　　" prop="createdTime" justify="start" style="width:100%">
                  <el-date-picker clearable label="から" v-model="queryParams.createdTime" type="date" value-format="YYYY-MM-DD"
                    class="narrowDatePicker">
                  </el-date-picker>
                  <span style="position: absolute; top: -30px; left: 42%; float: right;">から</span>
                  <el-date-picker clearable v-model="queryParams.createdTimeEnd" type="date" value-format="YYYY-MM-DD"
                  class="narrowDatePicker">
                  </el-date-picker>
                  <span style="position: absolute; top: -30px; right: 3%; float: right;">まで</span>
                </el-form-item>
              </el-col>
            </el-row>
        </el-form>
        <el-table  :data="applicationList" @selection-change="handleSelectionChange">
          <el-table-column label="ID" align="center" prop="id" sortable min-width="35px">
            <template #default="scope">
              <div style="width: 100%; text-align: right">{{ scope.row.id }} </div>
            </template>
          </el-table-column>
          <el-table-column label="フロー名" align="center" prop="name" min-width="150px">
            <template #default="scope">
              <div style="width: 100%; text-align: left">{{ scope.row.name }} </div>
            </template>
          </el-table-column>
          <el-table-column label="ステータス" align="left" prop="status" min-width="44px">
            <!-- <template #default="scope">
              <el-tag v-if="scope.row.status in statusList" :type="statusList[scope.row.status].type" size="mini">
                {{ statusList[scope.row.status].label }}
              </el-tag>
            </template> -->
          </el-table-column>
          <el-table-column label="前回実行ユーザ" align="center" prop="execuser" sortable min-width="44px">
            
          </el-table-column>
          <el-table-column label="前回実行日時" align="center" prop="createdTime" sortable min-width="44px">
            <template #default="scope">
              <div style="white-space: pre-line">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}\n{h}:{i}') }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <el-button link type="primary" icon="Edit" />
            <el-button link type="primary" icon="View" />
            <el-button link type="primary" icon="Delete" />
          </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
      <el-drawer v-model="open" width="500px"></el-drawer>
    </cardShadow>
</template>
<script setup name="Autoreview">
import cardShadow from "@/components/Customized/cardShadow";
const open = ref(false);
const showSearch = ref(true);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createdTime: null,
    userId: null,
    serviceId: null,
    status:null
  },
  rules: {
  }
});

const applicationList = ref([
  {
    id: "3253454",
    name: "後期高齢者医療保険料過誤納金",
    status: "未使用",
    execuser: "-",
    createdTime: "",
  },
  {
    id: "6702371",
    name: "後期高齢者医療保険料口座振替依頼書",
    status: "一時停止",
    execuser: "-",
    createdTime: "",
  },
  {
    id: "2340522",
    name: "後期高齢者医療葬祭費及び葬祭給付金支給申請書",
    status: "稼働中",
    execuser: "鈴木",
    createdTime: "2024-01-05 14:29:15",
  },
  {
    id: "3246032",
    name: "後期高齢者医療葬祭費及び",
    status: "稼働中",
    execuser: "中田",
    createdTime: "2024-01-05 14:29:15",
  }
])

const { queryParams, form, rules } = toRefs(data);

// 検索 エリア
/** 検索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  // getList();
}
/** リセット */
function resetQuery() {
  proxy.resetForm("queryRef");
  // handleQuery();
}
function newWindow() {
  open.value = true;
}
</script>
<style>
.el-col {
  margin-bottom: 1%;
}

.autoreviewdate > .el-form--inline .el-form-item {
  display: unset!important;
  vertical-align: unset!important;
  margin-right: unset!important;
}
</style>