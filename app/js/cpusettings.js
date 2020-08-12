// const { ipcRenderer } = require('electron');
const settingsForm = document.getElementById('settings-form');

// Get Settings
ipcRenderer.on('settings:get', (e, settings) => {
  document.getElementById('cpu-overload').value = settings.cpuOverload;
  document.getElementById('alert-frequency').value = settings.alertFrequency;
});

// Submit Settings
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const cpuOverload = document.getElementById('cpu-overload').value;
  const alertFrequency = document.getElementById('alert-frequency').value;

  // Send New Settings to Main Process
  ipcRenderer.send('settings:set', {
    cpuOverload,
    alertFrequency,
  });

  //   console.log('settings Saved');
  showAlert(
    `Settings Saved: CPU Overload: ${cpuOverload} & Alert Timer to ${alertFrequency}`
  );
});

// showAlert Function
function showAlert(msg) {
  const alert = document.getElementById('alert');
  alert.classList.remove('hide');
  alert.classList.add('alert');
  alert.innerText = msg;

  setTimeout(() => {
    alert.classList.add('hide');
  }, 4000);
}
