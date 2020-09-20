import { TaskModel } from "../../../models/TaskModel.js";
let taskModel = new TaskModel();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    region: ['广东省', '深圳市', '龙岗区'],
    imgList: [],
    info:{},
    view:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.openid){
      this.setData({
        view:1
      })
      taskModel.getUser(options.openid,info => {
        this.setData({
          info: info
        })
      }, fail => {
        wx.showToast({
          title: '获取资料失败',
        })
        console.log(fail)
      })
    }else{
      var openid = wx.getStorageSync('openid');
      taskModel.getUser(openid,info => {
        this.setData({
          info: info
        })
      }, fail => {
        console.log(fail)
      })
    }
  },

  RegionChange: function (e) {
    console.log(e)
    this.setData({
      region: e.detail.value,
      regionCode: e.detail.regionCode
    })
  },

  tel:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.info.phone
    })
  },
  
  formSubmit: function (e) {
    var that = this, value = e.detail.value, formId = e.detail.formId;
    value.region = this.data.region;
    value.openid = wx.getStorageSync('openid');
    value.nickname = wx.getStorageSync('nickname');
    value.avatar = wx.getStorageSync('avatar');
    console.log(value)
    taskModel.addUser(value, res => {
      console.log(res)
      if (res.action == 'add') {
      
      } else {

      }
      wx.switchTab({
        url: '/pages/my/my'
      })
    })
  },
})