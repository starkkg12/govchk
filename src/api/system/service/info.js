import request from '@/utils/request'

// service_info一覧の取得
export function listInfo(query) {
  return request({
    url: '/system/service/info/list',
    method: 'get',
    params: query
  })
}

// service_info詳細の取得
export function getInfo(id) {
  return request({
    url: '/system/service/info/' + id,
    method: 'get'
  })
}

// service_infoの追加
export function addInfo(data) {
  return request({
    url: '/system/service/info',
    method: 'post',
    data: data
  })
}

// service_infoの更新
export function updateInfo(data) {
  return request({
    url: '/system/service/info',
    method: 'put',
    data: data
  })
}

// service_infoの削除
export function delInfo(id) {
  return request({
    url: '/system/service/info/' + id,
    method: 'delete'
  })
}

// 編集画面情報の取得
export function getInfoListByServiceId(id) {
  return request({
    url: '/system/service/info/service/' + id,
    method: 'get'
  })
}

// 基本情報入力取得
export function getServieInfo(serviceId) {
  return request({
    url: '/system/service/info/input/'+serviceId,
    method: 'get',
  })
}

// 基本情報入力更新
export function updateServieInfo(data) {
  return request({
    url: '/system/service/info/updateServieInfo',
    method: 'post',
    data: data
  })
}
