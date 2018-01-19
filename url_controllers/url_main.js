'use strict';

var mainUrlObj = {
    method: 'get',
    url: '/main',
    fn: async (context, next) => {
        let user = context.state.user;
        if (user) {
            context.render('main.html', user);
        }
    }
};

module.exports = mainUrlObj;