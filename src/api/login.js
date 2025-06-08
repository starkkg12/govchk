import request from '@/utils/request'

// ログインメソッド
export function login(username,showId,password, code, uuid) {
  const data = {
    username,
    showId,
    password,
    code,
    uuid
  }
  return request({
    url: '/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 登録処理
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// ユーザーの詳細を取得する
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// ログアウト
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 確認コードを取得する
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

export function sendForgetPWEmail(data) {
  return request({
    url: '/system/user/sendForgetPWEmail',
    method: 'post',
    headers: {
      isToken: false,
      'Content-Type': 'multipart/form-data',
    },
    data: data
  })
}

export function checkRestPWDToken(data) {
  return request({
    url: '/system/user/checkRestPWDToken',
    method: 'post',
    headers: {
      isToken: false,
      'Content-Type': 'multipart/form-data',
    },
    data: data
  })
}