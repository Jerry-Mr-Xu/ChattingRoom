'use strict';

const Sequelize = require('sequelize');

var Factory = {
    defaultHooks: {
        beforeCreate: (record) => {
            let now = Date.now();
            record.createdAt = now;
            record.updatedAt = now;
            record.version = 0;
        },
        beforeUpdate: (record) => {
            let now = Date.now();
            record.updatedAt = now;
        }
    },
    packModel: function (sequelize, modelObj) {
        let
            name = modelObj.name,
            obj = modelObj.obj,
            hooks = modelObj.hooks,
            packedObj = {};

        // 为每一列加上非空
        for (const columnName in obj) {
            if (obj.hasOwnProperty(columnName)) {
                const columnType = obj[columnName];
                if (typeof columnType === 'object' && columnType.type) {
                    columnType.allowNull = columnType.allowNull || false;
                    packedObj[columnName] = columnType;
                } else {
                    packedObj[columnName] = {
                        type: columnType,
                        allowNull: false
                    };
                }
            }
        }

        // 加上uuid
        packedObj.uuid = {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        };

        // 加上创建时间
        packedObj.createdAt = {
            type: Sequelize.BIGINT,
            allowNull: false
        };

        // 加上更新时间
        packedObj.updatedAt = {
            type: Sequelize.BIGINT,
            allowNull: false
        };

        // 加上版本号
        packedObj.version = {
            type: Sequelize.INTEGER,
            allowNull: false
        };

        if (hooks) {
            // 合并默认和用户指定的hooks
            for (const methodName in Factory.defaultHooks) {
                if (Factory.defaultHooks.hasOwnProperty(methodName)) {
                    const methodBody = Factory.defaultHooks[methodName];
                    if (hooks.hasOwnProperty(methodName)) {
                        let hookMethod = hooks[methodName];
                        hooks[methodName] = (record) => {
                            methodBody(record);
                            hookMethod(record);
                        }
                    } else {
                        hooks[methodName] = methodBody;
                    }
                }
            }
        } else {
            hooks = Factory.defaultHooks;
        }

        return sequelize.define(name, packedObj, {
            timestamps: false,
            hooks: hooks
        });
    },
};

module.exports = Factory;