import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

let downloadLoadingInstance;
// ログインするために再び表示されますか
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 作成するaxios実例
const service = axios.create({
  // axios中央の要求構成baseURLオプション，リクエストを表示しますURLパブリックセクション
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // タイムアウト
  timeout: 300000
})

// requestインターセプター
service.interceptors.request.use(config => {
  // 設定が必要ですか？ token
  const isToken = (config.headers || {}).isToken === false
  // データが繰り返し送信するのを防ぐ必要がありますか
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 各リクエストにキャリーカスタムとしますtoken 実際の状況に従って自分で変更してください
  }
  // getマッピングを要求しますparamsパラメーター
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length; // データをリクエストします
    const limitSize = 5 * 1024 * 1024; // 制限されたストレージデータ5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + 'データのリクエストが5Mの制限を超えています。繰り返し提出を防ぐために、再度検証を行うことができません。')
      return config;
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                // 住所を要求します
      const s_data = sessionObj.data;              // データをリクエストします
      const s_time = sessionObj.time;              // リクエスト時間
      const interval = 1000;                       // 間隔(ms)，これよりも小さく、繰り返し提出されるとみなされます
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = 'データは処理されています，提出を繰り返さないでください';
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// レスポンスインターセプター
service.interceptors.response.use(res => {
    // ステータスコードが設定されていない場合、ステータスはsuccessにします
    const code = res.data.code || 200;
    // エラーメッセージを取得します
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // バイナリデータは直接返されます
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('ログインステータスの有効期限が切れています。このページに待機しますか、または再度ログインしてください。', 'システムのヒント', { confirmButtonText: '再ログインします', cancelButtonText: 'キャンセル', type: 'warning' }).then(() => {
          isRelogin.show = false;
          useUserStore().logOut().then(() => {
            location.href = '/index';
          })
      }).catch(() => {
        isRelogin.show = false;
      });
    }
      return Promise.reject('セッションが無効です。お手数ですが、再度ログインしてください。')
    } else if (code === 500) {
      ElMessage({ message: 
               msg.indexOf('SizeLimitExceededException') != -1 ||  msg.indexOf('Request Entity Too Large') != -1 ? 'アップロードされたファイルサイズが許可されている制限を超えているので、保存できません。' : 
               msg.indexOf('java') != -1 ? 'システムエラーが発生しました。システム管理者に問い合わせてください。' : msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      ElMessage({ message: msg.indexOf('java') != -1 ? 'システムエラーが発生しました。システム管理者に問い合わせてください。' : msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      if (code === 204) {
        ElMessage({ message: msg, type: 'error'  })
        return Promise.reject(msg)
      } else {
        ElMessage({ message: msg.indexOf('削除') != -1 ||  msg.indexOf('更新') != -1 || msg.indexOf('変更') != -1 ? msg : 'システムエラーが発生しました。システム管理者に問い合わせてください。', type: 'error'  })
      }
      if (code === 205 && msg.indexOf('変更') != -1) {
        return  Promise.resolve(res.data);
      } else {
        return Promise.reject('error')
      }
      
    } else {
      return  Promise.resolve(res.data)
    }
  },
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "バックエンドインターフェイス接続異常";
    } else if (message.includes("timeout")) {
      message = "システムインターフェイス请求タイムアウト";
    } else if (message.includes("Request failed with status code")) {
      message = message.indexOf('413') != -1 || message.indexOf('SizeLimitExceededException') != -1 || message.indexOf('Request Entity Too Large') != -1 ? "アップロードされたファイルサイズが許可されている制限を超えているので、保存できません。" : "システムインターフェイス" + message.substr(message.length - 3) + "異常な";
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// GMダウンロードする処理
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({ text: "データをダウンロードします，お待ちください", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data);
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      ElMessage.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    ElMessage.error('ダウンロードファイルにエラーがあります，管理者に連絡してください！')
    downloadLoadingInstance.close();
  })
}

export default service
