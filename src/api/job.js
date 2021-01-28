import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/job',
    method: 'get',
    params: params
  })
}
