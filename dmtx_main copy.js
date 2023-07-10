let intervalId = null;
let activeElement; // globale Variable

function getActiveElement() {  
  //if (document.activeElement.tagName == "IFRAME" && activeElement != document.activeElement) {
  if (document.activeElement.tagName == "IFRAME") {
    activeElement = document.activeElement; // aktives Element speichern
    //console.log("new activeElement =", activeElement); // aktives Element ausgeben
    //range();
  // find tinyMCE element  
  /*
  let activeEl = document.activeElement;
  
  let iframeDoc = activeEl.contentDocument || activeEl.contentWindow.document; 
  if (activeEl.nodeName == "IFRAME" && iframeDoc.body.id.indexOf("tinymce") > -1) {
    activeElement = activeEl;
    console.log(activeEl.id);    
    console.log(iframeDoc.body.getAttribute('data-id')); //this works
    let selection = iframeDoc.getSelection();
    //console.log(selection.attributes)
    //console.log(selection.getHtml());
    
    
  }
  else {
    console.log(activeEl.body)
    console.log(activeEl.id.indexOf)
    console.log(activeEl.nodeName)
    console.log(activeEl)
  }*/
}}
setInterval(getActiveElement, 1000); // call function every second

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
}

function drawLine(canvas, y) {
  let context = canvas.getContext('2d');
  context.beginPath();
  context.moveTo(0, y);
  context.lineTo(canvas.width, y);
  context.stroke();
}

function scan() {
  let canvas = document.getElementById('canvas')
  let y = 0;
  const scanInterval = setInterval(() => {
    drawLine(canvas, y);
    y += 1;
    if (y >= canvas.height) {
      clearInterval(scanInterval);
    }
  }, 10);
}

button.addEventListener("click", function() {
    if (overlay.style.display === "none") {
      overlay.style.display = "block";
      record.style.display = "block";

      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
          let video = document.getElementById("player");
          if (!video){
            video = document.createElement("video");
            video.setAttribute("id", "player")
          }
          video.srcObject = stream;          
          video.autoplay = true;
          video.style.width = "100%";
          video.style.height = "100%";          
          // mirror the camera image horizontal (dont do this for back camera!; maybe set a switch)
          video.style.transform = "scaleX(-1)";
          overlay.appendChild(video);

          let canvas = document.createElement("canvas");
          canvas.setAttribute("id", "canvas") 
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.hidden = true
          overlay.appendChild(canvas);
          
          // show scanline
          video.onplay = () => {
            video.play();
            scan();
          };
        // postImageToServer(canvas); //ONCE        
        })
        .catch(function(error) {
          console.log(error);
        });
    // start sending images to server
    postImagesToServerAndWaitForResponse(); // trice
    } else {
      stopCamera();
      clearInterval(intervalId)
    }
  });

  //record.addEventListener('click', async () => {     
function postImageToServer(canvas) {           
  let docName = document.getElementById('recordNameInBreadcrumb').innerHTML
  // scrap username from current page
  let userName = document.getElementById('witnessDocumentDialog').innerHTML
  let sIndex = userName.indexOf("work performed by ")
  let eIndex = userName.indexOf(" at the time specified ")
  //console.log(userName.substring(sIndex+18, eIndex))
  userName = userName.substring(sIndex+18, eIndex)

  let width = 600;
  let height = 800;
  
  let video = document.getElementById('player');
  //let canvas = document.getElementById('canvas');  
  try {
  canvas.width = width;
  canvas.height = height;
  }
  catch(e){
    console.log("typeError again!")
  }
  let context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);
  
  // transform image data to grey
  let imageData = context.getImageData(0, 0, canvas.width, canvas.height);     
  let data = imageData.data; 
  for (let i = 0; i < data.length; i += 4) {       
    let brightness = (data[i] + data[i+1] + data[i+2]) / 3;       
    data[i] = brightness; 
    data[i+1] = brightness; 
    data[i+2] = brightness; }       
    context.putImageData(imageData, 0, 0);
  
  let dataURL = canvas.toDataURL('image/jpeg');  
  //overlay.appendChild(canvas);

  // Send the image to the server
  let xhr = new XMLHttpRequest();
  
  //change in https to use ssl (need to create a working certificate!)
  xhr.open('POST', 'http://127.0.0.1:5000/upload', true);            
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  let xhrString = 'image=<dN>' + docName + '</dN>' + '<uN>' + userName + '</uN>'
  //console.log(xhrString)
  xhr.send(xhrString + encodeURIComponent(dataURL));
  //console.log("I'm here...: ", xhr);   
  // hide the video and show the frame instead till the server decoded the frame TODO: show frame its not working!    
  //video.style.visibility = "hidden";
    
  let alreadyExecuted = false;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {                                   
      let response = JSON.parse(xhr.responseText);      
      console.log("Write to clipboard: ", response);
      if (!(Array.isArray(response)) && !alreadyExecuted) {                            
        
        /*
        // deactivate camera after sucessful decoding        
        alreadyExecuted = true;
        // deactivate onreadystatechange function
        xhr.onreadystatechange = null;   
        getActiveElement();
        let iframeDoc = activeElement.contentDocument || activeElement.contentWindow.document; 
        pasteUrl(response, iframeDoc)
        stopCamera();
        clearInterval(intervalId);
        return 1
        }
      }        
          else {                          
            console.log("nothing to be found!")
            return 0             
            }
        return 0}    
  };

  //);  // part of the "on click function"
  function pasteUrl(response, iframeDoc) {
    // write sucessful decoding into innerHTML
    let responseJson = response
    let keys = Object.keys(responseJson)
    //console.log("decoded DM = ", keys);
    let decodeResult = keys[0];
    //console.log("decoded rect_coord = ", responseJson[decodeResult][0]['rect_height']);
    let slvlKeys = Object.keys(responseJson[decodeResult][0]);
    //console.log("slvlKeys:", slvlKeys);
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
              //console.log("I paste: ", linkText)
    
    let iframeBody = iframeDoc.body; // select body-Element of iframe-document
    //let originalString = iframeBody.innerHTML; // read HTML-content of the iframes as string
            
    console.log("activeElement post-content: " + ` ${activeElement} `)
    let selection = iframeDoc.getSelection(); // read current cursor position inside iframe          
    
    //console.log(selection)
    let range = selection.getRangeAt(0);
    let start = range.startOffset;
    
    // take one of 2 possible sources for data inside the element (with one is filled depends on the element class)
    let ogText = selection.anchorNode.data;                    
    //console.log("took from data:", ogText)
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
  }*/
      
}}}}

function stopCamera() {    
    // close the camera
    let video = document.getElementById("player")
    if (video){
    let stream = video.srcObject;        
    let videoTracks = stream.getVideoTracks();          
    videoTracks.forEach(track => track.stop());
    video.srcObject = null; 
    }
    overlay.style.display = "none";
    overlay.innerHTML = "";
    record.style.display = "none"  
}

function postTimeouted() {
  intervalId = setInterval(function() {
    postImagesToServerAndWaitForResponse();    
  }, 1000);
}

async function postImagesToServerAndWaitForResponse(canvas) {
  let goodResult = false;
  while (!goodResult) {
    let canvas = document.getElementById("canvas")
    const promises = [postImageToServer(canvas), postImageToServer(canvas), postImageToServer(canvas)];
    const results = await Promise.all(promises);
    if (results.includes('1')) {
      console.log('At least one result is good!');
      goodResult = true;
      stopCamera()
    } else {
      console.log('No good results. Trying again...');
    }
  }
}

