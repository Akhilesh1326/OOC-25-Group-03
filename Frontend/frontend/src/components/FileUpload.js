import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './FileUpload.css';

const FileUpload = () => {
  const uploadRef = useRef(null);
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      uploadRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/analyze/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.summary || 'No summary returned.');
    } catch (error) {
      console.error('Upload error:', error);
      setResponse('Error occurred during analysis.');
    }

    setLoading(false);
  };

  return (
    <div ref={uploadRef} className="upload-container">
      <h2 className="title">Upload RFP Document</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input"
      />
      <button onClick={handleUpload} className="upload-btn">
        {loading ? 'Analyzing...' : 'Upload & Analyze'}
      </button>
      {response && (
        <div className="result-box">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
