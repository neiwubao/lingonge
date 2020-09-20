//index.js
import { IndexModel } from "../../models/IndexModel.js"
import { TaskModel } from "../../models/TaskModel.js"
const app = getApp()
let indexModel = new IndexModel()
let taskModel = new TaskModel()
Page({
  data: {
    array: ['全深圳', '罗湖区', '南山区', '福田区', '宝安区', '龙岗区', '光明区', '坪山区', '大鹏新区'],
    area: ['所有区域', '罗湖区', '南山区', '福田区', '宝安区', '龙岗区', '光明区', '坪山区', '大鹏新区'],
    typename: '任务类型',
    time: ['发布时间', '今天', '三天内', '7天内', '7天以后'],
    index: 0,
    CustomBar: app.globalData.CustomBar - 35,
    where:{
      typeid:0,
      qu:'',
      time:0
    },
    selectcat:['类别一','任务类别'],
    multiArray: [
      ['加载中'],
      ['加载中']
    ],
  },

  onLoad: function () {
 
  },

  getlist(options) {
    taskModel.getTaskNew(options, tasklist => {
      var list = [];
      tasklist.forEach(function (e, index) {
        e.thumb = e.pics[0]
        e.l = 'l' + Math.ceil(index / 2)
        e.r = 'r' + Math.ceil(index / 2)
        list.push(e);
      })
      this.setData({
        tasklist: list
      })
    })
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  quChange(e) {
    console.log(e.detail.value,this.data.array[e.detail.value])
    var where = this.data.where;
    where.qu = this.data.array[e.detail.value];
    this.setData({
      tasklist: []
    })
    this.getlist(where);
  },

  typeChange(e) {
    console.log(e.detail.value, this.data.type[e.detail.value])
    var where = this.data.where;
    where.typeid = Number(e.detail.value);
    this.setData({
      tasklist:[]
    })
    this.getlist(where);
  },

  timeChange(e) {
    console.log(e.detail.value)
    this.setData({
      tasklist: []
    })
    var where = this.data.where;
    where.time = Number(e.detail.value);
    this.getlist(where);
  },

  qiandao() {
    wx.navigateTo({
      url: '../user/sign/sign',
    })
  },
  identity() {
    wx.navigateTo({
      url: '/pages/userselect/userselect',
    })
  },

  onShow() {
    console.log(app.globalData.openid)
    if (app.globalData.openid == '' || app.globalData.openid ===undefined){
      var openid = wx.getStorageSync('openid');
      if (openid){
        app.globalData.openid = openid;
      }else{
        wx.navigateTo({
          url: '/pages/userselect/userselect'
        })
      }
    }
    
    this.tasktypejson();
    this.getlist({});
  },

  tasktypejson(){
    var allTaskType = wx.getStorageSync('allTaskType');
    if(allTaskType == ''){
      taskModel.allTaskYype(list=>{
        wx.setStorageSync('allTaskType', JSON.stringify(list))
        this.getTaskType(list);
      })
    }else{
      this.getTaskType(allTaskType);
    }
  },

  getTaskType(allTaskType) {
    var jsonObj = JSON.parse(allTaskType);
    console.log(jsonObj)
    var first = [],secend = [];
    for (let index = 0; index < jsonObj.length; index++) {
      const element = jsonObj[index];
      first.push(element.name)
      if(index==0){
        for (let x = 0; x < element.child.length; x++) {
          const c = element.child[x];
          secend.push(c.name)
        }
      }
    }
    this.setData({
      multiArray:[first,secend]
    })
  },

  onShareAppMessage() {

  },
  goPage:function(e){
    console.log(e)
    wx.navigateTo({
      url: '/pages/task_info/task_info?id=' + e.currentTarget.dataset.id,
    })
  }

})

