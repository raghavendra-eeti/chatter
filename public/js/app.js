const landing = document.querySelector("#landing");
const chat = document.querySelector("#chat");

// Section : Join / Create tabs

const joinChannelLabel = document.querySelector("#join__label");
const createChannelLabel = document.querySelector("#create__label");
const joinForm = document.querySelector("#join__form");
const createForm = document.querySelector("#create__form");

joinChannelLabel.addEventListener("click", () => {
    joinChannelLabel.classList.add("label--active");
    createChannelLabel.classList.remove("label--active");
    joinForm.classList.remove("hidden");
    createForm.classList.add("hidden");
});

createChannelLabel.addEventListener("click", () => {
    createChannelLabel.classList.add("label--active");
    joinChannelLabel.classList.remove("label--active");
    createForm.classList.remove("hidden");
    joinForm.classList.add("hidden");
});

// Templates : Participant, Message

const templateParticipant = (name, color) => {
    const element = document.createElement("p");
    element.style = `color: ${color};`;
    element.innerText = name;
    return element;
};

const templateMessage = (name, color, text) => {
    const element = document.createElement("div");
    const nameElement = document.createElement("p");
    nameElement.style = `color: ${color}; font-weight: bold;`;
    nameElement.innerText = name;
    const textElement = document.createElement("p");
    textElement.innerText = text;
    element.appendChild(nameElement);
    element.appendChild(textElement);
    element.style = `border-left: 2px solid ${color}`;
    element.classList.add("message");
    return element;
};

const templateImage = (name, color, link) => {

    const element = document.createElement("div");
    const nameElement = document.createElement("p");
    nameElement.style = `color: ${color}; font-weight: bold;`;
    nameElement.innerText = name;
    const imageElement = document.createElement("img");
    imageElement.src = link;
    imageElement.style.width = '300px'
    imageElement.style.cursor = 'pointer'
    imageElement.addEventListener("click", () => {
        window.open(link)
    })
    element.appendChild(nameElement);
    element.appendChild(imageElement);
    element.style = `border-left: 2px solid ${color}`;
    element.classList.add("message");
    return element;

};

const addParticipant = (participant) => {
    document.querySelector("#participants-list").appendChild(participant);
};

const addMessage = (message) => {
    const messages = document.querySelector("#messages");
    messages.appendChild(message);
    const linebreak = document.createElement("br");
    messages.appendChild(linebreak);
    linebreak.scrollIntoView(true);
};

// Handle send message
const messageForm = document.querySelector("#message__form");

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageForm.elements["text"].value.trim();
    socket.emit("message", text);
    messageForm.elements["text"].value = "";
});

const addImage = document.querySelector("#add-image__button");
addImage.addEventListener("click", () => {
    let link = prompt("Paste image link");
    link = link.trim()
    if (link)
        socket.emit("image", link);
})

// Socket io
const socket = io();

socket.on("created", (channelId) => {
    const channelIdSpan = document.querySelector("#channelidspan");
    channelIdSpan.innerText = channelId;
    landing.classList.add("hidden");
    chat.classList.remove("hidden");
});

socket.on("joined", (name, channelId, priorParticipants) => {
    const channelIdSpan = document.querySelector("#channelidspan");
    channelIdSpan.innerText = channelId;
    landing.classList.add("hidden");
    chat.classList.remove("hidden");

    priorParticipants.forEach((p) => {
        if (p.name === name) return;
        addParticipant(templateParticipant(p.name, p.color));
    });
});

socket.on("new-message", (name, color, text) => {
    const message = templateMessage(name, color, text);
    addMessage(message);
});

socket.on("new-image", (name, color, link) => {
    const message = templateImage(name, color, link);
    addMessage(message);
});

socket.on("user-connect", (name, color) => {
    const text = "User has connected";
    const message = templateMessage(name, color, text);
    addMessage(message);
    const participant = templateParticipant(name, color);
    addParticipant(participant);
});

socket.on("user-disconnect", (name, color) => {
    const text = "User has disconnected";
    const message = templateMessage(name, color, text);
    addMessage(message);
    const participants = document.querySelector("#participants-list");
    participants.childNodes.forEach((child) => {
        if (child.tagName === "P") if (child.innerText === name) child.remove();
    });
});

socket.on("failure", (type) => {
    let message;
    if (type === "invalid-id") message = "Could not find the channel";
    else message = "Display name is already in use";
    updateJoinError(message);
});

// Handle : Join / Create

const isValid = (str) => !/[^a-zA-Z0-9]/.test(str);

const updateJoinError = (message) => {
    const joinError = document.querySelector("#join__error");
    joinError.classList.remove("hidden");
    joinError.innerText = message;
    setTimeout(() => {
        joinError.classList.add("hidden");
        joinError.innerText = "";
    }, 2000);
};

const updateCreateError = (message) => {
    const createError = document.querySelector("#create__error");
    createError.classList.remove("hidden");
    createError.innerText = message;
    setTimeout(() => {
        createError.classList.add("hidden");
        createError.innerText = "";
    }, 2000);
};

joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = joinForm.elements["display-name"].value.trim();
    if (!isValid(name)) {
        const message = "Display name can only contain alphabets and numbers";
        updateJoinError(message);
        return;
    }

    const channelId = joinForm.elements["channel-id"].value.trim();
    if (!isValid(channelId)) {
        const message = "Channel Id can only contain alphabets and numbers";
        updateJoinError(message);
        return;
    }

    socket.emit("join", name, channelId);
});

createForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = createForm.elements["display-name"].value.trim();
    if (!isValid(name)) {
        const message = "Display name can only contain alphabets and numbers";
        updateCreateError(message);
        return;
    }
    socket.emit("create", name);
});
