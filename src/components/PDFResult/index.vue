<template>
    <div class="container" v-focus-nav>
        <div class="editor-container">
            <div class="pdf-box">
                <div class="button-group">
                    <el-button :icon="Refresh" @click="resetZoom" />
                    <el-button :icon="ZoomIn" @click="zoomIn" />
                    <el-button :icon="ZoomOut" @click="zoomOut" />
                </div>
                <div class="pdf-template" id="canvasContainer" ref="pdfContainer" @mousedown="startDrag">
                </div>
            </div>

            <div class="project-list">
                <table>
                    <thead>
                    <tr>
                        <th>フィールド</th>
                        <th>値</th>
                        <th>編集者</th>
                        <th>ステータス</th>
                        <th>備考</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(field, index) in updateFields" :key="index" v-show="field.fieldName !== 'ドキュメント名'">
                        <td>{{ field.fieldName }}</td>
                        <td>{{ field.fieldValue }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div style="width: 100%; margin-top: 10px;">
            <el-button class="fr" @click="cancel">×　閉じる</el-button>
            <div class="clearfix"></div>
        </div>
    </div>
</template>

<script setup>
    import { Refresh, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
    import {ref, reactive, onMounted, nextTick, getCurrentInstance, watch, inject} from 'vue';
    import * as pdfjsLib from 'pdfjs-dist/build/pdf';
    import { getFileOcr, modifyOcr, getOcrResult } from '@/api/system/application/file';

    const { proxy } = getCurrentInstance();

    const bus = inject('$bus');
    const pdfPages = ref([]);
    const updateFields = ref([]);
    const pdfContainer = ref(null);
    const zoomScale = ref(1);
    const scale = ref(1);
    const props = defineProps({
        id: {
            type: Number,
            required: true
        }
    });
    const emit = defineEmits(['cancel']);
    let renderTasks = [];
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    const errorFlag = ref('false');
    const errorInfo = ref([]);
    const errorItem = ref([]);
    let data = [];
    let processedImageData = null;
    let imageRef = ref(null);
    let saveFlg = true;

    const fetchPdf = async (id) => {
        try {
            bus.emit('loading', { type: 'show'});
            try {
                const response = await getFileOcr(id);
                bus.emit('loading', { type: 'hide'});
                errorFlag.value = response.errorFlag;
                if(response.errorInfo){
                    errorInfo.value = response.errorInfo;
                    response.errorInfo.forEach((item) => {
                        if(item.column2 === '項目レベル'){
                            errorItem.value.push(item.column3);
                        }
                    });
                }
                if(response.data){
                    response.data = transformData(response.data);
                    data.value = response.data;
                }
                const binaryString = atob(response.base64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const blob = new Blob([bytes.buffer], { type: 'image/jpeg' });

                await handleImage(blob, response);
            } catch (error) {
                bus.emit('loading', { type: 'hide'});
            }
        } catch (error) {
            console.error("Error fetching or rendering PDF:", error);
        }
    };

    function transformData(data) {
        if (data.length === 0) return [];

        const item = data[0];

        return Object.entries(item).map(([key, value]) => {
            return {
                key: key.replace(/"/g, ''),
                value: value.replace(/"/g, '')
            };
        });
    }

    const handleImage = async (blob, response) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            const image = new Image();
            image.src = base64data;

            image.onload = () => {
                imageRef.value = image;
                const canvas = document.createElement('canvas');
                const canvasContainer = document.getElementById('canvasContainer');
                const canvasWidth = canvasContainer.clientWidth;
                scale.value = canvasWidth / image.width;

                canvas.width = canvasWidth;
                canvas.height = image.height * scale.value;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                while (canvasContainer.firstChild) {
                    canvasContainer.removeChild(canvasContainer.firstChild);
                }
                canvasContainer.appendChild(canvas);

                pdfPages.value = [{ pageNumber: 1, canvas }];
                if(data.value.length>0){
                    renderImageFields(context, canvas.width, canvas.height, response);
                }

                processedImageData = context.getImageData(0, 0, canvas.width, canvas.height);
            };

            image.onerror = (e) => {
                console.error("Image load error:", e);
            };
        };
    };

    const renderImageFields = (context, width, height, response) => {
        response.data.forEach((value_item) => {
            const pattern = /\[■{1,}\]/;
            let highlight = false;
            if (pattern.test(value_item.value)) {
                highlight = true;
            }
            if(errorItem.value.includes(trimString(value_item.key))){
                highlight = true;
            }
            let updateField = {
                pageNumber: 1,
                fieldName: trimString(value_item.key),
                fieldValue: trimString(value_item.value),
                highlight: highlight
            }
            let has = false;
            response.itemList.forEach((item) => {
                if (updateField.fieldName === item.itemName) {
                    updateField.fieldType = item.dataType;
                    const parsedCoordinate = JSON.parse(item.coordinate);
                    updateField.rect = {
                        0: parsedCoordinate.x * scale.value,
                        1: parsedCoordinate.y * scale.value,
                        2: parsedCoordinate.width * scale.value,
                        3: parsedCoordinate.height * scale.value
                    };
                    has = true;
                }
            });
            if (!has) {
                updateField.dataType = 'text';
            }
            updateFields.value.push(updateField);

            if (has) {
                context.fillStyle = 'rgba(255, 203, 64, 0.3)';
                context.fillRect(
                    updateField.rect[0],
                    updateField.rect[1],
                    updateField.rect[2],
                    updateField.rect[3]
                );
            }
        });
    };

    const trimString = (str) => {
        if (str) {
            return str.replace(/^[\s\\"]+|[\s\\"]+$/g, '');
        }
        return '';
    }

    const datatype = (type) => {
        return 'text';
    };

    const inputfocus = async (index) => {
        await highlightCell(index);
        await scrollToField(index);
    };

    const highlightCell = async (index) => {
        const field = updateFields.value[index];
        const canvas = pdfContainer.value.querySelector('canvas');
        if (canvas && field.rect && processedImageData) {
            const context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imageRef.value, 0, 0, canvas.width, canvas.height);
            renderFields(context, canvas.width, canvas.height);

            context.fillStyle = 'rgba(255, 111, 111, 0.3)';

            const x = field.rect[0] * zoomScale.value;
            const y = field.rect[1] * zoomScale.value;
            const width = field.rect[2] * zoomScale.value;
            const height = field.rect[3] * zoomScale.value;

            context.fillRect(x, y, width, height);
        }
    };
    const startDrag = (e) => {
        isDragging = true;
        startX = e.pageX - pdfContainer.value.offsetLeft;
        startY = e.pageY - pdfContainer.value.offsetTop;
        scrollLeft = pdfContainer.value.scrollLeft;
        scrollTop = pdfContainer.value.scrollTop;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    };

    const drag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - pdfContainer.value.offsetLeft;
        const y = e.pageY - pdfContainer.value.offsetTop;
        const walkX = (x - startX) * 1.5; // ドラッグを速くする
        const walkY = (y - startY) * 1.5;
        pdfContainer.value.scrollLeft = scrollLeft - walkX;
        pdfContainer.value.scrollTop = scrollTop - walkY;
    };

    const stopDrag = () => {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    };

    const scrollToField = async (index) => {
        const field = updateFields.value[index];
        const canvas = pdfContainer.value.querySelector('canvas');
        if (canvas && field.rect) {
            await nextTick();

            const containerRect = pdfContainer.value.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const fieldX = field.rect[0] * zoomScale.value;
            const fieldY = field.rect[1] * zoomScale.value;
            const fieldWidth = field.rect[2] * zoomScale.value;
            const fieldHeight = field.rect[3] * zoomScale.value;

            const offset = 50;

            let scrollX = fieldX + canvasRect.left - containerRect.left - (containerRect.width - fieldWidth) / 2;
            let scrollY = fieldY + canvasRect.top - containerRect.top - (containerRect.height - fieldHeight) / 2;

            scrollX = Math.max(0, scrollX - offset);
            scrollY = Math.max(0, scrollY - offset);

            const maxScrollLeft = pdfContainer.value.scrollWidth - pdfContainer.value.clientWidth;
            const maxScrollTop = pdfContainer.value.scrollHeight - pdfContainer.value.clientHeight;

            pdfContainer.value.scrollLeft = Math.max(0, Math.min(maxScrollLeft, scrollX));
            pdfContainer.value.scrollTop = Math.max(0, Math.min(maxScrollTop, scrollY));

            const extraOffset = 20;
            if (pdfContainer.value.scrollLeft + containerRect.width < scrollX + fieldWidth + offset) {
                pdfContainer.value.scrollLeft = Math.min(maxScrollLeft, pdfContainer.value.scrollLeft + extraOffset);
            }
            if (pdfContainer.value.scrollTop + containerRect.height < scrollY + fieldHeight + offset) {
                pdfContainer.value.scrollTop = Math.min(maxScrollTop, pdfContainer.value.scrollTop + extraOffset);
            }
        }
    };


    const cancel = () => {
        emit('cancel');
    };

    const flowSubmit = () => {
        getOcrResult(109);
    };

    const resetZoom = () => {
        zoomScale.value = 1;
        applyZoom();
    };

    const zoomIn = () => {
        if (zoomScale.value < 2) {
            zoomScale.value = Math.min(2, zoomScale.value + 0.2);
            applyZoom();
        }
    };

    const zoomOut = () => {
        if (zoomScale.value > 1) {
            zoomScale.value = Math.max(1, zoomScale.value - 0.2);
            applyZoom();
        }
    };

    const renderFields = (context, width, height) => {
        updateFields.value.forEach((field) => {
            if (field.rect) {
                context.fillStyle = 'rgba(255, 203, 64, 0.3)';
                context.fillRect(
                    field.rect[0] * zoomScale.value,
                    field.rect[1] * zoomScale.value,
                    field.rect[2] * zoomScale.value,
                    field.rect[3] * zoomScale.value
                );
            }
        });
    };

    const applyZoom = () => {
        const canvas = pdfContainer.value.querySelector('canvas');
        if (canvas && imageRef.value) {
            const context = canvas.getContext('2d');
            const containerWidth = pdfContainer.value.clientWidth;
            const newCanvasWidth = containerWidth * zoomScale.value;
            const newCanvasHeight = imageRef.value.height * (newCanvasWidth / imageRef.value.width);
            canvas.width = newCanvasWidth;
            canvas.height = newCanvasHeight;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(imageRef.value, 0, 0, canvas.width, canvas.height);
            renderFields(context, canvas.width, canvas.height);
        }
    };

    watch(() => props.id, (newValue, oldValue) => {
        if (newValue !== oldValue) {
            updateFields.value = [];
            zoomScale.value = 1;
            fetchPdf(newValue);
        }
    });
    onMounted(async () => {
        const workerSrc = await import('pdfjs-dist/build/pdf.worker.entry');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;
    });
</script>

<style scoped>
    /deep/ .highlight .el-input__inner {
        background-color: #FF9494;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px 0;
    }

    .editor-container {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    .pdf-box {
        width: 62%;
        height: 860px;
        position: relative;
    }

    .pdf-template {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
        cursor: grab;
        border: 1px solid #ddd;
    }

    .pdf-template:active {
        cursor: grabbing;
    }

    .project-list {
        width: 36%;
        height: 860px;
        overflow: auto;
    }

    .pdf-template canvas {
        display: block;
        margin-bottom: 10px;
    }

    .pdf-template table {
        width: 100%;
        border-collapse: collapse;
    }

    .pdf-template th,
    .pdf-template td {
        border: 1px solid #ccc;
        padding: 5px;
        text-align: left;
    }

    .el-button + .el-button {
        margin-left: 0;
    }


    .error-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 1em;
        font-family: Arial, sans-serif;
        text-align: left;
    }

    .error-table thead tr {
        background-color: #f2f2f2;
        color: #333;
        text-align: left;
        font-weight: bold;
    }

    .error-table th, table td {
        padding: 12px 15px;
        border: 1px solid #ddd;
    }

    .error-table tbody tr:nth-of-type(even) {
        background-color: #f9f9f9;
    }

    .error-table tbody tr:nth-of-type(odd) {
        background-color: #ffffff;
    }

    .error-table td {
        vertical-align: top;
    }
</style>
