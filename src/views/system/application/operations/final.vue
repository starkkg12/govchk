
<template>
  <cardShadow> 
    <div>
      <div>
        <el-row style="margin-top: 5%; justify-content: center!important">
          <el-col :span="4" class="text-center">
            <h3 v-if="timecheck === null">申請完了</h3>
            <h3 v-if="timecheck === 0">受付完了</h3>
            <h3 v-if="timecheck === 1">予約完了</h3>
          </el-col>
        </el-row>
      </div>

      <div class="info">
        <el-row style="justify-content: center!important">
          <el-col :span="15">
            <el-row style="height:150px;border:1px solid black;">
              <el-col :span="22" class="vertical-center">
                <span>{{ serviceName }} {{ description }}</span>
                <span>続けてリクエストする場合は「継続」ボタンをクリックしてください。</span>
                <span>「完了」ボタンをクリックした場合、リクエスト一覧画面に遷移します。</span>
              </el-col>
            </el-row>
            
            <el-row style="justify-content: center!important" justify="center" class="button_row">
              <el-col :span="7" class="text-center">
                <el-button type="primary" size="large" plain @click="newApplication">継続</el-button>
              </el-col>
              <el-col :span="7" class="text-center">
                <el-button type="primary" size="large" plain @click="final">完了</el-button>
              </el-col>
            </el-row>

          </el-col>
        </el-row>
      </div>
    </div>
  </cardShadow> 
</template>

<script setup>
  import cardShadow from "@/components/Customized/cardShadow";
  const props = defineProps(['serviceName', 'createdTime', 'ocrPlan']);
  let localStorageData = JSON.parse(localStorage.getItem('applicantData'));
  const serviceName = localStorageData !== null && localStorageData.serviceName !== undefined && localStorageData.serviceName !== null? localStorageData.serviceName : props.serviceName;
  const timecheck = ref(null);
  const description = ref('の申請処理は完了しました。')
  if (props.createdTime === null ) {
    timecheck.value = null;
  }else if (props.ocrPlan !== undefined) {
    let limitHour = 14;
    switch(props.ocrPlan + '') {
      case '1':
          // 2時間 (締切時間当日18時)
          limitHour = 18;
      break;
      case '3':
        // スタンダード(締切時間当日20時)
          limitHour = 20;
      break;
      case '2':
      default:
          //　当日(締切時間当日14時)
          limitHour = 14;
        break;
    }
    timecheck.value = new Date(props.createdTime).getHours() < limitHour ? 0 : 1;
    description.value = new Date(props.createdTime).getHours() < limitHour ? 'の受付完了しました。' : 'の予約完了しました。明日9:00付けの受付となります。'
  } else {
    timecheck.value = new Date(props.createdTime).getHours() < 19 ? 0 : 1;
    description.value = new Date(props.createdTime).getHours() < 19 ? 'の受付完了しました。' : 'の予約完了しました。明日9:00付けの受付となります。'
  }
  function newApplication() {
    location.href="../operations/index";
  }
  function final() {
    location.href="../index";
  }
</script>

<style scoped>
.info_content {
  border: 1px solid black;
  width: 500px;
  height: 150px;
  margin-top: 20px;
}
.info > * {
  margin-top: 20px;
}
.button_row {
  margin-top: 50px;
}

.vertical-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
}

</style>