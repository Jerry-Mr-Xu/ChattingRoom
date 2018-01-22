'use strict';

const Sequelize = require('sequelize');
const config = require('./_config');
const fs = require('mz/fs');
const path = require('path');
const Factory = require('./_factory');

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    operatorsAliases: Sequelize.Op,
    pool: {
        min: 0,
        max: 5,
        idle: 30000
    }
});

function getAllModels() {
    // 得到当前文件夹即model_controllers下的所有匹配的model文件名
    let allModelFileNames = fs.readdirSync(__dirname).filter((fileName) => {
        return /\w+_model.js$/.test(fileName);
    });

    let modelMap = new Map();

    // 循环遍历
    allModelFileNames.forEach(modelFileName => {
        // 得到完整文件路径
        let modelFilePath = path.join(__dirname, modelFileName);

        // 动态导入文件
        let modelPrimaryObj = require(modelFilePath);

        // 用工厂加工该Model
        let modelObj = Factory.packModel(sequelize, modelPrimaryObj);

        // 将该Model以Model名为键以自身为值放入Map中
        modelMap.set(modelObj.name, modelObj);
    });

    return modelMap;
};

var ModelManager = {
    models: getAllModels(),
    /**
     * 获取Model
     * @param {string} modelName
     */
    getModel: function (modelName) {
        if (ModelManager.models.has(modelName)) {
            return ModelManager.models.get(modelName);
        } else {
            console.error(`Cannt find model: ${modelName}`);
        }
    },
    /**
     * 把所有define的model生成对应的表(仅用于测试)
     */
    sync: function () {
        if (process.env.NODE_ENV !== 'production') {
            console.log('sync database');
            sequelize.sync();
        }
    }
};

module.exports = ModelManager;