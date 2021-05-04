const socket = io();

const form = document.querySelector("#message-form");
const inputField = form.querySelector("input");
const sendButton = form.querySelector("button");
const locationButton = document.querySelector("#send-location");
const messages = document.querySelector("#messages");
const sideBar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  $newMessage = messages.lastElementChild;

  const $newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt($newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const containerHeight = messages.scrollHeight;

  //how far i have scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ users }) => {
  const html = Mustache.render(sidebarTemplate, {
    users,
  });
  sideBar.innerHTML = html;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    sendButton.removeAttribute("disabled", "disabled");
    inputField.value = "";
    inputField.focus();

    if (error) {
      return alert(error);
    }
  });
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser");

  locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      locationButton.removeAttribute("disabled", "disabled");
    });
  });
});

socket.emit("join", { username }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
