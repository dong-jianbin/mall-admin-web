import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/job',
    method: 'get',
    params: params
  })
}

export function doPost(params) {
  return request({
    url: '/job',
    method: 'post',
    params: params
  })
}

export function doPut(inparams,type) {
  let params = Object.assign(inparams, type);
  return request({
    url: '/job',
    method: 'put',
    params: params
  })
}

export function doDelete(params) {
  return request({
    url: '/job',
    method: 'delete',
    params: params
  })
}