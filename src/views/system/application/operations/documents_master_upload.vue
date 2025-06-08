
<template>
  <span class="newApplication">
    <cardShadow v-if="step == 4" >
      <div class="content ">

        <div style="margin: 3%; ">
          <el-steps
            style="width: 100%;"
            :space="200"
            :active="startStep < 2 && !step2 ? 2 : startStep < 2 && step2 ? 3 : startStep > 2 && !step2 ? 1 : startStep > 2 && step2 ? 2 : 3"
            finish-status="success"
            align-center="true"
          >
            <el-step  v-if="startStep < 2" />
            <el-step  v-if="step2" />
            <el-step  />
            <el-step  />
          </el-steps>
        </div>
        <div>
          <el-row style="margin-top: 5%; justify-content: center!important">
            <el-col :span="12" class="text-center">
              <h3>マスターデータ</h3>
            </el-col>
          </el-row>
        </div> 
        <el-row class="document_upload_thead" style="justify-content: center!important">
          <el-col :span="24" :offset="1">
            <!-- table -->
            
            <el-table class="uploadTable"  :data="masterLimitFileTableData" style="width: 100%" :border="true">
              <el-table-column align="right" prop="id" label="項目番号" width="100" justify="right" >
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
                    <!-- <span v-if="scope.row.fileRequired == true" class="radius-left">
                      ファイル必須
                    </span> -->
                  </div>
                  <div class="isRequest">{{ scope.row.fileName }}</div>
                  
                </template>
              </el-table-column>
              <el-table-column prop="description" label="説明	" width="320" />
              <el-table-column prop="uploadAction" label="アップロード" min-width="320" class-name="uploadAction" >
                <template #default="scope">
                  <fileDragAndDropUpload 
                    :allowSet="1"
                    :selectPreviousVersionMasterFiles="true"
                    :multiple="scope.row.multi ==0 ? true : false" 
                    :applicationCreate="true"
                    :disabled="disabled"
                    :index="scope.$index"
                    :id="scope.row.id ? scope.row.id : scope.row.serviceMasterFileLimitId" 
                    :files="scope.row.files ? scope.row.files : scope.row.sfiles"
                    :fileSize="scope.row.fileSize"
                    :fileLimits="scope.row.fileCount"
                    :fileType="scope.row.fileType"
                    @change="change"
                    @beforeData="beforeData"
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
                <el-button class="buttonShadow" v-bind:disabled="sendfile" type="primary"  size="large" plain @click="goBack()">戻る</el-button>
                <el-button class="buttonShadow"  v-bind:disabled="sendfile || fileUploadError.length > 0 " type="primary" size="large" plain  @click="goToNext()">次へ</el-button>
                <el-button class="buttonShadow" v-if="!disabled" :loading="sendfile" type="primary" size="large" plain v-bind:disabled="masterLimitFileTableData.length <= 0 && masterLimitRollFileTableData.length <= 0 ||fileUploadError.length > 0" @click="saveTemp()">一時保存</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </cardShadow>
    <info_edit v-if="step === 2" :chkServiceInfos="localStorageData.data.chkServiceInfos" @goto="goto"/>
  </span>
  <documents_confirm :updatedTime="updatedTime" :serviceName="serviceName"  :step2="step2" :startStep="startStep" :action="action" v-if="step === 5" @goto3="goto" :limitFileTableData="limitFileTableData" :limitRollFileTableData="limitRollFileTableData" :masterLimitFileTableData="masterLimitFileTableData" :masterLimitRollFileTableData="masterLimitRollFileTableData" />

  <vue-modal :open="isOpen">
    <img :src="img" style="width: 50em" />
  </vue-modal>
  <el-drawer v-model="getBeforeData" size="80%">
    <h1>前回アップロードしたファイル</h1>
    <el-form  ref="applicationRef" :model="form" :rules="rules" label-width="130px" label-position="left" require-asterisk-position="right">
      <el-table :data="allowSetFiles" border style="width: 100%">
        <el-table-column prop="id" width="50px">
          <template #default="scope">
            <el-checkbox name="id" @change="addSelect(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="ファイル名" />
        <el-table-column prop="fileName" label="提出日">
          <template #default="scope">
            <div style="white-space: pre-line">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d} {h}:{i}') }}</div>
          </template>
        </el-table-column>
      </el-table>
    
   </el-form>  
   <div style="width:100%; margin-top:50px;" >
    <el-button class="fr buttonShadow" type="primary" @click="selectPreviousVersionMasterFiles">確認</el-button>
    <el-button class="fr buttonShadow" @click="cancel">×　閉じる</el-button>
   </div>  
  </el-drawer>
</template>

<script setup>
import { reactive , toRaw, onMounted } from "vue";
import info_edit from './info_edit.vue';

//addApplication
import { getSampleFile } from '@/api/system/application/file';
import { ElMessageBox } from "element-plus";
import { saveInfo, getMasterFilesPreviousVersion } from '@/api/system/application/info';
import { useRouter } from "vue-router";
import cardShadow from "@/components/Customized/cardShadow";
import documents_confirm from './documents_confirm.vue';
import { ElMessage } from 'element-plus';
import { getServieInfo } from "@/api/system/service/info";


const emit = defineEmits(['goto2', 'uploadFile']);
const props =defineProps(['serviceName', 'playViewData', 'action', 'step', 'step2', 'startStep', 'limitFileTableData', 'limitRollFileTableData',  'updatedTime', 'totalFileMaxSize', 'fileTotalSize']);


const step2 = ref(props.step2 === undefined ? true : props.step2);
const startStep = ref(props.startStep);
const updatedTime = ref(props.updatedTime);

const callback = ref(props.startStep < 3 ? true : false);
watch(() => props.closePage, () => {
 
    startStep.value = props.startStep;
    callback.value = props.startStep < 2 ? true : false;


})
const step = ref(props.step !== undefined ? props.step : 4 );

const isOpen = ref(false);
const img = ref(null);
const fileUploadError = ref([]);
const allowSetTilte = ref(null);
const { proxy } = getCurrentInstance();
const getBeforeData = ref(false);
const selectFilesIds = ref([]);
const selectFiles = ref([]);
const allowSetFiles = ref([]);
const total = ref(0);
const sendfile = ref(false);
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
const applicationId = ref(props.applicationId !== undefined && props.applicationId !== null ? props.applicationId: urlParams.get("applicationId") === null ? null : parseInt(urlParams.get("applicationId")));
const serviceId = parseInt(urlParams.get("serviceId"));
const serviceName = props.playViewData !== undefined ? props.playViewData.chkService.serviceName : (props.serviceName || urlParams.get("serviceName"))

const masterLimitRollFileTableData  = ref(localStorageData !== null && localStorageData.data.masterLimitRollFileTableData !== undefined ? [...localStorageData.data.masterLimitRollFileTableData] : []);

const masterLimitFileTableData  = ref(localStorageData !== null ? [...localStorageData.data.masterLimitFileTableData] : []);

const limitRollFileTableData = ref(props.limitRollFileTableData);

const limitFileTableData = ref(props.limitFileTableData);

const disabled = props.playViewData !== undefined ? true : props.action !== undefined && props.action === false ? true : false;

const samplePictureView = props.playViewData !== undefined ? false : true;

const sampleFileName = ref(null);
const fileNameCheck = ref(false);
const fileTotalSizeCheck = ref(false);
const totalFileMaxSize = props.totalMaxSize; //500MB
const changeTable = ref(true);

onMounted( async ()=>{
  if (props.playViewData !== undefined) {
    changeData();
  }

});

const changeData = () => {
  masterLimitFileTableData.value = [];
  masterLimitRollFileTableData.value = [];

  if (props.playViewData !== undefined) {
    // console.log(props.playViewData.chkServiceMasterFileLimitList);
    // debugger;
    props.playViewData.chkServiceMasterFileLimitList.forEach( (element,index) => {
        if (element.allowSet === true) {
          allowSetTilte.value = element.filelimitName;
          masterLimitRollFileTableData.value = [
            {
              index: index,
              serviceMasterFileLimitId: null,
              fileName: element.fileName,
              description: element.description, 
              fileCount: null,
              files: [],
              allowSet: 0,  // 名簿, 0YES, 1NO
              fileType: null,
              //fileRequired: element.fileRequired === 1 ? true : false
              fileRequired: false
            }
          ]
        } else {
          const tableItem = {
            index: index,
            serviceMasterFileLimitId: element.serviceMasterFileLimitId !== undefined && element.serviceMasterFileLimitId !== null  ? element.serviceMasterFileLimitId : element.id ,
            fileName:element.fileName,
            description:element.description, 
            fileCount:element.fileCount,
            files: [],
            fileType: element.fileType,
            //fileRequired: element.fileRequired === 1 ? true : false
            fileRequired:  false
          }
          masterLimitFileTableData.value = [...masterLimitFileTableData.value, tableItem];
        }

      });
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
  emit('goto3', step);
}
function goto(goto) {
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
    } else {
      getServieInfo(serviceId).then(async (response) => {
        if (response.code == 200 && response.data.updatedTime === props.updatedTime) {
          const fileTableData = masterLimitFileTableData.value;
          const rollFileTableData = masterLimitRollFileTableData.value;
          let error = false;
          let errorMsg = "";
          const storageData = { 
            ...localStorageData.data,
            masterLimitFileTableData: masterLimitFileTableData.value,
            masterLimitRollFileTableData: masterLimitRollFileTableData.value
          };
          let errorRequiredCheckMsg = "のファイルを添付してください。"
          Promise.all(storageData.masterLimitFileTableData.map((item) => {
            // if (
            //   (
            //     item.fileRequired !== undefined &&
            //     (item.fileRequired === true || item.fileRequired === 1)
            //   ) && (item.files === undefined ||
            //   item.files.length <= 0)
            // ) {
            //   error = true;
            //   //errorMsg += errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
            //   ElMessage.warning(item.fileName + errorRequiredCheckMsg);
            // }
          })).then(() =>{
            Promise.all(storageData.masterLimitRollFileTableData.map((item, index) => {
              // if (
              //     (
              //       item.fileRequired !== undefined &&
              //       (item.fileRequired === true || item.fileRequired === 1)
              //     ) &&
              //     item.files.length <= 0
              //   ) {
              //     error = true;
              //     errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
              //   }
            }))
          }).then(() => {
            if (error) {
              //ElMessage.warning('<p>'+errorMsg+'</p>');
              return false;
            }else {
            
              localStorageData.data.applicationId = applicationId.value;
              localStorageData.data.masterLimitFileTableData = masterLimitFileTableData.value;
              localStorageData.data.masterLimitRollFileTableData = masterLimitRollFileTableData.value;
          
              localStorage.setItem("applicantData", JSON.stringify(localStorageData));
              goto('next');
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
          let applicationInfoMasterFiles = [];

          const fileTableData = limitFileTableData.value;
          const rollFileTableData = limitRollFileTableData.value;
          const storageData = { 
            ...localStorageData.data,
            limitFileTableData: fileTableData,
            limitRollFileTableData: rollFileTableData,
            masterLimitFileTableData: masterLimitFileTableData.value,
          };
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

          }).then(() => {
            let errorRequiredCheckMsg = "のファイルを添付してください。"
            
            Promise.all(storageData.masterLimitFileTableData.map((item) => {
                // if (
                //   (
                //     item.fileRequired !== undefined &&
                //     (item.fileRequired === true || item.fileRequired === 1)
                //   ) &&
                //   item.files.length <= 0
                // ) {
                //   error = true;
                //   // errorMsg +=  item.fileName + errorRequiredCheckMsg +" <br />";
                //   ElMessage.warning(item.fileName + errorRequiredCheckMsg);
                // }
                applicationInfoMasterFiles.push({
                  applicationId: item.applicationId,
                  createTime: item.createTime,
                  description: item.description,
                  fileCount: item.fileCount,
                  fileName: item.fileName,
                  files: item.files,
                  serviceMasterFileLimitId: item.serviceMasterFileLimitId !== undefined && item.serviceMasterFileLimitId !== null  ? item.serviceMasterFileLimitId : item.id ,

                });
            }))
          }).then(() =>{
            //console.log(applicationInfoFiles);
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


              let data = {
                applicationId: applicationId.value,
                serviceId: serviceId,
                status: "0",
                applicationInfo: applicationInfos,
                applicationInfoFiles: haveFileApplicationInfoFiles,
                applicationInfoMasterFiles: haveFileApplicationInfoMasterFiles,
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
              for(var index in applicationInfoMasterFiles) {
                for (var index2 in applicationInfoMasterFiles[index].files) {
                  if (applicationInfoMasterFiles[index].files[index2].webkitRelativePath !== undefined) {
                    form.append("masterFile[]", applicationInfoMasterFiles[index].files[index2]);
                  }
                }
              }    
              localStorageData.data = storageData;
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

const cancel = () => {
  getBeforeData.value = false;
}

const change = (data) => {
  //let formData = new FormData();
  // Promise.all(data.files.map((file) => {
  //   formData.append('file', file);
  // })).then(() => {
  
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
    
        masterLimitRollFileTableData.value.map((item, index) => {
            masterLimitRollFileTableData.value[index].files = data.files.length > 0 ? [...data.files] : [];
            if (props.playViewData !== undefined) {
              props.playViewData.chkServiceFileLimitList[item.index].files = data.files.length > 0 ? [...data.files] : [];
            }
        });
      }else {
        masterLimitFileTableData.value.map((item, index) => {
          if (
            (item.id !== undefined && item.id == data.id) ||
            (item.serviceMasterFileLimitId !== undefined &&　item.serviceMasterFileLimitId　== data.id)
          ) {
            
            masterLimitFileTableData.value[index].files = data.files.length > 0 ? [...data.files] : [];
            if (props.playViewData !== undefined) {
              props.playViewData.chkServiceFileLimitList[item.index].files = data.files.length > 0 ? [...data.files] : [];
            }
          }
        });
        
      }
      changeTable.value = false;
      setTimeout(() => {changeTable.value = true}, 1);
      if (props.playViewData !== undefined) {
        emit("uploadFile", props.playViewData.chkServiceFileLimitList);
      }
    
   
  // })
}
const viewFile = (index, fileType) => {
  if (fileType === 'zip') {
    let pdfWindow = window.open("")
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" + masterLimitFileTableData.value[index].samplePicture + "'></iframe>"
    );
    setTimeout(() => {
      pdfWindow.close();
    }, 100)
  }else {
    let pdfWindow = window.open("")
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" + masterLimitFileTableData.value[index].samplePicture + "'></iframe>"
    );
  }
}
const checkFileName = () => {
  fileNameCheck.value = true;
  fileTotalSizeCheck.value = true;
  let rollFileTableData = masterLimitRollFileTableData.value;
  let fileTableData = masterLimitFileTableData.value;
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
        if (item.files !== undefined) {
          item.files.map((item2) => {
            if (item2.name !== undefined || item2.fileName !== undefined) {
              fileArray.push({
                ...item2,
                name: item2.name !== undefined ? item2.name : item2.fileName,
                size: item2.size !== undefined ? item2.size : item2.fileSize
              });
            } 
          })
        }
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
            fileTotalSizeCheck.value = (props.fileTotalSize + size) > (parseInt(totalFileMaxSize, 10) * 1024 * 1024) ? false : true
            resolve();
        })
      })
    });
  })
 
}

function beforeData(index) {
  getMasterFilesPreviousVersion(serviceId).then((response) => {
    if(response.code === 200) {
      total.value = response.total;
      allowSetFiles.value = response.rows;
      if (!getBeforeData.value) {
        getBeforeData.value = true;
        selectRollId.value = index;
      }
    }
  });
}

function addSelect(row) {
  let index = selectFilesIds.value.indexOf(row.id);
  if (
    index <= -1
  ) {
    selectFilesIds.value.push(row.id);
    selectFiles.value.push(row);
  }else if (index >= 0) {
    selectFilesIds.value = [...selectFilesIds.value.splice(index, 1)];
    selectFiles.value = [...selectFiles.value.splice(index, 1)];
    
  }
}

async function selectPreviousVersionMasterFiles() {
  
  if (selectRollId.value !== null)  {
    const data = masterLimitFileTableData.value;
    // const files = [];
    const errFiles = [];
    const errFiles2 = [];
    const errIndexs = [];
    const masterFileExistsIndexs = [];
    let data2;
    if (data[selectRollId.value].files !== undefined) {
       data2 = [...data[selectRollId.value].files];
    }

    await selectFiles.value.map((item, index) => {
      if (data2 !== undefined) {        
        const findIndex = data2.findIndex(item2 => (item2.fileName === item.fileName && item2.fileSize != item.fileSize) || (item2.name === item.fileName  && item2.size !== item.fileSize));
        if (findIndex >= 0 && item.fileName !== undefined) {
          masterFileExistsIndexs.push(findIndex);
          errIndexs.push(index);
          errFiles.push(item);
          errFiles2.push(item.fileName);
        }
      }
      if (data[selectRollId.value].files === undefined) {
        data[selectRollId.value].files = [item];
      }
    });
    
    if (errFiles.length > 0) {
      ElMessageBox.confirm("以下のファイルは重複していますが<br />"+errFiles2.join("<br />") + "<br /> 上書きされますか？", { dangerouslyUseHTMLString: true }).then(async function () {
        await selectFiles.value.map((item, index) => {
          let index2 = errIndexs.indexOf(index);
          if (index2 !== -1) {
            data[selectRollId.value].files[masterFileExistsIndexs[index2]] = item
          } else {
          data[selectRollId.value].files = [...data[selectRollId.value].files, item];
          }
        });
        masterLimitFileTableData.value = data;
        getBeforeData.value = false;
        allowSetFiles.value = [];
      }) 
    } else {
      masterLimitFileTableData.value = data;
      getBeforeData.value = false;
      allowSetFiles.value = [];
    }
  }
  
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

