<template>
    <cardShadow>
        <template #header-title>
            審査管理
        </template>

        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="150px">
            <el-row>
                <el-col :span="24">
                    <el-row>
                        <el-col :span="8">
                            <el-form-item label="フロー名" prop="flow_name" style="width: 100%">
                                <el-input v-model="queryParams.flowName" clearable @keyup.enter="handleQuery" class="inputArea" />
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
                                <el-button class="buttonShadow" icon="Refresh" @click="resetQuery" size="normal">リセット</el-button>
                                <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery">検索</el-button>
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
                </el-col>
            </el-row>
            <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                    <el-button class="buttonShadow" @click="handleUpdate(null, 'create')" type="primary" plain icon="Plus" v-if="isAdmin2" v-hasPermi="['system:flow:edit']">新規</el-button>
                </el-col>
            </el-row>
        </el-form>
        <el-table v-loading="loading" :data="flowList" @selection-change="handleSelectionChange" style="width:100%" @sort-change="sortData">
            <el-table-column label="フローID" align="center" prop="flowId" sortable width="120px">
                <template #default="scope">
                    <div style="width: 100%; text-align: right">{{ scope.row.flowId }}</div>
                </template>
            </el-table-column>
            <el-table-column label="フロー名" align="center" prop="flowName" min-width="200px">
                <template #default="scope">
                    <div align="center" style="width: 100%; text-align: left;">
                        {{ scope.row.flowName }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="フロー概要" align="center" prop="flowDescription" min-width="450px">
                <template #default="scope">
                    <div align="center" style="width: 100%; text-align: left;">
                        {{ scope.row.flowDescription }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="自治体名" align="center" prop="govName" v-if="isAdmin" min-width="180px">
                <template #default="scope">
                    <div style="width: 100%; text-align: left">
                        {{ scope.row.govName }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="ステータス" align="center" prop="status" width="120px">
                <template #default="scope">
                    <el-tag type="warning" effect="plain" v-if="scope.row.status === 0">非公開</el-tag>
                    <el-tag type="primary" effect="plain" v-if="scope.row.status === 1">公開</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="審査数" align="right" prop="applicationUnFinishCount" width="100px" />
            <el-table-column label="最新アップロード" align="center" prop="UpdateTime"  sortable="custom" width="190px">
                <template #default="scope">
                    <div style="white-space: pre-line;">{{ parseTime(scope.row.updateTime ? scope.row.updateTime : scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220px">
                <template #default="scope">
                    <el-tooltip  content="編集" placement="top" >
                    <el-button link type="primary" icon="Edit" @click="handleView(scope.row, false)"
                       :disabled="perms2.edit === false || scope.row.applicationUnFinishCount > 0"
                       ></el-button>
                    </el-tooltip>

                    <el-tooltip  content="フロー定義" placement="top" >
                    <el-button link type="primary" icon="Picture" @click="handleUpdate(scope.row, 'draw')"
                       :disabled="perms2.edit === false || !isAdmin2 || scope.row.applicationUnFinishCount > 0"
                       ></el-button>
                    </el-tooltip>
                    <el-tooltip content="詳細情報" placement="top">
                        <el-button  link type="primary" icon="View" @click="handleView(scope.row, true)"></el-button>
                    </el-tooltip>

                    <el-tooltip  content="削除" placement="top" >
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       :disabled="perms2.remove === false || scope.row.applicationUnFinishCount > 0"
                    ></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getFlow"/>

        <el-drawer v-model="open" v-if="open" :action="action" :direction="direction" :before-close="handleClose" size="90%">
            <template #default>
                <h1>{{ flow_name }}</h1>
                <el-form ref="flowRef" :model="form" :rules="rules" label-width="150px" label-position="left"
                         require-asterisk-position="right" v-if="action !== 'draw'">
                    <el-row :gutter="40">
                        <el-col :span="12">
                            <el-form-item label="所属自治体" prop="govId" style="width:70%;">
                                <el-select
                                        class="govList"
                                        v-model="form.govId"
                                        :disabled="formDisabled"
                                        filterable
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
                            <el-form-item label="フロー名" prop="flowName" style="width:70%;">
                                <el-input v-model="form.flowName" :disabled="formDisabled" maxlength="100" show-word-limit />
                            </el-form-item>
                            <el-form-item label="フロー概要" prop="flowDescription" style="width:70%;">
                                <el-input v-model="form.flowDescription" :disabled="formDisabled" :rows="5"
                                          type="textarea" maxlength="300" show-word-limit />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="40">
                        <el-col :span="10">
                            <el-form-item label="テンプレート" v-if="action !== 'create'" prop="flowTemplate" style="width:100%;">
                                <ul class="el-upload-list el-upload-list--text" style="width: 100%;">
                                    <li class="el-upload-list__item is-ready">
                                        <div class="el-upload-list__item-info">
                                            <div style="cursor:default;position:relative;">
                                                <span class="el-upload-list__item-file-name">ファイル名</span>
                                                <span style="position:absolute; right: 0;">
                                                    <span style="padding-right: 0;">表紙</span>
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="el-upload-list__item is-ready" v-for="item in template" tabindex="0">
                                        <div class="el-upload-list__item-info">
                                            <a class="el-upload-list__item-name" style="text-decoration:none;cursor:default;position:relative;padding-right:20%;">
                                                <i class="el-icon el-icon--document"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"></path></svg></i>
                                                <span class="el-upload-list__item-file-name" :title="item.fileName">{{item.fileName}}</span>
                                                <span style="position:absolute; right: 0;">
                                                    <el-checkbox
                                                        :disabled="isDisabled(item.fileName)"
                                                        :checked="form.pageTitle === item.fileName"
                                                        @change="handleCheckboxChange(item.fileName)"
                                                        style="padding-right: 6px;"
                                                    />
                                                </span>
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="マスター" v-if="action !== 'create'" prop="flowTemplate" style="width:100%;">
                                <ul class="el-upload-list el-upload-list--text" style="width: 100%;">
                                    <li class="el-upload-list__item is-ready">
                                        <div class="el-upload-list__item-info">
                                            <div style="cursor:default;position:relative;">
                                                <span class="el-upload-list__item-file-name">ファイル名</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="el-upload-list__item is-ready" v-for="item in masterTemplate" tabindex="0">
                                        <div class="el-upload-list__item-info">
                                            <a class="el-upload-list__item-name" style="text-decoration:none;cursor:default;position:relative;padding-right:20%;">
                                                <i class="el-icon el-icon--document"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"></path></svg></i>
                                                <span class="el-upload-list__item-file-name" :title="item.fileName">{{item.fileName}}</span>
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="40">
                        <el-col :span="10">
                            <el-form-item :label="action === 'create' ? 'テンプレート' : 'テンプレート追加'" prop="files" v-if="!formDisabled" style="width:100%;">
                                <el-upload ref="uploadInstance" drag :on-change="changeFile" :auto-upload="false" :show-file-list="false" multiple accept=".csv">
                                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                    <div class="el-upload__text" style="padding: 0 50px;">
                                        ここにファイルをドロップ<br/>
                                        または<br/>
                                        <em>ファイルを選択</em>
                                    </div>
                                </el-upload>
                                <ul class="el-upload-list el-upload-list--text" style="width: 100%;" v-if="form.files && form.files.length > 0">
                                    <li class="el-upload-list__item is-ready">
                                        <div class="el-upload-list__item-info">
                                            <div style="cursor:default;position:relative;">
                                                <span class="el-upload-list__item-file-name">ファイル名</span>
                                                <span style="position:absolute; right: 0;">
                                                    <span style="padding-right: 0;">表紙</span>
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="el-upload-list__item is-ready" v-for="(file, index) in form.files" tabindex="0" :key="file.name">
                                        <div class="el-upload-list__item-info">
                                            <a class="el-upload-list__item-name" style="position:relative;padding-right:20%;">
                                                <i class="el-icon el-icon--document"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"></path></svg></i>
                                                <span class="el-upload-list__item-file-name" :title="file.name">{{file.name}}</span>
                                                <el-button type="text" icon="Delete" @click="removeFile(index, file.name)" style="padding-left: 5px;"></el-button>
                                                <span style="position:absolute; right: 0;">
                                                    <el-checkbox
                                                            :disabled="isDisabled(file.name)"
                                                            :checked="form.pageTitle === file.name"
                                                            @change="handleCheckboxChange(file.name)"
                                                            style="padding-right: 6px;"
                                                    />
                                                </span>
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item :label="action === 'create' ? 'マスター' : 'マスター追加'" prop="masterFiles" v-if="!formDisabled" style="width:100%;">
                                <el-upload ref="uploadInstance" drag :on-change="changeMasterFiles" :auto-upload="false" :show-file-list="false" multiple accept=".csv">
                                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                    <div class="el-upload__text" style="padding: 0 50px;">
                                        ここにファイルをドロップ<br/>
                                        または<br/>
                                        <em>ファイルを選択</em>
                                    </div>
                                </el-upload>
                                <ul class="el-upload-list el-upload-list--text" style="width: 100%;" v-if="form.masterFiles && form.masterFiles.length > 0">
                                    <li class="el-upload-list__item is-ready">
                                        <div class="el-upload-list__item-info">
                                            <div style="cursor:default;position:relative;">
                                                <span class="el-upload-list__item-file-name">ファイル名</span>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="el-upload-list__item is-ready" v-for="(masterFiles, index) in form.masterFiles" tabindex="0">
                                        <div class="el-upload-list__item-info">
                                            <a class="el-upload-list__item-name" style="position:relative;padding-right:20%;">
                                                <i class="el-icon el-icon--document"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"></path></svg></i>
                                                <span class="el-upload-list__item-file-name" :title="masterFiles.name">{{masterFiles.name}}</span>
                                                <el-button type="text" icon="Delete" @click="removeMasterFile(index)" style="padding-left: 5px;"></el-button>
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <iframe :key="url" :src="url" frameborder="0" style="width: 100%; height: 950px;" v-if="action==='draw' && url"></iframe>
            </template>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancel">キャンセル</el-button>
                    <el-button type="primary" @click="createFlow" v-if="action === 'create'">保存</el-button>
                    <el-button type="danger" @click="handleUpdateStatus" v-if="action === 'edit' && isAdmin2" :disabled="form.status === 1">公開</el-button>
                    <el-button type="primary" @click="updateFlow" v-if="action === 'edit'">保存</el-button>
                </div>
            </template>
        </el-drawer>
    </cardShadow>
</template>


<script setup>
    import cardShadow from "@/components/Customized/cardShadow";
    import useUserStore from "@/store/modules/user";
    import { onMounted, reactive, ref, toRefs, getCurrentInstance } from 'vue';
    import { getToken } from '@/utils/auth';
    import { listGovByName,getGov } from "@/api/system/gov";
    import { getFlowList, add, edit, getFlowInfo, getTmpList, changeStatus, deleteFlow } from "@/api/system/flow";
    import {ElMessage} from "element-plus";

    const { proxy } = getCurrentInstance();
    
    //権限
    const perms = JSON.parse(localStorage.getItem('perms'));
    const perms2 = ref({
        add: perms.indexOf('system:flow:add') != -1 ? true : false,
        edit: perms.indexOf('system:flow:edit') != -1 ? true : false,
        remove: perms.indexOf('system:flow:remove') != -1 ? true : false
    });

    const total = ref(0);
    const govOptions = ref([]);
    const nextPage = ref(false);
    const element  = ref(null);
    const action = ref('');
    const flow_name = ref('');
    const open = ref(false);
    const formDisabled = ref(false);
    const tmpUpdateDisabled = ref(false);
    const flowList = ref([]);
    const flowRef =ref(null);
    const uploadInstance = ref(null);
    const currentUserRoleKey = useUserStore().roles[0]
    const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin' || currentUserRoleKey == 'bpo';
    const isAdmin2 = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin';
    const loading = ref(true);
    const masters = ref([]);
    const data = reactive({
        form: {
            flowName: '',
            flowDescription: '',
            pageTitle: '',
            govId: null,
            files: [],
            masterFiles: []
        },
        template: [],
        masterTemplate: [],
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            flowName: null,
            flowDescription: null,
            status: null,
            govId: null,
            createdTimeStart: null,
            createdTimeEnd: null,
            isAsc: 'asc',
        },
        rules: computed(() => ({
            flowName: [{ required: true, message: "フロー名を入力してください。", trigger: "blur" }],
            flowDescription: [{ required: true, message: "フロー概要を入力してください。", trigger: "blur" }],
            govId: [{ required: true, message: "所属自治体を選択してください。", trigger: "blur" }],
            files: [
                {
                    required: action.value === 'create',
                    message: "テンプレートをアップロードしてください。",
                    trigger: "change"
                },
                {
                    validator: (rule, value, callback) => {
                        if (action.value === 'create' && value.length === 0) {
                            callback(new Error("テンプレートをアップロードしてください。"));
                        } else {
                            callback();
                        }
                    },
                    trigger: "change"
                }
            ]
        }))
    });
    const tmpFormData = reactive({
        form: {
            flowId: null,
            info: []
        },
        rules: {}
    });
    const flowTmpList = ref([]);
    const url = ref('');

    const { form, template, masterTemplate, queryParams, rules } = toRefs(data);
    const { form: tmpForm, rules: tmpRules } = toRefs(tmpFormData);

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

    const loadmore = () => {
        if (nextPage.value) {
            queryParams.value.pageNum += 1;
        }
    }

    function handleQuery() {
        proxy.$refs["queryRef"].validate((valid) => {
            if (valid) {
                queryParams.value.pageNum = 1;
                getFlow();
            }
        });
    }

    const changeFile = (file, fileList) => {
        form.value.files = fileList;
    };

    const changeMasterFiles = (file, fileList) => {
        form.value.masterFiles = fileList;
    };

    const handleCheckboxChange = (file) => {
        if (form.value.pageTitle === file) {
            form.value.pageTitle = '';
        } else {
            form.value.pageTitle = file;
        }
    };

    const isDisabled = (file) => {
        return ((form.value.pageTitle !== '' && form.value.pageTitle !== file) || formDisabled.value === true);
    };

    const checkMaster = (file) => {
        return masters.value.some(item => item === file);
    };

    const handleCheckboxMaster = (file) => {
        const index = masters.value.findIndex(item => item === file);
        if (index !== -1) {
            masters.value.splice(index, 1);
        } else {
            masters.value.push(file);
        }
        masters.value = [...new Set(masters.value)];
    };

    //重複チェック
    const hasDuplicate = (arr) => {
        const nameSet = new Set();
        for (let item of arr) {
            if (nameSet.has(item.name)) {
                return true;
            }
            nameSet.add(item.name);
        }
        return false;
    };

    const removeFile = (index, file) => {
        form.value.files.splice(index, 1);
        if (form.value.pageTitle === file) {
            form.value.pageTitle = '';
        }
    };

    const removeMasterFile = (index) => {
        form.value.masterFiles.splice(index, 1);
    };

    const createFlow = async () => {
        flowRef.value.validate(valid => {
            if(!valid){
                return false;
            }
            let formData = new FormData();
            formData.append("flowName", form.value.flowName);
            formData.append("flowDescription", form.value.flowDescription);
            formData.append("pageTitle", form.value.pageTitle);
            formData.append("govId", form.value.govId);
            let fileArray = [];
            for(let index in form.value.files){
                fileArray.push({'name': form.value.files[index]['name']});
                formData.append("files", form.value.files[index]['raw']);
            }
            for(let index in form.value.masterFiles){
                fileArray.push({'name': form.value.masterFiles[index]['name']});
                formData.append("masterFiles", form.value.masterFiles[index]['raw']);
            }
            if(hasDuplicate(fileArray)){
                ElMessage.warning("同じ名前のファイルがアップロードされています。ファイル名を変更して再試行してください。");
                return;
            }
            add(formData).then(response => {
                if(response.code === 200){
                    proxy.$modal.msgSuccess("新規成功");
                    reset();
                    open.value = false;
                    getFlow();
                }else {
                    proxy.$modal.msgError("新規失敗");
                }
            });
        });
    };

    const updateFlow = async () => {
        flowRef.value.validate(valid => {
            if(!valid){
                return false;
            }
            let formData = new FormData();
            formData.append("id", form.value.id);
            formData.append("flowId", form.value.flowId);
            formData.append("flowName", form.value.flowName);
            formData.append("flowDescription", form.value.flowDescription);
            formData.append("pageTitle", form.value.pageTitle);
            let masterList = '';
            if(masters.value.length>0){
                masterList = masters.value.join(',');
            }
            formData.append("masters", masterList);
            formData.append("govId", form.value.govId);
            let fileArray = [];
            for(let index in template.value){
                fileArray.push({'name': template.value[index]['fileName']});
            }
            for(let index in masterTemplate.value){
                fileArray.push({'name': template.value[index]['fileName']});
            }
            for(let index in form.value.files){
                fileArray.push({'name': form.value.files[index]['name']});
                formData.append("files", form.value.files[index]['raw']);
            }
            for(let index in form.value.masterFiles){
                fileArray.push({'name': form.value.masterFiles[index]['name']});
                formData.append("masterFiles", form.value.masterFiles[index]['raw']);
            }
            if(hasDuplicate(fileArray)){
                ElMessage.warning("同じ名前のファイルがアップロードされています。ファイル名を変更して再試行してください。");
                return;
            }
            edit(formData).then(response => {
                if(response.code === 200){
                    proxy.$modal.msgSuccess("更新成功");
                    reset();
                    open.value = false;
                    getFlow();
                }else {
                    proxy.$modal.msgError("更新失敗");
                }
            });
        });
    };

    const getFlow = () => {
        loading.value = true;
        let obj ={
            ...queryParams.value
        }
        getFlowList(obj).then(response => {
            flowList.value = response.rows;
            total.value = response.total;
            loading.value = false;
        });
    };

    function cancel() {
        element.value = null;
        open.value = false;
        reset();
        resetTmp();
    }

    function initGovOptions(govId) {
        if (govId && govId !==null) {
            getGov(govId).then(res => {
                govOptions.value = [
                   { value: govId, label: res.data.name }
                ]
            })
        }
    }

    function reset() {
        masters.value = [];
        form.value = {
            flowName: '',
            flowDescription: '',
            pageTitle: '',
            govId: null,
            files: []
        };
        flowTmpList.value = [];
        template.value = [];
        masterTemplate.value = [];
        const uploadRef = uploadInstance.value;
        if (uploadRef) {
            uploadRef.clearFiles();
        }
        if (flowRef.value) {
            flowRef.value.resetFields();
        }
    }

    function resetTmp() {
        tmpForm.value = {
            flowId: null,
            info: []
        };
        tmpUpdateDisabled.value = false;
    }

    const getTmpData = async (flowId) => {
        getTmpList(flowId).then(response => {
            if (response.code === 200) {
                flowTmpList.value = response.data;
            }
        });
    }

    async function handleUpdate(row, type) {
        reset();
        action.value = type;
        if (type === 'create') {
            formDisabled.value = false;
            flow_name.value = "審査管理 新規";
        } else if (type === 'view') {
            formDisabled.value = true;
            flow_name.value = "審査管理 詳細情報";
        } else {
            formDisabled.value = false;
            flow_name.value = "審査管理 編集";
        }
        if (row) {
            form.value.flowName = row.flowName;
            form.value.flowDescription = row.flowDescription;
            tmpForm.value.flowId = row.flowId;
            await getTmpData(row.flowId);
        }
        if(type === 'draw'){
            url.value = import.meta.env.VITE_APP_DXFLOW_URL + '/flow?id=' + row.flowId + '&Authorization=' + getToken();
        }

        open.value = true;
        initGovOptions(form.value.govId);
    }

    function handleView(row, disabled) {
        getFlowInfo(row.id).then(response => {
            if (response.code === 200) {
                form.value = response.data.flow;
                if(form.value.master){
                    masters.value = form.value.master.split(',');
                }
                if(!form.value.pageTitle){
                    form.value.pageTitle = '';
                }
                template.value = response.data.template;
                masterTemplate.value = template.value.filter(item => {
                    return masters.value.includes(item.fileName);
                });
                template.value = template.value.filter(item => {
                    return !masters.value.includes(item.fileName);
                });
                formDisabled.value = disabled;
                open.value = true;
                action.value = disabled ? '' : 'edit';
                if (disabled) {
                    flow_name.value = "審査管理 詳細情報";
                } else {
                    flow_name.value = "審査管理 編集";
                }
                initGovOptions(form.value.govId);
            }
        });
    }

    function handleUpdateStatus() {
        if(form.value.status === 1){
            return false;
        }
        proxy.$modal.confirm('フローを公開すると、編集ができなくなりますが、よろしいでしょうか?').then(function () {
            let data = {
                'id': form.value.id,
                'flowId': form.value.flowId,
                'status': form.value.status === 0 ? 1 : 0
            }
            changeStatus(data).then(response => {
                if (response.code === 200) {
                    proxy.$modal.msgSuccess("該当フローを公開しました。");
                    form.value.status = form.value.status === 0 ? 1 : 0;
                    getFlow();
                }
            });
        });
    }

    function handleDelete(row) {
        const _ids = row.id || ids.value;
        proxy.$modal.confirm('フロー"' +row.flowName+ '"を削除してもよろしいでしょうか？').then(function () {
            return deleteFlow(_ids);
        }).then(() => {
            getFlow();
            proxy.$modal.msgSuccess("削除成功");
        }).catch(() => { });
    }

    function sortData(sort) {
        queryParams.value.orderByColumn = sort.prop;
        queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
        getFlow();
    }

    function selectGov(govId) {
       form.value.govId = govId;
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

    function resetQuery() {
        queryParams.value.createdTimeStart = null;
        queryParams.value.createdTimeEnd = null;
        queryParams.value.flowName = null;
        queryParams.value.govId = null;

        proxy.resetForm("queryRef");
        handleQuery();
    }

    const clearGovId = () => {
        queryParams.value.govId = null;
        queryParams.value.pageNum = 1;
        getFlow();
    }

    onMounted(async () => {
        getFlow();
    });
</script>
