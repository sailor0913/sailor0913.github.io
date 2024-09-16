---
title: 从0到1系列---Vite+Vue3+TS+Electron+Prettier+Eslint基本环境配置
pubDate: 2022-10-23
categories: ['编程', 'JavaScript','Vue', 'Electron']
description: '近日使用Vite+Vue3+TS+Electron写一个小项目，遇到了一些问题，尤其是使用vscode配置eslint和prettier的时候。所以特地记录了下搭建流程，形成了自己的工作流，希望能帮助到大家'
---

### 前言
- 本系列教程力求简洁明了，务必保证你的环境以及所有依赖的版本跟教程保持一致。
- 近日使用Vite+Vue3+TS+Electron写一个小项目，遇到了一些问题，尤其是使用vscode配置eslint和prettier的时候。所以特地记录了下搭建流程，形成了自己的**工作流**，希望能帮助到大家

### 说明
- 所谓**工作流**,是指如果再次使用相同的技术栈开发时候，仅需按照记录的流程，不用思考即可搭建出完整的开发环境
- 所以下面的文章，不是教程，仅供对前端开发有一定经验的同学参考使用，如果你是新手，建议先学习一下相关基础知识，再来看这篇文章
- 环境配置主要难点在于**eslint**和**prettier**的配置，所以此文也适用于Vue3项目

### 目标
- 使用Vite+Vue3+TS+Electron搭建一个基本的桌面应用。其中用到了Prettier和Eslint来规范代码风格

### 仅有的一点废话
- Vite：Vue官方出的前端脚手架工具，替代了Vue-cli，速度更快，更轻量
- Vue3：Vue3.0版本，新特性很多，比如Composition API、Teleport、Suspense等等
- TS：TypeScript，一种强类型的JavaScript语言。
- Electron：一款开源的跨平台桌面应用开发工具，可以使用HTML、CSS和JavaScript来构建跨平台的桌面应用。
- Prettier：一款代码格式化工具，主要可以自动格式化代码，比如将双引号自动转换为单引号等。
- Eslint：一款代码检查工具，可以检查代码是否符合规范，比如代码中如果存在一个未使用的变量，就会报错等。特别注意的是Eslint本身也有一定的代码格式化功能，这就造成了可能会和Prettier冲突，所以额外配置（下面会讲到）

### 正式开始
#### vscode安装插件
- vscode安装插件：Volar、ESLint、Prettier
#### Vite创建项目&安装所有依赖
```javascript
// 建立项目，依次输入项目名称、选择Vue和TypeScript
npm create vite@latest

// 非常重要：安装下面所有依赖，我把项目中用到的都列出来了，如果你不需要某个依赖，可以自行删除
cnpm i -D electron prettier nodemon eslint vite-plugin-eslint @babel/core @babel/eslint-parser @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-prettier eslint-config-prettier eslint-plugin-vue  
```

#### 配置Prettier
- 根目录新建.prettierrc和.prettierignore两个文件，复制下面代码到对应文件中(两个文件前面有一个"."，不要漏掉)
- 关于prettier的具体配置，可以去[官方playground](https://prettier.io/playground)自行配置，下面给出的是我自己的配置，可以参考使用
- 这个部分完成后，代码应该可以自动格式化了，调乱代码格式，保存后，代码会自动格式化
```javascript
// .prettierignore
node_modules
.vscode
.idea
dist
/public
.eslintrc.js

// .prettierrc
{
    "arrowParens": "always",
    "bracketSameLine": false,
    "bracketSpacing": false,
    "embeddedLanguageFormatting": "auto",
    "htmlWhitespaceSensitivity": "css",
    "insertPragma": false,
    "jsxSingleQuote": false,
    "printWidth": 80,
    "proseWrap": "preserve",
    "quoteProps": "as-needed",
    "requirePragma": false,
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "useTabs": false,
    "vueIndentScriptAndStyle": false
}
```
#### 修改vite.config.ts
- 修改根目录下的vite.config.ts文件，添加如下代码
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		eslintPlugin({
			include: ['src/**/*.ts', 'src/**/*.vue', 'src/*.ts', 'src/*.vue'],
		}),
	],
	resolve: {
		// 配置路径别名
		alias: {
			'@': '/src',
		},
	},
});
```

#### 配置Eslint
- 根目录建立.eslintrc.cjs和.eslintignore(两个文件前面有一个"."，不要漏掉)
- 复制下面内容到.eslintrc.cjs和.eslintignore中
- 此部分完成后，**重启vscode**，代码应该可以自动检查了，比如未使用的变量，会报错
```javascript
// .eslintignore
node_modules
.vscode
.idea
dist
/public
.eslintrc.js

// .eslintrc.cjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
		'@typescript-eslint/no-var-requires': 'off',  // 关闭ts中使用const导入模块的时候错误提示
	},
}
```
#### 配置electron
- 修改根目录下的package.json文件，添加如下代码
- nodemon是用来监听文件变化，自动重启electron的。如果不需要scripts中写成"electron ."即可
```javascript
// package.json
"main": "main.ts",
"scripts": {
    "start": "nodemon --exec electron . --watch ./ --ext .js,.ts,.vue,.html,.css,.json"
  },

```
- 根目录下新建main.ts(此为electron的入口文件)
```javascript
const { app, BrowserWindow} = require('electron');
const path = require('path')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
				webPreferences: {
						// 定义预加载的js
            preload: path.join(__dirname, './preload/index.ts')
        }
    });
    
    win.loadURL('http://localhost:5173/');
    }

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
```
#### 运行测试
```javascript
npm run dev // 启动vue.因为electron从localhost:5173读取页面，所以要先启动vue
npm start // 启动electron
```
- 如果没有意外，应该可以看到electron启动了，且页面显示了vue的内容，从0到1完成！