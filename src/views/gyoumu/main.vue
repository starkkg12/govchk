<template>
    <el-row style="margin-left: 6%;">
        <el-col   class="text-left">
            <h1 style="font-size: 42px;font-weight: bold;">業務一覧</h1>
            <span style="color: #717171;">
                ここから業務を選択してください、業務を選択すると、業務に関する情報が表示されます。
            </span>
        </el-col>
    </el-row>
    <el-divider border-style="dashed" />
    <el-container>
        <el-row :gutter="20" style="margin:3% 6% 3% 6%">
            <el-col v-for="card in cards" :span="6" style="margin-bottom: 3%;">
                <el-card class="box-card">
                    <template #header >
                        <div class="card-header">
                            <span>{{ card.name }}</span>
                            <!-- <el-button class="button" text>Operation button</el-button> -->
                        </div>
                    </template>
                    <div class="card-body" v-if="card.desc">{{ card.desc }}</div>
                    <div class="card-body" v-else>説明なし</div>
                    <template #footer> 
                        <el-row  >
                            <el-col  >
                                <el-button-group  >
                                    <el-button type="primary" :disabled="!card.operation.local" icon="upload">ローカル</el-button>
                                    <el-button type="primary" :disabled="!card.operation.web"  icon="UploadFilled">ウェブ</el-button> 
                                </el-button-group>
                            </el-col>
                        </el-row> 
                    </template>
                </el-card>
            </el-col>
        </el-row>
    </el-container>
</template>
  
<script lang="ts" setup>

import { ref } from 'vue'
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
<style>
body { 
    background-color: #f7f7e9; 
}
</style>
<style lang="scss" scoped> 
.box-card {
    .card-header {
        font-size: 22px;
        font-weight: bold; 
        min-height: 60px;
        // vertical align
        display: flex;
        align-items: center; 
    }
    .card-body { 
        color: #a7a7a7;
        min-height: 100px;
    }
}
</style>