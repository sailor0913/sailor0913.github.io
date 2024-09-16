---
title: 自建fastgpt服务
pubDate: 2024-06-12
categories: ['有趣']
description: ''
---

> [FastGPT](https://github.com/labring/FastGPT) 是一个基于 LLM 大语言模型的知识库问答系统，提供开箱即用的数据处理、模型调用等能力。同时可以通过 Flow 可视化进行工作流编排，从而实现复杂的问答场景！

上面是官方对fastgpt的定义，我个人的理解是一个可以自定义的问答系统，可以用来做一些有趣的事情，比如问答、对话等。当然其还有非常强大的编排功能，可以实现复杂的问答场景。

具体内容可以查看[官方网站](https://fastgpt.in/zh)，后续我也会写一些文章来介绍一些fastgpt的高级用法。今天我们先来看一下如何在自己的电脑上搭建一个fastgpt服务。当然，你也可以直接查看官方文档---[docker compose快速部署](https://doc.fastgpt.in/docs/development/docker/)

### 搭建环境
- ubuntu 20.04（我这里只写怎么在linux上部署，其他系统的请自行查阅官方文档）


### 安装docker
```shell
# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable --now docker
# 安装 docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
# 验证安装
docker -v
docker-compose -v
```

### 下载脚本文件
```shell
mkdir fastgpt
cd fastgpt
curl -O https://raw.githubusercontent.com/labring/FastGPT/main/projects/app/data/config.json

# pgvector 版本(测试推荐，简单快捷)
curl -o docker-compose.yml https://raw.githubusercontent.com/labring/FastGPT/main/files/docker/docker-compose-pgvector.yml
# milvus 版本
# curl -o docker-compose.yml https://raw.githubusercontent.com/labring/FastGPT/main/files/docker/docker-compose-milvus.yml
# zilliz 版本
# curl -o docker-compose.yml https://raw.githubusercontent.com/labring/FastGPT/main/files/docker/docker-compose-zilliz.yml
```
### 启动容器
- 下面的命令启动容器后先不用去访问 fastgpt，需要先配置 oneapi 添加模型等操作，具体看下一步
- 下面拉取镜像的时候因为众所周知的原因，可能拉取比较慢或者失败，截至2024-6-12下面方法是有效的：
```shell
# vim /etc/docker/daemon.json
{
    "registry-mirrors": [
        "https://docker.m.daocloud.io",
        "https://docker.nju.edu.cn",
        "https://dockerproxy.com"
    ]
}
```
```shell
# 启动容器
docker-compose up -d
# 等待10s，OneAPI第一次总是要重启几次才能连上Mysql
sleep 10
# 重启一次oneapi(由于OneAPI的默认Key有点问题，不重启的话会提示找不到渠道，临时手动重启一次解决，等待作者修复)
docker restart oneapi
```

### oneapi前置知识
- oneapi像一个网关用来统一管理所有大模型并负责把大模型的消息返回给 fastgpt
#### 渠道
- oneapi 中一个渠道对应一个 api key，这个api key需要自行去各大厂商申请，一般一个key可以调用同一个厂商的多个模型
- oneapi 根据请求传入的模型决定使用哪一个key，如果一个模型对应多个key，则会随机调用
#### 令牌
- 访问oneapi的凭证，一个凭证即可访问oneapi上配置的所有模型
- 令牌所需的baseurl和令牌在上面下载的config.json文件中配置
#### 大致工作流程
- 客户端请求 oneapi
- 根据请求中的 model 参数，匹配对应的渠道，如果匹配到多个渠道则随机选择一个
- oneapi 向真正的地址发出请求
- oneapi 将结果返回客户端

### 配置oneapi
- 通过ip:3001访问oneapi的管理界面，默认账号为root，密码为123456
- 我这里以使用通义千问的模型为例，相关key自行去阿里云申请
#### 增加渠道---通义千问示例
- 这里一般需要两个模型，一个qwen 的，一个向量模型，如果是使用一家公司的，像下图在模型栏已经引入了 qwen-turbo 和 text-embedding-v1 的话，只需要建立一个渠道即可
- 名称随意起，密钥就是你申请的key
- 重点就是在只要在模型栏引入向量模型和对话模型即可
- ![](https://blog.lovehxy.com/blog/fastgpt-oneapi-通义千问配置.png)
#### 修改fastgpt环境变量（仅测试的话可跳过）
- 如果是本地测试的话，使用默认的配置即可，不需要额外配置就可以跑通
- 需要修改的话，通过修改上面docker-compose.yml文件中的baseurl和key请求oneapi，再由oneapi去请求不同的模型
```shell
# 下面的地址是 Sealos 提供的，务必写上 v1， 两个项目都在 sealos 部署时候，https://xxxx.cloud.sealos.io 可以改用内网地址
OPENAI_BASE_URL=https://xxxx.cloud.sealos.io/v1
# 下面的 key 是由 One API 提供的令牌
CHAT_API_KEY=sk-xxxxxx
```
#### 修改 fastgpt 的配置文件（重要）
- 通过浏览器访问 oneapi 并且配置好相关内容后，还需要修改上面下载的 config.json，这里仍然以通义千问为例
- 下面配置的内容一定要和上面通过浏览器访问添加的 model 和 name 保持一致
```shell
# 找到llmModels字段，直接在其本身的内容上覆盖修改 model 和 name 即可
"llmModels": [
	{
		"model": "qwen-plus"
		"name": "qwen-plus"
	}
	...
	{
		"model": "qwen-turbo"
		"name": "qwen-turbo"
	}
]

# 找到vectorModels字段配置向量模型，直接在其本身的内容上覆盖修改 model 和 name 即可
# 注意这里的向量模型model和name一般在浏览器访问 oneapi 的时候，系统默认的有，也可以通过查找对应厂商的文档
"vectorModels": [
	{
		"model": "text-embedding-v1",
		"name": "text-embedding-v1"
	}
]

# 配置完成后重启
docker-compose down
docker-compose up -d
```

### 基础测试
- 通过ip:3000直接访问（注意防火墙）,账号root，密码1234
#### 新建知识库
- 选择知识库-新建-通用知识库，名称随便起，索引模型选择上面部署部分填写的向量模型 text-embedding-v1
- 数据集-新建导入-文本数据集-本地文件，选取一个 pdf上传-选择训练模式和自定义规则
- 之后可以进入该知识库进行搜索测试和配置
#### 新建应用
- 新建应用-新建-知识库+对话引导
- 简易配置-选择 AI 模型-关联知识库-发布
- 之后就可以在聊天界面选择对应的应用进行聊天