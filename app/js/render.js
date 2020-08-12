const path = require('path');
const { ipcRenderer } = require('electron');
const osu = require('node-os-utils');

const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let alertFrequency;

// get Settings & values
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});

osType = os.type();
if (osType.toLowerCase() === 'darwin') {
  osType = 'Mac OS';
}

// Run Every 2 sec
setInterval(() => {
  // CPU Useage
  cpu.usage().then((info) => {
    document.getElementById('cpu-usage').innerText = `${info}%`;

    document.getElementById('cpu-progress').style.width = `${info}%`;

    // make progressbar red if overload
    if (info >= cpuOverload) {
      document.getElementById('cpu-progress').style.background = `red`;
    } else {
      document.getElementById('cpu-progress').style.background = `#30c88b`;
    }

    // Check Overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CUP OVER LOAD',
        body: `CPU is over ${cpuOverload}`,
        icon: path.join(__dirname, 'img', 'icon.png'),
      });

      localStorage.setItem('lastNotify', +new Date());
    }
  });

  //   CPU free
  cpu.free().then((info) => {
    document.getElementById('cpu-free').innerText = `${info}%`;
  });

  //   console.log(os.uptime());
  document.getElementById('sys-uptime').innerText = secondToDhms(os.uptime());
}, 2000);

// set Model
document.getElementById('cpu-model').innerText = cpu.model();

// set computer name
document.getElementById('comp-name').innerText = os.hostname();

// OS
document.getElementById('os').innerText = `${osType} ${os.arch()}`;

// Toatl Memory
mem.info().then((info) => {
  document.getElementById('mem-total').innerText = info.totalMemMb;
});

// functions

// send Notification
const notifyUser = (options) => {
  new Notification(options.title, options);
};

// Check How much Time has passed since last notification
const runNotify = (frequency) => {
  if (localStorage.getItem('lastNotify') === null) {
    // Store Timestamp
    localStorage.setItem('lastNotify', +new Date());
    return true;
  }

  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) return true;
  else return false;
};

// Show days hours mins function
const secondToDhms = (seconds) => {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}D, ${h}H, ${m}M, ${s}S`;
};
