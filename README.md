# TTui  田田UI魔兽世界单体插件更新脚本

### 简介：
  基于curse插件库的魔兽世界单体插件更新脚本，使用nodejs编写。
### 适用人群：
  之前使用curse管理插件，升级成twitch后被墙，且依然不愿意使用大*/E**等聚合插件的各位高逼格老铁。

### 声明：
  本脚本是本人快速不负责任地编写而成，使用者需要一定的阅读理解能力和动手能力，只要你耐心的看完会发现其实很简单！

### 使用说明：
1.安装NODEJS，http://nodejs.cn/download/ Windows用户请选择.msi安装包。  
2.下载本项目，点击下载 "Clone or download"->"Download Zip" ，经典怀旧版修改项目中的“经典版请配置这里.txt”文件，正常版修改项目中的“最新版请配置这里.txt”文件，
3.下面对“最新版请配置这里.txt”进行详细的说明，下面是默认的“最新版请配置这里.txt”内容

    G:\World of Warcraft\_retail_
    https://www.curseforge.com/wow/addons/o-item-level
    https://www.curseforge.com/wow/addons/details
    https://www.curseforge.com/wow/addons/tellmewhen
    https://www.curseforge.com/wow/addons/deadly-boss-mods
    https://www.curseforge.com/wow/addons/dbm-voicepack-yike
    https://www.wowace.com/projects/skada


- 其中第一行是魔兽世界的安装路径，尽量使用英文。正常版本一般是"_retail_"，经典怀旧版本一般是"_classic_"
- 从第二行开是单体插件在curseforge上的网址，你可以通过 https://www.curseforge.com/wow/addons 或 https://www.wowace.com/addons 来查询自己想要的插件。 
- 目前配置文件只能识别 https://www.curseforge.com/wow/addons/xxxxxx 和 https://www.wowace.com/projects/xxxxxx 这种格式的网址。通过 https://www.curseforge.com/wow/addons 或 https://www.wowace.com/addons 搜索到的插件地址都满足这个要求。
- 你需要多少插件，就加多少行插件的网址在这个txt文件里，不需要的插件删掉该行即可。
    
4.双击start.bat开始运行脚本。  
5.等待脚本下载并安装插件。  
6.日后可以随时双击start.bat，脚本会自动更新有必要更新的插件。  
7.如果运行脚本的过程中发生网络报错，99.999%是因为curseforge网站本身网络不稳定导致，脚本支持断点续传，重新运行脚本继续下载即可。  
8.强制下载/更新全部插件：清空savedInfo.js文件，再运行脚本。  
9.下载的插件zip包放在了 temp_download 文件夹内。


### MAC用户使用说明：
1.由于MAC系统权限的问题，没办法给出windows用户那种start.bat一键运行的入口。所以MAC用户需要会使用“终端”。  
2.安装NODEJS，http://nodejs.cn/download/ 选择 Mac 系统 (.pkg)，并安装。
3.下载本项目 点击下载 "Clone or download"->"Download Zip" ，并修改项目中的“请配置这里.txt”文件。 
4.具体配置同上。  
5.打开“终端”，进入到TTui所在目录，输入 "node index.js"，即可开始执行下载更新。 如果一直下载失败，可以尝试输入"sudo node index.js"来解决。 

