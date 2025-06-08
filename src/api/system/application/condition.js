import request from '@/utils/request'

// application_condition一覧の取得
export function listCondition(query) {
  return request({
    url: '/system/application/condition/list',
    method: 'get',
    params: query
  })
}

// application_condition詳細の取得
export function getCondition(id) {
  return request({
    url: '/system/application/condition/' + id,
    method: 'get'
  })
}

// application_conditionの追加
export function addCondition(data) {
  return request({
    url: '/system/application/condition',
    method: 'post',
    data: data
  })
}

// application_conditionの修正
export function updateCondition(data) {
  return request({
    url: '/system/application/condition',
    method: 'put',
    data: data
  })
}

// application_conditionの削除
export function delCondition(id) {
  return request({
    url: '/system/application/condition/' + id,
    method: 'delete'
  })
}
