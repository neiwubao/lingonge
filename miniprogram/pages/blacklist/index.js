import { TaskModel } from "../../models/TaskModel.js"
let taskModel = new TaskModel();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '佣金排行',
      'color': true,
      'class': '0'
    },
    navList: ["我的黑名单", "平台黑名单"],
    active: 0,
    rankList:[],
    page:1,
    limit:10,
    loadend:false,
    loading:false,
    loadTitle:'加载更多',
    type:'week',
    position:0,
  },
  switchTap:function(e){
    let index = e.currentTarget.dataset.index
    this.setData({
      active: index,
      type: index ? 'month': 'week',
      page:1,
      loadend:false,
      rankList:[],
      blackList:[]
    });
    this.getListInfo();
  },

  getBrokerageRankList:function(){
    if(this.data.loadend) return;
    if(this.data.loading) return;
    this.setData({loading:true,loadTitle:''});
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getListInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.isClone && app.globalData.isLog){
      this.setData({ page: 1, loadend: false, rankList:{}});
      this.getBrokerageRankList();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getBrokerageRankList();
  },

  remove(e){
    var item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '提示',
      content: '您要把'+item.nickname+'移除出黑名单吗？',
      success(res) {
        if (res.confirm) {
          taskModel.removeBlack(item._id, res=>{
            console.log(res)
          }, fail => {
            console.log(res)
          })
        }
      }
    });
  },

  getListInfo: function () {
    taskModel.getBlack(this.data.active, blackList=>{
      this.setData({
        blackList
      })  
    },err=>{

    })
  }, 
})