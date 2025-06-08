<template>

<el-row>
  <el-col :offset="4" :span="16">
      <el-form ref="userRef" :model="user" :rules="rules" label-width="250px" style="width:80%;">
        <el-form-item label="職員番号" prop="userName" sortable>
          <el-input v-model.trim="user.userName" :disabled="mode=='view' || mode=='edit'" maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="氏名" prop="name" sortable>
          <el-input v-model="user.name" :disabled="mode=='view' || mode=='edit'" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="所属自治体" prop="govId" v-if="isAdmin">
          <el-select 
              v-model="user.govId" 
              filterable 
              remote
              :remote-method="searchGov"
              :disabled="mode=='view' || mode=='edit' || !isAdmin || !showGov || userId === self"
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

        <el-form-item label="権限" prop="roleId">
          <el-select v-model="user.roleId" clearable :disabled="mode=='view' || mode=='edit' || (userId === self && mode !== 'add') " placeholder="" @change="change">
            <el-option v-for="userRole in roleList" :key="userRole.roleId" :label="userRole.roleName"
              :value="userRole.roleId" :selected="userRole.roleId == user.roleId">
              
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="利用可否" prop="status">
          <el-switch v-model="user.status" style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" :disabled="mode=='view'"/>
        </el-form-item>
        <el-form-item label="パスワード変更" prop="status" v-if="mode=='edit'">
          <el-switch v-model="changeStatus" style="--el-switch-on-color: #13ce66" />
        </el-form-item>

        <el-form-item label="現在のパスワード" prop="oldPassword" v-if="showOldPassword">
          <el-input v-model="user.oldPassword" placeholder="現在のパスワード" type="現在のパスワードを入力してください" show-password />
        </el-form-item>

        <el-form-item label="新しいパスワード" prop="newPassword" v-if="showPassword">
          <el-input v-model="user.newPassword" show-password/>
        </el-form-item>
        <el-form-item label="パスワードを確認する" prop="confirmPassword"  v-if="showPassword">
          <el-input v-model="user.confirmPassword" type="password" show-password/>
        </el-form-item>
      </el-form>
  </el-col>
</el-row>
<el-row justify="right">
  <el-button class="buttonShadow" v-if="mode=='view'" @click="close">×　閉じる</el-button>
  <el-button class="buttonShadow" v-if="mode!='view'" @click="close">キャンセル</el-button>
  <el-button class="buttonShadow" v-if="mode!='view'" type="primary" @click="checkRoleId" :disabled="saveDisbale">保存</el-button>
</el-row>
<el-dialog v-model="confirmOpen" width="820px" append-to-body>
  <cardShadow>
    <template #header-title>
      {{ title }}
    </template>
    <el-form ref="jobRef" :model="confirmData" :rules="rules" label-width="180px">
      <el-row>
          <el-col :span="24">
            <el-form-item label="パスワード" prop="password">
              <el-input type="password" v-model="confirmData.password" placeholder="パスワードを入力してください" />
            </el-form-item>
          </el-col>
        </el-row>
    </el-form>
      <div class="dialog-footer" style="display: flex; justify-content: end">
         <el-button @click="cancelCheckPWD">キャンセル</el-button>
         <el-button type="primary" @click="checkPWD">確認</el-button>
      </div>
  </cardShadow>
</el-dialog>

</template>

<script setup>
import { onMounted, reactive, ref ,computed } from "vue";
import cardShadow from "@/components/Customized/cardShadow.vue";
import { listRole } from "@/api/system/role";
import {getUser ,updateUser,addUser, checkPassword, editOnlySelf} from "@/api/system/user";
import { listGovByName,getGov } from "@/api/system/gov";
import {SYSUSER_STATUS} from '@/utils/const';
import useUserStore from '@/store/modules/user';
import {ROLE_GROUP,ROLE_KEY} from '@/utils/const'


const props = defineProps(['userId','mode','roleId', 'self', 'userRoleId'])
const self = ref(props.self)

const emit = defineEmits(['close'])

const { proxy } = getCurrentInstance();

const changeStatus = ref(false)
const userStore = useUserStore();
const confirmOpen = ref(false);
const title = ref("続行するには、管理者のユーザー名とパスワードを入力してください");
const user = reactive({
  id: null,
  userName: null,
  roleId: null,
  status: null,
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});

const confirmData = ref({
  password: null
})

const userId = props.userId
const mode = props.mode
const roleId=props.roleId
const currentUserRoleKey = useUserStore().roles[0]
const selfRoleId=ROLE_KEY[currentUserRoleKey === 'bpo' ? 'BPO' : currentUserRoleKey]


// console.log("currentUserRoleKeycurrentUserRoleKeycurrentUserRoleKey ", currentUserRoleKey);
const showOldPassword = computed(() => {
  return mode=='edit' && changeStatus.value && ((selfRoleId > props.userRoleId) || userId === self.value)
})
const showPassword =  computed(() => {
  return mode=='edit' && changeStatus.value || mode=='add'
})
const userRef  = ref();

const change = (id) => {
  if (id < 3) {
    userRef.value.clearValidate("govId");
    showGov.value = false;
    user.govId = null;
  }else {
    showGov.value = true;
    showGov.value = true;

  }
}

const govOptions = ref([])
const saveDisbale =ref(false)
const roleList = reactive([])
const nextPage = ref(false);


const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'
const showGov = ref( isAdmin && props.userRoleId <=2 ? mode === 'add' ? true : false : true);
const data = reactive({
    queryParams: {
      pageNum: 1,
      pageSize: 10,
      name: null
    }
});
const { queryParams } = toRefs(data);
const element = ref(null);
onMounted(() => {
  confirmData.value.password = null;
  getUserInfo(userId)
  let roles = null;
  setTimeout(() => {
    element.value = document.querySelectorAll('.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap')[1];
  if (element.value !== undefined) {    
      element.value.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = element.value;
        const scrollDistance = scrollHeight - scrollTop - clientHeight;
        if (scrollDistance <= 50) {
            loadmore();
        }
      })
    }
  }, 100)

 
  
  listRole().then(res => {
    if ( currentUserRoleKey === 'SCFTAdmin' ) {
      roles = userStore.id === props.userId && mode !='add' ? res.rows.filter(e=> e.roleId===roleId) : res.rows.filter(e=> e.roleId>=roleId)
      
    }else {
      roles = userStore.id === props.userId && mode !='add'? res.rows.filter(e=> e.roleId===roleId) : res.rows.filter(e=> e.roleId>roleId)
      // console.log("rolesroles222 ", roles, props.userId)
    }
   
    if(roleId){
      roleList.push(...roles)
    }else {
      roleList.push(...res.rows)
    }
    
  })

})
watch(() => open)

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    saveDisbale.value=true
    callback(new Error("新しいパスワードとパスワードの確認が一致しません。再度入力してください。"));
  } else {
    saveDisbale.value=false
    callback();
  }
};
const checkUserName = (rule, value, callback) => {
  if (user.userName.length > 50) {
    callback(new Error("文字数を50文字以内にしてください。"));
  } else {
    callback();
  }
}
const checkGov =  (rule, value, callback) => {
  if ((value ===  null || value === ''  || value === undefined ) && (user.roleId > 2 || user.roleId === null)) {
    return callback(new Error("自治体を入力してください。"));
  } else {
    return callback();
  }
}
const rules = ref({
  userName:[
    { required: true, message: "職員番号を入力してください。", trigger: "blur" },
    { validator: checkUserName, message: "文字数を50文字以内にしてください。", trigger: "blur" }
  ],
  name:[
    { required: true, message: "氏名を入力してください。", trigger: "blur" },
    { max: 30, message: "文字数を30文字以内にしてください。", trigger: "blur" }
  ],
  govId:[{ required: true, validator: checkGov, message: "自治体を入力してください。", trigger: "change" }],
  roleId:[{ required: true, message: "権限を選択してください", trigger: "change" }],
  oldPassword: [{ required: true, message: "現在のパスワードを入力してください。", trigger: "blur" }],
  newPassword: [{ required: true, message: "新しいパスワードを入力してください。", trigger: "blur" }, { min: 6, max: 20, message: "6文字以上20文字以内で入力してください。", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "新しいパスワードを再入力してください。", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

function checkPWD() {
  checkPassword(confirmData.value.password).then((response) => {
    if (response.code === 200) {
      if(userId &&  mode !== 'add'){
        // ユーザー更新
        handleUpdateUser()
      }else {
        handleAddUser()
      } 
    }
  })

}

function cancelCheckPWD() {
  confirmData.value.password = null;
  confirmOpen.value = false;
}

function checkRoleId() {
  
  if (
    userStore.id !== props.userId &&
    currentUserRoleKey === 'SCFTAdmin' &&
    user.roleId == 1

  ) {
    proxy.$refs["userRef"].validate(valid => {
      if (valid) {
         confirmOpen.value = true;
      }
    });
  } else {
    submit();
  }
}

/** 保存処理 */
function submit() {
  // console.log("mode, ", mode);
  proxy.$refs["userRef"].validate(valid => {
   if (valid) {
      if(userId &&  mode !== 'add'){
        // ユーザー更新
        handleUpdateUser()
      }else {
        handleAddUser()
      } 
    } else {
      //console.log("11111111 ", valid);
    }
  })
};
/** 閉じる処理 */
function close() {
  self.value = null;
  showGov.value = true;
  element.value = null;
  emit('close')
};

const getUserInfo = (userId) => {
  if (userId) {
    getUser(userId).then(response => {
      const resUer = response.data
      const roleIds = resUer.roles.map(item=>item.roleId)
      if (roleIds && mode !== 'add') {
        user.roleId = roleIds[0]
      }
      if (mode === 'add') {
        user.govId=resUer.govId
      }else {
        user.id = resUer.userId
        user.govId=resUer.govId
        user.userName = resUer.userName
        user.name = resUer.name
        user.status = resUer.status == 0
       
      }
      if(user.govId){
          initGovOptions(user.govId)
        }
     
    })
  }

}

// ユーザー更新
const handleUpdateUser = () =>{
  const data = {}
  data.userName=user.userName
  data.name = user.name
  data.govId=user.govId === null || user.govId === undefined ? null : user.govId
  data.userId  = props.userId
  // 0利用可能
  data.status = user.status?  SYSUSER_STATUS.using: SYSUSER_STATUS.stop
  data.oldPassword = user.oldPassword
  data.roleIds = [user.roleId]
  if(changeStatus){
    data.password = user.newPassword
  }
  if (props.self !== undefined) {
    editOnlySelf(data).then(()=>{
        proxy.$modal.msgSuccess("更新成功しました")
        reset()
        emit('close')
     })
  }else {
    updateUser(data).then(()=>{
      proxy.$modal.msgSuccess("更新成功しました")
      reset()
      emit('close')

    })
  }

}

const handleAddUser = ()=>{
  const data = {}
  //console.log(user.govId);
  data.govId = user.govId === null || user.govId === undefined ? null : user.govId
  data.userName = user.userName
  data.name = user.name
  data.status = user.status?  SYSUSER_STATUS.using: SYSUSER_STATUS.stop
  data.roleIds = [user.roleId]
  data.password = user.newPassword

  addUser(data).then(()=>{
    proxy.$modal.msgSuccess("新規成功しました")
    reset()
    emit('close')

  })

}

const reset = ()=>{
  const resetUser=
  {
  id: null,
  userName: null,
  roleId: null,
  status: null,
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
}
confirmData.value.password = null;
Object.assign(user,resetUser)
}

const searchGov = (query) => {
    if (
        (user.govId === null || user.govId === undefined)
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
const loadmore = () => {
  //console.log("loadmore")
    if (nextPage.value) {
        queryParams.value.pageNum += 1;
        //searchGovStep2();
    }
}

const  initGovOptions = (govId)=>{
  getGov(govId).then( res =>{
    govOptions.value =[
      {value:govId,label:res.data.name}
    ]
  })
}


</script>
