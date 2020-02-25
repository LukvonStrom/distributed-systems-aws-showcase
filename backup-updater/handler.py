import json
import os
import boto3

bucket = os.environ['BUCKET']
s3 = boto3.resource('s3')


def extract_values(values):
    untyped_values = {}
    for value in values:
        untyped_values[value] = values[value]['s']
    return untyped_values


def lambda_handler(event, context):
    for record in event['Records']:
        payload = json.loads(record['body'])
        keys = extract_values(payload['keys'])
        filename = str(payload['approximateCreationDateTime']) + "/" + ",".join(keys) + ".json"
        if payload['newImage'] is not None:
            s3.Object(bucket, filename).put(Body=json.dumps(extract_values(payload['newImage'])))
