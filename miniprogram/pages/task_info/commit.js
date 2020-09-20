import { TaskModel } from "../../models/TaskModel.js"
let taskModel = new TaskModel();
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    imgList: [],
    index:0,
    taskid:'',
    openid:'',
    msg:'',
    haop:true,
    zhongp:false,
    chap:false,
    black:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      taskid: options.taskid,
      openid: options.openid
    })
  },

  PickerChange(e){
    this.setData({
      index:e.detail.value
    })
  },

  changmsg(e){
    this.setData({
      msg:e.detail.value
    })
  },
  haop(e){this.setData({index:0,haop:true,zhongp:false,chap:false,black:false})},
  zhongp(e){this.setData({index:1,haop:false,zhongp:true,chap:false,black:false})},
  chap(e){this.setData({index:2,haop:false,zhongp:false,chap:true,black:false})},
  black(e){this.setData({index:3,haop:false,zhongp:false,chap:false,black:true})},

  submit(){
    var obj = {
      taskid:this.data.taskid,
      openid:this.data.openid,
      commit_level:Number(this.data.index),
      commit_msg:this.data.msg
    }
    if(obj.commit_level>1 && obj.commit_msg == ''){
      wx.showToast({
        title: '请输入文字说明',icon:'none'
      })
      return;
    }
    wx.showLoading({title: '加载中'})
    taskModel.addCommit(obj, res => {
      wx.hideLoading();
      wx.showToast({
        title: '操作成功',icon:'none'
      })
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];  //上一个页面
      prevPage.setData({
        fromway: 'xuanren'
      })
      wx.navigateBack({
        delta: 1
      })
    }, err => {
      console.log(err)
      wx.hideLoading();
      wx.showToast({
        title: '操作失败',icon:'none'
      })
    })
  }  
})