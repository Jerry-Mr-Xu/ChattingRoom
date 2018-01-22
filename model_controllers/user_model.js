'use strict';

const Sequelize = require('sequelize');
const Util = require('../utils');

var UserModel = {
    name: 'user',
    obj: {
        username: Sequelize.STRING(20),
        password: Sequelize.STRING(20)
    },
    hooks: {
        beforeCreate: (record) => {
            // 在创建记录之前的操作
            record.password = Util.encrypt(record.password);
        },
        afterCreate: (record) => {
            // 在创建记录之后的操作
            record.password = Util.decrypt(record.password);
        },
        beforeUpdate: (record) => {
            // 在更新记录之前的操作
            record.password = Util.encrypt(record.password);
        },
        afterUpdate: (record) => {
            // 在更新记录之后的操作
            record.password = Util.decrypt(record.password);
        }
    }
};

module.exports = UserModel;