
const image = document.getElementById('image'); 
const canvas = document.getElementById('canvas');
const dropContainer = document.getElementById('container');
const warning = document.getElementById('warning');
const fileInput = document.getElementById('fileUploader');

// const URL = "http://localhost:5000/api/"
// const URL = "http://192.168.163.132:5000/api/"


function GetUrlPara()
　　{
	var protocol = window.location.protocol.toString();
	// var host =  window.location.host.toString();
	var host =  document.domain.toString();
        var port = window.location.port.toString();
	var url = protocol + '//' + host + ":5000/api/";
	return url;
　　}


const URL = GetUrlPara()
// alert(URL);


function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
};


function windowResized() {
  let windowW = window.innerWidth;
  if (windowW < 480 && windowW >= 200) {
    dropContainer.style.display = 'block';
  } else if (windowW < 200) {
    dropContainer.style.display = 'none';
  } else {
    dropContainer.style.display = 'block';
  }
}

['dragenter', 'dragover'].forEach(eventName => {
  dropContainer.addEventListener(eventName, e => dropContainer.classList.add('highlight'), false)
});

['dragleave', 'drop'].forEach(eventName => {
  dropContainer.addEventListener(eventName, e => dropContainer.classList.remove('highlight'), false)
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropContainer.addEventListener(eventName, preventDefaults, false)
});

dropContainer.addEventListener('drop', gotImage, false)

// send image to server, then receive the result, draw it to canvas.
function communicate(img_base64_url) {
  $.ajax({
    url: URL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({"image": img_base64_url}),
    dataType: "json"
  }).done(function(response_data) {
      drawResult(response_data.results);
  });
}

// handle image files uploaded by user, send it to server, then draw the result.
function parseFiles(files) {
  const file = files[0];
  const imageType = /image.*/;
  if (file.type.match(imageType)) {
    warning.innerHTML = '';
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      image.src = reader.result;
      // send the img to server
      communicate(reader.result);

    }
  } else {
    setup();
    warning.innerHTML = 'Please drop an image file.';
  }

}

// call back function of drag files.
function gotImage(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 1) {
    console.error('upload only one file');
  }
  parseFiles(files);
}

// callback function of input files.
function handleFiles() {
  parseFiles(fileInput.files);
}

// callback fuction of button.
function clickUploader() {
  fileInput.click();
}

// draw results on image.
function drawResult(results) {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    for(bboxInfo of results) {
      bbox = bboxInfo['bbox'];
      class_name = bboxInfo['name'];
      score = bboxInfo['conf'];

      ctx.beginPath();
      ctx.lineWidth="4";

      ctx.strokeStyle="red";
      ctx.fillStyle="red";
      
      ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
      ctx.stroke();
      
      ctx.font="30px Arial";
      
      let content = class_name + " " + parseFloat(score).toFixed(2);
      ctx.fillText(content, bbox[0], bbox[1] < 20 ? bbox[1] + 30 : bbox[1]-5);
  }
}


// 初始化函数
async function setup() {
  // Make a detection with the default image
  // detectImage();

  var canvasTmp = document.createElement("canvas");
  canvasTmp.width = image.width;
  canvasTmp.height = image.height;
  var ctx = canvasTmp.getContext("2d");
  ctx.drawImage(image, 0, 0);
  var dataURL = canvasTmp.toDataURL("image/png");
  communicate(dataURL)
}

setup();
