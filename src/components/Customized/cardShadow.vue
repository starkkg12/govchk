<template>
    <el-card class="box-card body-card">
        <div class="app-container">
            <div class="header" >
                <slot name="header-title">

                </slot>
            </div>
            <slot>

            </slot>
        </div>
    </el-card>
</template>
<script setup>
    import { onMounted, onBeforeUnmount } from 'vue';
    onMounted(() => {
        const originalBackgroundColor = document.body.style.backgroundColor;

        document.body.style.backgroundColor = '#fff';

        onBeforeUnmount(() => {
            document.body.style.backgroundColor = originalBackgroundColor;
        });
    });
</script>
<style>
.body-card {
    /* shadow */
    box-shadow: 0 20px 120px 0 rgba(0, 0, 0.5, 0.1);
    margin: 20px 20px 200px 20px;
    /* card angle change */
    border-radius: 10px;
}

.header {
    font-size: 22px;
    margin-top: -10px;
    margin-bottom: 20px;
}

body {
    font-size: 16px;
    color: #303133;
    font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    line-height: 1.5;
    -webkit-tap-highlight-color: transparent;
    -webkit-overflow-scrolling: touch;
    -webkit-text-size-adjust: 100%;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
}
</style>