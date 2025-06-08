import request from '@/utils/request'
export function listPaln(query) {
    return request({
      url: '/system/plan/list',
      method: 'get',
      params: query
    })
  }
  
export function getPaln(planId) {
    return request({
      url: '/system/plan/'+planId,
      method: 'get',
    })
  }

// プランを追加
export function addPlan(data) {
  return request({
    url: '/system/plan',
    method: 'post',
    data: data
  })
}  