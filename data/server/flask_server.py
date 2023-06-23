import os
from datetime import datetime
from rspace_client.inv import inv
from rspace_client.eln import eln
import rspace_client
import cv2
from pylibdmtx.pylibdmtx import decode
## need: sudo apt-get install -y libdmtx-dev
import argparse
from flask import Flask, redirect, request, jsonify
from flask_cors import CORS
import requests
import numpy as np
import base64
import json
import ssl
#context = ssl.SSLContext(ssl.PROTOCOL_TLS)
#context.load_cert_chain('127.0.0.1.pem', '127.0.0.1-key.pem')

globalResult = []

def base64_to_image(base64_string):
    imgdata = base64.b64decode(base64_string)    
    #image = np.frombuffer(imgdata)
    image = np.array(bytearray(imgdata), dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image

def decode_list_to_dict(decsList):
    decDict = {}
    if len(decsList) > 1:
        for i, decList in enumerate(decsList):                                
            decDict.update({decsList[0].data.decode('utf-8'):
                            {'data': decList.data.decode('utf-8'), 
                            'rect_left': decList.rect.left,
                            'rect_top': decList.rect.top,
                            'rect_width': decList.rect.width,
                            'rect_height': decList.rect.height
                            }
                            })
    else:
        decDict.update({decsList[0].data.decode('utf-8'):{ 
                            'rect_left': decsList[0].rect.left,
                            'rect_top': decsList[0].rect.top,
                            'rect_width': decsList[0].rect.width,
                            'rect_height': decsList[0].rect.height                            
                            }
                            })
    return decDict

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload():
    
    import sys
    ## save the image send to server, from client into image variable
    image = request.form['image']

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")      
    #print(f"Here I'm: {timestamp}")
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")      
    print(f"The size of the transfered image is: {sys.getsizeof(image)}, {timestamp}")
    ## find and save the documentName of the current open document in the ELN (will be used as default sampleName)
    pos = [image.find("<dN>"), image.find("</dN>")]
    docName = image[pos[0]+4:pos[1]]
    pos = [image.find("<uN>"), image.find("</uN>")]
    userName = image[pos[0]+4:pos[1]]    
    image = base64_to_image(image[pos[1]+27:]) 
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")      
    print(f"docName: {docName} & userName: {userName} at {timestamp} from client")
    
    ## just to test the pipeline without using a webcam!!
    #image = cv2.imread('/home/cni-adult/NFDI-coding/dmxCampage/images/single_dmx_example_small.jpg')
    #image = cv2.imread('/home/cni-adult/NFDI-coding/dmxCampage/images/multi_dmx_example_small.jpg')

    ## decode the image consisting datamatrixes into decode object
    decodeResult = decode(image)
    
    ## for testing set empty result
    #result = []

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")      
    print(f"Decode result: {decodeResult}, {timestamp}")
    
    #build a result dictionary and code it as json to send back to client       
    if decodeResult != []:        
        decodeResult = decode_list_to_dict(decodeResult)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")      
        #print(f"Non empty result: {decodeResult}, {timestamp}")
        
        ## todo: implement a batch process
        """for key in list(result.keys()):
            print(f"I set barcode nr: {key}")        """

        ## create a dict consisting of the necessary infos from client
        sampleParameter = {'docName': docName,
                   'createdBy': userName,
                   'barcode': list(decodeResult.keys())[0]}

        sampleEntry = get_sample_data_from_barcode(sampleParameter)

        joinResults = {} # create an empty dictionary
        for key in decodeResult: # iterate over the keys of test
            joinResults[key] = [decodeResult[key]] # assign the value of test[key] as a list to end[key]
        for subkey in sampleEntry: # iterate over the keys of best
            joinResults[key][0][subkey] = sampleEntry[subkey] # assign the value of best[subkey] to end[key][0][subkey]                

        ## its the better way to send the whole json so the finding(s) can be mark on the image in the browser
        return joinResults
    else:    
        return []      

def get_sample_data_from_barcode(sampleParameter, elnName='rspace'):
    apiParams = (get_hidden_api_parameters())
    url = os.path.join(*[apiParams['apiUrl'], apiParams['apiInventoryPath'], apiParams['apiSearchFile']])
    headers = {"accept": "application/json", "apiKey": f"{apiParams['apiKey']}"}    
    
    ## create the search-json for searching in rspace-inventory
    if elnName == 'rspace':
        queryHeaders = ["datamatrix code: ", "Scanned Unknown: "]
        for i, queryHead in enumerate(queryHeaders):
            params = {"query": f"{queryHead}{sampleParameter['barcode']}", "pageNumber": 0, "pageSize": 20, "orderBy": "name asc"}    
            print(params)
            ## send get call to server
            r = requests.get(url, params=params, headers=headers, verify=False)    
            r = r.json()    
            ## create a new sample if the current barcode isn't already in the database
            if r['totalHits'] == 0:     
                ## if not all queryHeaders being checked, continue using the next one
                if i != len(queryHeaders)-1:
                    continue
                ## use the sampleParameter dict with docName, userName, barcode to create a new sample out of these infos
                r = set_new_sample(sampleParameter, elnName='rspace')        
                insertDict = {}
                insertDict = shape_result_dict(insertDict, r, 1)   
                return insertDict                 
            ## shape the resulted sample entry to decrease the data to be send to the client
            if r['totalHits'] > 0:
                insertDict = {}
                for records in r["records"]:   
                    print("I found an prior entry: ", records) 
                    insertDict = shape_result_dict(insertDict, records, 0)                
                return insertDict
    ## return the same dictionary no matter if a sample was newly created or successfully found (keys: ['globalId': ['created', 'createdBy', 'link', 'newlyCreated'])
    

def shape_result_dict(insertDict, records, newlyCreated):
    ## create a small dict out of the whole sample result json
    # shape the link by delete the ["api","v1"] (& the "s" from sample) parts out of it, as the search/create json lacks the correct link 
    # (i.e. link provided by json: 'https://rstest.int.lin-magdeburg.de/api/inventory/v1/samples/98322' transformed to: 'https://rstest.int.lin-magdeburg.de/inventory/sample/98322')
    link = records["_links"][0]["link"]
    link = '/'.join(link.split('/')[:3] + ['inventory'] +['sample', link.split('/')[-1]])
    insertDict.update({f"{records['globalId']}": [{
                            "name": records["name"],
                            "created": records["created"],
                            "createdBy": records["createdBy"],
                            "link": link,
                            "newlyCreated" : newlyCreated
        }]
                    })
    return insertDict

def set_new_sample(sampleParameter, elnName='rspace'):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
    apiParams = (get_hidden_api_parameters())
    url = os.path.join(*[apiParams['apiUrl'], apiParams['apiInventoryPath'], apiParams['apiSampleFile']])
    headers = {"accept": "application/json", "Content-Type": "application/json", "apiKey": f"{apiParams['apiKey']}"}    

    if elnName == 'rspace':
        ## create the json for sample creation in rspace
        params = {"name": f"{sampleParameter['barcode']}_{sampleParameter['docName']}_{sampleParameter['createdBy']}_{timestamp}", \
                    "templateId": "65540", \
                    "barcodes": [{"data": f"{sampleParameter['barcode']}", "description": f"datamatrix code: {sampleParameter['barcode']}"}] \
                }
    
    ## send the create sample call to server    
    r = requests.post(url, headers=headers, verify=False, data=json.dumps(params))
    ## transform the response to json to get the sample entry    
    r = r.json()
    return r

    
def get_hidden_api_parameters(elnName='rspace'):
    if elnName == 'rspace':
        with open("../secrets/api_secrets.json") as f:
            data = json.load(f)
            return data[elnName][0]
    return 0

"""@app.before_request
def before_request():
    if not request.is_secure:
        url = request.url.replace("http://", "https://", 1)
        return redirect(url)
"""

if __name__ == '__main__':    
    #app.run(ssl_context=context, debug=True)
    app.run(debug=True)