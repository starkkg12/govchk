import request from '@/utils/request'

// service一覧を取得
export function listService(query) {
  return request({
    url: '/system/service/list',
    method: 'get',
    params: query
  })
}

// service詳細を取得
export function getService(id) {
  return request({
    url: '/system/service/' + id,
    method: 'get'
  })
}

// serviceを追加
export function addService(data) {
  return request({
    url: '/system/service',
    method: 'post',
    data: data
  })
}

// service及び基本情報定義などを追加
export function addServiceMatser(data) {
  return request({
    url: '/system/service/master',
    method: 'post',
    data: data
  })
}

// service及び基本情報定義などを更新
export function editServiceMatser(data) {
  return request({
    url: '/system/service/master_edit',
    method: 'post',
    data: data
  })
}


// serviceを修正
export function updateService(data) {
  return request({
    url: '/system/service',
    method: 'put',
    data: data
  })
}

// serviceを削除
export function delService(id) {
  return request({
    url: '/system/service/' + id,
    method: 'delete'
  })
}

// service一覧を取得
export function listServiceApplication(query) {
  return request({
    url: '/system/service/list/application',
    method: 'get',
    params: query
  })
}

