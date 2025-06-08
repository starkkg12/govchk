import request from '@/utils/request'

// gov一覧の取得
export function listGov(query) {
  return request({
    url: '/system/gov/list',
    method: 'get',
    params: query
  })
}

// 自治体名で検索。10件まで
export function listGovByName(query) {
  return request({
    url: '/system/gov/search',
    method: 'get',
    params: query
  })
}


// gov詳細の取得
export function getGov(id) {
  return request({
    url: '/system/gov/' + id,
    method: 'get'
  })
}

// govの追加
export function addGov(data) {
  return request({
    url: '/system/gov',
    method: 'post',
    data: data
  })
}

// govの更新
export function updateGov(data) {
  return request({
    url: '/system/gov',
    method: 'put',
    data: data
  })
}

// govの削除
export function delGov(id) {
  return request({
    url: '/system/gov/' + id,
    method: 'delete'
  })
}

export function countGovService(govId) {
  return request({
    url: '/system/gov/count/service/' + govId,
    method: 'get'
  })

}

// 自治体IDをチェック
export function checkGovShowId(showId) {
  return request({
    url: '/system/gov/showId/' + showId,
    method: 'get'
  })
}

// 自治体名をチェック
export function checkGovName(name) {
  return request({
    url: '/system/gov/name/' + name,
    method: 'get'
  })
}

// ダッシュボードすべてのgov詳細の取得
export function getAllCountGovService() {
  return request({
    url: '/system/gov/all/count/service',
    method: 'get'
  })
}


// 自治体デジパス請求一覧の取得
export function getDigithPath(govId) {
  return request({
    url: '/system/gov/digipath/'+govId,
    method: 'get'
  })
}


// 請求情報一覧
export function getMonthlyReportList(query) {
  return request({
    url: '/system/gov/getMonthlyReportList',
    method: 'get',
    params: query
  })
}

// 請求情報一覧 請求金額
export function getMonthlyReportTotalAmount(query) {
  return request({
    url: '/system/gov/getMonthlyReportTotalAmount',
    method: 'get',
    params: query
  })
}

export function delCheck(showId) {
  return request({
    url: '/system/gov/delCheck/' + showId,
    method: 'get'
  })
}

export function importData(data) {
  return request({
    url: '/system/gov/importData',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}
