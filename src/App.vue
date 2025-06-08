<template>
    <div class="alert-background" v-if="loadingVisible"></div>
    <div class="spinner" v-if="loadingVisible">
        <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
        </div>
        <p class="text-center mt-4" style="font-size: 20px;">{{loadingMsg}}</p>
    </div>
    <router-view />
    <ScrollToTopButton />
</template>

<script setup>
    import ScrollToTopButton from './components/ScrollToTop/index.vue';
    import Cookies from 'js-cookie'
    import {onMounted, ref, inject} from "vue";

    //if (!Cookies.get('sidebarStatus')) {
      Cookies.set('sidebarStatus', 1);
    //}

    const bus = inject('$bus');
    const loadingVisible = ref(false);
    const loadingMsg = ref('');
// import useSettingsStore from '@/store/modules/settings'
// import { handleThemeStyle } from '@/utils/theme'
// // const axios = require('axios')
// import   axios  from "axios"

// onMounted(() => {
//   nextTick(() => {
//     // テーマスタイルを初期化します
//       handleThemeStyle(useSettingsStore().theme)
//       axios.get('/test/user/John').then(response => {
//       console.log(response);
//       console.log(22)
//     });
//   })
// })
    onMounted(() => {
        bus.on('loading', (param) => {
            if (param.type === 'show') {
                loadingVisible.value = true;
                if (param.msg) {
                    loadingMsg.value = param.msg;
                }
            } else if (param.type === 'hide') {
                loadingVisible.value = false;
            }
        });
        //bus.emit('loading', { type: 'show', msg: 'ダウンロードには、数分かかりますので、少しお待ちください' });
    });
</script>
<style setup>
    .el-menu-item.is-active {
        color: #ffffff !important;
        background-color: #385C8D !important;
    }
    .narrowDatePicker {
        width: 130px !important;
    }
    .spinner {
        position: fixed;
        width: 100%;
        top: 40%;
        color: #fff;
        z-index: 2999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .spinner-border {
        width: 50px;
        height: 50px;
        border: 8px solid rgba(255, 255, 255, 0.2);
        border-top: 8px solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    .alert-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        opacity: 0.5;
        z-index: 2998;
    }
</style>