import { CompanyModel } from "../../../models/CompanyModel.js";
let companyModel = new CompanyModel();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['广东省', '深圳市', '罗湖区'],
    info:{},
    regionCode:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    companyModel.info('', info => {
      console.log(info)
      this.setData({
        info:info,
        region: info.region
      })
    }, err => {
      console.log(err)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  RegionChange: function (e) {
    console.log(e)
    this.setData({
      region: e.detail.value,
      regionCode: e.detail.regionCode
    })
  },

  formSubmit: function (e) {
    var that = this, value = e.detail.value, formId = e.detail.formId;
    value.region = this.data.region;
    if(value.name == ''){
      return wx.showToast({
        icon: 'none',
        title: '发布方不能为空哦~',
      });
    }
    if(value.yewu == ''){
      return wx.showToast({
        icon: 'none',
        title: '业务内容不能为空哦~',
      });
    }
    if(value.realname == ''){
      return wx.showToast({
        icon: 'none',
        title: '联系人不能为空哦~',
      });
    } if(value.phone == ''){
      return wx.showToast({
        icon: 'none',
        title: '手机号码不能为空哦~',
      });
    }
    value.avatar = wx.getStorageSync('avatar');
    //console.log(value);return;
    companyModel.add(value, res => {
      wx.switchTab({
        url: '/pages/my/my'
      })
    })
  },

  choosePlace(e) {
    let that = this
    console.log(e);
    var obj = e.target.dataset;
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.userLocation']) {
          wx.openSetting({
            success(res) {
              console.log(res.authSetting)
            }
          })
        } else {
          wx.chooseLocation({
            success: ces => {
              console.log(ces)
              that.setData({
                address: ces.address + ces.name
              })
            }
          })
        }
      }
    });
  },
})