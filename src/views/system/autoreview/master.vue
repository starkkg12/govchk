<template>
    <cardShadow>
        <template #header-title>
            自動審査マスター管理
        </template>
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
            <el-row>
              <el-col :span="8">
                <el-form-item label="カラム名：" prop="serviceId" style="width: 100%">
                  <el-input v-model="queryParams.serviceId" clearable @keyup.enter="handleQuery" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8" align="end" style="padding-left: 20px; width: 100%"></el-col>
              <el-col :span="8" align="end">
                <el-form-item>
                  <el-button @click="newWindow" style="background-color: #D5E8D4">CSV アップロード</el-button>
                  <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
                  <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row class="autoreviewdate">
              <el-col :span="24">
                <el-form-item label="時間：　　" prop="createdTime" justify="start" style="width:100%">
                  <el-date-picker clearable label="から" v-model="queryParams.createdTime" type="date" value-format="YYYY-MM-DD"
                    class="narrowDatePicker">
                  </el-date-picker>
                  <span style="padding: 0 6px;">～</span>
                  <el-date-picker clearable v-model="queryParams.createdTimeEnd" type="date" value-format="YYYY-MM-DD"
                  class="narrowDatePicker">
                  </el-date-picker>
                  
                </el-form-item>
              </el-col>
            </el-row>
        </el-form>
        <el-table  :data="applicationList" @selection-change="handleSelectionChange">
          <el-table-column label="CSV ID" align="center" prop="id" sortable min-width="35px">
            <template #default="scope">
              <div style="width: 100%; text-align: right">{{ scope.row.id }} </div>
            </template>
          </el-table-column>
          <el-table-column label="カラム名" align="center" prop="name" min-width="150px">
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
          <el-table-column label="関連業務" align="center" prop="relatedWork" sortable min-width="50px">
            <template #default="scope">
                <a href="#">{{ scope.row.relatedWork }}</a>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
                <el-button v-if="scope.row.edit" link type="primary" icon="Edit" />
                <el-button v-if="scope.row.view" link type="primary" icon="View" />
                <el-button v-if="scope.row.delete" link type="primary" icon="Delete" />
            </template>
          </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
      <el-drawer v-model="open" width="500px"></el-drawer>
    </cardShadow>
</template>
<script setup name="AutoreviewMaster">
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
    name: "被保険者番号、請求者名、住所",
    status: "有効",
    relatedWork: "後期高齢者医療保険料過誤納金",
    edit: true,
    view: true,
    delete: true,
  },
  {
    id: "3246032",
    name: "電話番号、住所",
    status: "無効",
    relatedWork: "後期高齢者医療保険料過誤納金",
    edit: true,
    view: true,
    delete: true,
  },
  {
    id: "3246045",
    name: "住所、預金種別、口座名義人",
    status: "有効",
    relatedWork: "後期高齢者医療保険料過誤納金",
    edit: true,
    view: true,
    delete: true,
  },
  {
    id: "3245761",
    name: "被保険者番号、請求者名、住所、電話番号",
    status: "有効",
    relatedWork: "後期高齢者医療保険料過誤納金",
    edit: true,
    view: true,
    delete: true,
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
.narrowDatePicker {
    width: 48% !important;
    margin-right: 2%;
  }
.autoreviewdate > .el-form--inline .el-form-item {
  display: unset!important;
  vertical-align: unset!important;
  margin-right: unset!important;
}
</style>