import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// ユーザーリストを取得
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// ユーザーの詳細を取得
export function getUser(userId) {
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  })
}

// ユーザーを追加
export function addUser(data) {
  return request({
    url: '/system/user',
    method: 'post',
    data: data
  })
}

// ユーザーを変更
export function updateUser(data) {
  return request({
    url: '/system/user',
    method: 'put',
    data: data
  })
}
export function editOnlySelf(data) {
  return request({
    url: '/system/user/editOnlySelf',
    method: 'post',
    data: data
  })
}

// ユーザーを削除
export function delUser(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  })
}

// ユーザーパスワードをリセット
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: data
  })
}

// ユーザーステータスの変更
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: data
  })
}

// ユーザーの個人情報を取得
export function getUserProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

// ユーザーを変更
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  })
}

// ユーザーパスワードを更新
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data
  })
}

// ユーザーアバターをアップロード
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data
  })
}

// ユーザーロールを取得
export function getAuthRole(userId) {
  return request({
    url: '/system/user/authRole/' + userId,
    method: 'get'
  })
}

// ユーザーロールを更新
export function updateAuthRole(data) {
  return request({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  })
}

// 関連部門を取得
export function deptTreeSelect() {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  })
}

export function listUserByCondition(query) {
  return request({
    url: '/system/user/list/condition',
    method: 'get',
    params: query
  })
}

export function listUserByService(query) {
  return request({
    url: '/system/user/service/users',
    method: 'get',
    params: query
  })
}


// 20240701追加
export function checkPassword(pwd) {
  const data = {
    pwd,
  }
  return request({
    url: '/system/user/profile/checkPassword',
    method: 'put',
    params: data
  })
}

export function importData(data) {
  return request({
    url: '/system/user/importData',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}
