import React, { useState, useRef } from "react";
import {
  Search,
  Users,
  Send,
  Clock,
  XCircle,
  Upload,
  File,
  X,
} from "lucide-react"; // Added File and X icons
import "./CIS.css";

const CISDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const stats = [
    {
      title: "TOTAL INQUIRIES",
      value: "124",
      subtext: "All-time inquiries",
      trend: "↑ 12.4%",
      icon: <Users size={24} />,
    },
    {
      title: "PDFS SENT",
      value: "86",
      subtext: "This Month",
      trend: "↑ 8.1%",
      icon: <Send size={24} />,
    },
    {
      title: "PENDING REVIEW",
      value: "12",
      subtext: "Awaiting Action",
      trend: "↓ 2.4%",
      icon: <Clock size={24} />,
    },
    {
      title: "DECLINED",
      value: "3",
      subtext: "0.0% Rate",
      trend: "↑ 1.1%",
      icon: <XCircle size={24} />,
    },
  ];

  // SAMPLE TABLE DATA
  const inquiries = [
    {
      id: 1,
      fullname: "Juan Dela Cruz",
      agent: "Agent Maria",
      date: "2026-03-08",
    },
    { id: 2, fullname: "Ana Santos", agent: "Agent Carlo", date: "2026-03-07" },
    { id: 3, fullname: "Mark Reyes", agent: "Agent John", date: "2026-03-06" },
    { id: 4, fullname: "Lisa Ramos", agent: "Agent Marie", date: "2026-03-05" },
  ];

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // Remove file from selection
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Upload files to server
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploading(true);

    // Create FormData and append files
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append(`files`, file);
      // Initialize progress for each file
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 0,
      }));
    });

    try {
      // Simulate upload progress (replace with actual API call)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const newProgress = {};
        selectedFiles.forEach((file) => {
          newProgress[file.name] = i;
        });
        setUploadProgress(newProgress);
      }

      // Actual API call - uncomment when you have your backend endpoint
      /*
      const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header, let browser set it with boundary
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      */

      // Simulate successful upload
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Success - clear selected files
      alert(`${selectedFiles.length} file(s) uploaded successfully!`);
      setSelectedFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="cis-container">
      <div className="cis-header">
        <h1 className="text-2xl font-bold text-slate-800">CIS Dashboard</h1>

        <div className="cis-header-actions">
          <div className="cis-search-wrapper">
            <Search className="cis-search-icon" />
            <input
              type="text"
              className="cis-search-input"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            style={{ display: "none" }}
          />

          <button
            className="cis-upload-btn"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <Upload size={18} />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* File List Preview */}
      {selectedFiles.length > 0 && (
        <div className="file-preview-container">
          <div className="file-preview-header">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <button
              className="upload-files-btn"
              onClick={uploadFiles}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload All"}
            </button>
          </div>

          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <File size={20} className="file-icon" />
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploading && uploadProgress[file.name] !== undefined && (
                  <div className="file-progress">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                    <span className="progress-text">
                      {uploadProgress[file.name]}%
                    </span>
                  </div>
                )}

                {/* Remove button (only when not uploading) */}
                {!uploading && (
                  <button
                    className="remove-file-btn"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARD CARDS */}
      <div className="cis-grid">
        {stats.map((stat, index) => (
          <div key={index} className="cis-card">
            <div className="cis-card-top">
              <div>
                <p className="cis-card-title">{stat.title}</p>
                <h2 className="cis-card-value">{stat.value}</h2>
              </div>
              <div className="cis-trend-badge">{stat.trend}</div>
            </div>

            <p className="cis-card-subtext">{stat.subtext}</p>

            <div className="cis-icon-bg">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="cis-table-container">
        <h2 className="cis-table-title">Recent Inquiries</h2>

        <table className="cis-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Agent Submitted</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.fullname}</td>
                <td>{item.agent}</td>
                <td>{item.date}</td>
                <td>
                  <button className="cis-action-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CISDashboard;
