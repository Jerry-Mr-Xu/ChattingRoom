'use strict';

const ModelManager = require("../model_controllers/_manager");

var index = 0;

var loginArray = [{
    method: 'get',
    url: '/signin',
    fn: async (context, next) => {
        context.render('signin.html', {});
    }
},
{
    method: 'post',
    url: '/signin',
    fn: async (context, next) => {
        // 获取表单中的用户名和密码
        let username = context.request.body.username;
        let password = context.request.body.password;

        // 这里是暂时这样判断，之后要改为从数据库中查找
        // if (username === 'xujierui' && password === '1104') {
        //     // 暂时用于生成id
        //     index++;

        //     // 拼装userInfo对象
        //     let userInfoObj = {
        //         id: index,
        //         name: username,
        //         image: index % 10
        //     };
        //     // 将userInfo对象转为base64编码字符串
        //     let userInfoStr = Buffer.from(JSON.stringify(userInfoObj)).toString('base64');
        //     console.log(`Set cookie value: ${userInfoStr}`);
        //     // 将userInfo装入cookies
        //     context.cookies.set('name', userInfoStr);
        //     // 登录成功跳到主界面
        //     context.response.redirect('/main');
        // }
        
        // 从数据库中查找该用户名
        let UserModel = ModelManager.getModel('user');
        let user = await UserModel.findOne({
            where: {
                username: username
            }
        });
        if (user.password === password) {
            let userInfoObj = {
                id: user.uuid,
                name: username,
                image: Math.floor(Math.random() * 10)
            }
            // 将userInfo对象转为base64编码字符串
            let userInfoStr = Buffer.from(JSON.stringify(userInfoObj)).toString('base64');
            console.log(`Set cookie value: ${userInfoStr}`);
            // 将userInfo装入cookies
            context.cookies.set('name', userInfoStr);
            // 登录成功跳到主界面
            context.response.redirect('/main');
        } else {
            console.error(`Invalid password`);
        }
    }
}];

module.exports = loginArray;