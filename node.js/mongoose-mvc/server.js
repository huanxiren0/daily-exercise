const http = require('http');
const path = require('path');
const fs = require('fs');
const mime = require('./mime.json');
const url = require('url');
const querystring = require('querystring');
const swig = require('swig');


const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/wish',{ useNewUrlParser: true });

const db = mongoose.connection;
  db.on('error',(err)=>{
  throw err;
});

  db.on('open',()=>{
  	console.log('do connect ok');
  });


const server = http.createServer((req,res)=>{
	
	console.log("req.url:::",req.url);
	
	let pathname = url.parse(req.url,true).pathname;

	if(pathname.startsWith('/static/')){//处理静态资源

		let filePath = path.normalize(__dirname + pathname);
		let fileExtName = path.extname(filePath);

		fs.readFile(filePath,(err,data)=>{
			if(!err){
				let mimeType = mime[fileExtName] || 'text/plain';
				res.setHeader('Content-Type', mimeType+';charset=UTF-8');
				res.end(data);
			}else{
				res.setHeader('Content-Type', 'text/html;charset=UTF-8');
				res.statusCode = 404;
				res.end('<h1>页面走丢了。。。。</h1>');
			}
		});
	}else{//处理动态路由
		let paths = pathname.split('/');
		let controller = paths[1] || 'Wish';
		let action = paths[2] || 'index';
		let args = paths.slice(3);
		let model;
		try{
			model = require('./Controller/'+controller);
		}catch(err){
			console.log(err);
			res.setHeader('Content-Type', 'text/html;charset=UTF-8');
			res.statusCode = 404;
			res.end('<h1>页面走丢了。。。。</h1>');	
			return;		
		}
		
		if(model[action]){
			model[action].apply(null,[req,res].concat(args));
		}

	}
});

server.listen(3000,'127.0.0.1',()=>{
	console.log('server is running on 127.0.0.1:3000');
});