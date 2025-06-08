<template>
  <cardShadow>
    <template #header-title>
      申請業務　{{ title }}
    </template>

    <div class="title-item">
      データ化ステータス：完了
    </div>
    <div class="title-item">
      データ化出力日時：{{digiconData.maxUpdateTime}}
    </div>
    <div style="padding-top: 10px;">
      <div class="el-table__header-wrapper fl" style="width: 15%;">
        <label style="margin-bottom: 10px;">ファイル</label>
        <div style="height: 860px;overflow-y: auto;">
          <el-row justify="left" v-for="(colData, index) in props.groupFiles" @click="changeFile(colData.id, colData.status)" :style="selectId === colData.id ? 'background-color: #FFD870;' : !colData.status.includes('データ化完了') ? 'background-color: #eee;' : ''">
            <el-col><span style="padding-left: 10px">{{ index+1 }}.</span></el-col>
            <el-col><span>{{ colData.fileName }}</span></el-col>
          </el-row>
        </div>
      </div>
      <div class="el-table__header-wrapper fr" style="width: 85%;">
        <div style="position:relative;width:50%;margin-left:6%;">
          <div class="swiper-button-prev" v-show="applicationList.length>5" @click.stop="prevEl"></div>
          <div class="swiper-button-next" v-show="applicationList.length>5" @click.stop="nextEl"></div>
          <Swiper
                  :modules="modules"
                  :slides-per-view="5"
                  :space-between="10"
                  @swiper="onSwiper"
                  @slideChange="onSlideChange"
          >
            <SwiperSlide class="swiper-slide" :key="index" v-for="(item, index) in applicationList">
              <el-image @click.stop="selectPdf(index)" :class="item.selected ? 'pdf-select' : ''" :src="'data:image/jpeg;base64,'+item.imageUrl" fit="contain"></el-image>
            </SwiperSlide>
          </Swiper>
        </div>

        <PDFLoad :id="pdfId" :type="props.type" @cancel="cancel" @change="dataChange"/>
      </div>
      <div class="clearfix"></div>
    </div>
  </cardShadow>
</template>
<script setup >
  import cardShadow from "@/components/Customized/cardShadow";
  import { Swiper, SwiperSlide } from "swiper/vue";
  import { Pagination, Navigation, Scrollbar } from 'swiper/modules';
  import { getDigicon } from "@/api/system/application/file";
  import PDFLoad from '@/components/PDFLoad';
  const { proxy } = getCurrentInstance();

  // Import Swiper styles
  import 'swiper/css';
  import 'swiper/css/navigation';
  import {inject, onMounted, ref} from 'vue'

  const modules = [ Pagination, Navigation, Scrollbar];

  const bus = inject('$bus');
  const props = defineProps(['rowData', 'type','groupFiles']);
  const selectId = ref('');
  const applicationList = ref([]);
  const digiconData = ref({});
  const pdfId = ref('');
  const emit = defineEmits(['cancel2']);
  const change = ref(false);
  const currentIndex = ref(0);
  const title = props.type === 'edit' ? 'データ化結果編集' : 'データ化結果参照';

  let swiper = ref(null);
  const onSwiper = (theSwiper) => {
    swiper.value = theSwiper;
  };
  const prevEl = () => {
    swiper.value.slidePrev();
  }
  const nextEl = () => {
    swiper.value.slideNext();
  }
  const onSlideChange = (swiper) => {
    console.log('slide changed');
  };
  const selectPdf = (index) => {
    if (currentIndex.value === index) {
      return;
    }
    if (change.value) {
      proxy.$modal.confirm('変更した内容はまだ保存されています。保存しなくてもよろしいでしょうか？').then(function () {

      }).then(() => {
        applicationList.value.forEach(function (item, i) {
          item.selected = (i === index);
        });
        pdfId.value = applicationList.value[index].id;
        currentIndex.value = index;
        change.value = false;
      }).catch(() => {});
    }else{
      applicationList.value.forEach(function (item, i) {
        item.selected = (i === index);
      });
      pdfId.value = applicationList.value[index].id;
      currentIndex.value = index;
    }
  }
  const getData = async (fileId) => {
    bus.emit('loading', { type: 'show'});
    try {
      const responseData = await getDigicon(fileId);
      bus.emit('loading', { type: 'hide'});
      if (change.value) {
        proxy.$modal.confirm('変更した内容はまだ保存されています。保存しなくてもよろしいでしょうか？').then(function () {

        }).then(() => {
          applicationList.value = responseData.fileList.map((item, index) => ({ ...item, selected: index === 0}));
          digiconData.value = responseData.digicon;
          pdfId.value = applicationList.value[0].id;
          currentIndex.value = 0;
          change.value = false;
        }).catch(() => {});
      }else{
        applicationList.value = responseData.fileList.map((item, index) => ({ ...item, selected: index === 0}));
        digiconData.value = responseData.digicon;
        pdfId.value = applicationList.value[0].id;
        currentIndex.value = 0;
      }
    } catch (error) {
      bus.emit('loading', { type: 'hide'});
    }
  }
  const getPdfData = (data) => {
    console.log('data', data);
  }
  const cancel = () => {
    emit('cancel2');
  };
  const dataChange = (status) => {
    change.value = status;
  };

  onMounted(async () => {
    selectId.value = props.rowData.id;
    getData(props.rowData.id);
  });
  const changeFile = (fileId, status)=>{
    if (!status.includes('データ化完了')){
      return;
    }
    selectId.value = fileId;
    getData(fileId);
  }
</script>
<style scoped>
  .title-item{
    height: 32px;
    line-height: 32px;
    font-weight: 700;
    color: var(--el-text-color-regular);
  }
  .swiper{
    width: 300px;
    display: flex;
    flex-wrap: nowrap;
  }
  .swiper-slide{
    width: 50px;
    height: 76px;
    cursor: pointer;
  }
  .swiper-button-prev {
    --swiper-navigation-size:20px;
  }
  .swiper-button-next {
    --swiper-navigation-size:20px;
  }
  .pdf-select{
    border: 3px solid #AA3B22;
  }
  .thumbs{
    width: 20rem;
    margin: 1rem auto 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 8px;
    border: 1px solid #dddddd;
    text-align: left;
  }
  .el-row {
    vertical-align: top;
  }
  .el-data {
    display : none!important;
  }
  .divdata {
    display : inline-block!important;
    margin-left: 2em;
  .el-table__header-wrapper {
    width: 10em;
    min-width: 20%;
  }
  }

  label {
    background-color: #f8f8f9 !important;
    width:100%;
    text-align: center;
  }
  .field2 {
    width:24rem;
    vertical-align: top;
  }
  .el-input {
    max-width:2rem;
    display : inline-block!important;
  }
  .el-col {
    display: inline-block;
  }
  .el-col-24 {
    max-width:unset!important;
    flex: unset!important;
  }
</style>