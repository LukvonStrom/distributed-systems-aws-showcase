const { Client } = require('@elastic/elasticsearch');
process.env.ELASTICSEARCH_DOMAIN = "https://search-es-domain-test-osi5owgcewhpekvlikeygsu23m.eu-central-1.es.amazonaws.com/"
const client = new Client({ node: process.env.ELASTICSEARCH_DOMAIN, apiVersion: '5.6' });
const index = "test";

function clean(obj) {
    for (let propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj;
}

function cleaner(input){
    let filtered_image = {}

    for (let key in input){
        let cleanedDataType = clean(input[key])
        filtered_image[key] = Object.values(cleanedDataType)[0]
    }

    return filtered_image;
}


async function exists(id){
    const { body } = await client.exists({
        index: 'game-of-thrones',
        id
    })
}

async function handle(event, context){
    let filtered_image = cleaner(event['newImage']);
    let filtered_keys = cleaner(event['keys']);
    let filtered_old_image = cleaner(event['oldImage']);

    // Hat Keys im neuen "Object"
    if(Object.keys(filtered_image).length > 0){
        // Neuerstellung
        if(Object.keys(filtered_old_image).length < 1 || !await exists(filtered_keys['id'])){
            console.log(filtered_image);

            await client.index({
                index,
                type: 'doc',
                body: filtered_image
            });


            await client.indices.refresh({ index })
        }else{
            // Update
            await client.update({
                index,
                type: 'doc',
                id: filtered_keys['id'],
                body: filtered_image
            })

            await client.indices.refresh({ index })
        }


    // löschen
    }

}

handle({"approximateCreationDateTime":1582119031000,"keys":{"id":{"s":"3","n":null,"b":null,"m":null,"l":null,"null":null,"bool":null,"ss":null,"ns":null,"bs":null}},"newImage":{"id":{"s":"3"}, "test": {"s": "hi"}},"oldImage":{"id":{"s":"3","n":null,"b":null,"m":null,"l":null,"null":null,"bool":null,"ss":null,"ns":null,"bs":null}},"sequenceNumber":"300000000001059532482","sizeBytes":6,"streamViewType":"NEW_AND_OLD_IMAGES"}, null).catch(console.error)
