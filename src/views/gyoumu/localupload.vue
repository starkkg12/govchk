<template>
    <el-row style="margin-top: 5%;">
        <el-col :span="24" class="text-center">
            <h1>ローカル アップロード</h1> 
        </el-col> 
    </el-row> 
    <div style="margin: 10%; ">
            <el-progress
            style="width: 100%;"
                :percentage="30"
                :stroke-width="15"
                color="green"
                :show-text="false"
                striped
                striped-flow
                :duration="10"
                :width="3300"
            />
        </div>
    <div style="margin: 10%">
        <el-row>
            <h1>以下の手続きと注意事項をご確認ください。</h1>
        </el-row>
        <el-row>
            <span>注意事項：</span>
        </el-row>
        <el-row>
            <ul>
                <li>① 住民票の写しを持参してください。</li>
                <li>② 身分証明書を持参してください。</li>
                <li>③ 身分証明書を持参してください。</li>
            </ul>
        </el-row> 
        <el-row :gutter="20">
            <el-col :span="12" class="text-center">
                <el-button type="primary" size="large" plain>戻る</el-button>
            </el-col>
            <el-col :span="12" class="text-center">
                <el-button type="primary" size="large" plain>次に進む</el-button>
            </el-col>
        </el-row>
    </div>
</template>
  
<script lang="ts" setup>

import { computed, ref } from 'vue'
import { Minus, Plus } from '@element-plus/icons-vue'

 
import { ElButton, ElCard, ElCol, ElRow } from 'element-plus'

const state = ref(0)
const cards = [
    {
        name: 'マイナンバーカード申請手続き - 1', id: "1232",
        desc: 'マイナンバーカード申請手続き - 1の説明:  住民票の写しを持参してください。',
        operation: {
            "local": true, "web": false
        },
    },
    {
        name: '住民票手続き - 2', id: "1233",
        desc: '住民票手続き - 2の説明:　身分証明書を持参してください。',
        operation: {
            "local": true, "web": true
        },
    },
    {
        name: '住民票手続き - 3', id: "1234",
        desc: '住民票手続き - 2の説明:　身分証明書を持参してください。',
        operation: {
            "local": true, "web": true
        },
    },
    {
        name: '住民票手続き - 4', id: "1235",
        desc: '住民票手続き - 2の説明:　身分証明書を持参してください。',
        operation: {
            "local": true, "web": true
        },
    },
    {
        name: '住民票手続き - 5', id: "1236",
        operation: {
            "local": false, "web": true
        },
    }

]

</script>
<style scoped>
.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}
.el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}
</style>