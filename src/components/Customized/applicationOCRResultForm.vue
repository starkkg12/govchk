<template>
 <!-- todo  -->
    OCR Result 
    {{ rowData }}
</template>
<script>

export default {
  name: 'applicationOCRResult',
  props: {
    rowData: {
      type: Object,
      default: {}
    }
  },
  data () {
    return { 
    }
  },
  watch: { 
  }
}
</script>