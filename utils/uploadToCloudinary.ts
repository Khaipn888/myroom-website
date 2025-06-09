export const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'nextjs_upload'); // preset đã tạo ở Cloudinary
  
    const res = await fetch(`https://api.cloudinary.com/v1_1/<your_cloud_name>/upload`, {
      method: 'POST',
      body: formData,
    });
  
    if (!res.ok) throw new Error('Upload thất bại');
    const data = await res.json();
    return data.secure_url;
  };