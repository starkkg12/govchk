import request from '@/utils/request'

// サービス条件一覧を取得
export function listCondition(query) {
  return request({
    url: '/system/service/condition/list',
    method: 'get',
    params: query
  })
}

// サービス条件詳細を取得
export function getCondition(id) {
  return request({
    url: '/system/service/condition/' + id,
    method: 'get'
  })
}

// サービス条件を追加
export function addCondition(data) {
  return request({
    url: '/system/service/condition',
    method: 'post',
    data: data
  })
}

// サービス条件を修正
export function updateCondition(data) {
  return request({
    url: '/system/service/condition',
    method: 'put',
    data: data
  })
}

// サービス条件を削除
export function delCondition(id) {
  return request({
    url: '/system/service/condition/' + id,
    method: 'delete'
  })
}

// サービスIDより条件一覧を取得
export function getConditionListByServiceId(serviceId) { 
  return request({
    url: '/system/service/condition/service/' + serviceId,
    method: 'get'
  })
}