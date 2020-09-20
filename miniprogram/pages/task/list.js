//index.js
import { IndexModel } from "../../models/IndexModel.js"
import { TaskModel } from "../../models/TaskModel.js"
const app = getApp()
let taskModel = new TaskModel()
Page({
  data: {
    array: ['宝安区', '龙岗区', '南山区', '福田区'],
    area: ['所有区域', '宝安区', '龙岗区', '南山区', '福田区'],
    type: ['任务类型'],
    time: ['发布时间', '今天', '三天内', '7天内', '7天以前'],
    model: ['全部', '已接单', '任务中', '已完成'],
    index: 0,
    status: 0,
    CustomBar: app.globalData.CustomBar - 35,
    tasklist:[],
    typeid:0,
    qu:"",
    ac:0,
    where:{},
    selectcat:['类别一','任务类别'],
    multiArray: [
      ['加载中'],
      ['加载中']
    ],
  },

  onLoad: function (e) {
    var ac = wx.getStorageSync('iswork')
    taskModel.getTaskType(0,typeList => {
      var task_type = this.data.type;
      for (let index in typeList) {
        task_type.push(typeList[index].name);
      };
      var status = e.status?e.status:0;
      this.setData({
        type: task_type,
        ac: ac,
        status:status
      })
      if(status>0){
        this.getlist(ac,task_type,{status:status-1});
      }else{
        this.getlist(ac,task_type,{});
      }
    })
    this.tasktypejson();
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

  modelChange:function(e){
    this.setData({
      status: Number(e.detail.value)
    })
    var where = this.data.where;
    console.log('modelChange',where);
    if(e.detail.value>0){
      where.status = Number(e.detail.value) - 1
    }else{
      delete where.status;
    }
    console.log('modelChange',where,e.detail.value)
    this.getlist(this.data.ac,this.data.type,where);
  },

  typeChange:function(e){
    this.getlist(this.data.ac,this.data.type,{
      typeid: Number(e.detail.value)
    });
  },

  quChange: function (e) {
    this.getlist(this.data.ac,this.data.type, {
      qu: this.data.area[e.detail.value]
    });
  },

  detail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.requestSubscribeMessage({
      tmplIds: ['RwDrRBqxUbMks1YfjmiHiYncBpvzlMdLdRDf7cUBDgE'],
      success (res) {
        wx.navigateTo({
          url: '/pages/task_info/task_info?id=' + id,
        })
      },fail (){
        wx.navigateTo({
          url: '/pages/task_info/task_info?id=' + id,
        })
      }
    })
  },

  getlist(ac,task_type,where){
    console.log('where=',where)
    if(ac == 3){
      where.openid = true;
      taskModel.getTaskNew(where,tasklist => {
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
    }else{
      taskModel.getMyTask(where, tasks => {
        var list = [];
        tasks.forEach(function (e, index) {
          var f = e.task;
          if(f === undefined){

          }else{
            console.log(e)
            e.shi = f.shi;
            e.qu = f.qu;
            e._id = f._id;
            e.money = f.money;
            e.thumb = f.pics[0]
            e.l = 'l' + Math.ceil(index / 2)
            e.r = 'r' + Math.ceil(index / 2)
            list.push(e);
          }
        })
        this.setData({
          tasklist: list
        })
      })
    }
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
})

