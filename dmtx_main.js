var activeElement; // globale Variable

function getActiveElement() {
  if (document.activeElement.tagName == "IFRAME" && activeElement != document.activeElement) {
    activeElement = document.activeElement; // aktives Element speichern
    console.log("new activeElement =", activeElement); // aktives Element ausgeben
    //range();
}}

function range(){
  let ranges = [];
  var iframeDoc = activeElement.contentDocument || activeElement.contentWindow.document; // iframe-Dokument auswählen
  sel = iframeDoc.getSelection();
  for(let i = 0; i < sel.rangeCount; i++) {
  ranges[i] = sel.getRangeAt(i);
  console.log(ranges[i])
}
}

setInterval(getActiveElement, 1000); // Funktion jede Sekunde aufrufen

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
          // mirror the camera image horizontal (dont do this for back camera!)
          video.style.transform = "scaleX(-1)";
          overlay.appendChild(video);

          var canvas = document.createElement("canvas");
          canvas.setAttribute("id", "canvas") 
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.hidden = true
          //var context = canvas.getContext('2d');
          //context.drawImage(video, 0, 0, canvas.width, canvas.height);
          //var dataURL = canvas.toDataURL('image/jpeg');  
          overlay.appendChild(canvas);
        })
        .catch(function(error) {
          console.log(error);
        });

        

    } else {
      overlay.style.display = "none";
      overlay.innerHTML = "";
      record.style.display = "none"
    }
  });

  record.addEventListener('click', async () => {     
    var docName = document.getElementById('recordNameInBreadcrumb').innerHTML
    var userName = document.getElementById('witnessDocumentDialog').innerHTML
    var sIndex = userName.indexOf("work performed by ")
    var eIndex = userName.indexOf(" at the time specified ")
    console.log(userName.substring(sIndex+18, eIndex))
    userName = userName.substring(sIndex+18, eIndex)

    var width = 600;
    var height = 800;
    
    var video = document.getElementById('player');
    var canvas = document.getElementById('canvas');
    //canvas.width = video.videoWidth;
    //canvas.height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);
    var dataURL = canvas.toDataURL('image/jpeg');  
    overlay.appendChild(canvas);
    // image seems to be created! console.log(dataURL);

    // Send the image to the server
    var xhr = new XMLHttpRequest();
    
    //change in https to use ssl (need to create a working certificate!)
    xhr.open('POST', 'http://127.0.0.1:5000/upload', true);            
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhrString = 'image=<dN>' + docName + '</dN>' + '<uN>' + userName + '</uN>'
    console.log(xhrString)
    xhr.send(xhrString + encodeURIComponent(dataURL));
    console.log("I'm here...: ", xhr);   
    // hide the video and show the frame instead till the server decoded the frame TODO: show frame its not working!    
    video.style.visibility = "hidden";
    
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {                                   
        var response = JSON.parse(xhr.responseText);
        console.log("Write to clipboard: ", response);
        if (!(Array.isArray(response))) {            
          var responseJson = response
          var keys = Object.keys(responseJson)
          console.log("decoded DM = ", keys);
          var decodeResult = keys[0];
          console.log("decoded rect_coord = ", responseJson[decodeResult][0]['rect_height']);
          slvlKeys = Object.keys(responseJson[decodeResult][0]);
          console.log("slvlKeys:", slvlKeys);
          console.log("sampleEntry ", (responseJson[decodeResult][0][slvlKeys[0]][0]));

          //secondlvl key name shows the whole name for the sample entry consisting of "decodedDatamatrixCode_nameOfOpenRspaceDocument_createdTimestamp"
          var sampleUrl = responseJson[decodeResult][0][slvlKeys[0]][0]["link"];          
          sampleUrl = sampleUrl.replace(/https?:\/\/[^\/]+/, "");
          if (responseJson[decodeResult][0][slvlKeys[0]][0]["newlyCreated"]) {
          linkText = `<p><a href="${sampleUrl}" target="_blank" rel="noopener">[new sample entry has just been created from datamatrix code:  ` + 
                    `${responseJson[decodeResult][0][slvlKeys[0]][0]["name"]}]</a></p>`
                  }
          else {
          linkText = `<p><a href="${sampleUrl}" target="_blank" rel="noopener">[datamatrix code ${keys[0]} was found under the sample name: ` + 
            `${responseJson[decodeResult][0][slvlKeys[0]][0]["name"]} ` + 
            `created: ${responseJson[decodeResult][0][slvlKeys[0]][0]["created"]} ` +
            `by user: ${responseJson[decodeResult][0][slvlKeys[0]][0]["createdBy"]}]</a></p>`
          }
                    console.log(linkText)

          // use this as placeholder
          //var text = "No new sample created";
          // use the whole response (have to be a string!, so a json element need to be formated first)
          // to send the whole json back to the server will be necessary to mark the code found onto the image
          var text = linkText;
          // example text: "<p><a href="/inventory/sample/65541">Newly created sample @timestamp, for Name, by Username, link: https://rstest.int.lin-magdeburg.de/inventory/sample/65541</a></p>"
          
          var iframeDoc = activeElement.contentDocument || activeElement.contentWindow.document; // iframe-Dokument auswählen
          var iframeBody = iframeDoc.body; // select body-Element of iframe-document
          var originalString = iframeBody.innerHTML; // read HTML-content of the iframes as string
          var selection = iframeDoc.getSelection(); // read current cursor position inside iframe
          /*           
          for(let i = 0; i < selection.rangeCount; i++) {                                
            console.log(i)              
            console.log("Current elementranges: ", selection.getRangeAt(i));                  
          }*/
          var range = selection.getRangeAt(0);
          var start = range.startOffset;
          console.log("Current relative Position: ", start);
          var absolutPos = start;
          if (range.startContainer == "text"){
            absolutPos += 3
          }
          
          var currElement = iframeDoc
            while (range.startContainer != "iframe" && currElement.parentNode != null){
              console.log("parent node: ", currElement.parentNode);                  
              currElement = currElement.parentNode;
              range = currElement.getRangeAt(0);
              absolutPos += range.startOffset;
            }
            console.log("absolut pos: ", absolutPos)
          
          var originalString = iframeBody.innerHTML; // HTML-Inhalt des iframes auslesen
          var newString = originalString.slice(0, absolutPos) + text + originalString.slice(absolutPos); // neuen String erstellen
          iframeBody.innerHTML = newString; // HTML-Inhalt des iframes setzen
          let keyboardEvent = new KeyboardEvent("keypress", {key: "U"});
          // Um das Ereignis an das iframeBody-Element zu senden
          iframeBody.dispatchEvent(keyboardEvent);         
        }        
            else {              
              console.log("nothing to be found!")             
              }
            }
      // close the camera
      let stream = video.srcObject;          
      let videoTracks = stream.getVideoTracks();          
      videoTracks.forEach(track => track.stop());
      button.click(); 
      } 
      /*
              
              console.log("I keystroked ${input}")
            };
        }};
    // send the current frame of the video stream to the webserver
    */
    
  });  