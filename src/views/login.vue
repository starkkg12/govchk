<template>
  <div class="login">
    <el-form ref="loginRef" v-if="!openPWDForgetWindow && !resetPWDFlag" :model="loginForm" :rules="loginRules" class="login-form">
      <img src="/src/assets/logo/logob.png" style="width:350px">      
      <el-form-item prop="showId">
        <el-input
          v-model="loginForm.showId"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="団体コード"
        >
          <template #prefix><el-icon><OfficeBuilding /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="アカウント"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="パスワード"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="検証コード"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">団体コードを次回以降も保持する</el-checkbox>
      <el-form-item v-if="false">
        <a href="#" @click="openPWDReset" >パスワードを忘れた方</a>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">ログイン</span>
          <span v-else>ログイン中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">今すぐサインアップしてください</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--- パスワード忘れ方-->
    <el-form v-if="openPWDForgetWindow" :modeel="resetForm" class="login-form">
      <img src="/src/assets/logo/logob.png" style="width:350px">
      <el-form-item v-if="!sendForgetPWEmailSuccess" label="ご登録済みメールアドレスの入力" class="rest-el-form-item-label" prop="mail">
        <el-input
          v-model="resetForm.email"
          type="text"
          size="large"
          style="width:100%"
          auto-complete="off"
          v-bind:class="{is_error: add_error}"
        >
        </el-input>
        <el-alert v-if="add_error" title="errorMsg" type="error" :closable="false"></el-alert>
      </el-form-item>
      <el-form-item v-if="!sendForgetPWEmailSuccess" class="sendForgetPWDBtn" style="width:100%; display: flex; justify-content: center!important">
          <el-button
            size="large"
            type="primary"
            style="width:40%;"
            @click="sendMail"
          >
            <span >メールを送信する</span>
          </el-button>
          <el-button
            size="large"
            type="primary"
            style="width:40%;"
            @click.prevent="callback"
          >
            <span >キャンセル</span>
          </el-button>
      </el-form-item>
      <el-form-item v-if="sendForgetPWEmailSuccess">
        パスワード再設定用のメールを送信しました<br >メールに記載されているURLにアクセスし、パスワードの再設定を完了してください。
      </el-form-item>
      <el-form-item class="sendForgetPWDBtn" v-if="sendForgetPWEmailSuccess" style="width:100%; display: flex; justify-content: center">
        <el-button
          size="large"
          style="width:40%;"
           @click="callback"
        >
        <span >ログインページへ</span>
      </el-button>
      </el-form-item>
    </el-form>
    <el-form ref="pwdRef" v-if="resetPWDFlag" :rules="rules" label-width="180px" class="login-form">
      <img src="/src/assets/logo/logob.png" style="width:350px">
      <el-form-item label="新しいパスワード" prop="newPassword">
          <el-input v-model="user.newPassword" placeholder="新しいパスワード" type="新しいパスワードを入力してください" show-password />
        </el-form-item>
        <el-form-item label="新しいパスワード(確認)" prop="confirmPassword">
          <el-input v-model="user.confirmPassword" placeholder="新しいパスワードを再入力してください" type="password" show-password/>
        </el-form-item>
        <el-form-item>
         <el-button type="primary" @click="submit">保存</el-button>
        </el-form-item>
    </el-form>
    <el-form v-if="tokenErr" label-width="180px" class="login-form">
      <img src="/src/assets/logo/logob.png" style="width:350px">
      <el-form-item >
        無効なURLです。パスワード再設定の手続きをやり直してください。
      </el-form-item>
      <el-form-item class="sendForgetPWDBtn" style="width:100%; display: flex; justify-content: center">
        <el-button
          size="large"
          style="width:40%;"
           @click="callback"
        >
        <span >ログインページへ</span>
      </el-button>
      </el-form-item>
    </el-form>
    <!--  終わり  -->
    <div class="el-login-footer">
      <span>Copyright © 2024 DXCompass All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg, sendForgetPWEmail, checkRestPWDToken } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import resetPwd from "./system/user/profile/resetPwd";

const userStore = useUserStore()
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();


const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  showId:'',        //団体コード
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "アカウントを入力してください" }],
  password: [{ required: true, trigger: "blur", message: "パスワードを入力してください" }],
  code: [{ required: true, trigger: "change", message: "検証コードを入力してください" }]
};

const resetForm = ref({
  email: '',
})
const add_error = ref(false);
const errorMsg = ref('');
const codeUrl = ref("");
const loading = ref(false);
const openPWDForgetWindow = ref(false);
const sendForgetPWEmailSuccess = ref(false);
const resetPWDFlag = ref(false);
const tokenErr = ref(false)
// 検証コードのスイッチ
const captchaEnabled = ref(true);
// 登録スイッチ
const register = ref(false);
const redirect = ref(undefined);

const user = reactive({
  newPassword: undefined,
  confirmPassword: undefined
});

const rules = ref({
  newPassword: [{ required: true, message: "新しいパスワードを入力してください", trigger: "blur" }, { min: 6, max: 20, message: "6文字以上20文字以内を入力してください", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "新しいパスワードを再入力してください", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

function equalToPassword (rule, value, callback) {
  if (user.newPassword !== value) {
    callback(new Error("新しいパスワードが異なります"));
  } else {
    callback();
  }
};
function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 次回から自動的にログインする
      if (loginForm.value.rememberMe) {
        //Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("showId", loginForm.value.showId, { expires: 30 });
        //Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        //　ログイン情報の保存が解除された場合
        Cookies.remove("username");
        Cookies.remove("showId");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // ユーザーストアにログインアクションを実行
      userStore.login(loginForm.value).then(() => {
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        // 認証コードの再取得
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  
  if (
    router.currentRoute.value.query.rt &&
    router.currentRoute.value.query.rt.trim() !== ''
  ) {
    resetPWDFlag.value = true;
    openPWDForgetWindow.value = false;
    sendForgetPWEmailSuccess.value = false;
    let form = new FormData();
    form.append("resetpwdtoken", router.currentRoute.value.query.rt)
    checkRestPWDToken(router.currentRoute.value.query.rt).then(response => {
      if (response.msg === "token fail") {
        tokenErr.value = true;
        resetPWDFlag.value = false;
        openPWDForgetWindow.value = false;
        sendForgetPWEmailSuccess.value = false;
      } else {
        tokenErr.value = false;
        resetPWDFlag.value = false;
        openPWDForgetWindow.value = false;
        sendForgetPWEmailSuccess.value = false;
      }
    })
  }else {
    captchaEnabled.value = false;
    // getCodeImg().then(res => {
    //   captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    //   if (captchaEnabled.value) {
    //     codeUrl.value = "data:image/gif;base64," + res.img;
    //     loginForm.value.uuid = res.uuid;
    //   }
    // });
  }
}

function getCookie() {
  // const username = Cookies.get("username");
  const showId = Cookies.get("showId");
  // const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: '', //username === undefined ? loginForm.value.username : username,
    showId: showId === undefined ? loginForm.value.showId : showId,
    password: '',//password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

function openPWDReset() {
  sendForgetPWEmailSuccess.value = false;
  openPWDForgetWindow.value = true;

}
function sendMail() {
  // sendmail
  let form = new FormData();
  form.append("email", resetForm.value.email)
  sendForgetPWEmail(form).then((response) => {
    if (response.code == 200) {
      sendForgetPWEmailSuccess.value = true;
    }
  });
}
function callback() {
  resetForm.value.email = '';
  openPWDForgetWindow.value = false;
  sendForgetPWEmailSuccess.value = false;
}
getCode();
getCookie();

</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}
.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 15px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 14px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
.rest-el-form-item-label {
  display: unset!important;
}

.is_error input {
  border-color: #f56c6c !important;
}
</style>
<style>
.sendForgetPWDBtn > .el-form-item__content {
  margin-top:1rem;
  justify-content:center!important;
} 
</style>

