const https = require('https');
const httpsr = require('follow-redirects').https;
const fs = require('fs');
const cheerio = require('cheerio')
const request = require('request');
const ProgressBar = require('progress');
const path = require('path');
const unzip = new require('unzip2');
const readline = require('readline');

var wow_path = "";
var page_arr = [];
//var saved_info = [];
var wow_version = "1";
var wow_saved_info = {"version":"", "data":[]};


function loadConfig(cb){
	var fileurl = "";
	if(wow_version == "new"){fileurl = "最新版请配置这里.txt";}
	else{fileurl = "经典版请配置这里.txt"}
	
	fs.readFile(fileurl,{encoding: 'utf8'}, function(err, data){
    if(err) console.log('文件读取发生错误：'+ fileurl);
	    else {;
	       	var test = data.toString();
	      	var json = test.split("\n");

		    for (i = 0 ; i < json.length ;i++) {
		    	json[i] = json[i].replace(/\r/g,'');
		      	if(i == 0){
		      		wow_path =  json[0];
		      	}else{
		      		if(json[i].indexOf("https")>=0){
		      			page_arr.push({url:json[i]});
		      		}
		      	}
		    }
			
	        if(cb){
	       		cb();
	        }
	      
	    }
	});
}

function loadSavedInfo(cb){
	fs.readFile('savedInfo.js',{encoding: 'utf8'}, function(err, data){
    if(err) console.log('文件读取发生错误');
	    else {;
	        var test = data.toString();
	        if(test == ""){
	        	wow_saved_info = [{"version":"new", "data":[]},{"version":"classic", "data":[]}];
	        }else{
	        	wow_saved_info = JSON.parse(test);
	        }			
	        //console.log(wow_saved_info);
			
	        if(cb){
	       		cb();
	        }
	      
	    }
	});
}



function unzipFile(name,file_path,cb){
	fs.createReadStream(file_path).pipe(unzip.Extract({ path: wow_path + '/Interface/addons' })).on("close",function(){
		console.log(name + " 解压完毕");
		if(cb){
			cb();
		}
	});
}

// unzipFile("G:/ttui/temp_download/86005.zip");

function download(id,title,url,cb){

	var file = fs.createWriteStream("temp_download/" + id + ".zip");
	// const url = "https://wow.curseforge.com/projects/hekili/files/latest" 
	httpsr.get(url,(res)=>{

		var len = parseInt(res.headers['content-length'], 10);  
        var cur = 0;
        var total = len;
	    var html = "";
	    var bar = new ProgressBar(title + '下载中 [:bar] :percent', {
		    complete: '=',
		    incomplete: ' ',
		    width: 20,
		    total: len
		});


	    res.on("data",(data)=>{
	        html+=data;
	       	cur += data.length;
	      	bar.tick(data.length);
	    })
	    res.pipe(file);
	    res.on("end",()=>{
	    	// console.log("下载完毕");
	    	if(cb){
	    		cb();
	    	}
	    })
	}).on("error",(e)=>{
	    console.log(`下载插件包失败: ${e.message}`)
	})

}

// download("ceshi","https://wow.curseforge.com/projects/hekili/files/latest");

//20190701 test downloadurl
//download("curse","project from curse", "https://www.curseforge.com/wow/addons/parrot2/download/2731044/file")
//download("wowace","project from wowace", "https://www.wowace.com/projects/skada/files/latest")

function getPage(url,cb){
	var full_url = url;
	https.get(url,(res)=>{
	    var html = ""
	    res.on("data",(data)=>{
	        html+=data
	    })

	    res.on("end",()=>{

	    	$ = cheerio.load(html);
			/*
			20190701 curse use new rule, wowace use old rule(modify)
			curse url:https://www.curseforge.com/wow/addons/parrot2/download/2731044/file
			wowace url:https://www.wowace.com/projects/skada/files/latest
			*/
			var ex_url = "";
			var originurl = "";
			var url = "";
			var version = "0";
			var id = "";
			var name = "";
			if(full_url.indexOf("curseforge") >= 0)	//curseforge
			{
				ex_url = "https://www.curseforge.com";
				name = $(".font-bold.text-lg.break-all").text().trim();
				id = $('.overflow-tip.truncate').eq(0).attr('data-id');
				
				if(wow_version == "new"){
					originurl = $('.button.button--icon-only.button--sidebar').attr('href');
				}
				else{
					wowversioncount = $('.e-sidebar-subheader.overflow-tip.mb-1').length //<h4 class="e-sidebar-subheader overflow-tip mb-1">
					if(wowversioncount==2)//include classic
					{
						originurl = $('.button.button--icon-only.button--sidebar').eq(1).attr('href');
					}
					else if(wowversioncount==1) //only classic
					{
						wowversionstring = $('.e-sidebar-subheader.overflow-tip.mb-1').children('a').eq(0).text().trim();
						if (wowversionstring == "WoW Classic")
						{
							originurl = $('.button.button--icon-only.button--sidebar').eq(0).attr('href');
						}
					}
				}
				
				version = originurl.substring(originurl.lastIndexOf("/") + 1); //use real version
				url = ex_url + originurl + "/file";	
			}
			else //wowace
			{
				if(wow_version == "new"){
					ex_url = "https://www.wowace.com";
					originurl = $('.button.alt.fa-icon-download').attr('href');
					url = ex_url + originurl;
					var tempurl = $('.button.tip.fa-icon-download.icon-only').eq(0).attr('href');
					var temparray = tempurl.split("/");
					version = temparray[temparray.length-2]; //use real version
					id = $('.cf-details.project-details').children('li').eq(0).children('div').eq(1).text().trim();
					name = $('.overflow-tip').eq(0).text().trim();
				}
				else{
				}
			}
			
	        var json = {
	        	id : id,
	        	name : name,
	        	url : url,
	        	version :version
	        };
			
			//console.log(json);
			
	        if(cb){
	        	cb(json);
	        }

	    })
	}).on("error",(e)=>{
	    console.log(`获取插件信息失败: ${e.message}`)
	})


}


function findOneUIbyName(name){
	var the_ui = null;
	for (var i = 0 ; i < wow_saved_info.length;i++) {
		if(wow_saved_info[i].version == wow_version){
			for (var j = 0 ; j < wow_saved_info[i].data.length;j++) {
				if(wow_saved_info[i].data[j].id == name){
					the_ui = wow_saved_info[i].data[j];
				}
			}
		}
	}
	return the_ui;
}

function checkNeedUpdate(json){
	var need_update = 0;
	if(json.version == "0" || json.version == "")
	{
		console.log(json.name + ": 没有有效的版本");
	}
	else
	{
		var the_ui = findOneUIbyName(json.id);
		if(the_ui){
			if(json.version > the_ui.version){
				need_update = 1;
			}
		}else{
			need_update = 1;
		}
		if(the_ui){
			if(the_ui.need_update == 1){
			need_update = 1;
			}
		}
		console.log(json.name + ":" + (need_update == 1 ? " 需要更新" :" 已是最新" ));
	}

	return need_update;
}



var temp_saved_info = [];
var page_arr_index = 0;
var temp_saved_info_index = 0;
var temp_saved_info_index_for_unzip = 0;

function main(){
	var loop;
	var saveInfo;
	var upateOneUi;
	var loopUpdate;

	loop = function(){
		if(page_arr_index <  page_arr.length){
			getPage(page_arr[page_arr_index].url, function(json){
				//console.log(json);
				json.need_update = checkNeedUpdate(json);
				temp_saved_info.push(json);
				page_arr_index++;	
				loop();
			})
		}else{
			console.log("本地版本确认完毕，开始更新");
			// console.log(temp_saved_info);
			loopUpdate();
		}
	}
	
	//update savedinfo.js, keep old saved version
	updateSavedinfo = function(json,cb){
		for(var i = 0; i < wow_saved_info.length;i++){
            if(wow_saved_info[i].version == wow_version){
				for(var j = 0; j < wow_saved_info[i].data.length;j++){
					if(json.id == wow_saved_info[i].data[j].id){
						wow_saved_info[i].data.splice(j,1);//delete
					}
				}
				var savejson = {
						id : json.id,
						name : json.name,
						version : json.version
						};
				wow_saved_info[i].data.push(savejson);//add
				
				if(cb){
					cb();
				}
            }
        }
		
		
	}

	upateOneUi =function(json,cb){
		download(json.id,json.name,json.url,function(){
			unzipFile( json.name,"temp_download/" + json.id + ".zip",function(){
				//json.need_update = 0;
				updateSavedinfo(json); //update savedinfo, not temp_saved_info
				fs.writeFile('savedInfo.js',JSON.stringify(wow_saved_info), function(err){
			       	if(err){console.log(err)}
			       	else {console.log(json.name + ' 更新成功！');}
			   		if(cb){
			   			cb();
			   		}
			   	})
			});
		});
	}

	loopUpdate = function(){
		if(temp_saved_info_index < temp_saved_info.length){
			if(temp_saved_info[temp_saved_info_index].need_update == 1){
				upateOneUi(temp_saved_info[temp_saved_info_index],function(){
					temp_saved_info_index++;
					loopUpdate();
				});
			}else{
				temp_saved_info_index++;
				loopUpdate();
			}
		}else{
			console.log("全部插件更新完毕，老铁下次见！");
		}
	}
	
	loadConfig(function(){
		loadSavedInfo(function(){
			loop();
		});
	})
}


console.log("欢迎使用TTui V1.0.1");

var rl = readline.createInterface({input:process.stdin,output:process.stdout});
question = function(){
	rl.question("请选择魔兽世界版本：\n[1] 最新版\n[2] 经典版\n[3] 退出\n", (answer) => {
		if(answer == "1"){
			rl.close();  
			wow_version = "new";
			main();
		}
		else if(answer == "2"){
			rl.close();  
			wow_version = "classic";
			main();
		}
		else if(answer == "3"){
			rl.close();
		}
		else{question();}	
	});
}

question();

