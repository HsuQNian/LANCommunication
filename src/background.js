"use strict";
import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
const serveStatic = require("serve-static");
const connect = require("connect");
import path from "path";
const os = require("os");
const osType = os.type(); //系统类型
const netInfo = os.networkInterfaces(); //网络信息
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);
function getLocalIP() {
  let ip = "";
  if (osType === "Windows_NT") {
    for (let dev in netInfo) {
      if (/WLAN/.test(dev) || /以太网/.test(dev)) {
        for (let j = 0; j < netInfo[dev].length; j++) {
          if (netInfo[dev][j].family === "IPv4") {
            ip = netInfo[dev][j].address;
            break;
          }
        }
      }
    }
  } else if (osType === "Linux" || osType === "Darwin")
    ip = netInfo.eth0[0].address;
  return ip;
}
async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 640,
    height: 600,
    resizable: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.hookWindowMessage(278, function() {
    win.setEnabled(false);
    setTimeout(() => {
      win.setEnabled(true);
    }, 100);
    return true;
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools({ mode: "detach" });
  } else {
    createProtocol("app");
    win.loadURL("app://./index.html");
  }

  console.time("WebSocket");
  const back = connect();
  back.use(
    "/",
    serveStatic("./dist", {
      index: ["index.html", "/"],
    })
  );
  let clients = [];
  back.listen(3000);
  const webSocketServer = new (require("ws").Server)({
    port: 3001,
  }).on("connection", function connection(client, req) {
    req.url
      .replace("/?", "")
      .split("&")
      .forEach((item) => {
        client[item.split("=")[0]] = decodeURIComponent(item.split("=")[1]);
      });
    // if (
    //   !clients.some((item) => {
    //     if (item.code === client.code) return true;
        
    //   })
    // )
      clients.push({
        name: client.name,
        code: client.code,
        equipment: client.equipment,
      });
    console.log(clients);
    webSocketServer.clients.forEach((item) => {
      switch (item.equipment) {
        case "controller":
          item.send(JSON.stringify(clients));
          break;
        case "controllable":
          item.send("getState");
          break;
        default:
          break;
      }
    });
    client.on("message", function incoming(data) {
      data == "getEquipment"
        ? client.send(JSON.stringify(clients))
        : (() => {
            data = eval("(" + data + ")");
            switch (Object.keys(data)[0]) {
              case "message":
                {
                  let message = {
                    from: data.message.from,
                    information: data.message.information,
                  };
                  send(message, data.message.to);
                }
                break;
              case "instruction":
                {
                  let instruction = `${data.instruction.control}&${data.instruction.instruction}`;
                  send(instruction, data.instruction.code);
                }
                break;
              case "myState":
                {
                  let state = {
                    from: client.code,
                    state: data.myState,
                  };
                  webSocketServer.clients.forEach((item) => {
                    if (item.equipment == "controller") {
                      item.send(JSON.stringify(state));
                    }
                  });
                }
                break;
              default:
                console.log(typeof data, "default");
                console.log(data, "default");
                break;
            }
          })();
      function send(data, conditions) {
        webSocketServer.clients.forEach((item) => {
          if (item.code == conditions) {
            item.send(JSON.stringify(data));
          }
        });
      }
    });
    client.on("close", function incoming() {
      clients = [];
      webSocketServer.clients.forEach((item) => {
        clients.push({
          name: item.name,
          code: item.code,
          equipment: item.equipment,
        });
      });
      console.log(clients);
      webSocketServer.clients.forEach((item) => {
        if (item.equipment == "controller") {
          item.send(JSON.stringify(clients));
        }
      });
    });
  });
  console.timeEnd("WebSocket");
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on("ready", async () => {
  createWindow();
  ipcMain.on("getIp", (event) => {
    event.returnValue = getLocalIP();
  });
});
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
