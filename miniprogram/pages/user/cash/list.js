import { TaskModel } from "../../../models/TaskModel.js";
let taskModel = new TaskModel();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadTitle: '加载更多',
    loading: false,
    loadend: false,
    page: 1,
    limit: 10,
    type: 0,
    userBillList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ type: options.type || 0 });
    this.getUserBillList(0);
  },

  /**
   * 获取账户明细
  */
  getUserBillList: function (type) {
    var that = this;
    if (that.data.loadend) return;
    if (that.data.loading) return;
    that.setData({ loading: true, loadTitle: "加载中" });
    var param = {
      page: that.data.page,
      type: type
    }
    taskModel.billRecode(param, list => {
      var loadend = list.length < that.data.limit;
      that.data.userBillList = list;//app.SplitArray(list, that.data.userBillList);
      that.setData({
        userBillList: that.data.userBillList,
        loadend: loadend,
        loading: false,
        loadTitle: loadend ? "哼😕~内容加载完了~" : "加载更多",
        page: that.data.page + 1,
      });
    }, fail => {
      that.setData({ loading: false, loadTitle: "加载更多" });
      console.log(fail)
      this.setData({
        loadTitle:'服务器连接失败'
      })
    })
  },
  changeType: function (e) {
    this.setData({ type: e.currentTarget.dataset.type, loadend: false, page: 1, userBillList: [] });
    this.getUserBillList(e.currentTarget.dataset.type);
  },

  /**
   * 点击跳转
   */
  taskinfo: function (e) {
    var item = e.currentTarget.dataset.item
    if(item.taskid){
      wx.navigateTo({
        url: '/pages/task_info/task_info?id='+item.taskid,
      })
    }
  }

 

})