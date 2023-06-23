## create a new sample entry from datamatrix code in rspace inventory and paste the link into a document
- as you can see the inventory is completely empty
![empty Inventory](/example/images/empty_inv.png)
- the "link sample" (top-left) button is only visible if it can also be used
![empty ELN](/example/images/empty_ELN.png)
- the button opens the camera (allow to use it!) and shows a "record" button below the "link sample" button
- put a datamatrix code in front of the camera
![datamatrix code in front of camera](/example/images/dmtx_in_camera.png)
- the "record" button capture an frame from the camera and send it to the local server to decode the datamatrix code into a string
- it creates a new sample
- pastes a description of the newly created sample and the link to the sample in the inventory at the cursor position
![new created link in ELN](/example/images/new_sample_in_inventory.png)
- the sample is created in the inventory using a default name of \[{datamatrix-code}_{documentName}_{userName}_{Timestamp}\] 
- the description is "datamatrix code: {datamatrix-code}" which indicates that this entry has been created from a legit datamatrix code

## get the link of an already existing sample entry and paste the link into a document
- mark the position where the link should be paste
- open camera with the "link sample" button
- present a already existing datamatrix code 
- use the "record" button to decode the datamatrix code
![existing sample will be linked to document](/example/images/paste_existing_sample.png)

## manually create a new sample entry in rspace inventory and paste the link into a document
- create a sample in rspace inventory (click "create" -> "sample")
- add a barcode to the sample (click the "+" and write the datamatrix-code string into the text field, or use the barcode scanner to do so)
- save the created sample
- **note** that the barcode label is now "Scanned Unknown: " because it was added by keystrokes not by scanning a code
![manual created sample in rspace inventory](/example/images/manual_created_sample_inv.png)
- mark the position where the link should be paste
- open camera with the "link sample" button
- present a already existing datamatrix code 
- use the "record" button to decode the datamatrix code
![existing manual created sample will be linked to document](/example/images/paste_existing_manual_created_sample.png)

## important note
- the description of the link pasted in the document is different if the entry was created by the previously scanned code or if the code already existed and only a sample entry was called
  - that means that means if you scan a new datamatrix code twice in a row you will get two different entries in the ELN 
  - the first one shows the creation of the new sample entry. 
  - the second shows that an entry already exists and has been found 
  - both links lead to the same sample entry in the inventory
- in the rspace inventory the barcode field indicates how a entry has been created 
  - "datamatrix code: {datamatrix-code}" means it has been created by scanning a datamatrix code using the browser extension in the ELN
  - "Scanned Unknown: {datamatrix-code}" means it has been created manually inside rspace inventory either by printing the datamatrix code into the text field or scanning the code with a barcode scanner (it also creates keystrokes)