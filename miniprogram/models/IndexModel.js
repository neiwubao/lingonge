import { CloudRequest } from '../utils/cloud-request.js'
class IndexModel extends CloudRequest {

  /**
   * 获取首页轮播
   * @param {*} callBack 
   */
  getBanner(callBack) {
    this.request({
      url: "getBanner",
      success: res => {
        callBack(res)
      }
    })
  }

  /**
   * 获取主题 
   * @param {*} callBack 
   */
  getTheme(callBack) {
    this.request({
      url: "getTheme",
      success: res => {
        callBack(res)
      }
    })
  }
}

export { IndexModel }