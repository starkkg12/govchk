<template>
		<cardShadow>
				<template #header-title>
					未提出一覧
				</template>
				<el-form :model="queryParams" :rules="searchRules" ref="queryRef" :inline="true" v-show="showSearch" label-width="120px">
					<el-row  v-hasPermi="['system:application:query']">
					  <el-col :span="8" style>
						<el-form-item label="リクエストID" prop="id" style="width: 100%;" >
						  <el-input v-model="queryParams.id" clearable  @keyup.enter="handleQuery" />
						</el-form-item>
					  </el-col>
					  <el-col :span="8" align="start">
						<el-form-item label="業務名" prop="serviceName" style="width: 90%">
						  <el-input v-model="queryParams.serviceName" clearable @keyup.enter="handleQuery" style="width: 100%" />
						</el-form-item>
					  </el-col>
					  <el-col :span="8" align="end" min-width="200px">
						<el-form-item>
						  <el-button class="buttonShadow" icon="Refresh" @click="resetQuery">リセット</el-button>
						  <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery">検索</el-button>
						</el-form-item>
					  </el-col>
					</el-row>
					<el-row v-hasPermi="['system:application:query']">
					  <el-col :span="8">
						<el-form-item label="データ化" prop="enforceOcr">
						  <el-select v-model="queryParams.enforceOcr"  multiple style="width:180px" placeholder="">
							<el-option :label="item.label" :value="item.value" v-for="item in autoReviewList" :key="item.value">
							  {{ item.label }}
							</el-option>
						  </el-select>
						</el-form-item>
					  </el-col>
					  <el-col :span="8">
						<el-form-item label="自動審査" prop="autoReview">
						  <el-select v-model="queryParams.autoReview"  multiple style="width:180px" placeholder="">
							<el-option :label="item.label" :value="item.value" v-for="item in autoReviewList" :key="item.value">
							  {{ item.label }}
							</el-option>
						  </el-select>
						</el-form-item>
					  </el-col>
					</el-row>
				  </el-form>
				<el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange" @sort-change="sortData">
					<el-table-column label="リクエストID" align="center" width="155px" prop="id" sortable="custom">
				        <template #default="scope">
				          <div style="width: 100%; text-align: right;">{{ scope.row.id }} </div>
				        </template>
					</el-table-column>
				      <el-table-column label="業務名" align="center" prop="serviceName" min-width="200px">
				        <template #default="scope">
				          <div style="width: 100%; text-align: left">{{ scope.row.serviceName }} </div>
				        </template>
				      </el-table-column>
					  <el-table-column label="データ化" align="left" prop="enforceOcr" width="130px">
						<template #default="scope">
						  <el-tag v-if="scope.row.enforceOcr !== null" :type="parseInt(scope.row.enforceOcr) === parseInt(ENFORCE_OCR.YES) ? ENFORCE_OCR_LIST[0].type : ENFORCE_OCR_LIST[1].type" size="mini">
							{{ parseInt(scope.row.enforceOcr) === parseInt(ENFORCE_OCR.YES) ? ENFORCE_OCR_LIST[0].label : ENFORCE_OCR_LIST[1].label }}
						  </el-tag>
						</template>
					  </el-table-column>
					  <el-table-column label="自動審査" align="left" prop="autoReview" width="130px">
						<template #default="scope">
						<el-tag v-if="scope.row.autoReview !== null" :type="parseInt(scope.row.autoReview) === parseInt(AUTO_REVIEW.YES) ? AUTO_REVIEW_LIST[0].type : AUTO_REVIEW_LIST[1].type" size="mini">
						  {{ parseInt(scope.row.autoReview) === parseInt(AUTO_REVIEW.YES) ? AUTO_REVIEW_LIST[0].label : AUTO_REVIEW_LIST[1].label }}
						</el-tag>
						</template>
					  </el-table-column>
					<el-table-column label="作成日" align="center" prop="createdTime" width="150px">
						<template #default="scope">
							<div style="white-space: pre-line;">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d} {h}:{i}') }}</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" prop="modify" width="200px">
						<template #default="scope">
							<el-tooltip content="編集" placement="top" >
								<el-button 
								  :disabled="(isEdit === false && (userId != scope.row.userId))  || perms2.view === false"
								  link type="primary" icon="Edit" @click="gotoApplicaton(scope.row, 'edit')" />
							</el-tooltip>
							<el-tooltip content="詳細" placement="top" >
								<el-button :disabled="!perms2.view" link type="primary" icon="view" @click="gotoApplicaton(scope.row, 'view')" />
							</el-tooltip>
							<el-tooltip content="削除" placement="top" >
								<el-button 
								  :disabled="isEdit === false && (userId != scope.row.userId) ? true : false "
								  link type="primary" icon="Delete" @click="deleteApplicaton(scope.row)"/>
							</el-tooltip>
						</template>
					 </el-table-column>

				</el-table>
				<pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
					v-model:limit="queryParams.pageSize" @pagination="getList" />
				<!-- <el-button class="buttonShadow" style="float: right; width: 100px;margin: 20px 0;"  size="large" plain @click="router.back(-1);">戻る</el-button> -->
		</cardShadow>    
</template>

<script setup name="Outstanding">
import { getInfo } from "@/api/login";
import { ENFORCE_OCR, STATUS_LIST, APPLOCATION_STATUS_LIST, ENFORCE_OCR_LIST, AUTO_REVIEW, AUTO_REVIEW_LIST } from "@/utils/const";

import { unsubmittedListInfo } from "@/api/system/application/operations";
import { delOutstandingApplication } from "@/api/system/application";
import { getInfoData } from "@/api/system/application/info";

import cardShadow from "@/components/Customized/cardShadow";
import useUserStore from "@/store/modules/user";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore()
const autoReviewList = AUTO_REVIEW_LIST;
const userId = userStore.id;
const currentUserRoleKey = useUserStore().roles[0]
const isEdit = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin' || currentUserRoleKey == 'govOperator' ? true : false;
let urlParams = new URLSearchParams(window.location.search);
localStorage.removeItem("applicantData");
const list = ref([
]);
const data = reactive({
	form: {
		user_id: null,
		service_id: null
	},
	queryParams: {
		pageNum: 1,
		pageSize: 10,
		orderByColumn: null,
		isAsc: 'asc',
		createdStartTime:null,
		createdEndTime:null,
		userId: null,
		serviceId: null,
		serviceName: null,
		status:[],
		autoReview: [],
		govId:null
	},
});
const total = ref(0);
const loading = ref(false);
const { form, queryParams } = toRefs(data);
const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
   view: perms.indexOf('system:application:operations:edit') != -1 && 
         perms.indexOf('system:application:operations:documents_upload') &&
		 perms.indexOf('system:application:operations:documents_confirm') &&
		 perms.indexOf('system:application:operations:final') ? true : false
});
const showSearch = ref(true);

const getList = ()=>{
	loading.value = true;
	unsubmittedListInfo({
		...queryParams.value,
		userId: parseInt(userId),
	}).then((response) => {
		total.value = response.total;
		list.value = response.rows;
		loading.value = false;
	});

}
const gotoApplicaton = (row, action) => {
    getInfoData(row.id).then((response) => {
		if (response.code === 200) {
		  router.push({path:'../edit', query: {applicationId: row.id, updateTime: row.updateTime, serviceId: row.serviceId,serviceName:row.serviceName, step: 3, ac: action === 'view' ? 0 : 1}})
        }	
	})
}

/** 削除処理 */
const deleteApplicaton = (row) => {
	const _ids = row.id || ids.value;
	proxy.$modal.confirm('業務"' + row.serviceName + '"を削除してもよろしいでしょうか？').then(function () {
		return delOutstandingApplication(_ids);
	}).then(() => {
		proxy.$modal.msgSuccess("削除成功");
		getList()
	}).catch(() => { });
}

// 検索 エリア
/** 検索 */
function handleQuery() {
  proxy.$refs["queryRef"].validate((valid) => {
    if (valid) {
      queryParams.value.pageNum = 1;
      getList();
    }
  });
}

/** リセット */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.createdEndTime = null;
  handleQuery();
}
function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  handleQuery();

}
onMounted(()=>{
  const autoReview = route.query.autoReview;
  const enforceOcr = route.query.enforceOcr;
  
  if(enforceOcr!=null && enforceOcr!=undefined ){
    queryParams.value.enforceOcr.push(parseInt(enforceOcr));
  }
  if(autoReview!=null || autoReview!=undefined){
    queryParams.value.autoReview.push(parseInt(autoReview));
  }
  getList();
});

</script>
<style scoped> 
</style>