<template>
  <cardShadow>
    <template #header-title>
      リクエスト　&lt;&lt;{{ props.rowData.serviceName }}&gt;&gt; 審査結果詳細一覧
    </template>
    <div>
    </div>
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="150px">
      <el-row style="margin-bottom: -8px;">
        <el-col :span="12">
          <el-form-item label="審査ステータス" prop="serviceId">
            完了
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="審査出力日時：" prop="createdTime" justify="start">
            {{ props.rowData.createdTime }}
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>


    <el-table v-loading="loading" :data="props.rowData.fileInfos" @selection-change="handleSelectionChange">
      <el-table-column label="id" align="center" prop="id" sortable />
      <el-table-column label="ファイル" align="left" prop="name" />
      <el-table-column label="ファイル名" align="left" prop="fileName" />
      <el-table-column label="ステータス" align="left" prop="status" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="審査結果比較確認" placement="top" >
            <el-button link type="primary" icon="View" @click="handleView(scope.row)" />
          </el-tooltip>
          <el-tooltip content="ダウンロード" placement="top" >
            <el-button link type="primary" icon="Download" @click="handleDownload(scope.row)"/>
          </el-tooltip>
          <el-tooltip content="削除" placement="top" >
            <el-button link type="primary" icon="Delete" v-hasPermi="['system:ocr:edit']" @click="handleDelete(scope.row)"/>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
    <el-row justify="right" class="button_row" style="margin-top: 1em">
      <el-button type="default" size="large" plain @click="cancel">×　閉じる</el-button>
    </el-row>

  </cardShadow>


</template>

<script setup name="Application">
import cardShadow from "@/components/Customized/cardShadow";
import { getInfoData, downloadFile, delData } from "@/api/system/application/info";


const { proxy } = getCurrentInstance();
const props = defineProps(['rowData']);

const applicationList = ref([]);
const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const emit = defineEmits(['callStep2', 'cancel'])



const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    createdTime: null,
    userId: null,
    serviceId: null
  },
  rules: {
  }
});

const { queryParams, form, } = toRefs(data);



// 検索 エリア
/** 検索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** リセット */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}


// フォームのリセット
function reset() {
  form.value = {
    id: null,
    createdTime: null,
    userId: null,
    serviceId: null
  };
  proxy.resetForm("applicationRef");
}


// アクションエリア
/** Viewボタンの処理 */
function handleView(row) {
  reset();
  const fileLimitGroupFiles=props.rowData.fileInfos.filter(item => item.name ==row.name);
  emit('callDetail',{'row': row, 'groupFiles':fileLimitGroupFiles});
}

function handleDownload(row) {
        downloadFile(row.id).then(response => {
            const blob = new Blob([response], { type: 'application/octet-stream' });
            saveAs(blob, row.fileName);
        });
    }

    function handleDelete(row) {
        proxy.$modal.confirm('ファイル"' + row.name + '"を削除してもよろしいでしょうか？').then(function () {
            return delData({id:row.id});
        }).then(response => {
            if(response.code === 200) {
                props.rowData.fileInfos.forEach(function (item, index) {
                    if(item.id === row.id){
                        props.rowData.fileInfos.splice(index, 1);
                    }
                });
                proxy.$modal.msgSuccess("削除しました");
            }
        }).catch(() => {});
    }

function cancel() {
  reset();
  emit('cancel');
}

// getList();
</script>
<style scoped>
.is-justify-right {
  justify-content: right;
}

.el-card .is-always-shadow {
  box-shadow: unset !important;
}

.el-col {
  margin-bottom: unset;
}
</style>
<style>
.el-form-item__label {
  justify-content: unset;
}
</style>