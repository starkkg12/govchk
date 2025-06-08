import request from '@/utils/request'

// クエリアナウンス一覧を取得
export function listNotice(query) {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: query
  })
}

// クエリアナウンスの詳細を取得
export function getNotice(noticeId) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'get'
  })
}

// 新しい発表を追加
export function addNotice(data) {
  return request({
    url: '/system/notice',
    method: 'post',
    data: data
  })
}

// 修正の発表
export function updateNotice(data) {
  return request({
    url: '/system/notice',
    method: 'put',
    data: data
  })
}

// 発表を削除
export function delNotice(noticeId) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'delete'
  })
}

// 
export function dashBoardlistNotice(query) {
  return request({
    url: '/system/notice/dashBoardlist',
    method: 'get',
    params: query
  })
}

export function importData(data) {
  return request({
    url: '/system/notice/importData',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}