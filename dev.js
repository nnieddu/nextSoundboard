const { exec } = require("child_process");
const os = require("os");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
  return "0.0.0.0";
}

const localIP = getLocalIP();
console.log(`Starting dev server accessible at: https://${localIP}:3000`);
exec("next dev --experimental-https -H 0.0.0.0");
