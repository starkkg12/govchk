<template>
    <div>
        <el-row>
            <el-col :offset="4" :span="16">

                <el-form ref="planRef" :model="plan" :rules="rules" label-width="250px" style="width:80%;">
                    <el-form-item label="プラン名" prop="planName" required>
                        <el-input v-model="plan.planName" />
                    </el-form-item>
                    <el-form-item label="概要" prop="description" required>
                        <el-input v-model="plan.description" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="danger" @click="close">キャンセル</el-button>
                        <el-button type="primary" @click="submit">保存</el-button>
                    </el-form-item>
                </el-form>

            </el-col>
        </el-row>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import { addPlan } from "@/api/system/plan";
const { proxy } = getCurrentInstance();
const plan = ref({})
const emit = defineEmits(['closePlan'])

const rules = ref({
  planName:[{ required: true, message: "プラン名を入力してください。", trigger: "blur" }],
  description:[{ required: true, message: "プラン概要を入力してください。", trigger: "blur" }],
 
});


const close = () => {
    emit('closePlan')
}
const submit = () => {
    proxy.$refs["planRef"].validate(valid => {
        if (valid) {
            addPlan(plan.value).then(res => {
                proxy.$modal.msgSuccess("プランを追加しました。");
                plan.value = {};
                emit('getPlanData')
            })
        }

    })
}
</script>
