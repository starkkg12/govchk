<template>
    <el-drawer v-model="showFilelimitDrawer" :direction="direction" size="90%" @closed="handleClose">
        <template #header>
            <h4>マスターデータ設定</h4>
        </template>
        <template #default>
        <el-row justify="center" >
            <el-col :span="24" style="align-content: center">
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
                    <!-- <el-form-item label="ファイル必須">
                        <el-radio-group  :disabled="true" v-model="fileLimitSetting.fileRequired">
                            <el-radio :value="1" size="large">はい</el-radio>
                            <el-radio :value="0" size="large">いいえ</el-radio>
                        </el-radio-group>
                    </el-form-item> -->
                    <el-form-item label="ファイルタイプ制限">
                        CSVのみ
                        <!-- <el-checkbox-group  :disabled="disabled" v-model="fileLimitSetting.fileType">
                            <el-checkbox v-model="PDF" label="PDF" />
                            <el-checkbox v-model="PNG" label="PNG" />
                            <el-checkbox v-model="TIFF" label="TIFF" />
                            <el-checkbox v-model="TIF" label="TIF" />
                            <el-checkbox v-model="JPG" label="JPG" />
                            <el-checkbox v-model="JPEG" label="JPEG" />
                        </el-checkbox-group> -->
                    </el-form-item>
                    <el-form-item label="書類説明文言">
                        <el-input  :disabled="disabled" v-model="fileLimitSetting.description" type="textarea" maxlength="100" show-word-limit />
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
import { getLimit, getMasterLimit ,saveLimitFile,updateLimit,addLimit} from "@/api/system/service/limit";
import {LIMIT_MULTI} from '@/utils/const'

export default defineComponent({
    name: 'filelimitSetting',
    props: {
        disabled: {
            type: Boolean,
            default: null
        },
        currentMasterFilelimitData: {
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
        }
    },
   
    setup(props, context) {
        const { proxy } = getCurrentInstance();
        const fileUploadError = ref(false);
        const fileLimitSetting = reactive({
            allowSet: props.allowSet,
            fileName: '',
            fileSize: null,
            description: '',
            fileRequired: 1,
            fileCount: null,
            fileType: ["CSV"],
            multi: null,
        });
        const fileUrl=ref('')
        const showFilelimitDrawer = ref(true)
        const direction = ref('rtl')
     
        const limitRef =ref(null)
        onMounted(() => {
            const filelimitSettingId = props.currentMasterFilelimitData.filelimitSettingId;
            const filelimitSettingIndex = props.currentMasterFilelimitData.filelimitSettingIndex;
            if(typeof filelimitSettingIndex !== 'undefined' && filelimitSettingIndex !== null && props.currentMasterFilelimitData.fileLimit){
                fileLimitSetting.fileName = props.currentMasterFilelimitData.fileLimit.fileName;
                if (props.currentMasterFilelimitData.fileLimit.fileSize) {
                    fileLimitSetting.fileSize = props.currentMasterFilelimitData.fileLimit.fileSize.replace('MB', '');
                }
                fileLimitSetting.allowSet = props.allowSet;
                fileLimitSetting.description = props.currentMasterFilelimitData.fileLimit.description;
                fileLimitSetting.fileCount = props.currentMasterFilelimitData.fileLimit.fileCount;
                fileLimitSetting.multi = props.currentMasterFilelimitData.fileLimit.multi=== LIMIT_MULTI.YES;
                fileLimitSetting.fileRequired= props.currentMasterFilelimitData.fileLimit.fileRequired;
                // if(props.currentMasterFilelimitData.fileLimit){
                //     let array = props.currentMasterFilelimitData.fileLimit.samplePicture.split('/');
                //     fileLimitSetting.files = array.length > 0 ? [{fileName: array[array.length-1]}] : [];
                // }
                fileLimitSetting.fileType=["CSV"]
                // if(props.currentMasterFilelimitData.fileLimit.fileType){
                //     fileLimitSetting.fileType=fileLimitSetting.fileType.concat(props.currentMasterFilelimitData.fileLimit.fileType.split(","));
                // }
            }
            // ファイル制限を取得
            else if (filelimitSettingId) {
                getMasterLimit(filelimitSettingId).then(response => {
                    fileLimitSetting.fileName = response.data.fileName
                    if (response.data.fileSize) {
                        fileLimitSetting.fileSize = response.data.fileSize.replace('MB', '')
                    }
                    fileLimitSetting.allowSet = props.allowSet;
                    fileLimitSetting.description = response.data.description
                    fileLimitSetting.fileCount = response.data.fileCount
                    fileLimitSetting.multi = response.data.multi=== LIMIT_MULTI.YES
                    fileLimitSetting.fileRequired= response.data.fileRequired;
                    // if(props.currentMasterFilelimitData.fileLimit) {
                    //     let array = props.currentMasterFilelimitData.fileLimit.samplePicture.split('/');
                    //     fileLimitSetting.files = array.length > 0 ? [{fileName: array[array.length - 1]}] : [];
                    // }
                    fileLimitSetting.fileType=["CSV"]
                    // if(response.data.fileType) {
                    //     fileLimitSetting.fileType=fileLimitSetting.fileType.concat(response.data.fileType.split(","))
                    // }

                });
            }
        });

        onUnmounted(() => {
            fileLimitSetting.fileName = '';
            fileLimitSetting.fileSize = null;
            fileLimitSetting.filenameRule = '';
            fileLimitSetting.description = '';
            fileLimitSetting.fileCount = null;
            fileLimitSetting.fileType = ["CSV"];
            fileLimitSetting.multi = null;
            fileLimitSetting.files = [];
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
                const filelimitSettingId = props.currentMasterFilelimitData.filelimitSettingId;
                const filelimitSettingIndex = props.currentMasterFilelimitData.filelimitSettingIndex;
                const limitData = {
                    ...fileLimitSetting
                }

                limitData.index = filelimitSettingIndex;
                limitData.allowSet = props.allowSet;
                limitData.fileType = fileLimitSetting.fileType.join()
                limitData.multi = fileLimitSetting.multi ? LIMIT_MULTI.YES : LIMIT_MULTI.NO
                if (typeof filelimitSettingId !== 'undefined' && filelimitSettingId !== null) {
                    // 更新
                    limitData.id = filelimitSettingId;
                    context.emit("sendData", limitData);
                    context.emit("closed");

                } else {
                    // 
                    const serviceId = props.currentMasterFilelimitData.serviceId
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
