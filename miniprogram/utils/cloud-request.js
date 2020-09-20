import { config } from "../config.js"
class CloudRequest {

  constructor() {
    this.cloud_route = config.cloud_route
  }

  request(params) {
    console.log(this.cloud_route,params)
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: this.cloud_route,
      // 传递给云函数的参数
      data: {
        // 要调用的路由的路径，传入准确路径或者通配符*
        $url: params.url,
        data: params.data
      },
      success: res => {
        // console.log(res)
        if(res.result === undefined){
          params.fail({code:500})
        }else{
          if (res.result.code == 0) {
            params.success(res.result.data)
          } else {
            console.log('内容为空',res.result)
            params.fail(res.result)
          }
        }
      },
      fail: err => {
        params.fail({ code: 1000 })
        // wx.showToast({
        //   icon: 'none',
        //   title: '云服务连接失败',
        // })
      }
    })
  }

  uploadfile(params) {
    wx.showLoading({
      title: '图片上传中',
    })
    var filePath = params.file
    var date = new Date;
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate();

    // 上传图片
    const cloudPath = params.path+'/'+M+D+'/' + date.getTime() + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)
        params.success(cloudPath);
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }

  /*获得元素上的绑定的值*/
  getDataSet(event, key) {
    return event.currentTarget.dataset[key];
  }
}
export { CloudRequest }