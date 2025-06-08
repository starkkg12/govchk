<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span> 業務一覧画面</span>
                <!-- <el-button class="button" text>Operation button</el-button> -->
            </div>
        </template>
        <div class="card-body">
            <el-row>
                <el-col :span="16">
                    <el-form :inline="true" :model="formInline" class="demo-form-inline">
                        <el-row>
                            <el-col :span="18">
                                <el-form-item label="業務: ">
                                    <el-select v-model="search.service" filterable placeholder="入力する又は選択してください"
                                        style="width: 465px">
                                        <el-option v-for="item in service_options" :key="item.value" :label="item.label"
                                            :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="ステータス: ">
                                    <el-select v-model="search.status" class="m-2" placeholder="選択してください" size="large"
                                        style="width: 240px">
                                        <el-option v-for="item in status_options" :key="item.value" :label="item.label"
                                            :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="18">
                                <el-form-item label="時間: ">
                                    <el-date-picker v-model="formInline.startDate" type="date" placeholder="開始時間選択"
                                        clearable />
                                    <el-text style="margin: 0 10px">-</el-text>
                                    <el-date-picker v-model="formInline.endDate" type="date" placeholder="終了時間選択"
                                        clearable />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item>
                                    <el-button type="primary" @click="onSubmit" icon="search">検索</el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-col>
                <el-col :span="4">
                </el-col>
                <el-col :span="4">
                    <el-row style="margin-bottom: 10px;" align="right">
                        <el-button type="success" icon="plus">登録</el-button>
                    </el-row>
                </el-col>
            </el-row>
        </div>
        <el-divider />
        <el-row>
            <el-col :span="6" >
                <el-button type="primary" @click="downloadCSV">Toggle selection</el-button>

                <!-- 
        <el-form-item label="ステータス: ">
                    <el-select v-model="pageSetting.pageSize" class="m-2" placeholder="選択してください" size="large"
                        style="width: 240px">
                        <el-option v-for="item in pageSetting.options" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item> -->
            </el-col>
        </el-row>
            <el-table ref="multipleTableRef" :data="tableData" border style="width: 100%; margin-bottom: 20px;"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column sortable prop="title" label="業務名" width="180" />
                <el-table-column sortable prop="created_time" label="作成時間" width="180" />
                <el-table-column sortable prop="is_OCR_system" label="OCRシステム必要か">
                    <template #default="scope">
                        <el-tag :type="getBooleanType(scope.row.is_OCR_system)">
                            {{ scope.row.is_OCR_system ? '必要' : '不要' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column sortable prop="status" label="ステータス">
                    <template #default="scope">
                        <el-tag :type="getStatusType(scope.row.status)">
                            {{ scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column sortable prop="related_request" label="関連申請数" />

                <el-table-column label="動作">
                    <template #header>
                        <a>動作</a>
                        <el-button size="small" type="primary" icon="refresh" plain>更新</el-button>
                    </template>
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEdit(scope.$index, scope.row)" icon="Edit"
                            plain></el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)" icon="Delete"
                            plain></el-button>
                        <el-button size="small" type="info" @click="handleView(scope.$index, scope.row)" icon="View"
                            plain></el-button>
                        <el-button size="small" type="info" @click="handleView(scope.$index, scope.row)" icon="Files"
                            alt="ファイル一覧" plain></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-row align="right">
                <el-col :span="12" align="right">
                    <el-pagination v-model:current-page="pageSetting.currentPage" v-model:page-size="pageSetting.pageSize"
                        :page-sizes="pageSetting.options" :small="small" background
                        layout="total, sizes, prev, pager, next, jumper" :total="pageSetting.total"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </el-col>
                <el-col :span="12" align="right">
                    <a>
                        表示中:
                        {{ pageSetting.pageSize * (pageSetting.currentPage - 1) + 1 }} -
                        {{ pageSetting.pageSize * pageSetting.currentPage }} 件
                    </a>
                </el-col>
            </el-row>
            <template #footer>Footer content</template>
    </el-card>
    
    <el-button
      v-show="showScrollTopButton"
      type="primary"
      icon="el-icon-arrow-up"
      circle
      style="position: fixed; bottom: 20px; right: 20px;"
      @click="scrollToTop"
    ></el-button>
</template>
  
<script lang="ts" setup>

import { computed, ref } from 'vue'
import { ElTable } from 'element-plus'

interface User {
    date: string
    name: string
    address: string
}
const search = ref({
    user: '',
    region: '',
    startDate: '',
    endDate: '',
    status: '',
    service: ''
})

interface User {
    date: string
    name: string
    address: string
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])
const toggleSelection = (rows?: User[]) => {
    if (rows) {
        rows.forEach((row) => {
            // TODO: improvement typing when refactor table
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            multipleTableRef.value!.toggleRowSelection(row, undefined)
        })
    } else {
        multipleTableRef.value!.clearSelection()
    }
}
const handleSelectionChange = (val: User[]) => {
    multipleSelection.value = val
}

const downloadCSV = () => {
    console.log(multipleSelection)
    alert(multipleSelection._value)
}


const small = ref(false) 

const handleSizeChange = (val: number) => {
    console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
    console.log(`current page: ${val}`)
}

const handleEdit = (index: number, row: User) => {
    console.log(index, row)
}
const handleDelete = (index: number, row: User) => {
    console.log(index, row)
}

const handleView = (index: number, row: User) => {
    console.log(index, row)
}

import { ElButton, ElCard, ElCol, ElRow } from 'element-plus'
import { reactive } from 'vue'

const formInline = reactive({
    user: '',
    region: '',
    startDate: '',
    endDate: '',

})

const getStatusType = (status: string) => {
    switch (status) {
        case '処理中':
            return 'warning'
        case '完了':
            return 'success'
        case '保留中':
            return 'danger'
        default:
            return 'info'
    }
}

const getBooleanType = (status: boolean) => {
    return status ? 'success' : 'danger'
}

const onSubmit = () => {
    console.log('submit!')
}
const tableData = [
    {
        id: 1,
        title: '営業許可申請',
        created_time: '2023-01-15 09:30:00',
        is_OCR_system: true,
        is_check_system: true,
        status: '処理中',
        trigger: '手動',
        desc: '営業許可証を申請し、関連する審査を行います。',
        is_permit_web: true,
        is_enforce_ocr: false,
        related_request: 3
    },
    {
        id: 2,
        title: '税務登録',
        created_time: '2023-02-20 14:45:00',
        is_OCR_system: true,
        is_check_system: false,
        status: '完了',
        trigger: '自動',
        desc: '税務登録を行い、関連手続きを完了します。',
        is_permit_web: true,
        is_enforce_ocr: true,
        related_request: 1
    },
    {
        id: 3,
        title: '証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false,
        is_check_system: true,
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
    },
    {
        id: 4,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false,
        is_check_system: true,
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    },
    {
        id: 5,
        title: '住民証明書発行',
        created_time: '2023-03-10 11:00:00',
        is_OCR_system: false, 
        status: '保留中',
        trigger: '手動',
        desc: '条件に適合する申請者に対し、関連する証明書を発行します。',
        is_permit_web: false,
        is_enforce_ocr: false,
        related_request: 0
        
    }
];

const pageSetting = ref({
    total: tableData.length,
    currentPage: 1,
    pageSize: 10,
    options: [10, 25, 50, 100]
})
const service_options = [
    {
        value: '営業許可申請',
        label: '営業許可申請'
    },
    {
        value: '税務登録',
        label: '税務登録'
    },
    {
        value: '証明書発行',
        label: '証明書発行'
    },
    {
        value: '住民証明書発行',
        label: '住民証明書発行'
    }
]

const status_options = [
    {
        value: '処理中',
        label: '処理中'
    },
    {
        value: '完了',
        label: '完了'
    },
    {
        value: '保留中',
        label: '保留中'
    }
]

</script>
<style scoped>
.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}

.el-progress--line {
    margin-bottom: 15px;
    width: 350px;
}

.card-header {
    font-weight: bold;
}

/* query box */
.demo-form-inline .el-input {
    --el-input-width: 465px;
}

.demo-form-inline .el-select {
    --el-select-width: 250px;
}

.el-card__header {
    background-color: antiquewhite;
}

button,
.el-pager {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>