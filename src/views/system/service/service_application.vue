<template>
  <cardShadow>
    <template #header-title>
      業務状態
    </template>
    <el-row>
      <el-col :offset="4">
        <h6>{{ serviceName}}　ー　申請状態</h6>
      </el-col>
    </el-row>
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-row style="margin-bottom: -8px;">
        <el-col :span="8">
          <el-form-item label="申請ID" prop="id">
            <el-input v-model="queryParams.id" clearable @keyup.enter="handleQuery" style="width:280px"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" align="end">
          <el-form-item label="申請者" prop="username">
            <el-input v-model="queryParams.username" clearable @keyup.enter="handleQuery" style="width:280px" />
          </el-form-item>
        </el-col>
        <el-col :span="8" align="end">
          <el-form-item>
            <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="申込日時" prop="createdTime" justify="start">
            <el-date-picker clearable v-model="queryParams.createdStartTime" type="date" value-format="YYYY-MM-DD"
              class="narrowDatePicker">
            </el-date-picker>
            &nbsp;～&nbsp;
            <el-date-picker clearable v-model="queryParams.createdEndTime" type="date" value-format="YYYY-MM-DD"
            class="narrowDatePicker">
            </el-date-picker>
          </el-form-item>

          <el-form-item label="更新日時" prop="createdTime" justify="start">
            <el-date-picker clearable v-model="queryParams.updateStartTime" type="date" value-format="YYYY-MM-DD"
              class="narrowDatePicker">
            </el-date-picker>
            &nbsp;～&nbsp;
            <el-date-picker clearable v-model="queryParams.updateEndTime" type="date" value-format="YYYY-MM-DD"
            class="narrowDatePicker">
            </el-date-picker>
          </el-form-item>

        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="serviceApplicationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="申請ID" align="center" prop="id" sortable />
      <el-table-column label="申請者" align="left" prop="username" />
      <el-table-column label="ステータス" align="left" prop="status">
        <template #default="scope">
          <el-tag v-if="scope.row.status in statusList" :type="statusList[scope.row.status].type" size="mini">
            {{ statusList[scope.row.status].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申込日時" align="center" prop="createdTime" sortable>
      <template #default="scope">
          <div style="white-space: pre-line;">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}\n{h}:{i}') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="更新日時" align="center" prop="updateTime" width="180" sortable>
        <template #default="scope">
          <div style="white-space: pre-line">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}\n{h}:{i}') }}</div>
        </template>
      </el-table-column>
    </el-table>

    
    <div class="back"><el-button type="primary" @click="goBack">戻る</el-button></div>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getListByCondition" />
  </cardShadow>
</template>

<script setup name="Application">
import { listApplicationByService } from "@/api/system/application";
import cardShadow from "@/components/Customized/cardShadow";
import { useRoute ,useRouter} from "vue-router";
const route = useRoute() 
const router = useRouter()
const {serviceId} = route.query

const {serviceName} = route.query
const { proxy } = getCurrentInstance();
const serviceApplicationList = ref([]);

const loading = ref(false);
const showSearch = ref(true);

const total = ref(0);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createdStartTime: null,
    createdEndTime: null,
    serviceId: null,
    username:null,
    status:null,
    updateStartTime:null,
    updateEndTime:null

  }
});

// todo 訂正
const statusList = [
  { label: "未提出", value: 0, type: "danger" },
  { label: "提出済", value: 1, type: "success" },
  { label: "OCR受付中", value: 2, type: "warning" },
  { label: "審査待ち", value: 3, type: "info" },
  { label: "承認済", value: 4, type: "success" },
  { label: "却下", value: 5, type: "danger" }
];

const { queryParams } = toRefs(data);
function getListByCondition() {
  loading.value = true;
  queryParams.value.serviceId  = serviceId
  listApplicationByService(queryParams.value).then(response => {
    serviceApplicationList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 検索 エリア
/** 検索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getListByCondition();
}

/** リセット */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
function goBack(){
  router.back()
}
getListByCondition()
</script>
<style scoped> 
.el-card {
  border: unset!important;
}
.body-card {
  margin: unset!important;
}
.el-dialog {
  height: auto!important;
}
.el-card.is-always-shadow {
  box-shadow: unset!important;
}
.back{
  margin-top:15px;
  margin-bottom:15px;
  display:flex;
  justify-content: flex-end

}
</style>
