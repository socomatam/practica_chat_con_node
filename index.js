var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var usuarios = [];
var socketsId = [];

//abre conexión
io.on('connection', function(socket) {
	
	//recibe el nombre de usuario al que se le enviará un privado
	//también recibe el socket.id literal 
	socket.on('mensaje_privado', function(usuario){
		socketsId.push(usuario.id);
	});//fin mensaje privado
	
	
	//recibe los mensaje de los usuarios y los envía
	socket.on('chat message', function(msg) {
		//divide la frase recibida en el mensaje de un usuario
		var divisiones = msg.mensaje.split(" ");
		
		var mensaje = "";
		
		for(var i = 0; i < divisiones.length; i++){
			if(divisiones[i] == ':-)'){
				divisiones[i] = '&#128512;';
			}else if(divisiones[i] == ':-('){
				divisiones[i] = '&#128543;';	  
			}else if(divisiones[i] == ';-)'){
				divisiones[i] = '&#128521;';	  
			}else if(divisiones[i] == ':-o'){
				divisiones[i] = '&#128558;';	  
			}else if(divisiones[i] == ':-|'){
				divisiones[i] = '&#128528;';	  
			}//fin else if
			
			mensaje = mensaje + divisiones[i];
			mensaje = mensaje + " ";
		}//fin for

		
		//envía a los clientes los mensajes de todos
		io.emit('chat message', {
			mensaje:mensaje,
			usuario:msg.usuario,
			color: msg.color
		});
	});//fin chat mensaje
	
	socket.on('usuario_activo', function(usuario) {
		//io.emit('usuario_activo', usuario);
		
		io.emit('usuario_activo', {usuario: usuario, id: socket.id});
	});//fin disconect

	socket.on('disconnect', function() {
		//emite si algún usuario ha salido del chat
		io.emit('usuario_desconectado', socket.username);
	});//fin disconect
	
	//recibe el evento del usuario escribiendo
	socket.on('usuario_escribiendo',function(usuario){
		io.emit('usuario_escribiendo', usuario);
	});//fin nuevo usuario
	
	//recibe el evento cuando el usuario deja de pulsar teclas
	socket.on('usuario_noescribiendo',function(usuario){
		io.emit('usuario_noescribiendo', usuario);
	});//fin nuevo usuario
	
	//recibe el nombre de usuario
	socket.on('nuevo_usuario', function(usuario) {	
		socket.username = usuario;
		//emite que el usuario nuevo se ha creado
		//io.emit('usuario_activo', {usuario: usuario, id: socket.id});
		io.emit('usuario_conectado', usuario);
	});//fin nuevo usuario
	
	socket.on('borrar_seleccion_usuarios', function(orden){
		socketsId = [];
		console.log('Id de usuarios borrador');
	});////fin borrar
	
	//envía el mensaje privado
	socket.on('privado',function(mensaje){

		for(var i = 0; i < socketsId.length; i++){
			//console.log(socketsId[i]);
			io.to(socketsId[i]).emit('privado', mensaje);
		}//fin for

		//io.to().emit('privado', 'Este mensaje es único');
	});//fin privado
	

}); //fin conection

http.listen(80, function() {
	console.log('listening on *:80');
});