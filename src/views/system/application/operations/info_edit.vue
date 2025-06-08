
<template>
  <cardShadow v-if="step === 2">
    <div class="content">
      <div style="margin: 3%; ">
        <el-steps
          style="width: 100%;"
          :space="200"
          :active="startStep < 2 ? 1 : 0"
          finish-status="success"
          align-center="true"
        >
          <el-step v-if="startStep < 2 " />
          <el-step color="red" />
          <el-step />
          <el-step v-if="masterLimitFileTableData.length > 0" />
        </el-steps>
      </div>
      <div>
        <el-row style="margin-top: 5%; justify-content: center!important;">
          <el-col :span="12" class="text-center">
            <h3>基本情報入力</h3>
          </el-col>
        </el-row>
      </div>
      <el-row>
        <el-col :span="24" :offset="1" style="display: contents!important; justify-content: center">
          <el-form>
            <el-form-item class="label" label="は必ず入力してください。" :required="true" style="width: 100%; ">

            </el-form-item>
            <el-form-item :label="item.itemName == null || item.itemName == undefined || item.itemName.trim() == '' ? ' ' : item.itemName " :required="item.itemIsCompulsory === '1'" v-for="item in applicantData.data.chkServiceInfos" :key="item" >
              <el-input  :disabled="disabled" prop="item.key" v-if="item.itemType !== undefined && item.itemType !== null && item.itemType <= 2" :placeholder="ServiceInfoOptions.find((e) => e.value === item.itemType).label" name="inputText[]" clearable style="width: 250px" v-model="item.value" maxlength="100" show-word-limit />             
              <el-input  :disabled="disabled" prop="item.key" v-if="item.itemType == 3" :placeholder="ServiceInfoOptions.find((e) => e.value === item.itemType).label" name="inputText[]" clearable style="width: 250px" v-model="item.value" maxlength="100" show-word-limit />
              <el-input  :disabled="disabled" prop="item.key"  v-if="item.itemType == 5" :placeholder="ServiceInfoOptions.find((e) => e.value === item.itemType).label" name="inputNumbrt[]" clearable style="width: 250px" v-model="item.value" maxlength="100" show-word-limit />
              <el-date-picker  :disabled="disabled" prop="item.key"  clearable v-if="item.itemType==4" v-model="item.value" name="inputDate[]" type="date" value-format="YYYY-MM-DD"
                   style="width:200px">
              </el-date-picker>
              <el-checkbox  :disabled="disabled" prop="item.key"  v-if="item.itemType==6"  v-model="item.value" :value="1" :checked="item.value === 'true'" style="width: 250px"  />
            </el-form-item>
            
          </el-form>
        </el-col>
      </el-row>

      <div class="info">
        <el-row style="justify-content: center important;" v-for="item in applicantData.data.chkServiceConditions" :key="item">
          <el-col :offset="1" style="min-width: 25em">
            <el-row style="max-height:150px; min-width: 15em; border:1px solid black; padding-left: 1em">
              <el-col :span="2" class="clo-center">
                <el-checkbox :disabled="disabled" size="large" id="checkbox1" v-model="item.value" :value="1" :checked="item.value === 'true'" />
              </el-col>
              <el-col :span="22" class="clo-center">
                <div><span class="must-tip" v-if="item.isCompulsory === 1">＊</span> {{ item.description }} </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      
      </div>

      <el-row>
        <el-col :span="12" :offset="1" v-if="props.playViewData === undefined">
          <el-row class="button_row" style="justify-content: center !important;">
            <el-col :span="8" :offset="8" style="display:contents">
              <el-button class="buttonShadow" type="primary"  size="large" plain @click="goBack()">戻る</el-button>
              <el-button class="buttonShadow" type="primary" size="large" plain @click="upload()">次へ</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </cardShadow>
  <documents_upload :limitFileTableData="limitFileTableData" :masterLimitFileTableData="masterLimitFileTableData" :signleSize="signleSize" :totalMaxSize="totalMaxSize"  :updatedTime="updatedTime" v-if="step === 3" :startStep="startStep"  @goto2="goto2" :serviceName="serviceName"/>
  <edit v-if="step === 1" />
</template>

<script setup>
import { ElMessage } from 'element-plus'

import { useRouter } from 'vue-router';
import { getServieInfo, updateServieInfo } from "@/api/system/service/info";
import cardShadow from "@/components/Customized/cardShadow";
import { validateIfFullKatakanaWidth, isHankakuKana } from '@/utils/validate'

import documents_upload from './documents_upload.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { ServiceInfoOptions } from '@/utils/serviceManage/serviceTitle.js'


const textError = ref(false);
const step = ref(2);
const required = ref(false);
const data = ref([]);
let urlParams = new URLSearchParams(window.location.search);
const serviceId = parseInt(urlParams.get("serviceId"));
const serviceName = urlParams.get("serviceName")
const props =defineProps(['serviceName', 'playViewData', 'action', 'applicantData', 'startStep', 'closePage', 'updatedTime', 'signleSize','totalMaxSize', 'limitFileTableData', 'masterLimitFileTableData' ])
const disabled = props.playViewData !== undefined ? true : props.action !== undefined && props.action === false ? true : false;
const callback = ref(props.startStep < 2 ? true : false);
const signleSize = ref(props.signleSize);
const totalMaxSize = ref(props.totalMaxSize);
const startStep = ref(props.startStep);
const limitFileTableData = ref(props.limitFileTableData);

const masterLimitFileTableData = ref(props.playViewData !== undefined ? props.playViewData.chkServiceMasterFileLimitList : props.masterLimitFileTableData)

watch(() => props.closePage, () => {
  
    startStep.value = props.startStep;
    
    callback.value = props.startStep < 2 ? true : false;
    

})

watch(() => props.limitFileTableData, () => {
  
  limitFileTableData.value = props.limitFileTableData;
  

})

const emit = defineEmits(['goto']);
const updatedTime = ref(props.updatedTime)
// localStorage.removeItem("applicantData");
// console.log("props.applicantData", props.applicantData)
const applicantData = ref(
  props.applicantData !== undefined &&
  props.applicantData !== null ?
  props.applicantData : 
  localStorage.getItem("applicantData") !== null &&
  localStorage.getItem("applicantData") !== undefined &&
  localStorage.getItem("applicantData") !== 'undefined' ?
  JSON.parse(localStorage.getItem("applicantData")) :  
  {
    serviceName: '',
    data: {
      chkServiceInfos: [],
      chkServiceConditions: [],
      limitFileTableData: props.limitFileTableData !== undefined ? props.limitFileTableData : [],
      masterLimitFileTableData: masterLimitFileTableData,
    },
    expireTime: 0
  }
);
watch(() => props.limitFileTableData, () => {
  applicantData.data.limitFileTableData = props.limitFileTableData;
  limitFileTableData.value = props.limitFileTableData;
})
const initData = () => {
  applicantData.value = {
    serviceName: '',
    data: {
      chkServiceInfos: [],
      chkServiceConditions: [],
      limitFileTableData: [],
      masterLimitFileTableData: [],
    },
    expireTime: 0
  };

}
if (applicantData.value === null ) {
  initData();
}

const router = useRouter();

const goBack = () =>{
  if (callback.value === false) {
    router.back()
  } else {
    if(props.serviceName){
      emit('goto', 'back');
    }else {
      goto2('back');
    }
  }
}
const upload = async () =>{
  let error = false;
  let errorRequiredMsg = "必要項目入力してください。";
  let errorRequiredCheckMsg = "必要項目選択してください。"
  let errorRequiredCheckMsg2 = 'カタカナで入力してください。'
  let errorMsg = "";
  
  getServieInfo(serviceId).then(async (response) => {
    if (response.code == 200 && response.data.updatedTime === props.updatedTime) {
      await applicantData.value.data.chkServiceInfos.map((item, index) => {
        switch(item.itemType) {
          case 1:
          case 2:
            if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
              error = true;
              errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
            } else if (item.value.trim() !='' && item.value.length > 100) {
              error = true;
              errorMsg += "100文字以内で入力してください。| " + item.itemName + " \n";
            } else if (
              item.value.trim() !='' &&
              item.itemType === 2 && 
              !validateIfFullKatakanaWidth(item.value) &&
              !isHankakuKana(item.value)) {
                error = true;
                errorMsg += errorRequiredCheckMsg2+ "| " + item.itemName + " \n";
              }
              
            break;
          case 3:
            const regex = /^[a-z\d][\w.-]*@[\w.-]+\.[a-z\d]+$/i;
            if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
              error = true;
              errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
            } else if (item.value.trim() !=''  && !regex.test(item.value.trim())) {
              error = true;
              errorMsg += "メールアドレスを正しく入力してください。| " + item.itemName + " \n";
            } else if (
              item.value.trim() !='' &&
              item.itemType === 2 && 
              !validateIfFullKatakanaWidth(item.value) &&
              !isHankakuKana(item.value)) {
                error = true;
                errorMsg += errorRequiredCheckMsg2+ "| " + item.itemName + " \n";
              }
            
            break;
          case 4:
          　if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
              error = true;
              errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
            }else if (item.value.trim() !=''  && isNaN(new Date(item.value).getDate())) {
              error = true;
              errorMsg += "日付を正しく入力してください。| " + item.itemName + " \n";
            }
            break;
          case 5:
            const regex2 = /[^0-9]/g;
            if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
              error = true;
              errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
            }else if (item.value.trim() !=''  && regex2.test(item.value.trim())) {
              error = true;
              errorMsg += "半角数字入力してください。| " + item.itemName + " \n";
            }
            break;
          case 6:
          　if (item.itemIsCompulsory === "1" && !item.value) {
              error = true;
              errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
            }
            break;
        }
      });
      
      await applicantData.value.data.chkServiceConditions.map((item, index) => {
        if (item.isCompulsory === 1 && item.value !== true) {
          error = true;
          errorMsg += errorRequiredCheckMsg + "| " + item.description + " \n";
        }
      });
      if (error) {
        alert(errorMsg);
        return false;
      }else {
        localStorage.setItem("applicantData", JSON.stringify(applicantData.value));
        goto2('next');
      }
    } else if ( response.data.updatedTime !== props.updatedTime) {
      ElMessage({ message:"該当業務は既に変更されています。再度リクエストを申請してください。",  type: 'error'});
    }
  });
}
function goto2(goto) {
  switch(goto) {
    case 'next':
      step.value +=1 ;
    break;
    default:
      step.value -= 1;
    break;
  }
}
if (
  applicantData.value.data.chkServiceInfos.length <= 0 &&
  props.playViewData === undefined
) {

  getServieInfo(serviceId).then((response) => {
    if (response.code == 200) {
        applicantData.value.serviceName = response.data.serviceName;
        response.data.chkServiceInfos.map((item) => {
          if (item.itemIsCompulsory === '1' && required.value === false) {
            required.value = true;
          }
          if (urlParams.get("new") !== undefined && urlParams.get("new") == 'true') {
            applicantData.value.data.chkServiceInfos = [...applicantData.value.data.chkServiceInfos,
              {
                itemName: item.itemName,
                serviceInfoId: item.id,
                itemType: item.itemType,
                itemIsCompulsory: item.itemIsCompulsory,
                value: '',
                createdTime: ''
              }
            ]
          }
        })
        applicantData.value.data.chkServiceConditions = [];
        response.data.chkServiceConditions.map((item) => {
          applicantData.value.data.chkServiceConditions = [...applicantData.value.data.chkServiceConditions,
            {
              serviceConditionId: item.id,
              description: item.description,
              isCompulsory: item.isCompulsory,
              value: ''
            }
          ]
        })
    }
  })
} else if (props.playViewData !== undefined) {
  applicantData.value.serviceName = props.playViewData.chkService.serviceName;
  applicantData.value.data.chkServiceInfos = props.playViewData.chkServiceInfoList;
  applicantData.value.data.chkServiceConditions = props.playViewData.chkServiceConditionList;
}

watch(() => props.playViewData, () => {
  if (props.playViewData !== undefined) {
     applicantData.value.serviceName = props.playViewData.chkService.serviceName;
     applicantData.value.data.chkServiceInfos = props.playViewData.chkServiceInfoList;
     applicantData.value.data.chkServiceConditions = props.playViewData.chkServiceConditionList;
  }
})

</script>



<style scoped>
.info_content {
  border: 1px solid black;
  width: 500px;
  height: 150px;
  margin-top: 20px;
}
.info > * {
  margin-top: 20px;
}
.button_row {
  margin-top: 10px;
  justify-content: center!important;

}

.must-tip {
  margin-right: 2px;
  color: red;
}
</style>
<style>
.content {
  justify-content: center;
  
}
.clo-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /*align-items: center;*/
}
.content > .info {
  display: grid;
  justify-content: center!important;
}
.content > .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
  background-color: blue!important;
}

.content > .is-success>.el-step__icon {
  background-color: blue!important;
  color: white;
  border: none;
}
.content .label {
  width: 80%;
  justify-content: center;
}
.content .el-form {
  width: 80%;
}
.content  .el-form-item__label {
  min-width: 44%;
  
  justify-content: left;
}
.content .label .el-form-item__label {
  min-width: 100%;
  justify-content: center!important;
}
.content > .el-col-offset-1 {
  display: flex;
  justify-content: center;
  margin-left: unset;
}
.el-steps {
  justify-content: center;
}
.content > .el-row {
  justify-content: center!important;
}
.content > .el-col {
  margin-bottom: unset;
}
</style>