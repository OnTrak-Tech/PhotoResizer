# Photo Resizer

A serverless web application for uploading, resizing, and sharing photos using AWS services.

## Project Overview

Photo Resizer is a cloud-based application that allows users to upload images to an S3 bucket. When an image is uploaded, an AWS Lambda function automatically creates a thumbnail version of the image and stores it in a separate bucket. The frontend displays these thumbnails in a responsive gallery.

## Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=Photo+Resizer+Architecture)

### Infrastructure Components

1. **AWS S3 Buckets**:
   - `photosharing-app`: Stores original uploaded images
   - `photosharing-thumbnail`: Stores resized thumbnail images

2. **AWS Lambda**:
   - Triggered by S3 upload events
   - Processes images using Python and PIL/Pillow
   - Creates thumbnails (150x150px)
   - Saves thumbnails to the thumbnail bucket

3. **AWS API Gateway**:
   - Endpoint: `https://eu-west-1mqfoaerat.auth.eu-west-1.amazoncognito.com/login/continue?client_id=2a879chr8h137gsqfpd24tccij&redirect_uri=https%3A%2F%2Fmain.dbf10xveb0qjh.amplifyapp.com%2F&response_type=code&scope=email+openid+phone`
   - Provides RESTful API to list thumbnails
   - Configured with appropriate CORS headers

4. **AWS IAM**:
   - Roles and policies for secure access between services
   - S3 bucket policies for direct browser uploads

## Backend Implementation

### Lambda Function

The Lambda function (`lambda_function.py`) is triggered when a new image is uploaded to the `photosharing-app` bucket. It:

1. Retrieves the uploaded image from the source bucket
2. Resizes it to 150x150px using PIL/Pillow
3. Saves the thumbnail to the `photosharing-thumbnail` bucket with a prefix of "thumb-"

### API Gateway Configuration

The API Gateway is configured to:
- List all thumbnails from the `photosharing-thumbnail` bucket
- Return URLs for each thumbnail
- Allow cross-origin requests (CORS)

## Frontend Implementation

The frontend is built with vanilla HTML, CSS, and JavaScript, following a clean separation of concerns:

### HTML Structure (`index.html`)

- Responsive layout with card-based design
- File upload interface with custom styling
- Gallery section for displaying thumbnails
- Toast notifications for user feedback

### CSS Styling (`styles.css`)

- Modern design with gradient accents
- Responsive grid layout for the gallery
- Custom file input styling
- Animations and transitions for a polished UX
- Toast notification system

### JavaScript Logic (`app.js`)

- Direct S3 upload using fetch API
- Gallery display with CORS proxy for image loading
- Error handling and user feedback
- Responsive to different API response formats

## Setup Instructions

### AWS Setup

1. **Create S3 Buckets**:
   ```bash
   aws s3 mb s3://photosharing-app --region eu-west-1
   aws s3 mb s3://photosharing-thumbnail --region eu-west-1
   ```

2. **Configure S3 CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create Lambda Function**:
   - Runtime: Python 3.9
   - Handler: lambda_function.lambda_handler
   - Role: Create with S3 read/write permissions
   - Trigger: S3 bucket (photosharing-app) with event type "All object create events"

4. **Create API Gateway**:
   - REST API with resource `/thumbnails`
   - GET method that integrates with a Lambda function to list thumbnails
   - Enable CORS

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/photo-resizer.git
   cd photo-resizer
   ```

2. **Run locally**:
   ```bash
   # Using any simple HTTP server, e.g.:
   python -m http.server 5500
   ```

3. **Access the application**:
   Open `http://localhost:5500` in your browser

## Usage

1. Click "Choose Image" to select an image from your device
2. Click "Upload" to upload the image to S3
3. The Lambda function will automatically create a thumbnail
4. The gallery will refresh to show all thumbnails, including the new one

## Troubleshooting

- **CORS Issues**: If images fail to load, check browser console for CORS errors. The application uses a CORS proxy as a fallback.
- **Upload Failures**: Ensure S3 bucket permissions are correctly configured.
- **Missing Thumbnails**: Check Lambda CloudWatch logs for execution errors.

## Future Enhancements

- User authentication and personal galleries
- Additional image processing options (filters, cropping)
- Image metadata extraction and display
- Multi-file upload support
- Progressive image loading

## License

MIT

## Author

Gideon Adjei