
<template>
  <cardShadow v-if="!isFinal">
    <div class="content3">
      <div style="margin: 3%; " v-if="callback || applicantData.data.masterLimitFileTableData.length > 0">
        <el-steps
          style="width: 100%;"
          :space="200"
          :active="4"
          finish-status="success"
          align-center="true"
        >
          <el-step  v-if="startStep < 2" />
          <el-step  v-if="step2" />
          <el-step  />
          <el-step  v-if="applicantData.data.masterLimitFileTableData.length > 0"/>
        </el-steps>
      </div>
      <div>
        <el-row style="margin-top: 5%; justify-content: center!important">
          <el-col :span="5" class="text-center">
            <h3>入力内容確認</h3>
          </el-col>
        </el-row>
      </div>

      <!-- 基本情報部分-->

      <el-row v-if="applicantData.data.chkServiceInfos.length > 0" style="display: contents!important; justify-content: center">
        <el-col :span="24" :offset="1">
          <div>
            <el-form>
              <el-form-item class="label" label="基本情報："  style="width: 100%; font-size: 20px; margin-right: 20px "/>
              <el-form-item :label="item.itemName == null || item.itemName == undefined || item.itemName.trim() == '' ? ' ' : item.itemName" :required="item.itemIsCompulsory === '1'" v-for="item in applicantData.data.chkServiceInfos" :key="item" >
                
                <el-input  :disabled="true" prop="item.key" v-if="item.itemType <= 2"  name="inputText[]" clearable style="width: 240px" v-model="item.value" maxlength="100" />             
                <el-input  :disabled="true" prop="item.key" v-if="item.itemType == 3 "  name="inputText[]" clearable style="width: 240px" v-model="item.value" />
                <el-input  :disabled="true" prop="item.key"  v-if="item.itemType == 5 "  name="inputNumbrt[]" clearable style="width: 240px" v-model="item.value" />
                <el-date-picker  :disabled="true" prop="item.key"  clearable v-if="item.itemType==4" v-model="item.value" name="inputDate[]" type="date" value-format="YYYY-MM-DD"
                     style="width:200px">
                </el-date-picker>
                <el-checkbox  :disabled="true" prop="item.key"  v-if="item.itemType==6"  v-model="item.value" :value="1" style="width: 240px"  />
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>


      <el-row style="justify-content: center!important">
        <el-col :span="24" :offset="1">
          <!-- 添付ファイル部分 -->
          <div>
            <span>添付ファイル：</span>
            <br />
            <el-table 
               class="document_upload_thead"
               style="width: 100%" 
               v-if="reactiveTableData.length > 0" 
               :data="reactiveTableData" 
               :border="true"
               :header-cell-class-name="theadSpan"
              >
              <el-table-column prop="fileName" :label="allowSetTilte" style="text-align: center!important"></el-table-column>
              <el-table-column prop="description"  width="320" show-overflow-tooltip="false" class="hidden-column" />
              <el-table-column prop="files"  width="320"  show-overflow-tooltip="false" class="hidden-column" >
                <!-- <template #default="scope">
                  <div right v-if="scope.row.files.length > 0 " class="slide" @click="isFileListOpen($event, scope.row.serviceFileLimitId)">
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
                  <ul v-show="fileListOpen.includes(scope.row.serviceFileLimitId) > 0"  :style="{ left: (fp[scope.$index] === undefined || fp[scope.$index].left === undefined ? '0' : fp[scope.$index].left ) + 'px', top: (fp[scope.$index] === undefined || fp[scope.$index].top === undefined ? '0' : fp[scope.$index].top) + 'px', position:'fixed', minWidth: '300px' }" class="contextmenu">
                    <li  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex">
                      <span class="font-semibold">
                        {{ file.fileName ? file.fileName : file.name }} 
                      </span>
                    </li>
                  </ul>
                </template> -->
                <template #default="scope">
                  <div class="filearea">
                    <div class="font-semibold"  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)">
                      {{ file.fileName ? file.fileName : file.name }} 
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <el-table :data="reactiveTableData2" style="width: 100%"  :border="true">
              <el-table-column align="right" prop="serviceFileLimitId" label="項目番号" width="100" >
                <template #default="scope" >
                  {{ (scope.$index + 1)  }}
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="ファイル種別" width="320" />
              <el-table-column prop="files" label="ファイル名	" width="320">
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
                  <ul v-show="fileListOpen.includes(scope.row.serviceFileLimitId) > 0"  :style="{ left: (fp[scope.$index] === undefined || fp[scope.$index].left === undefined ? '0' : fp[scope.$index].left ) + 'px', top: (fp[scope.$index] === undefined || fp[scope.$index].top === undefined ? '0' : fp[scope.$index].top) + 'px', position:'fixed', minWidth: '300px' }" class="contextmenu">
                    <li  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex">
                      <span class="font-semibold">
                        {{ file.fileName ? file.fileName : file.name }} 
                      </span>
                    </li>
                    <div style="clear:both"></div>
                  </ul> -->
                  <div class="filearea">
                    <div class="font-semibold"  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)">
                      {{ file.fileName ? file.fileName : file.name }} 
                    </div>
                  </div>
                  
                  <!-- <div v-if="scope.row.files.length < 3 || fileListOpen.includes(scope.row.serviceFileLimitId) > 0" class="flex">
                    <span v-if="fileListOpen.includes(scope.row.serviceFileLimitId) > 0 && scope.row.files.length > 0" @click="isFileListClose(scope.row.serviceFileLimitId)">
                      <close class="el-icon-close" style="width: 1em; height: 1em;vertical-align: middle; float: right; cursor: pointer;" />
                    </span>
                    <div v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex">
                      <span class="font-semibold">
                        {{ file.fileName !== undefined ? file.fileName : file.name }}
                      </span>
                    </div>
                  </div> -->
                  
                </template>
              </el-table-column>
              <el-table-column prop="fileCount" label="ファイル数" width="320" >
                <template #default="scope">
                    {{  scope.row.files.length }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <br v-if="masterLimitFileTableData.length > 0" />
      <el-row style="justify-content: center!important" v-if="masterLimitFileTableData.length > 0">
        <el-col :span="24" :offset="1">
          <!-- 添付ファイル部分 -->
          <div>
            <span>マスターデータファイル：</span>
            <br />
            <el-table 
               :data="masterLimitFileTableData" 
              style="width: 100%"  :border="true">
              <el-table-column align="right" prop="id" label="項目番号" width="100" >
                <template #default="scope" >
                  {{ (scope.$index + 1)  }}
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="ファイル種別" width="320" />
              <el-table-column prop="files" label="ファイル名	" width="320">
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
                  <ul v-show="fileListOpen.includes(scope.row.serviceFileLimitId) > 0"  :style="{ left: (fp[scope.$index] === undefined || fp[scope.$index].left === undefined ? '0' : fp[scope.$index].left ) + 'px', top: (fp[scope.$index] === undefined || fp[scope.$index].top === undefined ? '0' : fp[scope.$index].top) + 'px', position:'fixed', minWidth: '300px' }" class="contextmenu">
                    <li  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex">
                      <span class="font-semibold">
                        {{ file.fileName ? file.fileName : file.name }} 
                      </span>
                    </li>
                    <div style="clear:both"></div>
                  </ul> -->
                  <div class="filearea">
                    <div class="font-semibold"  v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)">
                      {{ file.fileName ? file.fileName : file.name }} 
                    </div>
                  </div>
                  
                  <!-- <div v-if="scope.row.files.length < 3 || fileListOpen.includes(scope.row.serviceFileLimitId) > 0" class="flex">
                    <span v-if="fileListOpen.includes(scope.row.serviceFileLimitId) > 0 && scope.row.files.length > 0" @click="isFileListClose(scope.row.serviceFileLimitId)">
                      <close class="el-icon-close" style="width: 1em; height: 1em;vertical-align: middle; float: right; cursor: pointer;" />
                    </span>
                    <div v-for="(file, index) of scope.row.files" :key="file.fileName ? (file.fileName + file.fileType + file.fileSize): (file.name + file.type + file.size)" class="flex">
                      <span class="font-semibold">
                        {{ file.fileName !== undefined ? file.fileName : file.name }}
                      </span>
                    </div>
                  </div> -->
                  
                </template>
              </el-table-column>
              <el-table-column prop="fileCount" label="ファイル数" width="320" >
                <template #default="scope">
                    {{ scope.row.files !== undefined ? scope.row.files.length : 0 }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <el-row class="button_row" style="display: flex; justify-content: center!important" v-if="props.playViewData === undefined">

        <el-col :span="24" style="width:100%;display:contents">
          <el-button  class="buttonShadow" v-bind:disabled="sendfile" type="primary" size="large" plain @click="goBack()">戻る</el-button>
          <el-button class="buttonShadow" v-if="!disabled" :loading="sendfile" type="primary" size="large" plain @click="confirm()">リクエスト</el-button>
        </el-col>
      </el-row>
    </div>
  </cardShadow>
  <final :applicationId="applicationId" v-if="isFinal" :createdTime="createdTime" :ocrPlan="ocrPlan"/>
</template>

<script setup>
import { ElMessage } from 'element-plus'

import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import cardShadow from "@/components/Customized/cardShadow";
import { getServieInfo } from "@/api/system/service/info";
import { saveInfo, getInfoData } from '@/api/system/application/info';
import { Slide } from 'vue3-burger-menu' 
import final from './final.vue';

let urlParams = new URLSearchParams(window.location.search);
const props = defineProps(['limitFileTableData', 'limitRollFileTableData', 'playViewData', 'chkServiceFileLimitList2', 'action', 'startStep', 'step2', 'updatedTime', 'masterLimitFileTableData']);
const emit = defineEmits(['goto3']);
const step2 = ref(props.step2 === undefined ? true : props.step2);


let localStorageData = JSON.parse(localStorage.getItem('applicantData'));
const serviceId = parseInt(urlParams.get("serviceId"));
const sendfile = ref(false);
const callback = ref(props.startStep < 3 ? true : false);

const applicationId = ref(urlParams.get("applicationId") === null ? null : parseInt(urlParams.get("applicationId")));
if (
  (isNaN(applicationId.value) || applicationId.value === null ) && 
  localStorageData.data.applicationId !== undefined && 
  localStorageData.data.applicationId !== null
) {
  applicationId.value = localStorageData.data.applicationId;
}
const servieName = props.playViewData !== undefined ? props.playViewData.chkService.serviceName : localStorageData.serviceName;
const data = ref(props.playViewData !== undefined ? null : localStorageData.data);
const isFinal = ref(false);
const fileListOpen = ref([]);
const fp = ref([]);
const menuOpen = ref(false);
const createdTime = ref(null);
const allowSetTilte = ref(null);
const disabled = props.playViewData !== undefined ? true : props.action !== undefined && props.action === false ? true : false;
const masterLimitFileTableData = ref(props.masterLimitFileTableData !== undefined ? [...props.masterLimitFileTableData] : props.playViewData !== undefined && props.playViewData.chkServiceMasterFileLimitList !== undefined? props.playViewData.chkServiceMasterFileLimitList : localStorageData !== null && localStorageData.data.masterLimitFileTableData !== undefined ? [...localStorageData.data.masterLimitFileTableData] : []);

const ocrPlan = ref(undefined);

const startStep = ref(props.startStep);

watch(() => props.startStep, () => {
  startStep.value = props.startStep;
  // console.log(props.startStep);
  // debugger
})

const applicantData = ref(
  props.playViewData !== undefined ?
  {
    serviceName: props.playViewData.chkService.serviceName,
    data: {
      chkServiceInfos: props.playViewData.chkServiceInfoList,
      chkServiceConditions: props.playViewData.chkServiceConditionList,
      limitFileTableData: [],
      masterLimitFileTableData: props.playViewData === undefined || props.playViewData.chkServiceMasterFileLimitList === undefined ? [] : props.playViewData.chkServiceMasterFileLimitList
    },
    expireTime: 0
  } : localStorageData);
applicantData.value.data = {
  ...applicantData.value.data,
  createDate: ''
}
const router = useRouter()

const reactiveTableData = ref(props.limitRollFileTableData !== undefined ? props.limitRollFileTableData : []);
const reactiveTableData2 = ref(props.limitFileTableData !== undefined ? props.limitFileTableData : []);



Promise.all(reactiveTableData.value.map((item) => {
  fp.value.push({
    top: 0,
    left: 0
  })
})).then(() => {
  reactiveTableData2.value.map((item) => {
    fp.value.push({
      top: 0,
      left: 0
    })
  })
})


const theadSpan = ({ row, column, rowIndex, columnIndex }) => {
    setTimeout(() => {
      var x = document.querySelector('.colSpan');
      var x1 = document.querySelector('.hideTh');
      var x2 = document.querySelector('.cell');
      x.colSpan = 3;
      x2.style.textAlign = "center";
      x1.style.display = 'none';
    }, 500);
    if (rowIndex === 0) {
      if (columnIndex === 0) {
        return 'colSpan'
      }
      if (columnIndex > 0 ) {
        return 'hideTh'
      }
    }
    
}


const changeData = () => {
  reactiveTableData2.value = [];
  reactiveTableData.value = [];
  let files = props.chkServiceFileLimitList2 !== undefined && props.chkServiceFileLimitList2.length > 0 ? props.chkServiceFileLimitList2 : props.playViewData !== undefined ? props.playViewData.chkServiceFileLimitList : [];
  if (files.length > 0) {
    files.forEach( (element,index) => {
        if (element.allowSet == 0) {
          allowSetTilte.value = element.filelimitName;
          reactiveTableData.value = [
            {
              serviceFileLimitId: null,
              fileName: element.fileName,
              description: element.description,
              fileCount: null,
              isOcrSystem: element.isOcrSystem,
              checkSystem: element.checkSystem,
              files: element.files ? element.files : [],
              allowSet: 0,  // 名簿, 0YES, 1NO
              fileType: null,
              samplePicture: '',
              samplePictureShow: false,
            }
          ]
          
        } else {
          const tableItem = {
            serviceFileLimitId: element.id,
            fileName:element.fileName,
            description:element.description,
            fileCount:element.fileCount,
            isOcrSystem: element.isOcrSystem,
            checkSystem: element.checkSystem,
            files: element.files ? element.files : [],
            allowSet: 1,  // 名簿, 0YES, 1NO
            fileType: element.fileType,
            samplePicture: element.samplePicture !== '' ? "/dev-api"+element.samplePicture : '',
            samplePictureShow: false,
          }
          
          reactiveTableData2.value = [...reactiveTableData2.value, tableItem];
      
        }

      });
  }
}
if (props.playViewData != undefined) {
  changeData();
}
watch(() => props.playViewData, () => {
 changeData();
})

watch(() => props.chkServiceFileLimitList2, () => {
  // console.log("props.chkServiceFileLimitList2 ", props.chkServiceFileLimitList2)
 changeData();
})




const goBack = () =>{
  emit('goto3', 'back');
}

const confirm = () =>{
    // TODO 提出のAPIを呼び出し?
    // 完了画面へ遷移
  getServieInfo(serviceId).then(async (response) => {
    if (response.code == 200 && response.data.updatedTime === props.updatedTime) {
      const fileTableData = props.limitFileTableData;
      const rollFileTableData = props.limitRollFileTableData;
      const storageData = { 
        ...localStorageData.data,
        limitFileTableData: fileTableData,
        limitRollFileTableData: rollFileTableData,
        masterLimitFileTableData: masterLimitFileTableData.value
      };
      let applicationInfos = [];
      let conditionInfos = [];
      let applicationInfoFiles = [];
      let applicationInfoMasterFiles = [];
      console.log(storageData);
      Promise.all( storageData.chkServiceConditions.map((item) => {
        let data = {
          id: item.id,
          createdTime: item.createdTime,
          createdBy: item.createdBy,
          applicationId: item.applicationId,
          serviceConditionId: item.serviceConditionId,
          value: item.value
        }
        conditionInfos.push(data);
      })).then(() => {
          Promise.all(storageData.limitFileTableData.map((item) => {
            applicationInfoFiles.push({
              allowSet: item.allowSet,
              applicationId: item.applicationId,
              createBy: item.createBy,
              createTime: item.createTime,
              description: item.description,
              fileCount: item.fileCount,
              fileName: item.fileName,
              files: item.files,
              remark: item.remark,
              serviceFileLimitId: item.serviceFileLimitId,
              updateBy: item.updateBy,
              updateTime: item.updateTime
            });
          }))
      }).then(() => {
        Promise.all(storageData.limitRollFileTableData.map((item, index) => {
            let data = item;
            delete data.isOcrSystem;
            delete data.checkSystem;
            delete data.fileType;
            delete data.samplePicture;
            delete data.samplePictureShow;
            applicationInfoFiles.push(data);
        }))   
      }).then(() => {
        Promise.all(storageData.masterLimitFileTableData.map((item) => {
            applicationInfoMasterFiles.push({
              applicationId: item.applicationId,
              createTime: item.createTime,
              description: item.description,
              fileCount: item.fileCount,
              fileName: item.fileName,
              files: item.files,
              serviceMasterFileLimitId: item.id,
            });
          }))
      }).then(async() =>{
        let error = false;
        let errorRequiredMsg = "必要項目入力してください。";
        let errorRequiredCheckMsg = "必要項目選択してください。"
        let errorMsg = "";
        await applicantData.value.data.chkServiceInfos.map((item, index) => {
          switch(item.itemType) {
            case 1:
            case 2:
              if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
                error = true;
                errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
              } else if (item.itemIsCompulsory === "1" && item.value.length > 100) {
                error = true;
                errorMsg += "100文字以内で入力してください。| " + item.itemName + " \n";
              }
              break;
            case 3:
              const regex = /^[a-z\d][\w.-]*@[\w.-]+\.[a-z\d]+$/i;
              if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
                error = true;
                errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
              } else if (item.itemIsCompulsory === "1" && !regex.test(item.value.trim())) {
                error = true;
                errorMsg += "メールアドレスを正しく入力してください。| " + item.itemName + " \n";
              }
              break;
            case 4:
            　if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
                error = true;
                errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
              }else if (item.itemIsCompulsory === "1" && isNaN(new Date(item.value).getDate())) {
                error = true;
                errorMsg += "日付を正しく入力してください。| " + item.itemName + " \n";
              }
              break;
            case 5:
              const regex2 = /[^0-9]/g;
              if (item.itemIsCompulsory === "1" && item.value.trim() === "") {
                error = true;
                errorMsg += errorRequiredMsg + "| " + item.itemName + " \n";
              }else if (item.itemIsCompulsory === "1" && regex2.test(item.value.trim())) {
                error = true;
                errorMsg += "半角数字入力してください。| " + item.itemName + " \n";
              }
              break;
            case 6:
              // console.log(item.value)
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
          
          const haveFileApplicationInfoFiles = applicationInfoFiles.filter(item => {
            return item.files.length > 0
          }).map(item => {

            let resultItem = {
              ...item
            }
            let files = resultItem.files.map(fileItem => {
                    return { 
                        ...fileItem,
                        fileName: fileItem.name !== undefined ? 
                                  fileItem.name : 
                                      fileItem.fileName !== undefined ? 
                                      fileItem.fileName : undefined,
                      }
                  })
            resultItem.files = files
            return resultItem
          })
          const haveFileApplicationInfoMasterFiles = applicationInfoMasterFiles.filter(item => {
              return item.files !== undefined && item.files != null && item.files.length > 0
            }).map(item => {

              let resultItem = {
                ...item
              }
              let files = resultItem.files.map(fileItem => {
                return { 
                    ...fileItem,
                    fileName: fileItem.name !== undefined ? 
                                fileItem.name : 
                                   fileItem.fileName !== undefined ? 
                                   fileItem.fileName : undefined,
                  }
              })
              resultItem.files = files
              return resultItem
            })
          Promise.all(localStorageData.data.chkServiceInfos.map((item) => {
              let data = {
                applicationId: item.applicationId,
                itemName: item.itemName,
                itemType: item.itemType,
                serviceInfoId: item.serviceInfoId,
                value: item.value,
                createdTime: item.createdTime
              };
              //delete data.itemIsCompulsory;
              applicationInfos.push(data);
          })).then(() => {
            let data = {
              applicationId: applicationId.value,
              serviceId: serviceId,
              status: "1",
              applicationInfo: applicationInfos,
              applicationInfoFiles: haveFileApplicationInfoFiles,
              applicationInfoMasterFiles: haveFileApplicationInfoMasterFiles,
              conditionInfo: conditionInfos
              
            };
            let form = new FormData();
            form.append('data', JSON.stringify(data));
            for(var index in applicationInfoFiles) {
              for (var index2 in applicationInfoFiles[index].files) {
                if (applicationInfoFiles[index].files[index2].webkitRelativePath !== undefined) {
                  form.append("file[]", applicationInfoFiles[index].files[index2]);
                }
              }
            }
            for(var index in applicationInfoMasterFiles) {
              for (var index2 in applicationInfoMasterFiles[index].files) {
                if (applicationInfoMasterFiles[index].files[index2].webkitRelativePath !== undefined) {
                  form.append("masterFile[]", applicationInfoMasterFiles[index].files[index2]);
                }
              }
            }
            sendfile.value = true;
            saveInfo(form).then((response) => {
              if (response.code === 200) {
                //proxy.$modal.msgSuccess("提出しました");
                createdTime.value = response.data.createdTime;
                ocrPlan.value = response.data.ocrPlan;
                isFinal.value = true;
                
              }
            }).catch(() => {
              sendfile.value = false;
            })
          })
            
        }
      })
    } else if (response.data.updatedTime !== props.updatedTime) {
      ElMessage({ message:"該当業務は既に変更されています。再度リクエストを申請してください。",  type: 'error'});
    }
  });
}

if (localStorageData === undefined) {
    getServieInfo(serviceId).then((response) => {
      if (response.code == 200) {
          data.value = response.data;
      }
    })
} else if (localStorageData !== undefined) {
    data.value = localStorageData;
} else if (props.playViewData !== undefined) {
  applicantData.value.serviceName = props.playViewData.chkService.serviceName;
  applicantData.value.data.chkServiceInfos = props.playViewData.chkServiceInfoList;
  applicantData.value.data.chkServiceConditions = props.playViewData.chkServiceConditionList;
}

function isFileListOpen(e, index,  id) {
	fileListOpen.value = [...fileListOpen.value, id];
  fp.value[index].top = e.target.getBoundingClientRect().top;
  fp.value[index].left =  e.target.getBoundingClientRect().left;
  document.body.removeEventListener('click', closeMenu);
  setTimeout(() => {
		document.body.addEventListener('click', closeMenu);
	}, 100)
}
function closeMenu() {
	fileListOpen.value = [];
	document.body.removeEventListener('click', closeMenu);
}

function isFileListClose(id) {
  const newArray = fileListOpen.value.filter(item => {
    return item !== id;
  })
  fileListOpen.value = newArray;
}

</script>

<style scoped>
.info > * {
  margin-top: 20px;
}
.button_row {
  margin-top: 25px;
}
.must-tip {
  margin-right: 2px;
  color: red;
}
.el-table .el-table__cell {
  z-index: unset!important;
}

</style>
<style>
.content3 {
  justify-content: center;
  
}
.content3 .label {
  
  width: 80%;
  justify-content: center;
}
.content3 .el-form {
  width: 100%;
}

.content3 .label > .el-form-item__label {
  min-width: 42%;
  font-size: 20px!important;
}
.content3.label .el-form-item__label {
 
  min-width: 44%;
  justify-content: end !important
}
.content3  .el-form-item__label {
  min-width: 44%;
  
  justify-content: left;
}
.content3 > .el-col-offset-1 {
  display: flex;
  justify-content: center;
  margin-left: unset;
}
.content3 .el-table tr {
   background-color: unset;
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

.content3 .el-col-24 {
  flex: unset;
}

.content3 .el-scrollbar {
  z-index: 60000;
}

.filearea {
  max-height: 300px;
  overflow-y: auto;
}

</style>