import request from '@/utils/request'

// DBファイル削除
export function delDBfile(id) {
  return request({
    url: '/system/database/' + id,
    method: 'delete'
  })
}

// service_file_limit一覧の取得
export function listInfo(data) {
  return request({
    url: '/system/database/list',
    method: 'get',
    data: data
  })
}


// DB ファイルアップロード
export function uploadDBFile(data) {
  return request({
    url: '/system/database/add',
    headers: {
      contentType: 'multipart/form-data'
    },
    method: 'post',
    data: data
  })
}

