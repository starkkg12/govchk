<template>
    <el-drawer v-model="showFilelimitDrawer" :direction="direction" size="90%" @closed="handleClose">
        <template #header>
            <h4>添付書類設定</h4>
        </template>
        <template #default>
        <el-row :span="20">
            <el-col class="filelimitSetting" :span="8">
                <el-container style="margin-top: 20px; margin-left: 5em; display:grid; justify-content: center;" class="block">
                    <div>サンプルファイル</div>
                    <div><B>(JPG、JPEG、PNGのみ)</B></div>
                    <div style="width: 320px; display:grid; justify-self: center;">
                        <FileDragAndDropUpload 
                        :multiple="false"
                        :disabled="disabled"
                        fileType="jpg,jpeg,png"
                        :files="fileLimitSetting.files"
                         @change="change" />
                    </div>
                </el-container>
            </el-col>
            <el-col :span="16">
                <el-form label-position="left" label-width="auto"  :model="fileLimitSetting" style="max-width: 600px" :rules="rules" ref="limitRef">
                    <el-form-item label="表示名">
                        <el-input v-model="fileLimitSetting.fileName"  :disabled="disabled" />
                    </el-form-item>
                    <el-form-item label="複数対応">
                        <el-checkbox v-model="fileLimitSetting.multi"  :disabled="disabled" />
                        <div class="multi" v-show="fileLimitSetting.multi">
                            <el-input  :disabled="disabled"  v-model="fileLimitSetting.fileCount" 
                            style="width:15%">
                            </el-input>
                                ファイルまで
                            </div>

                        </el-form-item>
                        <el-form-item label="ファイルサイズ制限" prop="fileSize">
                            <el-input  :disabled="disabled" v-model="fileLimitSetting.fileSize" style="width:30%" @keypress="isNumber($event, 'fileSize')"/> MB
                        </el-form-item>
                        <el-form-item label="ファイル必須">
                            <el-radio-group  :disabled="disabled" v-model="fileLimitSetting.fileRequired">
                                <el-radio :value="1" size="large">はい</el-radio>
                                <el-radio :value="0" size="large">いいえ</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="ファイルタイプ制限">
                            <el-checkbox-group  :disabled="disabled" v-if="fileLimitSetting.csvshow" v-model="fileLimitSetting.fileType">
                                <el-checkbox v-model="CSV" label="CSV" />
                                <!-- <el-checkbox v-model="ZIP" label="ZIP" /> -->
                            </el-checkbox-group>
                            <el-checkbox-group  :disabled="disabled" v-else v-model="fileLimitSetting.fileType">
                                <el-checkbox v-model="PDF" label="PDF" />
                                <el-checkbox v-model="PNG" label="PNG" />
                                <el-checkbox v-model="TIFF" label="TIFF" />
                                <el-checkbox v-model="TIF" label="TIF" />
                                <el-checkbox v-model="JPG" label="JPG" />
                                <el-checkbox v-model="JPEG" label="JPEG" />
                                <!-- <el-checkbox v-model="ZIP" label="ZIP" /> -->
                            </el-checkbox-group>


                        </el-form-item>
                        <el-form-item label="書類説明文言">
                            <el-input  :disabled="disabled" v-model="fileLimitSetting.description" type="textarea" maxlength="100" show-word-limit />
                        </el-form-item>
                        <el-form-item label="デジパスID" v-if="fileLimitSetting.csvshow==false" prop="digipathId" style="width:70%;">
                            <el-input  :disabled="disabled" v-model="fileLimitSetting.digipathId" maxlength="10" show-word-limit @keypress="isNumber($event, 'digipathId')" />
                        </el-form-item>
                        <el-form-item label="テンプレートID" v-if="fileLimitSetting.csvshow==false" prop="templateId" style="width:70%;">
                            <el-input  :disabled="disabled" v-model="fileLimitSetting.templateId" maxlength="10" show-word-limit @keypress="isNumber($event, 'templateId')" />
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </template>
        <template #footer>
            <div style="flex: auto">
                <el-form v-if="disabled">
                    <el-button  @click="cancelClick">×　閉じる</el-button>
                </el-form>
                <el-button class="buttonShadow" v-if="!disabled" @click="cancelClick">×　閉じる</el-button>
                <el-button class="buttonShadow" v-if="!disabled" v-bind:disabled="fileUploadError" type="primary" @click="confirmClick">確認</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script>
import { reactive, ref, watch, onMounted } from 'vue'
import { getLimit ,saveLimitFile,updateLimit,addLimit} from "@/api/system/service/limit";
import {LIMIT_MULTI} from '@/utils/const'

export default defineComponent({
    name: 'filelimitSetting',
    props: {
        disabled: {
            type: Boolean,
            default: null
        },
        currentFilelimitData: {
            type: Object,
            default: () => {
                return {
                    "default": 0
                }
            }
        },
        showFlag: {
            type: Boolean
        },
        allowSet: {
            type: Boolean
        },
        csvshow: {
            type: Boolean
        }
    },
   
    setup(props, context) {
        const { proxy } = getCurrentInstance();
        const fileUploadError = ref(false);
        const fileLimitSetting = reactive({
            allowSet: props.allowSet,
            fileName: '',
            fileSize: null,
            filenameRule: '',
            description: '',
            fileCount: null,
            fileType: [],
            multi: null,
            templateId:null,
            digipathId:null,
            csvshow:false,
        });
        const fileUrl=ref('')
        const showFilelimitDrawer = ref(true)
        const direction = ref('rtl')
     
        const limitRef =ref(null)
        onMounted(() => {
            const filelimitSettingId = props.currentFilelimitData.filelimitSettingId;
            const filelimitSettingIndex = props.currentFilelimitData.filelimitSettingIndex;
            fileLimitSetting.csvshow = props.csvshow;
            if(typeof filelimitSettingIndex !== 'undefined' && filelimitSettingIndex !== null && props.currentFilelimitData.fileLimit){
                fileLimitSetting.fileName = props.currentFilelimitData.fileLimit.fileName;
                if (props.currentFilelimitData.fileLimit.fileSize) {
                    fileLimitSetting.fileSize = props.currentFilelimitData.fileLimit.fileSize.replace('MB', '');
                }
                fileLimitSetting.allowSet = props.allowSet;
                fileLimitSetting.description = props.currentFilelimitData.fileLimit.description;
                fileLimitSetting.fileCount = props.currentFilelimitData.fileLimit.fileCount;
                fileLimitSetting.multi = props.currentFilelimitData.fileLimit.multi=== LIMIT_MULTI.YES;
                fileLimitSetting.fileRequired= props.currentFilelimitData.fileLimit.fileRequired;
               
                if(props.currentFilelimitData.fileLimit){
                    let array = props.currentFilelimitData.fileLimit.samplePicture.split('/');
                    fileLimitSetting.files = array.length > 0 ? [{fileName: array[array.length-1]}] : [];
                }
                fileLimitSetting.fileType=[]
                if(props.currentFilelimitData.fileLimit.fileType){
                    fileLimitSetting.fileType=fileLimitSetting.fileType.concat(props.currentFilelimitData.fileLimit.fileType.split(","));
                }
                
                fileLimitSetting.digipathId = props.currentFilelimitData.fileLimit.digipathId;
                fileLimitSetting.templateId = props.currentFilelimitData.fileLimit.templateId;
            }
            // ファイル制限を取得
            else if (filelimitSettingId) {
                getLimit(filelimitSettingId).then(response => {
                    fileLimitSetting.fileName = response.data.fileName
                    if (response.data.fileSize) {
                        fileLimitSetting.fileSize = response.data.fileSize.replace('MB', '')
                    }
                    fileLimitSetting.allowSet = props.allowSet;
                    fileLimitSetting.description = response.data.description
                    fileLimitSetting.fileCount = response.data.fileCount
                    fileLimitSetting.multi = response.data.multi=== LIMIT_MULTI.YES
                    fileLimitSetting.fileRequired= response.data.fileRequired;
                    if(props.currentFilelimitData.fileLimit) {
                        let array = props.currentFilelimitData.fileLimit.samplePicture.split('/');
                        fileLimitSetting.files = array.length > 0 ? [{fileName: array[array.length - 1]}] : [];
                    } else {
                        let array = response.data.samplePicture !== undefined && response.data.samplePicture !== null ? response.data.samplePicture.split('/') : [];
                        fileLimitSetting.files = array.length > 0 ? [{fileName: array[array.length - 1]}] : [];
                    }
                    fileLimitSetting.fileType=[]
                    if(response.data.fileType) {
                        fileLimitSetting.fileType=fileLimitSetting.fileType.concat(response.data.fileType.split(","))
                    }
                    fileLimitSetting.templateId=response.data.templateId
                    fileLimitSetting.digipathId=response.data.digipathId
                });
            }
        });

        onUnmounted(() => {
            fileLimitSetting.fileName = '';
            fileLimitSetting.fileSize = null;
            fileLimitSetting.filenameRule = '';
            fileLimitSetting.description = '';
            fileLimitSetting.fileCount = null;
            fileLimitSetting.fileType = [];
            fileLimitSetting.multi = null;
            fileLimitSetting.files = [];
            fileLimitSetting.templateId = null;
            fileLimitSetting.digipathId = null;
            fileLimitSetting.csvshow = false;
        });

        const change = (fileData) => {
            fileUploadError.value = fileData.fileError !== undefined ? fileData.fileError : false;
            if (fileData.files.length > 0 && !fileUploadError.value) {
                let form = new FormData();
                form.append("file", fileData.files[0]);
                saveLimitFile(form).then((response)=>{
                    if (response.code === 200){
                        fileUrl.value = response.data.path
                    }
                })
            }
        }
       
        const handleClose = ()=>{ 
            context.emit("closed");
        }

        const checkDigipath = (rule, value, callback) => {

            if ((fileLimitSetting.digipathId == null || fileLimitSetting.digipathId === undefined || fileLimitSetting.digipathId == '') && (fileLimitSetting.templateId == null || fileLimitSetting.templateId === undefined || fileLimitSetting.templateId == '')) {
                callback(new Error("デジパスIDまたはテンプレートIDのいずれかを入力してください"));
            } else {

                callback();
            }

        };

        const confirmClick = () => {

            limitRef.value.validate(valid => {
                if(!valid){
                    return 
                }
                const filelimitSettingId = props.currentFilelimitData.filelimitSettingId;
                const filelimitSettingIndex = props.currentFilelimitData.filelimitSettingIndex;
                const limitData = {
                    ...fileLimitSetting
                }

                limitData.index = filelimitSettingIndex;
                limitData.allowSet = props.allowSet;
                limitData.fileType = fileLimitSetting.fileType.join()
                limitData.samplePicture = fileUrl.value;
                limitData.multi = fileLimitSetting.multi ? LIMIT_MULTI.YES : LIMIT_MULTI.NO
                limitData.digipathId = fileLimitSetting.digipathId
                limitData.templateId = fileLimitSetting.templateId
                if (typeof filelimitSettingId !== 'undefined' && filelimitSettingId !== null) {
                    // 更新
                    limitData.id = filelimitSettingId;
                    context.emit("sendData", limitData);
                    context.emit("closed");

                } else {
                    // 
                    const serviceId = props.currentFilelimitData.serviceId
                    if (serviceId) {
                        // 該当サービスの添付書類設定を新規追加
                        limitData.serviceId = serviceId;
                        context.emit("closed");
                        context.emit("sendData", limitData);
                    } else {
                        context.emit("closed");
                        context.emit("sendData", limitData);
                    }

                }

            })
        };
        const cancelClick = ()=>{

            context.emit("closed");
        };

        const isNumber = (evt, type) => {
            const regex2 = /[^0-9]/g;
            const keyPressed = evt.key;
           
            const keysAllowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
            
            if (regex2.test(keyPressed.trim())) {
                evt.preventDefault()
            }else if (type === 'fileSize') {
                if ((fileLimitSetting.fileSize == null  || fileLimitSetting.fileSize.trim()== '') && keyPressed === '0') {
                    evt.preventDefault()
                }
            }else if (type === 'digipathId') {
                if ((fileLimitSetting.digipathId == null || fileLimitSetting.digipathId.trim() == '') && keyPressed === '0') {
                    evt.preventDefault()
                }

            }else if (type === 'templateId') {
                if ((fileLimitSetting.templateId == null || fileLimitSetting.templateId.trim() == '') && keyPressed === '0') {
                    evt.preventDefault()
                }
            }
          
        }

        const rules = {
            digipathId: [
                { required: false, message: "デジパスIDを入力してください。", trigger: "blur" },
                { pattern: /^[0-9]\d*$/, message: "数値形式で入力してください。", trigger: "blur" },
                { required: false, validator: checkDigipath, trigger: "blur" }
            ],
            templateId: [
                { required: false, message: "テンプレートIDを入力してください。", trigger: "blur" },
                { pattern: /^[0-9]\d*$/, message: "数値形式で入力してください。", trigger: "blur" },
                { required: false, validator: checkDigipath, trigger: "blur" }
            ],
            fileSize: [
                { pattern: /^[0-9]\d*$/, message: "数値形式で入力してください。", trigger: "blur" },
            ],
        }

        return {
            fileLimitSetting, showFilelimitDrawer ,direction,rules,handleClose,change,confirmClick,cancelClick,limitRef,fileUploadError,isNumber
        }
    },
})

</script>

<style scoped>
.block {
    padding: 30px 0;
    text-align: center;
    display: ruby-text;
    width: 49%;
    box-sizing: border-box;
    vertical-align: top;
}

.el-image {
    padding: 0 5px;
    max-width: 300px;
    max-height: 200px;
    width: 100%;
    height: 200px;
}

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 32px;
}

.image-slot .el-icon {
    font-size: 32px;
}
.multi{
    
    margin-left:15px
}

</style>
