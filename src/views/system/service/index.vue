<template>
  <cardShadow>
    <template #header-title>
      業務管理
    </template>
    <el-form :model="queryParams" :rules="searchRules" ref="queryRef" :inline="true" v-show="showSearch" label-width="150px">
      <el-row>
        <el-col :span="24">
          <el-row>
            <el-col :span="8">
              <el-form-item label="業務名" prop="service_name">
                <el-input v-model="queryParams.serviceName" clearable @keyup.enter="handleQuery" class="inputArea" />
              </el-form-item>
            </el-col>
            <el-col :span="8" align="start" v-if="isAdmin">
              <el-form-item label="自治体名" prop="govId" style="width: 100%">
                <el-select v-model="queryParams.govId" filterable remote placeholder="自治体名を入力ください" :remote-method="searchGov" :popper-append-to-body="false" v-down="loadmore" clearable @clear="clearGovId">
                  <el-option v-for="item in govOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" align="end">
              <el-form-item>
                <!-- <el-button class="buttonShadow" type="primary" v-if="isAdmin" plain icon="Plus" @click="handleAdd">新規</el-button>
                <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery">再読み込み</el-button> -->
                <el-button class="buttonShadow" icon="Refresh" @click="resetQuery" size="normal">リセット</el-button>
                <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery" size="normal">検索</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="最新アップロード" prop="createdTimeStart">
                <el-date-picker clearable @blur="dataCheck" v-model="queryParams.createdTimeStart" type="date" value-format="YYYY-MM-DD"
                                class="narrowDatePicker">
                </el-date-picker>
                <span style="padding: 0 6px;">～</span>
                <el-date-picker clearable @blur="dataCheck" v-model="queryParams.createdTimeEnd" type="date" value-format="YYYY-MM-DD"
                                class="narrowDatePicker">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10" class="mb8" v-if="perms2.add">
            <el-col :span="1.5">
              <el-button class="buttonShadow" type="primary" v-if="isAdmin2" plain icon="Plus" @click="handleAdd">新規</el-button>
            </el-col>
            <!-- <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar> -->
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    
    <el-table ref="tableRef" v-loading="loading" :data="serviceList" @selection-change="handleSelectionChange" style="width:100%" @sort-change="sortData">
      <!-- <el-table-column type="selection" width="50px" align="center" /> -->
      <el-table-column label="業務ID"  align="center" prop="id" sortable width="100px" >
        <template #default="scope">
          <div align="center" style="width: 100%; text-align: right;">{{ scope.row.id}}</div>
        </template>
      </el-table-column>
      <el-table-column label="業務名"  align="center" prop="serviceName" min-width="400px">

        <template #default="scope">
          <div align="center" style="width: 100%; text-align: left;">
            {{ scope.row.serviceName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="自治体名" align="center" prop="govName" v-if="isAdmin" min-width="180px">
        <template #default="scope">
          <div style="width: 100%; text-align: left">{{ scope.row.govName }} </div>
        </template>
      </el-table-column>
      <el-table-column label="ステータス" align="left" prop="status" width="120px" v-if="isAdmin">
        <template #default="scope">
          <el-tag type="warning" effect="plain" v-if="scope.row.status == 0">非公開</el-tag>
          <el-tag type="primary" effect="plain" v-if="scope.row.status == 1">公開</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="ステータス" align="left" prop="isPermitWeb" width="120px">

        <template #default="scope">
          <el-tag type="warning" effect="plain" v-if="scope.row.permitWeb == 1">窓口</el-tag>
          <el-tag type="primary" effect="plain" v-if="scope.row.permitWeb == 0">オンライン</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="申請数" align="center" prop="status" width="100px">

        <template #default="scope">
     
          <div @click="handleToApplication(scope.row)" style="width: 100%; text-align: right;" >
            {{ scope.row.count }}
          </div>

        </template>
      </el-table-column>
      <el-table-column label="最新アップロード"  align="center" prop="lastCreatedTime"  sortable="custom" width="190px">

        <template #default="scope">
          <div style="white-space: pre-line;">{{ parseTime(scope.row.lastCreatedTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</div>
        </template>
      </el-table-column>
      <el-table-column  label="操作" align="center" class-name="small-padding fixed-width" width="200px">

        <template #default="scope">
          <el-tooltip content="詳細情報編集" placement="top">
              <el-button 
                link type="primary" icon="Edit" @click="handleUpdate(scope.row, 'edit')"
                :disabled="scope.row.count != scope.row.finalCount || perms2.edit === false ">
               </el-button>
          </el-tooltip>
          <el-tooltip content="詳細情報" placement="top">
            <el-button  link type="primary" icon="View" @click="handleUpdate(scope.row, 'view')"></el-button>
          </el-tooltip>
          <el-tooltip content="削除" placement="top">
            <el-button 
               :disabled="scope.row.count != scope.row.finalCount || perms2.remove === false  ? true : false "
               link type="primary" icon="Delete" @click="handleServiceDelete(scope.row)" ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getServiceList" />
  
    <!-- 新規、編集 -->
    <el-drawer v-model="open" :action="action" :direction="direction" :before-close="handleClose" size="90%">
      <template #default>
        <h1>{{ service_name }}</h1>
        <el-form ref="serviceRef" :model="form" :rules="rules" :disabled="formDisabled" label-width="240px" label-position="left"
          require-asterisk-position="right" >
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="所属自治体" prop="govId" style="width:70%;">
                <el-select 
                  class="govList"
                  v-model="form.govId" 
                  filterable 
                  :disabled="!isAdmin"
                  remote 
                  placeholder=""
                  :remote-method="searchGov" @change="selectGov"
                  :popper-append-to-body="false" v-down="loadmore" clearable
                  >
                  <el-option
                    v-for="item in govOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="業務名" prop="serviceName" style="width:70%;">
                <el-input v-model="form.serviceName" maxlength="100" show-word-limit/>
              </el-form-item>
              <el-form-item label="デジコンID" prop="digiconId" style="width:70%;">
                <el-input v-model="form.digiconId" maxlength="10" show-word-limit/>
              </el-form-item>
              
              
              <el-row :gutter="20">
                <el-col :span="20">
                  <el-form-item label="有効期限" prop="validTime">
                    <!-- <el-date-picker clearable v-model="form.validTime" type="datetimerange" time-format="HH:mm"
                      value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm" start-placeholder="開始日"
                      end-placeholder="終了日">
                    </el-date-picker> -->
                    <el-date-picker clearable  v-model="form.validTimeStart" type="date" value-format="YYYY-MM-DD"
                            class="narrowDatePicker">
                    </el-date-picker>
                    <span style="padding: 0 6px;">～</span>
                    <el-date-picker clearable  v-model="form.validTimeEnd" type="date" value-format="YYYY-MM-DD"
                      class="narrowDatePicker">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
<!--              <el-form-item label="受付方法">-->
<!--                <el-radio-group v-model="form.permitWeb" class="el-radio-group-justified">-->
<!--                  <el-radio-button label="窓口" value=0 />-->
<!--                  <el-radio-button label="オンライン" value=1 />-->
<!--                </el-radio-group>-->
<!--              </el-form-item>-->
              <el-form-item label="データ化" prop="isEnforceOcr">
                <el-radio-group v-model="form.isEnforceOcr" class="el-radio-group-justified">
                  <el-radio-button class="buttonShadow" label="実施する" value=true @change="handleChangeData" />
                  <el-radio-button class="buttonShadow" label="実施しない" value=false @change="handleChangeData" />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="一般ユーザーのリクエスト表示" prop="generalUserApplication">
                <el-radio-group v-model="form.generalUserApplication">
                  <el-radio-button label="組織内全ユーザーに許可" value=0 />
                  <el-radio-button label="本人のみ許可" value=1 />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="自動審査" prop="autoReview">
                <el-radio-group v-model="form.autoReview">
                  <el-radio-button label="実施する" value=true @change="handleChangeAutoRevie" />
                  <el-radio-button label="実施しない" value=false @change="handleChangeAutoRevie" />
                </el-radio-group>
              </el-form-item>
              <!-- <el-form-item label="一括申請" prop="allowSet">
                <el-radio-group v-model="form.allowSet" class="ml-4" @change="chageAllowSet">
                  <el-radio-button label="一括" value=true />
                  <el-radio-button label="単票" value=false />
                </el-radio-group>
              </el-form-item> -->
              <!-- 10月リリースの部分、今は隠す-->
              <el-form-item label="BPOデータ転送" prop="bpoTransferSet">
                <el-radio-group v-model="form.bpoTransfer" class="ml-4">
                  <el-radio-button label="利用する" value=true />
                  <el-radio-button label="利用しない" value=false />
                </el-radio-group>
              </el-form-item>

              <!-- <el-form-item label="データ化プラン" prop="ocrPlan">
                <el-radio-group v-model="form.ocrPlan">
                  <el-radio-button label="２H" value=1 />
                  <el-radio-button label="当日" value=2 />
                  <el-radio-button label="スタンダード" value=3 />
                </el-radio-group>
              </el-form-item> -->
              <!-- <el-form-item label="データ化送信種別" prop="ocrSendMsgType">
                <el-radio-group v-model="form.ocrSendMsgType">
                  <el-radio-button label="即時送信" value=0 />
                  <el-radio-button label="一括送信" value=1 />
                </el-radio-group>
              </el-form-item> -->

              <el-form-item :label="mangeLabel" prop="mangers" style="width:70%;">
                <el-select 
                v-model="mangerUsers"
                  filterable
                  multiple
                  remote 
                  placeholder=""
                  :remote-method="searchMangerUser">
                  <el-option
                    v-for="item in mangerUserOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="審査フロー" prop="flowId" style="width:70%;" v-if="form.autoReview === 0 || form.autoReview === 'true' || form.autoReview === true">
                <el-select
                        v-model="flows"
                        filterable
                        remote
                        multiple
                        placeholder=""
                        :remote-method="searchFlow">
                  <el-option
                          v-for="item in flowList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                  </el-option>
                </el-select>
               </el-form-item>

              <el-form-item label="業務概要" prop="description">
                 <el-input 
                    type="textarea" 
                    v-model="form.description" 
                    :rows="4" 
                    :maxlength="300"
                    :v-html="rawHtml"
                    show-word-limit
                  />
              </el-form-item>
              <el-form-item label="請求書担当者情報" />
              <el-form-item label="氏名" prop="fullName">
                <el-input v-model="form.fullName"  maxlength="50" show-word-limit />
              </el-form-item>
              <el-form-item label="所属部署" prop="department">
                <el-input v-model="form.department" maxlength="100" show-word-limit />
              </el-form-item>
              <el-form-item label="メール" prop="email">
                <el-input v-model="form.email" maxlength="30" show-word-limit />
              </el-form-item>
              <el-form-item label="電話番号" prop="tel">
                <el-input v-model="form.tel" maxlength="12" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-row>
                <div style="width: 100%">
                   <label style="font-size: var(--el-form-label-font-size); color: var(--el-color-primary); font-weight: unset; width: 100%">1 業務説明</label>
                </div>
                <quill-editor
                  ref="quillEditorRef"
                  v-model:content="form.taskDescription"
                  contentType="html"
                  placeholder=""
                  :options="options"
                  :read-only="formDisabled"
                  :style="styles"
                />
              
              </el-row>
              <el-row>
                <el-col>
                  <!-- check -->
                  <el-tabs v-model="activeName" type="border-card" class="define-tabs">
                    <el-tab-pane label="2-1基本情報定義" name="info" v-if="showInfo">
                     
                      <DraggableTable pagename="basicinfo" :showedList="infoList" :showedCols="showedInfoCols"
                        @update:showedList="handleUpdateInfoList" :buttonShow="!formDisabled"
                         :rules="basicinfoRules"
                        >
                        <template #customized-row>
                        </template>
                      </DraggableTable>
                    </el-tab-pane>
                    <el-tab-pane label="2-2条件定義" name="condition" v-if="showInfo">
                      <DraggableTable :showedList="conditionList" :showedCols="showedConditionCols"
                        @update:showedList="handleUpdateConditionList" :buttonShow="!formDisabled">
                        <template #customized-row>
                        </template>
                      </DraggableTable>
                    </el-tab-pane>
                    <el-tab-pane :label="showInfo ? '3添付書類定義' : '2添付書類定義'" name="filelimit">
                      <DraggableTable :propsAllowSet="allowSet" pagename="filelimit" :showedList="fileLimitList" :showedCols=" allowSet === 'true' || allowSet === true ? showedFilelimitCols2 : showedFilelimitCols" :serviceId="serviceId"
                        @update:showedList="handleUpdateFileLimitList" @filelimitAdd="handleFilelimitAdd" @filelimitDelete="handleFilelimitDel" :buttonShow="!formDisabled" :disabled="formDisabled" :csvshow ="csvShowFlag">
                        <template #customized-row>
                        </template>
                      </DraggableTable>
                    </el-tab-pane>
                    <el-tab-pane :label="showInfo ? '4マスタデータ' : '3マスタデータ'" v-if="showAutoReview" name="masterFilelimit">
                      <DraggableTable :propsAllowSet="allowSet" pagename="masterFilelimit" :showedList="masterFileLimitList" :showedCols=" allowSet === 'true' || allowSet === true ? showedFilelimitCols2 : showedFilelimitCols" :serviceId="serviceId"
                        @update:showedList="handleUpdateMasterFileLimitList" @masterFilelimitAdd="handleMasterFilelimitAdd" @filelimitDelete="handleFilelimitDel" :buttonShow="!formDisabled" :disabled="formDisabled">
                        <template #customized-row>
                        </template>
                      </DraggableTable>
                    </el-tab-pane>
                  </el-tabs>
                  <!-- <el-checkbox v-model="checked4" label="データ化を実行するか" border /> -->
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="buttonShadow" v-if="formDisabled" @click="cancel">×　閉じる</el-button>
          <el-button class="buttonShadow" v-if="!formDisabled" @click="cancel">キャンセル</el-button>
          <el-button class="buttonShadow" type="danger" @click="submitForm('release', action)" v-if="form.status==0">公開</el-button>
          <el-button class="buttonShadow" type="primary" @click="submitForm('save', action)" v-show="action!='view'">保存</el-button>
          <el-button class="buttonShadow" @click="submitForm(undefined, 'playView')">プレビュー</el-button>
        </div>
      </template>
    </el-drawer>
    <el-button v-show="showScrollTop" class="scroll-to-top" icon="el-icon-arrow-up" circle 
      @click="scrollTop"></el-button>
    <el-drawer v-show="playView" v-model="playView" size="90%" :before-close="handleClose2">
      <div style="position:relative;width: 100%;">
        <div class="swiper-button-prev" @click.stop="prevEl"></div>
        <div class="swiper-button-next" @click.stop="nextEl"></div>
      <Swiper
        v-if="playView"
        ref="swiperRefs"
        :modules="modules"
        :initialSlide="initialSlide"
        :slides-per-view="1"
        :space-between="10"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
       >
        <SwiperSlide class="swiper-slide" v-if="steps[0] === true">
          <edit :playViewData="playViewData" :step2="steps[1] === true ? true : false"  :closePage="closePage" />
        </SwiperSlide>
        <SwiperSlide class="swiper-slide"  v-if="steps[1] === true">
          <info_edit :playViewData="playViewData" :startStep="steps[0] === true ? 1 : 2" :closePage="closePage" />
        </SwiperSlide>
        <SwiperSlide class="swiper-slide"  >
          <documents_upload :closePage="closePage" :step2="steps[1] === true ? true : false" :startStep="steps[0] === false && steps[1] === false ? 3 : steps[0] === false && steps[1] === true ? 2 : 1" :playViewData="playViewData" @uploadFile="uploadFile"/>
        </SwiperSlide>
        <SwiperSlide class="swiper-slide" v-if="playViewData.chkServiceMasterFileLimitList.length > 0" >
          <documents_master_upload :closePage="closePage" :step2="steps[1] === true ? true : false" :startStep="steps[0] === false && steps[1] === false ? 3 : steps[0] === false && steps[1] === true ? 2 : 1" :playViewData="playViewData" @uploadFile="uploadFile"/>
        </SwiperSlide>
        <SwiperSlide class="swiper-slide" >
          <documents_confirm :closePage="closePage" :step2="steps[1] === true ? true : false" :playViewData="playViewData" :startStep="steps[0] === false && steps[1] === false ? 3 : steps[0] === false && steps[1] === true ? 2 : 1" :chkServiceFileLimitList2="chkServiceFileLimitList2"/>
        </SwiperSlide>
      </Swiper>  
      </div>
    </el-drawer>
  </cardShadow>
</template>

<script setup name="Service">
import { listService, getService, delService, addService, updateService ,addServiceMatser, editServiceMatser,listServiceApplication} from "@/api/system/service";
import { listGovByName,getGov } from "@/api/system/gov";
import { listFlowByService } from "@/api/system/flow";
import {ROLE_GROUP,ROLE_LAYER} from '@/utils/const'
import cardShadow from "@/components/Customized/cardShadow";
import DraggableTable from "@/components/Customized/draggableTable.vue";
import { showedInfoCols, showedConditionCols, showedFilelimitCols, showedFilelimitCols2 } from '@/utils/serviceManage/serviceTitle.js'
import { convertFileLimitToFileCondition ,convertFileLimitToForm,convertLimitToFileCondition} from '@/utils/serviceManage/fileSetting.js'

import { listInfo, delInfo, addInfo, updateInfo, getInfoListByServiceId } from "@/api/system/service/info";
import { listCondition, getCondition, delCondition, addCondition, updateCondition, getConditionListByServiceId } from "@/api/system/service/condition";
import { listLimit, getLimit, delLimit, addLimit, updateLimit, getFileLimitListByServiceId, getMasterFileLimitListByServiceId } from "@/api/system/service/limit";
import { searchFlowList } from "@/api/system/flow";
import {ENFORCE_OCR,ALLOW_SET,CHECKSYSTEM,OPEN_STATUS, GENERALUSERAPPLICATION} from '@/utils/const'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect,listUserByCondition ,listUserByService} from "@/api/system/user";
import { get } from "lodash";
import { reactive, ref } from "vue";
import {  useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from "swiper/vue";
import {  Navigation, Scrollbar } from 'swiper/modules';
import { QuillEditor } from "@vueup/vue-quill";
import { ElMessage } from 'element-plus'
const showInfo = ref(false);
const swiperRefs = ref(null);

import 'swiper/css';
import 'swiper/css/navigation';



import useUserStore from "@/store/modules/user";
import { AUTO_REVIEW ,LIMIT_MULTI, DEFAULT_TASK_DESCRIPTION} from "../../../utils/const";
import { htmlspecialchars, htmlspecialchars_decode, removeHTML } from '@/utils/theme';
import edit from '@/views/system/application/operations/edit.vue';
import info_edit from '@/views/system/application/operations/info_edit.vue';

import documents_upload from '@/views/system/application/operations/documents_upload.vue';
import documents_master_upload from '@/views/system/application/operations/documents_master_upload.vue';
import documents_confirm from '@/views/system/application/operations/documents_confirm.vue';
import { onMounted,  } from 'vue';




const modules = [ Navigation, Scrollbar];
const playViewData = ref(null);
const activeName = ref("filelimit");
const { proxy } = getCurrentInstance();
const step = ref(3);
const initialSlide = ref(0);
const serviceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const serviceIds = ref([]);
const serviceSingle = ref(true);
const serviceMultiple = ref(true);
const total = ref(0);
const service_name = ref("");
const serviceId=ref(null)
const govOptions = ref([])
const mangerUserOptions = ref([])
const infoIds = ref([]);
const infoSingle = ref(true);
const infoMultiple = ref(true);
const action = ref(null);
const flowList = ref(null);
const playView = ref(false);
const allowSet = ref(false);
const csvShowFlag = ref(false);


const formDisabled = ref(false)
var showScrollTop = false;

const mangerUsers = ref([])
const flows = ref([]);
const router = useRouter()
const isSysAdminOrBpoAdmin = ref(false);
const element  = ref(null);

const currentUserRoleKey = useUserStore().roles[0]
const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin' || currentUserRoleKey == 'bpo'
const isAdmin2 = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin';
const mangeLabel = /*isAdmin?'管理者':'担当者'*/ 'アクセス権限';

const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  add: perms.indexOf('system:service:add') != -1 ? true : false,
  edit: perms.indexOf('system:service:edit') != -1 ? true : false,
  remove: perms.indexOf('system:service:remove') != -1 ? true : false
});

let swiper = ref(null);
const onSwiper = (theSwiper) => {
    swiper.value = theSwiper;
  };
const prevEl = () => {
    swiper.value.slidePrev();
  }
  const nextEl = () => {
    swiper.value.slideNext();
  }
const onSlideChange = (swiper) => {
    //console.log('slide changed');
};

watch(() => open.value, () => {
setTimeout(() => {
 element.value = document.querySelectorAll('.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap')[1];
    if (element.value!==null && element.value !== undefined) {
    element.value.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = element.value;
      const scrollDistance = scrollHeight - scrollTop - clientHeight;
      if (scrollDistance <= 50) {
          loadmore();
      }
    })
  }
}, 100);
})

const showAutoReview = computed(() => {
  if (!(form.value.autoReview==true ||form.value.autoReview=='true')) {
    activeName.value = "filelimit";
  } 
  return form.value.autoReview==true ||form.value.autoReview=='true'
})

const chageAllowSet = () => {
  allowSet.value = form.value.allowSet;
}
const quillEditorRef = ref(null);

const options = ref({
  theme: "snow",
  bounds: document.body,
  debug: "warn",
  modules: {
    // ツールバー構成
    toolbar: [
      ["bold", "italic", "underline"],      // 大胆な 斜めの体 降りる 行を削除します
      [],                   // 引用  コードブロック
      [{ list: "ordered" }, { list: "bullet" }],      // 秩序ある、メリットはありません
      [{ indent: "-1" }, { indent: "+1" }],           // インデント
      [{ header: [1, 2, 3, 4, 5, 6, false] }],        // タイトル
      [],            // フォントカラー、フォントの背景色
      [],                                // アライメント
      [{ align: ['right', 'center', 'justify'] }],
      ["clean"],                                      // 清除記事フォーマット
      []                      // リンク、写真、ビデオ
    ],
  },
  placeholder: "",
  readOnly: false
});

const styles = computed(() => {
  let style = {
    minHeight: '200px',
    height: '200px',
    width: '53.6em',
    marginBottom: '40px'
  };

  return style;
});

const currentDefination = reactive({
  info: {
    id: 22,
    field: 22
  },
  condtion: {
    field: null
  },
  fileLimit: {
    field: null
  }
});
const checkTime = (rule, value, callback) => {
  if (queryParams.value.createdTimeStart > queryParams.value.createdTimeEnd) {
    return callback(new Error('「最新アップロードまで」に「最新アップロードから」より未来の日時を設定してください。'));
  } else {
    callback();
  }
};

const checkTime2 = (rule, value, callback) => {
  if (form.value.validTimeStart > form.value.validTimeEnd) {
    return callback(new Error('「有効期限まで」に「有効期限から」より未来の日時を設定してください。'));
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

const implCheck = (rule, value, callback) => {
  if (
    (form.value.autoReview ===false || form.value.autoReview =="false") && (form.value.isEnforceOcr ===false || form.value.isEnforceOcr == "false")) {
    return callback(new Error('データ化と自動審査は1つ以上を実施してください。'));
  } else {
    callback();
  }
}

const phoneCheck = (rule, value, callback) => {
  var reg1 = /^0\d{1,3}-\d{2,4}-\d{3,4}$/;
  var reg2 = /^0\d{9,10}$/;
  if (!reg1.test(value) || !reg2.test(value)) {
    return callback(new Error('正しい電話番号入力してください。'));
  } else {
    callback();
  }
}

const handleChangeAutoRevie= (event) =>{

  if ((form.value.isEnforceOcr=="false" || form.value.isEnforceOcr===false) && (form.value.autoReview===true||form.value.autoReview=="true")){
    csvShowFlag.value= true;
  } else {
    csvShowFlag.value= false;
  }
  if (form.value.autoReview=="true"){
    proxy.$refs["serviceRef"].clearValidate(form.autoReview);
    proxy.$refs["serviceRef"].clearValidate(form.isEnforceOcr);
  }
  if ((form.value.isEnforceOcr=="false" || form.value.isEnforceOcr===false) &&(form.value.autoReview===true||form.value.autoReview=="true")){
    ElMessage.error("データ化と自動審査は1つ以上を実施してください。");
  } 
}

const handleChangeData= (event) =>{
  if ((form.value.isEnforceOcr=="false" || form.value.isEnforceOcr===false) && (form.value.autoReview===true||form.value.autoReview=="true")){
    csvShowFlag.value= true;
  } else {
    csvShowFlag.value= false;
  }
  if (form.value.isEnforceOcr=="true"){
    proxy.$refs["serviceRef"].clearValidate(form.autoReview);
    proxy.$refs["serviceRef"].clearValidate(form.isEnforceOcr);
  }
  if ((form.value.isEnforceOcr=="false" || form.value.isEnforceOcr===false) &&(form.value.autoReview===false||form.value.autoReview=="false")){
    ElMessage.error("データ化と自動審査は1つ以上を実施してください。");
  } 
}
const checkFlowId = (rule, value, callback) => {
  if (
    (
      form.value.autoReview === true || form.value.autoReview === "true" || parseInt(form.value.autoReview) === parseInt(AUTO_REVIEW.YES)
    ) &&
    (flows.value === undefined ||  flows.value === null || flows.value.length === 0)   
  ) {
    return callback(new Error('審査フローを選択してください。'));
  } else {
    callback();
  }
}

const data = reactive({
  form: {
    defination: {
      infoList: [],
      conditionList: [],
      fileLimitList: [],
      valid_time:[]
    },
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    serviceName: null,
    createdTimeStart: null,
    createdTimeEnd: null,
    description: null,
    isTrigger: null,
    status: null,
    isEnforceOcr: null,
    isPermitWeb: null,
    isCheckSystem: null,
    autoReview:null,
    orderByColumn: 'id',
    isAsc: 'desc',
  },
  govQueryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null
  },
  searchRules: {
    service_name:[
      { validator: checkVal, message: "文字数を100文字以内にしてください。", trigger: "blur"}
    ],
    createdTimeStart: [
      { validator: checkTime, message:"「最新アップロードまで」に「最新アップロードから」より未来の日時を設定してください。", trigger: "blur" }
    ],
  },
  rules: {
    govId:[{ required: true, message: "所属自治体を選択してください。", trigger: "change" }],
    serviceName:[{ required: true, message: "業務名を入力してください。", trigger: "blur" }],
    digiconId:[
      { required: true, message: "デジコンIDを入力してください。", trigger: "blur" },
      { pattern: /^[0-9]\d*$/, message: "数値形式で入力してください。", trigger: "blur"}
    ],
    validTime:[{ validator: checkTime2, message: "「有効期限まで」に「有効期限から」より未来の日時を設定してください。", trigger: "blur" }],
    description:[{ required: true, message: "業務概要を入力してください。", trigger: "blur" }],
    email: [
      { required: true, message: 'メールを入力してください', trigger: 'blur' },
      { type: 'email', message: '無効なメールフォーマット', trigger: 'blur' }
    ],
    tel:[
      { pattern: /^[0-9]\d*$/, message: "数値形式で入力してください。", trigger: "blur"},
      { min: 10, message: "数字10~11桁で入力してください。", trigger: "blur"}
    ],
    autoReview: [{validator: implCheck, message:"データ化と自動審査は1つ以上を実施してください。", trigger: "change"}],
    isEnforceOcr: [{validator: implCheck, message:"データ化と自動審査は1つ以上を実施してください。", trigger: "change"}],
    flowId: [{ required: true, validator: checkFlowId, message: "審査フローを選択してください。", trigger: "blur" }],
  
  },

  basicinfoRules: {
    name: [{max: 100, message: "文字数を100文字以内にしてください。", trigger: "blur" }]
  }
});
const { queryParams, govQueryParams, form, searchRules, rules, basicinfoRules } = toRefs(data);

const tableRef = ref();

const clearMangers = () => {
  mangerUsers.value = null;
}

// サービス業務セット申請
//const allowSet = ref(null)

function handleEditInfo() {
  const id = currentDefination.info.id;
  if (id == null) { // 新規
    infoList.value.push(currentDefination.info);
    // addInfo(currentDefination.info).then(response => {
    //   console.log(response.data);
    // });
  } else { // 編集　更新
    infoList.value = infoList.value.map(info => {
      if (info.id === currentDefination.info.id) {
        return currentDefination.info;
      } else {
        return info;
      }
    });
    // updateInfo(currentDefination.info).then(response => {
    //   console.log(response.data);
    // });
  }
  // getInfoList(); // update 
  currentDefination.info = {};
}


// info data 
const infoData = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createdTimeStart: null,
    createdTimeEnd: null,
    serviceId: null,
    serviceName: null,
    orderByColumn: null,
    isAsc: 'asc',
  },
  rules: {
    
  }
});
// const { queryParams, form, rules } = toRefs(infoData);
const nextGovSearchPage = ref(false);

const infoList = ref([]);
const conditionList = ref([]);
const fileLimitList = ref([]);
const masterFileLimitList = ref([]);

//　添付書類
let serviceFileLimitList=[]
// マスターデータ
let serviceMasterFileLimitList=[]

const chkServiceFileLimitList=reactive([])
const chkServiceFileLimitList2 = ref([]);
const steps = ref([true, true, true, true]);
const closePage = ref(false);
const nextPage = ref(false);
const oldChkService = ref(null);

/** リスト取得 */
function getServiceList() {
  loading.value = true;
  playViewData.value = null;
  listServiceApplication(queryParams.value).then(response => {
    serviceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// キャンセル
function handleClose() {
  steps.value = [true, true, true, true, true];
  closePage.value = true;
  swiperRefs.value = null;
  element.value = null;
  playViewData.value = null;
  reset();
  setTimeout(() => {
    playView.value = false;
    open.value = false;
    allowSet.value = false;
   
  }, 100)
  
}
function handleClose2() {
  initialSlide.value = 0;
  swiper.value.slideTo(0);
  playView.value = false;
}
function cancel() {
  reset();
  setTimeout(() => {
    open.value = false;
    allowSet.value = false;
  }, 100)
}

// リセット
function reset() {
  options.value = {
  theme: "snow",
  bounds: document.body,
  debug: "warn",
  modules: {
    // ツールバー構成
    toolbar: [
      ["bold", "italic", "underline"],      // 大胆な 斜めの体 降りる 行を削除します
      [],                   // 引用  コードブロック
      [{ list: "ordered" }, { list: "bullet" }],      // 秩序ある、メリットはありません
      [{ indent: "-1" }, { indent: "+1" }],           // インデント
      [{ header: [1, 2, 3, 4, 5, 6, false] }],        // タイトル
      [],            // フォントカラー、フォントの背景色
      [],                                // アライメント
      [{ align: ['right', 'center', 'justify'] }],
      ["clean"],                                      // 清除記事フォーマット
      []                      // リンク、写真、ビデオ
    ],
  },
  placeholder: "",
  readOnly: false
};
form.value = {
    id: null,
    serviceName: null,
    createdTimeStart: null,
    createdTimeEnd: null,
    description: null,
    isTrigger: null,
    status: null,
    isEnforceOcr: true,
    isPermitWeb: null,
    isCheckSystem: false,
    bpoTransfer: false,
    autoReview:true,
    allowSet:false,
    ocrPlan: 3,
    ocrSendMsgType: 0,
    fullName: null,
    department: null,
    email: null,
    tel: null,
    updatedTime: null,
    generalUserApplication: 1,
    version: "1",
    originalId: null,
    defination: {
      infoList: [],
      conditionList: [],
      fileLimitList: []
    },
    validTime:[],
    taskDescription: null //htmlspecialchars_decode(DEFAULT_TASK_DESCRIPTION,  'ENT_QUOTES')
  };
  //options.value.readOnly = false;
  if (quillEditorRef.value != null) {
    quillEditorRef.value.getQuill().enable(true);
    quillEditorRef.value.setHTML('');
  }
  proxy.resetForm("serviceRef");
  infoList.value=[],
  conditionList.value= [],
  fileLimitList.value=[]
  masterFileLimitList.value=[]
  mangerUsers.value = null
  flows.value = null
  serviceFileLimitList=[]
}



/** 検索 */
function handleQuery() {
  proxy.$refs["queryRef"].validate((valid) => {
    if (valid) {
      queryParams.value.pageNum = 1;
      getServiceList();
    }
  });
}

/** リセット */
function resetQuery() {
  queryParams.value.createdTimeStart = null;
  queryParams.value.createdTimeEnd = null;
  queryParams.value.serviceId = null;
  queryParams.value.serviceName = null;
  
  proxy.resetForm("queryRef");
  handleQuery();
}

// チェックボックス変更する時の処理
function handleSelectionChange(selection) {
  serviceIds.value = selection.map(item => item.id);
  serviceSingle.value = selection.length != 1;
  serviceMultiple.value = !selection.length;
}

function handleInfoSelectionChange(selection) {
  infoIds.value = selection.map(item => item.id);
  infoSingle.value = selection.length != 1;
  infoMultiple.value = !selection.length;
}

/** 追加処理 */
function handleAdd() {
  reset();
  formDisabled.value=false;
  open.value = true;
  service_name.value = "業務管理 新規";
  action.value = "add";
}

/** 編集処理 */
async function  handleUpdate(row, type) {
  reset();
  if(type=='view'){
    if (quillEditorRef.value != null) {
    quillEditorRef.value.getQuill().enable(false);
  }
    formDisabled.value=true
    service_name.value = "業務管理 詳細情報";
  }else {
    formDisabled.value=false
    service_name.value = "業務管理 詳細情報";
  }
  action.value=type
  const _id = row.id || serviceIds.value
  const response = await getService(_id)
  const chkService = response.data
  form.value.id= chkService.id;
  serviceId.value= chkService.id;
  form.value.serviceId = chkService.id;
  form.value.serviceName = chkService.serviceName
  form.value.description = chkService.description
  form.value.validTime = [chkService.validTimeStart, chkService.validTimeEnd]
  form.value.validTimeStart = chkService.validTimeStart;
  form.value.validTimeEnd = chkService.validTimeEnd;
  form.value.isEnforceOcr = chkService.enforceOcr == ENFORCE_OCR.YES
  form.value.generalUserApplication = parseInt(chkService.generalUserApplication) === GENERALUSERAPPLICATION.ALL ? 0 : 1
  form.value.isCheckSystem = chkService.checkSystem == CHECKSYSTEM.YES
  
  form.value.autoReview = parseInt(chkService.autoReview) == CHECKSYSTEM.YES ? true : false
  form.value.permitWeb = chkService.permitWeb
  form.value.ocrPlan = chkService.ocrPlan
  form.value.ocrSendMsgType = chkService.ocrSendMsgType
  form.value.status = chkService.status
  form.value.allowSet=chkService.allowSet==ALLOW_SET.YES
  form.value.govId = chkService.govId
  form.value.digiconId = chkService.digiconId
  form.value.bpoTransfer = chkService.bpoTransfer == 1
  form.value.department = chkService.department !== undefined ? chkService.department : ''
  form.value.email = chkService.email !== undefined ? chkService.email : ''
  form.value.tel = chkService.tel !== undefined ? chkService.tel : ''
  form.value.fullName = chkService.fullName !== undefined ? chkService.fullName : ''
  form.value.version = chkService.version
  form.value.originalId = chkService.originalId
  
  form.value.taskDescription = chkService.taskDescription !== undefined && chkService.taskDescription !== null && chkService.taskDescription !== "&lt;p&gt;null&lt;/p&gt;" ? htmlspecialchars_decode(chkService.taskDescription, 'ENT_QUOTES') : '';
  form.value.updatedTime = chkService.updatedTime;
  if (quillEditorRef.value != null) {
    quillEditorRef.value.getQuill().enable(type === 'view' ? false : true);
    quillEditorRef.value.setHTML(form.value.taskDescription);
  }
  
  initGovOptions(form.value.govId)
  initMangerUser(serviceId.value)
  initFlows(serviceId.value)
  action.value = type;
  allowSet.value = form.value.allowSet;
  const infoResponse = await getInfoListByServiceId(serviceId.value) 
  const infoResList= infoResponse.data.map(element => {
    
    return {
      id:element.id,
      field:element.itemName,
      type:element.itemType,
      checkbox:element.itemIsCompulsory,
      //TODO type
    }
  });


  //業務IDで条件定義を取得
  
  infoList.value.push(...infoResList)

  const conditionRes = await getConditionListByServiceId(serviceId.value)

  const conditionListData =  conditionRes.data.map( e =>{
    return {
      id:e.id,
      serviceId:e.serviceId,
      description:e.description
    }
  })
  conditionList.value.push(...conditionListData)

  // 添付書類
  const fileLimitRes =  await getFileLimitListByServiceId(serviceId.value) 
  const fileLimitFormList = []
  const fileLimitListObj = await fileLimitRes.data.map(e=>{
  const fileLimitForm = convertFileLimitToForm(e)
  // console.log(fileLimitForm);
  const fileCondition  = convertFileLimitToFileCondition(fileLimitForm)
  fileLimitForm.fileType= fileLimitForm.fileType !== undefined ? fileLimitForm.fileType.join() : null;
  fileLimitFormList.push(fileLimitForm)
    if (type === undefined) {
      // プレビュー
      return {
        id:e.id,
        serviceId:e.serviceId,
        filelimitName:e.fileName,
        description: e.description,
        fileCondition:fileCondition,
        allowSet: e.allowSet == 0 || e.allowSet == '0' ? true : false
      }
    } else {
    return {
      id:e.id,
      serviceId:e.serviceId,
      filelimitName:e.fileName,
      fileCondition:fileCondition,
      allowSet: e.allowSet == 0 || e.allowSet == '0' ? true : false
    }}
  })
  serviceFileLimitList.push(...fileLimitFormList)
  fileLimitList.value.push(...fileLimitListObj)

  // マスターデータ
  const masterFileLimitRes =  await getMasterFileLimitListByServiceId(serviceId.value) 
  
  const masterFileLimitFormList = []
  serviceMasterFileLimitList = []
  const masterFileLimitListObj = await masterFileLimitRes.data.map(e=>{
  const masterFileLimitForm = convertFileLimitToForm(e)
  
  // console.log(fileLimitForm);
  const masterFileCondition  = convertFileLimitToFileCondition(masterFileLimitForm)
  masterFileLimitForm.fileType= masterFileLimitForm.fileType !== undefined ? masterFileLimitForm.fileType.join() : null;
  masterFileLimitFormList.push(masterFileLimitForm)
    if (type === undefined) {
      // プレビュー
      return {
        id:e.id,
        serviceId:e.serviceId,
        filelimitName:e.fileName,
        description: e.description,
        fileCondition:masterfileCondition,
        allowSet: e.allowSet == 0 || e.allowSet == '0' ? true : false
      }
    } else {
    return {
      id:e.id,
      serviceId:e.serviceId,
      filelimitName:e.fileName,
      fileCondition:masterFileCondition,
      allowSet: e.allowSet == 0 || e.allowSet == '0' ? true : false
    }}
  })
  serviceMasterFileLimitList.push(...masterFileLimitFormList)
  masterFileLimitList.value.push(...masterFileLimitListObj)


  // 業務IDで申請情報を取得

  /** 
  getService(_id).then(response => {
    
    
        const chkService = response.data
        form.value.service_name = chkService.serviceName 
        form.value.description = chkService.description 
        form.value.validTime = [chkService.valid_time_start ,chkService.valid_time_end]
        //form.value.validTime[1] = chkService.valid_time_end 
        form.value.isEnforceOcr = chkService.enforceOcr==1
        form.value.isCheckSystem=chkService.checkSystem ==1
        form.value.permitWeb = chkService.permitWeb 
        form.value.ocrPlan = chkService.ocrPlan 
        form.value.ocrSendMsgType = chkService.ocrSendMsgType
        form.status=chkService.status
      

    open.value = true;
    service_name.value = "業務登録";
  });
   */

  // 基本情報定義
  const chkServiceInfoList = []
      const infoTitleList = infoResList.map(item => {
        return {
          id:item.id,
          itemName: item.field,
          itemType: item.type,
          itemIsCompulsory: item.checkbox
        }
      })
      chkServiceInfoList.push(...infoTitleList)

      const chkServiceConditionList = [];
      
      const serviceConditionList = conditionList.value.map(item => {
        return {
          id:item.id,
          description: item.description
        }
      })
      chkServiceConditionList.push(...serviceConditionList)
      
      // 削除されていないのitemを取得
      const notDeletedFileLimitList= serviceFileLimitList.filter(item =>{
        let findItem = fileLimitList.value.find(e=>e.id==item.id)
        return findItem!=null && findItem!=undefined
      })

      const notDeletedMasterFileLimitList= serviceMasterFileLimitList.filter(item =>{
        let findItem = masterFileLimitList.value.find(e=>e.id==item.id)
        return findItem!=null && findItem!=undefined
      })

      

      const fileLimit = notDeletedFileLimitList.map(e => {

        if(e != null) {
          return {
            id:e.id,
            fileName: e.fileName,
            samplePicture: e.samplePicture,
            fileCount: e.fileCount,
            filenameRule: e.filenameRule,
            description: e.description,
            fileSize: e.fileSize,
            fileType:e.fileType,
            allowSet: e.allowSet === true ? 0 : 1,
            digipathId:e.digipathId,
            templateId:e.templateId,
            multi:e.multi===true || e.multi===LIMIT_MULTI.YES ?LIMIT_MULTI.YES:LIMIT_MULTI.NO,
            fileRequired: e.fileRequired
          }
        }
      })
     
      const masterFileLimit = notDeletedMasterFileLimitList.map(e => {

        if(e != null) {
          return {
            id:e.id,
            fileName: e.fileName,
            samplePicture: e.samplePicture,
            fileCount: e.fileCount,
            filenameRule: e.filenameRule,
            description: e.description,
            fileSize: e.fileSize,
            fileType:e.fileType,
            allowSet: e.allowSet === true ? 0 : 1,
            digipathId:e.digipathId,
            templateId:e.templateId,
            multi:e.multi===true || e.multi===LIMIT_MULTI.YES ?LIMIT_MULTI.YES:LIMIT_MULTI.NO,
            fileRequired: e.fileRequired
          }
        }
      })
      

      const chkServiceFileLimitList = []
      chkServiceFileLimitList.push(...fileLimit)
      const chkServiceMasterFileLimitList = []
      chkServiceMasterFileLimitList.push(...masterFileLimit)
      let chkUserServiceList =[]
      if(mangerUsers && mangerUsers.value){
          chkUserServiceList = mangerUsers.value.map(item => {
          return {
            userId: item,
            serviceId: form.value.serviceId,
            layer: isAdmin ? ROLE_LAYER.ADMIN : ROLE_LAYER.GENERAL
          }
        })
      }
      let chkFlowServiceList =[];
      if(flows && flows.value && chkService.autoReview === 0){
          chkFlowServiceList = flows.value.map(item => {
          return {
            flowId: item,
            serviceId: form.value.serviceId,
          }
        })
      }

   oldChkService.value = {
    chkService: {
      serviceName: form.value.serviceName,
      description: form.value.description,
      validTimeStart: form.value.validTimeStart,
      validTimeEnd: form.value.validTimeEnd,
      enforceOcr: form.value.isEnforceOcr=='true' || form.value.isEnforceOcr==true ? ENFORCE_OCR.YES : ENFORCE_OCR.NO,
      checkSystem: form.value.isCheckSystem=='true' || form.value.isCheckSystem==true ? CHECKSYSTEM.YES : CHECKSYSTEM.NO,
      autoReview: form.value.autoReview=='true' || form.value.autoReview==true ? AUTO_REVIEW.YES : AUTO_REVIEW.NO,
      permitWeb: form.value.permitWeb,
      allowSet: form.value.allowSet=='true' || form.value.allowSet==true ? ALLOW_SET.YES : ALLOW_SET.NO,
      ocrPlan: form.value.ocrPlan,
      ocrSendMsgType: form.value.ocrSendMsgType,
      govId: form.value.govId,
      digiconId: form.value.digiconId,
      bpoTransfer: form.value.bpoTransfer=='true' || form.value.bpoTransfer==true ? 1 : 0,
      status: form.value.status === null ? OPEN_STATUS.UNOPEN : form.value.status,
      department:  form.value.department !== undefined ? form.value.department : '',
      email: form.value.email !== undefined ? form.value.email : '',
      tel: form.value.tel !== undefined ? form.value.tel : '',
      fullName: form.value.fullName !== undefined ? form.value.fullName : '',
      taskDescription:  form.value.taskDescription !== undefined && form.value.taskDescription !== null && removeHTML(form.value.taskDescription) !== "" && removeHTML(form.value.taskDescription) !== "null"  ? htmlspecialchars(form.value.taskDescription) : '',
      updatedTime: form.value.updatedTime,
      generalUserApplication: form.value.generalUserApplication,
      version: form.value.version,
      originalId: form.value.originalId,
      id: form.value.serviceId
    },
    chkServiceInfoList,
    chkServiceConditionList,
    chkServiceFileLimitList,
    chkServiceMasterFileLimitList,
    chkUserServiceList,
    chkFlowServiceList
  };
  open.value = true;
  
  
}
function uploadFile(files) {
  //debugger;
  playViewData.value.chkServiceFileLimitList = files;
  setTimeout(() => {
    chkServiceFileLimitList2.value = files;
  }, 100);
  
}
function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  handleQuery();
  // tableRef.value.sort(sort.prop, sort.order);
}


/** 情報リスト取得 */
function getInfoList() {
  const queryParams = infoData.queryParams;
  loading.value = true;
  listInfo(queryParams.value).then(response => {
    infoList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function dataCheck() {
  // console.log("sssssssss dataCheck")
  if (queryParams.value.startTime > queryParams.value.endTime ) {
    startTimeErr.value = true;
    endTimeErr.value = true;
    proxy.$refs["queryRef"].validateField('startTime');
    proxy.$refs["queryRef"].validateField('endTime');
  }
}


/** コミット処理 */
function submitForm2(saveType, action) {
      const chkService = {}
      let start,end;
      let splitArr;
      if (
        form.value.validTimeStart !== undefined &&  
        form.value.validTimeStart !== null &&
        form.value.validTimeStart !== ''
      ) {
         splitArr = form.value.validTimeStart.split(' ');
         if (splitArr.length === 2) {
           start = form.value.validTimeStart;
         } else {
            start = splitArr[0] + ' 00:00:00';
         }
      } else {
         start = form.value.validTime !== undefined ? form.value.validTime[0] : ''
      }
      if (
        form.value.validTimeEnd !== undefined &&
        form.value.validTimeEnd !== null &&
        form.value.validTimeEnd !== ''
      ) {
        splitArr = form.value.validTimeEnd.split(' ');
        if (splitArr.length === 2) {
          end = form.value.validTimeEnd;
        } else {
          end = splitArr[0] + ' 23:59:59';
        }
      } else {
        end = form.value.validTime !== undefined ? form.value.validTime[1] : ''
      }
       //0未公開,1公開
      let status = form.value.status === null ? OPEN_STATUS.UNOPEN : form.value.status;
      if(saveType && saveType == 'release') {
        status = OPEN_STATUS.OPEN
        oldChkService.value.chkService.status = status;
      }

      chkService.serviceName = form.value.serviceName
      chkService.description = form.value.description
      chkService.validTimeStart = start;
      chkService.validTimeEnd = end;
      chkService.enforceOcr = form.value.isEnforceOcr=='true' || form.value.isEnforceOcr==true ? ENFORCE_OCR.YES : ENFORCE_OCR.NO
      chkService.checkSystem = form.value.isCheckSystem=='true' || form.value.isCheckSystem==true ? CHECKSYSTEM.YES : CHECKSYSTEM.NO
      chkService.autoReview = form.value.autoReview=='true' || form.value.autoReview==true ? AUTO_REVIEW.YES : AUTO_REVIEW.NO
      chkService.permitWeb = form.value.permitWeb
      chkService.allowSet = form.value.allowSet=='true' || form.value.allowSet==true ? ALLOW_SET.YES : ALLOW_SET.NO
      chkService.ocrPlan = form.value.ocrPlan
      chkService.ocrSendMsgType = form.value.ocrSendMsgType
      chkService.govId=form.value.govId
      chkService.digiconId=form.value.digiconId
      chkService.bpoTransfer=form.value.bpoTransfer=='true' || form.value.bpoTransfer==true ? 1 : 0
      chkService.status = status;
      chkService.department = form.value.department !== undefined ? form.value.department : '';
      chkService.email = form.value.email !== undefined ? form.value.email : '';
      chkService.tel = form.value.tel !== undefined ? form.value.tel : '';
      chkService.fullName = form.value.fullName !== undefined ? form.value.fullName : '';
      chkService.taskDescription = form.value.taskDescription !== undefined && form.value.taskDescription !== null && removeHTML(form.value.taskDescription) !== "" && removeHTML(form.value.taskDescription) !== "null" ? htmlspecialchars(form.value.taskDescription) : '';
      chkService.updatedTime = form.value.updatedTime;
      chkService.generalUserApplication = form.value.generalUserApplication
      chkService.version = form.value.version
      chkService.originalId = form.value.originalId
      
      // 基本情報定義
      const chkServiceInfoList = []
      const infoTitleList = infoList.value.map(item => {
        return {
          id:item.id,
          itemName: item.field,
          itemType: item.type,
          itemIsCompulsory: item.checkbox
        }
      })
      chkServiceInfoList.push(...infoTitleList)

      const chkServiceConditionList = [];
      
      const serviceConditionList = conditionList.value.map(item => {
        return {
          id:item.id,
          description: item.description
        }
      })
      chkServiceConditionList.push(...serviceConditionList)
      
      // 削除されていないのitemを取得(添付書類)
      const notDeletedFileLimitList= serviceFileLimitList.filter(item =>{
        let findItem = fileLimitList.value.find(e=>e.id==item.id)
        return findItem!=null && findItem!=undefined
      })
      // 削除されていないのitemを取得(マスターデータ)
      const notDeletedMasterFileLimitList= serviceMasterFileLimitList.filter(item =>{
        let findItem = masterFileLimitList.value.find(e=>e.id==item.id)
        return findItem!=null && findItem!=undefined
      })

      

      const fileLimit = notDeletedFileLimitList.map(e => {

        if(e != null) {
          return {
            id:e.id,
            fileName: e.fileName,
            samplePicture: e.samplePicture,
            fileCount: e.fileCount,
            filenameRule: e.filenameRule,
            description: e.description,
            fileSize: e.fileSize,
            fileType:e.fileType,
            allowSet: e.allowSet === true ? 0 : 1,
            digipathId:e.digipathId,
            templateId:e.templateId,
            multi:e.multi===true || e.multi===LIMIT_MULTI.YES ?LIMIT_MULTI.YES:LIMIT_MULTI.NO,
            fileRequired: e.fileRequired
          }
        }
      })

      const masterFileLimit = notDeletedMasterFileLimitList.map(e => {

        if(e != null) {
          return {
            id:e.id,
            fileName: e.fileName,
            samplePicture: e.samplePicture,
            fileCount: e.fileCount,
            filenameRule: e.filenameRule,
            description: e.description,
            fileSize: e.fileSize,
            fileType:e.fileType,
            allowSet: e.allowSet === true ? 0 : 1,
            digipathId:e.digipathId,
            templateId:e.templateId,
            multi:e.multi===true || e.multi===LIMIT_MULTI.YES ?LIMIT_MULTI.YES:LIMIT_MULTI.NO,
            fileRequired: e.fileRequired
          }
        }
      })
      
      // 添付書類
      const chkServiceFileLimitList = []
      chkServiceFileLimitList.push(...fileLimit)

      //　マスターデータ
      const chkServiceMasterFileLimitList = []
      if (chkService.autoReview == 0) {
        chkServiceMasterFileLimitList.push(...masterFileLimit)
      }


      const apiData = {
        chkService,
        chkServiceInfoList,
        chkServiceConditionList,
        chkServiceFileLimitList,
        chkServiceMasterFileLimitList,
      }

      if(action == 'edit') {
        // 編集
       
          let chkUserServiceList =[]
          if(mangerUsers && mangerUsers.value){
              chkUserServiceList = mangerUsers.value.map(item => {
              return {
                userId: item,
                serviceId: form.value.serviceId,
                layer: isAdmin ? ROLE_LAYER.ADMIN : ROLE_LAYER.GENERAL
              }
            })
          }
          let chkFlowServiceList =[];
          if(flows && flows.value && chkService.autoReview === 0){
              chkFlowServiceList = flows.value.map(item => {
              return {
                flowId: item,
                serviceId: form.value.serviceId,
              }
            })
          }
          apiData.chkUserServiceList = chkUserServiceList
          apiData.chkFlowServiceList = chkFlowServiceList;
          apiData.chkService.id = form.value.serviceId; 
          
          let oldChkServiceCompare = JSON.parse(JSON.stringify(oldChkService.value));
          let apiDataCompare = JSON.parse(JSON.stringify(apiData));

          delete apiDataCompare.chkService.generalUserApplication;
          delete oldChkServiceCompare.chkService.generalUserApplication;
          delete apiDataCompare.chkUserServiceList;
          delete oldChkServiceCompare.chkUserServiceList;
          let newData = JSON.stringify(oldChkServiceCompare) != JSON.stringify(apiDataCompare) ? true : false;
          const kengeFlg = JSON.stringify(oldChkService.value) != JSON.stringify(apiData) ? true : false;
          //kengeFlg 権限だけ修正すれば,kengeFlgがTRUEにする
          apiData.kengeFlg =kengeFlg && newData === false? true : false;

          if (newData && saveType != 'release' ) {
            apiData.newData = newData;
            
            proxy.$modal.confirm("業務を変更すると、該当業務の未提出リクエストがクリアされます。よろしいでしょうか？").then(function () {
              return editServiceMatser(apiData)
            }).then((response) => {
              proxy.$modal.msgSuccess("更新成功");
              open.value = false;
              allowSet.value = false;
              getServiceList();
            });
          } else {
            apiData.newData = saveType === 'release'? true : false;

              editServiceMatser(apiData).then((response) => {
                if (response.code === 200) {
                    proxy.$modal.msgSuccess("更新成功");
                    open.value = false;
                    allowSet.value = false;
                    getServiceList();
                }
              });
          }
        
      } else if(action == 'add') {
        // 新規追加
         // 編集
         let chkUserServiceList =[]
        if(mangerUsers && mangerUsers.value){
            chkUserServiceList = mangerUsers.value.map(item => {
            return {
              userId: item,
              serviceId: form.value.serviceId,
              layer: isAdmin ? ROLE_LAYER.ADMIN : ROLE_LAYER.GENERAL
            }
          })
        }
        let chkFlowServiceList =[];
          if(flows && flows.value){
              chkFlowServiceList = flows.value.map(item => {
              return {
                flowId: item,
                serviceId: form.value.serviceId,
              }
            })
          }
        apiData.chkUserServiceList = chkUserServiceList
        apiData.chkFlowServiceList = chkFlowServiceList;
        
        addServiceMatser(apiData).then(response => {
          proxy.$modal.msgSuccess("新規成功");
          open.value = false;
          getServiceList();
        });
      } else {
        // プレビュー
        let data = [];
        let masterData =[];
        steps.value = [true, true, true, true, true];
       
        //Promise.all(fileLimitList.value.map((item, index) => {
        Promise.all(fileLimit.map((item, index) => {
          item.fileCount = isNaN(parseInt(item.fileCount)) ? 1 : parseInt(item.fileCount);
          data.push({
            samplePicture: '',
            fileCount: 0,
            filenameRule: '',
            fileSize: '',
            fileType: '',
            allowSet: 1,
            ...item,
            
          })
        })).then(() => {
          Promise.all(masterFileLimit.map((item, index) => {
            item.fileCount = isNaN(parseInt(item.fileCount)) ? 1 : parseInt(item.fileCount);
            masterData.push({
              samplePicture: '',
              fileCount: 0,
              filenameRule: '',
              fileSize: '',
              fileType: '',
              allowSet: 1,
              ...item,
              
            })
          }))
        }).then(() =>{
          apiData.chkServiceFileLimitList = data;
          apiData.chkServiceMasterFileLimitList = masterData;
          playViewData.value = apiData;
          let applicantData = {
              serviceName: chkService.serviceName,
              taskDescription: chkService.taskDescription !== undefined &&　chkService.taskDescription !== null && chkService.taskDescription !== "&lt;p&gt;null&lt;/p&gt;" && chkService.taskDescription.trim() !== '' ? htmlspecialchars_decode(chkService.taskDescription, 'ENT_QUOTES') : '',
              data: {
                chkServiceInfos: [],
                chkServiceConditions: [],
                limitFileTableData: [],
                masterLimitFileTableData: apiData.chkServiceMasterFileLimitList,
              },
              expireTime: 0
          }
          
          let task =  applicantData.taskDescription !== undefined
                && applicantData.taskDescription !== null 
                && applicantData.taskDescription.trim() !== '' 
          ? htmlspecialchars_decode(applicantData.taskDescription, 'ENT_QUOTES') : '';
          task = task.replace(/<\/?[^>]+>/ig, "").trim() === '' ? '' : task;
          playViewData.value.chkService.taskDescription = task;
          swiper.initialSlide = 0;
          
          if (
            playViewData.value.chkService.taskDescription === undefined ||
            playViewData.value.chkService.taskDescription === null ||
            playViewData.value.chkService.taskDescription.trim() === ''
          ) {
            steps.value[0] = false;
           

            //swiper.initialSlide = 1;
            //swiper.slidesPerView = 2;
          }
          if (
            apiData.chkServiceInfoList.length <= 0 &&
            apiData.chkServiceConditionList.length <= 0
          ) {
            steps.value[1] = false;
            //swiper.initialSlide = 2;
            //swiper.slidesPerView = 3;
          }
          initialSlide.value = swiper.initialSlide;
          // console.log("initialSlide.value ", initialSlide.value);
          localStorage.setItem("applicantData", JSON.stringify(applicantData));
          
          //swiper.value.slideTo(1);

          playView.value = true;
          closePage.value = false;
        })
    
      }
}


function submitForm(saveType, action) {

  const notDeletedFileLimitList= serviceFileLimitList.filter(item =>{
    let findItem = fileLimitList.value.find(e=>e.id==item.id)
    return findItem!=null && findItem!=undefined
  })

  const notDeletedMasterFileLimitList= serviceMasterFileLimitList.filter(item =>{
    let findItem = masterFileLimitList.value.find(e=>e.id==item.id)
    return findItem!=null && findItem!=undefined
  })
  

  const fileLimit = notDeletedFileLimitList.map(e => {

    if(e != null) {
      return {
        id:e.id,
        fileName: e.fileName,
        samplePicture: e.samplePicture,
        fileCount: e.fileCount,
        filenameRule: e.filenameRule,
        description: e.description,
        fileSize: e.fileSize,
        fileType:e.fileType,
        allowSet: e.allowSet === true ? 0 : 1,
        digipathId:e.digipathId,
        templateId:e.templateId,
        multi:e.multi===true || e.multi===LIMIT_MULTI.YES ?LIMIT_MULTI.YES:LIMIT_MULTI.NO,
        fileRequired: e.fileRequired
      }
    }
  })

  const masterFileLimit = notDeletedMasterFileLimitList.map(e => {

    if(e != null) {
      return {
        id:e.id,
        fileName: e.fileName,
        samplePicture: e.samplePicture,
        fileCount: e.fileCount,
        filenameRule: e.filenameRule,
        description: e.description,
        fileSize: e.fileSize,
        fileType:e.fileType,
        allowSet: e.allowSet === true ? 0 : 1,
        digipathId:e.digipathId,
        templateId:e.templateId,
        multi:e.multi===true || e.multi===LIMIT_MULTI.YES ?LIMIT_MULTI.YES:LIMIT_MULTI.NO,
        fileRequired: e.fileRequired
      }
    }
  })
  

  const chkServiceFileLimitList = []
  chkServiceFileLimitList.push(...fileLimit)
  const chkServiceMasterFileLimitList = []
  chkServiceMasterFileLimitList.push(...masterFileLimit)
  if(action == 'view') {
    //詳細
    if(saveType == 'release') {
      //詳細から、公開
      //公開にする
      //form.value.status=1
      const apiData = {
        id: form.value.id,
        status: OPEN_STATUS.OPEN
      }
      proxy.$modal.confirm('業務を公開すると、編集ができなくなりますが、よろしいでしょうか?').then(function () {
        updateService(apiData).then(response => {
          proxy.$modal.msgSuccess("該当サービスを公開しました。");
          open.value = false;
          allowSet.value = false;
          getServiceList();
        });
      });

    }
    return
  }
  if (action !== 'playView') {
    proxy.$refs["serviceRef"].validate(valid => {
      if(valid) {
        if(saveType == 'release') {
          proxy.$modal.confirm('業務を公開すると、編集ができなくなりますが、よろしいでしょうか?').then(function () {
            submitForm2(saveType, action);
          })
        } else {
          if (chkServiceFileLimitList.length <= 0) {
            alert('添付書類を定義してください。');
          } else {
            submitForm2(saveType, action);
          }
        }
      }
    });
  } else {
    if(saveType == 'release') {
      proxy.$modal.confirm('業務を公開すると、編集ができなくなりますが、よろしいでしょうか?').then(function () {
        submitForm2(saveType, action);
      })
    } else {
      if (chkServiceFileLimitList.length <= 0) {
        alert('添付書類を定義してください。');
      } else {
        submitForm2(saveType, action);
      }
    }
  }
}

/** 削除処理 */
function handleServiceDelete(row) {
  if (row.count != row.finalCount || perms2.remove === false ) {
     return ;
  } else {
    const _ids = row.id || serviceIds.value;
    proxy.$modal.confirm('業務：' + row.serviceName + 'を削除してもよろしいでしょうか？').then(function () {
      return delService(_ids);
    }).then(() => {
      getServiceList();
      proxy.$modal.msgSuccess("削除成功");
    }).catch(() => { });
  }
}

// info operation
/** 削除処理 */
function handleInfoDelete(row) {
  const _ids = row.id || serviceIds.value;
  proxy.$modal.confirm('"' + _ids + '"を削除してもよろしいでしょうか？').then(function () {
    return delInfo(_ids);
  }).then(() => {
    getInfoList();
    proxy.$modal.msgSuccess("削除成功");
  }).catch(() => { });
}

function handleInfoService() {
  currentDefination.info = {
    id: null,
    field: null
  }
}


/** 出力処理 */
function handleExport() {
  proxy.download('system/service/export', {
    ...queryParams.value
  }, `service_${new Date().getTime()}.xlsx`)
}

function truncate(string, value) {
  return string.length > value ? string.substring(0, value) + "..." : string;
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function beforeDestroy() {
  window.removeEventListener('scroll', () => {
    showScrollTop = window.scrollY > 200;
  });
}

function mounted() {
  window.addEventListener('scroll', () => {
      showScrollTop = window.scrollY > 200;
  });
  isSysAdminOrBpoAdmin.value = currentUserRoleKey == 'admin' || currentUserRoleKey == 'SCFTAdmin' || currentUserRoleKey=='bpo' || currentUserRoleKey=='BPO'  //BPO => BPOオペレーター
}

function handleRowClick(row) {
  currentDefination.info = { ...row };
  // currentDefination.info = Object.assign({}, row);
  // console.log(currentDefination.info);
  // currentDefination.info.field = row.field;
  // currentDefination.info.id = row.id;

}

function handleUpdateInfoList(newVal) {
  infoList.value = newVal;
}

function handleUpdateConditionList(newVal) {
  conditionList.value = newVal;
}

function handleUpdateFileLimitList(newVal) {
  // debugger
  fileLimitList.value = newVal;
}
function handleUpdateMasterFileLimitList(newVal) {
  // console.log("handleUpdateMasterFileLimitList ", newVal);
  // debugger
  masterFileLimitList.value = newVal;

}

// 添付書類
function handleFilelimitAdd(obj) {
  // console.log("handleFilelimitAdd ", obj.fileLimitObj);
  obj.fileLimitObj.allowSet = obj.fileLimitObj.allowSet === false ? 1 : 0;
  let fileCondition = convertLimitToFileCondition(obj.fileLimitObj)
  const obj2 = { 
    id: obj.fileLimitObj.id,
    fileCondition: fileCondition,
    filelimitName: obj.fileLimitObj.fileName,
    allowSet: obj.fileLimitObj.allowSet === 0 ? true : false
  }
 
  if ( typeof obj.fileLimitObj.index !== 'undefined' && obj.fileLimitObj.index !== null ) {
    const lastLimit = fileLimitList.value[fileLimitList.value.length - 1].value;
    if (!lastLimit) {
      const fileLimitFindIndex = fileLimitList.value.findIndex((item, index) => index === obj.fileLimitObj.index);
      if (fileLimitFindIndex !== -1) {
        fileLimitList.value.splice(fileLimitFindIndex, 1, obj2);
      }
    }
  } else {
    let targetFileLimit = fileLimitList.value.find(e => e.id == obj.id)
    if (targetFileLimit) {
      Object.assign(targetFileLimit,obj)
    } else {
      fileLimitList.value.push(obj)
    }
  }
  if (obj.fileLimitObj.id) {
    let targetObj = serviceFileLimitList.find(e => e.id == obj.fileLimitObj.id)
    if (targetObj) {
      Object.assign(targetObj,obj.fileLimitObj)
    } else {
      serviceFileLimitList.push(obj.fileLimitObj)
    }
  }else {
    //fileLimitを追加の時
    let targetObj = null;
      Promise.all(
        serviceFileLimitList.map((item, index) => {
           if (
            item.index !== undefined &&
            obj.fileLimitObj.index !== undefined &&
            item.index === obj.fileLimitObj.index
          ) {
            serviceFileLimitList[index] = obj.fileLimitObj;
            targetObj = item;
          }
        })
      ).then(() => {
         if (targetObj == null) {
          serviceFileLimitList.push(obj.fileLimitObj)
         }
      })
    
  }


}

// マスターデータ
function handleMasterFilelimitAdd(obj) {
  let fileCondition = convertLimitToFileCondition(obj.fileLimitObj)
  const obj2 = { 
    id: obj.fileLimitObj.id,
    fileCondition: fileCondition,
    filelimitName: obj.fileLimitObj.fileName,
    allowSet: obj.fileLimitObj.allowSet === 0 ? true : false
  }
  if ( typeof obj.fileLimitObj.index !== 'undefined' && obj.fileLimitObj.index !== null && masterFileLimitList.value.length > 0 ) {
    const lastLimit = masterFileLimitList.value[masterFileLimitList.value.length - 1].value;
    if (!lastLimit) {
      const fileLimitFindIndex = masterFileLimitList.value.findIndex((item, index) => index === obj.fileLimitObj.index);
      if (fileLimitFindIndex !== -1) {
        masterFileLimitList.value.splice(fileLimitFindIndex, 1, obj2);
      }
    }
  } else {
    let targetFileLimit = masterFileLimitList.value.find(e => e.id == obj.id)
    if (targetFileLimit) {
      Object.assign(targetFileLimit,obj)
    } else {
      masterFileLimitList.value.push(obj)
    }
  }
  if (obj.fileLimitObj.id) {
    let targetObj = serviceMasterFileLimitList.find(e => e.id == obj.fileLimitObj.id)
    if (targetObj) {
      Object.assign(targetObj,obj.fileLimitObj)
    } else {
      serviceMasterFileLimitList.push(obj.fileLimitObj)
    }
  } else {
    //fileLimitを追加の時
    let targetObj = null;
      Promise.all(
        serviceMasterFileLimitList.map((item, index) => {
           if (
            item.index !== undefined &&
            obj.fileLimitObj.index !== undefined &&
            item.index === obj.fileLimitObj.index
          ) {
            serviceMasterFileLimitList[index] = obj.fileLimitObj;
            targetObj = item;
          }
        })
      ).then(() => {
         if (targetObj == null) {
          serviceMasterFileLimitList.push(obj.fileLimitObj)
         }
      })
    
  }
  
}

function handleFilelimitDel(obj) {
   if (obj.paegname === "masterFilelimit") {
    serviceMasterFileLimitList.splice(obj.index, 1);
   } else {
    serviceFileLimitList.splice(obj.index, 1);
   }
}

function handleToApplication(row){
  router.push({
    path:'/service/index/application',
    query:{
      serviceId:row.service.id,
      serviceName:row.service.serviceName
    }
  });

}

const searchGov = (query) => {
    if (
        (form.value.govId === null || form.value.govId === undefined)
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
            //const list = res.rows
            const list = res.data;
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
        //searchGovStep2();
    }
}

function selectGov(govId) {
  form.value.govId = govId;
}

function searchFlow(query){
  setTimeout(() => {
    searchFlowList({flowName:query}).then( res =>{
      const list = res;
      flowList.value = list.map(item=>{
        return {
          label:item.flowName,
          value:item.flowId
        }
      })
    })
  }, 200)
}

function initGovOptions(govId) {
  if (govId && govId!==null) {
    getGov(govId).then(res => {
      govOptions.value = [
        { value: govId, label: res.data.name }
      ]
    })
  }
}

function searchMangerUser(query){
    setTimeout(() => {
      const queryObj= {}
      queryObj.govId= form.value.govId;   /*ROLE_GROUP.MANAGER*/
      queryObj.name = query
      listUserByCondition(queryObj).then( res =>{
        const list = res.rows
        mangerUserOptions.value = list.map( item=>{
          return {
            value:item.userId,
            label:item.name + '（' + item.roleName + '）',
          }
        })
      })
    }, 200)
}


function initMangerUser(serviceId) {
  if (serviceId && serviceId!='null') {
    const layer  = isAdmin ? null : ROLE_LAYER.GENERAL
    const data={
      serviceId,
      layer
    }
    listUserByService(data).then(res => {
 
      const userOptions = []
      const users =[]
      res.forEach(e => {
        userOptions.push({
          value:e.userId,
          label:e.name
        }
      )
      users.push(e.userId)
      });
      mangerUsers.value=users
      mangerUserOptions.value=userOptions
    })
  }
}
const clearGovId = () => {
  queryParams.value.govId = null;
  queryParams.value.pageNum = 1;
  getServiceList();
}
function initFlows(serviceId) {
  if (serviceId && serviceId!='null') {
    const layer  = isAdmin ? null : ROLE_LAYER.GENERAL
    const data={
      serviceId,
      layer
    }
    listFlowByService(data).then(res => {
 
      const flowsOptions = []
      const flowIds =[]
      res.forEach(e => {
        flowsOptions.push({
          value:e.flowId,
          label:e.flowName
        }
      )
      flowIds.push(e.flowId)
      });
      flows.value=flowIds;
      flowList.value = flowsOptions;
    })
  }
}


mounted();
getServiceList();
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.el-button--primary {
  box-shadow: 0 2px 120px 10px rgba(10, 10, 10, 0.1);
}

.el-button {
  box-shadow: 0 2px 120px 10px rgba(10, 10, 10, 0.1);

}

div.el-date-editor {
  width: 1300px;
  background-color: blueviolet;
}

.el-input div {
  width: 2100px;
}
.button_center{
  display: flex;
  flex-direction: column;
}
.add_button{
  margin-bottom: 20px;
}

.swiper{
  display: flex;
  flex-wrap: nowrap;
}
.swiper-slide{
  width: 50px;
}
.swiper-button-prev {
  --swiper-navigation-size:50px;
}
.swiper-button-next {
  --swiper-navigation-size:50px;
}
.swiper-button-prev, .swiper-button-next {
  top: 30%;
}
:deep(.ql-editor[contenteditable=false]) {
  background-color: #e4e7ed;
}
:deep(.ql-toolbar.ql-snow) {
  width: 43.5em!important;
}
</style>