//get host
var host = document.location.hostname;
var port = document.location.port;
if (port){
    host = host+":"+port;
}

//connect to socket
var socket = io.connect(host);

//get pseudo
$.ajax({
    url : '/api/user/data',
    type : 'GET',
    success: function(data) {
        if(data.pseudo){
            socket.emit('newUser', data.pseudo);
        } else {
            socket.emit('newUser', "anonynmous");
        }
    },
    error: error => {
        console.log('pseudo error');
    }
});

//hide info messages
document.querySelector('#info').style.visibility = 'hidden';
$('#connect').hide();
$('#disconnect').hide();
$('#iswriting').hide();

//display info msg
socket.on('info', function(message) {
    document.querySelector('#info').style.visibility = 'visible';
    $('#info>#pseudo').text(message.pseudo);
    switch(message.action){
        case 'CONNECT':
            $('#connect').show();
            break;

        case 'DISCONNECT':
            $('#disconnect').show();
            break;

        case 'ISWRITING':
            $('#iswriting').show();
            break;
    }
    setTimeout(function() {
        document.querySelector('#info').style.visibility = 'hidden';
        $('#connect').hide();
        $('#disconnect').hide();
        $('#iswriting').hide();
    },2000)
});

//display connected users
socket.on('users', function(users) {
    document.querySelector('#users').innerHTML = "";
    users.forEach(function(user) {
        var p = document.createElement('p');
        p.innerText = user
        document.querySelector('#users').appendChild(p);
    })

});

//send msg
document.querySelector('#send').onclick = function() {
    sendMsg();
};

//detect typing
document.querySelector("#chatMsg").addEventListener("keydown", function() {
    socket.emit('typing');
}, false);

//build self msg
socket.on('selfMsg', function(msg) {
    buildMsg('selfMsg', 'You', msg)
});

//build users msg
socket.on('userMsg', function(obj) {
    buildMsg('userMsg', obj.pseudo, obj.msg);
});

//build msg
var buildMsg = function(userClassName, pseudo, msg) {
    var div = document.createElement('div');
    div.className = userClassName;
    var pUser = document.createElement("p");
    pUser.innerText = pseudo;
    pUser.className = 'userName';
    var pMsg = document.createElement("p");
    pMsg.innerText = msg;
    pMsg.className = 'msg';
    div.appendChild(pUser);
    div.appendChild(pMsg);
    document.querySelector('#chat').appendChild(div);
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
};

//send msg
var sendMsg = function() {
    if(document.querySelector('#chatMsg').value !== ''){
        const msg = document.querySelector('#chatMsg').value;
        socket.emit('msg', msg);
        document.querySelector('#chatMsg').value = '';
    }
};

//Fonction pour valider le formulaire avec la touche Enter et pour faire un saut de ligne avec Shift + Enter
var validForm = function(e) {
    if (e.keyCode == 13 && !e.shiftKey) {
        sendMsg()
        return false;
    } else {
        return true;
    }
}
