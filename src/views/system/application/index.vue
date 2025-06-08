<template>
  <cardShadow>
    <template #header-title>
      リクエスト一覧
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
          <el-form-item label="ステータス" prop="status">
            <el-select v-model="queryParams.status"  multiple style="width:180px" placeholder="">
              <el-option :label="item.label" :value="item.value" v-for="item in statusList" :key="item.value">
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="提出日" prop="createdStartTime" justify="start" class="first_picker">
            <el-date-picker clearable v-model="queryParams.createdStartTime" type="date" value-format="YYYY-MM-DD"
              class="narrowDatePicker">
            </el-date-picker>
            <span style="padding: 0 6px;">～</span>
            <el-date-picker clearable v-model="queryParams.createdEndTime" type="date" value-format="YYYY-MM-DD"
            class="narrowDatePicker">
            </el-date-picker>
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
        <el-col :span="16" align="start" v-if="isAdmin2">
          <el-form-item label="自治体名" prop="govId">
            <el-select v-model="queryParams.govId" filterable remote style="width: 300px" placeholder="自治体名を入力ください" :remote-method="searchGov" :popper-append-to-body="false" v-down="loadmore" clearable @clear="clearGovId">
              <el-option v-for="item in govOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="!isAdmin2">
          <el-form-item label="自動審査" prop="autoReview">
            <el-select v-model="queryParams.autoReview"  multiple style="width: 180px" placeholder="">
              <el-option :label="item.label" :value="item.value" v-for="item in autoReviewList" :key="item.value">
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-hasPermi="['system:application:query']" v-if="isAdmin2">
        <el-col :span="8">
          <el-form-item label="自動審査" prop="autoReview">
            <el-select v-model="queryParams.autoReview"  multiple style="width: 180px" placeholder="">
              <el-option :label="item.label" :value="item.value" v-for="item in autoReviewList" :key="item.value">
                {{ item.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form label-width="150px" v-if="selecteFormVisiable" style="padding: 15px 0; border-top: 1px solid var(--el-card-border-color);">
      <el-row>
        <el-col :span="7" v-if="groupList && groupList.length>0">
          <el-form-item label="グループ名" prop="groupId" style="width: 100%;" >
            <el-select
                    v-model="groupSelected"
                    :disabled="templateSelected"
                    placeholder="">
              <el-option
                      v-for="item in groupList"
                      :key="item.groupId"
                      :label="item.groupName"
                      :value="item.groupId">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="7" v-if="templateList && templateList.length>0">
          <el-form-item label="テンプレート名" prop="templateId" style="width: 100%;" >
            <el-select
                    v-model="templateSelected"
                    :disabled="groupSelected"
                    @change="allSelect"
                    placeholder="">
              <el-option
                      v-for="item in templateList"
                      :key="item.templateId"
                      :label="item.templateName"
                      :value="item.templateId">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="groupList && groupList.length>0 && templateList && templateList.length>0 ? 10 : 17" align="end" min-width="200px">
<!--            <el-button class="buttonShadow" type="primary" icon="CircleCheck" @click="allSelect">全選択</el-button>-->
            <el-button class="buttonShadow" icon="Refresh" @click="resetForm">リセット</el-button>
            <el-button :disabled="(!groupSelected && !templateSelected) || currentSelection.length === 0" class="buttonShadow" type="primary" icon="Download" @click="downloadAllTemplate">ダウンロード</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="applicationList" @selection-change="handleSelectionChange" @sort-change="sortData">
      <el-table-column label="" align="center" width="60px">
        <template #default="{ row }">
          <el-checkbox
            :model-value="isRowSelected(row)"
            :disabled="!selectable(row)"
            @change="handleCheckboxChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="リクエストID" align="center" prop="id" sortable="custom" width="155px">
        <template #default="scope">
          <div style="width: 100%; text-align: right">{{ scope.row.id }} </div>
        </template>
      </el-table-column>
      <el-table-column label="業務名" align="center" prop="serviceName" min-width="200px">
        <template #default="scope">
          <div style="width: 100%; text-align: left">{{ scope.row.serviceName }} </div>
        </template>
      </el-table-column>
      <el-table-column label="自治体名" align="center" prop="govName" v-if="isAdmin2" min-width="180px">
        <template #default="scope">
          <div style="width: 100%; text-align: left">{{ scope.row.govName }} </div>
        </template>
      </el-table-column>
      <el-table-column label="ステータス" align="left" prop="status" width="130px">
        <template #default="scope">
          <el-tag v-if="scope.row.statusLable" :type="scope.row.statusLable.type" size="mini">
            {{ scope.row.statusLable.label }}
          </el-tag>
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
      <el-table-column label="有効期限" align="center" prop="validTimeEnd" sortable width="150px">
      <template #default="scope">
          <div style="white-space: pre-line;">{{ parseTime(scope.row.validTimeEnd, '{y}-{m}-{d} {h}:{i}') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="提出日" align="center" prop="createdTime" sortable width="150px">
        <template #default="scope">
          <div style="white-space: pre-line">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d} {h}:{i}') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280px">
        <template #default="scope">
          <!-- 申請業務　データ化結果一覧 結果なし時でもそのまま遷移する -->
          <el-tooltip  content="データ化結果一覧" placement="top" >
            <el-button link type="primary"
              :disabled="scope.row.enforceOcr === 0 && perms2.ocr_edit === true ? false : true"
              :icon="showActionIcon( true , /*scope.row.enforceOcr === 0 ? true : false*/ true, 'Edit')"
              @click="handleOCRResult(scope.row, 'ocr')" />
          </el-tooltip>
          <!-- 申請業務  v-hasPermi="['system:application:edit']" -->
<!--          <el-tooltip content="詳細情報" placement="top" >-->
<!--            <el-button link type="primary" icon="View" @click="handleView(scope.row)" />-->
<!--          </el-tooltip>-->

          <el-tooltip  content="データ化結果ダウンロード" placement="top" >
            <el-button link type="primary"
                       :disabled="scope.row.enforceOcr === 0 && parseInt(scope.row.status) >= 5 && scope.row.digiconCount > 0 && scope.row.digiconCount === scope.row.downloadCount ? false : true"
                       :icon="showActionIcon( true , /*scope.row.enforceOcr === 0 ? true : false*/ true, 'Download')"
                       @click="handleOCRDownload(scope.row)" />
          </el-tooltip>

          <!-- 申請業務　審査結果一覧 -->
          <el-tooltip content="審査結果一覧" placement="top" >
            <el-button link type="primary"
                       :disabled="scope.row.status !== '7'"
                       icon="View"
                       @click="handleFlowResult(scope.row)"/>
          </el-tooltip>

          <el-tooltip :content="parseInt(scope.row.status) > 5 && scope.row.status !== '99' ? (scope.row.status === '7' ? '審査再実行' : '審査中') : '審査実行'" placement="top" >
            <el-button link type="primary"
                       :disabled="(scope.row.status !== '5' && scope.row.status !== '7') || parseInt(scope.row.autoReview) === parseInt(AUTO_REVIEW.NO)"
                       :icon="parseInt(scope.row.status) > 5 && scope.row.status !== '99' ? (scope.row.status === '7' ? 'CaretRight' : 'Loading') : 'CaretRight'"
                       @click="handleFlowTask(scope.row)"/>
          </el-tooltip>

          <el-tooltip content="削除" placement="top" >
            <el-button :disabled="perms2.remove !== true　|| !isAdmin || (scope.row.status != 0 && scope.row.status != 5) && !isAdmin" link type="primary" :icon="true ? 'Delete' : 'Loading'" @click="handleDelete(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
 
  </cardShadow>

  <!-- todo 新規或申請編集ダイアログ -->
  <el-drawer :title="title" v-model="editOpen" :direction="left" size="90%" append-to-body @click="closeMenu">
    <cardShadow>
      <template #header-title>
        リクエスト 詳細情報
      </template>
      <el-form ref="applicationRef" :model="form" :rules="rules" label-width="130px" label-position="left" require-asterisk-position="right">
        <h2><el-text style="font-size:x-large">基本情報</el-text></h2><br>
        <el-form-item v-for="item in formData.applicationInfo" :key="item" :label="item.itemName" >
          <el-input name="inputText" disabled v-if="item.itemType < 4 || item.itemType == 5"   clearable style="width: 240px" v-model="item.value" />
          <el-date-picker disabled clearable v-if="item.itemType==4" v-model="item.value" type="date" value-format="YYYY-MM-DD"
             style="width:200px">
          </el-date-picker>
          <el-checkbox  disabled v-if="item.itemType==6"  :checked="item.value === 'true'" />
        </el-form-item>
        
        <h2><el-text style="font-size:x-large">添付ファイル</el-text></h2><br>
        <el-table :data="formData.applicationInfoFiles" border style="width: 100%">
          <el-table-column align="right" prop="serviceFileLimitId" label="項目番号" width="100" >
            <template #default="scope" >
              {{ (scope.$index + 1)  }}
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="ファイル種別" width="180" />
          <el-table-column prop="files" label="ファイル名">
            <template #default="scope">
              <!-- <div right v-if="scope.row.files.length > 0 " class="slide" @click="isFileListOpen($event, scope.$index, scope.row.serviceFileLimitId)">
                <div class="slide">
                  <div class="bm-menu">
                    <nav class="bm-item-list"></nav>
                    <span class="bm-cross-button cross-style">
                      <span class="bm-cross" style="position: absolute; width: 3px; height: 14px; transform: rotate(-45deg);"></span>
                      <span class="bm-cross" style="position: absolute; width: 3px; height: 14px; transform: rotate(45deg);"></span>
                    </span>
                  </div>
                  <div class="bm-burger-button">
                    <span class="bm-burger-bars line-style" style="top: 0%;"></span>
                    <span class="bm-burger-bars line-style" style="top: 40%;"></span>
                    <span class="bm-burger-bars line-style" style="top: 80%;"></span>
                  </div>
                </div>
              </div>
              <ul v-show="fileListOpen.includes(scope.row.serviceFileLimitId) > 0"  :style="{ left: (fp[scope.$index] === undefined || fp[scope.$index].left === undefined ? '0' : fp[scope.$index].left ) + 'px', top: (fp[scope.$index] === undefined || fp[scope.$index].top === undefined ? '0' : fp[scope.$index].top ) + 'px', minWidth: '300px', position: 'fixed' }" class="contextmenu">
                <li  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex">
                  <span class="font-semibold">
                    {{ file.fileName ? file.fileName : file.name }} 
                  </span>
                </li>
                <div style="clear:both"></div>
              </ul> -->
              <div class="filearea">
                <div v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)">
                  {{ file.fileName ? file.fileName : file.name }} 
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="fileCount" label="ファイル数" width="100">
            <template #default="scope">
              <span v-if="scope.row.files.length > 0" @click="isFileListOpen($event, scope.$index, scope.row.serviceFileLimitId)" style="width:100%; cursor: pointer"> 
                {{ scope.row.files.length }}
              </span>
              <span v-if="scope.row.files.length == 0">
                {{ scope.row.files.length }}
              </span>
            </template>
          </el-table-column>
       </el-table>
      </el-form>
      <el-row justify="right" class="button_row" style="margin-top: 1em">
        <el-button type="default" size="large" plain @click="cancel">×　閉じる</el-button>
      </el-row>
    </cardShadow>
    
  </el-drawer>

 <!-- 申請業務　データ化結果一覧 -->
 <el-drawer  v-model="ocrDrawOpen" size="90%"  append-to-body>
  <orc_step1 :rowData="ocrFiles" @cancel="cancel" @callStep2="callStep2" :ocrDelDisabled="ocrDelDisabled" />
 </el-drawer>
 <div v-if="editOpen2">
  <el-drawer  v-model="editOpen2" size="90%"  append-to-body>
  <orc_step2 :rowData="selectedRow" :type="type" @cancel2="cancel2" :groupFiles="groupFiles" />
 </el-drawer>
 </div>
  <!-- 申請業務　審査結果一覧 -->
  <el-drawer v-model="inspectDrawOpen" :direction="left" width="500px" append-to-body size="90%">
    <checkSystem :rowData="ocrFiles" @callDetail="callDetail" @cancel="cancel" />
  </el-drawer>
  <div v-if="inspectDetailOpen">
  <el-drawer  v-model="inspectDetailOpen" size="90%"  append-to-body>
  <checkSystemDetail :rowData="selectedRow" @cancel3="cancel3" :id="flowApplicationId"/>
 </el-drawer>
  </div>

</template>

<script setup name="Application">
import { listApplication,  delApplication, addApplication, updateApplication, refreshStatus } from "@/api/system/application";
import { ENFORCE_OCR, STATUS_LIST, APPLOCATION_STATUS_LIST, ENFORCE_OCR_LIST, AUTO_REVIEW, AUTO_REVIEW_LIST } from "@/utils/const";
import { getInfoData, downloadData, flowTask, downloadAll } from "@/api/system/application/info";
import { listGovByName } from "@/api/system/gov";


import cardShadow from "@/components/Customized/cardShadow";
import orc_step1 from "./operations/orc_step1.vue";
import orc_step2 from "./operations/orc_step2.vue";
import checkSystem from "./operations/checkSystem.vue";
import checkSystemDetail from './operations/checkSystemDetail.vue';
import useSettingsStore from '@/store/modules/settings'
import useUserStore from "@/store/modules/user";

import {computed, inject, unref} from "vue";

const settingsStore = useSettingsStore()

const { proxy } = getCurrentInstance();
const route = useRoute();
const bus = inject('$bus');
const applicationList = ref([]);
const editOpen = ref(false);
const editOpen2 = ref(false);
const loading = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const formData = ref(null);
const openMenu = ref(false);
const flowApplicationId = ref(null);
const autoReviewObj = AUTO_REVIEW;
const selecteFormVisiable = ref(false);
const groupSelected = ref(null);
const groupList = ref([]);
const templateSelected = ref(null);
const templateList = ref([]);

const ocrDrawOpen = ref(false);
const ocrFiles = ref({
  serviceId: null,
  serviceName: null,
  status: null,
  fileInfos:[],
  createdTime: null
});
const inspectDrawOpen = ref(false);
const inspectDetailOpen =ref(false);
const fileListOpen = ref([]);
const groupFiles =ref([])
const selectedRow=ref(null);
const type=ref(null)
const inspectData = ref(null);
const ocrDelDisabled = ref(false); 
const currentUserRoleKey = useUserStore().roles[0]
const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'
const isAdmin2 = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin' || currentUserRoleKey== 'bpo'
const checkTime = (rule, value, callback) => {
  if (queryParams.value.createdStartTime > queryParams.value.createdEndTime) {
    return callback(new Error('「提出日まで」に「提出日から」より未来の日時を設定してください。'));
  } else {
    callback();
  }
};
const checkVal = (rule, value, callback) => {
  if (
    queryParams.value.serviceName !== undefined && 
    queryParams.value.serviceName !== null &&
    queryParams.value.serviceName.length  > 100) {
    return callback(new Error('文字数を100文字以内にしてください。'));
  } else {
    callback();
  }
}
const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  add: perms.indexOf('system:application:add') != -1 ? true : false,
  edit: perms.indexOf('system:application:edit') != -1 ? true : false,
  remove: perms.indexOf('system:application:remove') != -1 ? true : false,
  query: perms.indexOf('system:application:query') != -1 ? true : false,
  export:  perms.indexOf('system:application:export') != -1 ? true : false,
  ocr_edit:  perms.indexOf('system:ocr:edit') != -1 ? true : false,
})

const fp = ref([]);

const data = reactive({
  form: {},
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
  searchRules: {
    id:[
      { validator: isNumber, message: "半角数字入力してください。", trigger: "blur"},
      { validator: isNumber2, message: "18桁以内半角数字入力してください。", trigger: "blur"},
    ], 
    serviceName:[
      { validator: checkVal, message: "文字数を100文字以内にしてください。", trigger: "blur"}
    ],
    createdStartTime: [
      { validator: checkTime, message:"「提出日まで」に「提出日から」より未来の日時を設定してください。", trigger: "blur" }
    ],
  },
  rules: {
  }
});
const statusList = APPLOCATION_STATUS_LIST;
const autoReviewList = AUTO_REVIEW_LIST;
const ocrStatusList = STATUS_LIST;
const { queryParams, form, searchRules, rules } = toRefs(data);
const govId = ref(null)
const nextPage = ref(false);
const govOptions = ref([])
const clearGovId = () => {
  queryParams.value.govId = null;
  queryParams.value.pageNum = 1;
  getList();
}
const currentSelection = ref([]);
onMounted(()=>{
  const status = route.query.status;
  const govId = route.query.govId;
  const autoReview = route.query.autoReview;
  const enforceOcr = route.query.enforceOcr;
  if(enforceOcr!=null && enforceOcr!=undefined && parseInt(enforceOcr) === 0 ){
    queryParams.value.status=[2,5]
  }
  if(status!=null && status!=undefined && parseInt(status)!=0){
    queryParams.value.status = [parseInt(status)]
  }
  if(status!=null && status!=undefined && parseInt(status)==0){
    // ダッシュボード画面から、status 0 は処理中
    queryParams.value.status=[1,2,3,4]
  }
 
  if(status!=null && status!=undefined && parseInt(status)==6){
    queryParams.value.status=[6]
  }
  if(govId!=null || govId!=undefined){
    queryParams.value.govId=parseInt(govId);
    searchGovStep2();
  }
  if(enforceOcr!=null || enforceOcr!=undefined){
    queryParams.value.enforceOcr.push(parseInt(enforceOcr));
  }
  if(autoReview!=null || autoReview!=undefined){
    queryParams.value.autoReview.push(parseInt(autoReview));
    searchGovStep2();
  }

  const currentUserRoleKey = useUserStore().roles[0];
  const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'

  getList();
  
  setTimeout(() => {
        const element = document.querySelectorAll('.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap')[0];
        element.addEventListener('scroll', () => {
           const { scrollTop, scrollHeight, clientHeight } = element;
           const scrollDistance = scrollHeight - scrollTop - clientHeight;
           if (scrollDistance <= 10) {
            console.log("D");
             //loadmore();
            }
        })
    }, 100);

    //審査中データ自動更新
  setInterval(() => {
    const filteredIds = applicationList.value
            .filter(app => app.status === '6')
            .map(app => app.id);
    if(filteredIds.length > 0){
      let data = {
        'ids': filteredIds
      }
      refreshStatus(data).then(response => {
        const responseData = response.data;
        applicationList.value.forEach(element => {
          const matchedResponse = responseData.find(item => item.id === element.id);
          if (matchedResponse) {
            element.status = matchedResponse.status;
            element.statusLable = getStatusLable(element.status >=2 && element.status <= 4 ? 2 : element.status)
          }
        });
      });
    }
  }, 10000);
})

/**  5分新しいリクエストのにチェック*/


/**  application Table Data*/
function getList() {
  loading.value = true;
  let statusArray =[];
  let autoReviewArray = [];
  Promise.all(queryParams.value.status.map((item) => {
    if (item === 2){
      statusArray = [...statusArray, 2,3,4];
    }  else {
      statusArray = [...statusArray, item];
    }
  })).then(() => {
    //console.log(queryParams.value);
    let obj ={ 
      ...queryParams.value,
      status: statusArray
    }
    listApplication(obj).then(response => {
      applicationList.value = response.rows;
      applicationList.value.forEach(element => {
        element.statusLable=getStatusLable(element.status >=2 && element.status <= 4 ? 2 : element.status)
      });
      
      total.value = response.total;
      loading.value = false;
      resetForm();
    });
  })
  
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

// フォームエリア
// フォームのキャンセル
function cancel() {
  editOpen.value = false;
  editOpen2.value = false;
  inspectDetailOpen.value = false;
  inspectDrawOpen.value = false;
  ocrDrawOpen.value = false;
  reset();
}

function cancel2() {
  editOpen2.value = false;
}

function cancel3() {
  inspectDetailOpen.value = false;
}

// フォームのリセット
function reset() {
  form.value = {
    id: null,
    createdTime: null,
    userId: null,
    serviceId: null
  };
  proxy.resetForm("applicationRef");
}


// アクションエリア
/** Viewボタンの処理 */
// todo need test
function handleView(row) {
  reset();
  
  const _id = row.id || ids.value
  fp.value = [];
  getInfoData(_id).then((response) => {
    if (response.code === 200) {
      formData.value = response.data;
      editOpen.value = true;
      formData.value.applicationInfoFiles.map((item) => {
        fp.value.push({top: 0, left: 0});
      })
    }else {
      console.log(response);
    }
  })
  
}

function  handleFlowTask(row) {
  const _id = row.id || ids.value;
  flowTask({'id': _id}).then((response) => {
    if (response.code === 200) {
      getList();
    }
  });
}

function handleOCRResult(row, type) {
  const _id = row.id || ids.value;
  ocrDelDisabled.value = /*row.status === '0'*/ isAdmin ? false : true;
  ocrFiles.value.fileInfos = [];
  let files = [];
  getInfoData(_id).then((response) => {
    if (response.code === 200) {
      if(type === 'ocr'){
        ocrDrawOpen.value = true;
      }else{
        inspectDrawOpen.value = true;
      }
      ocrFiles.value.serviceId = row.serviceId;
      ocrFiles.value.serviceName = row.serviceName;
      let item = statusList.find(e => {
        if ([2, 3, 4].includes(parseInt(row.status))) {
          return e.value == 2;
        } else {
          return e.value == parseInt(row.status);
        }
      });

      ocrFiles.value.status = item.label;

      /** ファイルいるなら　OCR出力日時 = 一個目ファイル作成日時 */
      ocrFiles.value.createdTime = '';

      response.data.applicationInfoFiles.forEach((item) => {
        item.files.forEach((item2) => {
          let status = '受付中';
          if (ocrFiles.value.status === '未提出') {
            status = '未提出';
          } else if (item2.ocrStatus === "30" || ocrFiles.value.status === 'データ化完了') {
            if(item2.digiconTotalCount === item2.localUrlCount){
              status = 'データ化完了';
              ocrFiles.value.createdTime = response.data.ocrUpdateTime;
            }else{
              status = 'データ化処理中';
            }
          } else if (item2.ocrStatus === "29") {
            if(item2.digiconTotalCount === item2.localUrlCount){
              status = 'データ化完了(エラー)';
              ocrFiles.value.createdTime = response.data.ocrUpdateTime;
            }else{
              status = 'データ化処理中';
            }
          } else if (item2.ocrStatus === "1" || ocrFiles.value.status === 'データ化処理中') {
            status = 'データ化処理中';
          } else if((!item2.ocrStatus || item2.ocrStatus === '0') && ocrFiles.value.status === 'エラー'){
            status = 'マッチングエラー';
          }
          files.push({
            id: item2.id,        // id
            name: item.fileName, // ファイル
            fileName: item2.fileName, // ファイル名
            templateFiles: item2.templateFiles.filter(template => template.templateName),
            digiconTotalCount: item2.digiconTotalCount,
            localUrlCount: item2.localUrlCount,
            totalPage: item2.totalPage,
            status: status
          });
        });
      });

      ocrFiles.value.fileInfos = files;
      console.log(ocrFiles);
    }
  }).catch((res) => {
    console.log(res);
  })
}

function handleFlowResult(row) {
  flowApplicationId.value = row.id;
  inspectDetailOpen.value = true;
}

async function handleOCRDownload(row) {
  const _id = row.id || ids.value;
  bus.emit('loading', { type: 'show', msg: 'ダウンロードには、数分かかりますので、少しお待ちください。'});
  const response = await downloadData(_id);
  bus.emit('loading', { type: 'hide'});
  const files = response.data;

  for (const file of files) {
    const { fileName, content } = file;
    const blob = new Blob([Uint8Array.from(atob(content), c => c.charCodeAt(0))]);
    saveAs(blob, fileName);
  }
}

function isFileNameInvalid(fileName) {
  const invalidCharPattern = /[^\x20-\x7E]/;
  return invalidCharPattern.test(fileName);
}

function handleInspectResult(row) {
  inspectDrawOpen.value = true;
  inspectData.value = row;
}

function showActionIcon(first, second, icon) {
  if (!first) return "Minus"
  return second ? icon : "Loading";
}

/** コミット処理 */
function submitForm() {
  proxy.$refs["applicationRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateApplication(form.value).then(response => {
          proxy.$modal.msgSuccess("編集成功");
          editOpen.value = false;
          getList();
        });
      } else {
        addApplication(form.value).then(response => {
          proxy.$modal.msgSuccess("新規成功");
          editOpen.value = false;
          getList();
        });
      }
    }
  });
}

function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  handleQuery();

}

/** 削除処理 */
function handleDelete(row) {
  if (isAdmin) {
    const _ids = row.id || ids.value;
    proxy.$modal.confirm('業務"' +row.serviceName+ '"を削除してもよろしいでしょうか？').then(function () {
      return delApplication(_ids);
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("削除成功");
    }).catch(() => { });
  }
}

function callStep2(data) {
  editOpen2.value = true;
  selectedRow.value=data.row;
  type.value=data.type;
  groupFiles.value = data.groupFiles;
  console.log("call step2",data.row);
  //selectedRow.value=row
  console.log("selectedRow ",selectedRow);
}

function callDetail(data) {
  inspectDetailOpen.value = true;
  selectedRow.value=data.row;
  groupFiles.value = data.groupFiles;
}

function isFileListOpen(e, index, id) {
  openMenu.value = false;
  console.log(fp.value);
  fp.value[index].top = e.target.getBoundingClientRect().top;
  fp.value[index].left =  e.target.getBoundingClientRect().left;
	fileListOpen.value = [...fileListOpen.value, id];
 
  // document.removeEventListener('click', closeMenu);
  setTimeout(() => {
		// document.addEventListener('click', closeMenu);
    openMenu.value = true;
	}, 100)
}
function closeMenu() {
  if (openMenu.value) {
	  fileListOpen.value = [];
    openMenu.value = false;
  }
	//document.removeEventListener('click', closeMenu);
}

function getStatusLable(status){
 let temp_status = status;
 if (parseInt(status) >=2 && parseInt(status) <= 4) {
  temp_status = 2;
 }

 const item = statusList.find(e=>e.value==status)
 return item

}

const searchGov = (query) => {
    if (
        (govId.value === null || govId.value === undefined)
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
      id: null,
      status: null
    }
    listGovByName(query).then(res => {
            // const list = res.rows
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

function isNumber(rule, value, callback) {
  let regex = /[^0-9]/;
  if (
    queryParams.value.id !== undefined &&
    queryParams.value.id !== null &&
    queryParams.value.id !== '' &&
    regex.test(queryParams.value.id)
  ) { // 46 is dot
    return callback(new Error('半角数字入力してください。'));   
  }
  callback();
  
}

function isNumber2(rule, value, callback) {
  let regex = /[^0-9]/;
  if (
    queryParams.value.id !== undefined &&
    queryParams.value.id !== null &&
    queryParams.value.id !== '' &&
    !regex.test(queryParams.value.id) &&
    queryParams.value.id.length > 18
  ) {
    return callback(new Error('18桁以内半角数字入力してください。')); 
  }
  callback();
  
}

function handleSelectionChange(val) {
  currentSelection.value = val;
}

const unselectableList = computed(() => {
  return currentSelection.value.length > 0
          ? applicationList.value.filter(
                  (item) => !currentSelection.value.some((selected) => selected.id === item.id)
          )
          : [];
});

const selectable = (row) => {
  if (currentSelection.value.length === 0) {
    return (row.groupList && row.groupList.length > 0) || (row.templateList && row.templateList.length > 0);
  } else {
    return currentSelection.value.some((selected) => selected.id === row.id)
            || (groupSelected.value && row.groupList && row.groupList.some(group => group.groupId === groupSelected.value))
            || (templateSelected.value && row.templateList && row.templateList.some(template => template.templateId === templateSelected.value));
  }
};

function isRowSelected(row) {
  return currentSelection.value.some((selected) => selected.id === row.id);
}

function handleCheckboxChange(row) {
  const index = currentSelection.value.findIndex((selected) => selected.id === row.id);
  if (index > -1) {
    currentSelection.value.splice(index, 1);
    if(!groupSelected && !templateSelected){
      resetForm();
    }
  } else {
    currentSelection.value.push(row);
    groupList.value = row.groupList;
    templateList.value = row.templateList;
    selecteFormVisiable.value = true;
  }
}

function allSelect() {
  applicationList.value.forEach((item) => {
    if(selectable(item)){
      const index = currentSelection.value.findIndex((selected) => selected.id === item.id);
      if (index === -1) {
        currentSelection.value.push(item);
      }
    }
  });
}

async function downloadAllTemplate() {
  let ids = currentSelection.value.map(item => item.id);
  const params = {
    groupId: groupSelected.value,
    templateId: templateSelected.value,
    ids: ids
  };
  bus.emit('loading', { type: 'show', msg: 'ダウンロードには、数分かかりますので、少しお待ちください。'});
  const response = await downloadAll(params);
  bus.emit('loading', { type: 'hide'});
  const files = response.data;

  for (const file of files) {
    const { fileName, content } = file;
    const blob = new Blob([Uint8Array.from(atob(content), c => c.charCodeAt(0))]);
    saveAs(blob, fileName);
  }
}

function resetForm() {
  currentSelection.value = [];
  groupSelected.value = null;
  templateSelected.value = null;
  groupList.value = [];
  templateList.value = [];
  selecteFormVisiable.value = false;
}

</script>
<style scoped> 

.el-dialog {
  height: auto!important;
}
.el-card.is-always-shadow {
  box-shadow: unset!important;
}
.el-col {
  margin-bottom: unset;
}
.first_picker{
  margin-right:3px
}
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  display: inline-table;
  overflow: visible;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  top: 0;
  
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  li {
    margin: 0;
    padding: 1px 16px;
    cursor: pointer;
    &:hover {
      background: #eee!important;
    }
  }
}
.cell {
  overflow: visible;
}
.is-justify-right {
  justify-content: right !important;
}
:deep(.el-form-item__error) {
  display:inherit;
  min-width: 400px;
}
.filearea {
  max-height: 160px;
  overflow-y: auto;
}

</style>
