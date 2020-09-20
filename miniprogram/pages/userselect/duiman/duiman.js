import { TaskModel } from "../../../models/TaskModel.js";
let taskModel = new TaskModel();

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    region: ['广东省', '深圳市', '龙岗区'],
    imgList2: [],
    imgList: [],
    regionCode:[],
    btname:'',
    info:[],
    view:0,
    backgroupColor:'bg-blue'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.openid){
      this.setData({
        view:1
      })
      taskModel.getTeam(options.openid,info => {
        this.setData({
          info: info,
          openid:options.openid,
          region: info.region,
          imgList2:info.pic
        })
      });
      taskModel.ifAddMember(options.openid, res=>{
        this.setData({
          isadd:1
        })
      }, err => {
        this.setData({
          isadd:0
        })
      })
    }else{
      var openid = wx.getStorageSync('openid');
      taskModel.getTeam(openid,info => {
        this.setData({
          info: info,
          region: info.region,
          imgList2: info.pic
        })
        if(info.status==0){
          this.setData({
            btname:'审核中',
            backgroupColor:'bg-orange'
          })
        }
        if (info.status == 1) {
          this.setData({
            btname: '更新',
            backgroupColor:'bg-orange'
          })
        }
      }, fail => {
        this.setData({ btname:'注册',
        backgroupColor:'bg-blue'})
      })
    }
  },

  RegionChange: function (e) {
    this.setData({
      region: e.detail.value,
      regionCode: e.detail.regionCode
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  formSubmit: function (e) {
    var that = this, value = e.detail.value, formId = e.detail.formId;
    value.region = this.data.region;
    if(that.data.info){
      if(that.data.info.status==0){
        that.setData({
          modalName: 'Modal',
          msg: {
            title: '提示',
            content: '申请还在审核中'
          }
        })
        return;
      }
    }

    if(value.realname == ''){
      return wx.showToast({
        icon: 'none',
        title: '姓名不能为空哦~',
      });
    }
    if(value.idcard == ''){
      return wx.showToast({
        icon: 'none',
        title: '身份证不能为空哦~',
      });
    }   if(value.phone == ''){
      return wx.showToast({
        icon: 'none',
        title: '手机号码不能为空哦~',
      });
    }  if(value.pcount == ''){
      return wx.showToast({
        icon: 'none',
        title: '团队人数不能为空哦~',
      });
    }if(value.wyear == ''){
      return wx.showToast({
        icon: 'none',
        title: '经验年限不能为空哦~',
      });
    }if(value.service == ''){
      return wx.showToast({
        icon: 'none',
        title: '擅长不能为空哦~',
      });
    }
    value.avatar = wx.getStorageSync('avatar');
    
    if (this.data.imgList.length>0){
      taskModel.upPic(this.data.imgList, cloudfiles => {
        //console.log(cloudfiles);
        var pics = that.data.imgList2;
        for (let index = 0; index < cloudfiles.length; index++) {
          pics.push(cloudfiles[index]);
        }
        console.log(pics);
        value.pics = pics;
        that.postData(value);
        return;
      })
    }else{
      value.pics = that.data.imgList2;
      that.postData(value);
    }
  },

  DelImg: function(e){
    var index = e.currentTarget.dataset.index;
    var imgList = this.data.imgList;
    imgList.splice(index,1); 
    this.setData({
      imgList
    })
  },

  DelImg2: function(e){
    var index = e.currentTarget.dataset.index;
    var imgList = this.data.imgList2;
    imgList.splice(index,1); 
    this.setData({
      imgList2:imgList
    })
  },

  addToTeam(){
    taskModel.addMembers(this.data.openid, res=>{
      console.log(res)
      this.setData({
        isadd:1
      })
    }, err => {
      wx.showToast({
        title: err.message,
      })
    })
  },

  postData(value){
    taskModel.addTeam(value,res => {
      console.log(res)
      if (res.action == 'edit'){
        wx.switchTab({
          url: '/pages/my/my'
        })
      }else{
        
      }
    })
  },
  ChooseImage(e) {
    var that = this
    // 选择图片
    wx.chooseImage({
      count: 4,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        console.log(res.tempFilePaths)
        if (that.data.imgList.length != 0) {
          that.setData({
            imgList: that.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          that.setData({
            imgList: res.tempFilePaths
          })
        }
        wx.hideLoading()
      },
      fail: e => {
        console.error(e)
      }
    })
  }
})