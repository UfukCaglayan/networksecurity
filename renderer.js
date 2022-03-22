var dbx = null;

const appTokenUrl =
  'https://www.dropbox.com/oauth2/authorize?client_id=2h5lnsd8852z1u9&response_type=code';

window.open(appTokenUrl, '_blank').focus();

var currentPath = '/';

const getAccesToken = async () => {
  var myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    'Basic Mmg1bG5zZDg4NTJ6MXU5OnBxa2M1dnhweHZzcmJleg=='
  );

  var formdata = new FormData();
  formdata.append('code', document.getElementById('tokenText').value);
  formdata.append('grant_type', 'authorization_code');

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow',
  };

  const response = await fetch(
    'https://api.dropboxapi.com/oauth2/token',
    requestOptions
  ).then((response) => response.json());
  console.log(response['access_token']);
  dbx = new Dropbox.Dropbox({
    accessToken: response['access_token'],
  });
  getFileList('fileList', '');
  document.getElementById('tokenContainer').style = 'display:none';
  return response['acces_token'];
};

const addElementToList = (listId, element) => {
  var ul = document.getElementById(listId);
  var li = document.createElement('li');
  li.addEventListener('click', () => getFileList(listId, element.path_display));
  var div = document.createElement('div');
  li.appendChild(document.createTextNode(element.name));
  div.appendChild(li);
  var downloadButton = document.createElement('span');
  if (element['.tag'] === 'file') {
    li.classList.add('file');
    downloadButton.addEventListener('click', () =>
      downloadFile(element.path_display, element.name)
    );
  } else li.classList.add('folder');
  downloadButton.addEventListener('click', () =>
    downloadFolder(element.path_display, element.name)
  );
  downloadButton.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i>';
  div.appendChild(downloadButton);
  ul.appendChild(div);
};

const downloadFile = (path, fileName) => {
  dbx.filesDownload({ path: path }).then((e) => {
    saveAsFile(fileName, e.result.fileBlob);
  });
};

const downloadFolder = (path, fileName) => {
  dbx.filesDownloadZip({ path: path }).then((e) => {
    saveAsFile(fileName + '.zip', e.result.fileBlob);
  });
};

function uploadFile() {
  var path = '/';
  if (currentPath && currentPath !== '') path = currentPath;
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
  var fileInput = document.getElementById('file-upload');
  var file = fileInput.files[0];

  if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
    // File is smaller than 150 Mb - use filesUpload API
    dbx
      .filesUpload({ path: path + file.name, contents: file })
      .then(function (response) {
        var results = document.getElementById('results');
        var br = document.createElement('br');
        results.appendChild(document.createTextNode('Dosya Yüklendi!'));
        getFileList('fileList', currentPath);
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    // File is bigger than 150 Mb - use filesUploadSession* API
    const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size

    var workItems = [];

    var offset = 0;

    while (offset < file.size) {
      var chunkSize = Math.min(maxBlob, file.size - offset);
      workItems.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }

    const task = workItems.reduce((acc, blob, idx, items) => {
      if (idx == 0) {
        // Starting multipart upload of file
        return acc.then(function () {
          return dbx
            .filesUploadSessionStart({ close: false, contents: blob })
            .then((response) => response.session_id);
        });
      } else if (idx < items.length - 1) {
        // Append part to the upload session
        return acc.then(function (sessionId) {
          var cursor = { session_id: sessionId, offset: idx * maxBlob };
          return dbx
            .filesUploadSessionAppendV2({
              cursor: cursor,
              close: false,
              contents: blob,
            })
            .then(() => sessionId);
        });
      } else {
        // Last chunk of data, close session
        return acc.then(function (sessionId) {
          var cursor = { session_id: sessionId, offset: file.size - blob.size };
          var commit = {
            path: '/' + file.name,
            mode: 'add',
            autorename: true,
            mute: false,
          };
          return dbx.filesUploadSessionFinish({
            cursor: cursor,
            commit: commit,
            contents: blob,
          });
        });
      }
    }, Promise.resolve());

    task
      .then(function (result) {
        var results = document.getElementById('results');
        results.appendChild(document.createTextNode('Dosya Yüklendi!'));
        setTimeout(() => {
          location.reload();
        }, 1000);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
  return false;
}

const clearTheList = (listId) => {
  const ourList = document.getElementById(listId);
  ourList.innerHTML = '';
};

const getFileList = (listId, path) => {
  clearTheList(listId);
  currentPath = path + '/';
  dbx
    .filesListFolder({ path: path })
    .then(function (response) {
      console.log(response);
      response.result.entries.forEach((element) => {
        console.log(element['.tag']);
        addElementToList(listId, element);
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

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

// window.onload = function () {
//   getFileList('fileList', '');
// };
