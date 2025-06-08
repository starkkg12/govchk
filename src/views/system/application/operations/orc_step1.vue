<template>
    <cardShadow>
        <template #header-title>
          リクエスト　&lt;&lt;{{ props.rowData.serviceName }}&gt;&gt; データ化結果一覧
        </template>
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="180px">
          <el-row style="margin-bottom: -8px;">
            <el-col :span="24">
              <el-form-item label="データ化ステータス：" prop="serviceId" justify="start">
                  {{props.rowData.status}}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="データ化出力日時：" prop="createdTime" justify="start">
                {{ props.rowData.createdTime }}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
  
    
        <el-table v-loading="loading" :data="props.rowData.fileInfos" @selection-change="handleSelectionChange">
          <el-table-column align="right" label="項目番号" prop="id" sortable width="150px" >
            <template #default="scope" >
              {{ (scope.$index + 1)  }}
            </template>
          </el-table-column>
          <el-table-column label="ファイル種別" align="left" prop="name" />
          <el-table-column label="ファイル名" align="left" prop="">
              <template #default="scope">
                  {{ scope.row.fileName }}
                  <el-button link type="primary" icon="View" @click="fileView(scope.row)" />
              </template>
          </el-table-column>
            <el-table-column label="テンプレート" align="left" props="">
                <template #default="scope">
                    <div v-for="(item, index) in scope.row.templateFiles" :key="index" style="margin-bottom: 1px; word-break: break-word;">
                        {{ item.templateName }}
                    </div>
                </template>
            </el-table-column>
          <el-table-column label="ページ" align="left" width="80px">
            <template #default="scope" >
              <div v-for="(item, index) in scope.row.templateFiles" :key="index" style="height: 25px">
                {{ item.totalPage ? item.finishPage + '/' + item.totalPage : '' }}
              </div>
           </template>
          </el-table-column>
          <el-table-column label="ステータス" align="left" prop="status" width="180px"/>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120px">
            <template #default="scope">
              <el-tooltip content="データ化結果編集" placement="top" v-hasPermi="['system:ocr:edit']" >
                <el-button link type="primary" :disabled="!(scope.row.status.includes('データ化完了') || scope.row.status.includes('エラー')) || scope.row.digiconTotalCount !== scope.row.localUrlCount" icon="Edit" @click="handleView(scope.row, 'edit')" />
              </el-tooltip>
              <el-tooltip content="データ化結果参照" placement="top" >
                <el-button link type="primary" :disabled="!(scope.row.status.includes('データ化完了') || scope.row.status.includes('エラー')) || scope.row.digiconTotalCount !== scope.row.localUrlCount" icon="View" @click="handleView(scope.row, 'view')" />
              </el-tooltip>
              <el-tooltip content="ダウンロード" placement="top" >
                <el-button link type="primary" :disabled="!(scope.row.status.includes('データ化完了') || scope.row.status.includes('エラー')) || scope.row.digiconTotalCount !== scope.row.localUrlCount" icon="Download" @click="handleDownload(scope.row)"/>
              </el-tooltip>
              <el-tooltip content="削除" placement="top">
                <el-button :disabled="!isAdmin || ocrDelDisabled" link type="primary" icon="Delete"  @click="handleDelete(scope.row)"/>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
    
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize" @pagination="getList" />
          <el-row justify="right" class="button_row" style="margin-top: 1em">
            <el-button type="default" size="large" plain @click="cancel">×　閉じる</el-button>
          </el-row>
     
      </cardShadow>
  
    
    </template>
    
    <script setup name="Application">
    import cardShadow from "@/components/Customized/cardShadow";
    import { getInfoData, downloadFile, delData } from "@/api/system/application/info";
    import { getFileView, downloadCsv } from "@/api/system/application/file";
    import {inject, onMounted} from "vue";
    import useUserStore from "@/store/modules/user";
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import * as pdfjsLib from 'pdfjs-dist';
    import 'pdfjs-dist/build/pdf.worker.entry';

    const { proxy } = getCurrentInstance();
    const props = defineProps(['rowData','ocrDelDisabled']);
    const bus = inject('$bus');
    const applicationList = ref([]);
    const loading = ref(false);
    const showSearch = ref(true);
    const total = ref(0);
    const emit = defineEmits(['callStep2', 'cancel'])
    const currentUserRoleKey = useUserStore().roles[0]
    const isAdmin = currentUserRoleKey == 'admin' || currentUserRoleKey=='SCFTAdmin'
    const ocrDelDisabled = props.ocrDelDisabled;
    
    
    const data = reactive({
      form: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        createdTime: null,
        userId: null,
        serviceId: null
      },
      rules: {
      }
    });
    
    
    // todo fake data
    
    const { queryParams, form,  } = toRefs(data);
    
    
    
    // 検索 エリア
    /** 検索 */
    function handleQuery() {
      queryParams.value.pageNum = 1;
      getList();
    }
    
    /** リセット */
    function resetQuery() {
      proxy.resetForm("queryRef");
      handleQuery();
    }
    
   
    // フォームのリセット
    function reset() {
      form.value = {
        id: null,
        createdTime: null,
        userId: null,
        serviceId: null
      };
      proxy.resetForm("applicationRef");
    }
    
    
    // アクションエリア
    /** Viewボタンの処理 */
    // todo need test
    function handleView(row, type) {
      reset();
      // editOpen2.value = true;
      // form.value = {}
      const fileLimitGroupFiles=props.rowData.fileInfos.filter(item => item.name ==row.name);
      emit('callStep2',{'row': row, 'type': type,'groupFiles':fileLimitGroupFiles});
    }

    async function fileView(row) {
        try {
            bus.emit('loading', { type: 'show'});
            const response = await getFileView(row.id);
            const blob = new Blob([response], { type: 'application/zip' });

            const zip = new JSZip();
            const unzipped = await zip.loadAsync(blob);
            bus.emit('loading', { type: 'hide'});
            unzipped.forEach(async (relativePath, file) => {
                const fileBlob = await file.async('blob');
                openBlobInNewWindow(fileBlob, file.name);
            });
        } catch (error) {
            bus.emit('loading', { type: 'hide'});
            console.error('Error downloading or processing file:', error);
        }
    }

    async function openBlobInNewWindow(blob, filename) {
        const url = URL.createObjectURL(blob);
        const fileExtension = filename.split('.').pop().toLowerCase();

        const processPdf = async (pdfDoc) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const pages = [];
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                pages.push(canvas.toDataURL());
            }

            return pages;
        };

        try {
            let content;

            if (fileExtension === 'pdf') {
                console.log('Loading PDF...');
                const loadingTask = pdfjsLib.getDocument({ url });
                const pdfDoc = await loadingTask.promise;
                console.log('PDF loaded successfully.');

                const pages = await processPdf(pdfDoc);
                content = pages.map(pageDataUrl => {
                    return `<img src="${pageDataUrl}" style="margin-left: 15%; width: 70%; height: auto;">`;
                }).join('');
            } else {
                content = `<img src="${url}" style="margin-left: 15%; width: 70%; height: auto;">`;
            }

            const newWindow = window.open('', '_blank');
            if (!newWindow) {
                URL.revokeObjectURL(url);
                return;
            }

            newWindow.document.body.innerHTML = content;
            newWindow.onload = () => {
                URL.revokeObjectURL(url);
            };
        } catch (error) {
            console.error('Error rendering file:', error);
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.body.innerHTML = '<p>Failed to load file.</p>';
            }
            URL.revokeObjectURL(url);
        }
    }

    async function handleDownload(row) {
        bus.emit('loading', { type: 'show', msg: 'ダウンロードには、数分かかりますので、少しお待ちください。'});
        const response = await downloadCsv(row.id);
        bus.emit('loading', { type: 'hide'});
        const files = response.data;

        for (const file of files) {
            const { fileName, content } = file;
            const blob = new Blob([Uint8Array.from(atob(content), c => c.charCodeAt(0))]);
            saveAs(blob, fileName);
        }
    }

    function isFileNameInvalid(fileName) {
        const invalidCharPattern = /[^\x20-\x7E]/;
        return invalidCharPattern.test(fileName);
    }

    function handleDelete(row) {
        proxy.$modal.confirm('ファイル"' + row.fileName + '"を削除してもよろしいでしょうか？').then(function () {
            return delData({id:row.id});
        }).then(response => {
            if(response.code === 200) {
                props.rowData.fileInfos.forEach(function (item, index) {
                    if(item.id === row.id){
                        props.rowData.fileInfos.splice(index, 1);
                    }
                });
                proxy.$modal.msgSuccess("削除しました");
            }
        }).catch(() => {});
    }
    function cancel() {
      reset();
      emit('cancel');
    }

    // getList();
    </script>
    <style scoped> 
    .is-justify-right {
      justify-content: right;
    }
    .el-card .is-always-shadow {
      box-shadow: unset!important;
    }
    .el-col {
      margin-bottom: unset;
    }
    .el-form-item__label {
        justify-content: unset;
    }
    </style>
    