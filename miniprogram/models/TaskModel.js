import { CloudRequest } from '../utils/cloud-request.js'
class TaskModel extends CloudRequest {
  /**
   * 上传图片
   * @param {*} callBack 
   */
  upPic(imgList, callBack) {
    var pics = [],that=this;
    if(imgList.length==0){
      console.log('没有上传新图片')
      return callBack([]);
    }
    for (let index in imgList) {
      this.uploadfile({
        file: imgList[index],
        path: 'team',
        success: res => {
          pics.push(res);
          if (index == imgList.length - 1){
            callBack(pics)
          }
        }
      })
    }
  }

  checkwxpay(options,callBack, failBack) {
    this.request({
      url: "checkwxpay",
      data: options,
      success: res => {
        callBack(res);
      },
      fail: err => {
        failBack(err);
      }
    })
  }

  wxpay(options,callBack, failBack) {
    this.request({
      url: "wxpay",
      data: options,
      success: res => {
        callBack(res);
      },
      fail: err => {
        console.log(err)
        callBack(err);
      }
    })
  }

  getTask(id,callBack, failBack) {
    this.request({
      url: "getTask",
      data: {id:id},
      success: res => {
        var date1 = new Date(res.strtime * 1000);
        var date2 = new Date((Number(res.strtime) + Number(3600 * 24 * res.day)) * 1000);
        res.date1 = (date1.getMonth() + 1) + '月' + date1.getDate() + '日';
        res.date2 = (date2.getMonth() + 1) + '月' + date2.getDate() + '日';
        if (res.pic) {
          var pic = [];
          res.pic.forEach(function (e) {
            pic.push('cloud://lingqiange-yun.6c69-lingqiange-yun-1300812031/' + e)
          })
          res.pic = pic;
        }
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  /**
   * 获取最新商品
   * @param {*} callBack 
   */
  getTaskType(parent,callBack) {
    this.request({
      url: "task_type",
      data: { parent: parent },
      success: res => {
        callBack(res.data)
      }
    })
  }

  allTaskYype(callBack) {
    this.request({
      url: "all_task_type",
      success: res => {
        callBack(res)
      },
      fail: err=>{
        
      }
    })
  }

  

  getTaskMoban(callBack) {
    this.request({
      url: "moban",
      success: res => {
        //console.log(res)
        callBack(res.data)
      }
    })
  }

  startTask(taskid, callBack, failBack) {
    this.request({
      url: "startTask",
      data: { taskid: taskid },
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  };

  checkPay(taskid, openid, callBack, failBack) {
    this.request({
      url: "checkPay",
      data: { taskid: taskid, openid: openid },
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  };

  

  getMoney(option, callBack, failBack) {
    this.request({
      url: "getMoney",
      data: option,
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  };

  payTask(taskid, callBack, failBack) {
    this.request({
      url: "payTask",
      data: { taskid: taskid },
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  };

  //撤销订单
  cexiao(order_id,ac,callBack,failBack){
    this.request({
      url: "cexiao",
      data: {order_id:order_id,ac:ac},
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  };

  //撤销订单
  cxTask(taskid,callBack,failBack){
    this.request({
      url: "cxtask",
      data: {taskid:taskid},
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  };

  /**
   * 获取最新商品
   * @param {*} callBack 
   */
  getTaskNew(options,callBack) {
    this.request({
      url: "getTaskNew",
      data: options,
      success: res => {
        var list = [];
        res.data.forEach(function (e) {
          var date1 = new Date(e.strtime * 1000);
          var date2 = new Date((Number(e.strtime) + Number(3600 * 24 * e.day)) * 1000);
          //console.log(e.day,date1,date2)
          e.date1 = (date1.getMonth() + 1) + '月' + date1.getDate() + '日';
          e.date2 = (date2.getMonth() + 1) + '月' + date2.getDate() + '日';
          list.push(e);
        })
        callBack(list)
      }
    })
  }

  /**
   * 发布任务
   * @param {*} taskData 
   * @param {*} callBack 
   */
  creatTask(taskData, callBack) {
    this.request({
      url: "creatTask",
      data: { taskData: taskData },
      success: res => {
        callBack(res)
      }
    })
  }

  addTeam(team, callBack) {
    this.request({
      url: "creatTeam",
      data: { team: team },
      success: res => {
        callBack(res)
      }
    })
  }

  buyTask(id, user, callBack, failBack) {
    this.request({
      url: "buyTask",
      data: { id: id, user: user },
      success: res => {
        callBack(res)
      },
      fail: err=>{
        failBack(err)
      }
    })
  }

  autoBuyTask(id, openid, callBack, failBack) {
    this.request({
      url: "autoBuyTask",
      data: { id: id, openid: openid },
      success: res => {
        callBack(res)
      },
      fail: err=>{
        failBack(err)
      }
    })
  }

  shenTask(taskid, order_id, openid, callBack, failBack) {
    this.request({
      url: "shenTask",
      data: { taskid: taskid, order_id: order_id, openid: openid },
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }
  
  addUser(user, callBack) {
    this.request({
      url: "creatUser",
      data: { user: user },
      success: res => {
        callBack(res)
      }
    })
  }

  getTeam(openid,callBack, failBack) {
    this.request({
      url: "getTeam",
      data: {openid:openid},
      success: res => {
        if (res.pic){
          var pic = [];
          res.pic.forEach(function(e){
            pic.push(e)
          })
          res.pic = pic;
        }
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  getUser(openid , callBack, failBack) {
    this.request({
      url: "getUser",
      data: {openid:openid},
      success: res => {
        console.log('getUser model',res)
        callBack(res)
      },
      fail: err => {
        console.log('getUser fail', err)
        failBack(err)
      }
    })
  }

  ifAddMember(member_id, callBack, failBack){
    this.request({
      url: "ifAddMember",
      data: {openid:member_id},
      success: res => {
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  addMembers(member_id, callBack, failBack){
    this.request({
      url: "addMembers",
      data: {openid:member_id},
      success: res => {
        //console.log(res)
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  members(param, callBack, failBack) {
    this.request({
      url: "members",
      data: param,
      success: res => {
        //console.log(res)
        let list = [];
        res.data.forEach(function (v) {
          //console.log(v)
          var date = new Date(v.time);
          v.time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
          list.push(v);
        })
        //console.log(list)
        callBack({
          list: list,
          total: res.total
        })
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  getTaskRecord(taskid,ac, callBack, failBack) {
    this.request({
      url: "taskRecords",
      data: { taskid: taskid, ac:ac},
      success: res => {
        //console.log(res)
        callBack(res.data)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  getMyTask(sqlmap, callBack, failBack) {
    this.request({
      url: "getMyTask",
      data: sqlmap,
      success: res => {
        callBack(res.data)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  getMyTaskRecord(taskid, callBack, failBack) {
    this.request({
      url: "getOrderInfo",
      data: { taskid: taskid},
      success: res => {
        //console.log(res)
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  removeBlack(id, callBack, failBack) {
    this.request({
      url: "delBlack",
      data: {id:id},
      success: res => {
        callBack(res.data)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  getBlack(my, callBack, failBack) {
    this.request({
      url: "getBlack",
      data: {my:my},
      success: res => {
        callBack(res.data)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  addCommit(param, callBack, failBack) {
    this.request({
      url: "addCommit",
      data: param,
      success: res => {
        //console.log(res)
        callBack(res)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  billRecode(param,callBack, failBack) {
    this.request({
      url: "billRecode",
      data: param,
      success: res => {
        var data = res.data;
        console.log(res)
        let list = [];
        res.data.forEach(function (v) {
          //console.log(v)
          var date = new Date(v.time);
          list.push({
            time: date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes(),
            list:[v]
          });
        })
        //console.log(list)
        callBack(list)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  tixian(param, callBack, failBack) {
    this.request({
      url: "tixian",
      data: param,
      success: res => {
        callBack(res)
      },
      fail: err => {
        console.log(res)
        failBack(err)
      }
    })
  }
  
  getMessage(option,callBack, failBack) {
    this.request({
      url: "getMessage",
      data: option,
      success: res => {
        callBack(res.data)
      },
      fail: err => {
        failBack(err)
      }
    })
  }

  getWechat(userInfo,callBack, failBack) {
    this.request({
      url: "getWechat",
      data: { user: userInfo},
      success: res => {
        callBack(res)
      },
      fail: err => {
        //callBack({ code: 100 })
        failBack(err)
      }
    })
  }

  renzheng(pic, callBack, failBack) {
    this.request({
      url: "renzhenUser",
      data: { pic: pic },
      success: res => {
        callBack(res)
      },
      fail: res => {
        failBack(res)
      }
    })
  }

  team_bill(option, callBack, failBack) {
    this.request({
      url: "team_bill",
      data: option,
      success: res => {
        callBack(res)
      },
      fail: res => {
        failBack(res)
      }
    })
  }

  reduce_team_bill(option, callBack, failBack) {
    this.request({
      url: "reduce_team_bill",
      data: option,
      success: res => {
        callBack(res)
      },
      fail: res => {
        failBack(res)
      }
    })
  }

  save_team_bill(option, callBack, failBack) {
    this.request({
      url: "save_team_bill",
      data: option,
      success: res => {
        callBack(res)
      },
      fail: res => {
        failBack(res)
      }
    })
  }
}

export { TaskModel }