import json
import boto3

s3 = boto3.client('s3')
bucket_name = 'photosharing-thumbnail'

# List of allowed image extensions
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff')

def lambda_handler(event, context):
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix='thumb-')

    if 'Contents' not in response:
        return {
            'statusCode': 200,
            'body': json.dumps([]),
            'headers': {
                'Content-Type': 'application/json'
            }
        }

    urls = []
    for obj in response['Contents']:
        key = obj['Key']
        if key.lower().endswith(IMAGE_EXTENSIONS):
            url = f"https://{bucket_name}.s3.eu-west-1.amazonaws.com/{key}"
            urls.append(url)

    return {
        'statusCode': 200,
        'body': json.dumps(urls),
        'headers': {
            'Content-Type': 'application/json'
        }
    }
