'use strict';

const Cookies = require('cookies');
const WebSocket = require('ws');
const WebSocketServer = require('ws').Server;
const url = require('url');

let Util = {
    parserUser: (obj) => {
        // 将obj转化为user
        if (!obj) {
            return;
        }

        let s = '';
        if (typeof obj === 'string') {
            s = obj;
        } else if (obj.headers) {
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
    },
    createWebSocketServer: (server, onConection, onMessage, onClose, onError) => {
        // 创建一个长连接监听器
        let wss = new WebSocketServer({
            server: server
        });

        // 添加一个广播方法，给连接此长连接的用户都发送一个消息
        wss.broadcast = (data) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }

        // 给每种监听添加默认函数
        onConection = onConection || function () {
            console.log('[WebSocket] connected.');
        };
        onMessage = onMessage || function (msg) {
            console.log('[WebSocket] message received: ' + msg);
        };
        onClose = onClose || function (code, message) {
            console.log(`[WebSocket] closed: ${code} - ${message}`);
        };
        onError = onError || function (err) {
            console.log('[WebSocket] error: ' + err);
        };

        wss.on('connection', function (ws, request) {
            // 获取访问url
            let location = url.parse(request.url, true);
            console.log('[WebSocketServer] connection: ' + location.href);
            ws.on('message', onMessage);
            ws.on('close', onClose);
            ws.on('error', onError);

            if (location.pathname !== '/ws/chat') {
                ws.close(4000, 'Invalid URL');
            }
            let user = Util.parserUser(request);
            if (!user) {
                ws.close(4001, 'Invalid user');
            }

            ws.user = user;
            ws.wss = wss;
            onConection.apply(ws);
        });

        console.log('WebSocketServer was attached.');
        return wss;
    },
    messageIndex: 0,
    createMessage: (type, user, data) => {
        Util.messageIndex++;
        return JSON.stringify({
            id: Util.messageIndex,
            type: type,
            user: user,
            data: data
        });
    }
};

module.exports = Util;