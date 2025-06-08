<template>
    <el-row style="margin-top: 5%;">
        <el-col :span="24" class="text-center">
            <h1>データ詳細</h1> 
        </el-col> 
    </el-row> 
    <el-row>
        <el-col :span="8">
        
  <el-table :data="tableData" height="250" style="width: 100%">
    <el-table-column prop="date" label="Date" width="180" />
    <el-table-column prop="fileName" label="fileName" width="180" /> 
  </el-table>
</el-col>
        <el-col :span="8">
            <table>
                <tr>
                    <td><b>データ名：</b></td>
                    <td>住民票</td>
                </tr> 
                <tr>
                    <td><b>データの種類：</b></td>
                    <td>住民票</td>
                </tr>
                <tr>
                    <td><b>データの形式：</b></td>
                    <td>PDF</td>

                </tr>
                <tr>
                    <td><b>データのサイズ：</b></td>
                    <td>1.2MB</td>

                </tr>
                <tr>
                    <td><b>データの作成日：</b></td>
                    <td>2021-10-10</td>

                </tr>
            </table>
        
        </el-col>
        <el-col :span="8"></el-col>
    </el-row> 
    <div style="margin: 10%">
        
        <div style="margin: 20px 0" />
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
const tableData = [
  {
    date: '2016-05-03',
    fileName: '住民票.pdf'
  },
    {
        date: '2016-05-02',
        fileName: '住民票.pdf'
    }
  
]

const input = ref(0)
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