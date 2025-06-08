<template>
  <cardShadow>
    <template #header-title>
      新規リクエスト
    </template>
    <div class="flex flex-wrap gap-4" style="display: flex">
        <el-card v-for="(card, index) in cards" :key="index" style="margin-bottom: 3%;" class="card-main ashadow">
            <div class="card-header">
                    <span>{{ card.serviceName }}</span>
                </div>
                <div class="card-body">
                  <div class="fix_time">
                    <div>有効期限</div>
                    <div v-if="card.validTimeStart">{{ parseTime(card.validTimeStart, '{y}-{m}-{d} {h}:{i}') }}~</div>
                    <div v-if="card.validTimeEnd">{{ parseTime(card.validTimeEnd, '{y}-{m}-{d} {h}:{i}') }}</div>
                  </div>
                  
                    <div v-if="card.id">
                        <a @click="handleView('outstanding', card)">未提出一覧</a>
                    </div>
                    <div class="gov-btn-group" style="margin-top: 20px;">

                        <el-button 
                          :disabled="card.validTimeEnd !== null && new Date(card.validTimeEnd).getTime() <= new Date().getTime() ? true : false " 
                          :type=" card.validTimeEnd !== null && new Date(card.validTimeEnd).getTime() <= new Date().getTime() ? 'info' : 'primary'" class="gov-btn buttonShadow" @click="handleView('local', card)">
                          {{ card.validTimeEnd !== null && new Date(card.validTimeEnd).getTime() <= new Date().getTime() ? '有効期限切れ' : '新規リクエスト' }}
                        </el-button>  
                        <!-- <el-button type="primary" class="gov-btn" @click="handleView('online')">新規オンライン</el-button>  -->
                    </div>
                 
                </div>
        </el-card>
    </div>
  </cardShadow>
 
</template>

<script setup name="Operations">
import cardShadow from "@/components/Customized/cardShadow";
import { addRequestlist } from "@/api/system/application/operations";
const router = useRouter();

const data = reactive({
  form: {
    user_id: null
  },
});
const cards = ref([]);

addRequestlist(data).then(response => {
  cards.value = response.rows;
});


function handleView(code, data) {
  let link = {path: '', query: null};
  let nowTime = new Date().getHours();
  let error = false;
  switch(data.ocrPlan + '') {
    case '1':
      // 2時間 (締切時間当日18時)
      error = nowTime >= 18 ? true : false;
      break;
    case '3':
      // スタンダード(締切時間当日20時)
      //error = nowTime >= 20 ? true : false;
      break;
    case '2':
    default:
      //　当日(締切時間当日14時)
      error = nowTime >= 14 ? true : false;
      break;
  }
  if (error) {
    alert("締切時間を過ぎたらリクエスト受付できない。")
  } else {
    switch(code) {
      case 'local':
        link.path = '../operations/edit?new=true&mode=local&serviceId='+data.id;
        link.query = {mode:'local', serviceId:data.id,serviceName:data.serviceName, new: 'true'};
      break;
      default:
        //link = 'application/operations/outstanding/index?s=1&u=';
        link.path = '../operations/outstanding/index';
        link.query = { s: data.id, u: ''};
      break;
    }
    router.push(link);
  }
  
}
 

// この画面特有のCSSスタイルのため、一旦残っておきます
</script>
<style scoped> 
.el-card .is-always-shadow {
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1) !important;
}
</style>
<style>


.fix_time{
  height:63px
}
</style>
