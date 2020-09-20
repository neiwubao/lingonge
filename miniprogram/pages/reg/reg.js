//index.js
const app = getApp()

Page({
  data: {
    array: ['深圳市南山区软件大厦', '上海市', '北京市', '广州市'],
    index: 0
  },

  onLoad: function() {
  
 
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  onReady() {

  },

  onShow() {

  },

  onHide() {

  },

  onUnload() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  onShareAppMessage() {

  }

})

 