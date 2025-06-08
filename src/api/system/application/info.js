import request from '@/utils/request'

// application_info一覧の取得
export function listInfo(query) {
  return request({
    url: '/system/application/list',
    method: 'get',
    params: query
  })
}

// 查询application_info詳細の取得
export function getInfo(id) {
  return request({
    url: '/system/application/info/' + id,
    method: 'get'
  })
}

// 新增application_infoの追加
export function addInfo(data) {
  return request({
    url: '/system/application/info',
    method: 'post',
    data: data
  })
}

// application_infoの修正
export function updateInfo(data) {
  return request({
    url: '/system/application/info',
    method: 'put',
    data: data
  })
}

// application_infoの削除
export function delInfo(id) {
  return request({
    url: '/system/application/info/' + id,
    method: 'delete'
  });
}

export function summary(id) {
  return request({
    url: '/system/application/info/summary/' + id,
    method: 'get'
  })
}

export function saveInfo(data) {
  return request({
    url: '/system/application/save',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}

export function getInfoData(applicationId) {
  return request({
    url: '/system/application/getInfoData/'+ applicationId,
    method: 'get'
  })
}

export function getMasterFilesPreviousVersion(serviceId) {
  return request({
    url: '/system/application/getMasterFilesPreviousVersion/' + serviceId,
    method: 'get'
  })
}

export function downloadFile(id) {
  return request({
    url: '/system/application/downloadInfoData/'+ id,
    method: 'get',
    responseType: 'blob'
  });
}

export function delData(data) {
  return request({
    url: '/system/application/deleteInfoData',
    method: 'post',
    data: data
  })
}

export function downloadData(id) {
  return request({
    url: '/system/application/downloadData/' + id,
    method: 'get'
  });
}

export function flowTask(data) {
  return request({
    url: '/system/flow/task/',
    method: 'post',
    data: data
  })
}

export function downloadAll(data) {
  return request({
    url: '/system/application/downloadAll/',
    method: 'post',
    data: data
  });
}