/**
 * 成功调用
 * @param {*} ctx
 * @retuen 
 */
const success = ctx => {
  return {
    code: 0,
    message: 'success',
    data: ctx.data
  }
}

/**
 * 调用失败 
 * @param {*} ctx
 * @param {*} msg
 * @retuen 
 */
const error = (ctx,code,msg) => {
  return {
    code: code,
    message: msg,
    data: ctx.data
  }
}

module.exports={
  success,
  error
}