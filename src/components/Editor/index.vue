<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      class="editor-img-uploader"
      v-if="type == 'url'"
    >
      <i ref="uploadRef" class="editor-img-uploader"></i>
    </el-upload>
  </div>
  <div class="editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      contentType="html"
      @textChange="(e) => $emit('update:modelValue', content)"
      :options="options"
      :style="styles"
    />
  </div>
</template>

<script setup>
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { getToken } from "@/utils/auth";

const { proxy } = getCurrentInstance();

const quillEditorRef = ref();
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // アップロードされた画像サーバーアドレス
const headers = ref({
  Authorization: "Bearer " + getToken()
});

const props = defineProps({
  /* 編集者のコンテンツ */
  modelValue: {
    type: String,
  },
  /* 高い */
  height: {
    type: Number,
    default: null,
  },
  /* 高さの最小値 */
  minHeight: {
    type: Number,
    default: null,
  },
  /* 読み取り専用 */
  readOnly: {
    type: Boolean,
    default: false,
  },
  /* ファイルサイズの制限をアップロードします(MB) */
  fileSize: {
    type: Number,
    default: 5,
  },
  /* タイプ（base64フォーマット、urlフォーマット） */
  type: {
    type: String,
    default: "url",
  }
});

const options = ref({
  theme: "snow",
  bounds: document.body,
  debug: "warn",
  modules: {
    // ツールバー構成
    toolbar: [
      ["bold", "italic", "underline", "strike"],      // 大胆な 斜めの体 降りる 行を削除します
      ["blockquote", "code-block"],                   // 引用  コードブロック
      [{ list: "ordered" }, { list: "bullet" }],      // 秩序ある、メリットはありません
      [{ indent: "-1" }, { indent: "+1" }],           // インデント
      [{ size: ["small", false, "large", "huge"] }],  // フォントサイズ
      [{ header: [1, 2, 3, 4, 5, 6, false] }],        // タイトル
      [{ color: [] }, { background: [] }],            // フォントカラー、フォントの背景色
      [{ align: [] }],                                // アライメント
      ["clean"],                                      // 清除記事フォーマット
      ["link", "image", "video"]                      // リンク、写真、ビデオ
    ],
  },
  placeholder: "コンテンツを入力してください",
  readOnly: props.readOnly
});

const styles = computed(() => {
  let style = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

const content = ref("");
watch(() => props.modelValue, (v) => {
  if (v !== content.value) {
    content.value = v === undefined ? "<p></p>" : v;
  }
}, { immediate: true });

// アップロードアドレスが設定されている場合は、写真アップロードイベントをカスタマイズします
onMounted(() => {
  if (props.type == 'url') {
    let quill = quillEditorRef.value.getQuill();
    let toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", (value) => {
      if (value) {
        proxy.$refs.uploadRef.click();
      } else {
        quill.format("image", false);
      }
    });
  }
});

// ファイルフォーマットとサイズのチェック
function handleBeforeUpload(file) {
  // 許可されたファイルの種類
  const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"];
  const isJPG = type.includes(file.type);
  // JPGファイルかどうかを確認
  if (!isJPG) {
    proxy.$modal.msgError(`ファイルの種類が不正です。`);
    return false;
  }
  // ファイルサイズのチェック
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    // ファイルサイズが制限を超えていないかどうかを確認
    if (!isLt) {
      proxy.$modal.msgError(`アップロードするファイルのサイズは ${props.fileSize} MB以内にしてください！!`);
      return false;
    }
  }
  return true;
}

// 正常にアップロードします
function handleUploadSuccess(res, file) {
  // アップロードが成功した場合
  if (res.code == 200) {
    // 豊富なテキストの例を取得します
    let quill = toRaw(quillEditorRef.value).getQuill();
    // カーソル位置を取得します
    let length = quill.selection.savedRange.index;
    // 写真を挿入します，res.urlはサーバーから取得した写真のurl
    quill.insertEmbed(length, "image", import.meta.env.VITE_APP_BASE_API + res.fileName);
    // カーソルを最後まで調整します
    quill.setSelection(length + 1);
  } else {
    proxy.$modal.msgError("写真の挿入障害");
  }
}

// 失敗した取り扱いをアップロードします
function handleUploadError() {
  proxy.$modal.msgError("写真の挿入障害");
}
</script>

<style>
.editor-img-uploader {
  display: none;
}
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "リンク地址:を入力してください";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "ビデオ地址:を入力してください";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "記事";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "タイトル1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "タイトル2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "タイトル3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "タイトル4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "タイトル5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "タイトル6";
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "標準フォント";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "steril";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等しい";
}
</style>
