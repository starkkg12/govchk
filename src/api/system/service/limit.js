import request from '@/utils/request'

// service_file_limit一覧の取得
export function listLimit(data) {
  return request({
    url: '/system/service/limit/list',
    method: 'get',
    params: data
  })
}

// service_file_limit詳細の取得
export function getLimit(id) {
  return request({
    url: '/system/service/limit/' + id,
    method: 'get'
  })
}

// service_file_limitの追加
export function addLimit(data) {
  return request({
    url: '/system/service/limit',
    method: 'post',
    data: data
  })
}

// service_file_limitの修正
export function updateLimit(data) {
  return request({
    url: '/system/service/limit',
    method: 'put',
    data: data
  })
}

// service_file_limitの削除
export function delLimit(id) {
  return request({
    url: '/system/service/limit/' + id,
    method: 'delete'
  })
}

// 編集画面情報の取得
export function getFileLimitListByServiceId(serviceId) {
  return request({
    url: '/system/service/limit/service/' + serviceId,
    method: 'get'
  })
}

export function saveLimitFile(data) {
  return request({
    url: '/system/service/limit/save',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

export function getMasterFileLimitListByServiceId(serviceId) {
  return request({
    url: '/system/service/masterFilelimit/service/' + serviceId,
    method: 'get'
  })
}

// service_master_file_limit詳細の取得
export function getMasterLimit(id) {
  return request({
    url: '/system/service/masterFilelimit/' + id,
    method: 'get'
  })
}