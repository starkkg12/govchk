<template>
    <cardShadow>
      <template #header-title>
        申請業務　審査結果確認
      </template>
      <div class="title-item">
        審査出力日時：{{finishTime}}
      </div>
      <div class="title-item">
        審査結果：{{finishTime ? 'NG  ' + errorCount + '件' : ''}}
      </div>
      <div style="padding-top: 10px;">
        <div style="width: 100%;">
          <div v-for="(itemArray, index) in resultList">
            <el-collapse v-model="activeNames" accordion>
              <el-collapse-item :title="'項番：' + (index + 1).toString().padStart(3, '0')" :name="index+1">
                <el-tabs
                  v-model="activeName"
                  type="border-card"
                  class="demo-tabs"
                  @tab-click="handleClick"
                >
                  <!-- 比較 -->
                  <el-tab-pane name="first">
                    <template #label>
                      <span class="custom-tabs-label">
                        <el-icon><Checked /></el-icon>
                        <span> 比較</span>
                      </span>
                    </template>
                    <el-table
                            v-loading="loading"
                            :data="itemArray.filter(item => item.type === 0 && (statusType !== 1 || item.result === 1))"
                            @selection-change="handleSelectionChange">
                      <el-table-column label="番号" align="center" width="80px">
                        <template #default="scope">
                          <div style="width: 100%; text-align: right">{{ scope.$index + 1 }} </div>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="比較元データ">
                        <el-table-column label="ファイル" align="center" prop="fileName1" width="200px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.fileName1 }} </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="ページ" align="center" prop="page1" width="80px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.page1 }} </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="フィールド" align="center" prop="fieldName1" width="200px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.fieldName1 }} </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="値" align="center" prop="fieldValue1" width="200px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.fieldValue1 }} </div>
                          </template>
                        </el-table-column>
                      </el-table-column>
                      <el-table-column align="center" label="比較対象データ">
                        <el-table-column label="ファイル" align="center" prop="fileName2" width="200px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.fileName2 }} </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="ページ" align="center" prop="page2" width="80px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.page2 }} </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="フィールド" align="center" prop="fieldName2" width="200px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.fieldName2 }} </div>
                          </template>
                        </el-table-column>
                        <el-table-column label="値" align="center" prop="fieldValue2" width="200px">
                          <template #default="scope">
                            <div style="width: 100%; text-align: left">{{ scope.row.fieldValue2 }} </div>
                          </template>
                        </el-table-column>
                      </el-table-column>
                      <el-table-column label="ステータス" align="center" prop="result" width="150px">
                        <template v-slot:header>
                          <div style="display: flex; flex-direction: column; align-items: center;">
                            <span>ステータス</span>
                            <el-button
                                    link
                                    type="primary"
                                    @click="statusView"
                                    style="text-decoration: underline; margin-right: 0; line-height: normal; margin-top: 5px;"
                            >
                              {{statusType === 1 ? 'すべて表示' : 'NGのみ表示'}}
                            </el-button>
                          </div>
                        </template>
                        <template #default="scope">
                          <div style="width: 100%; text-align: left" :style="scope.row.result === 1?'color:red':''">{{ scope.row.result === 1 ? 'NG' : 'OK' }}</div>
                        </template>
                      </el-table-column>
                      <el-table-column label="結果" align="center" prop="errorMsg" width="600px">
                        <template v-slot:header>
                          <div style="display: flex; align-items: center; justify-content: flex-start;">
                            <span>結果</span>
                            <el-button link type="primary" icon="View" v-if="itemArray.some(item => item.type === 0)" @click="resultView(itemArray)" style="margin-left: 10px;"></el-button>
                          </div>
                        </template>

                        <template #default="scope">
                          <div style="width: 100%; text-align: left">
                            {{ scope.row.errorMsg }}
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>

                  <!-- 計算 -->
                  <el-tab-pane name="second">
                    <template #label>
                      <span class="custom-tabs-label">
                        <el-icon><List /></el-icon>
                        <span> 計算</span>
                      </span>
                    </template>
                    <el-table
                            v-loading="loading"
                            :data="itemArray.filter(item => item.type === 1 && (statusType !== 1 || item.result === 1))"
                            @selection-change="handleSelectionChange">
                      <el-table-column label="番号" align="center" width="80px">
                        <template #default="scope">
                          <div style="width: 100%; text-align: right">{{ scope.$index + 1 }} </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="ファイル" align="center" prop="fileName1" width="200px">
                        <template #default="scope">
                          <div style="width: 100%; text-align: left">{{ scope.row.fileName1 }} </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="ページ" align="center" prop="page1" width="80px">
                        <template #default="scope">
                          <div style="width: 100%; text-align: left">{{ scope.row.page1 }} </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="フィールド" align="center" prop="fieldName1" width="200px">
                        <template #default="scope">
                          <div style="width: 100%; text-align: left">{{ scope.row.fieldName1 }} </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="値" align="center" prop="fieldValue1" width="200px">
                        <template #default="scope">
                          <div style="width: 100%; text-align: left">{{ scope.row.fieldValue1 }} </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="ステータス" align="center" prop="result" width="150px">
                        <template v-slot:header>
                          <div style="display: flex; flex-direction: column; align-items: center;">
                            <span>ステータス</span>
                            <el-button
                                    link
                                    type="primary"
                                    @click="statusView"
                                    style="text-decoration: underline; margin-right: 0; line-height: normal; margin-top: 5px;"
                            >
                              {{statusType === 1 ? 'すべて表示' : 'NGのみ表示'}}
                            </el-button>
                          </div>
                        </template>
                        <template #default="scope">
                          <div style="width: 100%; text-align: left" :style="scope.row.result === 1?'color:red':''">{{ scope.row.result === 1 ? 'NG' : 'OK' }}</div>
                        </template>
                      </el-table-column>
                      <el-table-column label="結果" align="center" prop="errorMsg" width="600px">
                        <template v-slot:header>
                          <div style="display: flex; align-items: center; justify-content: flex-start;">
                            <span>結果</span>
                            <el-button link type="primary" icon="View" v-if="itemArray.some(item => item.type === 1)" @click="resultView(itemArray)" style="margin-left: 10px;"></el-button>
                          </div>
                        </template>

                        <template #default="scope">
                          <div style="width: 100%; text-align: left">
                            {{ scope.row.errorMsg }}
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-tab-pane>
                </el-tabs>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div style="width: 100%; margin-top: 10px;">
            <el-button class="fr" @click="cancel">×　閉じる</el-button>
            <div class="clearfix"></div>
          </div>
        </div>
        <div class="clearfix"></div>
      </div>
    </cardShadow>
</template>
<script setup >
  import cardShadow from "@/components/Customized/cardShadow";
  import { getToken } from '@/utils/auth';
  import { Pagination, Navigation, Scrollbar } from 'swiper/modules';
  import { getDigicon, getFlowResult } from "@/api/system/application/file";
  const { proxy } = getCurrentInstance();

  import {inject, onMounted, ref, watch} from 'vue'

  const modules = [ Pagination, Navigation, Scrollbar];

  const props = defineProps(['rowData', 'type', 'id']);
  const selectId = ref('');
  const loading = ref(false);
  const resultList = ref([]);
  const emit = defineEmits(['cancel2']);
  const title = props.type === 'edit' ? 'データ化結果編集' : 'データ化結果参照';
  const finishTime = ref('');
  const activeNames = ref(1);
  const activeName = ref('first');
  const statusType = ref(1);
  const errorCount = computed(() => {
    return resultList.value
          .flat()
          .filter(item => item.result === 1)
          .reduce((sum, item) => sum + item.result, 0);
  });

  watch(() => activeNames.value, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      activeName.value = 'first';
    }
  });

  const getData = async (id) => {
    loading.value = true;
    try {
      await getFlowResult(id).then(response => {
        resultList.value = response.data;
        finishTime.value = getMaxCreateTime();
        loading.value = false;
      });
    } catch (error) {
      loading.value = false;
    }
  }

  const statusView = () => {
    statusType.value = statusType.value === 0 ? 1 : 0;
  };

  const getMaxCreateTime = () => {
    const flattenedList = resultList.value.flat();
    return flattenedList.reduce((maxItem, currentItem) => {
      const maxTime = new Date(maxItem.createTime);
      const currentTime = new Date(currentItem.createTime);
      return maxTime > currentTime ? maxItem : currentItem;
    }).createTime;
  };

  const cancel = () => {
    emit('cancel3');
  };

  onMounted(async () => {
    //selectId.value = props.rowData.id;
    getData(props.id);
  });
  const changeFile = (fileId, status)=>{
    // if (!status.includes('データ化完了')){
    //   return;
    // }
    selectId.value = fileId;
    finishTime.value = '';
    getData(fileId);
  }

  const resultView = (item)=>{
    if(item[0]){
      let row = item[0];
      let url = import.meta.env.VITE_APP_DXFLOW_URL + '/taskDetail?id=' + row.taskId + '&flow_id=' + row.flowId + '&Authorization=' + getToken();
      window.open(url, '_blank');
    }
  }
</script>
<style scoped>
  .title-item{
    height: 32px;
    line-height: 32px;
    font-weight: 700;
    color: var(--el-text-color-regular);
  }
  .is-justify-right {
    justify-content: right;
  }
  .el-card .is-always-shadow {
    box-shadow: unset!important;
  }
  .el-col {
    margin-bottom: unset;
  }
  .el-form-item__label {
    justify-content: unset;
  }
</style>