import request from '@/utils/request'

// application一覧の取得
export function listApplication(query) {
  return request({
    url: '/system/application/list',
    method: 'get',
    params: query
  })
}

// application詳細の取得
export function getApplication(id) {
  return request({
    url: '/system/application/' + id,
    method: 'get'
  })
}

// applicationの追加
export function addApplication(data) {
  return request({
    url: '/system/application',
    method: 'post',
    data: data
  })
}

// applicationの修正
export function updateApplication(data) {
  return request({
    url: '/system/application',
    method: 'put',
    data: data
  })
}

// applicationの削除
export function delApplication(id) {
  return request({
    url: '/system/application/' + id,
    method: 'delete'
  })
}

// 未提出applicationの削除
export function delOutstandingApplication(id) {
  return request({
    url: '/system/application/outstanding/' + id,
    method: 'delete'
  })
}

// application一覧の取得
export function listApplicationByService(query) {
  return request({
    url: '/system/application/service',
    method: 'get',
    params: query
  })
}

export function getApplicationSummary() {
  return request({
    url: '/system/application/count',
    method: 'get'
  })
}

export function refreshStatus(data) {
  return request({
    url: '/system/application/refreshStatus',
    method: 'post',
    data: data
  })
}
