const https = require('https');
const httpsr = require('follow-redirects').https;
const fs = require('fs');
const cheerio = require('cheerio')
const request = require('request');
const ProgressBar = require('progress');
const path = require('path');
const unzip = new require('unzip2');

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
	      	// json = JSON.parse(test);
	      	// console.log(test);
	      	var json = test.split("\n");

	      	
		    // console.log(json);
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
		    // console.log(page_arr);
	        // wow_path =  json.wow_path;
	        // for(i = 0 ; i < json.ui_urls.length; i++){
	        // 		page_arr.push({url:json.ui_urls[i]});
	        // }
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
	        	saved_info = [];
	        }else{
	        	json = JSON.parse(test);
		        // console.log(json);
		        saved_info = json;
	        }
	       
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
	// const url = "https://wow.curseforge.com/projects/hekili?gameCategorySlug=addons&projectID=69254" 
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
			var version = "";
			var id = "";
			var name = "";
			if(full_url.indexOf("curseforge") >= 0)	//curseforge
			{
				ex_url = "https://www.curseforge.com";
				originurl = $('.button.button--icon-only.button--sidebar').attr('href');
				url = ex_url + originurl + "/file";	
				version = originurl.substring(originurl.lastIndexOf("/") + 1); //use real version
				id = $('.overflow-tip.truncate').attr('data-id');
				name = $(".font-bold.text-lg.break-all").eq(0).html();
			}
			else //wowace
			{
				ex_url = "https://www.wowace.com";
				originurl = $('.button.alt.fa-icon-download').attr('href');
				url = ex_url + originurl;
				var tempurl = $('.button.tip.fa-icon-download.icon-only').eq(0).attr('href');
				var temparray = tempurl.split("/");
				version = temparray[temparray.length-2]; //use real version
				id = $('.cf-details.project-details').children('li').eq(0).children('div').eq(1).text().trim();
				name = $('.overflow-tip').eq(0).text().trim();
			}
			
			/* 20190701 old rule
	    	if(full_url.indexOf("wowace") >= 0){
	    		ex_url = "https://www.wowace.com";
	    	}
	    	var url = ex_url + $('.fa-icon-download').attr('href');
	        // console.log(url);
	        var version = $('.tip.standard-date.standard-datetime').eq(1).attr('data-epoch');
	        // console.log(version);
	        var id = $('.info-data').eq(0).html();
	        // console.log(id);
	        var name = $(".overflow-tip").eq(0).html();
	        // console.log(name);
			*/
			
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
	for (var i = 0 ; i < saved_info.length;i++) {
		if(saved_info[i].id == name){
			the_ui = saved_info[i];
		}
	}
	return the_ui;
}

function checkNeedUpdate(json){
	var the_ui = findOneUIbyName(json.id);
	var need_update = 0;
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
	var upateOneUi;
	var loopUpdate;

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
			console.log("本地版本确认完毕，开始更新");
			// console.log(temp_saved_info);
			loopUpdate();
		}
	}
	
	//update savedinfo.js, keep old saved version
	updateSavedinfo = function(json,cb){
		for(var i = 0; i < saved_info.length;i++){
            if(json.id == saved_info[i].id){
				saved_info.splice(i,1);//delete
            }
        }
		var savejson = {
	        	id : json.id,
	        	name : json.name,
	        	version : json.version
				};
		saved_info.push(savejson);//add
		
		if(cb){
				cb();
		}
	}

	upateOneUi =function(json,cb){
		download(json.id,json.name,json.url,function(){
			unzipFile( json.name,"temp_download/" + json.id + ".zip",function(){
				//json.need_update = 0;
				updateSavedinfo(json); //update savedinfo, not temp_saved_info
				fs.writeFile('savedInfo.js',JSON.stringify(saved_info), function(err){
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

main();
console.log("欢迎使用TTui");
