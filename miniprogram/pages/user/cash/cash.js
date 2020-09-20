import { TaskModel } from "../../../models/TaskModel.js"
let taskModel = new TaskModel()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parameter: {
      'navbar': '1',
      'return': '1',
      'title': '提现',
      'color': true,
      'class': '0'
    },
    navList: [
      { 'name': '微信', 'icon': 'icon-weixin2' }
    ],
    currentTab: 1,
    index: 0,
    array: [],//提现银行
    minPrice: 0.00,//最低提现金额
    userInfo: [],
    isClone: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
  },
  /**
   * 获取个人用户信息
  */
  getUserInfo: function () {
    //查询会员余额
    taskModel.getWechat({}, info => {
      this.setData({
        userInfo: info
      })
    }, fail => {})
  },
  swichNav: function (e) {
    this.setData({ currentTab: e.currentTarget.dataset.current });
  },
  bindPickerChange: function (e) {
    this.setData({ index: e.detail.value });
  },
  subCash: function (e){
    var value = e.detail.value;
    value.partner_trade_no = this.randomString(32);
    console.log(value)
    taskModel.tixian(e.detail.value,res=>{
      console.log(res)
    },err=>{
      console.log(err)
    })
  },
  randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
     　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  },
  subCash2: function (e) {
    var formId = e.detail.formId, that = this, value = e.detail.value;
    setFormId(formId);
    
    value.extract_type = 'weixin';
    if (value.name.length == 0) return app.Tips({ title: '请填写微信号' });
    value.weixin = value.name;
    if (value.money.length == 0) return app.Tips({ title: '请填写提现金额' });
    if (value.money < that.data.minPrice) return app.Tips({ title: '提现金额不能低于' + that.data.minPrice });
    extractCash(value).then(res => {
      that.getUserInfo();
      return app.Tips({ title: res.msg, icon: 'success' });
    }).catch(err => {
      return app.Tips({ title: err });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.isLog && this.data.isClone) {
      this.getUserInfo();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ isClone: true });
  },
})