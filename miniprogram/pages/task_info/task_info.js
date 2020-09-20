import {
  TaskModel
} from "../../models/TaskModel.js"
let taskModel = new TaskModel()
const app = getApp()

Page({
  data: {
    info: {},
    btname: '',
    openid: '',
    taskid: 0,
    records: [],
    isChoose: 0, //没有选择人
    records_count: 0,
    jiedanmsg: '立刻接单',
    ac: 0,
    is_jiedan: 0,
    dealmember: 0,
    userlistmessage: '内容加载中',
    ac1no: false,
    fromway: ''
  },

  onShow: function () {
    if (this.data.fromway == 'xuanren') {
      this.getRecord(1);
    }
  },

  onLoad: function (options) {

    var openid = wx.getStorageSync('openid')
    var ac = wx.getStorageSync('iswork')
    this.setData({
      taskid: options.id,
      openid: openid,
      ac: ac
    })
    this.taskDetails(options.id, openid, ac);

  },
  /**
   * 雇主 任务撤销
   */
  taskRevoke() {
    var taskid = this.data.taskid;
    wx.showModal({
      title: '提示',
      content: '您要撤销该订单吗？',
      success(res) {
        if (res.confirm) {
          //执行撤销逻辑
          taskModel.cxTask(taskid,  res => {
            if(res){
              
              return wx.navigateBack({
                delta: 1
              })
            }
          }, res => {

          })

        }
      }
    })
  },

  /**
   * 工人 取消订单
   */
  cancelOrder(e) {
    var orderid = this.data.order._id;
    var that=this;
    console.log(orderid)
    wx.showModal({
      title: '提示',
      content: '您要取消该订单吗？',
      success(res) {
        if (res.confirm) {
          //执行撤销逻辑
          taskModel.cexiao(orderid, 1, res => {
            if(res == 1){
              that.setData({

              order:{status:-1}
              })
            }
          }, res => {

          })
        }
      }
    })
  },
  /**
   * 任务详情
   */
  taskDetails(taskid, openid, ac) {
    taskModel.getTask(taskid, info => {
      console.log(info)
      this.setData({
        info: info
      })
      if (ac == 3) {
        if (info.openid == this.data.openid) {
          if (info.taskmodel == 1) {
            this.getRecord(1);
          }
          if (info.taskmodel == 2) {
            this.getRecord(2);
          }
          this.setData({
            dealmember: 3
          })
        } else {

        }

      }
      if (ac == 2) {
        this.getMyRecord();
        if (info.team_id) {
          if (this.data.openid == info.team_id) {
            this.getRecord(1);
            this.setData({
              dealmember: 2
            })
          } else {
            this.setData({
              is_jiedan: 2,
              jiedanmsg: '以个人身份接单'
            })
          }
        } else {
          this.setData({
            is_jiedan: 1
          })
        }
      }
      if (ac == 1) {
        this.getMyRecord();
        this.setData({
          is_jiedan: 1
        })
      }
    })
  },
  editask() {
    wx.setStorageSync('taskid', this.data.taskid)
    wx.switchTab({
      url: '/pages/task/task',
    })
  },

  cexiao(e) {
    var orderid =this.data.order._id;
    var that =this;
    wx.showModal({
      title: '提示',
      content: '您要取消该订单吗？',
      success(res) {
        if (res.confirm) {
          //执行撤销逻辑
          taskModel.cexiao(orderid, 2, res => {
            if(res == 1){
              that.setData({

              order:{status:-1}
              })
            }
          }, res => {

          })
        }
      }
    })

    // var ac = e.currentTarget.dataset.ac
    // taskModel.cexiao(, 2, res => {
    //  if(res == 1){
       
    //  }
    // })
  },

  getRecord(ac) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      record_ac: ac
    })
    taskModel.getTaskRecord(this.data.taskid, ac, records => {
      console.log('getTaskRecord', records)
      var list = [];
      if (records.length > 0) {
        var isChoose = 0;
        var ismoney = 1;
        records.forEach(g => {
          var date = new Date(g.add_time);
          g.year = date.getFullYear(); //获取当前年份   
          g.mon = date.getMonth() + 1; //获取当前月份   
          g.da = date.getDate(); //获取当前日   
          list.push(g);
          isChoose += g.status;
          if(ismoney == 1){
            if(g.ismoney==0){
              ismoney = 0;
            }
          }
        });
        if(this.data.info.status == 2){
          if(ismoney==1){
            // var info = this.data.info;
            // info.status = 3;
            this.setData({'info.status':3})
          }
        }
        this.setData({
          records: list,
          isChoose: isChoose,
          records_count: records.length
        })
      } else {
        this.setData({
          records: list,
          userlistmessage: '暂无人接任务',
          records_count: records.length
        })
      }
      wx.hideLoading()
    })
  },

  open() {
    wx.showLoading({
      title: '加载中',
    })
    var info = this.data.info;
    taskModel.startTask(this.data.taskid, res => {
      console.log(res)
      info.status = 2;
      this.setData({
        info: info,
      })
      wx.hideLoading();
    }, err => {
      wx.showToast({
        title: err.message,
      })
      wx.hideLoading();
      console.log(err)
    })
  },

  gosendteam() {
    wx.navigateTo({
      url: '/pages/userselect/duiman/duiman',
    })
  },

  paytask() {
    wx.showLoading({
      title: '加载中'
    })
    var info = this.data.info;
    taskModel.payTask(this.data.taskid, res => {
      console.log(res)
      info.ispay = 1;
      this.setData({
        info: info,
      })
      wx.hideLoading();
    }, err => {
      console.log(err)
      wx.showToast({
        title: err.message,
      })
    })
  },

  moneyToTeam() {
    if(this.data.info.team_bill){
      wx.showToast({
        title:'队长调整了结款方案'
      })
      wx.navigateTo({
        url: '/pages/task_info/team_bill?id=' + this.data.taskid,
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '确认要结算吗',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中'
            })
            var info = this.data.info;
            taskModel.checkPay(this.data.taskid, this.data.info.team_id, res => {
              console.log(res)
              info.ispay = 1;
              this.setData({
                info: info
              })
              wx.showToast({
                title: '操作成功',
              })
              wx.hideLoading();
            }, err => {
              console.log(err)
            })
          }
        }
      });
    }
  },

  ckong(e) {
    var that = this;
    var option = e.currentTarget.dataset;
    option.taskid = this.data.taskid;
    if (that.data.info.status == 2) {
      wx.showModal({
        title: '提示',
        content: '确认要结算吗',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中'
            })
            var records = [];
            console.log(option)
            taskModel.getMoney(option, order => {
              that.data.records.forEach(g => {
                if (option.openid == g.openid) {
                  g.ismoney = 1;
                }
                records.push(g);
              })
              that.setData({
                records: records,
              })
              wx.hideLoading();
            }, err => {
              console.log(err)
              wx.showToast({
                title: err.message,
              })
            })
          }
        }
      })
    }
  },
  teamBill(){
    var that = this;
    if(that.data.info.team_money==2){
      wx.navigateTo({
        url: '/pages/task_info/team_bill?id=' + that.data.taskid,
      })
      return;
    }
    wx.showModal({
      title: '提示',
      content: '请选择结算情况',
      cancelText: '调整结算',
      confirmText: '正常结算',
      success(res) {
        if (res.confirm) {
          
        }else{
          wx.navigateTo({
            url: '/pages/task_info/team_bill?id=' + that.data.taskid,
          })
        }
      }
    });
  },
  sendUserMoney(e) {
    var that = this;
    var option = e.currentTarget.dataset;
    option.taskid = this.data.taskid;
    wx.showLoading({
      title: '加载中'
    })
    taskModel.getMoney(option, order => {
      wx.hideLoading();
      var records = [];
      that.data.records.forEach(g => {
        if (option.openid == g.openid) {
          g.ismoney = 1;
        }
        records.push(g);
      })
      that.setData({
        records: records,
      })
      // if (option.ac == 1) {}
      // if (option.ac == 2) {
      //   this.setData({
      //     order: order,
      //   })
      // }
      wx.showToast({
        title: '操作成功'
      })
    }, err => {
      wx.hideLoading();
      wx.showToast({
        title: '操作失败'
      })
    })
  },

  commit(e) {
    var openid = e.currentTarget.dataset.openid;
    var taskid = this.data.taskid;
    wx.navigateTo({
      url: '/pages/task_info/commit?taskid='+taskid+'&openid=' + openid,
    })
  },

  viewcommit(e){
    var item = e.currentTarget.dataset.item;
    var title = '给了好评';
    var content = '没有写评价内容';
    if(item.commit_level==1) title = '给了中评';
    if(item.commit_level==2) title = '给了差评';
    if(item.commit_level==3) title = '拉入了黑名单';
    if(item.commit_msg){
      content = item.commit_msg
    }
    wx.showModal({
      title: title,
      content: content,
      showCancel:false,
      confirmText:'知道了'
    })
  },

  viewuser(e) {
    var openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: '/pages/userselect/duiyuan/duiyuan?openid=' + openid,
    })
  },

  getMyRecord() {
    var openid = wx.getStorageSync('openid')
    taskModel.getMyTaskRecord(this.data.taskid, order => {
      this.setData({
        order: order
      })
      wx.hideLoading();
    }, err => {
      console.log(err)
    })
  },

  forcejiedan() {
    var that = this;
    that.setData({
      ac1no: false
    })
    wx.showModal({
      title: '提示',
      content: '需向队长支付10元/每人/天管理费',
      cancelText: '拒绝',
      confirmText: '同意',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
          });
          taskModel.buyTask(that.data.taskid, {
            avatar: wx.getStorageSync('avatar'),
            nickname: wx.getStorageSync('nickname'),
            ac: 1,
            force: 1
          }, info => {
            wx.hideLoading();
            that.setData({
              jiedanmsg: '报名成功'
            })
          })
        }
      }
    })
  },

  jiedan(e) {
    var ac = e.currentTarget.dataset.type;
    var that = this;
    var user = {
      avatar: wx.getStorageSync('avatar'),
      nickname: wx.getStorageSync('nickname'),
      ac: ac,
      force: 0
    }
    wx.showLoading({
      title: '加载中',
    });
    taskModel.buyTask(this.data.taskid, user, info => {
      console.log(info)
      that.setData({
        jiedanmsg: '接单成功'
      })
      that.getMyRecord();
    }, err => {
      wx.hideLoading();
      if (err.code == 1) {
        that.setData({
          ac1no: true
        })
      }
      wx.showToast({
        title: err.message,
      })
      console.log('buyTaskerr', err)
    })
  },

  hideModal(e) {
    this.setData({
      ac1no: false
    })
  },

  shenhe(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '您确认选择该候选人吗？',
      cancelText: '取消',
      confirmText: '确认',
      success(res) {
        if (res.confirm) {
          that.shenheConfirm(e);
        }
      }
    });


  },

  shenheConfirm(e) {
    var that = this;
    var task = this.data.info;
    var records = this.data.records;
    var order_id = e.currentTarget.dataset.id;
    var openid = e.currentTarget.dataset.openid;
    console.log(e.currentTarget.dataset)
    wx.showLoading({
      title: '审核中',
    })
    taskModel.shenTask(this.data.taskid, order_id, openid, info => {
      var list = [];
      records.forEach(g => {
        if (g._id == order_id) {
          g.status = 1
        }
        list.push(g);
        console.log(g, order_id)
      })
      //task.status = 2
      that.setData({
        info: task,
        isChoose: 1,
        records: list
      })
      wx.hideLoading();
      wx.showToast({
        title: '操作成功',
      });
    }, err => {
      wx.hideLoading();
      wx.showToast({
        title: '操作失败',
      })
      console.log(err)
    });
    this.getRecord(this.data.record_ac);
  },
  wxpay() {
    var that = this;
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
          console.log("支付成功", res)
          wx.showLoading({
            title: '确认支付中',
          })
          taskModel.checkwxpay({
            orderid: that.data.taskid,
            out_trade_no: out_trade_no,
          }, res => {
            wx.hideLoading()
            console.log('res------', res)
          }, err => {
            wx.hideLoading()
            if (err.trade_state == 'SUCCESS') {
              wx.showToast({
                title: '支付成功',
              })
              that.setData({
                'info.ispay': 1
              })
            } else {
              console.log('err------', err)
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
          console.log(err.trade_state_desc)
        })
      }
    })
  },

  adduser() {
    wx.navigateTo({
      url: '/pages/userselect/duiman/list?back=1&task_id=' + this.data.taskid,
    })
  },

  onShareAppMessage() {

  },
})