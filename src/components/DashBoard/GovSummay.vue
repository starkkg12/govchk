<template>
    <div class="upload-box-summary fl">
        <div class="upload-title fl">受付状況</div>
        <ul class="upload-content">
            <div class="gov">
                <el-select v-model="govId" filterable remote placeholder="自治体名を入力ください" :remote-method="searchGov" :popper-append-to-body="false" v-down="loadmore" clearable @clear="getAllSummary">
                    <el-option v-for="item in govOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <el-table :data="summaryList" style="width: 100%">
                <el-table-column  >
                    <template #default="scope">
                        <el-link type="primary" @click="goApplication('all',scope.row.id)">{{ scope.row.name }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column  label="受付" width="180">
                    <template #default="scope">
                        <el-link type="primary" @click="goApplication(1,scope.row.id)">{{ scope.row.reception ? scope.row.reception : 0 }}</el-link>
                    </template>
                </el-table-column>    
                <el-table-column  label="処理中" width="180" >
                    <template #default="scope">
                        <el-link type="success" @click="goApplication(2,scope.row.id)">{{ scope.row.processing ? scope.row.processing : 0 }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column  label="完了" width="180">
                    <template #default="scope">
                        <el-link type="success" @click="goApplication(5,scope.row.id)">{{ scope.row.completed ? scope.row.completed : 0 }}</el-link>
                    </template>
                </el-table-column>    
                <el-table-column  label="審査中" width="180">
                    <template #default="scope">
                        <el-link type="success" @click="goApplication(6,scope.row.id)">{{ scope.row.underReview ? scope.row.underReview : 0 }}</el-link>
                    </template>
                </el-table-column> 
                <el-table-column  label="審査完了" width="180">
                    <template #default="scope">
                        <el-link type="success" @click="goApplication(7,scope.row.id)">{{ scope.row.reviewCompleted ? scope.row.reviewCompleted : 0 }}</el-link>
                    </template>
                </el-table-column> 
                <el-table-column  label="エラー" width="180" >
                    <template #default="scope">
                        <el-link type="danger" @click="goApplication(99,scope.row.id)">{{ scope.row.error ? scope.row.error : 0 }}</el-link>
                    </template>
                </el-table-column>
            </el-table>            
        </ul>
    </div>
</template>

<script setup>
import { ref,watch } from "vue";

import { listGovByName, countGovService, getAllCountGovService } from "@/api/system/gov";
import { onMounted,  } from 'vue';
onMounted(() => {
    setTimeout(() => {
        const element = document.querySelector('.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap');
        element.addEventListener('scroll', () => {
           const { scrollTop, scrollHeight, clientHeight } = element;
           const scrollDistance = scrollHeight - scrollTop - clientHeight;
           if (scrollDistance <= 50) {
             loadmore();
            }
        })
    }, 100);
});
const router = useRouter();
const summaryList = ref([])
const nextPage = ref(false);

const data = reactive({
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      name: null
    }
});
const { queryParams } = toRefs(data);
const govOptions = ref([])
const govId = ref(null)
watch(govId, () => {
    if (govId.value === undefined) {
        queryParams.value.name = null;
        queryParams.value.pageNum = 1;
    } else {
        getSummary()
    }
})

const getSummary = () => {
    if (govId.value !== undefined) {
        countGovService(govId.value).then(response => {
            const summarys = []
            response.rows.forEach(element => {
                let target = summarys.find(e => e.id == element.id)
        
                if (!target) {
                    target = {
                        count: 0,
                        id: element.id,
                        name: element.name
                    }
                    summarys.push(target)
                }

                target.count = target.count + element.count
                if (element.status == 1) {
                    target.reception = element.count
                } else if (element.status >= 2 && element.status <= 4) {
                    if (target.processing === undefined || target.processing === null) {
                       target.processing = element.count
                    } else {
                       target.processing += element.count
                    }
                } else if (element.status == 5) {
                    target.completed = element.count
                } else if (element.status == 6) {
                    target.underReview = element.count
                } else if (element.status == 7) {
                    target.reviewCompleted = element.count
                
                } else if (element.status == 99) {
                    target.error = element.count
                }

            });

            summaryList.value = [
                ...summarys
            ]
        }
        )
    }
}


const searchGov = (query) => {
    if (
        (govId.value === null || govId.value === undefined)
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
    }
    listGovByName(query).then(res => {
            //const list = res.rows
            const list = res.data;
            if (list.length > 0) {
                //nextPage.value = queryParams.value.pageNum * 10 >= res.total ? false : true;
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
const loadmore = () => {
    if (nextPage.value) {
        queryParams.value.pageNum += 1;
        //searchGovStep2();
    }
}

const getAllSummary = () => {
    let totalObj = {
        name: '',
        count: 0,
        processing: 0,
        completed: 0,
        error: 0
    }
    getAllCountGovService().then(response => {
        const summarys = []
        response.rows.forEach(element => {
            let target = summarys.find(e => e.id == element.id)
            
            if (!target) {
                target = {
                    count: 0,
                    id: element.id,
                    name: element.name
                }
                summarys.push(target)
            }

            target.count = target.count + element.count
            totalObj.count += element.count
            if (element.status == 1) {
                target.reception = element.count
                totalObj.reception += element.count
            } else if (element.status >= 2 && element.status <= 4) {
                if (target.processing === undefined || target.processing === null) {
                    target.processing = element.count
                } else {
                    target.processing += element.count
                }
                
                totalObj.processing += element.count
            } else if (element.status == 5) {
                target.completed = element.count
                totalObj.completed += element.count
            } else if (element.status == 6) {
                target.underReview = element.count
            } else if (element.status == 7) {
                target.reviewCompleted = element.count
                
            } else if (element.status == 99) {
                target.error = element.count
                totalObj.error += element.count
            }

        });

        summaryList.value = [
            //totalObj,
            ...summarys
        ]
    });
    summaryList.value = [
        totalObj,
        ...summaryList.value
    ]
}
const goApplication =(status,govId) =>{
    if (status === 'all') {
        router.push(`/application/index?govId=${govId}`);
    } else if (status === 1) {
        router.push(`/application/index?govId=${govId}&status=${status}`);
    } else {
        router.push(`/application/index?status=${status}&govId=${govId}`)
    }
 }
getAllSummary();
</script>

<style lang="scss">
.upload-box-summary {
    width: 100%;
    border: 1px solid #479E58;
    margin-bottom: 1.5rem;
}

.upload-title {
    padding: 0 2rem;
    font-size: 20px;
    background-color: #479E58;
    color: #fff;
    margin-bottom: 15px;
}

.upload-content li {
    display: block;
    margin: 1rem 0;
    padding-right: 3rem;

}

.gov {
    width: 27%;
    margin-top: 15px;
    margin-bottom: 15px;
}
</style>