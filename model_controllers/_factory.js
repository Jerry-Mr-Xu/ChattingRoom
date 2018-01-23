'use strict';

const Sequelize = require('sequelize');

var Factory = {
    defaultHooks: {
        beforeCreate: (record) => {
            // 在创建记录之前把创建时间更新时间和版本号加上
            let now = Date.now();
            record.createdAt = now;
            record.updatedAt = now;
            record.version = 0;
        },
        beforeUpdate: (record) => {
            // 在更新记录之前把更新时间加上
            let now = Date.now();
            record.updatedAt = now;
        },
        beforeValidate: (record) => {
            // 这个是为了解决在beforeCreate之前会进行数据完整性检测
            // 而此时createdAt、updatedAt和version并不存在会报出这些值不能为空的错误
            if (!record.createdAt) {
                record.createdAt = 0;
            }
            if (!record.updatedAt) {
                record.updatedAt = 0;
            }
            if (!record.version) {
                record.version = 0;
            }
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