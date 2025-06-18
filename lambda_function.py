import json
import boto3
from PIL import Image
import io

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Get S3 event details
    source_bucket = event['Records'][0]['s3']['bucket']['name']
    source_key = event['Records'][0]['s3']['object']['key']
    # Define target bucket
    target_bucket = "photosharing-thumbnail"
    target_key = f"thumb-{source_key}"
    # Download image from S3
    response = s3.get_object(Bucket=source_bucket, Key=source_key)
    image = Image.open(io.BytesIO(response['Body'].read()))
    # Resize image
    image.thumbnail((150, 150))
    # Thumbnail size 150x150
    # Convert image back to byte stream
    buffer = io.BytesIO()
    image.save(buffer, "JPEG")
    buffer.seek(0)
    # Upload thumbnail to target bucket
    s3.put_object(
        Bucket=target_bucket,
        Key=target_key,
        Body=buffer,
        ContentType="image/jpeg"
    )
    return {
        'statusCode': 200,
        'body': json.dumps(f'Thumbnail created: {target_key}')
    }