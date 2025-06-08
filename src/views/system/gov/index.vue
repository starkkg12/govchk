<template>
  <cardShadow>
    <template #header-title>
      自治体管理
    </template>
    <el-form :model="queryParams" :rules="searchRules" ref="queryRef" :inline="true" v-show="showSearch"
      label-width="100px">
      <el-row v-if="perms2.query === true && isGovOperator">
        <el-col :span="8">
          <el-form-item label="自治体名" prop="name" style="width: 100%">
            <!-- <el-input v-model="queryParams.name" clearable @keyup.enter="handleQuery" style="width: 100%" /> -->
            <el-select v-model="queryParams.id" filterable remote  placeholder="自治体名を入力ください" :remote-method="searchGov" :popper-append-to-body="false" v-down="loadmore" clearable @clear="clearGovId">
              <el-option v-for="item in govOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
          </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" align="end" style="padding-left: 20px;">
          <el-form-item label="所在地" prop="address" style="width: 100%">
            <el-input v-model="queryParams.address" clearable @keyup.enter="handleQuery" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8" align="end">
          <el-form-item>
            <el-button class="buttonShadow" icon="Refresh" @click="resetQuery" size="normal">リセット</el-button>
            <el-button class="buttonShadow" type="primary" icon="Search" @click="handleQuery" size="normal">検索</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="perms2.query === true && isGovOperator">
        <el-col :span="15">
          <el-row>
            <el-col :span="24" v-if="perms2.query === true">
              <el-form-item label="作成日" prop="startTime" class="first_picker">
                <el-date-picker clearable @blur="dataCheck" v-model="queryParams.startTime" type="date"
                  value-format="YYYY-MM-DD" class="narrowDatePicker">
                </el-date-picker>
                <span style="padding: 0 6px;">～</span>
              </el-form-item>
              <el-form-item prop="endTime">
                <el-date-picker clearable @blur="dataCheck" v-model="queryParams.endTime" type="date"
                  value-format="YYYY-MM-DD" class="narrowDatePicker">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6" v-if="isAdmin" style="display: grid;justify-content: end">
              <el-form-item>
                <el-button type="primary" icon="Search" @click="showPlan()" size="normal">プラン追加</el-button>
              </el-form-item>
            </el-col> -->
          </el-row> 
        </el-col>
        <el-col :span="9" v-if="showUploading" align="end" min-width="200px">
          <el-form-item>
            <el-button type="info" icon="Upload" class="buttonShadow" @click="$refs.file.click()" >一括登録を実行</el-button>
            <el-dropdown>
              <el-button class="buttonShadow" icon="Download" type="warning">
                ダウンロード
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Download" @click="handleExport">データダウンロード</el-dropdown-item>
                  <el-dropdown-item icon="Download" @click="handleExportSample">雛形ダウンロード</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-form-item>
       </el-col>
      </el-row>
      
      <el-row v-if="perms2.query && isGovOperator">
        <el-col :span="6">
          <el-form-item label="利用可否" prop="status">
            <el-select v-model="queryParams.status" clearable style="width:120px" placeholder="">
              <el-option label="" value="" />
              <el-option label="はい" value="0" />
              <el-option label="いいえ" value="1" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="!isGovOperator && currentUserRoleKey == 'govAdmin' ">
        <el-col :span="24" align="end" min-width="200px" style="display: flex; justify-content: end;">
          <el-form-item>
            <el-button class="buttonShadow" type="primary" icon="Search" @click="showPlan()" size="normal">プラン追加</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <input type="file" ref="file" style="display:none" @change="handleImport" accept=".xls,.xlsx"  @click="$event.target.value=''" />
    </el-form>
    <el-row :gutter="10" class="mb8" v-if="perms2.add">
      <el-col :span="1.5">
        <el-button class="buttonShadow" type="primary" plain icon="Plus" @click="handleAdd" size="normal">新規</el-button>
      </el-col>
      
      <!-- <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <el-table v-loading="loading" :data="govList" @selection-change="handleSelectionChange" @sort-change="sortData">
      <el-table-column label="自治体ID" align="center" prop="showId" sortable width="120px">
        <template #default="scope">
          <div style="width: 100%; text-align: left;">{{ scope.row.showId }} </div>
        </template>
      </el-table-column>
      <el-table-column label="自治体名" align="center" prop="name">
        <template #default="scope">
          <div style="width: 100%; text-align: left;">{{ scope.row.name }} </div>
        </template>
      </el-table-column>
      <el-table-column label="所在地" align="center" prop="address">
        <template #default="scope">
          <div style="width: 100%; text-align: left;">{{ scope.row.address }} </div>
        </template>
      </el-table-column>
      <el-table-column label="利用可否" align="center" prop="status" min-width="44px">
        <template #default="scope">
          <el-tag v-if="scope.row.status == 0" type="success">はい</el-tag>
          <el-tag v-else type="danger">いいえ</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="作成日" align="center" prop="createdTime" width="160px" sortable>
        <template #default="scope">
          <div style="white-space: pre-line;">{{ parseTime(scope.row.createdTime, '{y}-{m}-{d} {h}:{i}') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px" align="center" prop="modify">
        <template #default="scope">
          <!--編集 v-hasPermi="['自治体:gov:edit']" -->
          <el-tooltip content="自治体情報編集" placement="top">
            <el-button 
              :disabled="perms2.edit === false"
              link type="primary" icon="Edit" @click="handleUpdateOrView(scope.row, 'edit')"></el-button>
          </el-tooltip>
          
          <el-tooltip content="自治体情報" placement="top" >
            <el-button link type="primary" icon="View"  @click="handleUpdateOrView(scope.row, 'view')"></el-button>
          </el-tooltip>
          <!-- 削除v-hasPermi="['自治体:gov:remove']" -->
          <el-tooltip content="削除" placement="top">
            <el-button 
               :disabled="perms2.remove === false"
               link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
  </cardShadow>

  <!-- 追加、編集ダイアログボックス -->
  <el-drawer v-model="open" width="500px" append-to-body size="90%">
    <h1> {{ title }} </h1>
    <el-row style="margin-top: 5%">
      <el-col :offset="4" :span="8">
        <el-form ref="govRef" :model="form" :rules="rules" label-width="90px" :disabled="!formEdit">
          <el-form-item label="自治体ID" prop="showId">
            <el-autocomplete 
              :disabled="modifyGovId === false" 
              v-model="form.showId" ref="autoRef" 
              :fetch-suggestions="searchGovByShowId" @select="handleSelectGov"
            
              style="width: 100%;" maxlength="10" show-word-limit >
            </el-autocomplete>
            <el-alert title="自治体IDは既に存在しています" type="error" v-if="govExist"></el-alert>
          </el-form-item>
          <el-form-item label="自治体名" prop="name">
            <el-autocomplete :disabled="modifyGovId === false" v-model="form.name"  :fetch-suggestions="searchGovId" @select="handleSelectGov"
              style="width: 100%;" maxlength="100" show-word-limit>
            </el-autocomplete>

          </el-form-item>
          <el-form-item label="所在地" prop="address">
            <el-input v-model="form.address" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="利用可否" prop="status">
            <el-switch v-model="form.status" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              :disabled="!formEdit" @change="statusChange" />
          </el-form-item>
          <el-form-item label="プラン名" prop="plan">
            <!-- <el-autocomplete v-model="form.planName" :fetch-suggestions="searchPlan" @select="handleSelectPaln"
              style="width: 100%;" >
            </el-autocomplete> -->
            <el-select clearable v-model="form.plan" placeholder="プラン名" >
              <el-option v-for="item in planList" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="契約期間" prop="validTime">
            <!-- <el-date-picker v-model="form.validTime" 
               type="daterange" range-separator="～" start-placeholder="開始日"
               @change="dateChange"
              value-format="YYYY-MM-DD" format="YYYY-MM-DD" end-placeholder="終了日">
            </el-date-picker> -->
            <el-date-picker clearable  v-model="form.validTimeStart" type="date" value-format="YYYY-MM-DD"
                class="narrowDatePicker">
            </el-date-picker>
            <span style="padding: 0 6px;">～</span>
            <el-date-picker clearable  v-model="form.validTimeEnd" type="date" value-format="YYYY-MM-DD"
                class="narrowDatePicker">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="請求区分" prop="requestKbn">
            <el-input v-model="form.requestKbn" maxlength="1" show-word-limit />
          </el-form-item>
          <el-form-item label="残りチケット数" prop="remainingTickets" v-if="isAdmin" label-width="135px" style="margin-left: -44px">
            <el-input v-model="form.remainingTickets" />
          </el-form-item>
          <!-- <div class="user_info">
            請求書担当者情報
          </div>
          <el-form-item label="所属部署" prop="department">
            <el-input v-model="form.department" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="メール" prop="email">
            <el-input v-model="form.email" maxlength="100" show-word-limit type="email" />
          </el-form-item>
          <el-form-item label="電話番号" prop="tel">
            <el-input v-model="form.tel" maxlength="100" show-word-limit />
          </el-form-item>-->
          <el-form-item label="自治体概要" prop="describes" label-width="100px;">
            <el-input v-model="form.describes" type="textarea" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="buttonShadow" type="primary" @click="submitForm" v-if="formEdit">確 定</el-button>
        <el-button class="buttonShadow" v-if="formEdit" @click="cancel">キャンセル</el-button>
        <el-button class="buttonShadow" v-if="!formEdit" @click="cancel">×　閉じる</el-button>
      </div>
    </template>
  </el-drawer>
 
  <el-drawer v-model="planShow" width="90%" append-to-body size="90%">
    <plan @closePlan="planShow=false" @getPlanData="getPlanData2"></plan>
  </el-drawer>
</template>

<script setup name="Gov">
import { listGov, getGov, delGov, addGov, updateGov ,checkGovShowId,getDigithPath, delCheck, checkGovName, listGovByName, importData} from "@/api/system/gov";
import { listSysGovListByName, listSysGovListByShowId } from "@/api/system/sysgov";
import { listPaln,getPaln} from "@/api/system/plan";
import {GOV_STATUS} from '@/utils/const'
import cardShadow from "@/components/Customized/cardShadow.vue";
import { messages } from "@/utils/fields";
import { reactive } from "vue";
import plan from './plan/plan.vue';
import usePermissionStore from '@/store/modules/permission';
import useUserStore from "@/store/modules/user";

const govOptions = ref([])

const { proxy } = getCurrentInstance();

const govList = ref([]);
const showUploading = ref(false);
const open = ref(false);
const loading = ref(false); // todo
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const formEdit = ref(true);
const planShow =ref(false)
const startTimeErr = ref(false);
const endTimeErr = ref(false);

const currentUserRoleKey = useUserStore().roles[0]
const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'
const isGovOperator = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin' || currentUserRoleKey=='bpo' || currentUserRoleKey=='BPO'

const perms = JSON.parse(localStorage.getItem('perms'));
const perms2 = ref({
  add: perms.indexOf('system:gov:add') != -1 ? true : false,
  edit: perms.indexOf('system:gov:edit') != -1 ? true : false,
  remove: perms.indexOf('system:gov:remove') != -1 ? true : false,
  query: perms.indexOf('system:gov:query') != -1 ? true : false,
  export:  perms.indexOf('system:gov:export') != -1 ? true : false,
})

const checkTime = (rule, value, callback) => {
  if (queryParams.value.startTime > queryParams.value.endTime) {
    return callback(new Error('入力してください'));
  } else {
    callback();
  }
};



const checkShowId = (rule, value, callback) => {
  var reg1 = /^\d{1,6}-\d{1,3}$/;
  var reg2 = /[^0-9]/g;
  
  if (value !== 'SF' && value.indexOf('WSGOV') <=-1 && reg2.test(value) && !reg1.test(value)) {
    return callback(new Error('正しい自治体ID入力してください。'));
  } else {
    return callback();
  }
}

const clearGovId = () => {
  queryParams.value.id = null;
  queryParams.value.pageNum = 1;
  getList();
}

const checkShowIdExis = (rule, value, callback) => {
  if (
    (value.name !== undefined &&
    value.name[0].fieldValue !== undefined && 
    value.name[0].fieldValue == "") ||
    value === ""
    
  ) {
    return callback();
  } else {
    checkGovShowId(value).then(res=>{
      if(res.data>0){
        if (
          form.value.id === undefined ||
          form.value.id === null ||
          form.value.id != res.data
        ) {
           return callback(new Error('自治体IDは既に存在しています'));
        } else {
          return callback();
        }
      }else {
        return callback();
      }
    })
  }
}
const checkNameExis = (rule, value, callback) => {
 
  if (
    form.value.name === null ||
    form.value.name === ""
    
  ) {
    return callback();
  } else {
    checkGovName(form.value.name).then(res=>{
    if(res.data>0){
        if (
          form.value.id === undefined ||
          form.value.id === null ||
          form.value.id != res.data
        ) {
           return callback(new Error('自治体名は既に存在しています'));
        } else {
          return callback();
        }
    }else {
      return callback();
    }
  })
  }
 
}
const statusChange = () => {
  let nowTimeStamp = new Date().getTime();
  if(
    form.value.validTime && form.value.validTime.length >0 &&
    form.value.validTime[1] !== undefined && form.value.validTime[1] !== null
  ){
    let endTimeStamp = new Date(form.value.validTime[1] + ' 23:59:59').getTime();
    if (nowTimeStamp >= endTimeStamp) {
      console.log("利用不可");
      form.value.status = 1; // 1: 利用不可, 0: 利用可
    }
  }
}

const searchGov = (query) => {
    if (
        (queryParams.value.govId === null || queryParams.value.govId === undefined)
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
      status: null
    }
    listGovByName(query).then(res => {
            const list = res.data
            if (list.length > 0) {
                
                const arr = list.map(item => {
                    return {
                        label: item.name + "( 自治体ID: "+item.showId+" )",
                        value: item.id
                    }
                })
                govOptions.value = govOptions.value.concat(arr);
            }
        })
}

const dateChange = () => {
  let nowTimeStamp = new Date().getTime();
 
  if(
    form.value.validTime && form.value.validTime.length >0 &&
    form.value.validTime[1] !== undefined && form.value.validTime[1] !== null
  ){
    
    let endTimeStamp = new Date(form.value.validTime[1] + ' 23:59:59').getTime();
    if (nowTimeStamp >= endTimeStamp) {
       form.value.status = false; // false: 利用不可(1), true: 利用可(0)
    } else if (
      oldVailTime.value !== undefined &&
      oldVailTime.value !== null &&
      oldVailTime.value[1] !== undefined &&
      oldVailTime.value[1] !== null &&
      endTimeStamp > new Date(oldVailTime.value[1]  + ' 23:59:59').getTime()
    ) {
      // oldVailTime[1] : 前の設定した契約期間の終了日
      form.value.status = true; // false: 利用不可(1), true: 利用可(0)
    }
  }
}

const checkTime2 = (rule, value, callback) => {
  if (form.value.validTimeStart > form.value.validTimeEnd) {
    return callback(new Error('「契約期間まで」に「契約期間から」より未来の日時を設定してください。'));
  } else {
    callback();
  }
};
/** 出力ボタンアクション */
const handleExport = () => {
  proxy.download("system/gov/export", {
    ...queryParams.value,
  }, `自治体管理_${new Date().getTime()}.xlsx`);
}

const handleExportSample = () => {
  proxy.download("system/gov/exportSample", {
    ...queryParams.value,
  }, `自治体管理_${new Date().getTime()}.xlsx`);
}

const handleImport = (e) => {
  let form = new FormData();
  form.append('file', e.target.files[0]);
  proxy.$modal.confirm('ファイル名: "' +e.target.files[0].name+ '"をアップロードしてもよろしいでしょうか？').then(function () {
      return importData(form);
  }).then(() => {
    proxy.$modal.msgSuccess("ファイルアップロード成功しました");
    getList();
  });

}

const data = reactive({
  form: {
    validTimeStart: null,
    validTimeEnd: null,
    remainingTickets: "25",
    name: null
  },
  queryParams: {
    id: null,
    pageNum: 1,
    pageSize: 10,
    name: null,
    startTime: null,
    endTime: null,
    tel: null,
    status: null,
    orderByColumn: null,
    isAsc: 'asc',
  },
  searchRules: {
    name:[
      { max: 100, message: "文字数を100文字以内にしてください。", trigger: "blur"}
    ],
    address:[
      { max: 100, message: "文字数を100文字以内にしてください。", trigger: "blur"}
    ],
    startTime: [
      { validator: checkTime, message:"「作成日まで」に「作成日から」より未来の日時を設定してください。", trigger: "blur" }
    ],
    endTime: [
      { validator: checkTime,  message: "", trigger: "blur"  }
    ]
  },
  rules: {
    validTime:[{ validator: checkTime2, message: "「契約期間まで」に「契約期間から」より未来の日時を設定してください。", trigger: "blur" }],
    showId:[
      { required: true, validator: checkShowId,  message: "自治体IDを入力してください。", trigger: "blur" },
      { validator: checkShowId, message: "正しい自治体ID入力してください。", trigger: "blur" },
      { validator: checkShowIdExis, message: "自治体IDは既に存在しています", trigger: "blur" }
    ],
    name:[
      { required: true, message: "自治体名を選択してください。", trigger: "change" },
      { validator: checkNameExis, message: "自治体名は既に存在しています", trigger: "blur" }
    ],
    address:[
      { required: true, message: "所在地を入力してください", trigger: "blur" },
    ],
    
  }
});



const govExist =ref(false)
const oldVailTime = ref(null);
const { queryParams, form, searchRules, rules } = toRefs(data);

const planList = ref([]);
const modifyGovId = ref(false);


/** リスト取得 */
function getList() {
   loading.value = true;
   listGov(queryParams.value).then(response => {
     govList.value = response.rows;
     total.value = response.total;
     loading.value = false;
   });
}

// キャンセル
function cancel() {
  open.value = false;
  reset();
}

// リセット
function reset() {
  form.value = {
    id: null,
    name: null,
    createdTime: null,
    describes: null,
    tel: null,
    status: null,
    remainingTickets: "25"
  };
  queryParams.value = {
    id: null,
    pageNum: 1,
    pageSize: 10,
    name: null,
    startTime: null,
    endTime: null,
    tel: null,
    status: null,
    orderByColumn: null,
    isAsc: 'asc',
  }
  modifyGovId.value = true;
  proxy.resetForm("govRef");
}

/** 検索処理 */
function handleQuery() {
  proxy.$refs["queryRef"].validate((valid) => {
      if (valid) {
        queryParams.value.pageNum = 1;
        getList();
      }
  });
}

/** リセット処理 */
function resetQuery() {
  proxy.resetForm("queryRef");
  reset();
  handleQuery();
}

// チェックボックス変更する時の処理
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 追加処理 */
function handleAdd() {
  reset();
  formEdit.value = true;
  modifyGovId.value = true;
  open.value = true;
  title.value = "自治体情報 新規";
}

/** 編集処理 */
function handleUpdateOrView(row, type) {
  if (perms2.value.edit === true || type == 'view') {
    reset();
    const _id = row.id || ids.value;
    open.value = true;
    formEdit.value = true;
    if (type == "view") { 
      formEdit.value = false;
      title.value = `${row.name}自治体情報`;
    } else if (type == "edit") {
      formEdit.value = true;
      title.value = `${row.name}自治体情報`;
    } else {
      formEdit.value = true;
      title.value = "  ";
    }
    delCheck(_id).then((response) => {
      if (response.code === 200) {
        modifyGovId.value = response.data == 0 ? true : false;
        getGov(_id).then(response => {
          const editGov = response.data
          editGov.status = response.data.status == GOV_STATUS.YES? true:false
          editGov.validTime=[response.data.validTimeStart, response.data.validTimeEnd]
          oldVailTime.value = editGov.validTime;
          editGov.plan = editGov.plan === 0 ? null : editGov.plan;
          form.value = editGov;
          if(response.data.plan && response.data.plan !== 0 && response.data.plan !== null){
            getPaln(response.data.plan).then(res => {
              if (res.data.id !== undefined) {
                  form.value.planName = response.data.plan === 0 ? null : response.data.plan;
              }
            })
          }
        });
      }
    });
  }
}
 
 function cancelDpass(){
  showDpass.value=false
 }

/** コミット処理 */
async function submitForm() {
  proxy.$refs["govRef"].validate(async (valid) => {
    if (valid) {
      const apiData = {
         ...form.value,
        plan: form.value.plan !== undefined && form.value.plan !== null ? form.value.plan : 0 // 0: ブランなし
      }

      let start,end;
      let splitArr;
      if (
        form.value.validTimeStart !== undefined &&  
        form.value.validTimeStart !== null &&
        form.value.validTimeStart !== ''
      ) {
         splitArr = form.value.validTimeStart.split(' ');
         if (splitArr.length === 2) {
           start = form.value.validTimeStart;
         } else {
            start = splitArr[0] + ' 00:00:00';
         }
      } else {
         start = form.value.validTime !== undefined ? form.value.validTime[0] : ''
      }
      if (
        form.value.validTimeEnd !== undefined &&
        form.value.validTimeEnd !== null &&
        form.value.validTimeEnd !== ''
      ) {
        splitArr = form.value.validTimeEnd.split(' ');
        if (splitArr.length === 2) {
          end = form.value.validTimeEnd;
        } else {
          end = splitArr[0] + ' 23:59:59';
        }
      } else {
        end = form.value.validTime !== undefined ? form.value.validTime[1] : ''
      }

      // if(form.value.validTime && form.value.validTime.length >0 && form.value.validTime[0] !== null ){
      //   apiData.validTimeStart = form.value.validTime[0] + ' 00:00:00';
      //   apiData.validTimeEnd = form.value.validTime[1] !== null && form.value.validTime[1] !== undefined ? form.value.validTime[1] + ' 23:59:59' : null;
      // }       
      apiData.validTimeStart = start;
      apiData.validTimeEnd = end;
        // ０は利用可、１は利用不可
      apiData.status = form.value.status === true ? GOV_STATUS.YES : GOV_STATUS.NO
      if (form.value.id != null) {
        updateGov(apiData).then(response => {
          proxy.$modal.msgSuccess("編集成功");
          open.value = false;
          getList();
        });
      } else {
        addGov(apiData).then(response => {
          proxy.$modal.msgSuccess("新規成功");
          open.value = false;
          getList();
        });   
      }
    }
  });
}

/** 削除処理 */
function handleDelete(row) {
  if (perms2.value.remove === true) {
    const _ids = row.id || ids.value;
    delCheck(_ids).then((response) => {
      if (response.code === 200 && response.data === 0) {
        proxy.$modal.confirm(messages.deleteConfirmation.replace("{0}", row.name)).then(function () {
          return delGov(_ids);
        }).then(() => {
          getList();
          proxy.$modal.msgSuccess("削除成功");
        }).catch(() => { });
      }else {
        alert("既に利用されています、削除できません");
      }
    })
    
  }
}

// プランIDを検索
function searchPlan(planName, cb) {
  const query = {}
  if (planName && planName != 'null') {
    query.planName = planName
  }
  listPaln(query).then(res => {
    const data = res.rows.map(e => {
      return {
        value: e.planName,
        id: e.id
      }
    })
    cb(data)
  })
}
function getPlanData() {
  listPaln({}).then(res => {
    res.rows.map(e => {
      planList.value.push({
          label: e.planName,
          value: e.id
      })
    });
  });
}
function getPlanData2() {
  getPlanData();
  planShow.value = false;
}

function searchGovId(govName,cb) {
  const query = {}
  if (govName && govName != 'null') {
    query.govName = govName;
  }
  listSysGovListByName(query).then(res => {
  // listGov(query).then(res => {
    const data = res.map(e => {
          return {
            value: e.name,  //e.prefectureKanji + (e.cityKanji ? e.cityKanji : ''),
            showId: e.showId
          }
        })
    // const data = res.rows.map(e => {
    //   return {
    //     value: e.name,  //e.prefectureKanji + (e.cityKanji ? e.cityKanji : ''),
    //     showId: e.showId
    //   }
    // })
    //govOptions.value = govOptions.value.concat(data);
    cb(data)
  })
}

function searchGovByShowId(showId, cb) {
  //if (form.value.showId !== undefined) {
    let node = document.querySelectorAll('.el-autocomplete__popper');
    node[0].style.display = 'unset';
    listSysGovListByShowId({showId: form.value.showId }).then(res => {
    //listGov({showId: form.value.showId }).then(res => {
     
       
        const data = res.map(e => {
          return {
            value: e.name,
            showId: e.showId
          }
        })
        cb(data);
    });
  //}
}


function handleSelectGov(item) {
  if (item !==null) {
    form.value.showId = item.showId;
    form.value.name = item.value;
  }
}
function selectGovName(name) {
  form.value.name = name;
  let index  = govOptions.value.findIndex((item) => {
    return item.value === name
  })
  
  if (index) {
    form.value.showId =  govOptions.value[index].showId;
  }
}
function handleSelectPaln(item) {
  if (item) {
    form.value.planName = item.value
    form.value.plan = item.id
  }
}

function dataCheck() {
  if (queryParams.value.startTime > queryParams.value.endTime) {
    startTimeErr.value = true;
    endTimeErr.value = true;
    proxy.$refs["queryRef"].validateField('startTime');
    proxy.$refs["queryRef"].validateField('endTime');
  }
}

function sortData(sort) {
  queryParams.value.orderByColumn = sort.prop;
  queryParams.value.isAsc = sort.order === 'descending' ? "desc" : "asc";
  handleQuery();

}

function showPlan(){
  planShow.value=true
}

watch(() => open.value, () => {
setTimeout(() => {
    const element = document.querySelectorAll('.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap')[1];
    if (element!==null && element !== undefined) {
    element.addEventListener('scroll', () => {
      
      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollDistance = scrollHeight - scrollTop - clientHeight;
      // console.log(scrollDistance);
      if (scrollDistance <= 0) {
          loadmore();
      }
    })
    }
}, 100);
})

const loadmore = () => {
  //console.log("loadmore")
    if (nextPage.value) {
        queryParams.value.pageNum += 1;
        searchGovStep2();
    }
}


getList();
getPlanData();
</script>

<style scoped>
.bottom{
  margin-bottom: 20px;
}
.el-dialog {
  height: auto!important;
}
.el-card.is-always-shadow {
  box-shadow: unset!important;
}
.el-col {
  margin-bottom: unset;
}
.first_picker{
  margin-right:3px
}
:deep(.el-form-item__error) {
  display:inherit;
  min-width: 400px;
}
.user_info{
  font-size: large;
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>