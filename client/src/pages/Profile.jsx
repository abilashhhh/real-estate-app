import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../redux/user/userSlice";

export default function Profile() {
  const { currentUser, loading, error } = useSelector(state => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
 
  const [formData, setFormdata] = useState({});

  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload();
    }
  }, [file]);

  const handleChange = e => {
    setFormdata({ ...formData, [e.target.id]: e.target.value });
  };


  const handleSubmit = async e => {
    e.preventDefault();
    try {
      dispatch(updateUserStart()); // This will start the loading effect
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        // Corrected comma here
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };


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


  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart())
      const res = await fetch(`/api/user/delete/${currentUser._id}` , {
        method: 'DELETE',        
      });
  
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }
  

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center my-8 font-semibold">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          src={formData.avatar || currentUser.avatar}
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
            <span className="text-green-700">
              Image successfully uploaded, Press UPDATE to save
            </span>
          ) : null}
        </p>

        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.username}
          className="border p-3 rounded-lg "
          name="username"
          id="username"
          onChange={handleChange}
        />

        <input
          type="email"
          placeholder="Email"
          defaultValue={currentUser.email}
          className="border p-3 rounded-lg "
          name="email"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="border p-3 rounded-lg "
          name="password"
          id="password"
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg uppercase p-3 hover:opacity-95 disabled:opacity-80">
          {loading ? "Loading.. " : "UPDATE"}
        </button>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer ">
          Delete Account
        </span>
        <span className="text-red-700 cursor-pointer ">Sign Out</span>
      </div>

      <p className="text-red-700 mt-5">{error ? error : ""}</p>
 

      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully" : ""}
      </p>
    </div>
  );
}
