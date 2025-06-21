const bucketName = 'photosharing-app';
const bucketRegion = 'eu-west-1';

// Handle CORS errors for image loading
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.log('Image loading error, trying with CORS proxy:', e.target.src);
        const originalSrc = e.target.src;
        e.target.src = 'https://corsproxy.io/?' + encodeURIComponent(originalSrc);
    }
}, true);

// Update file input label when file is selected
document.getElementById('uploadFile').addEventListener('change', function() {
    const wrapper = this.parentElement;
    wrapper.setAttribute('data-text', 'Choose Image');
    
    if (this.files[0]) {
        wrapper.setAttribute('data-file', this.files[0].name);
        wrapper.classList.add('has-file');
    } else {
        wrapper.setAttribute('data-file', '');
        wrapper.classList.remove('has-file');
    }
});

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function uploadImage() {
    let fileInput = document.getElementById("uploadFile");
    let file = fileInput.files[0];
    
    if (!file) {
        showToast("Please select an image to upload", "error");
        return;
    }
    
    const button = document.querySelector('.btn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<svg class="cloud-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><polyline points="9 15 12 12 15 15"></polyline><line x1="12" y1="12" x2="12" y2="21"></line></svg> Uploading...';
    
    let fileName = encodeURIComponent(file.name);
    let uploadUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;

    try {
        let response = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                'Content-Type': '*/*'
            }
        });

        if (response.ok) {
            showToast("Image uploaded successfully", "success");
            fileInput.value = '';
            fileInput.parentElement.classList.remove('has-file');
            displayImages();
        } else {
            showToast("Upload failed", "error");
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        showToast("Upload failed", "error");
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function displayImages() {
    let gallery = document.getElementById("gallery");
    gallery.innerHTML = '<div class="loading">Loading images</div>';

    try {
        // Use a CORS proxy to bypass the CORS restriction
        const corsProxyUrl = 'https://corsproxy.io/?';
        const apiUrl = 'https://kh9zdoyf0c.execute-api.eu-west-1.amazonaws.com/prod/thumbnails';
        const response = await fetch(corsProxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();
        
        // Debug the response structure
        console.log("API Response:", data);
        
        // Handle different response formats
        let imageList = [];
        
        // Check if response is an array
        if (Array.isArray(data)) {
            imageList = data;
        } 
        // Check if response has an 'images' property that's an array
        else if (data && Array.isArray(data.images)) {
            imageList = data.images;
        }
        // Check if response has a 'body' property (common in API Gateway responses)
        else if (data && data.body) {
            try {
                // Try to parse body if it's a string
                const bodyContent = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                imageList = Array.isArray(bodyContent) ? bodyContent : 
                           (bodyContent.images && Array.isArray(bodyContent.images)) ? bodyContent.images : [];
            } catch (e) {
                console.error("Error parsing response body:", e);
            }
        }

        if (imageList.length === 0) {
            gallery.innerHTML = '<div class="empty-state">No images found</div>';
            return;
        }

        gallery.innerHTML = '';
        imageList.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            let img = document.createElement('img');
            // Handle if item is a string URL or an object with url property
            const imageUrl = typeof item === 'string' ? item : (item.url || item.imageUrl || item.src || '');
            
            if (imageUrl) {
                // Apply CORS proxy to image URLs as well
                img.src = 'https://corsproxy.io/?' + encodeURIComponent(imageUrl);
                img.alt = 'Gallery Image';
                img.loading = 'lazy';
                
                galleryItem.appendChild(img);
                gallery.appendChild(galleryItem);
            }
        });
        
        // If no images were added to the gallery
        if (gallery.children.length === 0) {
            gallery.innerHTML = '<div class="empty-state">No valid images found in the response</div>';
        }
    } catch (error) {
        console.error("Error fetching images:", error);
        gallery.innerHTML = '<div class="empty-state">Failed to load images</div>';
    }
}

// Sign out function
function signOut() {
    // Add sign out logic here
    console.log('Sign out clicked');
    // Hide auth controls
    document.getElementById('auth-controls').style.display = 'none';
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displayImages();
    // Show auth controls if needed
    // document.getElementById('auth-controls').style.display = 'block';
});