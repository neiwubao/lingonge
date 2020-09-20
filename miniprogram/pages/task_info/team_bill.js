import {TaskModel} from "../../models/TaskModel.js"
let taskModel = new TaskModel()
const app = getApp()
Page({
  data: {
    info:[],
    taskid:'',
    openid:'',
    ac:0,
    amount:0,
    records:[],
    total:0,
    oldtotal:0,
    captain:0,
    captain_fee:0,
    team_money:0,
    workday:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openid = wx.getStorageSync('openid')
    this.taskDetails(options.id, openid);
  },
  /**
   * 任务详情
   */
  taskDetails(taskid, openid) {
    var that = this;
    taskModel.getTask(taskid, info => {
      var workday = info.day?info.day:1;
      that.setData({
        taskid: taskid,
        team_money:info.team_money
      })
      if(info.openid == openid){
        that.setData({
          ac:3
        });
      }
      if(info.team_id == openid){
        that.setData({
          ac:2
        });
      }
      var captain_fee = info.captain_fee;
      if(info.team_bill){
        captain_fee = info.team_bill.captain_fee;
      }
      taskModel.getTaskRecord(taskid, 0, records => {
        var total = 0;
        var oldtotal = 0;
        for (let index = 0; index < records.length; index++) {
          var element = records[index];
          element.amount = element.amount ? element.amount : info.money
          console.log(element.amount,info.money)
          total = parseFloat(element.amount) + total;
          oldtotal = parseFloat(info.money) + oldtotal;
        }
        oldtotal = ( oldtotal + (records.length-1) * captain_fee ) * workday;
        that.setData({
          records:records,
          oldtotal:oldtotal,
          captain:info.captain_fee
        })
        that.getAmount(captain_fee,records.length,total,workday);
      });
    })
  },

  getAmount(captain_fee,need,money,workday){
    console.log('getAmount',captain_fee,need,money,workday)
    var total = 0;
    total = total + captain_fee * (need - 1) * workday;
    total = total + money * workday;
    this.setData({
      amount: money,
      total: total,
      captain_fee: captain_fee,
      workday: workday
    })
  },

  changmoney(e){
    var i = e.currentTarget.dataset.index;
    var total = 0;
    for (let index = 0; index < this.data.records.length; index++) {
      var element = this.data.records[index];
      if(i==index){
        element.amount = e.detail.value;
      }else{
        element.amount = element.amount ? element.amount : this.data.info.moeny
      }
      total = parseFloat(element.amount) + total;
    }
    this.getAmount(this.data.captain_fee,this.data.records.length,total,this.data.workday);
  },

  capiter_fee: function (){
    var that = this;
    if(that.data.team_money==2) return;
    if(that.data.ac ==2){
      wx.showActionSheet({
        itemList: ['设置队长带班费', '10元/每人', '15元/每人', '20元/每人'],
        success(res) {
          if (res.tapIndex==0){
            return;
          }else{
            var captain_fee = that.data.captain_fee;
            if (res.tapIndex == 1) captain_fee = 10;
            if (res.tapIndex == 2) captain_fee = 15;
            if (res.tapIndex == 3) captain_fee = 20;
            var total = 0;
            for (let index = 0; index < that.data.records.length; index++) {
              var element = that.data.records[index];
              total = parseFloat(element.amount) + total;
            }
            that.getAmount(captain_fee,that.data.records.length,total,that.data.workday);
            return;
          }
        }
      })
    }
  },

  team_bill: function (){
    var obj = {};
    obj.taskid = this.data.taskid
    obj.total = this.data.total
    obj.amount = this.data.amount
    obj.captain_fee = this.data.captain_fee
    obj.member = [];
    for (let index = 0; index < this.data.records.length; index++) {
      const element = this.data.records[index];
      obj.member.push({
        openid:element.openid,
        amount:element.amount
      });
    }
    taskModel.team_bill(obj,res=>{
      wx.showToast({
        title: '操作成功',
      })
      wx.navigateBack({
        delta: 1
      })
    },fail=>{
      console.log(fail)
    })
  },

  reduce_team_bill: function (){
    var obj = {};
    obj.taskid = this.data.taskid
    taskModel.reduce_team_bill(obj,res=>{
      wx.showToast({
        title: '操作成功',
      })
      wx.navigateBack({
        delta: 1
      })
    },fail=>{
      console.log(fail)
    });
  },

  save_team_bill: function (){
    var that = this;
    if(this.data.total > this.data.oldtotal){
      wx.showModal({
        title: '提示',
        content: '任务费用有增加需要补款，现在去支付',
        success(res) {
          if (res.confirm) {
            var out_trade_no = that.randomString(32);
            taskModel.wxpay({
              orderid: that.data.taskid,
              out_trade_no: out_trade_no,
              money: 1
            }, res => {
              that.pay(res, out_trade_no)
            }, err => {
              wx.showToast({
                title: '服务器错误',
              })
            })
          }
        }
      })
    }else{
      that.pay_team_bill();
    }
  },

  pay_team_bill(){
    var obj = {};
    obj.taskid = this.data.taskid
    obj.cha = this.data.total - this.data.oldtotal;
    taskModel.save_team_bill(obj,res=>{
      wx.showToast({
        title: '操作成功',
      })
      wx.navigateBack({
        delta: 1
      })
    },fail=>{
      console.log(fail)
    });
  },

  //实现小程序支付
  pay(payData, out_trade_no) {
    var that = this;
    //官方标准的支付方法
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package,
      signType: 'MD5',
      paySign: payData.paySign,
      success(res) {
        if (res.errMsg == 'requestPayment:ok') {
          wx.showLoading({
            title: '确认支付中',
          })
          taskModel.checkwxpay({
            orderid: that.data.taskid,
            out_trade_no: out_trade_no,
          }, res => {
            wx.hideLoading()
          }, err => {
            wx.hideLoading()
            if (err.trade_state == 'SUCCESS') {
              wx.showToast({
                title: '支付成功',
              })
              that.pay_team_bill();
            }
          })
        }
      },
      fail(res) {
        taskModel.checkwxpay({
          orderid: that.data.taskid,
          out_trade_no: out_trade_no,
        }, res => {
          console.log('res2------', res)
        }, err => {
          wx.showToast({
            title: err.trade_state_desc,
          })
        })
      }
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
})