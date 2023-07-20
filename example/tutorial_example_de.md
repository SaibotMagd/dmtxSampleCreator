![background](/sample/images/tutorial_background_dach.jpg)
## Erstellen eines neuen sample Eintrags für einen physischen Code im Rspace inventory und verknüpfen mit einem ELN Dokument ein.

- der physische Code ist derzeit nicht im sample inventory registriert (in diesem Beispiel ist dieses komplett leer) ![empty Inventory](/example/images/empty_inv.jpg)
- "Link Sample" (oben links) ist nur sichtbar, wenn sie auch auf der aktuellen Seite verwendet werden kann ![empty ELN](/example/images/empty_ELN.jpg)
- es öffnet sich die Kamera (**der Benutzer muss der Erweiterung einmal erlauben, die Kamera zu benutzen**) und es muss ein physischer Code dargebracht !![datamatrix code in front of camera](/example/images/dmtx_in_camera.jpg)
- nach erfolgreicher Dekodierung des codes zeigt ein gelbes Textfeld, dass dieser physische Code nicht im sample inventory gefunden wurde,
- der Benutzer kann nun entweder den Standard sample namen (*\[decodedText_ELN-documentName_ELN-document-uniqueID_ELN-document-creator-username_timestamp-at-creation]*) beibehalten (text in grau im gelb gepunkteten Feld) oder einen eigenen sample namen eingeben (die wichtigsten informationen zum sample werden unabhängig vom namen gespeichert)
- der "Daumen - insert button" fügt eine Beschreibung der neu erstellten Probe und den Link zur Probe im sample inventory an der Position des Textcursors ein ![Link zum neuen sample Eintrag im ELN](/example/images/pasted_new_sample.jpg.jpg)
- der "Abbrechen Button" schliesst die Camera (gleiche Funktion wie der "link sample" button)
- eine neue Probe wurde erstellt, das Barcode-Feld auf der rechten Seite zeigt "datamatrix code: {datamatrix-code}" (rot markiert), was bedeutet, dass dieser Eintrag aus einem physischen Datamatrix-Code erstellt wurde ![new created entry in inventory](/example/images/new_sample_in_inventory.jpg)

## suchen und einfügen eines Links zu einem bereits existierenden sample Eintrags

- markieren der Stelle, an der der Link eingefügt werden soll
- öffnen der Kamera mit der Schaltfläche "Link Sample".
- einen zuvor digital registrierten physischen Code vor der Kamera präsentieren
- das grüne Textfeld zeigt an das für diesen Code bereits Einträge vorhanden sind (d.h. es kann kein neuer sample Eintrag für diesen Code erstellt werden)
- Prüfen der Suchergebnisse für diesen code (einzelne Einträge können durch die Links im Ergebnisfeld aufgerufen werden) ![check search results](/example/images/check_existing_sample.jpg)
- der "insert button", fügt einen oder mehrere Link(s) zu den sample Einträgen des inventories einzufügen (Achtung! es werden alle gefundenen Einträge eingefügt) !![existing sample will be linked to document](/example/images/paste_existing_sample.jpg)

## Manuelles Erstellen eines neuen Probeneintrags im Rspace-Inventar und Einfügen des Links in ein Dokument

- zum manuellen Erstellen eines neuen samples im rspace inventory, "create" -> "sample"
- einfügen eines physischen codes, klicken auf das "+" und manuell einen Code in das Textfeld eingeben, oder den QRBarcode-Scanner verwenden)
- speichern des erstellten samples
  -**Achtung!, die Barcode-Beschriftung lautet nun "Scanned Unknown:", wenn sie durch Tastatureingaben und nicht durch Scannen eines Codes hinzugefügt wurde.
  ![manuell erstelltes Muster in rspace inventory](/example/images/manual_created_sample_inv.jpg)
- wechseln in ein Dokument im ELN und durchführen der Schritte zum Einfügen eines bereits vorhandenen Mustereintrags in ein ELN-Dokument wie zuvor beschrieben ([ suchen und einfügen eines Links zu einem bereits existierenden sample Eintrags](tutorial_example.md##suchen-und-einfügen-eines-links-zu-einem-bereits-existierenden-sample-Eintrags))

## Wichtige Hinweise

- die Beschreibung des in das Dokument eingefügten Links ist unterschiedlich, wenn der Eintrag durch den zuvor gescannten Code erstellt wurde oder wenn der Code bereits vorhanden war und deshalb ein bestehender sample Eintrag abgerufen wurde
- das bedeutet, wenn ein Code (der **nicht** bereits im Musterbestand registriert ist) zweimal hintereinander gescannt wird, werden zwei verschiedene Einträge in das ELN-Dokument eingefügt
  - der erste zeigt die Erstellung des neuen sample Eintrags an.
  - der zweite zeigt an, dass ein Eintrag bereits existiert und gefunden wurde
  - beide Links führen zum gleichen Eintrag im sample inventory
- wenn ein (bereits im sample inventory registrierter) Code zweimal hintereinander gescannt wird, werden zwei identische Einträge in das ELN-Dokument eingefügt
- Im Rspace-Inventar zeigt das Barcode-Feld an, wie ein Eintrag erstellt wurde
  - "Datamatrix-Code: {datamatrix-code}" bedeutet, dass der Eintrag automatisch durch Scannen eines physischen code mit der Browsererweiterung im ELN erstellt wurde
  - "Scanned Unknown: {datamatrix-code}" bedeutet, dass der Eintrag manuell im rspace inventory erstellt wurde
