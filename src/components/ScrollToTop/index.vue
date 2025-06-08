<template>
    <button v-if="isVisible" @click="scrollToTop" class="top-button">
        <span class="arrow"></span>
        <span class="text">TOP</span>
    </button>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';

    const isVisible = ref(false);

    const scrollFunction = () => {
        if (window.scrollY > 500) {
            isVisible.value = true;
        } else {
            isVisible.value = false;
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    onMounted(() => {
        window.addEventListener('scroll', scrollFunction);
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', scrollFunction);
    });
</script>

<style scoped>
    .top-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        width: 50px;
        height: 50px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        font-size: 18px;
    }

    .top-button:hover {
        background-color: #0056b3;
    }

    .arrow {
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 8px solid white;
        margin-bottom: 2px;
    }

    .text {
        font-size: 14px;
    }
</style>