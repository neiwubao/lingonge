import { TaskModel } from "../../models/TaskModel.js";
let taskModel = new TaskModel();
import { CompanyModel } from "../../models/CompanyModel.js";
let companyModel = new CompanyModel();

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      openid:""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    taskModel.allTaskYype(list=>{
      wx.setStorageSync('allTaskType', JSON.stringify(list))
    })

    if (wx.getStorageSync('openid')){
      this.setData({
        info: {
          openid: wx.getStorageSync('openid')
        }
      })
    }else{
      taskModel.getWechat({}, info => {
        this.setData({
          info: info
        })
        if (info.openid) wx.setStorageSync('openid', info.openid)
        if (info.nickName) wx.setStorageSync('nickname', info.nickName)
        if (info.avatarUrl) wx.setStorageSync('avatar', info.avatarUrl)
      }, fail => {
        console.log(fail)
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  userselect:function(e){
    wx.showLoading({
      title:'登录中'
    })
    var ac = e.currentTarget.dataset.id;
    wx.setStorageSync('iswork', ac)
    console.log(ac)
    var that = this;
    if (this.data.info.nickname){
      var openid = wx.getStorageSync('openid');
      if (ac == 1) this.goworks(openid);
      if (ac == 2) this.goteam(openid);
      if (ac == 3) this.gocompany(openid);
    }else{
      wx.getUserInfo({
        success: function (res) {
          taskModel.getWechat(res.userInfo, info => {
            console.log(info)
            wx.setStorageSync('openid', info.openid)
            wx.setStorageSync('nickname', res.userInfo.nickName)
            wx.setStorageSync('avatar', res.userInfo.avatarUrl)
            that.setData({
              info:info
            })
            if (ac == 1) that.goworks(info.openid);
            if (ac == 2) that.goteam(info.openid);
            if (ac == 3) that.gocompany(info.openid);
          }, fail => {
            console.log(fail)
          });
        }
      })
    }
  },

  goworks: function(openid) {
    taskModel.getUser(openid,info => {
      wx.hideLoading();
      console.log(info)
      if (info.realname) {
        wx.switchTab({
          url: '/pages/my/my',
        })
      } else {
        wx.redirectTo({
          url: '../userselect/duiyuan/duiyuan?from=1select',
        })
      }
    }, fail => {
      wx.hideLoading();
      console.log(fail)
      if (fail.realname) {
        wx.switchTab({
          url: '/pages/my/my',
        })
      } else {
        wx.redirectTo({
          url: '../userselect/duiyuan/duiyuan?from=2select',
        })
      }
    })
  },

  goteam: function (openid) {
    taskModel.getTeam(openid,res => {
      wx.hideLoading();
      wx.switchTab({
        url: '/pages/my/my',
      })
    },fail => {
      wx.hideLoading();
      wx.redirectTo({
        url: '../userselect/duiman/duiman?from=3select',
      })
    })
  },

  gocompany: function() {
    companyModel.getOne(res => {
      wx.hideLoading();
      wx.switchTab({
        url: '/pages/my/my',
      })
    },fail => {
      wx.hideLoading();
      wx.redirectTo({
        url: '../userselect/enter/enter',
      })
    })
  }
})