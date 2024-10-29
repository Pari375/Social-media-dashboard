import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePosts } from '../hooks';
import axios from 'axios'; // Import Axios
import styles from '../styles/home.module.css';

const ImageThread = ({ imageUrl }) => {
  return (
    <div className={styles.imageThread}>
      <img src={imageUrl} alt="Uploaded Image" style={{ maxWidth: '150px', maxHeight: '150px' }} />
    </div>
  );
};

const CreatePost = () => {
  const [post, setPost] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [addingPost, setAddingPost] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]); // State to store uploaded images
  
  const posts = usePosts();

  useEffect(() => {
    // Fetch previously uploaded images when component mounts
    // You can modify this to fetch images from your backend if needed
    // For demo purpose, I'm initializing it with some dummy data
    setUploadedImages([
    ]);
  }, []);

  const handleAddPostClick = async () => {
    setAddingPost(true);

    const formData = new FormData();
    formData.append('text', post);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Set content type for FormData
        }
      });

      if (response.status === 200 && response.data.success) {
        // Update uploaded images state with the newly uploaded image
        setUploadedImages(prevImages => [...prevImages, response.data.imageUrl]);
        setImage(null); // Clear image state after upload
        setImagePreview(null); // Clear image preview
        setPost(''); // Clear post text
        toast.success('Post created successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }

    setAddingPost(false);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    
    // Read the selected image file and set the preview
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className={styles.createPost}>
      <textarea
        className={styles.addPost}
        placeholder='Share your thoughts...'
        value={post}
        onChange={(e) => setPost(e.target.value)}
      ></textarea>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          id="media-upload"
        />
        <label htmlFor="media-upload" className={styles.addMediaBtn}>
          &#128206; {/* Paper clip symbol */}
        </label>
        {imagePreview && (
          <img src={imagePreview} alt="Image Preview" className={styles.imagePreview} style={{ maxWidth: '150px', maxHeight: '150px' }} />
        )}
        
        <button
          className={styles.addPostBtn}
          onClick={handleAddPostClick}
          disabled={addingPost}
        >
          {addingPost ? 'Adding post...' : 'Add post'}
        </button>
      </div>
      <div className={styles.imageThreads}>
        {uploadedImages.map((imageUrl, index) => (
          <ImageThread key={index} imageUrl={imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default CreatePost;
/**/ 