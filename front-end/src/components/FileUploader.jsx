import React, { useState, useEffect } from "react";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Save file into IndexedDB
  const saveFileToIndexedDB = (file) => {
    const request = indexedDB.open("MyDB", 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      store.put(file, "myFile");
      tx.oncomplete = () => db.close();
    };
  };

  // Load file from IndexedDB on refresh
  useEffect(() => {
    const request = indexedDB.open("MyDB", 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const getFile = store.get("myFile");

      getFile.onsuccess = () => {
        const storedFile = getFile.result;
        if (storedFile) {
          setFile(storedFile);
          setPreviewUrl(URL.createObjectURL(storedFile));
        }
      };

      tx.oncomplete = () => db.close();
    };
  }, []);

  return (
    <div>
      <label className="bg-gray-200 px-1 py-1 rounded cursor-pointer">
        📎
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              setFile(selectedFile);
              setPreviewUrl(URL.createObjectURL(selectedFile));
              saveFileToIndexedDB(selectedFile);
              console.log("File selected:", selectedFile);
            }
          }}
        />
      </label>

      {file && (
        <div className="mt-2">
          <p>Selected file: {file.name}</p>
          {file.type.startsWith("image/") && (
            <img
              src={previewUrl}
              alt="preview"
              className="w-32 mt-2 rounded shadow"
            />
          )}
        </div>
      )}
    </div>
  );
}
