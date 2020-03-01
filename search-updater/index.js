const { Client } = require('@elastic/elasticsearch');
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
}

export async function handle(event, context) {

    for (const { body } in event.Records) {
        let filtered_image = cleaner(body['newImage']);
        let filtered_keys = cleaner(body['keys']);
        let filtered_old_image = cleaner(body['oldImage']);

        // Has keys in new image
        if (Object.keys(filtered_image).length > 0) {
            // creation
            if (Object.keys(filtered_old_image).length < 1 || !await exists(filtered_keys['id'])) {
                console.log(filtered_image);

                await client.index({
                    index,
                    type: 'doc',
                    body: filtered_image
                });


                await client.indices.refresh({ index })
            } else {
                // update
                await client.update({
                    index,
                    type: 'doc',
                    id: filtered_keys['id'],
                    body: filtered_image
                })

                await client.indices.refresh({ index })
            }
        }
    }


}
