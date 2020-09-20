import { CloudRequest } from '../utils/cloud-request.js'
class CompanyModel extends CloudRequest {
  /**
   * 上传图片
   * @param {*} callBack 
   */
  upPic(imgList, callBack) {
    var pics = [], that = this;
    for (let index in imgList) {
      this.uploadfile({
        file: imgList[index],
        path:'company',
        success: res => {
          pics.push(res);
          if (index == imgList.length - 1) {
            callBack(pics)
          }
        }
      })
    }
  }

  add(posterData, callBack) {
    this.request({
      url: "creatCompany",
      data: { posterData: posterData },
      success: res => {
        callBack(res)
      }
    })
  }

  info(openid, callBack, failBack) {
    this.request({
      url: "getCompany",
      data: { openid: openid },
      success: res => {
        callBack(res)
      },
      fail: res => {
        failBack(res)
      }
    })
  }

  renzheng(pic, callBack, failBack) {
    this.request({
      url: "renzhenCompany",
      data: { pic: pic },
      success: res => {
        callBack(res)
      },
      fail: res => {
        failBack(res)
      }
    })
  }

  getOne(callBack, failBack) {
    this.request({
      url: "getCompany",
      data: {},
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack({ code: 100 })
      }
    })
  }
}

export { CompanyModel }