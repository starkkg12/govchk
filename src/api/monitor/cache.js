import request from '@/utils/request'

// クエリキャッシュの詳細を取得する
export function getCache() {
  return request({
    url: '/monitor/cache',
    method: 'get'
  })
}

// キャッシュ名のリストを取得する
export function listCacheName() {
  return request({
    url: '/monitor/cache/getNames',
    method: 'get'
  })
}

// クエリキャッシュキー一覧を取得する
export function listCacheKey(cacheName) {
  return request({
    url: '/monitor/cache/getKeys/' + cacheName,
    method: 'get'
  })
}

// クエリキャッシュコンテンツを取得する
export function getCacheValue(cacheName, cacheKey) {
  return request({
    url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey,
    method: 'get'
  })
}

// 指定された名前キャッシュをクリアする
export function clearCacheName(cacheName) {
  return request({
    url: '/monitor/cache/clearCacheName/' + cacheName,
    method: 'delete'
  })
}

// 指定されたキー名キャッシュをクリアする
export function clearCacheKey(cacheKey) {
  return request({
    url: '/monitor/cache/clearCacheKey/' + cacheKey,
    method: 'delete'
  })
}

// すべてのキャッシュをクリアする
export function clearCacheAll() {
  return request({
    url: '/monitor/cache/clearCacheAll',
    method: 'delete'
  })
}
