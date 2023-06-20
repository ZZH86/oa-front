/*
角色管理相关的API请求函数
*/
import request from '@/utils/request'

const api_name = '/admin/system/sysRole'

export default {

  /*
  获取角色分页列表(带搜索)
  */
  getPageList(page, limit, searchObj) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get',
      // 普通对象：params
      // json:data传递
      params: searchObj
    })
  },
  //角色删除
  removeById(id){
    return request({
        url: `${api_name}/remove/${id}`,
        method: 'delete'
      })
  },
  //角色添加
  save(sysRole){
    return request({
      url: `${api_name}/save`,
      method: 'post',
      data: sysRole
    })
  },
  //根据id获取角色
  getRoleById(id){
    return request({
      url: `${api_name}/get/${id}`,
      method: 'get'
    })
  },
  //角色更新
  updateById(sysRole){
    return request({
      url: `${api_name}/update`,
      method: 'put',
      data: sysRole
    })
  },
  //批量删除
  batchRemove(idList){
    return request({
      url: `${api_name}/batchRemove`,
      method: 'delete',
      data: idList
    })
  },
  getRoles(adminId) {
    return request({
      url: `${api_name}/toAssign/${adminId}`,
      method: 'get'
    })
  },
  assignRoles(assginRoleVo) {
    return request({
      url: `${api_name}/doAssign`,
      method: 'post',
      data: assginRoleVo
    })
  },
  findAll(){
    return request({
      url: `${api_name}/findAll`,
      method: 'get'
    })
  }
}