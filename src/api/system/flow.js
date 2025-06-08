import request from '@/utils/request'

export function getFlowList(query) {
    return request({
        url: '/system/flow/list',
        method: 'get',
        params: query
    })
}

export function searchFlowList(data) {
    return request({
        url: '/system/flow/search',
        method: 'post',
        data: data
    })
}

export function add(data) {
    return request({
        url: '/system/flow/add',
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function edit(data) {
    return request({
        url: '/system/flow/edit',
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function getFlowInfo(id) {
    return request({
        url: '/system/flow/'+ id,
        method: 'get'
    })
}

export function changeStatus(data) {
    return request({
        url: '/system/flow/changeStatus',
        method: 'post',
        data: data
    })
}

export function deleteFlow(id) {
    return request({
        url: '/system/flow/'+ id,
        method: 'delete'
    })
}

export function tmpUpdate(data) {
    return request({
        url: '/system/template/tmpUpdate',
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function getTmpList(flowId) {
    return request({
        url: '/system/template/getListByFlow/'+flowId,
        method: 'get',
    })
}
export function listFlowByService(query) {
    return request({
      url: '/system/service/flows',
      method: 'get',
      params: query
    })
  }