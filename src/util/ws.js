let code = Math.random().toString(36);
let uuid = sessionStorage.getItem("uuid");
if (!uuid) {
  sessionStorage.setItem("uuid", code);
}

let webSocket = function(url, name) {
  let charName = sessionStorage.getItem("charName");
  if (!charName) {
    sessionStorage.setItem("charName", name);
  }
  let ws = new WebSocket(
    `ws://${url}:3001?equipment=controller&name=${sessionStorage.getItem(
      "charName"
    )}&code=${sessionStorage.getItem("uuid")}`
  );
  ws.code = sessionStorage.getItem("uuid");
  ws.onclose = function() {
    console.log("服务器已经断开");
  };
  return ws;
};
export default webSocket;
