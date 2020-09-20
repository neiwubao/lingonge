import { TaskModel } from "../../../models/TaskModel.js";
let taskModel = new TaskModel();
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
    msglist:[]
  },
  onLoad: function () { 

  },
  onShow: function () {
    var that = this;
    var openid = wx.getStorageSync('openid');
    taskModel.getMessage({page:1,size:20},res=>{
      console.log(res)
      if(res){
        for (let index = 0; index < res.length; index++) {
          const element = res[index].add_time;
          var myDate=new Date(element)
          console.log(element,myDate)
          res[index].time = myDate.getFullYear() +'/'+ (myDate.getMonth()+1) +'/'+ myDate.getDate();
        }
      }
      that.setData({
        msglist : res
      });
    },fail=>{
      console.log(fail)
    })
  },
  
  pageBack() {
    wx.switchTab({
      url: '/pages/user/user'
    })
  }
});
