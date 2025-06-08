<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" label-width="180px" style="width:50%;">
      <el-form-item label="現在のパスワード" prop="oldPassword">
         <el-input v-model="user.oldPassword" placeholder="現在のパスワード" type="現在のパスワードを入力してください" show-password />
      </el-form-item>
      <el-form-item label="新しいパスワード" prop="newPassword">
         <el-input v-model="user.newPassword" placeholder="新しいパスワード" type="新しいパスワードを入力してください" show-password />
      </el-form-item>
      <el-form-item label="パスワードを確認する" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" placeholder="新しいパスワードを再入力してください" type="password" show-password/>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close"></el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserPwd } from "@/api/system/user";

const { proxy } = getCurrentInstance();
const prop = defineProps(['resetPWLogout'])

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("新しいパスワードが異なります"));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: "現在のパスワードを入力してください", trigger: "blur" }],
  newPassword: [{ required: true, message: "新しいパスワードを入力してください", trigger: "blur" }, { min: 6, max: 20, message: "6文字以上20文字以内を入力してください", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "新しいパスワードを再入力してください", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

/** 保存処理 */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess("パスワード変更されました");
      });
    }
  });
};
/** 閉じる処理 */
function close() {
  proxy.$tab.closePage();
};
</script>
