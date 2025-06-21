import json
import boto3
from PIL import Image
import io

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Get S3 event details
    source_bucket = event['Records'][0]['s3']['bucket']['name']
    source_key = event['Records'][0]['s3']['object']['key']  # "userId/image.jpg"
    target_bucket = "photosharing-thumbnail"  # Use the same bucket for output, adjust if needed

    # Extract user folder and filename
    if '/' in source_key:
        user_folder, filename = source_key.split('/', 1)
        target_key = f"{user_folder}/thumb-{filename}"  # "userId/thumb-image.jpg"
    else:
        target_key = f"thumb-{source_key}"  # Fallback for old structure

    # Download image from S3
    response = s3.get_object(Bucket=source_bucket, Key=source_key)
    image = Image.open(io.BytesIO(response['Body'].read()))
    # Resize image
    image.thumbnail((150, 150))
    # Convert image back to byte stream
    buffer = io.BytesIO()
    image.save(buffer, "JPEG")
    buffer.seek(0)
    # Upload thumbnail to target bucket
    s3.put_object(
        Bucket=target_bucket,
        Key=target_key,
        Body=buffer.getvalue(),
        ContentType="image/jpeg"
    )
    return {
        'statusCode': 200,
        'body': json.dumps(f'Thumbnail created: {target_key}')
    }