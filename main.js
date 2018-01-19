'use strict';

const Koa = require('koa');
const getRouterWithNeedParser = require('./url_controllers/_manager');
const putRenderFn = require('./nunjucks_helper');
const Util = require('./utils');

// 是否正式发布
const isProduction = process.env.NODE_ENV === 'production';
const koa = new Koa();

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

koa.listen(3000);