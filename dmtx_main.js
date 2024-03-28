let activeElement; // save the above DOM Element as link-target
let html5Qrcode; // save the object constructed by html5qrcode class
let iframeDoc; // save the current iframe element as link-target
let savePos; // save the position inside the iframeDoc element to paste the link at a specific point

// check if activate ELN = elabFTW 
let elnType = 'rspace'; // set rspace as default ELN
let serverUrl = 'https://cni-wiki.int.lin-magdeburg.de/dmx2rspace/upload' // set rspace server IP to connect to the flask backend server
// check if the border of the button matches the color of elabFTW (see create_buttons.js where the border-color decides the ELN)
serverUrl = 'http://127.0.0.1:5000/upload'

try {
    if (document.getElementById('button').style.border.split("rgb")[1] === '(41, 174, 185)'){
      serverUrl = 'http://127.0.0.1:5000/upload'
      elnType = 'elabftw'; 
    console.log("I'm ftw");}
} catch(error){
    console.log("I'm in rspace!")
}

function pasteUrl(resPart, decodedText, iframeDoc) {
  let range = null;
  let pasteNode = null;

  function insertNode(iframeDoc, pasteNode) {
    try {
      range = iframeDoc.getSelection().getRangeAt(0);
      range.insertNode(pasteNode);
    } catch (e) {
      console.log("auto-iframe-search found: ", iframeDoc);
      console.log("the created link looks like: ", pasteNode)
      warningWindow();
      overlay.style.display = "none";
      try {
      iframeDoc.appendChild(pasteNode);      
    }
    catch (e){
      warningWindow();
    }
    }
  }

  function warningWindow() {  
    warningDiv.style.display = "block";    
  // Verstecke das Fenster nach 3 Sekunden
  setTimeout(() => {
    warningDiv.style.display = "none";
  }, 5000);

  }

  function getPasteNode(resPart, decodedText) {
    let pasteNode = decodedText;
    pasteNode += "_" + resPart.name + "_" + resPart.createdBy + "_" + resPart.created;
    console.log("res looks like", resPart)    
    pasteNode = createLink(resPart.link, pasteNode);
    return pasteNode
  }

  pasteNode = getPasteNode(resPart, decodedText);  
  insertNode(iframeDoc, pasteNode);

  // The keypress event forces the rspace page to save the change in innerHTML
  let keyboardEvent = new KeyboardEvent("keypress", { key: "U" });
  try {
    iframeDoc.body.dispatchEvent(keyboardEvent);
  } catch (e) {
    warningWindow();
    console.log("no dispatch event");
    overlay.style.display = "none";
  }
}

// create a link string
function createLink(linkValue, titleValue) {
  var a = document.createElement("a");
  a.innerHTML = " [" + titleValue + "] ";
  a.type = "link";
  a.href = linkValue;
  a.target = "_blank";
  return a
}

function getActiveElement() {    
  if (document.activeElement.tagName != "IFRAME") {    
    try {
    activeElement = document.getElementById("body_area_ifr").contentDocument.getElementById("tinymce");
    iframeDoc = activeElement.children[1];
    let start = 0;
    }
    catch(e) {console.log("you're in rspace!")}
    return}
  iframeDoc = document.activeElement.contentDocument;     
  let selection = iframeDoc.getSelection(); // read current cursor position inside iframe            
  //console.log(selection)
  let range = selection.getRangeAt(0);
  let start = range.startOffset;
  
  if (!activeElement) {
    activeElement = document.activeElement;
    return
  }    
  
    if (document.activeElement.tagName == "IFRAME" && start != savePos) {  
    //if (document.activeElement.tagName == "IFRAME" && activeElement.id != document.activeElement.id) {  
    activeElement = document.activeElement; // aktives Element speichern
    savePos = start;        
    console.log('i clicked at: ' + start)
    console.log(activeElement)
  
}}

setInterval(getActiveElement, 1000); // call function every second

abortButton.addEventListener("click", function(){
  toggle_elements();
  try {
  html5Qrcode.stop();
  }
  catch {}
  overlay.style.display = "none";
})

button.addEventListener("click", function() {
  if (overlay.style.display === "none") {
    // show overlay
    toggle_elements();    
    
    // for easier testing
    decodedText = "93370";
    sendToServer(decodedText);
    //

    html5Qrcode = new Html5Qrcode('reader');
    const qrCodeSucessCallback = (decodedText, decodedResult)=>{          
      if(decodedText){
        console.log("decoded: " + decodedText);
        html5Qrcode.stop();
        // send result to server            
        sendToServer(decodedText);          
        overlay.style.display = "none"; 
      }
    }  
    const config = {fps: 500, qrbox:{width: window.innerHeight*0.4, height: window.innerHeight*0.4}}
    html5Qrcode.start({facingMode:"environment"}, config, qrCodeSucessCallback, verbose= true );                
    
    }    
    else {
      try {
      html5Qrcode.stop()
      }
      catch {}
      overlay.style.display = "none";
    }
  });

function get_xhrString(srvResponse, customName, decodedText) {
  if (elnType === 'elabftw') return build_elabftw_xhrString(srvResponse, customName, decodedText);
  if (elnType === 'rspace') return build_rspace_xhrString(srvResponse, customName, decodedText);
}

function build_elabftw_xhrString(srvResponse, customName, decodedText){
  // get document name
  let docName = document.getElementById('title_input').value;
  // get username
  let userName = document.getElementById('import_modal_target')[document.getElementById('import_modal_target').length-1].text;
  // as in elabftw the username is splitted in ["nickname familyname"] you need to add it together
  userName = userName.replaceAll(" ", "_");
  // get the uniqueId for the experiment where to insert the sample link
  let uniqueId = document.querySelectorAll("a[title='View mode']")[0].href; 
  if (uniqueId.length>0) {uniqueId = uniqueId[uniqueId.search("id="),uniqueId.length-1]}
  // create a json to transfer per http
  let xhrString = {
                  'userName': userName,
                  'docName': docName,
                  'uniqueId': uniqueId,
                  'decodedText': decodedText,
                  'srvResponse': srvResponse,
                  'elnName': 'elabftw'
  }
  // insert a customName for the newly created sample
  if (customName != '') {xhrString['customName'] = customName}
  console.log("send to server: ", xhrString);
  return xhrString
  }

function build_rspace_xhrString(srvResponse, customName, decodedText){
  let docName = document.getElementById('recordNameInBreadcrumb').innerHTML;
  // scrap username from current page
  let userName = document.getElementById('witnessDocumentDialog').innerHTML;
  let sIndex = userName.indexOf("work performed by ");
  let eIndex = userName.indexOf(" at the time specified ");
  //console.log(userName.substring(sIndex+18, eIndex))
  userName = userName.substring(sIndex+18, eIndex);
  let uniqueId = document.getElementsByClassName("rs-global-id")[0].innerText;  
  uniqueId = uniqueId.trim().split(': ').pop();
  let xhrString = {
                  'userName': userName,
                  'docName': docName,
                  'uniqueId': uniqueId,
                  'decodedText': decodedText,
                  'srvResponse': srvResponse,
                  'elnName': 'rspace'
  }
  // insert a customName for the newly created sample
  if (customName != '') {xhrString['customName'] = customName}
  console.log("send to server: ", xhrString);
  return xhrString
  }

function sendToServer(decodedText, customName='') {
  let xhrString = get_xhrString(100, customName, decodedText);
  xhrString = JSON.stringify(xhrString);
  console.log("send to server: ", xhrString);
  const xhr = new XMLHttpRequest();
  //xhr.open('POST', 'https://cni-wiki.int.lin-magdeburg.de/dmx2rspace/upload', true);
  xhr.open('POST', serverUrl, true);            
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(xhrString);
  xhr.onload = () => {
    xhr.onload = null;
    if (xhr.readyState === 4 && xhr.status === 200) {      
      let response = JSON.parse(xhr.responseText);
      console.log("get from server: ", response);
      document.getElementById("reader").style.display = "none";
      // console.log("--> OG i got from server: " + response);
      if (Object.keys(response)[0] != '0') {                        
        console.log("I'm right!")
        let srvResponse = 100
        toggle_elements(srvResponse); //new sample = 0 i.e. something found so no "new sample" necessary
        window.stop();
        getActiveElement();
        //console.log("got an active Element: " + activeElement)        
        
        // show the decodedText sample entries from database in a resultField
        let resultField = document.getElementById("resultField");                
        let res = makeLinksClickable(response);
        let res2 = response[Object.keys(response)[0]];
        res = JSON.stringify(res, null, 4);                      
        resultField.innerHTML = res.replace(/,/g, ",<br />");
        resultField.contentEditable = "false";        
        // create the event for insertButton to insert the sample entries found for the decodedText
        let insertButton = document.getElementById("insertButton")
        // create a message for sucessful found sample
        // search if any of the items found in the database is trashed; if so don't insert this code 
        try{
          if (Object.values(response).flat().find(entry => entry.srvResponse === 101)['srvResponse'] === 101) {srvResponse = 101};}
        catch {console.log("no 101")}
        msgBoard.textContent = getUserMsg(decodedText, srvResponse, elnType)
        if (srvResponse == 101) {insertButton.style.display = "none"}
        insertButton.addEventListener("click", function() {  
          //insertButton.removeEventListener("click", arguments.callee);
          console.log("i got res from server: " + res);  
          if (elnType == 'elabftw') {
            console.log("i got json key element: " + res2)
            pasteUrl(res2[0], decodedText, iframeDoc);
          }
        if (elnType == 'rspace') {
          for (const responsePart in response){            
            console.log("res part: ", response[responsePart][0])
            pasteUrl(response[responsePart][0], decodedText, iframeDoc);            
          }
          overlay.style.display = "none";
        }          
        })

        return;
      }
      if (Object.keys(response)[0] == '0') {
        toggle_elements(0); //new sample = 1 i.e. nothing found create a new sample
        // get msg to print for unsucessful search for code in database
        // msgBoard.value = getUserMsg(decodedText, 0, elnType)
        msgBoard.textContent = getUserMsg(decodedText, 0, elnType)
        let inputField = document.getElementById("inputField")        
        let inputValue = get_defaultSampleName(JSON.parse(xhrString), response['0']);
        //console.log("inputValue: " + inputValue)
        inputField.value = inputValue;
        let insertButton = document.getElementById("insertButton")
        // create an event listener to insert a newly created link
        insertButton.addEventListener("click", function() {            
          insertButton.removeEventListener("click", arguments.callee);
          xhrString = get_xhrString(0, inputField.value, decodedText);
          xhrString = JSON.stringify(xhrString);
          const xhr = new XMLHttpRequest();
          //xhr.open('POST', 'https://cni-wiki.int.lin-magdeburg.de/dmx2rspace/upload', true);      
          xhr.open('POST', serverUrl, true);      
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(xhrString);
          xhr.onload = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText)
            for (const responsePart in response){
              console.log(response)
              pasteUrl(response[responsePart][0], decodedText, iframeDoc);
              //overlay.style.display = "none";
          } 
        }}
        })
    }
    }
    //console.error(xhr.statusText);
  }};
  

function get_defaultSampleName(xhrString, res){
  let defaultName = '';  
  console.log(typeof(xhrString))
  console.log(Object.keys(xhrString))
  for (let i in res) {        
    let date = new Date();
    if (res[i] == 'decodedText') {defaultName += xhrString["decodedText"];}
    if (res[i] == 'docName') {defaultName += xhrString['docName'];}
    if (res[i] == 'uniqueId') {defaultName += xhrString['uniqueId'];}
    if (res[i] == 'userName') {defaultName += xhrString['userName'];}
    if (res[i] == 'timestamp') {
      defaultName += `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      }
    defaultName += "_"      
    }
  defaultName = defaultName.substring(0, defaultName.length-1)
  return defaultName
}

// get string that will be pasted into the document
function get_pasteString(response, decodedText){  
  console.log("sampleEntry ", response);

  //secondlvl key name shows the whole name for the sample entry consisting of "decodedDatamatrixCode_nameOfOpenRspaceDocument_createdTimestamp"
  let sampleUrl = response['link'];          
  sampleUrl = sampleUrl.replace(/https?:\/\/[^\/]+/, "");
  if (response["srvResponse"] == 100) {
    var linkText = `<p><a href="${sampleUrl}" target="_blank" rel="noopener">[` + 
              `${response["name"]} NEW created sample ` + 
              `created: ${response["created"]} ` +
              `by user: ${response["createdBy"]}]</a></p>`
          }
  else {
    var linkText = `<p><a href="${sampleUrl}" target="_blank" rel="noopener">[${decodedText} found: ` + 
      `${response["name"]} ` + 
      `created: ${response["created"]} ` +
      `by user: ${response["createdBy"]}]</a><p>`
  }
  return linkText;
}

// choose the element to observe
const targetNode = document.getElementById('reader');

// what kind of changes should be tracked
const config = {childList: true};

// callback-function if this change happen
const callback = function(mutationsList, observer) {
    // Verarbeitung der Mutationen
    try {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          let scan = document.createElement("div")
          scan.setAttribute('id','scan')
          scan.className = 'scan';    
          let screen = document.createElement("div")
          screen.setAttribute('id','screen')
          screen.className = 'screen';
          let qsr = document.getElementById("reader").querySelector("#qr-shaded-region")
          qsr.appendChild(scan)
        }        
    }
    }
    catch {}
};

// create observer instance and start to observe
const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

function toggle_elements(srvResponse=404) {  
  // result Elements  
  // if camera is open none of the fields should be open
  // serverResponse codes:
  //    404: somethings not working
  //      0: no code found (e.g. can be created)
  //    100: code already in database (e.g. link(s) can be paste)
  //    101: code already in database but has been trashed (e.g. link(s) can't be paste or created as long as there're in trash)
  if (srvResponse == 404) {
    inputField.style.display = "none";  
    insertButton.style.display = "none";
    abortButton.style.display = "none";
    resultField.style.display = "none";  
  } 
  overlay.style.display = "block";
  
  if (srvResponse != 404) {
    msgBoard.style.visibility = "visible";   
    msgBoard.style.display = "block";
    insertButton.style.visibility = "visible";      
    insertButton.style.display = "block";
    abortButton.style.visibility = "visible";      
    abortButton.style.display = "block";  

    if (srvResponse == 0) {
      msgBoard.style.background = "rgb(255, 255, 0)"
      msgBoard.style.border = "5px solid rgb(255, 255, 0)";      
      inputField.value = "placeholder"
      inputField.style.visibility = "visible";  
      inputField.style.display = "block";     
    }
    if (srvResponse == 100) {
      console.log("toggle case 100")
      resultField.style.visibility = "visible"; 
      resultField.style.display = "block";
    }
    if (srvResponse == 101) {
      console.log("toggle case 101")      
      msgBoard.style.background = "rgb(255, 0, 0)";
      msgBoard.style.border = "5px solid rgb(255, 0, 0)";
      msgBoard.style.borderStyle = "dashed";
      resultField.style.visibility = "visible"; 
      resultField.style.display = "block";
    }        
}}

function makeLinksClickable(json) {
  const result = {};
  for (const [key, value] of Object.entries(json)) {
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item.link) {
          return {
            ...item,
            link: `<a href=${item.link} target="_blank">${item.link}</a>`,
          };
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }
  return result;
}
// create the message to be shown after searching the sample in inventory or database
function getUserMsg(decodedText, found, elnType) {        
  // build a msg
  let elnStr = elnType + " database"
  if (elnType != 'rspace') {
    let elnStr = elnType + " inventory"}      
  if (found == 100) {
    return `${decodedText} was found in the ${elnStr} `}
  if (found == 101) {
    return `WARNING!!! The code ${decodedText} is in the ${elnStr} , but had been moved to the trash. To insert it you remove it from trash first.`}
  return `${decodedText} is NOT in ${elnStr}, insert a name for the sample or accept the default value (in grey)`  
}

var barcode = "";
var interval;
document.addEventListener('keydown', function(evt) {
    if (interval)
        clearInterval(interval);
    if (evt.code == 'Enter') {
        if (barcode)
            handleBarcode(barcode);
        barcode = "";
        return;
    }
    if (evt.code != 'Shift')
        barcode += evt.key;
    interval = setInterval(() => barcode = "", 20);
});

function findObjectById(objDict, resToFind) {
  for (const key in objDict) {
      console.log(objDict[key].srvResponse)
      if (objDict[key].srvResponse === resToFind) {
          return objDict[key]; // Gibt das gesamte Objekt zurück
      }
  }
  return null; // Falls der Wert nicht gefunden wurde
}