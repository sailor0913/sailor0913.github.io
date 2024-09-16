---
title: 阻止wechaty插件消息传递
pubDate: 2022-08-18
categories: ['微信机器人']
description: '你的微信机器人的功能很多，所有业务代码都写在一个on_message里，那势必造成代码难以管理。python-wechaty提供了插件系统分离你的业务代码。'
---

### 情景说明
- 你的微信机器人的功能很多，所有业务代码都写在一个on_message里，那势必造成代码难以管理。python-wechaty提供了插件系统分离你的业务代码。（几乎所有框架都会提供类似的东西）于是你的代码看起来像下面这样
```python
async def main() -> None:
    bot = MyBot()
    bot.use([
        Test1Plugin(),
        Test2Plugin(),
        Test3Plugin()
    ])
await bot.start()
```
这样你的业务代码就分离到了Test1、2、3中，但是实际运行中你会发现当你的机器人触发了Test1中的关键词后，wechaty仍然会把消息继续向Test2、3中继续传递，这就造成了资源的浪费

### 解决方法
- 如果想阻止消息向下继续传递，需要使用message_controller模块，代码示例如下：
```python
# pip install wechaty_plugin_contrib -i https://pypi.tuna.tsinghua.edu.cn/simple
from wechaty_plugin_contrib.message_controller import message_controller

class DingDongPlugin(WechatyPlugin):
    @message_controller.may_disable_message
    async def on_message(self, msg: Message) -> None:
        if msg.text() == "ding":
            await msg.say("dong")
            message_controller.disable_all_plugins(msg)
```
- 代码说明：  
  - 将message_controller作为装饰器放在on_message上
  - 在想阻止消息传递的地方添加message_controller.disable_all_plugins(msg)即可