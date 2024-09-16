---
title: 使用hugo从0搭建blog并部署到github Pages
pubDate: 2024-06-04
categories: ['博客']
description: ''
---

本教程旨在教会你使用hugo+github pages+github actions搭建一个完全免费的个人博客。其中关于一些基本概念比如git、hugo等不再过多介绍，关于hugo的具体设置也不在本教程范围内，如果你对这些概念不熟悉，建议先自行学习。重点会放在github pages和github actions的使用上。


### 安装
```python
scoop install hugo # windows
brew install hugo # mac

hugo version # 验证是否正确安装
```
其他安装方法请参考[hugo官网](https://gohugo.io/installation/)

### 初始化&安装bear主题
在这部分中，会实现初始化hugo项目并且给博客配置一个主题
```python
hugo new site myblog # 会在本地目录创建一个名为myblog的文件夹，这个文件夹就是你的博客根目录
cd myblog
git init
git submodule add https://github.com/janraasch/hugo-bearblog.git themes/hugo-bearblog # 安装主题，这里使用submodule使博客主题作为自己项目的一个子模块方便后续维护

# 下面命令是后续同步主题修改
# git submodule update --remote 
```

### 修改主题配置
将themes\hugo-bearblog\exampleSite下的content、static、hugo.toml复制到项目根目录  
hugo.toml就是主题的配置文件，你可以根据自己的需求修改这个文件，具体可以查看[官方文档](https://github.com/janraasch/hugo-bearblog/)
```python
hugo new blog/test.md # 建立新的文章

hugo new bear.md # 建立新的页面

```

### 配置github pages + actions
#### 一些前置知识（务必看）
- 当你在github上创建了一个仓库添加一个readme.md并且命名为 **<用户名>.github.io** 时，这个仓库就是你的github pages仓库，你可以通过 **http://<用户名>.github.io** 访问到该仓库下的readme.md。同理，当我们使用hugo生成的静态网页放到这个仓库下，我们就可以通过 **http://<用户名>.github.io** 访问到我们的博客。
- 那么我们现在的工作流就是hugo new生成文章-写文章-hugo命令生成静态文件-推送到github pages仓库；如果我们也想把博客的源代码通过git的方式管理起来（就是上面生成的myblog目录），那我们就需要再建立一个新的仓库用户存储源代码，并且每次增加文章后使用git add那一套推送。
- github actions的作用是在我们推送代码到github仓库后，自动执行一些脚本，比如我们可以在推送代码后自动执行hugo命令生成静态文件并推送到github pages仓库，这样我们就不用手动执行hugo命令了。

#### 配置步骤
##### 创建key（注意这里的步骤可能随着github网站的更新有略微不同）
- github-settings-Developer Settings-Personal access tokens-Tokens(classic)-generate new token
- 日期我一般选择不过期，Select scopes中选择repo全部、workflow、admin:repo_hook
- 填写任意名称，最好全部大写且有意义，复制，下面有用
##### 建立<用户名>.github.io仓库
- 仓库名必须是<用户名>.github.io，建立好后这个仓库就是github pages
- 自定义域名：在该仓库的settings-pages-custom domain填入你的域名
- 还需要去你的域名服务商做域名解析，具体步骤可以自行搜索，这里不再阐述
##### 建立博客源代码仓库
- 新建一个仓库，然后根据github的提示关联上面的myblog目录
- 在这个仓库中的settings-secrets and variables-actions-secrets-new repository secret-输入上面第一步创建key的名字和key
- 在myblog根目录建立.github/workflows/hugo.yaml，内容如下(注意下面的配置内容可能随着时间的改变而无效，如果无效就自行去搜索一个最新的配置文件)
- 下面hugo-version最好要填写和你本地hugo版本一样的版本号；external_repository和cname按照自己的填写即可，如果没有自定义域名省略cname即可
```yaml
name: GitHub Pages

on:
  push:
    branches:
      - main # Set a branch to deploy

jobs:
  deploy:
    runs-on: ubuntu-20.04
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0 # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: "0.126.3"
          # 是否启用 hugo extend
          extended: false

      - name: Build
        run: hugo --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          # github_token: ${{ secrets.GITHUB_TOKEN }} # 该项适用于发布到源码相同repo的情况，不能用于发布到其他repo
          personal_token: ${{ secrets.ACTION_ACCESS_TOKEN }}
          external_repository: <用户名>/<用户名>.github.io # 指定目标仓库
          publish_dir: ./public
          publish_branch: main # 指定目标分支
          cname: xxx.com # 如果你有自定义域名

```

### 测试
- 下面内容已经假设相关git和github的配置已经完成
- 运行下面命令后，如果没有什么意外，就是通过http://<用户名>.github.io或者你的自定义域名访问到你的博客了
```python
cd myblog
hugo new blog/test.md # 建立新的文章
git add .
git commit -m "新增一篇文章"
git push
```