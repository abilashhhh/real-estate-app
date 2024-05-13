import React, { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormdata] = useState({
    imageUrls: [],
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false)

  const handleImageSubmit = e => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
        setUploading(true)
        setImageUploadError(false)
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then(urls => {
          setFormdata({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
        setUploading(false)

        })
        .catch(error => {
          console.log(error);
          setImageUploadError("Image upload failed (2MB max per image)");
        setUploading(false)
    });
} else {
    setImageUploadError("You can only upload 6 images per listing");
    setUploading(false)
    }
  };

  const storeImage = async file => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        snapshot => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress} done`);
        },
        error => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
            resolve(downloadUrl);
          });
        }
      );
    });
  };

  console.log(formData);

  const handleRemoveImage = (index) => {
    setFormdata({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index)
    });
  };
  

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl text-center my-8 font-semibold">
        Create a listing
      </h1>

      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1 ">
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg "
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            name="description"
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg "
            required
          />
          <input
            type="text"
            name="address"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg "
            required
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2 ">
              <input type="checkbox" name="sale" id="sale" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2 ">
              <input type="checkbox" name="rent" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2 ">
              <input
                type="checkbox"
                name="parking"
                id="parking"
                className="w-5"
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2 ">
              <input
                type="checkbox"
                name="furnished"
                id="furnished"
                className="w-5"
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2 ">
              <input type="checkbox" name="offer" id="offer" className="w-5" />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2     ">
              <input
                type="number"
                className="p-3   border-gray-300 rounded-lg"
                id="bedrooms"
                name="bedrooms"
                min="1"
                max="10"
                required
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-3   border-gray-300 rounded-lg"
                id="bathrooms"
                name="bathrooms"
                min="1"
                max="10"
                required
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-3   border-gray-300 rounded-lg"
                id="regularPrice"
                name="regularPrice"
                min="1"
                max="10"
                required
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs"> ( $ / month) </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-3   border-gray-300 rounded-lg"
                id="discountPrice"
                name="discountPrice"
                min="1"
                max="10"
                required
              />
              <div className="flex flex-col items-center">
                <p>Discounted Price</p>
                <span className="text-xs"> ( $ / month) </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2 ">
              The first image will be the cover (maximum 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              onChange={e => setFiles(e.target.files)}
              className="p-3 border-gray-300 rounded w-full"
              type="file"
              name="images"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80a">
 {uploading ? 'Uploading..' : 'Upload' }
             </button>
          </div>

          <p className="text-red-700 text-small">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url , index) => (
              <div key={url} className="flex justify-between p-3 border items-cente"> 
                <img
                src={url}
                alt="Listing image"
                className="w-40 h-40 object-contain rounded-lg"
              />
              <button type="button" onClick={() => handleRemoveImage(index)} className="text=red-700    p-3 rounded-lg uppercase hover:opacity-80 " >Delete</button>
              </div>
            ))}

          <button
            className="
          p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
