<template>
  <cardShadow>
      <template #header-title>
        請求情報
      </template>
      <el-form :model="queryParams" :rules="searchRules" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
        <el-row  >
          <el-col :span="6" >
            <el-form-item label="自治体名" prop="govId" style="width: 100%;" >
              <el-select v-model="queryParams.govId" filterable remote  placeholder="自治体名を入力ください" :remote-method="searchGov" :popper-append-to-body="false" v-down="loadmore" clearable @clear="clearGovId">
                <el-option v-for="item in govOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="18" align="end" min-width="200px">
            <el-form-item>
              <el-button class="buttonShadow" icon="Refresh" @click="resetQuery">リセット</el-button>
              <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery">検索</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10" >
          <el-form-item label="請求月" prop="status" style="width: 300px">
            <el-select clearable v-model="searchMonth" >
              <el-option v-for="item in months" :key="item.value" :value="item.value" :label="item.label" />
            </el-select>
          </el-form-item>
          </el-col>
          <el-col :span="14" align="end" min-width="200px">
            <el-form-item>
              <el-button
                  class="buttonShadow"
                  type="warning"
                  plain
                  icon="Download"
                  @click="handleExport"
              >出力</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-row style="width: 20%; float: right; margin-bottom: 10px;">
          <span style="width: 100%; text-align: right;">請求金額(円): {{ totalAmount }}</span>
      </el-row>
      <div class="clearfix"></div>
      <el-table ref="tableRef" :data="applicationList" @selection-change="handleSelectionChange" @sort-change="sortData">
        <el-table-column v-if="isAdmin" label="自治体名" align="center" prop="name" sortable min-width="160px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.name }} </div>
          </template>
        </el-table-column>
        <el-table-column label="加入料金プラン" align="center" prop=""  min-width="180px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.planName }} </div>
          </template>
        </el-table-column>
        <el-table-column label="審査業務" align="center" prop="applicationName"  min-width="150px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.applicationName }} </div>
          </template>
        </el-table-column>
        <el-table-column label="請求担当者-所属" align="center" prop=""  min-width="180px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.department }} </div>
          </template>
        </el-table-column>
        <el-table-column label="請求担当者-氏名" align="center" prop=""  min-width="180px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.fullName }} </div>
          </template>
        </el-table-column>
        <el-table-column label="受付番号" align="center" prop=""  min-width="150px">
          <template #default="scope">
            <div style="width: 100%; text-align: right">{{ scope.row.receiptNumber }} </div>
          </template>
        </el-table-column>
        <el-table-column label="シート数" align="center" prop=""  min-width="120px">
          <template #default="scope">
            <div style="width: 100%; text-align: right">{{ scope.row.sheets }} </div>
          </template>
        </el-table-column>

        <el-table-column label="送信日時" align="center" prop="createdTime" sortable min-width="180px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.createdTime }} </div>
          </template>
        </el-table-column>
        <el-table-column label="返却日時" align="center" prop=""  min-width="180px">
          <template #default="scope">
            <div style="width: 100%; text-align: left">{{ scope.row.amount === '集計中' ? '' :  scope.row.updatedTime }} </div>
          </template>
        </el-table-column>

        <!-- <el-table-column label="未完了" align="center" prop="unfinished" sortable min-width="50px">
        </el-table-column>
        <el-table-column label="完了" align="center" prop="finished" sortable min-width="50px">
        </el-table-column> -->
        <el-table-column label="利用料金(円)" align="center" prop="amount"  min-width="160px">
          <template #default="scope">
            {{ scope.row.amount !== 'NaN' && (scope.row.status === 5 || scope.row.status === 99) ? scope.row.amount : '集計中' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="残りチケット数" align="center" prop="ticketsRemaining" sortable min-width="50px">
        </el-table-column> -->
        <el-table-column label="操作" align="center" min-width="60px" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="出力" placement="top">
              <el-button :disabled="scope.row.amount === '集計中' ? true : false" link type="primary" icon="Download" @click="download(scope.row.receiptNumber)" />
            </el-tooltip>
          </template>
        </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
    
  </cardShadow>
</template>
<script setup name="AutoreviewMaster">
import cardShadow from "@/components/Customized/cardShadow";
import { getMonthlyReportList, getMonthlyReportTotalAmount, listGovByName } from "@/api/system/gov";
import { getMonths, getLastDate } from '@/utils/theme'
import { parseTime } from '@/utils/ruoyi'

import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance();
const currentUserRoleKey = useUserStore().roles[0]
const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'
const months = ref([{label: " ", value: null}]);
const total = ref(0);
const tableRef = ref();
const govOptions = ref([])
const nextPage = ref(false);


const applicationList = ref([]);
const totalAmount = ref(0);
const searchMonth = ref(null);
const showSearch = ref(true);

const queryParams = ref({
govId: null,
userId: null,
searchStart: null,
searchEnd: null,
status: 1,
pageNum: 1,
pageSize: 10,
orderByColumn: null,
isAsc: 'asc',
})



// 検索 エリア
/** 検索 */
function handleQuery() {
//console.log("change")
queryParams.value.pageNum = 1;
queryParams.value.searchStart = searchMonth.value != null ? searchMonth.value + '-01 00:00:00' : null;
queryParams.value.searchEnd =  searchMonth.value != null ? searchMonth.value + '-'+ getLastDate(searchMonth.value) + ' 23:59:59' : null;
getList();
getTotalAmount();
}
/** リセット */
function resetQuery() {
searchMonth.value = null;
queryParams.value.pageNum = 1;
queryParams.value.searchStart = null;
queryParams.value.searchEnd = null;
proxy.resetForm("queryRef");
handleQuery();
}

const getList = () => {
  getMonthlyReportList(queryParams.value).then((response) => {
    if (response.code === 200) {
      total.value = response.total;
      applicationList.value = response.rows;
      applicationList.value.map((item) => {
        
        item.amount = 
        item.status !== 5 && item.status !== 99 ? '集計中' : 
        (item.shinePriceStandard === null ||
        item.shinePriceToday === null ||
        item.shinePriceTwohours === null)
        ? '集計中' : (
        parseFloat(item.shinePriceStandard === null ?  0 : item.shinePriceStandard) + 
        parseFloat(item.shinePriceToday === null ? 0 : item.shinePriceToday) + 
        parseFloat(item.shinePriceTwohours === null ? 0 : item.shinePriceTwohours));
        
        if (item.amount != '集計中') {
          totalAmount.value += item.amount;
        }
      })

    }
  })
}
const getTotalAmount = () => {
getMonthlyReportTotalAmount(queryParams.value).then((response) => {
  if (response.code === 200) {
    ///totalAmount.value = response.data ? response.data : 0;
  }
});
}
const getMonthArr = () => {
let monthArr = getMonths(6);
monthArr.map((item) => {
  months.value = [...months.value, {
    label: parseTime(item, '{y}年{m}月'),
    value: item
  }]
})
}

const searchGov = (query) => {
  if (
      (queryParams.value.govId === null || queryParams.value.govId === undefined)
  ) {
      if (queryParams.value.name !== query) {
          queryParams.value.name = query.trim() == '' ? null : query;
          queryParams.value.pageNum = 1;
          govOptions.value = [];
      }
      setTimeout(() => {
          searchGovStep2();
      }, 200)
  } 
}

const searchGovStep2 = () => {
  let query = {
      ...queryParams.value,
      status: 0
    }
  listGovByName(query).then(res => {
          const list = res.data
          if (list.length > 0) {
              nextPage.value = queryParams.value.pageNum * 10 >= res.total ? false : true;
              const arr = list.map(item => {
                  return {
                      label: item.name + "( 自治体ID: "+item.showId+" )",
                      value: item.id
                  }
              })
              govOptions.value = govOptions.value.concat(arr);
          } else {
              nextPage.value = false;
          }
      })
}
const loadmore = () => {
  if (nextPage.value) {
      queryParams.value.pageNum += 1;
      searchGovStep2();
  }
}

const clearGovId = () => {
  queryParams.value.govId = null;
  queryParams.value.pageNum = 1;
  getList();
}

/** 出力処理 */
function handleExport() {
proxy.download('system/gov/monthlyReportExport?pageNum='+queryParams.value.pageNum+"&pageSize="+queryParams.value.pageSize, {
  ...queryParams.value
}, `請求情報_${new Date().getTime()}.xlsx`)
}
function download(receiptNumber) {
queryParams.value.receiptNumber = receiptNumber;
handleExport();
}

function sortData(sort) {
//console.log(sort.prop);
queryParams.value.orderByColumn = sort.prop === 'createdTime' ? 'd.create_time' : sort.prop;
queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
getList();
}

getMonthArr();
getList();
getTotalAmount();
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