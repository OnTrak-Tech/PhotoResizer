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
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Uploading...';
    
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
        button.textContent = originalText;
    }
}

async function displayImages() {
    let gallery = document.getElementById("gallery");
    gallery.innerHTML = '<div class="loading">Loading images</div>';

    try {
        // Use a CORS proxy to bypass the CORS restriction
        const corsProxyUrl = 'https://corsproxy.io/?';
        const apiUrl = 'https://43n45t1tu2.execute-api.eu-west-1.amazonaws.com/photosharing/images';
        const response = await fetch(corsProxyUrl + encodeURIComponent(apiUrl));
        const imageList = await response.json();

        if (imageList.length === 0) {
            gallery.innerHTML = '<div class="empty-state">No images found</div>';
            return;
        }

        gallery.innerHTML = '';
        imageList.forEach(imageUrl => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            
            let img = document.createElement('img');
            // Apply CORS proxy to image URLs as well
            img.src = 'https://corsproxy.io/?' + encodeURIComponent(imageUrl);
            img.alt = 'Gallery Image';
            img.loading = 'lazy';
            
            item.appendChild(img);
            gallery.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching images:", error);
        gallery.innerHTML = '<div class="empty-state">Failed to load images</div>';
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displayImages();
});