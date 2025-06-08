<template>
  <cardShadow>
    <div class="app-container">
        <el-card>
            <div class="button-box" v-if="!isAdmin">
                <div v-if="perms2.add" class="fl button fixed_height" style="margin-right: 5%;padding: 3.3rem 0;" @click="handleClick('application')">新規リクエスト</div>
                <div class="fl button fixed_height" style="margin-right: 5%" @click="handleClick('history')">リクエスト一覧 <br/>（データ化）</div>
                <div class="fr button fixed_height" @click="handleClick('result')">リクエスト一覧<br>（審査）</div>
                <div class="clearfix"></div>
            </div>

            <div class="notice-box">
                <div>
                    <div class="notice-title fl">お知らせ</div>
                    <div class="clearfix"></div>
                </div>
                <ul class="notice-content fr">
                    <li v-for="item in noticeList" @click="handleNoticeView(item)" style="cursor: pointer">
                        <span class="notice-item-title">{{item.typeName}}</span>
                        <span class="notice-item" >{{ parseTime(item.createdTime, '{y}/{m}/{d}') }}</span>
                        <span class="notice-item">{{item.content}}</span>
                    </li>
                </ul>
                <div class="clearfix"></div>
            </div>
            <div style="margin-bottom: 1.5rem;" v-if="!isAdmin">
              <ApplicationSummary></ApplicationSummary>
            </div>
            <div style="margin-bottom: 1.5rem;" v-if="isAdmin">
                <GovSummay></GovSummay>
            </div>
        </el-card>
    </div>
    <!-- ダイアログボックスを新規または改修します -->
    <el-drawer  v-model="open" width="90%" append-to-body size="90%">
        <h1>{{ title }}</h1>
        <el-row style="margin-top: 5%" class="dashboardNotice">
          <el-col :offset="4" :span="16">
            <el-form v-if="open" ref="noticeRef" class="notice" :model="form" :rules="rules" >
              <el-row>
                <el-col :span="10">
                    <el-form-item label="お知らせ" prop="noticeTitle">
                        {{ form.noticeTitle }}
                    </el-form-item>
                </el-col>
                <el-col :span="12" :offset="2">
                  <div>
                    <el-form-item label="投稿日" prop="createTime">
                        {{ form.createTime }}
                    </el-form-item>
                  </div>
                </el-col>
                <el-col :span="10">
                  <div>
                    <el-form-item label="お知らせタイプ" prop="noticeType" style="margin-left: -3em;">
                      {{ form.noticeType == "0" ? "メンテナンス" : "お知らせ"}}
                      
                    </el-form-item>
                  </div>
                </el-col>
                <el-col :span="12" :offset="2">
                  <el-form-item label="有効期限" prop="validTime" style="margin-left: -1em;">
                    {{ form.validTime[0] !== undefined ? form.validTime[0] : ''}} {{ form.validTime[0] === undefined && form.validTime[1] === undefined ? '' : '～'}}　{{ form.validTime[1] !== undefined ? form.validTime[1] : ''}}
                  </el-form-item>
                </el-col>
                
                </el-row>
                <el-row>
                <el-col :span="24">
                    <el-form-item label="内容" label-width="80px">
                       <div style="width: 100%; word-wrap: break-word;">{{ form.noticeContent }}</div>
                    </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-col>
        </el-row>
        
         <template #footer>
            <div class="dialog-footer">
               <el-button v-if="!editNotice" @click="cancel" class="buttonShadow">×　閉じる</el-button>
            </div>
         </template>
      </el-drawer>
  </cardShadow>

</template>

<script setup>
import { reactive,onMounted } from 'vue'
import { dashBoardlistNotice, getNotice } from "@/api/system/notice"
import {SYS_NOTICE_TYPE} from '@/utils/const'
import { parseTime } from '@/utils/ruoyi'
import useUserStore from "@/store/modules/user";
import GovSummay from '@/components/DashBoard/GovSummay.vue'
import ApplicationSummary from '@/components/DashBoard/ApplicationSummary.vue'


const data = reactive({
    form: {}
});
const router = useRouter();
const isVisible = ref(false);
const noticeList = ref([]);
const allSumary=ref({})
const chkSumary=ref({})
const currentUserRoleKey = useUserStore().roles[0]
const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin' || currentUserRoleKey=='bpo';
const summaryList =ref([])
const { form } = toRefs(data);
const open = ref(false);
const title = ref("");
const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  add: perms.indexOf('system:service:list') != -1 && currentUserRoleKey !== 'bpo' ? true : false,
})



const handleSearch = () => {
        console.log(searchForm.keyword);
        console.log('submit!')
    }
const handleView = (index, row) => {
        isVisible.value = !isVisible.value;
        console.log(index, row)
    }
const handleClick = (operation) => {

        if(operation=='application'){
            router.push("/application/operations/index" )
        }else if(operation=='history'){
            router.push("/application/index?enforceOcr=0" )
        }else if(operation=='result'){
            router.push("/application/index?autoReview=0" )
        }
    }
onMounted(() => {

    dashBoardlistNotice().then(response => {
        const notices = response.rows.map(item=>{
            return {
                noticeId: item.noticeId,
                content:item.noticeContent,
                createdTime: parseTime(item.createTime, '{y}.{m}.{d}'),
                typeName:item.noticeType==SYS_NOTICE_TYPE.MANTANCE?'メンテナンス':'お知らせ'
            }
        })
    noticeList.value.push(...notices)    
  });
})   

/** キャンセル */
function cancel() {
  open.value = false;
}

/** リセット */
function reset() {
  form.value = {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    validTime: undefined,
    createTime: undefined,
    status: "0"
  };
  //proxy.resetForm("noticeRef");
}

/** お知らせ編集 */
function handleNoticeView(row) {
  reset();
  const noticeId = row.noticeId;
  getNotice(noticeId).then(response => {
    form.value = response.data;
    form.value.validTime = [response.data.validTimeStart, response.data.validTimeEnd];
    open.value = true;
    title.value =  status === 'edit' ? "お知らせ編集" : "お知らせ詳細情報";
  });
}

</script>

<style scoped lang="scss">
    .box{
        width: 100%;
        padding: 15% 5rem;
    }
    .client{
        width: 100%;
    }
    .client-item{
        margin: 1rem 0;
    }
    .button-box{
        margin-bottom: 1.5rem;
    }
    .button {
        background-color: #385C8D;
        color: #ffffff;
        border: none;
        text-align: center;
        width: 30%;
        padding: 2.4rem 0;
        font-size: 1.2rem;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .button:hover {
        background-color: #2d466d;
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }

    .button:active {
        background-color: #2d466d;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .notice-box{
        width: 100%;
        border: 1px solid #479E58;
        margin-bottom: 1.5rem;
    }
    .notice-title, .upload-title, .finished-title, .examination-title{
        padding: 0 2rem;
        font-size: 20px;
        background-color: #479E58;
        color: #fff;
    }
    .notice-other{
        margin-right: 1rem;
        font-size: 18px;
        color: #97a8be;
        cursor: pointer;
        position: relative;
    }
    .notice-other::after {
        content: '>>';
        color: #97a8be;
        margin-left: 0.5rem;
    }
    .notice-item{
        margin-left: 1rem;
        color: #5C5C5C;
    }
    .notice-item-title{
        vertical-align: baseline;
        text-align: center;
        height: 1.8rem;
        line-height: 1.8rem;
        font-weight: 700;
        color:#7B7B7B;
        background-color:#e0e0e0;
        width:10rem;
        display: inline-block
    }
    .notice-content{
        width: 100%;
        margin-top: 1rem;
    }
    .notice-content li{
        width: 50rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        
        margin-bottom:5px
    }
    .upload-box{
        width: 31%;
        margin-right: 3.5%;
        height: 14rem;
        border: 1px solid #479E58;
    }
    .upload-content li{
        display: block;
        margin: 0.5rem 0;
        padding-right: 3rem;
    }
    .finished-box{
        width: 31%;
        height: 14rem;
        border: 1px solid #479E58;
    }
    .content-mt{
        margin-top: 2.5rem;
    }
    .finished-content li{
        display: block;
        margin: 0.5rem 0;
        padding-right: 3rem;
    }
    .examination-box{
        width: 100%;
        border: 1px solid #479E58;
    }
    .examination-content{
        margin-top: 1rem;
    }
    .examination-content li span{
        text-decoration: underline;
        cursor: pointer;
    }
    .item-title{
        margin: 0.5rem 0.5rem 0 0;
        padding-left: 3rem;
        background-color: #E7E1DB;
        width: calc(50% - 0.5rem);
    }
    .manage-item-title{
        margin: 0.5rem 0.5rem 0 0;
        padding-left: 3rem;
        background-color: #FFEFCE;
        width: calc(50% - 0.5rem);
    }
    .item-content{
        width: 50%;
    }
    .item-content div{
        padding-left: 3rem;
        height: 4rem;
        line-height: 4rem;
        background-color: #faf8f6;
        margin: 0.5rem 0;
    }
    .item-title span{
        color: red;
    }
    .item-content span{
        color: red;
    }
    .selected-row {
        background-color: #f0f0f0; /* 選択した行のbackground-colorを変更する */
    }
    .notice {
        background-color: unset!important;
    }
   
</style>
<style>
.notice input:disabled {
    background-color:#fff!important;
  }
.notice .el-input.is-disabled .el-input__wrapper {
    background-color: #fff!important;
    color: var(--el-text-color-regular)!important;
}
.notice .el-range-editor.is-disabled {
    background-color: #fff!important;
}
.notice .el-select__wrapper.is-disabled {
    background-color: #fff!important;
}
.notice .el-textarea .el-input--default .is-disabled {
    background-color: #fff!important;
}
.notice .el-textarea.is-disabled .el-textarea__inner {
    background-color: #fff!important;
}
.note .el-input .is-disabled  {
    color: var(--el-text-color-regular)!important;
}
</style>

