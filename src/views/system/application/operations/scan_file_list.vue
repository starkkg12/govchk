<template>
    <cardShadow>
        <template #header-title>
            スキャン種類一覧
        </template>
        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
            <el-table-column label="No" align="center" width="100" prop="id" sortable>
                <template #default="scope">
                    <div style="width: 100%; text-align: right;">{{ scope.row.id }} </div>
                </template>
            </el-table-column>
            <el-table-column label="業務名" align="center" prop="serviceName" min-width="200px">
                <template #default="scope">
                    <div style="width: 100%; text-align: left">{{ scope.row.serviceName }} </div>
                </template>
            </el-table-column>
            <el-table-column label="作成日" align="center" prop="createdTime" min-width="44px">
                <template #default="scope">
                    <div style="white-space: pre-line;">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}\n{h}:{i}') }}</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" prop="modify" >
                <template #default="scope">
                    <el-button link type="primary" icon="CaretRight" @click="gotoApplicaton(scope.row)" />
                    <el-button link type="primary" icon="Delete"  />
                </template>
            </el-table-column>

        </el-table>
        <el-button style="float: right; width: 100px;"  size="large" plain @click="router.back(-1);">戻る</el-button>
    </cardShadow>
</template>

<script setup name="Outstanding">
    import { getInfo } from "@/api/login";
    import { unsubmittedListInfo } from "@/api/system/application/operations";

    import cardShadow from "@/components/Customized/cardShadow";
    const router = useRouter();

    let urlParams = new URLSearchParams(window.location.search);
    const list = ref([
        // {
        //   id: 1,
        //   serviceName: null,
        //   status: 1,
        //   validTime: "2021-09-01 12:00:00",
        //   createdTime: "2021-09-01 12:00:00",
        //   isOCR: false,
        //   isInspect: true,
        //   hasOCRResult: false,
        //   hasInpsectResult: true,
        // },
    ]);
    const data = reactive({
        form: {
            user_id: null,
            service_id: null
        }
    });
    const { form } = toRefs(data);
    getInfo().then((data) => {
        form.value= {
            user_id: data.user.userId,
            service_id:parseInt(urlParams.get("s"))
        }
        if (form.value.user_id != null) {
            unsubmittedListInfo({
                userId: parseInt(data.user.userId),
                serviceId: parseInt(urlParams.get("s"))
            }).then((response) => {
                list.value = response.list;
            });
        }
    })

    const gotoApplicaton = (row) => {
        console.log('rowis',row);
        router.push({path:'../edit', query: {applicationId: row.id, serviceId: row.serviceId,serviceName:row.serviceName, step: 3}})
    }



</script>
<style scoped>
</style>