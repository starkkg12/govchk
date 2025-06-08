import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/es/locale/lang/ja'

import '@/assets/styles/index.scss' // global css


import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'


import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// Commandを登録する
import plugins from './plugins' // plugins
import { download } from '@/utils/request'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Reveal, Slide } from 'vue3-burger-menu'; 


// svgアイコン
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

// ページング
import Pagination from '@/components/Pagination'
// カスタムフォームツールコンポーネント
import RightToolbar from '@/components/RightToolbar'
// 豊富なテキストコンポーネント
import Editor from "@/components/Editor"
// ファイルアップロードコンポーネント
import FileUpload from "@/components/FileUpload"

import FileDragAndDropUpload from "@/components/FileDragAndDropUpload"
// 画像アップロードコンポーネント
import ImageUpload from "@/components/ImageUpload"
// 画像プレビューコンポーネント
import ImagePreview from "@/components/ImagePreview"
// カスタムツリー選択コンポーネント
import TreeSelect from '@/components/TreeSelect'
// 辞書ラベルコンポーネント
import DictTag from '@/components/DictTag'
import focusNav from '@/directive/common/focusNav';

import mitt from 'mitt';


const app = createApp(App)

// グローバルメソッドマウント
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

// グローバルコンポーネントマウント
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('FileDragAndDropUpload', FileDragAndDropUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('Swiper', Swiper)
app.component('Slide', Slide)

app.use(router)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)
app.directive('focus-nav', focusNav)

directive(app)



// element-plusを使用して、 グローバルサイズを設定します
app.use(ElementPlus, {
  locale: locale,
  // サポート large、default、small
  size: Cookies.get('size') || 'default'
})

app.provide('$bus', mitt());

app.mount('#app')
