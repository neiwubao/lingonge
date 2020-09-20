import { TaskModel } from "../../../models/TaskModel.js";
let taskModel = new TaskModel();
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    zhengmian:'../../../image/us_zhengmian.png',
    fanmian: '../../../image/us_fanmian.png',
    shouchi: '../../../image/us_shouchi.png',
    btnstatus:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    taskModel.renzheng('',res => {
      console.log(res)
      this.setData({
        btnstatus: res.status,
        shouchi: 'cloud://lingqiange-yun.6c69-lingqiange-yun-1300812031/'+res.pic
      })
    }, fail => {
      console.log(fail)
      if(fail.code == 1){
        that.setData({
          btnstatus: 0
        })
      }
    })
  },

  ChooseImage(e) {
    var that = this
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          btnstatus: 1
        })
        wx.showLoading({
          title: '上传中',
        })
        console.log(res.tempFilePaths)
        that.setData({
          shouchi: res.tempFilePaths[0]
        })
        taskModel.upPic(res.tempFilePaths, cloudfiles => {
          console.log('cloudfiles', cloudfiles)
          
          if (cloudfiles.length>0){
            var cloudfile = cloudfiles[0];
            that.setData({
              btnstatus: 2
            })
            taskModel.renzheng(cloudfile, res => {
              console.log(res)
            }, fail => {
              console.log(fail)
              if (fail.code == 1) {
                that.setData({
                  btnstatus: 0
                })
              }
            })
            wx.hideLoading()
          }
          
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
})