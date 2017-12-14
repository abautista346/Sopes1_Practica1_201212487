//importacion de librerias o módulos
//var dt = require('./myfirstmodule'); 
var http = require('http');
var url = require('url');
var sql = require("mssql");
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');
var ejs = require('ejs');
var proc = require('node-proc');
var child_process = require('child_process');
var ps = require('ps-node');
var os = require('os-utils');

var app = express();

//configuracion para sql

var config = {
        user: "aln",
        password: "e$0lutions",
        server: "localhost\\SQLEXPRESS", 
        database: "COMPI2" ,
		port: 1433
		
};

var UsrActual;

app.use('/css', express.static('css')); //acceder al css
app.use('/js', express.static('js')); //acceder a los js
app.use(bodyParser.urlencoded({ extended: true })); //obtener los datos del html

//para renderizar y pasar datos hacia la vista
app.set('views', __dirname + '/');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// metodo para inicia el servidor
var server = app.listen(1346, function () {
    console.log('Servidor ON carnal!');
});

//--------------------------------------------------------------
//						LOGIN
//--------------------------------------------------------------

app.get('/', function (req, res) {   
   res.render("login.html",{ mensaje: "" });
});

app.post('/', function (req, res) {
   var usuario = req.body.user.trim();
   var password = req.body.pass.trim();
   
   console.log(usuario);
   console.log(password);
	
		if (usuario == "admin" && password=="admin"){	
			
			res.redirect('/index');
		}else{				
			
			res.render('login.html',{ mensaje: "Usuario / Clave incorrecta" });
		}
			


});


//--------------------------------------------------------------
//						INDEX
//--------------------------------------------------------------

app.get('/index', function (req, res) {
    
	
	var data = fs.readFileSync('/proc/meminfo').toString(); 
	var lines = data.split(/\n/g).map(function(line){ 
		return line.split(':'); 
	}); 		
	//console.log(lines);
		
	child_process.exec('ps -A -o pid,user,state,%mem,command', (err, stdout, stdin) => {
		if (err) console.log(err);
		var jsonArr = [];
		var json1=""; 
		var lines = stdout.split("\n");
		var contador = 0;
		var dormidos = 0;
		var corriendo = 0;
		var detenidos = 0;
		var zombies = 0;
		for (var i = 1; i < lines.length; i++) {
			var line = lines[i].trim();
			var pid = line.split(" ")[0];
			line = line.substring(pid.length, line.length).trim();
			var user = line.split(" ")[0];
			line = line.substring(user.length, line.length).trim();
			var state = line.split(" ")[0];
			line = line.substring(state.length, line.length).trim();
			var mem = line.split(" ")[0];
			line = line.substring(mem.length, line.length).trim();
			var command = line;
				
			//console.log("pid",pid);
			//console.log("user",user);
			//console.log("state",state);
			//console.log("mem",mem);
			//console.log("name",command);
			
			switch(state)
			{
				case "S":
					dormidos ++;
					break;
				case "D":
					dormidos ++;
					break;
				case "R":
					corriendo ++;
					break;
				case "T":
					detenidos ++;
					break;
				case "Z":
					zombies ++;
					break;
			}
			contador++;
			jsonArr.push({"pid":pid, "user":user, "state":state, "mem":mem, "name":command});		
       }
	   
		json1 = JSON.stringify({jsonArr:jsonArr});
		//console.log("JSON COMPLETO:"+json1);
		var jsonObj1 = JSON.parse(json1); 
		//console.log("TAMAÑO ARREGLO:"+jsonObj1.jsonArr.length);
		//console.log(contador);
		contador = contador -1;
		res.render('index.html',{ procesos: jsonArr, NumProcesos: contador, NumSleep: dormidos , NumRun: corriendo , NumStop:detenidos , NumZombies: zombies});
	});
			
});


app.get('/icon', function (req, res) {
    console.log("iconos");		
	res.render('messages.html');
});

//--------------------------------------------------------------
//						ELIMINAR
//--------------------------------------------------------------

app.get('/eliminar', function (req, res) {

	var pid = req.query['id'];
	
	console.log("Muere :'v");		
	
	//process.kill(pid, 'SIGKILL');
	ps.kill( pid, function( err ) {
	   if (err) {
		   //throw new Error( err );
			console.log( 'Proceso no eliminado: ', pid );
			res.redirect('/index');
	   }
	   else {
		   console.log( 'Proceso eliminado: ', pid );
		   res.redirect('/index');
	   }
	});

	console.log("Murio :'v");
	res.redirect('/index');
});


//--------------------------------------------------------------
//						CPU
//--------------------------------------------------------------

app.get('/cpu', function (req, res) {
	
	var uso = 0;
	var total = 0;
	var consumida = 0;
	
	os.cpuUsage(function(p){
		console.log( 'Uso de CPU  (%): ' + p );
		uso = p;
	});

	//console.log('Total de memoria: ' + os.totalmem() + " MB");
	total = os.totalmem();
	//console.log('Memoria consumida: ' + (os.totalmem() - os.freemem())+" MB");
	consumida = os.totalmem() - os.freemem();

	res.render('cpu.html',{ UsoCPU: uso, MemTotal: total, MemUso: consumida});	
});

app.post('/vista_clase', function (req, res) {
	var clase = req.body.clase_nombre;
	var codigo = req.body.txtCodigo;
	
	fs.writeFile("./Descargas/"+clase, codigo, function (err) {
		if (err) {
			return console.log(err);
		}else{
			console.log("Archivo guardado");
			res.json({success : true})
			res.redirect('/repositorio_201212487');
		}
    
	});
});

//--------------------------------------------------------------
//						RAM
//--------------------------------------------------------------

app.get('/ram', function (req, res) {
	
	var uso = 0;
	var total = 0;
	var consumida = 0;

	//console.log('Total de memoria: ' + os.totalmem() + " MB");
	total = os.totalmem();
	//console.log('Memoria consumida: ' + (os.totalmem() - os.freemem())+" MB");
	consumida = os.totalmem() - os.freemem();

	res.render('ram.html',{ UsoCPU: uso, MemTotal: total, MemUso: consumida});	
});

//--------------------------------------------------------------
//						LOG OFF
//--------------------------------------------------------------

app.get('/salir', function (req, res) {
	
	res.render("login.html",{ mensaje: "" });
		
});