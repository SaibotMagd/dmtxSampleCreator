![Lin_X_NFDI4BIOIMAGE](data/icons/lin_x_nfdi4bioimage.png)

# dmtxSampleCreator

- browser extension: reads datamatrix code (not other kind of codes) from camera and either link to an already existing sample entry or create a sample in an inventory and paste the link into an text field in rspace ELN (for other ELN read [Roadmap](README.md#roadmap-priority-15)

## how to use

- edit a basic document
- open a iframe (i.e. regular custom field) inside the iframe
- mark the place where you want to insert the link with the cursor (blinking text cursor)
- click the "link sample" button in the top-left corner the browser camera should open in front of the ELN (camera connection maybe have to be allowed once)
- present datamatrix code in front of the camera (a sharp image is more important than the size of the code within the image)
- click the "record" button below the "link sample" button
- the link should be paste at cursor position
- the description of the pasted link clearly shows if it was a datamatrix code previously assigned to a sample or if it was just created
  [practical example](example/tutorial_example.md)

## dependencies (incomplete, use environment.yml for full list)

- Python >= 3.10
- Flask >= 2.2.2
- Fask-Cors >= 3.0.10
- requests >= 2.31.0
- pylibdmtx >= 0.1.10

## configuration/ secret file

- fill the api_secrets.example file and rename it to .json
  [api_secrets.example](/data/secrets/api_secrets.example)

## version history

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
- a lot of refactoring and restructuring

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

## current Roadmap/ TODO in no particular order ;) (Priority [1..5])

(TODO: create a mode to search for samples anywhere not only inside a document)

- **[5]**: speed up the decoding, it has not really gotten better with frontend decoding
- **[5]**: show an error texts if something unusal happen (especially a warning if the a user tried to add a link without being inside an iframe; connection issues)
- **[5]**: create a final server structure to be used instead of "non SSL flask development server"
- **[5]**: test the extension on the most likely end-user devices (modern android tablet, aged android smartphone, windows 11 ms surface; please do not ask for apple support, this will never exist, but could be blocked in the future for security reasons)
- **[4]**: add more customizations (edit the link text, insert eLabFTW API calls)
- **[3]**: improved comprehensibility of the interface (hover infos, more intuitve button images)
- **[3]**: add full eLabFTW support
- **[2]**: improve folder structure/ refactoring (especially use full HTML5 capacities not only javascript and CSS)
- **[2]**: add batch-scan possibility (**depends on user feedback, so this possible function will be re-evaluated after enduser-tests**)
- **[2]**: package the extension to use it as regular extension
- **[1]**: add button for switching cameras (for devices with front and back cameras, i.e. tablets or smartphones)

## pre-0.4 Roadmap/ TODO in no particular order ;) (Priority [1..5])

(TODO: create a mode to search for samples anywhere not only inside a document)

- **[5]**: speed up the decoding
- **[5]**: change the workflow so it scans for codes all the time and only close and insert after it found something (no more record button pressing)
- **[5]**: show an error texts if something unusal happen (especially a warning if the a user tried to add a link without being inside an iframe; no active iframe = nothing can be paste into an active iframe)
- **[5]**: use the userName transmitted from the client to create samples not the API username (in the final version samples will be created by the admin, so the created username should be the one who initiate the creation of the sample)
- **[5]**: add uniqueID of the current ELN document
- **[4]**: add a button to directly name the sample from extension interface
- **[4]:** show frame sent to server after pushing record button instead of the video stream (maybe show a frame surrounding the decoded matrix code)
- **[4]**: add customization support (edit the link text, insert eLabFTW API calls)
- **[4]**: create a final server structure to be used instead of "non SSL flask development server"
- **[3]**: improved comprehensibility of the interface (hover infos, open-close camera button, easier to understand record button)
- **[3]**: add eLabFTW support (full support)
- **[3]**: add an option to not use the "record button" to link a sample (instead scan every second and insert link after sucessful decoding)
- **[2]**: improve folder structure/ refactoring
- **[2]**: include another decoder to also decode other kind of codes like QR codes and barcodes
- **[2]**: add batch-scan possibility (function depends on user feedback)
- **[2]**: package the extension to use it as regular extension
- **[1]**: add button for switching cameras (for devices with front and back cameras, i.e. tablets or smartphones)
- **[1]**: show a progress/ waiting bar
