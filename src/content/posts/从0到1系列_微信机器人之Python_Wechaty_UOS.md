---
title: 从0到1系列_微信机器人之Python_Wechaty_UOS
pubDate: 2022-08-17
categories: ['微信机器人', 'JavaScript']
description: '看过前面教程的同学应该都了解了如果想用wechaty搭建一个微信机器人必须要有一个puppet的支持，而目前来说最稳定的puppet当属padlocal，但是需要收费且价格不算便宜，对于那些只是想尝鲜或者做测试的同学来说很不友好。今天要介绍的是一个免费的puppet---UOS微信，其实也就是一款桌面版微信。'
---

### 前言
- 本系列教程力求简洁明了，务必保证你的环境以及所有依赖的版本跟教程保持一致。

### 目标
- 使用Python完成一个微信机器人，即给一个微信号发送一个"ding"，此微信号自动回复一个"dong"。

### 项目介绍
- 看过前面教程的同学应该都了解了如果想用wechaty搭建一个微信机器人必须要有一个puppet的支持，而目前来说最稳定的puppet当属padlocal，但是需要收费且价格不算便宜，对于那些只是想尝鲜或者做测试的同学来说很不友好。今天要介绍的是一个免费的puppet---UOS微信，其实也就是一款桌面版微信。
- UOS版的优点就是免费，且搭建也很简单；缺点也很明显：不稳定、功能少。但是对于想尝鲜或做测试的同学来说已经足够了。
- 和padloacl类似，除了原生TS的wechaty，其他语言使用wechaty都需要一个gateway来供你的业务代码连接。之前使用padlocal的时候，gateway直接使用了官方封装的docker来连接。但是UOS下不知道什么原因，官方的docker我测试的一直连接失败，所以只能通过npm运行gateway的方式来实现了。如果有同学研究出来了docker镜像的方式烦请告知我，谢谢。
- **重要说明**：UOS版随时有可能因为官方某些原因无法使用，所以如果你是恰巧过了很长时间看到这篇教程且运行失败的话，那可能就是已经失效而不是你的原因。

### 前置条件
- 安装node

### 正式开始
- Shell中依次运行下面命令
``` bash
# 安装wechaty
npm install -g wechaty wechaty-puppet-wechat

# 设置环境变量，linux和mac使用export代替set
# WECHATY_PUPPET_SERVICE_TOKEN随机字符串，最好唯一，建议使用python的uuid.uuid4()生成
set  WECHATY_PUPPET_WECHAT_PUPPETEER_UOS=true
set  WECHATY_PUPPET_SERVICE_TOKEN="insecure_40fc7334-1234-5678-7777-780948c983d41"
set  WECHATY_PUPPET="wechaty-puppet-wechat"
set  WECHATY_LOG="verbose"
set  WECHATY_PUPPET_SERVER_PORT="8080"
set  WECHATY_PUPPET_SERVICE_NO_TLS_INSECURE_SERVER=true

# 运行wechaty网关服务
wechaty gateway --token %WECHATY_PUPPET_SERVICE_TOKEN% --port %WECHATY_PUPPET_SERVER_PORT%  --puppet wechaty-puppet-wechat
# mac or linux
wechaty gateway --token $WECHATY_PUPPET_SERVICE_TOKEN --port $WECHATY_PUPPET_SERVER_PORT --puppet wechaty-puppet-wechat
```
正常情况下会提示一个URL，打开使用微信机器人账号登陆
- 业务代码
```python
# python环境要有wechaty，这里的wechaty和上面npm安装的不是一回事（pip install wechaty）
from wechaty import Wechaty, Message
import asyncio, os

os.environ["WECHATY_PUPPET_SERVICE_ENDPOINT"] = "127.0.0.1:8080"
os.environ["WECHATY_PUPPET_SERVICE_TOKEN"] ="insecure_40fc7334-1234-5678-7777-780948c983d41"

os.environ["WECHATY_PUPPET_WECHAT_PUPPETEER_UOS"] = "true"

bot = Wechaty()

class MyBot(Wechaty):
    async def on_message(self, msg: Message) -> None:
        text = msg.text()
        if text == "ding":
            res = "dong"
            await msg.say(res)

asyncio.run(MyBot().start())
```
运行python代码，一切正常的话，使用别的微信号在机器人账号发送ding，机器人回复dong即代表成功。