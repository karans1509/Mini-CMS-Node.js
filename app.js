const http = require('http')
const port = 8007
const fs   = require('fs')
const path = require('path')
const url = require('url')
const formidable = require('formidable')
const util = require('util')
let   dir  = './posts'
let header = ''
let footer = ''
let post_h = ''
let post_f = ''

fs.readFile('./templates/index_h.html', (err, data) => {
	header = data;
})

fs.readFile('./templates/index_f.html', (err, data) => {
	footer = data;
})

fs.readFile('./templates/post_h.html', (err, data) => {
    post_h = data
})

fs.readFile('./templates/post_f.html', (err, data) => {
    post_f = data
})

http.createServer((req, res)=>{

if(req.method.toLowerCase() == 'get') {
    if(req.url === '/') {
    res.writeHead(200 , {'Content-type':'text/html'})
    res.write(header);
    fs.readdir(dir, (err,files)=>{
        let post_html =''
        if(err) console.log(err)
        files.forEach((file)=>{
            let baseName = path.basename(file, '.txt')
            res.write(`<li><a href="./build/${baseName}.html">${baseName}</a></li>`)
            
            fs.readFile(dir+'/'+file, (err, data) => {
                post_html = post_h + '<p>'+data+'</p>' + post_f
                let finalPath = './build/' + baseName + '.html'
                fs.writeFile(finalPath, post_html, 'UTF-8', (err) => {
                    if(err) {
                        console.log(err)
                    }
                })
            })
        })

    res.end(footer);
    })
 }
 else if(req.url.match(/.html$/)) {
   let requestUrl = url.parse(req.url)    
   res.writeHead(200, {'Content-type':'text/html'})
   fs.createReadStream(__dirname + requestUrl.pathname).pipe(res)
    
 }
 else if(req.url.match(/.css$/)) {
    let cssPath = path.join(__dirname, req.url)
    let fileStream = fs.createReadStream(cssPath, "UTF-8")
    res.writeHead(200, {'Content-type':'text/css'})
    fileStream.pipe(res);
 }
 else if(req.url.match(/.js$/)) {
    let jsPath = path.join(__dirname, req.url)
    let fileStream = fs.createReadStream(jsPath, "UTF-8")
    res.writeHead(200, {'Content-type':'application/javascript'})
    fileStream.pipe(res);
 }

}
 
 else if(req.method.toLowerCase() == 'post') {
    let form = new formidable.IncomingForm()

    form.parse(req, function(err, fields, files){
        let file = fields.filename.toString().replace(" ", "-")
        fs.writeFile('./posts/'+file+'.txt', fields.Post, 'utf8', (err)=>{
            if(err)
                console.log(err)
        })
        fields.filename = "";
        fields.Post = ""

        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('Post has been created!:\nYou can go back now!\n');
        res.end();
    })
 }
 else {
 	res.writeHead(404);
 	res.end("Error 404");
 }
}).listen(port);

console.log("Server listening at port "+port);

