const model = require('../models/BaseModel.js')
const _ = model._
const create = (openid,posterData) => {
  // 订单信息
  let params_order = {
    _id: openid,
    address: posterData.address,
    realname: posterData.realname,
    region: posterData.region,
    avatar: posterData.avatar,
    name: posterData.name,
    yewu: posterData.yewu,
    phone: posterData.phone,
    status: 0,
    publish: 0,
    works: 0,
    msgnotice: 0,
    create_time: new Date()
  }
  console.log(posterData, params_order)
  // // 订单生成
  let order = model.add('company', params_order);
  return order
}
/**
 * 根据订单id获取订单信息
 * @param {*} orderId 
 */
const getById = (openid) => {
  return model.findById('company', {}, openid)
}

/**
 * 根据用户openid获取信息
 * @param {*} userInfo 
 */
const getOrderList = (userInfo, page = 0, size = 20, order = {}) => {
  order.name = 'create_time'
  order.orderBy = 'desc'
  let options = { buyer_openid: userInfo.openId }
  return model.query(ORDER, ORDERFIELD, options, page, size, order)
}

const getRenzhen = (openid) => {
  return model.findById('renzheng', {}, openid)
}

const renzhen = (openid,pic) => {
  let params_order = {
    _id: openid,
    pic: pic,
    status: 0,
    ac:3,
    create_time: new Date()
  }
  let order = model.add('renzheng', params_order);
  return order
}

const incpublish = (openid, number) => {
  var _ = model._;
  let params = {
    _id: openid,
    publish: _.inc(number)
  }
  console.log(params)
  let res = model.update('company', params);
  return res
}

const msgNum = (openid, number) => {
  var _ = model._;
  let params = { _id: openid }
  if(number>0){
    params.msgnotice = _.inc(number)
  }else{
    params.msgnotice = 0;
  }
  let res = model.update('company', params);
  return res
}

const update = (openid, posterData) => {
  // 订单信息
  let params_order = {
    _id: openid,
    address: posterData.address,
    realname: posterData.realname,
    avatar: posterData.avatar,
    region: posterData.region,
    name: posterData.name,
    yewu: posterData.yewu,
    phone: posterData.phone
  }
  console.log(params_order)
  let order = model.update('company', params_order);
  return order
}

module.exports = {
  create,
  update,
  msgNum,
  incpublish,
  getById,
  getOrderList,
  getRenzhen,
  renzhen,
  _
}