const model = require('../models/BaseModel.js')
const _ = model._

//添加队长
const create = (openid, team) => {
  let params_order = {
    _id: openid,
    realname: team.realname,
    service: team.service,
    region: team.region,
    pcount: team.pcount,
    idcard: team.idcard,
    wyear: team.wyear,
    pics: team.pics,
    status: 0,
    create_time: new Date(),
  }
  return model.add('team', params_order);
}

//更新队长
const update = (openid, team) => {
  let params = {
    _id: openid,
    avatar: team.avatar,
    realname: team.realname,
    service: team.service,
    phone: team.phone,
    region: team.region,
    pcount: team.pcount,
    idcard: team.idcard,
    wyear: team.wyear,
  }
  if (team.pics) params.pic = team.pics;
  return model.update('team', params);
}

//获得队长信息
const getTeamById = (openid) => {
  console.log(openid)
  return model.findById('team', {}, openid)
}

//获得队员信息
const getUserById = (openid) => {
  return model.findById('user', {}, openid)
}

//获得会员信息
const getWechatById = (openid) => {
  return model.findById('wechat', {}, openid)
}

//获得报名列表
const getOrderList = (userInfo, page = 0, size = 20, order = {}) => {
  order.name = 'create_time'
  order.orderBy = 'desc'
  let options = { buyer_openid: userInfo.openId }
  return model.query(ORDER, ORDERFIELD, options, page, size, order)
}

//会员注册
const createUser = (openid, user) => {
  let params_order = {
    _id: openid,
    realname: user.realname,
    region: user.region,
    phone: user.phone,
    yewu: user.yewu,
    id_card: user.id_card,
    nian: user.nian,
    status: 0,
    create_time: new Date(),
    alltask:0,
    dotask:0,
    fintask:0
  }
  console.log(user, params_order)
  return model.add('user', params_order);
}

//更新工人
const updateUserInfo = (openid, params) => {
  params._id = openid;
  let order = model.update('user', params);
  return order
}

//更新工人
const updateUser = (openid, user) => {
  let params_order = {
    _id: openid,
    realname: user.realname,
    idcard: user.idcard,
    region: user.region,
    phone: user.phone,
    yewu: user.yewu,
    nian: user.nian,
  }
  console.log(params_order)
  return model.update('user', params_order);
}

//添加会员
const createWechat = (openid, user) => {
  let params_order = user;
  params_order._id = openid;
  console.log('添加新会员',params_order)
  return model.add('wechat', params_order);
}

//更新会员
const updateWechat = (openid, params) => {
  params._id = openid;
  return model.update('wechat', params);
}

//账目明细
const billRecode = (param, page = 0, size = 20, order = {}) => {
  order.name = 'time'
  order.orderBy = 'desc'
  var options = { openid: param.openid }
  if(param.type == 1) options.pm = 1;
  if(param.type == 2) options.pm = 2;
  console.log(options, page)
  return model.query('bill', {desc:true,number:true,openid:true,pm:true,time:true,title:true,taskid:true}, options, page, size, order)
}

//添加账目
const addbill = (openid,param,workMoney) => {
  param.openid = openid
  param.time = new Date()
  model.add('bill',param)
  return model.update('wechat', {
    _id:openid,
    money:_.inc(workMoney)
  });
}

//我的队员
const members = (param, page = 0, size = 20, order = {}) => {
  order.name = 'task'
  order.orderBy = 'desc'
  var options = { openid: param.openid }
  // if (param.type == 1) options.pm = 1;
  // if (param.type == 2) options.pm = 2;
  console.log(options, page)
  return model.query('member', { avatar: true, nickname:true, desc: true, member_id: true, phone: true, realname: true, task: true, year: true, time:true }, options, page, size, order)
}

//添加会员
const addMessage = (openid, params) => {
  params.openid = openid;
  params.add_time = new Date();
  console.log('推送新消息',params)
  return model.add('message', params);
}

//消息列表
const getMessage = (openid, page = 0, size = 20) => {
  var order = {
    name:'add_time',
    orderBy:'desc'
  }
  var options = { openid: openid }
  return model.query('message', {}, options, page, size, order)
}

//队员数量
const memberCount = (openid) => {
  return model.count('member', { openid: openid})
}

//各个队员信息
const isAddMembner = (openid,member_id) => {
  return model.count('member', {
    member_id:member_id,
    openid:openid
  })
}

//添加新队员
const addMembers = (openid, user, wechat) => {
  let params = {
    avatar: wechat.avatarUrl,
    nickname: wechat.nickName,
    realname: user.realname,
    desc: user.yewu?user.yewu:'',
    openid: openid,
    member_id: user._id,
    task:user.fintask,
    year:user.nian,
    time: new Date()
  }
  console.log(params)
  return model.add('member', params);
}

const renzhenTeam = (openid,pic) => {
  let params_order = {
    _id: openid,
    pic: pic,
    status: 2,
    ac:2,
    create_time: new Date()
  }
  return model.add('renzheng', params_order);
}

const renzhenUser = (openid,pic) => {
  let params_order = {
    _id: openid,
    pic: pic,
    status: 2,
    ac:1,
    create_time: new Date()
  }
  return model.add('renzheng', params_order);
}

module.exports = {
  create,
  update,
  getTeamById,
  getOrderList,
  getUserById,
  createUser,
  updateUser,
  getWechatById,
  createWechat,
  updateWechat,
  billRecode,
  addbill,
  members,
  memberCount,
  updateUserInfo,
  renzhenTeam,
  renzhenUser,
  addMembers,
  isAddMembner,
  getMessage,
  addMessage,
  _
}