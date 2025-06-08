<template>
    <!-- {{ showedCols }} -->
    <!-- <el-button class="handle" type="primary" icon="Edit" size="mini" plain @click="edittable = !edittable"></el-button> -->
    <el-button class="handle buttonShadow" type="primary" icon="Plus" size="mini" plain @click="addData" v-if="buttonShow">新規項目</el-button>
    <br />
    <br />
    <el-row :span="200">
        <el-col :span="colData.span" v-if="showedCols" v-for="colData in showedCols">
            {{ colData.title }}
        </el-col>
    </el-row>
    <draggable v-model="localList" @start="drag = true" @end="drag = false" tag="transition-group" :component-data="{
        tag: 'ul',
        type: 'transition-group',
        name: !drag ? 'flip-list' : null
    }" item-key="key-id" v-bind="dragOptions" class="list-group" ghost-class="ghost" :disabled="true">
        <template #item="{ element, index }"  >
            <el-row :span="200">
                <slot name="customized-row"></slot>
                <el-col :span="colData.span" v-if="showedCols" v-for="colData in showedCols" :style="'width: ' + colData.width + 'px;' ">
                    <div v-if="colData.type === 'radio' && (propsAllowSet === 'true' ||propsAllowSet === true)">
                        <el-radio v-if="colData.type == 'radio'"
                           remark=""
                           name="allowSet"
                           v-model="element[colData.key]"
                           @click="checkRadioValue(index)"
                           :value="true"
                           :label="''"
                        />
                       
                    </div>
                    <div v-else-if="colData.type === 'checkBox'">
                        <el-checkbox v-if="colData.type == 'checkBox'" 
                           v-model="element[colData.key]" true-value="1" false="0" />
                    </div>
                    <div v-else-if="colData.type == 'action'">
                        <el-button v-if="(pagename == 'filelimit' || pagename == 'masterFilelimit') && !disabled" class="handle buttonShadow" type="primary" icon="Edit" size="mini"
                            plain @click="handleFilelimitAdd(element, index, pagename)"></el-button>
                            <el-form v-if="disabled">
                              <el-button v-if="(pagename == 'filelimit' || pagename == 'masterFilelimit') && disabled"  class="handle buttonShadow" type="primary" :icon="disabled ? 'View' : 'Edit'" size="mini"
                                @click="handleFilelimitAdd(element, index, pagename)"></el-button>
                            </el-form>
                        
                        <el-button v-if="!disabled" class="handle buttonShadow" type="danger" icon="Delete" size="mini" plain
                            @click="deleteRow(element, pagename, index)"></el-button>
                    </div>
                    <div v-else>
                        <el-select v-if="pagename == 'basicinfo' && colData.type == 'select'"
                            v-model="element[colData.key]" :placeholder="colData.title"
                            value-key="element[colData.key]"
                             >
                            <el-option v-for="item in ServiceInfoOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <el-input v-else-if="colData.title=='項目番号'" :placeholder="colData.title" disabled="true"
                        :value="index+1" 
                        ></el-input>
                      
                        <el-input v-else v-model="element[colData.key]" :placeholder="colData.title"
                        :disabled="pagename == 'filelimit' || pagename == 'masterFilelimit' " 
                        :type=" pagename == 'condition' && colData.key == 'description' ? 'textarea' : colData.type === 'number' ? 'number' : 'text' "
                        :maxlength="colData.key == 'description' ? 200 : 20"  ></el-input>
                    </div>
                </el-col>

                <el-col :span="4">
                </el-col>
            </el-row>
        </template>
    </draggable>
        <filelimitSetting :allowSet="allowSet" :csvshow = "csvshow" :currentFilelimitData="currentFilelimitData" :disabled="disabled" @sendData="revieceFileLimit" v-if="showFilelimitDrawer" @closed="handleFilelimitClose"/>
        <masterFilelimitSetting :currentMasterFilelimitData="currentMasterFilelimitData" :disabled="disabled" @sendData="revieceMasterFileLimit" v-if="showMasterFilelimitDrawer" @closed="handleMasterFilelimitClose"/>
</template>
<!-- page1 左側で実装、業務ID非表示、有効期限追加 -->
<!-- page2 複数行 -->


<script>
import draggable from 'vuedraggable'
import { ServiceInfoOptions } from '@/utils/serviceManage/serviceTitle'
import filelimitSetting from './filelimitSetting.vue'
import masterFilelimitSetting from './masterFilelimitSetting.vue'

import { convertLimitToFileCondition} from '@/utils/serviceManage/fileSetting.js'
import {onMounted} from "vue";
export default {
    name: 'draggableTable',
    components: {
        draggable,
        filelimitSetting,
        masterFilelimitSetting
    },
    props: {
        disabled: {
            type: Boolean ,
            default: null
        }, 
        pagename: {
            type: String,
            default: ''
        },
        showedCols: {
            type: Array,
            default: () => [
                // {
                //     title: '項目名',
                //     key: 'name',
                //     width: 200
                // }
            ]
        },
        showedList: {
            type: Array,
            default: () => [
                // {
                //     id: 123,
                //     name: 1
                // }
            ]
        },
        showedMasterList: {
            type: Array,
            default: () => [
                // {
                //     id: 123,
                //     name: 1
                // }
            ]
        },
        serviceId: {
            type: Number,
            default: null
        },
        csvshow: Boolean,
   
        buttonShow:{
            type: Boolean ,
            default: null
        },
        propsAllowSet: Boolean
    },
    data() {
        return {
            drag: false,
            // edittable: false,

            allowSet:  false,
            localList: this.showedList,
            localMasterList: this.showedMasterList,
            ServiceInfoOptions,
            showFilelimitDrawer:false,
            showMasterFilelimitDrawer:false,
            direction:'rtl',
            currentMasterFilelimitData:{},
            currentFilelimitData:{},
            currentFileConfirm:false,
            currentFileLimitObj:null,
            fileLimitData:[],
            masterFileLimitData:[],
        }
    },
    watch: {
        propsAllowSet() {
            this.localList.map((item) => {
               item.allowSet = false;
               return item;   
            })
        },
        showedList(newVal) {
            this.localList = newVal;
            this.fileLimitData = [];
            this.currentFilelimitData = {};
        },
       
        localList(newVal) {
            this.$emit('update:showedList', newVal);
        }, 
        
    },
    computed: {
        dragOptions() {
            return {
                animation: 300,
                group: "description",
                disabled: false,
                ghostClass: "ghost"
            };
        }
    },
    methods: {
        // edit(element) {
        //     element.editable = !element.editable;
        //     this.dragOptions.disabled = !this.dragOptions.disabled;
        // },
        deleteRow(element, pagename, index) {
           if (pagename === "masterFilelimit") {
            this.masterFileLimitData.splice(index, 1);
            this.masterFileLimitData.map((item, index) => item.index = index);
           } else {
            this.fileLimitData.splice(index, 1);
            this.fileLimitData.map((item, index) => item.index = index);
        
           }
           this.localList.splice(index, 1);
           this.$emit('filelimitDelete', {pagename:pagename, index: index})
        },
        addData() {
            if (
                this.pagename !== undefined &&
                this.pagename == "filelimit" 
            ) {
                this.localList.push({ "allowSet": false});
            } else {
                this.localList.push({ "allowSet": false});
            }

        },
        checkRadioValue(index) {
            
            this.localList.map((item, index2) => {
                item.allowSet = index === index2 ? true : false;
                return item;
            });
            this.allowSet = this.localList[index].allowSet;
        },
        handleFilelimitAdd(element, index, pagename) {
            if (pagename === 'masterFilelimit') {
                this.showMasterFilelimitDrawer = true; 
                this.currentMasterFilelimitData.serviceId = this.serviceId;
                this.currentMasterFilelimitData.filelimitSettingIndex = index;
                this.currentMasterFilelimitData.filelimitSettingId = element.id;
                this.currentMasterFilelimitData.fileLimit = this.masterFileLimitData.find(item => item.index === index);
            }else {
                this.showFilelimitDrawer = true; 
                this.allowSet = this.localList[index].allowSet;
                this.currentFilelimitData.serviceId = this.serviceId;
                this.currentFilelimitData.filelimitSettingIndex = index;
                this.currentFilelimitData.filelimitSettingId = element.id;
                this.currentFilelimitData.fileLimit = this.fileLimitData.find(item => item.index === index);
            }
        },
        handleFilelimitClose(){
            this.showFilelimitDrawer = false;
        },
        handleMasterFilelimitClose(){
            this.showMasterFilelimitDrawer = false;
        },
        cancelClick(){
            this.showFilelimitDrawer = false;
            this.showMasterFilelimitDrawer = false;
        },
        revieceFileLimit(fileLimit) {
            let fileCondition = convertLimitToFileCondition(fileLimit);
            this.currentFilelimitData.filelimitName = fileLimit.fileName;
            this.currentFilelimitData.fileCondition = fileCondition;
            const fileLimitFindIndex = this.fileLimitData.findIndex(item => item.index === fileLimit.index);
            if (fileLimitFindIndex !== -1) {
                this.fileLimitData.splice(fileLimitFindIndex, 1, fileLimit);
            } else {
                this.fileLimitData.push(fileLimit);
            }
            this.$emit('filelimitAdd', {fileLimitObj:fileLimit, localList:this.localList})
        },
        revieceMasterFileLimit(masterFileLimit) {
            let fileCondition = convertLimitToFileCondition(masterFileLimit);
            this.currentMasterFilelimitData.filelimitName = masterFileLimit.fileName;
            this.currentMasterFilelimitData.fileCondition = fileCondition;
            const fileLimitFindIndex = this.masterFileLimitData.findIndex(item => item.index === masterFileLimit.index);
            if (fileLimitFindIndex !== -1) {
                this.masterFileLimitData.splice(fileLimitFindIndex, 1, masterFileLimit);
            } else {
                this.masterFileLimitData.push(masterFileLimit);
            }
            this.$emit('masterFilelimitAdd', {fileLimitObj:masterFileLimit, localMasterList:this.localMasterList})
        },
        confirmClick(){
            this.currentFileConfirm = true
            this.showFilelimitDrawer = false
            this.localList.push(this.currentFilelimitData)
            if(this.currentFileLimitObj){
                this.$emit('filelimitAdd', {fileLimitObj:this.currentFileLimitObj, localList:this.localList})
            }

        },
    },
}
</script>

<style scoped lang="scss">
.button {
    margin-top: 35px;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.handle {
    float: left;
    padding-top: 8px;
    padding-bottom: 8px;
}

.list-group div {
    list-style-type: none;
    padding: 0;
    margin: 1px 0 1px 0;

    div {
        padding: 0 2px 0 0;
    }
}
</style>