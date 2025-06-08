import request from '@/utils/request'

// application_file一覧の取得
export function listFile(query) {
  return request({
    url: '/system/application/file/list',
    method: 'get',
    params: query
  })
}

// application_file詳細の取得
export function getFile(id) {
  return request({
    url: '/system/application/file/' + id,
    method: 'get'
  })
}

// application_fileの追加
export function addFile(data) {
  return request({
    url: '/system/application/file',
    method: 'post',
    data: data
  })
}

// application_fileの修正
export function updateFile(data) {
  return request({
    url: '/system/application/file',
    method: 'put',
    data: data
  })
}

// application_fileの削除
export function delFile(id) {
  return request({
    url: '/system/application/file/' + id,
    method: 'delete'
  })
}

export function getDigicon(id) {
  return request({
    url: '/system/application/file/digicon/' + id,
    method: 'get'
  });
}

export function getFileOcr(id) {
  return request({
    url: '/system/application/file/ocr/' + id,
    method: 'get'
  });
}

export function getFileView(id) {
  return request({
    url: '/system/application/file/getfile/' + id,
    method: 'get',
    responseType: 'blob'
  });
}

export function downloadCsv(id) {
  return request({
    url: '/system/application/file/downloadCsv/' + id,
    method: 'get'
  });
}

export function modifyOcr(data) {
  return request({
    url: '/system/application/file/modify/ocr',
    method: 'post',
    data: data
  });
}

// csv
export function getCsv(id) {
  return request({
    url: '/csv/' + id,
    method: 'get'
  })
}

export function getPdf(id) {
  return request({
    url: '/pdf/' + id,
    method: 'get',
    responseType: 'text'
  });
}

export function getEffectiveDateFiles(query) {
  return request({
    url: '/system/file/getEffectiveDateFiles/lists',
    method: 'GET',
    params: query
  })
}

// application_file idでデジコンlistを取得
export function getDigiconFile(fileId) {
  return request({
    url: '/system/application/file/digicon/' + fileId,
    method: 'get'
  })
}

export function getSampleFile(serviceFileLimitId) {
  return request({
    url: '/system/application/file/sample/'+serviceFileLimitId,
    method: 'get',
  });
}

export function getOcrResult(id) {
  return request({
    url: '/system/result/flow/ocr/' + id,
    method: 'get'
  });
}

export function getFlowResult(id) {
  return request({
    url: '/system/flowResult/' + id,
    method: 'get'
  });
}

