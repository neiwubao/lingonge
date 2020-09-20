const model = require('../models/BaseModel.js')
const { TASK, TASK_TYPE } = require('../config/tableConfig.js')
const { TASK_FIELD } = require('../fields/orderField.js')
const { TASK_TYPE_FIELD } = require('../fields/taskTypeField.js')

const _ = model._

//添加任务
const create = (taskinfo, openid) => {
  // 订单信息
  let params_task = {
    openid: openid,
    address: taskinfo.address,
    startime: taskinfo.startime,
    endtime: taskinfo.endtime,
    typeid: taskinfo.typeid,
    cateid: taskinfo.cateid,
    money: parseFloat(taskinfo.money),
    sheng: taskinfo.sheng,
    shi: taskinfo.shi,
    qu: taskinfo.qu,
    date: taskinfo.date,
    day: taskinfo.day,
    captain_fee: taskinfo.captain_fee,
    content: taskinfo.content,
    need: taskinfo.need,
    add_time: new Date(),
    pics: taskinfo.pics,
    order_id: '',
    count: 0,
    order_num:0,
    taskmodel: taskinfo.taskmodel,
    paytype: taskinfo.paytype,
    ispay: 0,
    team_id:'',
    status:0,
    strtime: taskinfo.strtime
  }
  if(taskinfo._id == ''){
    console.log('添加任务')
    return model.add(TASK, params_task);
  }else{
    console.log(taskinfo._id,'更新任务')
    params_task._id = taskinfo._id;
    return model.update(TASK, params_task);
  }
}

//接任务
const buyTask = (info,user) => {
  let params = {
    _id: user.openid + info._id,
    avatar: user.avatar,
    nickname: user.nickname,
    openid: user.openid,
    ac: Number(user.ac),
    status:0,
    taskid: info._id,
    add_time: new Date(),
    force: user.force,
    amount:0,
    ismoney:0
  }
  // 任务订单生成
  let task = model.add('taskRecord', params);
  return task
}

const getTeamBill = (taskid) => {
  return model.findById('team_bill', {}, taskid)
}

const delblack = (id) => {
  return model.remove('black', id);
}

const getblack = (sqlmap) => {
  return model.query('black', {}, sqlmap, 0, 10, {
    name:'add_time',
    orderBy:'desc'
  })
}

const addblack = (obj,parent = '') => {
  let params = {
    _id: obj._id + parent,
    openid: obj._id,
    avatar: obj.avatarUrl,
    nickname: obj.nickName,
    parent: parent,
    add_time: new Date()
  }
  params.type = parent ? 2 : 1 ;
  return model.add('black', params);
}
const addTeamBill = (option) => {
  let params = {
    _id:option.taskid,
    money:option.money,
    captain_fee:option.captain_fee
  }
  console.log('team_bill', params)
  return model.add('team_bill', params);
}

const updateTeamBill = (option) => {
  let params = {
    _id: option.taskid,
    money: option.money,
    captain_fee: option.captain_fee
  }
  return model.update('team_bill', params);
}

//获得单个订单
const getOrderById = (orderId) => {
  return model.findById('taskRecord', TASK_FIELD, orderId)
} 

//更新订单
const upTaskRecord = (order_id, options) => {
  options._id = order_id;
  return model.update('taskRecord', options);
}

/*
 * 通过任务ID，获得订单列表
 * ac 身份 money 是否显示有工钱的订单
 */
const taskRecords = (taskid, ac=0, money=0) => {
  var sqlmap = { taskid: taskid }
  if(ac) sqlmap.ac = ac;
  if(money) sqlmap.amount = _.gt(0);
  return model.query('taskRecord', {}, sqlmap, 0, 10, {
    name:'nickname',
    orderBy:'desc'
  })
}

//获得订单列表
const getMyOrder = (sqlmap,page) => {
  return model.query('taskRecord', {}, sqlmap, 0, 10, {
    name: 'add_time',
    orderBy: 'desc'
  })
}

/**
 * 根据任务id获取任务信息
 * @param {*} taskId 
 */
const getTaskById = (taskId) => {
  return model.findById(TASK, TASK_FIELD, taskId);
}

/**
 * 根据用户openid获取任务信息
 * @param {*} userInfo 
 */
const getTaskList = (sqlmap, page = 0, size = 20, order = {}) => {
  order.name = 'add_time'
  order.orderBy = 'desc'
  let options = sqlmap;
  return model.query(TASK, { 
    content: true, day:true,
    shi: true, qu: true, money: true, captain_fee: true, 
    pics: true, typeid: true, strtime:true,taskmodel:true
  }, options, page, size, order)
}

/**
 * 根据用户openid获取任务信息
 * @param {*} userInfo 
 */
const getTaskType = (parent = 0,order = {}) => {
  var options = {}
  options.parent = parent;
  order.name = 'sort'
  order.orderBy = 'desc'
  return model.query(TASK_TYPE, TASK_TYPE_FIELD, options, 0, 10, order)
}

const getTaskCateName = (id) => {
  return model.name(TASK_TYPE, String(id));
}

const upTask = (taskid,options) => {
  options._id = taskid;
  return model.update('task', options);
}

const getTaskMoban = () => {
  return model.query('moban', {
    title: true,
    content: true,
    _id: false
  })
}

module.exports = {
  create,
  getTaskById,
  getTaskList,
  getTaskType,
  getTaskCateName,
  getTaskMoban,
  buyTask,
  taskRecords,
  upTask,
  upTaskRecord,
  getOrderById,
  getMyOrder,
  getTeamBill,
  addTeamBill,
  updateTeamBill,
  addblack,
  getblack,
  delblack,
  _
}