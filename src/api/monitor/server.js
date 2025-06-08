import request from '@/utils/request'

// サービス情報を取得する
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}