'use strict';

const Koa = require('koa');
const getRouterWithNeedParser = require('./url_controllers/_manager');
const putRenderFn = require('./nunjucks_helper');
const Util = require('./utils');
const ModelManager = require('./model_controllers/_manager');

// 是否正式发布
const isProduction = process.env.NODE_ENV === 'production';
const koa = new Koa();


(async () => {
    console.log('something');
    // 初始化数据库
    await ModelManager.sync();
    let User = ModelManager.getModel('user');
    let user = await User.create({
        username: 'xujierui',
        password: '1104',
        createdAt: 0,
        updatedAt: 0,
        version: 0
    });
    console.log(JSON.stringify(user));
})();

// 此中间件用以统计加载页面的时间
koa.use(async (context, next) => {
    let startTime = new Date().getTime();
    await next();
    console.log(`${context.request.method} url: ${context.request.url} in ${new Date().getTime() - startTime}ms`);
});

// 添加获取用户信息中间件
koa.use(async (context, next) => {
    context.state.user = Util.parserUser(context.cookies.get('name') || '');
    await next();
});

if (!isProduction) {
    const getStaticFile = require('./static/_manager');
    // 筛选静态文件
    koa.use(getStaticFile());
}

let router = getRouterWithNeedParser();
// 是否需要bodyParser（处理post表单的）
if (router.hasOwnProperty('isNeedParser') && router.isNeedParser) {
    const bodyParser = require('koa-bodyparser');
    koa.use(bodyParser());
}

koa.use(putRenderFn('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

koa.use(router.routes());

let server = koa.listen(3000);

function onConnect() {
    let user = this.user;
    let msg = Util.createMessage('join', user, `${user.name} 进入房间.`);
    this.wss.broadcast(msg);
    // build user list:
    let users = [];
    this.wss.clients.forEach(client => {
        users.push(client.user);
    });
    this.send(Util.createMessage('list', user, users));
}

function onMessage(message) {
    console.log(message);
    if (message && message.trim()) {
        let msg = Util.createMessage('chat', this.user, message.trim());
        this.wss.broadcast(msg);
    }
}

function onClose() {
    let user = this.user;
    let msg = Util.createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}

koa.wss = Util.createWebSocketServer(server, onConnect, onMessage, onClose);