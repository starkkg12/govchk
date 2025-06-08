<template>
  <div class="navbar">
    <hamburger v-show="false" id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container"  />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
<!--      <template v-if="appStore.device !== 'mobile'">-->
<!--        <header-search id="header-search" class="right-menu-item" />-->

<!--        <screenfull id="screenfull" class="right-menu-item hover-effect" />-->

<!--        <el-tooltip content="レイアウト" effect="dark" placement="bottom">-->
<!--          <size-select id="size-select" class="right-menu-item hover-effect" />-->
<!--        </el-tooltip>-->
<!--      </template>-->
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
           {{ userStore.name }}
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <router-link to="/user/profile">
                <el-dropdown-item>パーソナルセンター</el-dropdown-item>
              </router-link> -->
              <el-dropdown-item command="password">
                <el-icon><Unlock /></el-icon><span>パスワードリセット</span>
              </el-dropdown-item>
              <!-- <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>レイアウト設定</span>
              </el-dropdown-item> -->
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon><span>ログアウト</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
  <!-- <el-drawer v-model="showPassWord">
    <resetPwd :resetPWLogout="true"/>
  </el-drawer>  -->
  <el-drawer  v-model="showPassWord" width="600px" size="90%" append-to-body>
    <h1>{{ title }}</h1>
    <userEdit :userId="userId" :self="userId" :userRoleId="roleId" @close="handleClose" v-if="showPassWord"  :mode="mode" :roleId="roleId" ></userEdit>
 </el-drawer>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import resetPwd from "../../views/system/user/profile/resetPwd";
import userEdit from  "../../views/system/user/profile/userEdit.vue";
import {ROLE_GROUP,ROLE_KEY} from '@/utils/const'


import Cookies from 'js-cookie'

const router = useRouter();
const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const showPassWord = ref(false)
const userId =ref(null)
const title =ref(null)
const mode = ref(null)
const currentUserRoleKey = useUserStore().roles[0]
const roleId=ROLE_KEY[currentUserRoleKey === 'bpo' ? 'BPO' : currentUserRoleKey]


function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      logout();
      break;
  　case "password":
      mode.value = "edit"
      title.value = "ユーザーアカウント 変更"
      userId.value = userStore.id;
      showPassWord.value = true;
      break;
    default:
      break;
  }
}

function handleClose(){
  showPassWord.value=false
  mode.value=null
}

function logout() {
  const eltable = document.getElementsByClassName("el-table");
  if (eltable !== undefined && eltable.length > 0) {
    eltable[0].style.setProperty('pointer-events', 'none');
    eltable[0].style.setProperty('z-index', '0');
  }
  ElMessageBox.confirm('ログアウトしてもよろしいですか？', '', {
    confirmButtonText: '確認',
    cancelButtonText: 'キャンセル',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index';
    })
  }).catch(() => { 
    if (eltable !== undefined && eltable.length > 0) {
      eltable[0].style.setProperty('pointer-events', '');
      eltable[0].style.setProperty('z-index', 'unset!important');
    }
  });
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout');
}
</script>

<style lang='scss' scoped>
.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 20px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        line-height: 40px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
