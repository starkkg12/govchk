<template>
	<div class="popup-result">
		<p class="title">最近5二次操作時間</p>
		<ul class="popup-result-scroll">
			<template v-if='isShow'>
				<li v-for='item in resultList' :key="item">{{item}}</li>
			</template>
			<li v-else>結果の計算...</li>
		</ul>
	</div>
</template>

<script setup>
const props = defineProps({
    ex: {
        type: String,
        default: ''
    }
})
const dayRule = ref('')
const dayRuleSup = ref('')
const dateArr = ref([])
const resultList = ref([])
const isShow = ref(false)
watch(() => props.ex, () => expressionChange())
// 式値が変化したとき，結果の計算を開始します
function expressionChange() {
    // 始める-結果
    isShow.value = false;
    // ルール配列を取得します[0秒、1分、2時間、3日、4月、5週、6年]
    let ruleArr = props.ex.split(' ');
    // ループに入る回数を記録するために使用されます
    let nums = 0;
    // 一時的用時間パラメータ配列
    let resultArr = [];
    // 現在時間を取得する。[年、月、日、時間、分、秒]までに精確する
    let nTime = new Date();
    let nYear = nTime.getFullYear();
    let nMonth = nTime.getMonth() + 1;
    let nDay = nTime.getDate();
    let nHour = nTime.getHours();
    let nMin = nTime.getMinutes();
    let nSecond = nTime.getSeconds();
    // ルールに従って近づきます100Narge Annual Array、毎月の配列など
    getSecondArr(ruleArr[0]);
    getMinArr(ruleArr[1]);
    getHourArr(ruleArr[2]);
    getDayArr(ruleArr[3]);
    getMonthArr(ruleArr[4]);
    getWeekArr(ruleArr[5]);
    getYearArr(ruleArr[6], nYear);
    // 配列割り当てが取得されます-使いやすい
    let sDate = dateArr.value[0];
    let mDate = dateArr.value[1];
    let hDate = dateArr.value[2];
    let DDate = dateArr.value[3];
    let MDate = dateArr.value[4];
    let YDate = dateArr.value[5];
    // 時間インデックス取得
    let sIdx = getIndex(sDate, nSecond);
    let mIdx = getIndex(mDate, nMin);
    let hIdx = getIndex(hDate, nHour);
    let DIdx = getIndex(DDate, nDay);
    let MIdx = getIndex(MDate, nMonth);
    let YIdx = getIndex(YDate, nYear);
    // 時間リセット
    const resetSecond = function () {
        sIdx = 0;
        nSecond = sDate[sIdx]
    }
    const resetMin = function () {
        mIdx = 0;
        nMin = mDate[mIdx]
        resetSecond();
    }
    const resetHour = function () {
        hIdx = 0;
        nHour = hDate[hIdx]
        resetMin();
    }
    const resetDay = function () {
        DIdx = 0;
        nDay = DDate[DIdx]
        resetHour();
    }
    const resetMonth = function () {
        MIdx = 0;
        nMonth = MDate[MIdx]
        resetDay();
    }
    // 時間比較
    if (nYear !== YDate[YIdx]) {
        resetMonth();
    }
    if (nMonth !== MDate[MIdx]) {
        resetDay();
    }
    if (nDay !== DDate[DIdx]) {
        resetHour();
    }
    if (nHour !== hDate[hIdx]) {
        resetMin();
    }
    if (nMin !== mDate[mIdx]) {
        resetSecond();
    }
    goYear: for (let Yi = YIdx; Yi < YDate.length; Yi++) {
        let YY = YDate[Yi];
        // 最大値に達した場合
        if (nMonth > MDate[MDate.length - 1]) {
            resetMonth();
            continue;
        }
        // サイクリング月アレイ
        goMonth: for (let Mi = MIdx; Mi < MDate.length; Mi++) {
            // 割り当て、後の操作に便利です
            let MM = MDate[Mi];
            MM = MM < 10 ? '0' + MM : MM;
            // 最大値に達した場合
            if (nDay > DDate[DDate.length - 1]) {
                resetDay();
                if (Mi === MDate.length - 1) {
                    resetMonth();
                    continue goYear;
                }
                continue;
            }
            // サイクル日付配列
            goDay: for (let Di = DIdx; Di < DDate.length; Di++) {
                // 割り当て、後の操作に便利です
                let DD = DDate[Di];
                let thisDD = DD < 10 ? '0' + DD : DD;
                // 最大値に達した場合
                if (nHour > hDate[hDate.length - 1]) {
                    resetHour();
                    if (Di === DDate.length - 1) {
                        resetDay();
                        if (Mi === MDate.length - 1) {
                            resetMonth();
                            continue goYear;
                        }
                        continue goMonth;
                    }
                    continue;
                }
                // 判断日の正当性，違法の場合、現存在するのサイクルから飛び出しています
                if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true && dayRule.value !== 'workDay' && dayRule.value !== 'lastWeek' && dayRule.value !== 'lastDay') {
                    resetDay();
                    continue goMonth;
                }
                // 日付ロールの値が最終日の場合
                if (dayRule.value === 'lastDay') {
                    // 日付処理で問題が発生した場合、月末の最終日に調整する
                    if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                        while (DD > 0 && checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD--;
                            thisDD = DD < 10 ? '0' + DD : DD;
                        }
                    }
                } else if (dayRule.value === 'workDay') {
                    // 日付処理で問題が発生した場合、通常の月の終わりまで調整する
                    if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                        while (DD > 0 && checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD--;
                            thisDD = DD < 10 ? '0' + DD : DD;
                        }
                    }
                    // 当該週を取得
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'), 'week');
                    // 当週日時間
                    if (thisWeek === 1) {
                        // 翌日を見つけてください，そして、それが月末かどうかを判断します
                        DD++;
                        thisDD = DD < 10 ? '0' + DD : DD;
                        // 判断は翌日の合法的な日付ではなくなりました
                        if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD -= 3;
                        }
                    } else if (thisWeek === 7) {
                        // 当週6時間は判断するだけではありません1番号は操作できます
                        if (dayRuleSup.value !== 1) {
                            DD--;
                        } else {
                            DD += 2;
                        }
                    }
                } else if (dayRule.value === 'weekDay') {
                    // 指定されている場合、毎週です
                    // 得る当前日期是属于週几
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'), 'week');
                    if (dayRuleSup.value.indexOf(thisWeek) < 0) {
                        // 最大値に達した場合
                        if (Di === DDate.length - 1) {
                            resetDay();
                            if (Mi === MDate.length - 1) {
                                resetMonth();
                                continue goYear;
                            }
                            continue goMonth;
                        }
                        continue;
                    }
                } else if (dayRule.value === 'assWeek') {
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'), 'week');
                    if (dayRuleSup.value[1] >= thisWeek) {
                        DD = (dayRuleSup.value[0] - 1) * 7 + dayRuleSup.value[1] - thisWeek + 1;
                    } else {
                        DD = dayRuleSup.value[0] * 7 + dayRuleSup.value[1] - thisWeek + 1;
                    }
                } else if (dayRule.value === 'lastWeek') {
                    // 毎月の最後の週が指定されている場合
                    if (checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                        while (DD > 0 && checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
                            DD--;
                            thisDD = DD < 10 ? '0' + DD : DD;
                        }
                    }
                    let thisWeek = formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'), 'week');
                    if (dayRuleSup.value < thisWeek) {
                        DD -= thisWeek - dayRuleSup.value;
                    } else if (dayRuleSup.value > thisWeek) {
                        DD -= 7 - (dayRuleSup.value - thisWeek)
                    }
                }
                DD = DD < 10 ? '0' + DD : DD;
                // サイクル“時間”配列
                goHour: for (let hi = hIdx; hi < hDate.length; hi++) {
                    let hh = hDate[hi] < 10 ? '0' + hDate[hi] : hDate[hi]
                    // 最大値に達した場合
                    if (nMin > mDate[mDate.length - 1]) {
                        resetMin();
                        if (hi === hDate.length - 1) {
                            resetHour();
                            if (Di === DDate.length - 1) {
                                resetDay();
                                if (Mi === MDate.length - 1) {
                                    resetMonth();
                                    continue goYear;
                                }
                                continue goMonth;
                            }
                            continue goDay;
                        }
                        continue;
                    }
                    // 分配列
                    goMin: for (let mi = mIdx; mi < mDate.length; mi++) {
                        let mm = mDate[mi] < 10 ? '0' + mDate[mi] : mDate[mi];
                        // 最大値に達した場合
                        if (nSecond > sDate[sDate.length - 1]) {
                            resetSecond();
                            if (mi === mDate.length - 1) {
                                resetMin();
                                if (hi === hDate.length - 1) {
                                    resetHour();
                                    if (Di === DDate.length - 1) {
                                        resetDay();
                                        if (Mi === MDate.length - 1) {
                                            resetMonth();
                                            continue goYear;
                                        }
                                        continue goMonth;
                                    }
                                    continue goDay;
                                }
                                continue goHour;
                            }
                            continue;
                        }
                        // 秒配列
                        goSecond: for (let si = sIdx; si <= sDate.length - 1; si++) {
                            let ss = sDate[si] < 10 ? '0' + sDate[si] : sDate[si];
                            // 現在の時間を追加します
                            if (MM !== '00' && DD !== '00') {
                                resultArr.push(YY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss)
                                nums++;
                            }
                            if (nums === 5) break goYear;
                            // 最大値に達した場合
                            if (si === sDate.length - 1) {
                                resetSecond();
                                if (mi === mDate.length - 1) {
                                    resetMin();
                                    if (hi === hDate.length - 1) {
                                        resetHour();
                                        if (Di === DDate.length - 1) {
                                            resetDay();
                                            if (Mi === MDate.length - 1) {
                                                resetMonth();
                                                continue goYear;
                                            }
                                            continue goMonth;
                                        }
                                        continue goDay;
                                    }
                                    continue goHour;
                                }
                                continue goMin;
                            }
                        } //goSecond
                    } //goMin
                }//goHour
            }//goDay
        }//goMonth
    }
    if (resultArr.length === 0) {
        resultList.value = ['条件なしの結果！'];
    } else {
        resultList.value = resultArr;
        if (resultArr.length !== 5) {
            resultList.value.push('最近100年以上' + resultArr.length + '精確しました！')
        }
    }
    // 完全に計算します-結果を示す
    isShow.value = true;
}
// 与えられた配列（arr）と値（value）を受け取り、その値が配列内のどの範囲に属するかを特定する
function getIndex(arr, value) {
    if (value <= arr[0] || value > arr[arr.length - 1]) {
        return 0;
    } else {
        for (let i = 0; i < arr.length - 1; i++) {
            if (value > arr[i] && value <= arr[i + 1]) {
                return i + 1;
            }
        }
    }
}
// 与えられたルールと年に基づいて年の配列を取得する
function getYearArr(rule, year) {
    dateArr.value[5] = getOrderArr(year, year + 100);
    if (rule !== undefined) {
        if (rule.indexOf('-') >= 0) {
            dateArr.value[5] = getCycleArr(rule, year + 100, false)
        } else if (rule.indexOf('/') >= 0) {
            dateArr.value[5] = getAverageArr(rule, year + 100)
        } else if (rule !== '*') {
            dateArr.value[5] = getAssignArr(rule)
        }
    }
}
// 与えられたルールと月に基づいて月の配列を取得する
function getMonthArr(rule) {
    dateArr.value[4] = getOrderArr(1, 12);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[4] = getCycleArr(rule, 12, false)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[4] = getAverageArr(rule, 12)
    } else if (rule !== '*') {
        dateArr.value[4] = getAssignArr(rule)
    }
}
// 与えられたルールと週に基づいて週の配列を取得する
function getWeekArr(rule) {
    // 日付ルールの2つの値のみが両方です“”時式の日付はオプションです
    if (dayRule.value === '' && dayRuleSup.value === '') {
        if (rule.indexOf('-') >= 0) {
            dayRule.value = 'weekDay';
            dayRuleSup.value = getCycleArr(rule, 7, false)
        } else if (rule.indexOf('#') >= 0) {
            dayRule.value = 'assWeek';
            let matchRule = rule.match(/[0-9]{1}/g);
            dayRuleSup.value = [Number(matchRule[1]), Number(matchRule[0])];
            dateArr.value[3] = [1];
            if (dayRuleSup.value[1] === 7) {
                dayRuleSup.value[1] = 0;
            }
        } else if (rule.indexOf('L') >= 0) {
            dayRule.value = 'lastWeek';
            dayRuleSup.value = Number(rule.match(/[0-9]{1,2}/g)[0]);
            dateArr.value[3] = [31];
            if (dayRuleSup.value === 7) {
                dayRuleSup.value = 0;
            }
        } else if (rule !== '*' && rule !== '?') {
            dayRule.value = 'weekDay';
            dayRuleSup.value = getAssignArr(rule)
        }
    }
}
// 与えられた日付ルールに基づいて、日の配列を取得
function getDayArr(rule) {
    dateArr.value[3] = getOrderArr(1, 31);
    dayRule.value = '';
    dayRuleSup.value = '';
    if (rule.indexOf('-') >= 0) {
        dateArr.value[3] = getCycleArr(rule, 31, false)
        dayRuleSup.value = 'null';
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[3] = getAverageArr(rule, 31)
        dayRuleSup.value = 'null';
    } else if (rule.indexOf('W') >= 0) {
        dayRule.value = 'workDay';
        dayRuleSup.value = Number(rule.match(/[0-9]{1,2}/g)[0]);
        dateArr.value[3] = [dayRuleSup.value];
    } else if (rule.indexOf('L') >= 0) {
        dayRule.value = 'lastDay';
        dayRuleSup.value = 'null';
        dateArr.value[3] = [31];
    } else if (rule !== '*' && rule !== '?') {
        dateArr.value[3] = getAssignArr(rule)
        dayRuleSup.value = 'null';
    } else if (rule === '*') {
        dayRuleSup.value = 'null';
    }
}
// 与えられた時間ルールに基づいて、時の配列を取得
function getHourArr(rule) {
    dateArr.value[2] = getOrderArr(0, 23);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[2] = getCycleArr(rule, 24, true)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[2] = getAverageArr(rule, 23)
    } else if (rule !== '*') {
        dateArr.value[2] = getAssignArr(rule)
    }
}
// 与えられた分のルールに基づいて、分の配列を取得
function getMinArr(rule) {
    dateArr.value[1] = getOrderArr(0, 59);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[1] = getCycleArr(rule, 60, true)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[1] = getAverageArr(rule, 59)
    } else if (rule !== '*') {
        dateArr.value[1] = getAssignArr(rule)
    }
}
// 与えられた秒のルールに基づいて、秒の配列を取得
function getSecondArr(rule) {
    dateArr.value[0] = getOrderArr(0, 59);
    if (rule.indexOf('-') >= 0) {
        dateArr.value[0] = getCycleArr(rule, 60, true)
    } else if (rule.indexOf('/') >= 0) {
        dateArr.value[0] = getAverageArr(rule, 59)
    } else if (rule !== '*') {
        dateArr.value[0] = getAssignArr(rule)
    }
}
// 指定された最小値から最大値までの整数の順序配列を生成する
function getOrderArr(min, max) {
    let arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
}
// 与えられたルールに基づいて、指定された値の配列を生成する
function getAssignArr(rule) {
    let arr = [];
    let assiginArr = rule.split(',');
    for (let i = 0; i < assiginArr.length; i++) {
        arr[i] = Number(assiginArr[i])
    }
    arr.sort(compare)
    return arr;
}
// 与えられたルールに基づいて、平均的な値の配列を生成する
function getAverageArr(rule, limit) {
    let arr = [];
    let agArr = rule.split('/');
    let min = Number(agArr[0]);
    let step = Number(agArr[1]);
    while (min <= limit) {
        arr.push(min);
        min += step;
    }
    return arr;
}
// 与えられたルールに基づいて、周期的な値の配列を生成する
function getCycleArr(rule, limit, status) {
    // status--かどうかを示します0始める（それから1始める）
    let arr = [];
    let cycleArr = rule.split('-');
    let min = Number(cycleArr[0]);
    let max = Number(cycleArr[1]);
    if (min > max) {
        max += limit;
    }
    for (let i = min; i <= max; i++) {
        let add = 0;
        if (status === false && i % limit === 0) {
            add = limit;
        }
        arr.push(Math.round(i % limit + add))
    }
    arr.sort(compare)
    return arr;
}
// 2つの値を比較してソート順序を決定する
function compare(value1, value2) {
    if (value2 - value1 > 0) {
        return -1;
    } else {
        return 1;
    }
}
// 与えられた日時値を指定された形式でフォーマットする
function formatDate(value, type) {
    let time = typeof value == 'number' ? new Date(value) : value;
    let Y = time.getFullYear();
    let M = time.getMonth() + 1;
    let D = time.getDate();
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    let week = time.getDay();
    if (type === undefined) {
        return Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    } else if (type === 'week') {
        return week + 1;
    }
}
// 与えられた値が有効な日付であるかどうかを確認する
function checkDate(value) {
    let time = new Date(value);
    let format = formatDate(time)
    return value === format;
}
onMounted(() => {
    expressionChange()
})
</script>