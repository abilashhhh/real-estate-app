import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

export default function Profile() {
  const { currentUser } = useSelector(state => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);

  const [formData, setFormdata] = useState({});

  useEffect(() => {
    if (file) {
      handleFileUpload();
    }
  }, [file]);

  const handleFileUpload = () => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uplaodTask = uploadBytesResumable(storageRef, file);
    uplaodTask.on(
      "state_changed",
      snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setFilePercentage(Math.round(progress));
      },
      error => {
        setFileUploadError(true);
        console.error("Error uploading file:", error);
      },
      () => {
        getDownloadURL(uplaodTask.snapshot.ref).then(downloadURL => {
          setFormdata({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center my-8 font-semibold">Profile</h1>
      <form className="flex flex-col gap-4">
        <input
          onChange={e => setFile(e.target.files[0])}
          type="file"
          name=""
          id=""
          ref={fileRef}
          hidden
          accept="image/*"
        />

        <img
          onClick={() => fileRef.current.click()}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formData.avatar ||  currentUser.avatar}
          alt="Profile Image"
        />
        <p className="text-lg text-center  font-semibold">
          {fileUploadError ? (
            <>
              <span className="text-red-700">
                Error in uploading image ( Size must be less than 2MB )
              </span>
            </>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className="text-blue-700">{`Image uploaded ${filePercentage}%`}</span>
          ) : filePercentage === 100 ? (
            <span className="text-green-700">Image successfully uploaded</span>
          ) : null}
        </p>

        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg "
          name="username"
          id="username"
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg "
          name="email"
          id="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg "
          name="password"
          id="password"
        />

        <button className="bg-slate-700 text-white rounded-lg uppercase p-3 hover:opacity-95 disabled:opacity-80">
          Update
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer ">Delete Account</span>
        <span className="text-red-700 cursor-pointer ">Sign Out</span>
      </div>
    </div>
  );
}
