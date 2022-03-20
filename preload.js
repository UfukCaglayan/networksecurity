require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({
  accessToken:
    'sl.BELzAe-1ZDwB-6uPZ27Iq0kB3j-qUoeUONjEGQIB3-J18oGn-hLTPIirXEgpXX8vP2nxOUozrbvnKXjfsAT_bJ05vZPrkgspxM8ZwL9FLGzLnq5aaBLztpC2jhkbCegepU39L-e6m5eD',
});
dbx
  .filesListFolder({ path: '/Network Security' })
  .then(function (response) {
    console.log(response.result.entries);
    dbx.filesDownloadZip({ path: '/Network Security' }).then((e) => {
      console.log(e);
      saveAsFile('download.zip', e.result.fileBlob);
      //   saveAsFile(e.result.name, e.result.fileBlob);
    });
  })
  .catch(function (error) {
    console.log(error);
  });

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

var saveAsFile = function (fileName, fileContents) {
  if (typeof Blob != 'undefined') {
    // Alternative 1: using Blob
    var textFileAsBlob = new Blob([fileContents], { type: 'text/plain' });
    var downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    if (window.webkitURL != null) {
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = document.body.removeChild(event.target);
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }
    downloadLink.click();
  } else {
    // Alternative 2: using Data
    var pp = document.createElement('a');
    pp.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContents)
    );
    pp.setAttribute('download', fileName);
    pp.onclick = document.body.removeChild(event.target);
    pp.click();
  }
}; // saveAsFile