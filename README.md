# TTui  田田UI魔兽世界单体插件更新脚本

### 简介：
  基于curse插件库的魔兽世界单体插件更新脚本，使用nodejs编写。
### 适用人群：
  之前使用curse管理插件，升级成twitch后被墙，且依然不愿意使用大*/E**等聚合插件的各位高逼格老铁。

### 声明：
  本脚本是本人快速不负责任地编写而成，使用者需要一定的阅读理解能力和动手能力，只要你耐心的看完会发现其实很简单！

### 使用说明：
1.安装NODEJS，http://nodejs.cn/download/   windows用户请选择.msi安装包。  
2.下载本项目 点击下载 https://github.com/oyishi/TTui/archive/master.zip ，并修改项目中的“请配置这里.txt”文件。  
3.下面对“请配置这里.txt”进行详细的说明，下面是默认的“请配置这里.txt”内容

    G:/World of Warcraft
    https://wow.curseforge.com/projects/o-item-level
    https://wow.curseforge.com/projects/details
    https://wow.curseforge.com/projects/tellmewhen
    https://wow.curseforge.com/projects/deadly-boss-mods
    https://wow.curseforge.com/projects/dbm-voicepack-yike


- 其中第一行是魔兽世界的安装路径，尽量使用英文。  
- 从第二行开是单体插件在curseforge上的网址，你可以通过 https://wow.curseforge.com/addons 来查询自己想要的插件。  
- 你需要多少插件，就加多少行插件的网址在这个txt文件里，不需要的插件删掉该行即可。


    
4.双击start.bat开始运行脚本。  
5.等待脚本下载并安装插件。  
6.日后可以随时双击start.bat，脚本会自动更新有必要更新的插件。  
7.如果运行脚本的过程中发生网络报错，99.999%是因为curseforge网站本身网络不稳定导致，请耐心重试。
8.如果想强制下载全部插件，可以手动清空savedInfo.js来达到目的。
