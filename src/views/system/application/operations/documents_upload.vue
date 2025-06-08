
<template>
  <span class="newApplication">
    <cardShadow v-if="step == 3" >
      <div class="content ">
        <!-- <div>
          <el-row style="margin-top: 5%; justify-content: center!important">
            <el-col :span="12" class="text-center">
              <h3>{{serviceName}}＿新規アップロード </h3>
            </el-col>
          </el-row>
        </div> -->
       
        <div style="margin: 3%; " v-if="callback || masterLimitFileTableData.length > 0">
          <el-steps
            style="width: 100%;"
            :space="200"
            :active="(startStep === 1 && !step2) || startStep === 2 ? 1 : startStep === 3 && masterLimitFileTableData.length > 0 ? 0 : 2"
            finish-status="success"
            align-center="true"
          >
            <el-step  v-if="startStep < 2" />
            <el-step  v-if="step2" />
            <el-step  />
            <el-step  v-if="masterLimitFileTableData.length > 0"/>
          </el-steps>
        </div>
        <div>
          <el-row style="margin-top: 5%; justify-content: center!important">
            <el-col :span="12" class="text-center">
              <h3>添付書類</h3>
            </el-col>
          </el-row>
        </div> 

        <el-row class="document_upload_thead" style="justify-content: center!important">
          <el-col :span="24" :offset="1">
            <!-- table -->
            <el-table v-loading="loading" class="uploadTable" :data="limitFileTableData" style="width: 100%; max-width: 1300px" :border="true" ref="tableRef">
              <el-table-column align="right" prop="serviceFileLimitId" label="項目番号" width="100" justify="right" >
                <template #default="scope" >
                    {{ (scope.$index + 1)  }}
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="ファイル名" width="320" >
                <template #default="scope">
                  <div class="isRequest">
                    <span v-if="scope.row.isEnforceOcr == 1" class="radius-left">
                      データ化必須
                    </span>
                    <span v-if="scope.row.checkSystem == 0" class="radius-right">
                      審査必須
                    </span>
                    <span v-if="scope.row.fileRequired == true" class="radius-left">
                      ファイル必須
                    </span>
                  </div>
                  <div class="isRequest">{{ scope.row.fileName }}</div>
                  <div class="isRequest" >
                    <Button :disabled="samplePictureView === false || scope.row.samplePicture == undefined || scope.row.samplePicture == null || scope.row.samplePicture.trim() == '' "
                     v-if="!scope.row.samplePictureShow"
                      @click="photo(scope.$index)">サンプル{{　scope.row.samplePicture !== undefined && scope.row.samplePicture!== null && scope.row.samplePicture.trim()!== '' ? 'を見る':'なし'  }}</Button>
                    <div v-if="scope.row.samplePictureShow === true">
                      <span @click="photo(scope.$index)">
                        <close class="el-icon-close" style="width: 1em; height: 1em;vertical-align: middle; float: right; cursor: pointer;" />
                      </span>
                      <el-image 
                         v-if="scope.row.samplePictureUrl != undefined && scope.row.samplePictureShow === true && scope.row.samplePictureUrl.indexOf('application/') <= -1" 
                         v-bind:src="scope.row.samplePictureUrl" style="width: 50%; cursor: pointer" @click="showImage(scope.$index)"/>
                      <el-text v-if=" scope.row.samplePicture.indexOf('application/') > 0" @click="viewFile(scope.$index)"> {{ sampleFileName }} </el-text>
                    </div>
                  </div> 
                </template>
              </el-table-column>
              <el-table-column prop="description" label="説明	" width="320" />
              <el-table-column prop="uploadAction" label="アップロード" min-width="320" class-name="uploadAction" >
                <template #default="scope">
                  <fileDragAndDropUpload 
                    :allowSet="1"
                    :multiple="scope.row.multi ==0 ? true : false" 
                    :applicationCreate="true"
                    :disabled="disabled"
                    :id="scope.row.serviceFileLimitId ? scope.row.serviceFileLimitId : scope.row.no" 
                    :files="scope.row.files ? scope.row.files : scope.row.sfiles"
                    :fileSize="scope.row.fileSize"
                    :fileLimits="scope.row.fileCount"
                    :fileType="scope.row.fileType"
                    @change="change"
                  />
                </template>
                
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <el-row style="justify-content: center!important" v-if="props.playViewData === undefined">
          <el-col :span="24" :offset="1">
            <el-row class="button_row">
              <el-col :span="8" :offset="8">
                <el-button class="buttonShadow" v-bind:disabled="sendfile || loading" type="primary"  size="large" plain @click="goBack()">戻る</el-button>
                <el-button class="buttonShadow"  v-bind:disabled="sendfile || loading || fileUploadError.length > 0 " type="primary" size="large" plain  @click="goToNext()">次へ</el-button>
                <el-button class="buttonShadow" v-if="!disabled" :loading="sendfile" type="primary" size="large" plain v-bind:disabled="loading || (limitFileTableData.length <= 0 && limitRollFileTableData.length <= 0) ||fileUploadError.length > 0" @click="saveTemp()">一時保存</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </cardShadow>
    <info_edit v-if="step === 2" :chkServiceInfos="localStorageData.data.chkServiceInfos" @goto="goto"/>
  </span>
  <documents_master_upload :step="step" :totalFileMaxSize="totalFileMaxSize" :fileTotalSize="fileTotalSize" :applicationId="applicationId" :updatedTime="updatedTime" :serviceName="serviceName" :step2="step2" :startStep="startStep" :action="action" v-if="masterLimitFileTableData.length >0 && step === 4" @goto3="goto3" :limitFileTableData="limitFileTableData" :limitRollFileTableData="limitRollFileTableData" />
  <documents_confirm  :updatedTime="updatedTime" :serviceName="serviceName" :step2="step2" :startStep="startStep" :action="action" v-if="masterLimitFileTableData.length <= 0 && step === 4" @goto3="goto3" :limitFileTableData="limitFileTableData" :limitRollFileTableData="limitRollFileTableData" />

  <vue-modal :open="isOpen">
    <img :src="img" style="width: 50em" />
  </vue-modal>

</template>

<script setup>
import { reactive , onMounted } from "vue";
import { listLimit } from '@/api/system/service/limit'
import info_edit from './info_edit.vue';

//addApplication
import { getSampleFile } from '@/api/system/application/file';
import { saveInfo, getInfoData } from '@/api/system/application/info';
import { useRouter } from "vue-router";
import cardShadow from "@/components/Customized/cardShadow";
import documents_master_upload from './documents_master_upload.vue';
import documents_confirm from './documents_confirm.vue';
import { ElMessage } from 'element-plus';
import { getServieInfo } from "@/api/system/service/info";


const emit = defineEmits(['goto2', 'uploadFile']);
const props =defineProps(['serviceName', 'playViewData', 'action', 'step2', 'startStep', 'updatedTime', 'signleSize','totalMaxSize', 'limitFileTableData','masterLimitFileTableData'])
const step2 = ref(props.step2 === undefined ? true : props.step2);
const startStep = ref(props.startStep);

const callback = ref(props.startStep < 3 ? true : false);
watch(() => props.closePage, () => {
 
    startStep.value = props.startStep;
    callback.value = props.startStep < 2 ? true : false;


})
const step = ref(3);
const isOpen = ref(false);
const img = ref(null);
const fileUploadError = ref([]);
const allowSetTilte = ref(null);
const { proxy } = getCurrentInstance();
const selectFilesIds = ref([]);
const selectFiles = ref([]);
const allowSetFiles = ref([]);
const total = ref(0);
const sendfile = ref(false);
const updatedTime = ref(props.updatedTime);
const menuBar = ref(false);
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10
  },
});
const action = ref(props.action);

const { queryParams } = toRefs(data);
const selectRollId = ref(null);
const isPicture = ref(false);

let urlParams = new URLSearchParams(window.location.search);


const router = useRouter();
let localStorageData = JSON.parse(localStorage.getItem('applicantData'));

// TODO パラメータから取得
const applicationId = ref(urlParams.get("applicationId") === null ? null : parseInt(urlParams.get("applicationId")));
const serviceId = parseInt(urlParams.get("serviceId"));
const serviceName = props.playViewData !== undefined ? props.playViewData.chkService.serviceName : (props.serviceName || urlParams.get("serviceName"))

const limitRollFileTableData  = ref(localStorageData !== null && localStorageData.data.limitRollFileTableData !== undefined ? [...localStorageData.data.limitRollFileTableData] : []);

const limitFileTableData  = ref(localStorageData !== null ? [...localStorageData.data.limitFileTableData] : props.limitFileTableData !== undefined && props.limitFileTableData !== null  ? props.limitFileTableData : []);

const masterLimitFileTableData = ref(props.masterLimitFileTableData !== undefined && props.masterLimitFileTableData !== null ? props.masterLimitFileTableData : localStorageData !== null && localStorageData.data.masterLimitFileTableData !== undefined ? [...localStorageData.data.masterLimitFileTableData] : props.masterLimitFileTableData !== undefined ? [...props.masterLimitFileTableData] : []);
const disabled = props.playViewData !== undefined ? true : props.action !== undefined && props.action === false ? true : false;

const samplePictureView = props.playViewData !== undefined ? false : true;

const sampleFileName = ref(null);
const fileNameCheck = ref(false);
const fileTotalSizeCheck = ref(false);
const totalFileMaxSize = props.totalMaxSize; //500MB
const fileTotalSize = ref(0);
const signleSize = ref(props.signleSize)
const changeTable = ref(true);
const loading = ref(false);
const masterLimitFileRes = ref([]);

onMounted( async ()=>{
  
  if (
    applicationId.value !== undefined && applicationId.value != null &&
    localStorageData.data.limitFileTableData.length === 0
  ) {
    
    let applicationInfoFiles = [];
    let rollFileTableData = [];

    let applicationMasterInfoFiles = [];

    await getInfoData(applicationId.value).then(async (response) => {
      await response.data.applicationInfoFiles.forEach((item) => {
          if (item.allowSet === 1) {
            // 名簿
            rollFileTableData.push(item);
          } else {
            applicationInfoFiles.push(item);
          } 
        })
      if (localStorageData === null || localStorageData === undefined) {
        
        localStorageData = {
          serviceName: serviceName,
          data: {
            chkServiceInfos: response.data.applicationInfo,
            chkServiceConditions: response.data.conditionInfo,
            limitFileTableData: applicationInfoFiles,
            limitRollFileTableData: rollFileTableData,
            masterLimitFileTableData: response.data.applicationMasterInfoFiles === undefined ? [] : response.data.applicationMasterInfoFiles

          },
          expireTime: 0
        };

      }else { 
        //localStorageData.data.chkServiceInfos = response.data.applicationInfo;
        //localStorageData.data.chkServiceConditions = response.data.conditionInfo;
        localStorageData.data.limitFileTableData = applicationInfoFiles;
        localStorageData.data.limitRollFileTableData = rollFileTableData;
      }
      limitFileTableData.value = [...applicationInfoFiles];
      limitRollFileTableData.value = [...rollFileTableData];
    })
  } else if (
    props.playViewData === undefined &&
    localStorageData.data.limitFileTableData.length === 0
  ) {
  
    const  limitFileRes = await listLimit({serviceId:serviceId}) 
    if(limitFileRes.total){
      limitFileRes.rows.forEach( (element,index) => {

        if (element.allowSet == 0) {
          allowSetTilte.value = element.fileName;
          limitRollFileTableData.value = [
            {
              serviceFileLimitId: null,
              fileName: element.fileName,
              description: element.description,
              fileCount: null,
              isOcrSystem: element.isOcrSystem,
              checkSystem: element.checkSystem,
              multi: element.multi,
              files: [],
              allowSet: 0,  // 名簿, 0YES, 1NO
              fileType: null,
              fileSize: element.fileSize,
              samplePicture: element.samplePicture !== '' ? "/dev-api"+element.samplePicture : '',
              samplePictureUrl: null,
              samplePictureShow: false,
              fileRequired: element.fileRequired === 1 ? true : false
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
            files: [],
            multi: element.multi,
            allowSet: 1,  // 名簿, 0YES, 1NO
            fileType: element.fileType,
            fileSize: element.fileSize,
            samplePicture: element.samplePicture !== '' ? "/dev-api"+element.samplePicture : '',
            samplePictureUrl: null,
            samplePictureShow: false,
            fileRequired: element.fileRequired === 1 ? true : false
          }
          limitFileTableData.value = [...limitFileTableData.value, tableItem];
        }

      });
    } else {

      limitFileRes.rows.forEach( (element,index) => {
        if (element.allowSet == 0) {
          allowSetTilte.value = element.fileName;
          limitRollFileTableData.value = [
            {
              serviceFileLimitId: null,
              fileName: element.fileName,
              description: element.description,
              fileCount: null,
              isOcrSystem: element.isOcrSystem,
              checkSystem: element.checkSystem,
              files: [],
              allowSet: 0,  // 名簿, 0YES, 1NO
              fileType: null,
              fileSize: element.fileSize,
              samplePicture: '',
              samplePictureUrl: null,
              samplePictureShow: false,
              fileRequired: element.fileRequired === 1 ? true : false
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
            fileSize: element.fileSize,
            files: [],
            allowSet: 1,  // 名簿, 0YES, 1NO
            fileType: element.fileType,
            samplePicture: element.samplePicture !== '' ? "/dev-api"+element.samplePicture : '',
            samplePictureUrl: null,
            samplePictureShow: false,
            fileRequired: element.fileRequired === 1 ? true : false
          }
          limitFileTableData.value = [...limitFileTableData.value, tableItem];
        }

      });

    }
  } else {
    changeData();
  }
  // nextTick(function() {
  //   var x = document.querySelector('.colSpan');
  //   var x1 = document.querySelector('.hideTh');
  //   var x2 = document.querySelector('.cell');
  //   x.colSpan = 3;
  //   x2.style.textAlign = "center";
  //   x1.style.display = 'none';
  // });

});
watch(()=> props.startStep, () => {
  callback.value = props.startStep < 3 ? true : false;
})

const changeData = () => {
  limitFileTableData.value = [];
  limitRollFileTableData.value = [];
  
  if (props.playViewData !== undefined) {
   
    props.playViewData.chkServiceFileLimitList.forEach( (element,index) => {
        if (element.allowSet === true) {
          allowSetTilte.value = element.filelimitName;
          limitRollFileTableData.value = [
            {
              index: index,
              serviceFileLimitId: null,
              fileName: element.fileName,
              description: element.description, 
              fileCount: null,
              isOcrSystem: element.isOcrSystem,
              checkSystem: element.checkSystem,
              files: [],
              allowSet: 0,  // 名簿, 0YES, 1NO
              fileType: null,
              samplePicture: '',
              samplePictureUrl: null,
              samplePictureShow: false,
              fileRequired: element.fileRequired === 1 ? true : false
            }
          ]
        } else {
          const tableItem = {
            index: index,
            serviceFileLimitId: element.id,
            fileName:element.fileName,
            description:element.description, 
            fileCount:element.fileCount,
            isOcrSystem: element.isOcrSystem,
            checkSystem: element.checkSystem,
            files: [],
            allowSet: 1,  // 名簿, 0YES, 1NO
            fileType: element.fileType,
            samplePicture: element.samplePicture !== '' ? "/dev-api"+element.samplePicture : '',
            samplePictureUrl: null,
            samplePictureShow: false,
            fileRequired: element.fileRequired === 1 ? true : false
          }
          limitFileTableData.value = [...limitFileTableData.value, tableItem];
        }

    });
    masterLimitFileTableData.value = props.playViewData.chkServiceMasterFileLimitList;
    var x = document.querySelector('.colSpan');
    if (x!==undefined && x!== null ) {
      x.style.textAlign = "center";
    }
  }
}

watch(() => props.playViewData, () => {
  changeData();
});  



const goBack = () =>{
  getServieInfo(serviceId).then(async (response) => {
    if (response.code == 200 && response.data.updatedTime === props.updatedTime) {
      if (callback.value === false) {
        router.back()
      } else {
        if(props.serviceName){
      
          emit('goto2', JSON.stringify(localStorageData));
        }else{
          goto3('back');
        }
      } 
    } else if (response.code == 200 && response.data.updatedTime !== props.updatedTime) {
      ElMessage({ message:"該当業務は既に変更されています。再度リクエストを申請してください。",  type: 'error'});
    } 
  });
}
function goto3(goto) {

  switch(goto) {
    case 'next':
      step.value +=1 ;
  
    break;
    default:
      step.value -= 1;
    break;
  }
}
const goToNext = async () =>{
  checkFileName().then(() => {
    if (!fileNameCheck.value) {
      ElMessage.warning("同じ名前のファイルがアップロードされています。ファイル名を変更して再試行してください。")
    } else if (!fileTotalSizeCheck.value) {
      ElMessage.warning("アップロードされたファイルサイズが許可されている制限を超えているので、保存できません。")
    } else {
      getServieInfo(serviceId).then(async (response) => {
        
        if (response.code == 200 && response.data.updatedTime === props.updatedTime) {
          const fileTableData = limitFileTableData.value;
          const rollFileTableData = limitRollFileTableData.value;
          let error = false;
          let errorMsg = "";
          const storageData = { 
            ...localStorageData.data,
            limitFileTableData: limitFileTableData.value,
            limitRollFileTableData: limitRollFileTableData.value
          };
          let errorRequiredCheckMsg = "のファイルを添付してください。"
          Promise.all(storageData.limitFileTableData.map((item) => {
            item.samplePictureShow = false;
            delete item.samplePictureUrl;
            if (
              (
                item.fileRequired !== undefined &&
                (item.fileRequired === true || item.fileRequired === 1)
              ) &&
              item.files.length <= 0
            ) {
              error = true;
              //errorMsg += errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
              ElMessage.warning(item.fileName + errorRequiredCheckMsg);
            }
          })).then(() =>{
            Promise.all(storageData.limitRollFileTableData.map((item, index) => {
              if (
                  (
                    item.fileRequired !== undefined &&
                    (item.fileRequired === true || item.fileRequired === 1)
                  ) &&
                  item.files.length <= 0
                ) {
                  error = true;
                  // errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
                  ElMessage.warning(item.fileName + errorRequiredCheckMsg);
                }
            }))
          }).then(async () => {
            if (error) {
              //ElMessage.warning('<p>'+errorMsg+'</p>');
              return false;
            }else {
              
              
              localStorageData.data.applicationId = applicationId.value;
              localStorageData.data.limitFileTableData = limitFileTableData.value;
              localStorageData.data.limitRollFileTableData = limitRollFileTableData.value;
              
          
              localStorage.setItem("applicantData", JSON.stringify(localStorageData));
              goto3('next');
            }
          })
        } else if (response.code == 200 && response.data.updatedTime !== props.updatedTime) {
          ElMessage({ message:"該当業務は既に変更されています。再度リクエストを申請してください。",  type: 'error'});
        }
      });
    }
  })
  
  
}
const  saveTemp = async ()=>{
  checkFileName().then(() => {
    if (!fileNameCheck.value) {
      ElMessage.warning("同じ名前のファイルがアップロードされています。ファイル名を変更して再試行してください。")
    } else if (!fileTotalSizeCheck.value) {
      ElMessage.warning("アップロードされたファイルサイズが許可されている制限を超えているので、保存できません。")
    } else  {
      getServieInfo(serviceId).then(async (response) => {
        if (response.code == 200 && response.data.updatedTime === props.updatedTime) {
          let error = false;
          let errorMsg = "";
          sendfile.value = true;

          let applicationInfos = [];
          let conditionInfos = [];
          let applicationInfoFiles = [];
          const fileTableData = limitFileTableData.value;
          const rollFileTableData = limitRollFileTableData.value;
          const storageData = { 
            ...localStorageData.data,
            limitFileTableData: limitFileTableData.value,
            limitRollFileTableData: limitRollFileTableData.value
          };
          //console.log(storageData);
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
            let errorRequiredCheckMsg = "のファイルを添付してください。"
            Promise.all(storageData.limitFileTableData.map((item) => {
                // delete data.isOcrSystem;
                // delete data.checkSystem;
                // delete data.fileType;
                // delete data.samplePicture;
                // delete data.samplePictureShow;
                if (
                  (
                    item.fileRequired !== undefined &&
                    (item.fileRequired === true || item.fileRequired === 1)
                  ) &&
                  item.files.length <= 0
                ) {
                  error = true;
                  // errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
                  ElMessage.warning(item.fileName + errorRequiredCheckMsg);
                }
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
          }).then(() =>{
            //console.log(applicationInfoFiles);
            Promise.all(storageData.limitRollFileTableData.map((item, index) => {
              if (
                  (
                    item.fileRequired !== undefined &&
                    (item.fileRequired === true || item.fileRequired === 1)
                  ) &&
                  item.files.length <= 0
                ) {
                  error = true;
                  // errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
                  ElMessage.warning(item.fileName + errorRequiredCheckMsg);
                }
                let data = item;
                delete data.isOcrSystem;
                delete data.checkSystem;
                delete data.fileType;
                delete data.samplePicture;
                delete data.samplePictureShow;
                delete data.fileRequired;
                applicationInfoFiles.push(data);
            }))
          }).then(() =>{
            Promise.all(storageData.chkServiceInfos.map((item) => {
                let data = item;
                delete data.itemIsCompulsory;
                applicationInfos.push(data);
            }))
          }).then(() => {
            if (error) {
              sendfile.value = false;
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

              let data = {
                applicationId: applicationId.value,
                serviceId: serviceId,
                status: "0",
                applicationInfo: applicationInfos,
                applicationInfoFiles: haveFileApplicationInfoFiles,
                conditionInfo: conditionInfos
              };
              // console.log(haveFileApplicationInfoFiles);
              // debugger;
              let form = new FormData();
              form.append('data', JSON.stringify(data));
              for(var index in applicationInfoFiles) {
                for (var index2 in applicationInfoFiles[index].files) {
                  if (applicationInfoFiles[index].files[index2].webkitRelativePath !== undefined) {
                    form.append("file[]", applicationInfoFiles[index].files[index2]);
                  }
                }
              }    
              localStorageData.data = storageData;
              limitFileTableData.value = localStorageData.data.limitFileTableData;
              localStorageData.data.limitFileTableData = fileTableData;
              localStorageData.data.limitRollFileTableData = rollFileTableData;
              limitFileTableData.value = fileTableData;
              limitRollFileTableData.value = rollFileTableData;
              sendfile.value = true;
              saveInfo(form).then((response) => {
                if (response.code === 200) {
                  applicationId.value = response.data.applicationId;
                  sendfile.value = false;
                  proxy.$modal.msgSuccess("一時保存成功しました");
                }
              }).catch(() => {
                  sendfile.value = false;
              })
            }
          })
        } else if (response.code == 200 && response.data.updatedTime !== props.updatedTime) {
          ElMessage({ message:"該当業務は既に変更されています。再度リクエストを申請してください。",  type: 'error'});
        } 
      });
    }
  });
}

const change = (data) => {
  let fileIndex;
  let arr0 = [...fileUploadError.value];
  let errIndex = arr0.findIndex(v => v === data.id)
  if (errIndex <= -1 && data.fileError === true) {
    fileUploadError.value = [...fileUploadError.value, data.id];
  }else if(data.fileError === false ) {
    if (errIndex >= 0) {
      let arr = [...fileUploadError.value];
      arr.splice(errIndex, 1);
      fileUploadError.value = arr;
    }
  }
    
  if (data.allowSet === 0) {
    limitRollFileTableData.value.map((item, index) => {
        limitRollFileTableData.value[index].files = data.files.length > 0 ? [...data.files] : [];
        if (props.playViewData !== undefined) {
          props.playViewData.chkServiceFileLimitList[item.index].files = data.files.length > 0 ? [...data.files] : [];
        }
    });
  }else {
    limitFileTableData.value.map((item, index) => {
      if (item.serviceFileLimitId == data.id) {
        limitFileTableData.value[index].files = data.files.length > 0 ? [...data.files] : [];
        if (props.playViewData !== undefined) {
          props.playViewData.chkServiceFileLimitList[item.index].files = data.files.length > 0 ? [...data.files] : [];
        }
      }
    });
  }
  checkFileName().then(() => {
    if (!fileNameCheck.value) {
      ElMessage.warning("同じ名前のファイルがアップロードされています。ファイル名を変更して再試行してください。")
    } else  {
      //data.files.forEach()
      changeTable.value = false;
      setTimeout(() => {changeTable.value = true}, 1);
      if (props.playViewData !== undefined) {
        emit("uploadFile", props.playViewData.chkServiceFileLimitList);
      }
    }
  });
}
const viewFile = (index, fileType) => {
  if (fileType === 'zip') {
    let pdfWindow = window.open("")
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" + limitFileTableData.value[index].samplePicture + "'></iframe>"
    );
    setTimeout(() => {
      pdfWindow.close();
    }, 100)
  }else {
    let pdfWindow = window.open("")
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" + limitFileTableData.value[index].samplePicture + "'></iframe>"
    );
  }
}
const checkFileName = () => {
  fileNameCheck.value = true;
  fileTotalSizeCheck.value = true;
  let rollFileTableData = limitRollFileTableData.value;
  let fileTableData = limitFileTableData.value;
  let totalSize = 0;
  //console.log(fileTableData);
  
  let fileIndex;
  let count = 0;
  let fileArray = [];
  let size = 0;
  return new Promise((resolve, reject) => {
    Promise.all(
    rollFileTableData.map((item) => {
      item.files.map((item2) => {
        if (item2.name !== undefined || item2.fileName !== undefined) {
          fileArray.push({
            ...item2,
            name: item2.name !== undefined ? item2.name : item2.fileName,
            size: item2.size !== undefined ? item2.size : item2.fileSize
          });
        } 
      })
    })).then(() => {
    Promise.all(
      fileTableData.map((item) => {
        item.files.map((item2) => {
          if (item2.name !== undefined || item2.fileName !== undefined) {
            fileArray.push({
              ...item2,
              name: item2.name !== undefined ? item2.name : item2.fileName,
              size: item2.size !== undefined ? item2.size : item2.fileSize
            });
          } 
        })
      })
    ).then(() => {
      let fileErrArr =[];
      let fileArr2 = [];
      Promise.all(
        fileArray.map((item) => {
            if (fileArr2.length == -1) {
              fileArr2.push(item);
            } else {
              fileIndex =  fileArr2.findIndex(v => v.name  === item.name);
              if (fileIndex >= 0) {
                // console.log(fileIndex, fileArray, item)
                fileErrArr.push(item);
              }else if (fileIndex <= -1) {
                size += item.size;
                fileArr2.push(item);
              }
            }
        })).then(() =>{
            // console.log(fileIndex)
            fileNameCheck.value = fileErrArr.length > 0 ? false : true;
            fileTotalSizeCheck.value = size > (parseInt(totalFileMaxSize, 10) * 1024 * 1024) ? false : true
            fileTotalSize.value = size;
            resolve();
        })
      })
    });
  })
 
}
const photo = (index) => {
  let isPdfOrZip = false;
  if (!limitFileTableData.value[index].samplePictureShow) {
    loading.value = true;

    getSampleFile(limitFileTableData.value[index].serviceFileLimitId).then((response) => {
      if (response.code === 200) {
        switch(response.data.extension.toLowerCase()) {
          case "jpg":
          case "jpeg":
          case "png":
            isPicture.value = true;
            response.data.base64 = "data:image/" + response.data.extension.toLowerCase() + ";base64, " + response.data.base64;
          break;
          case "pdf":
          case 'zip':
            let temp = limitFileTableData.value[index].samplePicture.split('/');
            isPicture.value = false;
            isPdfOrZip = true;
            sampleFileName.value = temp.length === 0 ? '' : temp[temp.length-1];
            response.data.base64 = "data:application/"+ response.data.extension.toLowerCase() +";base64, " + response.data.base64;
          break;
        } 
        
        limitFileTableData.value[index].samplePictureUrl = response.data.base64;
      }
      if (
        limitFileTableData.value[index].samplePicture === undefined || 
        limitFileTableData.value[index].samplePicture === null ||
        isPicture.value === false
      ) {
        if (isPdfOrZip) {
          viewFile(index, response.data.extension.toLowerCase());
        }
        return false;
      }else {
        limitFileTableData.value[index].samplePictureShow = !limitFileTableData.value[index].samplePictureShow;
      
      }
      loading.value = false;
    });
  } else {
    limitFileTableData.value[index].samplePictureShow = !limitFileTableData.value[index].samplePictureShow;
  }
}
function showImage(index) {
  var win = window.open();
  
   win.document.write("<img src='"+limitFileTableData.value[index].samplePicture+"'/>"); 
}

</script>

<style scoped>
.info > * {
  margin-top: 20px;
}
.button_row {
  margin-top: 10px;
}
</style>
<style>
.el-progress--line {
  margin-bottom: 15px;
  width: 350px;
  background-color: blue!important;
}

.is-success>.el-step__icon {
  background-color: blue!important;
  color: white;
  border: none;
}
.fileUpload {
  height: 10em;
}
.newApplication {
    
  .el-col-offset-1 {
    display: flex;
    justify-content: center;
    margin-left: unset;
  }
  .el-steps {
    justify-content: center;
  }
  .el-row {
    justify-content: center;
  }
  .el-col-offset-8 {
    margin-left: unset;
  }
  .el-col-8 {
    max-width: unset;
    flex: unset;
  }

  .radius-left {
      display: flex;
      background-color: #E3FCEF;
      position: absolute;
      top: 10px;
      min-width: 3em;
      text-align: center;
      justify-content: center;
      border-radius: 5px;
  }
  .radius-right {
    display: flex;
    background-color: #E3FCEF;
    position: absolute;
    top: 10px;
    right: 10px;
    min-width: 3em;
    text-align: center;
    justify-content: center;
    border-radius: 5px;
  }
  .isRequest {
    min-height: 3em;
  }
}
.content .el-col-24 {
  flex: unset;
}
.is-group:nth-child(0) tr:nth-child(1) {
  display: none;
}
 </style>

