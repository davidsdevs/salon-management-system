// src/cloudinary.js


/**
 * Uploads a file to Cloudinary using the unsigned upload preset.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} - A promise that resolves with the secure URL of the uploaded image.
 * @throws {Error} - If the upload fails.
 */
export const uploadImageToCloudinary = async (file) => {
    if (!file) {
      throw new Error("No file provided for upload.");
    }
  
  
    // *** CORRECTED: Use REACT_APP_ prefix for client-side environment variables ***
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  
  
    // Check for required environment variables
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      // This is the error you are seeing. It means these variables are not accessible as expected.
      console.error("Cloudinary Cloud Name:", CLOUD_NAME);
      console.error("Cloudinary Upload Preset:", UPLOAD_PRESET);
      throw new Error("Cloudinary environment variables are not set correctly. Please check your .env file and ensure they are prefixed with REACT_APP_.");
    }
  
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
  
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary Upload Error:", errorData);
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
      }
  
  
      const data = await response.json();
      console.log("Cloudinary Upload Success:", data);
      return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw error; // Re-throw the error to be caught by the component
    }
  };
  