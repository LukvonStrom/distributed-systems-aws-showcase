const { Client } = require('@elastic/elasticsearch');
const { AmazonConnection, AmazonTransport } = require('aws-elasticsearch-connector');
const client = new Client({
    node: process.env.ELASTICSEARCH_DOMAIN, 
    apiVersion: '5.6',
    Connection: AmazonConnection,
    Transport: AmazonTransport
  });
const index = "test";

function clean(obj) {
    for (let propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj;
}

function cleaner(input) {
    let filtered_image = {}
    


    for (let key in input) {
        let cleanedDataType = clean(input[key])
        filtered_image[key] = Object.values(cleanedDataType)[0]
    }
    

    return filtered_image;
}


async function exists(id) {
    const { body } = await client.exists({
        index,
        id
    })
    return body;
}

function handleError(...results){
    let resultBuffer = [];
    for(let result of results){
        let acceptedStatusCodes = [200, 201]
        if(!acceptedStatusCodes.includes(result.statusCode) || result.warnings !== null){
                    console.error(result);
                    process.exit(1);
        }else if(result.hasOwnProperty('body')) {
            resultBuffer.push(result.body);
        }
    }
}

async function handle(event, context) {
    const items = event.Records;
    for (const l of items) {
        let body = JSON.parse(l.body);
        let filtered_image = cleaner(body['newImage']);
        let filtered_keys = cleaner(body['keys']);
        let filtered_old_image = cleaner(body['oldImage']);

        // Has keys in new image
        if (Object.keys(filtered_image).length > 0) {
            // creation
            if (Object.keys(filtered_old_image).length < 1 || !await exists(filtered_keys['id'])) {
                console.log(filtered_image);

                handleError(
                    await client.index({
                        index,
                        type: 'doc',
                        body: filtered_image
                    }),
                    await client.indices.refresh({ index })
                );
                
        
            } else {
                // update
                handleError(
                    await client.update({
                        index,
                        type: 'doc',
                        id: filtered_keys['id'],
                        body: filtered_image
                    }),
                    await client.indices.refresh({ index })
                )
                

                
            }
            
        }
    }
    return "Success!"


}

module.exports = {handle}