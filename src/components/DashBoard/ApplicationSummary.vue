<template>

    <div class="upload-box fl">
        <div class="upload-title fl">処理状況（データ化のみ）</div>
        <div class="clearfix"></div>
        <ul class="upload-content content-mt">
            <li>
                <div class="fl">未提出（一時保存）</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(0, 0, 1)">{{ ocrSumary.uncommitted }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">データ化処理中</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(2, 0, 1)">{{ ocrSumary.processing }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">データ化完了</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(5, 0, 1)">{{ ocrSumary.completed }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
        </ul>
    </div>
    <div class="upload-box fl">
        <div class="upload-title fl">処理状況（データ化＋審査）</div>
        <div class="clearfix"></div>
        <ul class="upload-content">
            <li>
                <div class="fl">未提出（一時保存）</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(0, 0, 0)">{{ allSumary.uncommitted }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">データ化処理中</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(2, 0, 0)">{{ allSumary.processing }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">データ化完了・確認待ち</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(5, 0, 0)">{{ allSumary.completed }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">審査中</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(6, 0, 0)">{{ allSumary.review }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">審査完了</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(7, 0, 0)">{{ allSumary.done }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
        </ul>
    </div>
    <div class="finished-box fr">
        <div class="finished-title fl">処理状況（審査のみ）</div>
        <div class="clearfix"></div>
        <ul class="finished-content content-mt">
            <li>
                <div class="fl">未提出（一時保存）</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(0, 1, 0)">{{ autoReviewSumary.uncommitted }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">審査中</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(6, 1, 0)">{{ autoReviewSumary.review }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
            <li>
                <div class="fl">審査完了</div>
                <div class="fr">
                    <el-link type="success" @click="goApplication(7, 1, 0)">{{ autoReviewSumary.done }}件</el-link>
                </div>
                <div class="clearfix"></div>
            </li>
        </ul>
    </div>
    <div class="clearfix"></div>

</template>

<script setup>
import { reactive, onMounted } from 'vue'

import { getApplicationSummary } from "@/api/system/application"

const router = useRouter();

const ocrSumary = ref({
    uncommitted: 0,
    processing: 0,
    completed: 0
})

const allSumary = ref({
    uncommitted: 0,
    processing: 0,
    completed: 0,
    review:0,
    done: 0
})

const autoReviewSumary = ref({
    uncommitted: 0,
    review:0,
    done: 0
})

onMounted(() => {
    getApplicationSummary().then(res => {

        let ocrSumaryList = res.ocr
        let allSumaryList = res.all
        let autoReviewList = res.autoReview
        ocrSumaryList.forEach(element => {
            if (element.status == 5) {
                ocrSumary.value.completed = element.count
            } else if (element.status >=2 && element.status <=4) {
                ocrSumary.value.processing += element.count;
            } else  if (element.status == 0) {
                ocrSumary.value.uncommitted = element.count
            }
        });
        allSumaryList.forEach(element => {
            if (element.status == 5) {
                allSumary.value.completed = element.count
            } else if (element.status >=2 && element.status <=4) {
                allSumary.value.processing += element.count;
            } else if (element.status == 6) {
                allSumary.value.review = element.count;
            } else if (element.status == 7) {
                allSumary.value.done = element.count;
            } else if (element.status == 0) {
                allSumary.value.uncommitted = element.count
            }
        });
        autoReviewList.forEach(element => {
            if (element.status == 6) {
                autoReviewSumary.value.review = element.count;
            } else if (element.status == 7) {
                autoReviewSumary.value.done = element.count;
            } else  if (element.status == 0) {
                autoReviewSumary.value.uncommitted = element.count
            }
        });
       // ocrSumary.value.uncommitted = res.unfinished[0] === null || res.unfinished[0] === undefined ? 0 : res.unfinished[0].count;
       // allSumary.value.uncommitted = res.unfinished[0] === null || res.unfinished[0] === undefined ? 0 : res.unfinished[0].count;
       // autoReviewSumary.value.uncommitted = res.unfinished[0] === null || res.unfinished[0] === undefined ? 0 : res.unfinished[0].count;
    });
})


const goApplication = (status, enforceOcr, autoReview) => {
    if (status === 0) {
        router.push(`/application/operations/outstanding/index?status=${status}&enforceOcr=${enforceOcr}&autoReview=${autoReview}`)
    } else {
      router.push(`/application/index?status=${status}&enforceOcr=${enforceOcr}&autoReview=${autoReview}`)
    }
}
</script>

<style lang="scss">
.upload-box {
    width: 31%;
    margin-right: 3.5%;
    height: 14rem;
    border: 1px solid #479E58;
}

.upload-title {
    padding: 0 2rem;
    font-size: 20px;
    background-color: #479E58;
    color: #fff;
}

.upload-content li {
    display: block;
    margin: 0.5rem 0;
    padding-right: 3rem;
}

.content-mt {
    margin-top: 2.5rem;
}

.finished-box {
    width: 31%;
    height: 14rem;
    border: 1px solid #479E58;
}

.finished-title {
    padding: 0 2rem;
    font-size: 20px;
    background-color: #479E58;
    color: #fff;
}

.finished-content li {
    display: block;
    margin: 0.5rem 0;
    padding-right: 3rem;
}

.content-mt {
    margin-top: 2.5rem;
}
</style>