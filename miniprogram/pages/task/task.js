import { TaskModel } from "../../models/TaskModel.js";
let taskModel = new TaskModel();

const app = getApp();
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    task_type: [{
      _id: "10",
      name: "其他",
      selected: 1
    }],
    multiArray: [
      ['加载中'],
      ['加载中']
    ],
    firstcat:[],
    secendcat:[],
    cate_id:0,
    type_id:0,
    region: ['广东省', '深圳市', '龙岗区'],
    picker: ['1天', '2天', '3天','4天','5天'],
    group: ['个体', '队长'],
    paytypes: ['在线支付','现场支付'],
    paytype:0,
    taskmodel:1,
    imgList:[],
    imgList2:[],
    time: '12:01',
    date: '',
    address: '',
    startime:'9:00',
    endtime: '21:00', captain_fee:0,
    day:0,need:10,money:100,
    content:'',
    modalName:'',
    id:'',
    isworkStatus:wx.getStorageSync('iswork'),
    multiIndex: [0, 0, 0],
  },
  onShow: function(options) {
    var that = this;
    var taskid = wx.getStorageSync('taskid');
    console.log(taskid)
    if(taskid){
      taskModel.getTask(taskid, info => {
        console.log(info);
        that.setData({
          isworkStatus:wx.getStorageSync('iswork'),
          id:taskid,
          address:info.address,
          need:info.need,
          money:info.money,
          captain_fee:info.captain_fee,
          type_id:info.typeid,
          cate_id:info.cateid,
          date:info.date,
          startime:info.startime,
          endtime:info.endtime,
          region:[info.sheng,info.shi,info.qu],
          paytype:info.paytype,
          content:info.content,
          imgList2:info.pics,
          day:info.day-1
        })
        that.getTaskType(info.cateid,info.typeid);
      });
    }
  },
  onLoad: function() {
    this.getTaskType(0,0);
    var date = new Date;
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    this.setData({
      date: date.getFullYear() + '-' + M + (date.getDate() + 1 < 10 ? '0'+date.getDate() : date.getDate())
    })
    wx.getLocation({
      type:'wgs84',
      altitude:true,
      success:function(res){
        console.log(res)
      }
    })
  },
  MultiChange(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  formSubmit: function (e) {
    var that = this, value = e.detail.value, formId = e.detail.formId;
    value.typeid = Number(this.data.type_id);
    value.cateid = Number(this.data.cate_id);
    value.startime = this.data.startime;
    value.endtime = this.data.endtime;
    value.date = this.data.date;
    value.day = Number(this.data.day) + 1;
    var region = this.data.region;
    value._id = this.data.id;
    
    value.sheng = region[0];
    value.shi = region[1];
    value.qu = region[2];
    value.need = Number(value.need);

    value.taskmodel = this.data.taskmodel;
    value.paytype = Number(this.data.paytype);

    value.strtime = (new Date(value.date + ' ' + value.startime)).getTime() / 1000;


    if(value.content == ''){
      return wx.showToast({
        icon: 'none',
        title: '请填写任务描述哦~',
      });
    }
    if (this.data.imgList.length + this.data.imgList2.length == 0) {
      return wx.showToast({
        icon: 'none',
        title: '至少上传1张图片',
      })
      ;
    }
    if(value.need <=0){
      return wx.showToast({
        icon: 'none',
        title: '人数最低为1哦~',
      });
    }
    if(value.money <=0){
      return wx.showToast({
        icon: 'none',
        title: '工钱最低为0.01元哦~',
      });
    }  if(value.address ==''){
      return wx.showToast({
        icon: 'none',
        title: '详细点的不能为空哦~',
      });
    }
    if (value.need > 3 && this.data.taskmodel == 1){
      wx.showModal({
        title: '提示',
        content: '便于现场管理，建议5人以上让队长接单',
        cancelText: '个人接单',
        confirmText: '队长接单',
        success(res) {
          if (res.confirm) {
            wx.showActionSheet({
              itemList: ['设置队长带班费', '10元/每人', '15元/每人', '20元/每人'],
              success(res) {
                if (res.tapIndex==0){
                  return;
                }else{
                  if (res.tapIndex == 1) value.captain_fee = 10;
                  if (res.tapIndex == 2) value.captain_fee = 15;
                  if (res.tapIndex == 3) value.captain_fee = 20;
                  value.taskmodel = 2;
                  that.publish(that.data.imgList, value)
                  return;
                }
              },
              fail(res) {
                wx.showModal({
                  title: '提示',
                  content: '便于现场管理，建议5人以上让队长接单',
                  confirmText: '个人接单',
                  cancelText: '暂不发布',
                  success(res) {
                    if (res.confirm) {
                      value.taskmodel = 1;
                      that.publish(that.data.imgList, value)
                    }
                    return;
                  }
                })
              }
            })
            return;
          } else {
            that.publish(that.data.imgList, value)
            return;
          }
        }
      })
    }else{
      that.publish(that.data.imgList, value)
      return;
    }
  },

  publish: function (imgList,value){
    var that = this;
    taskModel.upPic(imgList, cloudfiles => {
      var pics = [];
      for (let index in cloudfiles) {
        pics.push(cloudfiles[index])
      }
      for (let index in that.data.imgList2) {
        pics.push(that.data.imgList2[index])
      }
      value.pics = pics;
      if(value._id){
        wx.setStorageSync('taskid','');
        that.setData({
          imgList2:[],
          imgList:[],
          id:'',
          content:'',address:''
        })
        taskModel.creatTask(value, res => {
          that.setData({
            modalName: 'Modal',
            msg: {
              title: '提示',
              content: '任务修改成功'
            }
          })
        })
      }else{
        that.setData({
          imgList2:[],
          imgList:[],content:'',address:''
        })
        taskModel.creatTask(value, res => {
          that.setData({
            modalName: 'Modal',
            msg: {
              title: '提示',
              content: '任务发布成功'
            }
          })
        })
      }
    })
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
    var imgList2 = this.data.imgList2;
    imgList2.splice(index,1); 
    this.setData({
      imgList2
    })
  },

  PickerChange2: function (e) {
    console.log(e.detail.value)
    this.setData({
      paytype:e.detail.value
    })
  },

  PickerChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      day: e.detail.value
    })
  },

  RegionChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      region: e.detail.value,
      regionCode: e.detail.regionCode
    })
  },

  DateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  getTaskType:function(catid,typeid){
    var that = this;
    taskModel.getTaskType(catid,list => {
      var multiArray = that.data.multiArray
      var first = [];
      for (let index in list) {
        first.push(list[index].name)
      };
      that.setData({
        firstcat: list,
        first_id: 0
      })
      that.getChildCat(list,first,0);
    })
  },

  MultiColumnChange(e){
    console.log(e.detail)
    var column = e.detail.column;
    if(column==0){
      var cat = e.detail.value;
      var first = this.data.multiArray[0];
      var list = this.data.firstcat;
      this.getChildCat(list,first,cat);
    }else{
      var secendcat = this.data.secendcat;
      var type_id = secendcat[e.detail.value]._id
      this.setData({
        type_id: type_id
      })
    }
  },

  getChildCat(list,first,index){
    var that = this;
    var cat = list[index]._id;
    var multiArray = that.data.multiArray
    var secend =[];
    taskModel.getTaskType(Number(cat),secendcat => {
      console.log('切换子分类',cat,secendcat)
      for (let s in secendcat) {
        secend.push(secendcat[s].name)
        if(s==0){
          var type_id = secendcat[0]._id;
        }
      }
      if(secendcat.length==0){
        secend.push('其他');
        var type_id = cat;
      }
      multiArray[0] = first;
      multiArray[1] = secend;
      that.setData({
        multiArray,
        secendcat,
        type_id
      })
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
  },

  uploadfile(filePath){ 
    wx.showLoading({
      title: '图片上传中',
    })
    // 上传图片
    const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)
        return res.fileID;
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  choosePlace(e){
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
                address: ces.name
              })
            }
          })
        }
      }
    });
  },

  TimeChange1(e){
    this.setData({
      startime: e.detail.value
    })
  },
  TimeChange2(e) {
    this.setData({
      endtime: e.detail.value
    })
  },

  onShareAppMessage() {

  }

})

 