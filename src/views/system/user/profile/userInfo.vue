<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="160px" style="width:50%;">
      <el-form-item label="ニックネーム" prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="携帯電話番号" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item label="Eメール" prop="email">
         <el-input v-model="form.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="性別">
         <el-radio-group v-model="form.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女性</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">×　閉じる</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const form = ref({});
/** TODO ニックネームをユーザー名に変更しますか？電話番号チェック処理が不正 */
const rules = ref({
  nickName: [{ required: true, message: "ニックネームを入力してください", trigger: "blur" }],
  email: [{ required: true, message: "Eメールを入力してください", trigger: "blur" }, { type: "email", message: "正しいEメールを入力してください", trigger: ["blur", "Eメールを入力してください"] }],
  phonenumber: [{ required: true, message: "携帯電話番号を入力してください", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい携帯電話番号を入力してください", trigger: "携帯電話番号を入力してください" }],
});

/** 保存処理 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("正常に変更されました");
        props.user.phonenumber = form.value.phonenumber;
        props.user.email = form.value.email;
      });
    }
  });
};

/** 閉じる処理 */
function close() {
  proxy.$tab.closePage();
};

// 現在のログインユーザー情報に戻ります
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex };
  }
},{ immediate: true });
</script>
