<template>
    <div>
        <el-tabs type="border-card">
            <el-tab-pane label="秒" v-if="shouldHide('second')">
                <CrontabSecond
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronsecond"
                />
            </el-tab-pane>

            <el-tab-pane label="分" v-if="shouldHide('min')">
                <CrontabMin
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronmin"
                />
            </el-tab-pane>

            <el-tab-pane label="時間" v-if="shouldHide('hour')">
                <CrontabHour
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronhour"
                />
            </el-tab-pane>

            <el-tab-pane label="日" v-if="shouldHide('day')">
                <CrontabDay
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronday"
                />
            </el-tab-pane>

            <el-tab-pane label="月" v-if="shouldHide('month')">
                <CrontabMonth
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronmonth"
                />
            </el-tab-pane>

            <el-tab-pane label="週" v-if="shouldHide('week')">
                <CrontabWeek
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronweek"
                />
            </el-tab-pane>

            <el-tab-pane label="年" v-if="shouldHide('year')">
                <CrontabYear
                    @update="updateCrontabValue"
                    :check="checkNumber"
                    :cron="crontabValueObj"
                    ref="cronyear"
                />
            </el-tab-pane>
        </el-tabs>

        <div class="popup-main">
            <div class="popup-result">
                <p class="title">時間パフォーマンス</p>
                <table>
                    <thead>
                        <th v-for="item of tabTitles" :key="item">{{item}}</th>
                        <th>Cron パフォーマンス</th>
                    </thead>
                    <tbody>
                        <td>
                            <span v-if="crontabValueObj.second.length < 10">{{crontabValueObj.second}}</span>
                            <el-tooltip v-else :content="crontabValueObj.second" placement="top"><span>{{crontabValueObj.second}}</span></el-tooltip>
                        </td>
                        <td>
                            <span v-if="crontabValueObj.min.length < 10">{{crontabValueObj.min}}</span>
                            <el-tooltip v-else :content="crontabValueObj.min" placement="top"><span>{{crontabValueObj.min}}</span></el-tooltip>
                        </td>
                        <td>
                            <span v-if="crontabValueObj.hour.length < 10">{{crontabValueObj.hour}}</span>
                            <el-tooltip v-else :content="crontabValueObj.hour" placement="top"><span>{{crontabValueObj.hour}}</span></el-tooltip>
                        </td>
                        <td>
                            <span v-if="crontabValueObj.day.length < 10">{{crontabValueObj.day}}</span>
                            <el-tooltip v-else :content="crontabValueObj.day" placement="top"><span>{{crontabValueObj.day}}</span></el-tooltip>
                        </td>
                        <td>
                            <span v-if="crontabValueObj.month.length < 10">{{crontabValueObj.month}}</span>
                            <el-tooltip v-else :content="crontabValueObj.month" placement="top"><span>{{crontabValueObj.month}}</span></el-tooltip>
                        </td>
                        <td>
                            <span v-if="crontabValueObj.week.length < 10">{{crontabValueObj.week}}</span>
                            <el-tooltip v-else :content="crontabValueObj.week" placement="top"><span>{{crontabValueObj.week}}</span></el-tooltip>
                        </td>
                        <td>
                            <span v-if="crontabValueObj.year.length < 10">{{crontabValueObj.year}}</span>
                            <el-tooltip v-else :content="crontabValueObj.year" placement="top"><span>{{crontabValueObj.year}}</span></el-tooltip>
                        </td>
                        <td class="result">
                            <span v-if="crontabValueString.length < 90">{{crontabValueString}}</span>
                            <el-tooltip v-else :content="crontabValueString" placement="top"><span>{{crontabValueString}}</span></el-tooltip>
                        </td>
                    </tbody>
                </table>
            </div>
            <CrontabResult :ex="crontabValueString"></CrontabResult>

            <div class="pop_btn">
                <el-button type="primary" @click="submitFill">確認</el-button>
                <el-button type="warning" @click="clearCron">取り戻し</el-button>
                <el-button @click="hidePopup">キャンセル</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import CrontabSecond from "./second.vue"
import CrontabMin from "./min.vue"
import CrontabHour from "./hour.vue"
import CrontabDay from "./day.vue"
import CrontabMonth from "./month.vue"
import CrontabWeek from "./week.vue"
import CrontabYear from "./year.vue"
import CrontabResult from "./result.vue"
const { proxy } = getCurrentInstance()
const emit = defineEmits(['hide', 'fill'])
const props = defineProps({
    hideComponent: {
        type: Array,
        default: () => [],
    },
    expression: {
        type: String,
        default: ""
    }
})
const tabTitles = ref(["秒", "分", "時間", "日", "月", "週", "年"])
const tabActive = ref(0)
const hideComponent = ref([])
const expression = ref('')
const crontabValueObj = ref({
    second: "*",
    min: "*",
    hour: "*",
    day: "*",
    month: "*",
    week: "?",
    year: "",
})
const crontabValueString = computed(() => {
    const obj = crontabValueObj.value
    return obj.second
        + " "
        + obj.min
        + " "
        + obj.hour
        + " "
        + obj.day
        + " "
        + obj.month
        + " "
        + obj.week
        + (obj.year === "" ? "" : " " + obj.year)
})
watch(expression, () => resolveExp())
function shouldHide(key) {
    return !(hideComponent.value && hideComponent.value.includes(key))
}
function resolveExp() {
    // パフォーマンスチェック処理
    if (expression.value) {
        const arr = expression.value.split(/\s+/)
        if (arr.length >= 6) {
            // 6桁以上は正常のパフォーマンス
            let obj = {
                second: arr[0],
                min: arr[1],
                hour: arr[2],
                day: arr[3],
                month: arr[4],
                week: arr[5],
                year: arr[6] ? arr[6] : ""
            }
            crontabValueObj.value = {
                ...obj,
            }
        }
    } else {
        // パフォーマンスがない場合、戻す
        clearCron()
    }
}
// tab値の切り替え
function tabCheck(index) {
    tabActive.value = index
}
// サブコンポーネントによってトリガーされる。パフォーマンスの文字列を変更する。
function updateCrontabValue(name, value, from) {
    crontabValueObj.value[name] = value
}
// 番号のフォーマットを確認する。
function checkNumber(value, minLimit, maxLimit) {
    // 整数化にする
    value = Math.floor(value)
    if (value < minLimit) {
        value = minLimit
    } else if (value > maxLimit) {
        value = maxLimit
    }
    return value
}
// ポップアップ非表示にする
function hidePopup() {
    emit("hide")
}
// 塗りつぶしを提出する
function submitFill() {
    emit("fill", crontabValueString.value)
    hidePopup()
}
function clearCron() {
    // 選択項目をクリアする
    crontabValueObj.value = {
        second: "*",
        min: "*",
        hour: "*",
        day: "*",
        month: "*",
        week: "?",
        year: "",
    }
}
onMounted(() => {
    expression.value = props.expression
    hideComponent.value = props.hideComponent
})
</script>

<style lang="scss" scoped>
.pop_btn {
    text-align: center;
    margin-top: 20px;
}
.popup-main {
    position: relative;
    margin: 10px auto;
    background: #fff;
    border-radius: 5px;
    font-size: 14px;
    overflow: hidden;
}
.popup-title {
    overflow: hidden;
    line-height: 34px;
    padding-top: 6px;
    background: #f2f2f2;
}
.popup-result {
    box-sizing: border-box;
    line-height: 24px;
    margin: 25px auto;
    padding: 15px 10px 10px;
    border: 1px solid #ccc;
    position: relative;
}
.popup-result .title {
    position: absolute;
    top: -28px;
    left: 50%;
    width: 140px;
    font-size: 16px;
    margin-left: -70px;
    text-align: center;
    line-height: 30px;
    background: #fff;
}
.popup-result table {
    text-align: center;
    width: 100%;
    margin: 0 auto;
}
.popup-result table td:not(.result) {
    width: 3.5rem;
    min-width: 3.5rem;
    max-width: 3.5rem;
}
.popup-result table span {
    display: block;
    width: 100%;
    font-family: arial;
    line-height: 30px;
    height: 30px;
    white-space: nowrap;
    overflow: hidden;
    border: 1px solid #e8e8e8;
}
.popup-result-scroll {
    font-size: 14px;
    line-height: 24px;
    height: 10em;
    overflow-y: auto;
}
</style>