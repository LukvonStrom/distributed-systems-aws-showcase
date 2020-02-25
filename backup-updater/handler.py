import json
import os
import boto3

bucket = os.environ['BUCKET']
s3 = boto3.resource('s3')


def extract_values(values):
    returner = {}
    for value in values:
        returner[value] = values[value]['s']
    print(returner)
    return returner


def lambda_handler(event, context):
    for record in event['Records']:
        payload = json.loads(record['body'])
        keys = extract_values(payload['keys'])
        if payload['newImage'] is not None:
            s3.Object(bucket, str(payload['approximateCreationDateTime']) + "/" + ",".join(keys) + ".json").put(Body=json.dumps(extract_values(payload['newImage'])))
