// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');
const tenpay = require('tenpay');

//2，配置支付信息
const config = {
  appid: 'wx9da216e9e452e72c', //
  mchid: '1495293402', //
  partnerKey: 'DATO1033DATO1033DATO1033DATO1033', //
  notify_url: 'https://mp.weixin.qq.com', //支付回调网址,这里可以先随意填一个网址
  spbill_create_ip: '127.0.0.1',
	pfx: require('fs').readFileSync('config/apiclient_cert.pem'),
};

const returnUtil = require('utils/ReturnUtil.js')

const banner = require('service/bannerService.js')
const theme = require('service/themeService.js')
const product = require('service/productService.js')
const order = require('service/orderService.js')

const team = require('service/teamService.js')
const company = require('service/companyService.js')
const task = require('service/taskService.js')

const baseTest = require('test/models/BaseModelTest.js')

cloud.init({
  env: 'lingqiange-yun',
  traceUser: true,
})
const miniprogramState = 'trial';
const IMAGEPREFIX = "cloud://lingqiange-yun.6c69-lingqiange-yun-1300812031"

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)

  const app = new TcbRouter({ event });

  const wxContext = cloud.getWXContext()

  const openid = wxContext.OPENID;

  // app.use 表示该中间件会适用于所有的路由
  app.use(async (ctx, next) => {
    ctx.data = {};
    await next(); // 执行下一中间件
  });

  /***************************    首页   *****************************************/
  //任务分类
  app.router('task_type', async (ctx, next) => {
    var parent = event.data.parent;
    ctx.data = await task.getTaskType(parent)
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  app.router('all_task_type', async (ctx, next) => {
    var list = await task.getTaskType(0)
    for (let index = 0; index < list.data.length; index++) {
      const child = await task.getTaskType(Number(list.data[index]._id))
      list.data[index].child = child.data;
    }
    ctx.data = await list.data;
    ctx.body = await returnUtil.success(ctx)
    await next()
  })


  //任务模板
  app.router('moban', async (ctx, next) => {
    ctx.data = await task.getTaskMoban()
    console.log(ctx.data)
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //创建任务
  app.router('creatTask', async (ctx, next) => {
    ctx.data = await task.create(event.data.taskData, openid)
    if(event.data.taskData._id == ''){
      console.log('新任务数量')
      ctx.data.incpublish = await company.incpublish(openid, 1);
    }
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  app.router('taskRecords', async (ctx, next) => {
    ctx.data = await task.taskRecords(event.data.taskid, event.data.ac)
    if(ctx.data){

    }
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //邀请接单
  app.router('autoBuyTask', async (ctx, next) => {
    var order = await task.getOrderById(event.data.openid + event.data.id)
    if(order){

    }else{
      var wechat = await team.getWechatById(event.data.openid)
      console.log(wechat,user)
      var user = {};
      user.ac = 1;
      user.openid = wechat._id;
      user.nickname = wechat.nickName;
      user.avatar = wechat.avatarUrl;
      user.force = 2;
      var info = await task.getTaskById(event.data.id)
      ctx.data = await task.buyTask(info, user)
      ctx.body = await returnUtil.success(ctx)
    }
  })

  //队长抢单
  app.router('buyTask', async (ctx, next) => {
    var addstatus = 1;
    if(openid === undefined) addstatus = 0;
    if(openid == 'undefined') addstatus = 0;
    var taskid = event.data.id;
    var order = await task.getOrderById(openid + taskid)
    var force = event.data.user.force;
    if(order){
      var info = await task.getTaskById(taskid)
      console.log(order)
      if (order.ac == 1){
        ctx.body = await returnUtil.error(ctx, 1, '您已经下单了')
      }else if (info.order_num > 12) {
        ctx.body = await returnUtil.error(ctx, 1, '任务被抢了')
      }else{
        ctx.data = await task.upTaskRecord(order._id, { ac: 1 })
        ctx.body = await returnUtil.success(ctx)
      }
    }else if(addstatus == 1){
      console.log('首次接单')
      //taskmodel  任务模式  1 个人任务  2 团队任务
      var info = await task.getTaskById(taskid)
      var ac = event.data.user.ac;
      // if (info.count > 2) {
      //   ctx.body = await returnUtil.error(ctx, 2, '任务被抢了')
      // } else 
      if (ac == 1 && info.team_id == '' && info.taskmodel == 2 && force == 0) {
        ctx.body = await returnUtil.error(ctx, 1, '只有队长可以接3人以上的任务')
      } else if (info.status == 2) {
        ctx.body = await returnUtil.error(ctx, 3, '任务已开始')
      } else if (info.team_id && ac == 2) {
        ctx.body = await returnUtil.error(ctx, 4, '队长已经确定了')
      } else {
        event.data.user.openid = openid;
        if (info.team_id){
          task.upTask(taskid, {
            order_num: task._.inc(1),
          })
        }else{
          task.upTask(taskid, {
            count: task._.inc(1),
          })
        }
        team.updateUserInfo(openid, {
          alltask: team._.inc(1)
        })
        console.log('任务模式',info.taskmodel);
        if(info.taskmodel==1){
          event.data.user.ac = 1;
        }
        team.addMessage(info.openid,{
          title:'任务信息',
          content:[
            event.data.user.nickname+'接了您发布的任务'
          ]
        })
        var time = new Date();
        cloud.openapi.subscribeMessage.send({
          touser: info.openid,
          page: '/pages/task_info/task_info?id='+taskid,
          data: {
            thing1: {
              value: '任务信息'
            },
            thing2: {
              value: '工人接了您发布的任务'
            },
            thing3: {
              value: event.data.user.nickname
            },
            time4: {
              value: time.getFullYear()+'-'+(time.getMonth()-1)+'-'+time.getDate()
            }
          },
          templateId: 'RwDrRBqxUbMks1YfjmiHiYncBpvzlMdLdRDf7cUBDgE',
          miniprogramState: miniprogramState
        })
        //console.log(event.data.user.nickname+'接了您发布的任务')
        company.msgNum(info.openid, 1);
        ctx.data = await task.buyTask(info, event.data.user)
        ctx.body = await returnUtil.success(ctx)
      }
    }else{
      ctx.body = await returnUtil.error(ctx, 1, '操作频繁，稍后重试')
    }
    await next()
  })

  app.router('tixian', async (ctx, next) => {
    console.log(event.data)
    const tenapi = tenpay.init(config);
    var order = {
      partner_trade_no: event.data.partner_trade_no,
      openid: openid,
      re_user_name: event.data.realname,
      amount: event.data.money,
      desc: '企业付款描述信息',
    }
    console.log(config,order)
    ctx.body = await tenapi.transfers(order);
    await next()
  });

  app.router('wxpay', async (ctx, next) => {
    let {orderid,money,out_trade_no} = event.data;
    const tenapi = tenpay.init(config);
    var payinfo = {
      out_trade_no: out_trade_no,
      body: '商品简单描述',
      total_fee: 1, //订单金额(分),
      openid: openid //付款用户的openid
    };
    console.log(config,payinfo)
    var update = await task.upTask(orderid, {
      out_trade_no: out_trade_no,
    })
    ctx.body = await tenapi.getPayParams(payinfo);
    await next()
  });

  app.router('checkwxpay', async (ctx, next) => {
    let {orderid,out_trade_no} = event.data;
    const tenapi = tenpay.init(config);
    var result = await tenapi.orderQuery({
      out_trade_no: out_trade_no
    });
    console.log(result)
    var savedata = {
      trade_state: result.trade_state
    }
    if(result.trade_state == 'SUCCESS'){
      savedata.ispay = 1
    }
    var update = await task.upTask(orderid, savedata)
    ctx.body = result;
    await next()
  });

  app.router('payTask', async (ctx, next) => {
    var info = await task.getTaskById(event.data.taskid)
    if (order) {
      ctx.data = await task.upTask(event.data.taskid, {
        ispay: 1,
      })
      ctx.body = await returnUtil.success(ctx)
    } else {
      ctx.body = await returnUtil.error(ctx, 1, '未找到订单')
    }
    await next()
  });

  app.router('startTask', async (ctx, next) => {
    var order = await task.getOrderById(openid + event.data.taskid)
    var info = await task.getTaskById(event.data.taskid)
    if(info.taskmodel==2){
      if (order) {
        if(info.paytype == 0 && info.ispay==1){
          ctx.data = await task.upTask(event.data.taskid, {
            status: 2,
          })
          ctx.body = await returnUtil.success(ctx)
        }else if(info.paytype == 1){
          ctx.data = await task.upTask(event.data.taskid, {
            status: 2,
          })
          ctx.body = await returnUtil.success(ctx)
        }else{
          ctx.body = await returnUtil.error(ctx, 1, '雇主还没有付款')
        }
      } else {
        ctx.body = await returnUtil.error(ctx, 1, '您还没有下单')
      }
    }else if(info.taskmodel==1){
      if(info.paytype == 0 && info.ispay==1){
        ctx.data = await task.upTask(event.data.taskid, {
          status: 2,
        })
        ctx.body = await returnUtil.success(ctx)
      }else if(info.paytype == 1){
        ctx.data = await task.upTask(event.data.taskid, {
          status: 2,
        })
        ctx.body = await returnUtil.success(ctx)
      }else{
        ctx.body = await returnUtil.error(ctx, 1, '您还没有付款')
      }
    }
    await next()
  });
 
  //正常结算
  app.router('checkPay', async (ctx, next) => {
    var taskid = event.data.taskid;
    var order = await task.getOrderById(event.data.openid + taskid)
    if (order) {
      var info = await task.getTaskById(taskid)
      var orders = await task.taskRecords(taskid,0,1); //显示可发放工钱的订单
      var day = info.day ? info.day : 1 ;
      var workMoney = day * ( orders.data.length - 1 ) * ( info.captain_fee + 10 );
      var result = await team.addbill(info.team_id,{
        desc:'完成了一个带班任务获得雇主方和工人方的'+workMoney+'元',
        number:workMoney,
        pm:1,
        title:'带班完成',
        taskid: taskid
      },workMoney);

      var workUserMoney = info.money * day;
      if(result){
        var userMoney = 
        team.addbill(info.team_id,{
          desc:'带队完成了一个任务获得'+workUserMoney+'元',
          number:workUserMoney,
          pm:1,
          title:'任务完成',
          taskid: taskid
        },workUserMoney);
      }

      var userMoney = (info.money - 10) * day;
      //计算工人实际得到的工钱
      for (var i = 0; i < orders.data.length; i++){
        if(orders.data[i].openid && event.data.openid != orders.data[i].openid){
          if(orders.data[i].ismoney ==0 ){
            team.addbill(orders.data[i].openid,{
              desc:'完成了一个任务获得'+userMoney+'元',
              number:userMoney,
              pm:1,
              title:'任务完成',
              taskid: taskid
            },userMoney);
            //工人完成订单数
            team.updateUserInfo(orders.data[i].openid, {
              fintask: team._.inc(1)
            })
            //单个任务订单结款状态
            task.upTaskRecord(orders.data[i]._id, { ismoney: 1 })
          }
        }
      }
      ctx.body = await task.upTask(taskid, {
        team_money: 2,
        status: 3
      })
      ctx.body = await returnUtil.success(ctx)
    } else {
      ctx.body = await returnUtil.error(ctx, 1, '您还没有下单')
    }
    await next()
  });

  //结算工人工钱
  app.router('getMoney', async (ctx, next) => {
    var taskid = event.data.taskid;
    var order = await task.getOrderById(event.data.openid + taskid)
    if (order) {
      //给工人发钱
      if(order.ac == 1){
        var info = await task.getTaskById(taskid)
        if(order.ismoney == 1){
          ctx.body = await returnUtil.error(ctx, 1, '已结算')
        }else{
          var workMoney = info.money;
          if(info.taskmodel==2){
            workMoney = workMoney - 10;
          }
          workMoney = workMoney * info.day;
          team.addbill(event.data.openid,{
            desc:'完成了一个任务获得'+workMoney+'元',
            number:workMoney,
            pm:1,
            title:'任务完成',
            taskid: taskid
          },workMoney);
          //工人完成订单数
          team.updateUserInfo(order.openid, {
            fintask: team._.inc(1)
          })
          //单个任务订单结款状态
          task.upTaskRecord(order._id, { ismoney: 1 })
          ctx.data = {};
          ctx.body = await returnUtil.success(ctx)
        }
      }
      //队长申请结款
      if (order.ac == 2) {
        task.upTaskRecord(order._id, { ismoney: 1 })
        task.upTask(taskid, { team_money: 1 })
        order.ismoney = 1;
        ctx.data = order;
        ctx.body = await returnUtil.success(ctx)
      }
    } else {
      ctx.body = await returnUtil.error(ctx, 1, '订单不存在')
    }
    await next()
  });

  app.router('team_bill', async (ctx, next) => {
    var taskid = event.data.taskid;
    var info = await task.getTeamBill(taskid)
    if(info){
      ctx.data = await task.updateTeamBill(event.data);
    }else{
      ctx.data = await task.addTeamBill(event.data);
    }
    var member = event.data.member;
    console.log(member);
    for (let index = 0; index < member.length; index++) {
      task.upTaskRecord(member[index].openid+taskid, { amount: Number(member[index].amount) })
    }
    task.upTask(taskid, { team_money: 1 })
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  app.router('reduce_team_bill', async (ctx, next) => {
    var taskid = event.data.taskid;
    console.log('reduce_team_bill',taskid,event.data)
    ctx.data = await task.upTask(taskid, { team_money: -1 })
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //雇主非正常结算
  app.router('save_team_bill', async (ctx, next) => {
    var taskid = event.data.taskid;
    var teambill = await task.getTeamBill(taskid);
    var info = await task.getTaskById(taskid)
    var orders = await task.taskRecords(taskid, 0, 1);
    var day = info.day ? info.day : 1;
    var workMoney = day * ( orders.data.length - 1 ) * ( teambill.captain_fee + 10 );
    var result = await team.addbill(info.team_id,{
      desc:'完成了一个带班任务获得雇主方和工人方的'+workMoney+'元',
      number:workMoney,
      pm:1,
      title:'带班完成',
      taskid: taskid
    },workMoney);
    
    for (var i = 0; i < orders.data.length; i++){
      if( orders.data[i].ismoney == 0 && orders.data[i].openid ) {
        var userMoney = orders.data[i].amount * day;
        if(info.team_id != orders.data[i].openid){
          userMoney = userMoney - 10 * day;
        }
        if(userMoney>0){
          team.addbill(orders.data[i].openid,{
            desc:'完成了一个任务获得'+userMoney+'元',
            number:userMoney,
            pm:1,
            title:'任务完成',
            taskid: taskid
          },userMoney);
          //工人完成订单数
          team.updateUserInfo(orders.data[i].openid, {
            fintask: team._.inc(1)
          })
        }
        //单个任务订单结款状态
        task.upTaskRecord(orders.data[i]._id, { ismoney: 1 })
      }
    }
    ctx.body = await task.upTask(taskid, {
      team_money: 2,
      status: 3
    })

    if(event.data.cha<0){
      var tui = 0 - event.data.cha;
      team.addbill(info.openid,{
        desc:'一个任务有退款，获得'+tui+'元',
        number:tui,
        pm:1,
        title:'任务完成',
        taskid: taskid
      },tui);
    }
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  app.router('addCommit', async (ctx, next) => {
    var taskid = event.data.taskid;
    var order_id =event.data.openid + taskid;
    var order = await task.getOrderById(order_id)
    if(order){
      event.data.commit = 1;
      if(event.data.commit_level==3){
        var wechat = await team.getWechatById(event.data.openid);
        task.addblack(wechat,openid);
      }
      ctx.data = await task.upTaskRecord(order_id, event.data);
      ctx.body = await returnUtil.success(ctx)
    }else{
      ctx.body = await returnUtil.error(ctx, 1, '您还没有下单')
    }
    await next()
  });

  app.router('getBlack', async (ctx, next) => {
    var obj = {}
    if(event.data.my == 0){
      obj.parent = openid;
      obj.type = 2;
    }
    if(event.data.my == 1){
      obj.type = 1;
    }
    ctx.data = await task.getblack(obj);
    ctx.body = await returnUtil.success(ctx)
    await next()
  });

  app.router('delBlack', async (ctx, next) => {
    var result = await task.delblack(event.data.id);
    if(result){
      ctx.data = await task.getblack({
        parent:openid,
        type:2
      });
      ctx.body = await returnUtil.success(ctx)
    }else{
      ctx.body = await returnUtil.error(ctx, 1, '操作失败')
    }
    await next()
  });

  app.router('getOrderInfo', async (ctx, next) => {
    var order = await task.getOrderById(openid + event.data.taskid)
    if (order) {
      ctx.data = order
      ctx.body = await returnUtil.success(ctx)
    }else{
      ctx.body = await returnUtil.error(ctx, 1, '您还没有下单')
    }
    await next()
  })

  app.router('cxtask', async (ctx, next) => {
    ctx.data = await task.upTask(event.data.taskid, { status: -1 })
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  app.router('cexiao', async (ctx, next) => {
    var order = await task.getOrderById(event.data.order_id)
    ctx.data = await task.upTaskRecord(event.data.order_id, { status: -1 })
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //发布方审核
  app.router('shenTask', async (ctx, next) => {
    var taskid = event.data.taskid;
    var info = await task.getTaskById(event.data.taskid)
    var order = await task.getOrderById(event.data.order_id)
    console.log(info, order)
    if (info.count == 0 && info.team_id == '') {
      ctx.body = await returnUtil.error(ctx, 1, '还没有人接单')
    }
    // if (info.order_num == 0 && info.team_id) {
    //   ctx.body = await returnUtil.error(ctx, 1, '还没有人接单')
    // }
    if (info.status == 2) {
      ctx.body = await returnUtil.error(ctx, 1, '任务已开始')
    }
    
    //中标任务订单状态改变
    var update2 = await task.upTaskRecord(event.data.order_id, { status: 1 })
    if (update2){
      //接单人任务数量增加
      var update3 = await team.updateUserInfo(order.openid, {
        dotask: team._.inc(1)
      })
    }

    if (order.ac == 2){
      var update = await task.upTask(taskid, {
        status: 1,
        team_id: order.openid,
      })
    }else{
      var update = await task.upTask(taskid, {
        order_num: team._.inc(1)
      })
      if(info.taskmodel==1){
        var update2 = await task.upTask(taskid, {
          status: 1
        })
      }
    }
    var time = new Date();
    cloud.openapi.subscribeMessage.send({
      touser: order.openid,
      page: '/pages/task_info/task_info?id='+taskid,
      data: {
        thing1: {
          value: '任务信息'
        },
        thing2: {
          value: '雇主审核了你接的任务'
        },
        thing3: {
          value: event.data.user.nickname
        },
        time4: {
          value: time.getFullYear()+'-'+(time.getMonth()-1)+'-'+time.getDate()
        }
      },
      templateId: 'RwDrRBqxUbMks1YfjmiHiYncBpvzlMdLdRDf7cUBDgE',
      miniprogramState: miniprogramState
    })
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //获取任务列表
  app.router('getTaskNew', async (ctx, next) => {
    var sqlmap = {};
    if (event.data.openid == true) {
      sqlmap.openid = openid;
    }
    if (event.data.qu) sqlmap.qu = event.data.qu;
    if (event.data.typeid) sqlmap.typeid = event.data.typeid;
    if (event.data.time){
      var n = 1;
      if (event.data.time == 2) n = 3
      if (event.data.time == 3) n = 7 
      var timeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
      if (event.data.time == 4){
        var DayAfter = timeStamp + 86400 * 7;
        sqlmap.strtime = task._.gt(DayAfter)
      }else{
        var DayAfter = timeStamp + 86400 * n;
        sqlmap.strtime = task._.lt(DayAfter)
      }
      console.log(DayAfter)
    }
    if (event.data.openid == true) {
    }else{
      sqlmap.status = task._.in([0, 1])
    }
    let tasks = await task.getTaskList(sqlmap)
    for (var i = 0; i < tasks.data.length; i++){
      tasks.data[i].catename = await task.getTaskCateName(tasks.data[i].typeid)
    }
    ctx.data = await tasks;
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //获取任务列表
  app.router('getMyTask', async (ctx, next) => {
    var sqlmap = event.data;
    sqlmap.openid = openid;
    var orders = await task.getMyOrder(sqlmap,0);
    if (orders.data.length>0){
      for (var i = 0; i < orders.data.length; i++){
        orders.data[i].task = await task.getTaskById(orders.data[i].taskid)
        orders.data[i].catename = await task.getTaskCateName(orders.data[i].typeid)
      }
    }
    ctx.data = await orders;
    ctx.body = await returnUtil.success(ctx)
    console.log(ctx.body)
    await next()
  })

  app.router('getTask', async (ctx, next) => {
    ctx.data = await task.getTaskById(event.data.id)
    ctx.data.poster = await company.getById(ctx.data.openid)
    if(ctx.data.team_id){
      ctx.data.team = await team.getTeamById(ctx.data.team_id)
    }
    if(ctx.data.team_money==1){
      ctx.data.team_bill = await task.getTeamBill(event.data.id)
    }
    console.log(ctx.data)
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  // 获取轮播
  app.router('getBanner', async (ctx, next) => {
    ctx.data = await _bannerItem(banner.getBanner())
    ctx.body = await returnUtil.success(ctx)
    await next();
  })
  // 获取主题
  app.router('getTheme', async (ctx, next) => {
    ctx.data = await _themeItem(theme.getTheme())
    ctx.body = await returnUtil.success(ctx)
    await next()
  })
  // 获取最新的10个任务
  app.router('getTaskList', async (ctx, next) => {
    ctx.data = await _productItem(product.getProduct({}, 0, 4))
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  /***************************    零工哥   *****************************************/
  //添加队长
  app.router('creatTeam', async (ctx, next) => {
    const info = await team.getTeamById(openid)
    if(info){
      team.update(openid, event.data.team)
      ctx.data = { action: 'edit', status: 1 };
      ctx.body = await returnUtil.success(ctx);
    }else{
      ctx.data = await team.create(openid, event.data.team)
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })

  //查询公司信息
  app.router('getCompany', async (ctx, next) => {
    ctx.data = await company.getById(event.data.openid)
    if (ctx.data === undefined){
      ctx.data = await company.getById(openid)
      if (ctx.data === undefined){
        ctx.body = await returnUtil.error(ctx, 1, '未注册')
      }else{
        ctx.body = await returnUtil.success(ctx)
      }
    }else{
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })
  
  //添加公司
  app.router('creatCompany', async (ctx, next) => {
    const info = await company.getById(openid)
    if (info){
      company.update(openid, event.data.posterData)
      ctx.data = {action:'edit',status:1};
      ctx.body = await returnUtil.success(ctx);
    } else {
      company.create(openid, event.data.posterData)
      ctx.data = { action: 'add', status: 1};
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })

  /* 个人认证 */
  app.router('renzhenUser', async (ctx, next) => {
    const renzhen = await company.getRenzhen(openid+'1')
    console.log(renzhen)
    if (renzhen) {
      ctx.data = renzhen;
      ctx.body = await returnUtil.success(ctx)
    } else {
      if (event.data.pic){
        ctx.data = await company.renzhen(openid+'1', event.data.pic)
        ctx.body = await returnUtil.success(ctx)
      }else{
        ctx.body = await returnUtil.error(ctx, 1, '未实名')
      }
    }
    await next()
  })

  /* 队长认证 */
  app.router('renzhenTeam', async (ctx, next) => {
    const renzhen = await team.getRenzhen(openid+'2')
    console.log(renzhen)
    if (renzhen) {
      ctx.data = renzhen;
      ctx.body = await returnUtil.success(ctx)
    } else {
      if (event.data.pic){
        ctx.data = await company.renzhen(openid+'2', event.data.pic)
        ctx.body = await returnUtil.success(ctx)
      }else{
        ctx.body = await returnUtil.error(ctx, 1, '未实名')
      }
    }
    await next()
  })

  /* 公司认证 */
  app.router('renzhenCompany', async (ctx, next) => {
    const renzhen = await company.getRenzhen(openid+'3')
    console.log(renzhen)
    if (renzhen) {
      ctx.data = renzhen;
      ctx.body = await returnUtil.success(ctx)
    } else {
      if (event.data.pic){
        ctx.data = await company.renzhen(openid+'3', event.data.pic)
        ctx.body = await returnUtil.success(ctx)
      }else{
        ctx.body = await returnUtil.error(ctx, 1, '未实名')
      }
    }
    await next()
  })

  //查询队长
  app.router('getTeam', async (ctx, next) => {
    if(event.data.openid){
      ctx.data = await team.getTeamById(event.data.openid)
    }else{
      if(openid === undefined){
        console.log('openid失效2')
        ctx.body = {data:''};
      }else{
        ctx.data = await team.getTeamById(openid)
      }
    }
    console.log(ctx.data)
    if (ctx.data === undefined) {
      ctx.body = await returnUtil.error(ctx, 1, '未注册')
    } else {
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })

  //查询会员
  app.router('getUser', async (ctx, next) => {
    if(event.data.openid){
      ctx.data = await team.getUserById(event.data.openid)
    }else{
      if(openid === undefined){
        console.log('openid失效1')
        ctx.body = {data:''};
      }else{
        ctx.data = await team.getUserById(openid)
      }
    }
    if (ctx.data === undefined) {
      ctx.body = await returnUtil.error(ctx, 1, '未注册')
    } else {
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })

  //消息列表
  app.router('getMessage', async (ctx, next) => {
    ctx.data = await team.getMessage(openid);
    company.msgNum(openid, 0)
    ctx.body = await returnUtil.success(ctx)
    await next()
  });

  //查询会员
  app.router('getWechat', async (ctx, next) => {
    ctx.data = await team.getWechatById(openid)
    if (ctx.data === undefined) {
      if (event.data.user) {
        if(event.data.user.nickName === undefined){
          ctx.body = await returnUtil.error(ctx, 1, '信息错误')
        }else{
          team.createWechat(openid, event.data.user)
          ctx.data = event.data.user;
          ctx.openid = openid;
          ctx.body = await returnUtil.success(ctx)
        }
      }else{
        ctx.body = await returnUtil.error(ctx, 1, '未注册')
      }
    } else {
      console.log('---------更新资料---------------')
      if (event.data.user) {
        team.updateWechat(openid, event.data.user)
      }
      ctx.data.openid = openid;
      delete ctx.data._id
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })

  //队员加入
  app.router('ifAddMember', async (ctx, next) => {
    var ifadd = await team.isAddMembner(event.data.openid,openid);
    if(ifadd>0){
      ctx.data = ifadd;
      ctx.body = await returnUtil.success(ctx)
    }else{
      ctx.body = await returnUtil.error(ctx, 1, '未加入')
    }
    await next()
  })
  
  //队员加入
  app.router('addMembers', async (ctx, next) => {
    var ifadd = await team.isAddMembner(event.data.openid,openid);
    if(ifadd>0){
      ctx.body = await returnUtil.error(ctx, 1, '已加入')
    }else{
      var wechat = await team.getWechatById(openid);
      var user = await team.getUserById(openid);
      console.log(ifadd,wechat,user)
      ctx.data = await team.addMembers(event.data.openid,user,wechat);
      ctx.body = await returnUtil.success(ctx)
    }
  })

  //我的队员
  app.router('members', async (ctx, next) => {
    ctx.data = await team.members({
      openid: openid,
      grade: event.data.grade
    }, event.data.page)
    ctx.data.total = await team.memberCount(openid);
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //钱包明细
  app.router('billRecode', async (ctx, next) => {
    ctx.data = await team.billRecode({
      openid:openid,
      type: event.data.type
    }, event.data.page - 1)
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  //添加会员
  app.router('creatUser', async (ctx, next) => {
    const info = await team.getUserById(openid)
    console.log(info)
    if (info) {
      team.updateUser(openid, event.data.user)
      ctx.data = { action: 'edit', status: 1 };
      ctx.body = await returnUtil.success(ctx);
    } else {
      team.createUser(openid, event.data.user)
      ctx.data = { action: 'add', status: 1 };
      ctx.body = await returnUtil.success(ctx)
    }
    await next()
  })

  // 根据订单获取信息
  app.router('getOrderById', async (ctx, next) => {
    let orderId = event.data.orderId
    ctx.data = await order.getOrderById(orderId)
    ctx.body = await returnUtil.success(ctx)
    await next()
  })

  // 获取订单信息
  app.router('getOrderList', async (ctx, next) => {
    ctx.data = await order.getOrderList(event.userInfo)
    ctx.body = await returnUtil.success(ctx)
    await next()
  })
  /***************************    测试   *****************************************/
  app.router('tests', async (ctx, next) => {
    // test 可参数类型 是否决定传参
    ctx.data = await baseTest.test()
    ctx.body = await returnUtil.success(ctx);
    await next();
  })
  /***************************    云函数调用   *************************************/
  app.router('callFunc', async (ctx, next) => {
    // test 可参数类型 是否决定传参
    console.log(event.data)
    ctx.data = "云函数之间的调用"
    ctx.body = await returnUtil.success(ctx);
    await next();
  })
  // 轮播图片地址拼接
  function _bannerItem(data) {
    return new Promise((resolve, reject) => {
      data.then(res => {
        res.data.forEach(data => {
          data.image = IMAGEPREFIX + data.image
        })
        resolve(res)
      })
    })
  }
  // 主题图片地址拼接
  function _themeItem(data) {
    return new Promise((resolve, reject) => {
      data.then(res => {
        res.data.forEach(data => {
          data.theme_icon = IMAGEPREFIX + data.theme_icon
        })
        resolve(res)
      })
    })
  }
  // 多个商品图片地址拼接
  function _productItem(data) {
    return new Promise((resolve, reject) => {
      data.then(res => {
        res.data.forEach(data => {
          data.product_img = IMAGEPREFIX + data.product_img
        })
        resolve(res)
      })
    })
  }
  return app.serve();
}