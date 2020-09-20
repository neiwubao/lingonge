// 公共BaseModel
const cloud = require('wx-server-sdk');
// cloud.init({
//   env: 'test-e7f9d3'
//   // traceUser: true,
// });
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

const _ = db.command
/**
 * {
  env: 'release-prod'
  // traceUser: true,
}
 */


/**
 * 查询处理 
 * @param  {object} model       集合名称
 * @param  {String} id          查询id
 * @return  {object|null}       查找结果
 */
const findById = (model, fields = {} , id ) => {
  try {
    return db.collection(model)
      .doc(id)
      .field(fields) 
      .get()
      .then(res => {
        return res.data
      })
      .catch(err => {
        console.error(err)
        return;
      })
  } catch (e) {
    return;
  }
}

const name = (model, id ) => {
  try {
    return db.collection(model)
      .doc(id)
      .field({name:true}) 
      .get()
      .then(res => {
        return res.data.name
      })
      .catch(err => {
        console.error(err)
        return;
      })
  } catch (e) {
    return;
  }
}

const count = (model, options = {}) => {
  try {
    return db.collection(model)
      .where(options)
      .count().then(res => {
        console.log(res.total)
        return res.total;
      })
  } catch (e) {
    return;
  }
}

/**
 * 查询处理 带多条件的
 * @param  {object} model         集合名称
 * @param  {Object} [options={}]    查询条件
 * @param  {Number} [page]        开始记录数
 * @param  {Number} [size]        每页显示的记录数
 * @return  {object|null}         查找结果
 */
const query = (model, fields = {}, options = {}, page = 0, size = 10, order = { name: '_id', orderBy:'asc'} ) => {
  try {
    return db.collection(model)
    .where(options)
    .field(fields) 
    .skip(page)
    .limit(size)
    .orderBy(order.name, order.orderBy)
    .get()

  } catch (e) {
    console.error(e)
  }
}



/**
 * 新增处理
 * @param  {object} model  集合名称
 * @param  {object} params 参数
 * @return {object| null}  操作结果
 */
const add = (model, params) => {
  try {
    return db.collection(model).add({
      data: params
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * 编辑处理
 * @param  {object} model      集合名称
 * @param  {object} params     参数
 * @return {object|null}       操作结果
 */
const update = (model, params) => {
  let id = params._id
  delete params._id
  try {
    return db.collection(model).doc(id)
    .update({
      data: params
    })
    .then(res => {
      return 1;
    })
    .catch(err => {
      //console.error(err)
      return 0;
    })
  } catch (e) {
    return 0;
    //console.error(e);
  }
}

/**
 * 删除结果
 * @param  {object} model      集合名称
 * @param  {String} id         参数
 * @return {object|null}       操作结果
 */
const remove = (model, id) => {
  try {
    return  db.collection(model).doc(id).remove()
  } catch (e) {
    console.error(e)
  }
}



module.exports = {
  query,
  findById,
  add,
  update,
  remove,
  count,
  name,
  _
}