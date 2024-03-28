![Lin_X_NFDI4BIOIMAGE](data/icons/lin_x_nfdi4bioimage.png)

# dmtxSampleCreator

__What is?__
 - its a browser extension connected to a flask-server backend (to do the API calls without bordering the user)
 - it reads datamatrix code (not other kind of codes) from camera or barcode scanner (soon!) 
 - can create a sample in the database or inventory of [rspace ELN](https://www.researchspace.com/) or [elabFTW](https://github.com/elabftw/elabftw) (support for other ELN's is work in progress, check out the [Roadmap](README.md#current-roadmap))
 - insert a link into an ELN document live inside the UI 
 - can link to an existing sample entry (created manually beforehand or automatically) 
 - rapid two click solution: "[one] to open the extension and the camera, scan code, [two] paste the link inside the document"
 - the minimum metadata to create a unique research sample is automatically read from the currently open document 

## how to use

- **Hint:** skip reading and check out the [step-by-step guide](example/tutorial_example.md) or the [Schritt-für-Schritt Anleitung](example/tutorial_example_de.md)
- open a basic electronic notebook document
- open the edit mode for an iframe (i.e. regular custom text field)
- set the text cursor where to insert the link(s) (blinking text cursor)
- click the "link sample" button (top-left corner), the browser camera should open in transparent overlay in front of the ELN (camera connection maybe have to be allowed once)
- present the code (any code supported from [html5-qrcode](https://github.com/mebjas/html5-qrcode)) in front of the camera till it recognize the code (size matters!)
- if a green text field pops up after decoding this code have been found in the database and the results will be shown below
  - the "thumb up - insert button" insert these search results as link(s) to the document
- if a yellow text field pops up after decoding, this code couldn't be found in the database and can be used to create a new sample entry connecting the current ELN document and the physical sample connected to the code
  - a custom sample name for the newly created sample can be insert into the yellow dotted line text field below
  - or use the already prefilled default sample name
  - the "thumb up - insert button" create a new sample entry and insert a link to the sample created into the document

## installation
- set server IP in dmtx_main.js file
- add extension to browser (only works in chromium browser)
- open a document (rspace) or experiment (elabFTW)

## dependencies (incomplete, use environment.yml for full list)

- Python >= 3.10
- Flask >= 2.2.2
- Flask-Cors >= 3.0.10
- requests >= 2.31.0

## configuration/ secret file

- fill the api_secrets.example file and rename it to "api_secrets.json"
  [api_secrets.example](/data/secrets/api_secrets.example.json)

## current Roadmap (3/28/24)

*List in no particular order ;) (Priority [1..5])*

- **[5]**: improve the scanspeed (e.g. shearing correction, image improvements); still work in progress, as it is decend
- **[5]**: show an error texts if something unusal happen (especially a warning if the a user tried to add a link without being inside an iframe (half-ready; but can be improved)
- **[4]**: add feature to use barcode hand scanner devices (function largely finished but the browser often swallows characters so that it is not reliable)
- **[4]**: add an offline modus (e.g. if there's no connection to the server, create a dummy entry and translate the dummy entries when reconnected to the server by creating or pasting links)
- **[3]**: prevent barcode entries from being deleted (DONE; deleting is impossible and trashing is now taken into account by also displaying trashed samples)
- **[3]**: since there are considerable problems with searching for tracking codes and processing them, especially in the database of elabFTW, there will be a 3rd possible mode "ELN-agnostic" in the future; this will not write to the internal database of rspace (rspace inventory) or elabFTW (elabFTW database) as before, but will use an LMIS system such as [openLMIS](https://hub.docker.com/u/openlmis/) 
- **[2]**: improve folder structure/ refactoring (especially use full HTML5 capacities not only javascript and CSS)
- **[2]**: create a mode to search for samples anywhere not only inside a document (e.g. without pasting the link into a frame just for clicking on inventory link)
- **[1]**: add button for switching cameras (for devices with front and back cameras, i.e. tablets or smartphones)
- **[1]**: improved the interface (e.g. hover infos, more intuitve button images, increase visability on touchscreens)
- **[-]**: add batch-scan feature (**depends on user feedback, so this possible function will be re-evaluated after enduser-tests**)
- **[-]**: if multiple samples are found for a code, allow only one of the samples to be linked into the text (**conceptual question if such a function should be allowed for sample tracking, as a code should only be used for one sample object; there might be scenarios where this makes sense, on the other hand a double use of a code indicates an error in the database; will be discussed after user feedback**)

## version history

### 0.7
- the user or server host does not have to specify whether rspace or elabftw is used, as the client recognizes this information itself and transmits it to the server (the user can tell which ELN has been detected by the color of the frame around the sample tracking extension icon; the color corresponds to the main color of the respective ELN)
- elabftw API package isn't mandatory anymore for non-elabFTW users
- added a new warning window if a correct link cannot be inserted (especially if no position for insertion was specified or could be recognized automatically)
- new handling of trashed samples (deletion is impossible) in the inventory of rspace, these are now found and it is displayed that the searched sample tracking code is in the trash; these samples cannot be overwritten or inserted as long as they have not been restored from the trash; this is to prevent the codes from being overwritten or used several times for different samples
- to handle errors and access problems better in the future, the variable "newSample" was removed and replaced by a kind of error code called "srvResponse"; this currently has 4 possible values 
  - "0: no sample code found, 
  - 100: sample tracking code found, can be entered; 
  - 101: sample tracking code found in trash, cannot be entered; 
  - 404: server  communication error"

### 0.6
- first working version for elabftw but with some drawbacks:
  1. you need to set a category to save the sample codes into the database; you can automate this by running: elabftw_item_category_check.py -> it creates the necessary category and write mandatory category_id into a json file: elabftw_category_id.json so the sample creator can find it
  2. you need the "elabftw_python" package -> "pip install elabftw_python"
  3. it only works if elabftw uses the "hypernext" version, not a final version like 4.9.0 because of browser camera policy  
  4. largest drawback: as the elabftw api doesn't provide a "search for content" function; I had to get all items every created and search for the code in all of the items; in the medium term, this will lead to the search time increasing more and more until it leads to a timeout. i will try to find out the exact time so that the database can possibly be cleaned beforehand. if no better api database access can be made possible, it will probably be indispensable to access the database directly, which represents a major security risk.
- barcode handscanner functionality doesn't work yet in chromium, so firefox is necessary (but other features doesn't work in firefox...)

### 0.5 
- changed to the current state of the art manifest version 3
- package the extension as .crx file (now runable without developer mode, e.g. allow for automatic distribution)
- sucessfully tested on android 12 tablet, windows 10, windows 11 surface
- implemented the flask backend as productive use server

### 0.4

- user experience made more interactive and flexible

  - change from "click to scan code" to "continuous scan until a code is found" (a blue "wandering bar" indicates the scan process, it should improve the user experience that the scan works)
  - new feature: search for a previously created sample with direct link to the search result
  - new feature: insert a custom sample name right at the time of creating a new sample entry
    - the default samplename is now additionally stored in an extra field (defaultELNconnection) to protect the user from losing the important information about the connection of the ELN document to the sample tracking system
    - i.e. default sample name: *Qrcode-decodedText_ELN-documentName_ELN-document-uniqueID_ELN-document-creator-username_timestamp-at-creation*
    - **Remember the basic idea of sample tracking! "each sample must be linked to a protocol describing its creation"**
  - two new buttons only visible after sucessful decoding: **insert button** (insert link(s) to current text cursor) & **abort button** (close camera, abort sample creation, delete search results)
  - created a new coloured message field at the top to distinguish more quickly between the three possible search results:
    - **green** (the decoded code has already been entered in the database, check out the found entries listed below)
    - **yellow** (the decoded code could not be found in the database, an entry for it can be created after entering a sample name)
    - **red** (TODO: some error messages)
- switch from backend to frontend decoding

  - previously backend decoding ([pylibdmtx](https://pypi.org/project/pylibdmtx)) was used now the more common frontend decoding (javascript based in-browser) with HTML5qrcode ([html5-qrcode](https://github.com/mebjas/html5-qrcode)) is used,
  - BUT this solution is often slower (because of worse segmentation algorithm), have issues with smaller codes and some "unusal structured" codes (see TODO [Roadmap](README.md#roadmap-priority-15))
  - since HTML5Qrcode support a lot of different codes it now can use mostly every code exist (i.e. QRcode, barcode, datamatrix etc.)
  - no more privacy issues as no image is stored or leaves the local computer
- added a german translation of the "step-by-step tutorial"
- a lot of refactoring, restructuring of the sourcecode and changes of the roadmap priorities

### 0.3

- use greyscale images to decrease the imagesize send to the server, it also speeds up the decoding
- bugfix: deactivate camera after click on "link sample" button and after insert a link to the ELN (no matter independend of sucess)
- known Bug: impossible to insert multiple links into an empty field without saving between inserts

### 0.2

- bugfix: it now should read the cursor position (the correct cursor position should now be found and the link in the exact place (before and after blank characters are inserted & the link is always in its own line, because it is very long)
- updated roadmap

### 0.1

- first full working version (public release)
- known bug: it doesn't read the cursor position precise enough, so better to use at the end or the beginning of a field
- known bug: if a datamatrix code is being used more then once it only paste the link to the first entry found (what should happen if there's more then one entry connected to one datamatrix code? paste all codes? even if there're plenty?)

