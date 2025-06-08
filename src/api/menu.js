import request from '@/utils/request'

// ルーターを取得する
export const getRouters = () => {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}

export const getPermissions = () => {
  return request({
    url: '/getPermissions',
    method: 'get'
  })
}