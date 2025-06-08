import request from '@/utils/request'

// 担当者業務一覧の取得
export function listInfo(data) {
  return request({
    url: '/system/service/list',
    method: 'get',
    data: data
  })
}

export function unsubmittedListInfo(query) {
    return request({
        //url: '/system/service/unsubmitted_list/?pageNum='+data.pageNum+'&pageSize='+data.pageSize, 
        //method: 'post',
        //data: data
        url: '/system/service/unsubmitted_list',
        method: 'get',
        params: query
    })
}

export function addRequestlist(data) {
  return request({
    url: '/system/service/addRequestlist',
    method: 'get',
    data: data
  })
}

