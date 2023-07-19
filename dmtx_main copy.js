let context = canvas.getContext('2d');
let intervalId;
let drawInterval;
let activeElement; // global Variable

function getActiveElement() {  
  if (document.activeElement.tagName == "IFRAME") {  
    activeElement = document.activeElement; // aktives Element speichern
}}
setInterval(getActiveElement, 1000); // call function every second

button.addEventListener("click", function() {
  if (overlay.style.display === "none") {
    overlay.style.display = "block";    
    canvas.style.display = "block";
    
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      overlay.appendChild(canvas);     
      canvas.appendChild(video);  
      video.play();                
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      intervalId = setInterval(() => {        
        //canvas = RGB2Grey(canvas) // doesnt work yet
        const dataURL = canvas.toDataURL('image/jpeg', 1.0);
        sendToServer(dataURL);      
      }, 1000);
      /*let y = 0;
      drawInterval = setInterval(function() {    
        context.drawImage(video, 0, 0);  
        if (y <= canvas.height){y +=1}
        else {y = 0}    
        drawLine(y);                
        }, 100);*/
    });
    }
    else {
      stopCamera();
      clearInterval(intervalId)
      clearInterval(drawInterval)
  }}
  );

function sendToServer(dataURL) {
  let docName = document.getElementById('recordNameInBreadcrumb').innerHTML
  // scrap username from current page
  let userName = document.getElementById('witnessDocumentDialog').innerHTML
  let sIndex = userName.indexOf("work performed by ")
  let eIndex = userName.indexOf(" at the time specified ")
  //console.log(userName.substring(sIndex+18, eIndex))
  userName = userName.substring(sIndex+18, eIndex)
  let xhrString = 'image=<dN>' + docName + '</dN>' + '<uN>' + userName + '</uN>'

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://127.0.0.1:5000/upload', true);            
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');  
  xhr.onload = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      if (xhr.responseText != '0') {        
        clearInterval(intervalId);
        window.stop();
        getActiveElement();
        let iframeDoc = activeElement.contentDocument || activeElement.contentWindow.document; 
        let response = JSON.parse(xhr.responseText)
        console.log(response);
        pasteUrl(JSON.parse(xhr.responseText), iframeDoc);
        stopCamera();
        return;
      }
    }
    console.error(xhr.statusText);
  };
  xhr.send(xhrString + encodeURIComponent(dataURL));
}

function pasteUrl(response, iframeDoc) {
  // write sucessful decoding into innerHTML
  let responseJson = response
  let keys = Object.keys(responseJson)  
  let decodeResult = keys[0];  
  let slvlKeys = Object.keys(responseJson[decodeResult][0]);  
  console.log("sampleEntry ", (responseJson[decodeResult][0][slvlKeys[0]][0]));

  //secondlvl key name shows the whole name for the sample entry consisting of "decodedDatamatrixCode_nameOfOpenRspaceDocument_createdTimestamp"
  let sampleUrl = responseJson[decodeResult][0][slvlKeys[0]][0]["link"];          
  sampleUrl = sampleUrl.replace(/https?:\/\/[^\/]+/, "");
  if (responseJson[decodeResult][0][slvlKeys[0]][0]["newlyCreated"]) {
  var linkText = `<a href="${sampleUrl}" target="_blank" rel="noopener">[datamatrix code:  ` + 
            `${responseJson[decodeResult][0][slvlKeys[0]][0]["name"]} NEW created sample entry ` + 
            `created: ${responseJson[decodeResult][0][slvlKeys[0]][0]["created"]} ` +
            `by user: ${responseJson[decodeResult][0][slvlKeys[0]][0]["createdBy"]}]</a>`
          }
  else {
  var linkText = `<a href="${sampleUrl}" target="_blank" rel="noopener">[datamatrix code ${keys[0]} found sample name: ` + 
    `${responseJson[decodeResult][0][slvlKeys[0]][0]["name"]} ` + 
    `created: ${responseJson[decodeResult][0][slvlKeys[0]][0]["created"]} ` +
    `by user: ${responseJson[decodeResult][0][slvlKeys[0]][0]["createdBy"]}]</a>`
  }
  
  let iframeBody = iframeDoc.body; // select body-Element of iframe-document  
          
  console.log("activeElement post-content: " + ` ${activeElement} `)
  let selection = iframeDoc.getSelection(); // read current cursor position inside iframe          
  
  //console.log(selection)
  let range = selection.getRangeAt(0);
  let start = range.startOffset;
  
  // take one of 2 possible sources for data inside the element (with one is filled depends on the element class)
  let ogText = selection.anchorNode.data;                    
  if (!(typeof ogText === "string" || ogText instanceof String)) {
    ogText = selection.anchorNode.innerHTML;                    
    //console.log("took from innerText:", ogText)
  }
  // cut the prior text in iframe element to insert the link between it
  selection.anchorNode.parentElement.innerHTML = (ogText.slice(0,start) + ` ${linkText} ` + ogText.slice(start));          
  // hit a keypress afterwords because the rspace page doesn't recognize the change of innerHTML
  // the keypress force the rspace page to save the change in innerHTML
  let keyboardEvent = new KeyboardEvent("keypress", {key: "U"});        
  iframeBody.dispatchEvent(keyboardEvent);     
}

function stopCamera() {    
  // close the camera
  let video = document.getElementById("player")
  if (video){
  let streams = video.srcObject;        
  if (streams){
  let videoTracks = streams.getVideoTracks();          
  videoTracks.forEach(track => track.stop());
  }
  video.srcObject = null; 
  }
  overlay.style.display = "none";
  overlay.innerHTML = "";
  //record.style.display = "none"  
}

/* doesnt work
function RGB2Grey(input) {
  cnx.drawImage(input, 0 , 0);
  let width = input.width;
  let height = input.height;
  let imgPixels = cnx.getImageData(0, 0, width, height);

  for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
          let i = (y * 4) * width + x * 4;
          let avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
          imgPixels.data[i] = avg;
          imgPixels.data[i + 1] = avg;
          imgPixels.data[i + 2] = avg;
      }
  }
  return imgPixels}
*/

function drawLine(y) {
  // Draw line on the canvas
  context.beginPath();
  context.moveTo(0, y);
  context.lineTo(canvas.width, y);
  context.strokeStyle = 'red';
  context.stroke();
}


