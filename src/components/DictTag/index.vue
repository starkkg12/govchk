<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.value)">
        <span
          v-if="(item.elTagType == 'default' || item.elTagType == '') && (item.elTagClass == '' || item.elTagClass == null)"
          :key="item.value"
          :index="index"
          :class="item.elTagClass"
        >{{ item.label + " " }}</span>
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.value + ''"
          :index="index"
          :type="item.elTagType === 'primary' ? '' : item.elTagType"
          :class="item.elTagClass"
        >{{ item.label + " " }}</el-tag>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      {{ unmatchArray | handleArray }}
    </template>
  </div>
</template>

<script setup>
// マッチできない配列
const unmatchArray = ref([]);

const props = defineProps({
  // データ
  options: {
    type: Array,
    default: null,
  },
  // 現在の価値
  value: [Number, String, Array],
  // マッチデータがない場合
  showValue: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: String,
    default: ",",
  }
});

const values = computed(() => {
  if (props.value === null || typeof props.value === 'undefined' || props.value === '') return [];
  return Array.isArray(props.value) ? props.value.map(item => '' + item) : String(props.value).split(props.separator);
});

const unmatch = computed(() => {
  unmatchArray.value = [];
  // もし value が null または未定義であるか、空文字であるか、options の長さが 0 である場合、false を返します
  if (props.value === null || typeof props.value === 'undefined' || props.value === '' || props.options.length === 0) return false
  let unmatch = false
  values.value.forEach(item => {
    // values 配列の各要素についてループします
    if (!props.options.some(v => v.value === item)) {
      // もし item が props.options に含まれていない場合、
      // unmatchArray に item を追加し、unmatch を true に設定します
      unmatchArray.value.push(item)
      unmatch = true
    }
  })
  return unmatch
});

function handleArray(array) {
  if (array.length === 0) return "";
  return array.reduce((pre, cur) => {
    return pre + " " + cur;
  });
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
