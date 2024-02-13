#!/usr/bin/env python

###############
# DESCRIPTION #
##############
# In this script, we will create a resource category and patch it
##############

import os
# the python library for elabftw
import elabapi_python
import json
from flask_server import get_secret_api_parameters

#########################
#         CONFIG        #
#########################
apiParams = get_secret_api_parameters(type='elabftw')
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

#### SCRIPT START ##################
def dump_dict_to_json(category_dict):
    with open('./elabftw_category_id.json', 'w', encoding='utf-8') as f:
        json.dump(category_dict, f, ensure_ascii=False, indent=4)

def post_dmtx_category(api_client): #aka item_type in elabftw
    # Load the items types api
    itemsTypesApi = elabapi_python.ItemsTypesApi(api_client)

    # create one, we provide a title on creation but it's not mandatory
    response = itemsTypesApi.post_items_types_with_http_info(body={'title': "My freshly created category"})
    # the response location for this endpoint is a bit different from the rest, it is the full URL: https://elab.example.org/api/v2/items_types/admin.php?tab=4&templateid=15
    locationHeaderInResponse = response[2].get('Location')
    # print(f'The newly created resource category is here: {locationHeaderInResponse}')
    itemId = int(locationHeaderInResponse.split('=').pop())
    # now change the title, and body and color
    """body = {'body': 'Use this category to save datamatrix_codes', 'color': '#f90f0f', \
    'metadata':  '{"extra_fields":{ \
    "username":{"type":"text","value":"saibotmagd","group_id":null,"required":true}, \
    "create_time":{"type":"text","1/6/2024 13:37":"","group_id":null,"required":true}, \
    "experiment_id":{"type":"text","2":"","group_id":null,"required":true}, \
    "datamatrix_code":{"type":"text","1337":"","group_id":null,"required":true,"description":"datamatrix code: "}, \
    "experiment_name":{"type":"text","I insert a sample tracking link":"","group_id":null,"required":true}}}', \
     'title': 'sample_tracking_real'}"""
    body = {'body': 'Use this category to save datamatrix_codes', 'color': '#f90f0f', \
    'metadata':  '{"extra_fields":{ \
    "username":{"type":"text","group_id":null,"required":true}, \
    "create_time":{"type":"text","group_id":null,"required":true}, \
    "experiment_id":{"type":"text","group_id":null,"required":true}, \
    "datamatrix_code":{"type":"text","group_id":null,"required":true,"description":"datamatrix code: "}, \
    "experiment_name":{"type":"text","group_id":null,"required":true}}}', \
     'title': 'sample_tracking_real'}
    response = itemsTypesApi.patch_items_type(itemId, body=body)
    print("I just created the category: ", response)
    return dump_dict_to_json(response.to_dict())
    
def check_if_exist_category(api_client):
    itemsTypesApi = elabapi_python.ItemsTypesApi(api_client)
    response = itemsTypesApi.read_items_types()
    for r in response:
        if r.title == 'sample_tracking_code' and r.color == 'f90f0f':
	        print("sample_tracking_code category has been found, won't be created")	    
	        dump_dict_to_json(r.to_dict())
	        return 1
    return post_dmtx_category(api_client)
	    	
if __name__ == '__main__':
    check_if_exist_category(api_client)
    

    
