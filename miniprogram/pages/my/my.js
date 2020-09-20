import { TaskModel } from "../../models/TaskModel.js";
import { CompanyModel } from "../../models/CompanyModel.js";
let taskModel = new TaskModel();
let companyModel = new CompanyModel();
const app = getApp()

Page({
  data: {
    iswork: true,
    userinfo:{
      nickName:'请先登录',
      avatarUrl: './user-unlogin.png',
    },
    task:{
      alltask:0,
      fintask:0,
      dotask:0
    },
    company:{
      publish:0,
      works:0
    },
    money:0,
    myPerServiceList:[
      { iswork: 1, id: 1, name: '我要带班', img: '../../images/shenqing.png', url: '/pages/userselect/duiman/duiman' },
      { iswork: 1, id: 1, name: '我是工人', img: '../../images/about.png', url: '/pages/userselect/duiyuan/duiyuan' },
      { iswork: 2, id: 1, name: '我是队长', img: '../../images/about.png', url: '/pages/userselect/duiman/duiman' },
      { iswork: 1, id: 1, name: '实名认证', img: '../../images/renzhen.png', url: '/pages/userselect/geren/geren' },
      { iswork: 2, id: 1, name: '实名认证', img: '../../images/renzhen.png', url: '/pages/userselect/geren/geren' },
      { iswork: 2, id: 1, name: '我的队员', img: '../../images/duiyuan.png', url: '/pages/userselect/duiman/list' },
      { iswork: 1, id: 3, name: '我的任务', img: '../../images/renwu.png', url: '/pages/task/list' },
      { iswork: 1, id: 1, name: '钱包明细', img: '../../images/qianbao.png', url: '/pages/user/cash/list' },
      { iswork: 1, id: 1, name: '意见反馈', img: '../../images/yijian.png', url: '/pages/user/quest/index' },
      { iswork: 2, id: 1, name: '我的任务', img: '../../images/renwu.png', url: '/pages/task/list' },
      { iswork: 2, id: 1, name: '钱包明细', img: '../../images/qianbao.png', url: '/pages/user/cash/list' },
      { iswork: 2, id: 1, name: '意见反馈', img: '../../images/yijian.png', url: '/pages/user/quest/index' },
      // { iswork: 2, id: 1, name: '关于我们', img: '../../images/xiaoxi.png', url: '/pages/about/index' },
      { iswork: 1, id: 2 ,name: '消息中心', img: '../../images/xiaoxi.png', url: '/pages/user/msglog/msglog' },
      { iswork: 2, id: 2 ,name: '消息中心', img: '../../images/xiaoxi.png', url: '/pages/user/msglog/msglog' },
      { iswork: 1, id: 1, name: '切换身份', img: '../../images/qiehuan.png', url: '/pages/userselect/userselect' },
      { iswork: 2, id: 1, name: '切换身份', img: '../../images/qiehuan.png', url: '/pages/userselect/userselect' }
    ],
    myComServiceList: [  
      { iswork: 3, id: 3, name: '发布的任务', img: '../../images/fabu.png', url: '/pages/task/list' },
      { iswork: 3, id: 1, name: '我是发布者', img: '../../images/qiye.png', url: '/pages/userselect/enter/enter' },
      { iswork: 3, id: 1, name: '实名认证', img: '../../images/renzhen.png', url: '/pages/userselect/enter/renzhen' },
      { iswork: 3, id: 2 ,name: '消息中心', img: '../../images/xiaoxi.png', url: '/pages/user/msglog/msglog' },
      { iswork: 3, id: 1, name: '意见反馈', img: '../../images/yijian.png', url: '/pages/user/quest/index' },
      { iswork: 3, id: 1, name: '关于我们', img: '../../images/about.png', url: '/pages/about/index' },
      { iswork: 3, id: 1, name: '切换身份', img: '../../images/qiehuan.png', url: '/pages/userselect/userselect' }
    ],
    msgnotice:''
  },

  onLoad: function() {
  
  },

  gomytask(e){
    wx.navigateTo({
      url: '/pages/task/list?status='+e.currentTarget.dataset.model,
    })
  },

  onShow() {
    var iswork = wx.getStorageSync('iswork');
    this.setData({
      userinfo:{
        avatarUrl: wx.getStorageSync('avatar'),
        nickName: wx.getStorageSync('nickname')
      },
      iswork:iswork
    })
    //查询会员余额
    taskModel.getWechat({}, info => {
      this.setData({
        money: info.money
      })
    }, fail => {})

    if (iswork != 3){
      var openid = wx.getStorageSync('openid');
      taskModel.getUser(openid,info => {
        this.setData({
          task: {
            alltask: info.alltask,
            fintask: info.fintask,
            dotask: info.dotask
          },
        })
      }, fail => {})
    } else {
      this.setData({
        typeName: '我要招工人'
      })
      this.company();
    }
  },

  company() {
    var openid = wx.getStorageSync('openid');
    companyModel.info(openid, info => {
      console.log(info)
      this.setData({
        company: info,
        msgnotice: info.msgnotice
      })
    }, err => {
      console.log(err)
      wx.navigateTo({
        url: '/pages/userselect/enter/enter'
      })
    })
  },

  /**
   * 功能按钮
   */
  goPage: function(data) {
    var info = data.currentTarget.dataset.info;
    if(info.iswork == 3){
      if(info.id == 2 || info.id == 3) {
        wx.requestSubscribeMessage({
          tmplIds: ['RwDrRBqxUbMks1YfjmiHiYncBpvzlMdLdRDf7cUBDgE'],
          success (res) {
            wx.navigateTo({
              url: info.url,
            })
          },fail (){
            wx.navigateTo({
              url: info.url,
            })
          }
        })
      }else{
        wx.navigateTo({
          url: info.url,
        })
      }
    }else{
      if(info.id == 2 || info.id == 3) {
        wx.requestSubscribeMessage({
          tmplIds: ['RwDrRBqxUbMks1YfjmiHiYncBpvzlMdLdRDf7cUBDgE'],
          success (res) {
            wx.navigateTo({
              url: info.url,
            })
          },fail (){
            wx.navigateTo({
              url: info.url,
            })
          }
        })
      }else{
        wx.navigateTo({
          url: info.url,
        })
      }
    }
  },
  /**
   * 提现
   */
  goPostMoney: function (data) {
    wx.navigateTo({
      url: '/pages/user/cash/cash'
    })
  },
  /**
   * 签到
   */
  goSign: function (data) {
    wx.navigateTo({
      url: '/pages/user/sign/sign'
    })
  },
  /**
   * 实名认证
   */
  goAuto: function (data) {
    wx.navigateTo({
      url: '/pages/userselect/geren/geren'
    })
  },
})

 