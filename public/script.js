const socket = io.connect('http://localhost:3000');
let Username ="";
const botImages = [
    "images/itachi.jpg",
    "images/lee.png",
    "images/obito.png",
    "images/pain.png",
    "images/zoro.png",
    "images/Kakashi.jpg",
    "images/naruto.jpg",
    "images/Sasuke.png"
];
do {
    Username = prompt("Please provide your name to enter the chatroom")
    userImage = botImages[random(0, botImages.length - 1)]; // Assign a random image
} while (!Username);
const clientsTotal = document.getElementById('clients-total');
const meessageContainer = document.getElementById('message-conatiner');
const nameInput = document.getElementById('name-input');
const messageForm  = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const clientLive = document.getElementById('numberOfClients')
// const nameOfUser = document.getElementsByClassName('name');
const profile = document.getElementById("profile");


nameInput.value = Username;
profile.src = userImage;



function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

socket.on('connect',()=>{
    socket.emit('liveClient', {Username, userImage})
})



messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    sendMessage();
})



socket.on('clients-total', (data)=>{
    clientLive.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
        const info = data[i];
        const element = `
            <li><img class="online-clients-img" id="online-clients-img" src="${info.userPic}"> ${info.userName}</li>`;
        clientLive.innerHTML += element;}
    clientsTotal.innerText = `Total Clients : ${data.length}`;
   
})

socket.on("previousMessages", (previousMessage) =>{
    for(let i = 0 ; i < previousMessage.length; i++ ){
        const data = previousMessage[i];
        console.log("info", data);
        addMessageToUI(false, false, data);
    }
})


function sendMessage(){
    if(messageInput.value === "") return;
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: new Date(),
        userImage : userImage
    }
    socket.emit('message', data);
    addMessageToUI(true,true, data);
    socket.emit('sendMessage', data);
    messageInput.value='';
}

socket.on("chat-message", (data)=>{
    addMessageToUI(false, false,data);
    console.log(data);

})

function addMessageToUI(isOwnMessage,isOwnImage, data){
    const dateTime = new Date(data.dateTime);
    
    // Format the time
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' };
    const formattedTime = dateTime.toLocaleTimeString('en-IN', timeOptions);

    // Format the date
    const dateOptions = { month: 'short', day: 'numeric' };
    const formattedDate = dateTime.toLocaleDateString('en-IN', dateOptions);
    clearFeedback();
    const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left" }">
    <img class=${isOwnImage ? "imgOfRightUser" :"imgOfLeftUser"} src="${data.userImage}">
    <p class="message">
        ${data.message}
    </p>
    <span>${data.name} ● ${formattedDate} ${formattedTime}</span>
</li>`

meessageContainer.innerHTML += element;
scrollToBottom()
}

function scrollToBottom(){
    meessageContainer.scrollTo(0, meessageContainer.scrollHeight);
}

messageInput.addEventListener('focus', (e)=>{
socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
})
})
messageInput.addEventListener('keypress', (e)=>{
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing a message`,
    })
})
messageInput.addEventListener('blur', (e)=>{
    socket.emit('feedback', {
        feedback: '',
    })
})

socket.on('feedback', (data)=>{
    clearFeedback();
    const element =`
    <li class="message-feedback">
                    <p class="feedback" id="feedback">
                        ${data.feedback}
                    </p>
                </li>`
    meessageContainer.innerHTML += element;
    scrollToBottom()
})

function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(element =>{
        element.parentNode.removeChild(element);
    })
}
