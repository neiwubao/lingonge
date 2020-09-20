import { TaskModel } from "../../../models/TaskModel.js";
let taskModel = new TaskModel();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '我的队员',
      'color': true,
      'class': '0'
    },
    total: 0,
    totalLevel: 0,
    teamCount: 0,
    page: 0,
    limit: 20,
    keyword: '',
    sort: '',
    grade: 0,
    status: false,
    recordList: [],
    back:0,
    taskid:'',
    ac:2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if(options.task_id){
      this.setData({
        back:1,
        taskid:options.task_id
      })
    }
    if(options.ac==3){
      this.setData({
        ac:3
      })
    }
    this.userSpreadNewList();
  },

  backtask:function(e){
    if(this.data.taskid){
      var openid = e.currentTarget.dataset.member;
      taskModel.autoBuyTask(this.data.taskid,openid,info => {
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          fromway: 'xuanren'
        })
        wx.navigateBack();   //返回上一个页面
      }, err => {
      })
      
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.is_show) this.userSpreadNewList();
  },
  setSort: function (e) {
    var that = this;
    that.setData({
      sort: e.currentTarget.dataset.sort,
      page: 0,
      limit: 20,
      status: false,
      recordList: [],
    });
    that.userSpreadNewList();
  },
  setKeyword: function (e) {
    this.setData({ keyword: e.detail.value });
  },
  setRecordList: function () {
    this.setData({
      page: 0,
      limit: 20,
      status: false,
      recordList: [],
    });
    this.userSpreadNewList();
  },
  setType: function (e) {
    if (this.data.grade != e.currentTarget.dataset.grade) {
      this.setData({
        grade: e.currentTarget.dataset.grade,
        page: 0,
        limit: 20,
        keyword: '',
        sort: '',
        status: false,
        recordList: [],
      });
      this.userSpreadNewList();
    }
  },
  userSpreadNewList: function () {
    var that = this;
    var page = that.data.page;
    var limit = that.data.limit;
    var status = that.data.status;
    var keyword = that.data.keyword;
    var sort = that.data.sort;
    var grade = that.data.grade;
    var recordList = that.data.recordList;
    var recordListNew = [];
    if (status == true) return;
    taskModel.members({
      page: page,
      limit: limit,
      keyword: keyword,
      grade: grade,
      sort: sort,
    },res => {
      console.log(res);
      var len = res.list.length;
      var recordListData = res.list;
      recordListNew = recordList.concat(recordListData);
      that.setData({
        teamCount: Number(res.total),
        status: limit > len,
        page: limit + page,
        recordList: recordListNew
      });
    },fail => {
      console.log(fail);
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ is_show: true });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.userSpreadNewList();
  },

  onShareAppMessage:function (){
    var openid = wx.getStorageSync('openid')
    console.log(openid)
    return {
      title: '我是队长，招募临时工',
      path: '/pages/userselect/duiman/duiman?openid='+openid
    }
  }
})