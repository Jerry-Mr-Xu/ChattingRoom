'use strict';

const Cookies = require('cookies');

let Util = {
    parserUser: (obj) => {
        // 将obj转化为user
        if (!obj) {
            return;
        }

        let s = '';
        if (typeof obj === 'string') {
            s = obj;
        } else if (obj.header) {
            let cookies = new Cookies(obj, null);
            s = cookies.get('name');
        }

        if (s) {
            try {
                let user = JSON.parse(Buffer.from(s, 'base64').toString());
                return user;
            } catch (e) {
                console.error(`Parser ${Buffer.from(s, 'base64').toString()} to user failed!`);
            }
        } else {
            console.error(`Parser ${obj} to user failed!`);
        }
    }
};

module.exports = Util;