const https = require('https');
const httpsr = require('follow-redirects').https;
const fs = require('fs');
const cheerio = require('cheerio')
const request = require('request');
const ProgressBar = require('progress');
const path = require('path');
const unzip = new require('unzip');

var wow_path = "";
var page_arr = [];

// var wow_path = "G:/假装魔兽世界";

// var page_arr = [
// 	{url:"https://wow.curseforge.com/projects/hekili?gameCategorySlug=addons&projectID=69254"},
// 	{url:"https://wow.curseforge.com/projects/dbm-voicepack-yike?gameCategorySlug=addons&projectID=87785"},
// 	{url:"https://wow.curseforge.com/projects/o-item-level"}
// ]


var saved_info = [];


function loadConfig(cb){
	fs.readFile('请配置这里.txt',{encoding: 'utf8'}, function(err, data){
    if(err) console.log('文件读取发生错误');
	    else {;
	       var test = data.toString();
	       json = JSON.parse(test);

	       wow_path =  json.wow_path;
	       for(i = 0 ; i < json.ui_urls.length; i++){
	       		page_arr.push({url:json.ui_urls[i]});
	       }
	       // console.log(wow_path);
	       // console.log(page_arr);
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
	       json = JSON.parse(test);
	       // console.log(json);
	       saved_info = json;
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


function getPage(url,cb){
	// const url = "https://wow.curseforge.com/projects/hekili?gameCategorySlug=addons&projectID=69254" 
	https.get(url,(res)=>{
	    var html = ""
	    res.on("data",(data)=>{
	        html+=data
	    })

	    res.on("end",()=>{

	    	$ = cheerio.load(html);

	    	var url = "https://wow.curseforge.com" + $('.fa-icon-download').attr('href');
	        // console.log(url);
	        var version = $('.tip.standard-date.standard-datetime').eq(1).attr('data-epoch');
	        // console.log(version);
	        var id = $('.info-data').eq(0).html();
	        // console.log(id);
	        var name = $(".overflow-tip").eq(0).html();
	        // console.log(name);

	        var json = {
	        	url : url,
	        	version :version,
	        	id : id,
	        	name : name
	        };

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
	for (var i = 0 ; i < saved_info.length;i++) {
		if(saved_info[i].name == name){
			the_ui = saved_info[i];
		}
	}
	return the_ui;
}

function checkNeedUpdate(json){
	var the_ui = findOneUIbyName(json.name);
	var need_update = 0;
	if(the_ui){
		if(json.version > the_ui.version){
			need_update = 1;
		}
	}else{
		need_update = 1;
	}
	console.log(json.name + ":" + (need_update == 1 ? " 需要更新" :" 已是最新" ));
	return need_update;
}



var temp_saved_info = [];

var page_arr_index = 0;
var temp_saved_info_index = 0;
var temp_saved_info_index_for_unzip = 0;

function main(){



	var loop;
	var loop2;
	var loop3;
	var saveInfo;


	loop = function(){
		if(page_arr_index <  page_arr.length){
			getPage(page_arr[page_arr_index].url,function(json){
				//console.log(json);
				json.need_update = checkNeedUpdate(json);
				temp_saved_info.push(json);
				page_arr_index++;
				loop();
			})
		}else{
			// console.log("本地版本确认完毕，开始更新");
			// console.log(temp_saved_info);
			loop2();
		}
	}


	loop2 = function(){
		if(temp_saved_info_index < temp_saved_info.length){
			if(temp_saved_info[temp_saved_info_index].need_update == 1){
				download(temp_saved_info[temp_saved_info_index].id,temp_saved_info[temp_saved_info_index].name,temp_saved_info[temp_saved_info_index].url,function(){
					temp_saved_info_index++;
					loop2();
				});
			}else{
				temp_saved_info_index++;
				loop2();
			}
		}else{
			console.log("插件下载完毕，开始解压。");
			loop3();
		}
	}

	loop3 = function(){
		if(temp_saved_info_index_for_unzip < temp_saved_info.length){
			if(temp_saved_info[temp_saved_info_index_for_unzip].need_update == 1){
				unzipFile( temp_saved_info[temp_saved_info_index_for_unzip].name,"temp_download/" + temp_saved_info[temp_saved_info_index_for_unzip].id + ".zip",function(){
					temp_saved_info_index_for_unzip++;
					loop3();
				});
			}else{
				temp_saved_info_index_for_unzip++;
				loop3();
			}
		}else{
			// console.log("插件解压完毕");
			saveInfo();
		}
	}

	saveInfo = function(){
		fs.writeFile('savedInfo.js',JSON.stringify(temp_saved_info), function(err){
	       if(err){console.log(err)}
	       else {console.log('插件更新成功！');}
	   })
	}

	loadConfig(function(){
		loadSavedInfo(function(){
			loop();
		});
	})
}

main();
console.log("欢迎使用ttui");