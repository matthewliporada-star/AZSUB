import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Edit, Printer } from "lucide-react";
import supabase from "../../config/supabaseClient";
import "./CIS.css";

function CISRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      setLoading(true);

      // Fetch from Supabase
      const { data, error } = await supabase
        .from("cis_records")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setRecord(data);
    } catch (error) {
      console.error("Error fetching record:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading record...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="error-container">
        <h2>Record not found</h2>
        <button onClick={() => navigate("/cis/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="cis-record-container">
      <div className="record-header">
        <button className="back-btn" onClick={() => navigate("/cis/dashboard")}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="record-actions">
          <button className="action-btn">
            <Edit size={18} />
            <span>Edit</span>
          </button>
          <button className="action-btn">
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button className="action-btn">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="record-title">
        <h1>Client Information Sheet</h1>
        <p className="client-name">
          {record.personalInfo?.fullName || "Unknown"}
        </p>
        <p className="record-id">Record ID: {record.id}</p>
      </div>

      <div className="record-tabs">
        <button
          className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Info
        </button>
        <button
          className={`tab-btn ${activeTab === "medical" ? "active" : ""}`}
          onClick={() => setActiveTab("medical")}
        >
          Medical
        </button>
        <button
          className={`tab-btn ${activeTab === "financial" ? "active" : ""}`}
          onClick={() => setActiveTab("financial")}
        >
          Financial
        </button>
        <button
          className={`tab-btn ${activeTab === "family" ? "active" : ""}`}
          onClick={() => setActiveTab("family")}
        >
          Family
        </button>
      </div>

      <div className="record-content">
        {activeTab === "summary" && (
          <div className="summary-view">
            <div className="summary-card">
              <h3>Personal Information</h3>
              <div className="summary-grid">
                <div>
                  <strong>Full Name:</strong>{" "}
                  {record.personalInfo?.fullName || "N/A"}
                </div>
                <div>
                  <strong>Father's Name:</strong>{" "}
                  {record.personalInfo?.fatherName || "N/A"}
                </div>
                <div>
                  <strong>Mobile:</strong>{" "}
                  {record.personalInfo?.mobile || "N/A"}
                </div>
                <div>
                  <strong>Email:</strong> {record.personalInfo?.email || "N/A"}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h3>Medical Summary</h3>
              <div className="summary-grid">
                <div>
                  <strong>Height:</strong> {record.medicalInfo?.height || "N/A"}
                </div>
                <div>
                  <strong>Weight:</strong> {record.medicalInfo?.weight || "N/A"}
                </div>
                <div>
                  <strong>Smoker:</strong>{" "}
                  {record.medicalInfo?.smokerStatus || "N/A"}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h3>Financial Summary</h3>
              <div className="summary-grid">
                <div>
                  <strong>Total Assets:</strong> $
                  {record.assetsLiabilities?.totalAssets || "0"}
                </div>
                <div>
                  <strong>Total Liabilities:</strong> $
                  {record.assetsLiabilities?.totalLiabilities || "0"}
                </div>
                <div>
                  <strong>Net Worth:</strong> $
                  {record.assetsLiabilities?.netWorth || "0"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "personal" && (
          <div className="personal-view">
            <section className="detail-section">
              <h3>Personal Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name:</label>
                  <span>{record.personalInfo?.fullName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Father's Name:</label>
                  <span>{record.personalInfo?.fatherName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Mobile Number:</label>
                  <span>{record.personalInfo?.mobile || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Email Address:</label>
                  <span>{record.personalInfo?.email || "N/A"}</span>
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h3>Travel History</h3>
              {record.travelDetails?.length > 0 ? (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>City</th>
                      <th>Length</th>
                      <th>Date</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.travelDetails.map((travel, index) => (
                      <tr key={index}>
                        <td>{travel.country}</td>
                        <td>{travel.city}</td>
                        <td>{travel.lengthOfStay}</td>
                        <td>{travel.dateOfTravel}</td>
                        <td>{travel.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No travel details available</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="medical-view">
            <section className="detail-section">
              <h3>Medical Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Height:</label>
                  <span>{record.medicalInfo?.height || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Weight:</label>
                  <span>{record.medicalInfo?.weight || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Exercise:</label>
                  <span>{record.medicalInfo?.exercise || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Health Disorders:</label>
                  <span>{record.medicalInfo?.healthDisorders || "None"}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "financial" && (
          <div className="financial-view">
            <section className="detail-section">
              <h3>Assets & Liabilities</h3>
              <div className="financial-grid">
                <div className="financial-column">
                  <h4>Assets</h4>
                  <div className="detail-item">
                    <label>Cash:</label>
                    <span>
                      ${record.assetsLiabilities?.assets?.cash || "0"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Savings:</label>
                    <span>
                      ${record.assetsLiabilities?.assets?.savings || "0"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Stocks & Bonds:</label>
                    <span>
                      ${record.assetsLiabilities?.assets?.stocks || "0"}
                    </span>
                  </div>
                  <div className="detail-item total">
                    <label>Total Assets:</label>
                    <span>${record.assetsLiabilities?.totalAssets || "0"}</span>
                  </div>
                </div>

                <div className="financial-column">
                  <h4>Liabilities</h4>
                  <div className="detail-item">
                    <label>Personal Loans:</label>
                    <span>
                      $
                      {record.assetsLiabilities?.liabilities?.personalLoans ||
                        "0"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Mortgage:</label>
                    <span>
                      $
                      {record.assetsLiabilities?.liabilities
                        ?.residentialMortgage || "0"}
                    </span>
                  </div>
                  <div className="detail-item total">
                    <label>Total Liabilities:</label>
                    <span>
                      ${record.assetsLiabilities?.totalLiabilities || "0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="net-worth">
                <h4>Net Worth</h4>
                <div className="net-worth-value">
                  ${record.assetsLiabilities?.netWorth || "0"}
                </div>
              </div>
            </section>

            <section className="detail-section">
              <h3>Property Details</h3>
              {record.propertyDetails?.length > 0 ? (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Purchase Price</th>
                      <th>Current Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.propertyDetails.map((property, index) => (
                      <tr key={index}>
                        <td>{property.type}</td>
                        <td>{property.location}</td>
                        <td>${property.purchasePrice}</td>
                        <td>${property.currentValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No property details available</p>
              )}
            </section>
          </div>
        )}

        {activeTab === "family" && (
          <div className="family-view">
            <section className="detail-section">
              <h3>Family Medical History</h3>
              {record.familyMedicalHistory?.length > 0 ? (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Relationship</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Medical History</th>
                      <th>Health Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.familyMedicalHistory.map((member, index) => (
                      <tr key={index}>
                        <td>{member.relationship}</td>
                        <td>{member.name}</td>
                        <td>{member.age}</td>
                        <td>{member.medicalHistory}</td>
                        <td>{member.currentHealthStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No family medical history available</p>
              )}
            </section>

            <section className="detail-section">
              <h3>Spouse Details</h3>
              {record.spouseDetails?.name ? (
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{record.spouseDetails.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nationality:</label>
                    <span>{record.spouseDetails.nationality}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{record.spouseDetails.dateOfBirth}</span>
                  </div>
                </div>
              ) : (
                <p>No spouse details available</p>
              )}
            </section>

            <section className="detail-section">
              <h3>Dependents</h3>
              {record.dependentDetails?.length > 0 ? (
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relationship</th>
                      <th>Nationality</th>
                      <th>Date of Birth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.dependentDetails.map((dependent, index) => (
                      <tr key={index}>
                        <td>{dependent.name}</td>
                        <td>{dependent.relationship}</td>
                        <td>{dependent.nationality}</td>
                        <td>{dependent.dateOfBirth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No dependent details available</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default CISRecord;
