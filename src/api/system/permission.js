import request from '@/utils/request'

// 許可一覧を取得
export function listPermission(query) {
  return request({
    url: '/system/permission/list',
    method: 'get',
    params: query
  })
}

// 許可詳細を取得
export function getPermission(id) {
  return request({
    url: '/system/permission/' + id,
    method: 'get'
  })
}

// 許可を追加
export function addPermission(data) {
  return request({
    url: '/system/permission',
    method: 'post',
    data: data
  })
}

// 許可を修正
export function updatePermission(data) {
  return request({
    url: '/system/permission',
    method: 'put',
    data: data
  })
}

// 許可を削除
export function delPermission(id) {
  return request({
    url: '/system/permission/' + id,
    method: 'delete'
  })
}
