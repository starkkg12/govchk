<template>
  <cardShadow v-if="step === 1">
    <div class="content">
      
      <div style="margin: 3%; ">
        <el-steps
          style="width: 100%;"
          :space="200"
          :active="0"
          finish-status="success"
          align-center="true"
        >
          <el-step color="red"/>
          <el-step  v-if="step2" />
          <el-step  />
          <el-step  v-if="masterLimitFileTableData.length > 0" />
        </el-steps>
      </div>
      <el-row style="margin-top: 5%; justify-content: center">
        <el-col :span="12" class="text-center">
          <h3>業務説明</h3>
        </el-col>
      </el-row>
  
      <el-row>
        <el-col :span="24" :offset="6">
          <div class="local ql-editor" style="white-space: break-spaces;" v-html="taskDescription">
            
          </div>
          <el-row style="justify-content:center!important;" v-if="props.playViewData === undefined ">
            <el-col :span="24" :offset="2">
              <el-button class="buttonShadow" type="primary" size="large" plain @click="goBack()">戻る</el-button>
              <el-button class="buttonShadow" type="primary" size="large" plain @click="goToNext()">次へ</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </cardShadow>
  <info_edit  v-if="step === 2"  :masterLimitFileTableData="masterLimitFileTableData" :limitFileTableData="limitFileTableData" :signleSize="signleSize" :totalMaxSize="totalMaxSize" :updatedTime="updatedTime" :startStep="startStep" :applicantData="applicantData" :action="action" @goto="goto" :serviceName="serviceName" />
  <documents_upload :limitFileTableData="limitFileTableData" :masterLimitFileTableData="masterLimitFileTableData" :updatedTime="updatedTime" :signleSize="signleSize" :totalMaxSize="totalMaxSize" :step2="step2" :startStep="startStep" v-if="step === 3" :applicantData="applicantData" :action="action" @goto2="goto2" :serviceName="serviceName"/>
</template>

<script setup>
import { ElMessage } from 'element-plus'

import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from "vue";
import { getServieInfo } from "@/api/system/service/info";
import { htmlspecialchars, htmlspecialchars_decode } from '@/utils/theme';
import { getMasterFileLimitListByServiceId } from '@/api/system/service/limit'



import cardShadow from "@/components/Customized/cardShadow";
import info_edit from './info_edit.vue';
import documents_upload from './documents_upload.vue';
import { getInfoData } from '@/api/system/application/info';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props =defineProps(['playViewData', 'step2'])


let urlParams = new URLSearchParams(window.location.search);
const serviceId = parseInt(urlParams.get("serviceId"));

const route = useRoute()
const router = useRouter()
const mode = route.query.mode
const isLocal = computed(() => mode == 'local')
const currentStep = ref(0);
const updatedTime = ref(null);
const signleSize = ref(100);
const totalMaxSize = ref(500);
const limitFileTableData = ref([]);

let task =  props.playViewData !== undefined &&
          props.playViewData.chkService.taskDescription !== undefined 
          && props.playViewData.chkService.taskDescription !== null 
          && props.playViewData.chkService.taskDescription.trim() !== '' 
          ? htmlspecialchars_decode(props.playViewData.chkService.taskDescription, 'ENT_QUOTES') : '';
const taskDescription = ref(
        props.playViewData !== undefined ? 
            task.replace(/<\/?[^>]+>/ig, "").trim() === '' ? '' : task : '' );

const action = ref( parseInt(urlParams.get("ac")) === 1 ? true : false);
if (urlParams.get("new") !== undefined && urlParams.get("new") == 'true') {
  localStorage.removeItem("applicantData");
  action.value = true;
}
const serviceName = props.playViewData !== undefined ? props.playViewData.chkService.serviceName : route.query.serviceName

// リクエストデータ初期化
const applicantData = ref(
  localStorage.getItem("applicantData") !== null &&
  localStorage.getItem("applicantData") !== undefined &&
  localStorage.getItem("applicantData") !== 'undefined'
   ?
  JSON.parse(localStorage.getItem("applicantData")) :  
  {
    serviceName: props.playViewData !== undefined ? props.playViewData.chkService.serviceName : serviceName,
    data: {
      chkServiceInfos: [],　　　　// 基本情報データ
      chkServiceConditions: [],　 // 条件定義データ
      limitFileTableData: [],　　　// 添付書類データ
      masterLimitFileTableData: props.playViewData === undefined || props.playViewData.chkServiceMasterFileLimitList === undefined ? [] : props.playViewData.chkServiceMasterFileLimitList
    },
    expireTime: 0
  }
);
if ( 
  localStorage.getItem("applicantData") !== null &&
  localStorage.getItem("applicantData") !== undefined &&
  localStorage.getItem("applicantData") !== 'undefined'
) {
localStorage.setItem("applicantData", JSON.stringify(applicantData.value));
}
// マスターデータ
const masterLimitFileTableData = ref(applicantData.value.data.masterLimitFileTableData);
const step = ref(1);
const startStep = ref(1);
const step2 = ref(props.step2 !== undefined ? props.step2 : false);
const applicationId = ref(urlParams.get("applicationId") === null ? null : parseInt(urlParams.get("applicationId")));
function goto(goto) {
  switch(goto) {
    case 'next':
      step.value +=1 ;
    break;
    default:
      
      if (step.value > 2) {
        step.value -= 1;  
        if (
           step.value === 2 &&
           step2.value !== true
        ) {
          step.value = 1;
        }
      } else {
        step.value = 1;
      }
      
    break;
  }
}
async function goto2(obj) {
  applicantData.value = JSON.parse(obj);
  limitFileTableData.value = applicantData.value.data.limitFileTableData

  await localStorage.setItem("applicantData", obj);
  goto('back');
}
const goBack = () =>{
  router.back()
}



// 次へのボタンのメソッド
const goToNext = () => {
  getServieInfo(serviceId).then(async (response) => {
    if (response.code == 200) {
      signleSize.value = response.data.signleSize;
      totalMaxSize.value = response.data.totalMaxSize;
      // 添付書類データ初期化
      // applicantData.value.limitFileTableData = [];
      // applicantData.value.limitRollFileTableData = [];
      // マスターデータデータ初期化
      applicantData.value.masterLimitFileTableData = [];
      if (
        response.data.updatedTime !== updatedTime.value && 
        updatedTime.value !== null
      ) {
        ElMessage({ message:"該当業務は既に変更されています。再度リクエストを申請してください。",  type: 'error'});
      } else if (
        response.data.chkServiceInfos.length > 0 ||
        response.data.chkServiceConditions.length > 0
      ) {
        step.value = 2;
        step2.value = true;
      } else {
       
        localStorage.setItem("applicantData", JSON.stringify(applicantData.value));
        step.value = 3;  
      } 
    } else {
      router.back();
    }
  });
}

onMounted( async ()=>{
  let gotoStep = step.value;
  if (props.playViewData === undefined) {
    if (
      applicantData.value.data.masterLimitFileTableData.length <= 0
    ) {
      let masterRes  = await getMasterFileLimitListByServiceId(serviceId);
      applicantData.value.data.masterLimitFileTableData = masterRes.code === 200 ? masterRes.data : [];
      masterLimitFileTableData.value = applicantData.value.data.masterLimitFileTableData;
    }
    getServieInfo(serviceId).then(async (response) => {
      if (response.code == 200) {
          if (
              response.data.chkServiceInfos.length > 0 ||
              response.data.chkServiceConditions.length > 0
          ) {
             step2.value = true;
          }
          updatedTime.value = response.data.updatedTime;
          let task = response.data.taskDescription !== undefined 
          && response.data.taskDescription !== null 
          && response.data.taskDescription.trim() !== '' 
          ? htmlspecialchars_decode(response.data.taskDescription, 'ENT_QUOTES') : '';
          taskDescription.value = task.replace(/<\/?[^>]+>/ig, "").trim() === '' ? '' : task ;
          localStorage.setItem("applicantData", JSON.stringify(applicantData.value));

          if (
            applicationId.value !== undefined && applicationId.value != null
          ) {
            
            getInfoData(applicationId.value).then(async (response) => {
              if (response.data.status === '0') {
                if ( applicantData.value === null || applicantData.value === undefined) {
                
                  applicantData.value = {
                    serviceName: serviceName,
                    
                    data: {
                      chkServiceInfos: [],
                      chkServiceConditions: response.data.conditionInfo,
                      limitFileTableData:  response.data.applicationInfoFiles,
                      masterLimitFileTableData: response.data.applicationInfoMasterFiles,
                      limitRollFileTableData: [],
                    },
                    expireTime: 0
                  };
                  
                }else { 
                  applicantData.value.data.chkServiceInfos =  [];
                  applicantData.value.data.chkServiceConditions =  response.data.conditionInfo;
                  applicantData.value.data.limitFileTableData = [];
                  applicantData.value.data.limitRollFileTableData = [];
                  applicantData.value.data.masterLimitFileTableData =  response.data.applicationInfoMasterFiles;
                }
                response.data.applicationInfo.map((item) => {
                      applicantData.value.data.chkServiceInfos = [...applicantData.value.data.chkServiceInfos,
                        {
                          serviceConditionId: item.id,
                          description: item.description,
                          isCompulsory: item.isCompulsory,
                          itemName: item.itemName,
                          itemType: item.itemType,
                          value: item.value
                        }
                      ]
                })
                limitFileTableData.value = response.data.applicationInfoFiles;
                localStorage.setItem("applicantData", JSON.stringify(applicantData.value));
                step.value = 3;
                startStep.value =  taskDescription.value !== '' ? 1 : taskDescription.value === '' &&  step2.value === true ? 2 : 3;
              } else {
                location.href="../index";
              }
            }).catch((err) => {
              if (err === 'data not found') {
                setTimeout(() => {
                  location.href="../index";
                }, 2000)
              }
            })
          } else {
            taskDescription.value = task.replace(/<\/?[^>]+>/ig, "").trim() === '' ? '' : task ;
            localStorage.setItem("applicantData", JSON.stringify(applicantData.value));
            step.value = taskDescription.value !== '' ? 1 : taskDescription.value === '' &&  step2.value === true ? 2 : 3;
            startStep.value = step.value;
          }
          
          // console.log("startStep.value ", startStep.value);
      }
    });
　}
});
watch(() => props.playViewData, () => {
  let task = props.playViewData.chkService.taskDescription !== undefined 
          && props.playViewData.chkService.taskDescription !== null 
          && props.playViewData.chkService.taskDescription.trim() !== '' 
          ? htmlspecialchars_decode(props.playViewData.chkService.taskDescription, 'ENT_QUOTES') : '';
  taskDescription.value = task.replace(/<\/?[^>]+>/ig, "").trim() === '' ? '' : task ;
  applicantData.data.masterLimitFileTableData = props.playViewData.chkServiceMasterFileLimitList;
 
})


</script>
<style>
.content .el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.el-progress--line {
  margin-bottom: 15px;
  width: 350px;
  background-color: blue;
}

.is-success>.el-step__icon {
  background-color: blue;
  color: white;
  border: none;
}

.is-process>.el-step__icon,
.is-wait>.el-step__icon {
  background-color: rgb(183, 180, 180);
  color: white;
  border: none;
}
.content .el-col-offset-6 {
  margin-left: unset;
}
.content .el-col-24 {
  flex: none;
}
.content >.el-row {
  justify-content: center!important;
}
.content .ql-editor {
  height: auto;
}
</style>