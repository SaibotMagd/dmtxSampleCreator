![background](/sample/images/tutorial_background.jpg)
## create a new sample entry from physical code in rspace inventory and paste the link into a document

- the physical code isn't currently registered in the sample inventory (its completely empty)
  ![empty Inventory](/example/images/empty_inv.jpg)
- the "link sample" (top-left) button is only visible if it can be used on the current page
  ![empty ELN](/example/images/empty_ELN.jpg)
- the button opens the camera (**the user must allow the extension to use the camera once**) and put a physical code in front of the camera ![datamatrix code in front of camera](/example/images/dmtx_in_camera.jpg)
- after sucessful decoding an yellow textbox explains that this physical code has not yet been found in the sample inventory, 
- the user can either use the default sample name (*\[decodedText_ELN-documentName_ELN-document-uniqueID_ELN-document-creator-username_timestamp-at-creation]*) to create a new sample entry (grey letters in yellow dotted box) or choose a custom entry name
- the "thumbs up - insert button" pastes a description of the newly created sample and the link to the sample in the inventory at the text cursor position
  ![new created link in ELN](/example/images/pasted_new_sample.jpg.jpg)
- use the "abort button" if necessary
- a new sample has been created, the barcodes field on the right shows "datamatrix code: {datamatrix-code}" (marked in red) which indicates that this entry has been created from a physical datamatrix code ![new created entry in inventory](/example/images/new_sample_in_inventory.jpg)

## get the link of an already existing sample entry and paste the link into a document

- mark the position where the link should be insert
- open camera with the "link sample" button
- present an previous digital registered physical code to the camera
- check out the samples found for this code in the database ![check search results](/example/images/check_existing_sample.jpg)
- use the "insert button" button to insert a link to the sample in the inventory
  ![existing sample will be linked to document](/example/images/paste_existing_sample.jpg)
- use the "abort button" if necessary

## manually create a new sample entry in rspace inventory and paste the link into a document

- create a sample in rspace inventory (click "create" -> "sample")
- add a barcode to the sample (click the "+" and write the datamatrix-code string into the text field, or use the barcode scanner to do so)
- save the created sample
- **note** that the barcode label is now "Scanned Unknown: " because it was added by keystrokes not by scanning a code
  ![manual created sample in rspace inventory](/example/images/manual_created_sample_inv.jpg)
- go back to the document in the ELN and follow the steps to insert an already existing sample entry into an ELN document [insert sample](tutorial_example.md#get-the-link-of-an-already-existing-sample-entry-and-paste-the-link-into-a-document) 


## important notes

- the description of the link pasted in the document is different if the entry was created by the previously scanned code or if the code has already been existed and only a existing sample entry was called
  - that means when a code (**not** already registered in the sample inventory) is scanned twice in a row, it will insert two different entries in the ELN document
    - the first one shows the creation of the new sample entry.
    - the second shows that an entry already exists and has been found
    - both links lead to the same sample entry in the sample inventory
  - when a code (already registered in the sample inventory) is scanned twice in a row, it will insert two identical entries in the ELN document
- in the rspace inventory the barcode field indicates how a entry has been created
  - "datamatrix code: {datamatrix-code}" means it has been created by scanning a datamatrix code using the browser extension in the ELN
  - "Scanned Unknown: {datamatrix-code}" means it has been created manually inside rspace inventory either by printing the datamatrix code into the text field or scanning the code with a barcode scanner (it also creates keystrokes)
