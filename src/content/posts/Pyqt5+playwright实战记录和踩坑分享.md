---
title: Pyqt5+playwright实战记录和踩坑分享
pubDate: 2023-02-16
categories: ['Python', 'Playwright', 'Pyqt5', '爬虫']
description: '几年前一朋友对我说他工作中有时候需要把工作网站上的很多新闻内容转换为pdf，他的方法就是打开每一篇新闻---ctrl+p---另存为PDF。如果要转换的数量少还说，如果要转换的数量多，那就是一件很痛苦的事情了。于是他希望我能帮他写一个小工具解决这个痛点。 '
---

### 前情提要
几年前一朋友对我说他工作中有时候需要把工作网站上的很多新闻内容转换为pdf，他的方法就是打开每一篇新闻---ctrl+p---另存为PDF。如果要转换的数量少还说，如果要转换的数量多，那就是一件很痛苦的事情了。于是他希望我能帮他写一个小工具解决这个痛点。  

当时的工作网站并没有使用前后端分离，所有网页都是直接渲染，我爬取了所有网页后直接用pdfkit就很方便的转换成了pdf，就写了一个shell工具，然后给他用了。前段时间他又找到了我，说不知道什么原因，那个工具不好使了。我打开了网站，发现网站已经使用了前后端分离，所有的网页都是通过ajax请求获取数据，然后渲染的。这就尴尬了，我之前的爬虫工具就不能用了。  

新的网站本身并没有做什么反爬，只需要构造正常的请求就可以拿到数据，但是朋友的需求是要把所有内容外加网站的样式一起转换成pdf。这个时候pdfkit就不能满足需求了。  

再查了资料后发现无头浏览器可以满足这个需求，于是用playwright试了下，完全可以满足需求。为了让朋友更方便的使用，我就用pyqt5写了个小工具，当然第一次接触playwright和pyqt5，踩了不少坑，特此记录方便他人参考。  

### 特别说明
因为是对特定网站的爬取，所以代码不方便开源，还请谅解

### 正式开始
#### playwright基础使用
##### 安装&初始化
```bash
pip install playwright
playwright install # 务必记得初始化
```
##### 最简demo
- 关于context：可以理解为浏览器的一个实例，可以在context中打开多个页面，context之间是相互隔离的，不会相互影响。
```python
# 不使用context
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
	browser = p.chromium.launch(headless=False)
	page = browser.new_page()
	page.goto("https://www.baidu.com")
	page.wait_for_timeout(3000)
	browser.close()

# 使用context
from playwright.sync_api import sync_playwright

def test(playwright):
	browser = playwright.chromium.launch(headless=False)
	context = browser.new_context()
	
	page = context.new_page()
	page.goto("https://www.baidu.com")
	page.wait_for_timeout(3000)
	page.close()
	browser.close()

with sync_playwright as playwright:
	test(playwright)

# 异步
import asyncio
from playwright.async_api import async_playwright

async def run() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://www.baidu.com")
        await page.screenshot(path="example.png")
        await page.wait_for_timeout(3000)
        await browser.close()

asyncio.run(run())
```
### 技巧
##### 录屏
- 这是playwright最吸引我的一个功能，当你输入下面的命令后，然后再弹出的浏览器中进行一系列动作，playwright可以自动帮你生成刚刚所有动作的代码，这对新手小白来说简直太棒了。
- 会在你当前目录下生成一个test.py文件，可以直接拿来用。
```bash
playwright codegen -o test.py -b chromium
```
##### 反爬
- 现在很多网站对无头浏览器也做出相应的反爬措施，当然解决办法也有很多，这里我是使用别人写好的一个JS脚本stealth.min.js，加载到自己的playwright中即可
- [stealth.min.js下载地址](https://gitcode.net/mirrors/requireCool/stealth.min.js?utm_source=csdn_github_accelerator)
```python
page = context.new_page()
page.add_init_script(path="stealth.min.js")
```
##### 打包
```bash
# 下面两行必须有，把playwright相关环境打包
set PLAYWRIGHT_BROWSERS_PATH=0
playwright install chromium
# 使用pyinstaller打包
pyinstaller -F  xxxyyy.py
```
#### 坑
##### 最后生成的PDF文字内容不全（文字已经加载完毕）
- 原因：网页大小、浏览器大小以及生成的pdf大小不一致
- 解决：上面几个参数都使用一致的宽和高即可
```python
width, height = 1366, 768

browser = await p.chromium.launch(args=[
           f"--window-size={width},{height}",
        ],
            headless=False
        )

await page.set_viewport_size({"width": width, "height": height})

await page.pdf(path="playwright123.pdf", width="1366", height="768")
```

##### 最后生成的PDF图片不全
- 原因：考虑到使用者电脑性能不同，我用了同步和异步两种模式去爬取转换PDF，可供选择。这种情况多发生在异步的时候，因为网速、电脑等原因，导致图片没有加载完毕就开始转换PDF了。
- 解决：首先经过测试wait_for_load_state("networkidle")这种方法不是很好用，目前最佳的解决方法还是wait_for_time这种固定时间的方法。可以设定几个值让使用者自己选择（我就是这么做的，默认每次保存前等待3S）  

##### Timeout 30000.0ms exceeded while waiting for event "popup” & waiting for event popup
- 原因：popup是弹出窗口，如果使用了with page.expect_popup() as popup_info，请注意逻辑代码中是否出现了弹出窗口  

#### Pyqt5基础
##### 安装
- 同时安装了designer方便快速做出界面，相关教程请自行查阅
```bash
pip install PyQt5 -i https://pypi.tuna.tsinghua.edu.cn/simple
pip install pyqt5-tools -i https://pypi.tuna.tsinghua.edu.cn/simple

# 实测安装下面这个才可以调用designer
pip install pyqt5designer -i https://pypi.tuna.tsinghua.edu.cn/simple
```

##### 配置
- 在pycharm中可以配置Qt Designer，具体教程网上很多，这里不再赘述

#### 技巧
##### 高分辨率下解决界面错乱
- 我的情况是在4k屏幕下，界面会错乱，解决办法是在程序开始前加上下面的代码
```python
from PyQt5 import QtCore

QtCore.QCoreApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)
```

#### 坑
##### 使用了子线程后程序在debug模式下正常，但是运行会闪退
- 原因：pyqt5的对象如果没有绑定到self上，会被垃圾回收
- 解决：把子线程中的对象绑定到self上即可
- 下面给出一段示例代码，仅供参考
```python
# 部分代码
class Ui_MainWindow(object):
    def __init__(self):
        super().__init__()
        # 加不加不影响最终结果
        # self.thread = None 
        
		def test_thread(self, login_user):
			from child_thread_functions.sync_task_to_pdf import ThreadTask
			print("test_thread")
			thread = ThreadTask()
			thread.success.connect(self.test)
			thread.start()

        # 正确答案
        # self.thread = ThreadTask()
        # self.thread.success.connect(self.test)
        # self.thread.start()
		
		def test(self):
		  print("test")

		def connect(self):
			self.button.clicked.connect(self.test_thread)

class ThreadTask(QThread):
    success = pyqtSignal(int)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def run(self):
        print("进入子线程run")
        # self.with_cookie_sync_task()
        self.success.emit(1)
```