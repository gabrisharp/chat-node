console.log('teste')
const socket = io(); //Se a conexão fosse com outro servidor colocaria-se a url 
console.log(socket);
let userList = [];
let username = '';

const loginPage = document.querySelector('#loginPage')
const chatPage = document.querySelector('#chatPage');

const loginInput = document.querySelector('#loginNameInput');
const textInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList(){
    const ul = document.querySelector('.userList');
    ul.innerHTML = '';
    userList.forEach((user)=>{
        const li = document.createElement('li');
        li.textContent = user;
        ul.appendChild(li);
    })
}

function addMessage(type, user, msg){
    const ul = document.querySelector('.chatList');
    const li = document.createElement('li');
    const span = document.createElement('span');
    switch (type) {
        case 'status':
            li.classList.add('m-status');
            li.textContent = msg;
        break;
        case 'msg':
            if(user === username){
                span.classList.add('me')
            }
            span.textContent = user;
            li.classList.add('m-txt');
            li.appendChild(span);
            li.appendChild(document.createTextNode(msg));
        break;
    }
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight //Automaticamente joga o scroll mais para baixo
}


socket.on('user-ok', (list)=>{
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Você foi conectado')

    userList = list;
    console.log('lista=>',userList);
    renderUserList();
});
socket.on('list-update', (data)=>{
    userList = data.list;
    renderUserList();
    if(data.joined){
        return addMessage('status',null, `${data.joined} entrou no chat` );
    }
    addMessage('status', null,  `${data.left} desconectou`);
});
socket.on('show-msg', (data)=>{
    addMessage('msg', data.username, data.message);
});
socket.on('disconnect', ()=>{
    addMessage('status', null, 'você foi desconectado'); //Aparece num caso de erro, ex se o server cair
    userList =[];
    renderUserList();
});
socket.on('reconnect_error', () =>{
    addMessage('status', null, 'Tentando Reconectar...');
});
socket.on('reconnect', () =>{ // Quando conseguir reconectar
    addMessage('status', null, 'Reconectado');
    if(username){
        socket.emit('join-request', username);
    }
});

loginInput.addEventListener('keyup', (e)=>{
    console.log('conectado');
    if(e.keyCode === 13){
        let name = loginInput.value.trim();
        if(name){
            username = name;
            document.title = `Chat - ${username}`;
            socket.emit(`join-request`, username);
        }
    }
});
textInput.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        let txt = textInput.value.trim();
        textInput.value = '';
        if(!txt) return
        addMessage('msg', username, txt); //Adiciona sua própria mensagem para não precisar carregar no servidor
        socket.emit('send-msg', txt); 
    }
});