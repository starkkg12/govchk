<template>
    <cardShadow>
        <template #header-title>
            有効期限確認一覧
        </template>
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
            <el-row>
              <el-col :span="16">
                <el-form-item label="キーワード" prop="keyWord" >
                  <el-input v-model="queryParams.keyWord" clearable @keyup.enter="handleQuery" class="inputArea"/>
                </el-form-item>
              </el-col>
              <el-col :span="8" align="end">
                <el-form-item>
                  <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
                  <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row >
              <el-col :span="24">
                <el-form-item label="時間　　　" prop="createdTime" justify="start">
                  <el-date-picker clearable label="から" v-model="queryParams.start" type="date" value-format="YYYY-MM-DD"
                    class="narrowDatePicker">
                  </el-date-picker>
                  <span style="padding: 0 6px;">～</span>
                  <el-date-picker clearable v-model="queryParams.end" type="date" value-format="YYYY-MM-DD"
                  class="narrowDatePicker">
                  </el-date-picker>
                  
                </el-form-item>
              </el-col>
            </el-row>
        </el-form>
        <el-table  :data="applicationList" @selection-change="handleSelectionChange" @sort-change="sortData">
          <el-table-column label="削除予定日時" align="center" prop="validTimeEnd" sortable min-width="50px">
            <template #default="scope">
                <div style="white-space: pre-line">{{ parseTime(scope.row.validTimeEnd, '{y}-{m}-{d}\n{h}:{i}') }}</div>
              </template>
          </el-table-column>
          <el-table-column label="所有者" align="center" prop="name" max-width="50px">
            <template #default="scope">
              <div style="width: 100%; text-align: left">{{ scope.row.name }} </div>
            </template>
          </el-table-column>
          <el-table-column label="ファイル名" align="left" prop="fileName" min-width="44px">
            
          </el-table-column>
          <el-table-column label="類別" align="center" prop="fileType" sortable min-width="44px">
            
          </el-table-column>
          <el-table-column label="サイズ" align="center" prop="fileSize" min-width="44px">
            
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="詳細" placement="top">
                <el-button link type="primary" icon="View" @click="viewImg(scope.row.filePath)"/>
              </el-tooltip>
            </template>
          </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
      
    </cardShadow>
</template>
<script setup name="Autoreview">
import cardShadow from "@/components/Customized/cardShadow";
import { getEffectiveDateFiles } from "@/api/system/application/file.js";
const open = ref(false);
const showSearch = ref(true);
const total = ref(0);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyWord: null,
    start: null,
    end: null,
    orderByColumn: null,
    isAsc: 'asc',
  },
  rules: {
  }
});

const applicationList = ref([])

const { queryParams, form, rules } = toRefs(data);

// 検索 エリア
/** 検索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getEffectiveDateFiles(queryParams.value).then((response) => {
    if (response.code === 200) {
        applicationList.value = response.rows;
        total.value = response.total;
    }
  })
}
function getList() {
  getEffectiveDateFiles(queryParams.value).then((response) => {
    if (response.code === 200) {
        applicationList.value = response.rows;
        total.value = response.total;
    }
  })
}
/** リセット */
function resetQuery() {
  queryParams.value.start = null;
  queryParams.value.end = null;
  queryParams.value.keyWord = null;
  handleQuery();
}
function viewImg(file) {
  window.open("/dev-api"+file);
}

function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  handleQuery();
}
handleQuery();
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