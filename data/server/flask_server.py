import os
from datetime import datetime
import cv2
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

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload():
    print("here I'm")    
    import sys
    print(request)
    request_data = request.get_json()
    print("the client sent: ", request_data)                         
    ## {'userName': 'gottschall01', 'docName': 'SJHP3 ELISA', 'uniqueId': 'SD546', 'decodedText': '210076'}

    if request_data['newSample'] == 0:
        sampleEntry = get_sample_data_from_barcode(request_data)

    ## create a dict consisting of the necessary infos from client
    if request_data['newSample'] == 1:    
        ## use the sampleParameter dict with docName, userName, barcode to create a new sample out of these infos
        r = set_new_sample(request_data)                
        sampleEntry = shape_result_dict({}, r, 1)           
    
    return sampleEntry

def get_sample_data_from_barcode(sampleParameter):
    elnName = sampleParameter['elnName']
    apiParams = get_secret_api_parameters(elnName)
    url = os.path.join(*[apiParams['apiUrl'], apiParams['apiInventoryPath'], apiParams['apiSearchFile']])
    headers = {"accept": "application/json", "apiKey": f"{apiParams['apiKey']}"}    
    
    ## create the search-json for searching in elabftw-database (~database)
    if elnName == 'elabftw':
        print("--> Doing it with elabftw! <---")
        api_client = get_elabftw_apiclient(apiParams)
        itemsApi = elabapi_python.ItemsApi(api_client)
        response = itemsApi.read_items()
        for r in response:
            if r.metadata == None: continue
            if r.metadata.rfind('"datamatrix_code": {"type": "text", "value": "1337",')) != -1:
                insertDict = reshape_request(r.to_dict(), apiParams, elnName)
    
    ## create the search-json for searching in rspace-inventory
    if elnName == 'rspace':
        queryHeaders = ["datamatrix code: ", "Scanned Unknown: ", "Scanned QR Code: "]
        insertDict = {}
        for i, queryHead in enumerate(queryHeaders):
            params = {"query": f"{queryHead}{sampleParameter['decodedText']}", "pageNumber": 0, "pageSize": 20, "orderBy": "name asc"}    
            print(params)
            ## send get call to server
            r = requests.get(url, params=params, headers=headers, verify=False)    
            r = r.json()    
            ## build a dict consisting all samples with he particular barcode in database
            insertDict = reshape_request(r, insertDict, elnName)            
        
    ## if no sample have been found send a 0 back to client to initiate the "ask for create sample frame" (sent the custom order of sample name back to the client; from secret.json file)
    ## return the same dictionary no matter if a sample was newly created or successfully found (see dict in shape_result_dict()
    if insertDict == {}:
        options = get_secret_api_parameters(type='options')
        return {'0': options['defaultSampleNameOrder']}    
    else: 
        return insertDict


## select if 
def reshape_request(r, insertDict, elnName="rspace"):  
    if elnName == 'elabftw':
        ## take the url from apiParams to create the link to the item
        link = os.path.join(insertDict['apiUrl'], 
        insertDict = {}
        insertDict = shape_result_dict(insertDict, r, 0, elnName) 
    if elnName == 'rspace':
    ## shape the resulted sample entry to decrease the data to be send to the client
    # should return the last record found with the particular dmtx number
        if r['totalHits'] > 0:
            for records in r["records"]:   
                print("I found an prior entry: ", records.keys()) 
                insertDict = shape_result_dict(insertDict, records, 0, elnName)                
    return insertDict    


def shape_result_dict(insertDict, records, newlyCreated, elnName="rspace"):
    if elnName == 'elabftw':
        insertDict.update({f"{records['id']}": [{
                        "name": records["name"],
                        "created": records["created"],
                        "createdBy": records["createdBy"],
                        "link": link,
                        "newlyCreated" : newlyCreated
                        }]
                })
    if elnName == 'rspace':
        ## create a small dict out of the whole sample result json
        # shape the link by delete the ["api","v1"] (& the "s" from sample) parts out of it, as the search/create json lacks the correct link 
        # (i.e. link provided by json: 'https://rstest.int.lin-magdeburg.de/api/inventory/v1/samples/98322' transformed to: 'https://rstest.int.lin-magdeburg.de/inventory/sample/98322')
        link = records["_links"][0]["link"]
        link = '/'.join(link.split('/')[:3] + ['inventory'] +['sample', str(records["id"])])
        insertDict.update({f"{records['globalId']}": [{
                                "name": records["name"],
                                "created": records["created"],
                                "createdBy": records["createdBy"],
                                "link": link,
                                "newlyCreated" : newlyCreated
                                }]
                        })
    return insertDict

def set_new_sample(sampleParameter, secrets_source='', elnName='rspace'):
    ## get the non-ELN specific parameters
    ## get the parameters for api connection
    apiParams = get_secret_api_parameters(type=elnName)
    ## get the options (see api_secrets.json)
    options = get_secret_api_parameters(type='options')
    

    ## do the ELN specific parts: ##
    if elnName == 'rspace':    
        import elabapi_python
        apiParams['category_id'] = get_category_id()
        api_client = get_elabftw_apiclient(apiParams)
        
    if elnName == 'rspace':
        url = os.path.join(*[apiParams['apiUrl'], apiParams['apiInventoryPath'], apiParams['apiSampleFile']])
        headers = {"accept": "application/json", "Content-Type": "application/json", "apiKey": f"{apiParams['apiKey']}"}    
        ## create the name of the new sample from options (see api_secrets.json)
        sampleName = ""
        for namePart in options['defaultSampleNameOrder']:
        ## create the json for sample creation in rspace
        ## Warning! If the description is changed, this newly created sample won't be found anymore get_sample_data_from_barcode() function 
        ## if changing is indeniable the whole history of description texts have to be added to list of queryHeaders in the get_sample_data_from_barcode() function
        ## this will increase the runtime of the code as it have to send a query for each of the possible descriptions in the queryHeader list
            if sampleName == "": 
                sampleName = sampleParameter[namePart]
                continue
            if namePart != 'timestamp':
                sampleName = sampleName + "_" + sampleParameter[namePart]
            else:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S") 
                sampleName = sampleName + "_" + timestamp
        ## the field "createdBy" is immutable (autofilled with user called the API)
        ## TODO: talk about if we could save the API keys for each user on server!? would we create the API keys without involving the user?
            params = {"name": sampleName, \
                    "barcodes": [{"data": f"{sampleParameter['decodedText']}", "description": f"datamatrix code: {sampleParameter['decodedText']}"}], \
                    "extraFields": [{ "name": "defaultELNconnection", "type": "text", "content" : sampleName}]
                }
                                          
    ## if a custom sample name is provided, overwrite the sampleName (the default Name will still be saved as extraField: defaultELNconnection for consistency)
    if 'customName' in sampleParameter:
        params['name'] = sampleParameter['customName']
    ## if a template Id is provided, create a sample depending on this template (i.e. 65540 as special sample template)
    if 'templateId' in sampleParameter:
        params['templateId'] = sampleParameter['templateId']
    ## send the create sample call to server    
    r = requests.post(url, headers=headers, verify=False, data=json.dumps(params))
    ## transform the response to json to get the sample entry    
    r = r.json()
    return r

    
## load the secret infos about the API connection from api_secrets.json
## source: location of the api_secrets.json file
## type: ["rspace", "elabftw", "options"]
def get_secret_api_parameters(type='rspace', source='../secrets/api_secrets.json'):
    with open(source) as f:    
        data = json.load(f)
        return data[type][0]
    return 0

def get_category_id(source='elabftw_category_id.json'):
    with open(source) as f:    
        data = json.load(f)
        print(f"--------- Category_Id (~item_type_id) = {data['id']}--------------")
        return data['id']
    return 0

def get_elabftw_apiclient(apiParams):
    #########################
    #         CONFIG        #
    #########################
    # replace with the URL of your instance
    API_HOST_URL = os.path.join(apiParams['apiUrl'],'api/v2')
    # replace with your api key
    API_KEY = apiParams['apiKey']
    #########################
    #      END CONFIG       #
    #########################

    # Configure the api client
    configuration = elabapi_python.Configuration()
    configuration.api_key['api_key'] = API_KEY
    configuration.api_key_prefix['api_key'] = 'Authorization'
    configuration.host = API_HOST_URL
    configuration.debug = False
    configuration.verify_ssl = False

    # create an instance of the API class
    api_client = elabapi_python.ApiClient(configuration)
    # fix issue with Authorization header not being properly set by the generated lib
    api_client.set_default_header(header_name='Authorization', header_value=API_KEY)
    return api_client

"""@app.before_request
def before_request():
    if not request.is_secure:
        url = request.url.replace("http://", "https://", 1)
        return redirect(url)
"""

if __name__ == '__main__':    
    #app.run(ssl_context=context, debug=True)
    app.run(debug=True)
