<template>
  <!--  for test  -->
  <el-input v-model="localValue" />
  <!-- <el-button class="handle" type="primary" icon="Edit" size="mini" plain @click="edittable = !edittable"></el-button>
  <draggable v-model="showedList" group="people" @start="drag = true" @end="drag = false" tag="transition-group"
    :component-data="{
    tag: 'ul',
    type: 'transition-group',
    name: !drag ? 'flip-list' : null
  }" :move="checkMove" item-key="key-id" v-bind="dragOptions" class="list-group" ghost-class="ghost">
    <template #item="{ element }">
      <el-row :span="20">
        <el-col :span="3" v-for="colData in showedCols">
          <el-input v-model="element[colData.name]" :placeholder="colData.name" :disabled="!edittable"></el-input>
        </el-col>

        <el-col :span="1">
        </el-col>
        <el-col :span="4">
          <el-button class="handle" type="danger" icon="Delete" size="mini" plain></el-button>
        </el-col>
      </el-row>

    </template>
  </draggable>

  {{ showedList }} -->
  {{ localValue }}
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: {
    draggable,
  },
  props: {
    value: {
      type: String,
      default: "22",
    },
    showedCols: {
      type: Array,
      default: () => [
        {
          name: 'id'
        },
        {
          name: 'name'
        }
      ]
    },
    showedList: {
      type: Array,
      default: () =>  [
        {
          id: 123,
          name: 1
        },
        {
          id: 1234,
          name: 2
        },
        {
          id: 345,
          name: 3
        },
        {
          id: 456,
          name: 4
        },
      ]
  }
  },
  data() {
    return {
      drag: false,
      edittable: false,
      localValue: this.value,

      
    }
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
    localValue(newVal) {
      this.$emit('update:value', newVal);
    },
  },
  computed: {
    dragOptions() {
      return {
        animation: 300,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  methods: {
    checkMove: function (e) {
      window.console.log("Future index: " + e.draggedContext.futureIndex);
    },
    edit: function (element) {
      element.editable = !element.editable;
    }
  }
}
</script>

<style scoped>
.button {
  margin-top: 35px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.handle {
  float: left;
  padding-top: 8px;
  padding-bottom: 8px;
}

.close {
  float: right;
  padding-top: 8px;
  padding-bottom: 8px;
}

input {
  display: inline-block;
  width: 50%;
}

.text {
  margin: 20px;
}
</style>