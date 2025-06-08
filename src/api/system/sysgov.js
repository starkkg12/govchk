import request from '@/utils/request'
export function listSysGovListByName(query) {
    return request({
      url: '/master/system/gov/list',
      method: 'get',
      params: query
    })
  }

export function listSysGovListByShowId(query) {
    return request({
      url: '/master/system/gov/listByShowId',
      method: 'get',
      params: query
    })
  }
  