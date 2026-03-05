import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const SubmissionPage = () => {
    const { darkMode } = useApp();
    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        serialNumber: '', formType: '', policyType: '',
        modeOfPayment: '', policyDate: '', clientFirstName: '', clientLastName: '',
        medical: { height: '', weight: '', diagnosed: 'No', hospitalized: 'No', smoker: 'No', alcohol: 'No' }
    });

    // Options States
    const [isGAE, setIsGAE] = useState(false);
    const [isVSP, setIsVSP] = useState(false);

    // --- NEW: Dynamic Requirements State ---
    const [dynamicRequirements, setDynamicRequirements] = useState([]);

    const [specificFiles, setSpecificFiles] = useState({});

    // UI States
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);

    // --- PREVIEW MODAL STATES ---
    const [showPreview, setShowPreview] = useState(false);
    const [previewBlobUrl, setPreviewBlobUrl] = useState(null);

    // --- LEGACY REQUIREMENTS CONFIGURATION (Fallback) ---
    const LEGACY_REQUIREMENTS = {
        'VUL': [
            { id: 'app_form', label: 'Accomplished Application Form', required: true },
            { id: 'auth_med', label: 'Authorization to Furnish Medical', required: true, nonGaeOnly: true },
            { id: 'inter_dec', label: 'Intermediary Declarations', required: true },
            { id: 'acr', label: "Agent's Confidential Report (ACR)", required: true },
            { id: 'specimen_sig', label: 'Client Specimen Signature Form OR Valid ID (Signed 3x)', required: true },
            { id: 'fna', label: 'Financial Needs Analysis (FNA)', required: true },
            { id: 'sales_illus', label: 'Sales Illustration', required: true },
            { id: 'irpq', label: 'Investor Risk Profile Questionnaire (IRPQ)', required: true },
            { id: 'proof_pay', label: 'Proof of Payment', required: true },
            { id: 'valid_id', label: 'Valid ID', required: true }
        ],
        'IHP': [
            { id: 'app_form', label: 'Application Form', required: true },
            { id: 'sales_illus', label: 'Sales Illustration', required: true },
            { id: 'acr', label: "Agent's Confidential Report (ACR)", required: true },
            { id: 'proof_pay', label: 'Proof of Payment', required: true },
            { id: 'valid_id_3', label: 'Valid ID w/ 3 Signatures', required: true },
            { id: 'auth_med', label: 'Authorization to Furnish Medical', required: true },
            { id: 'inter_dec', label: 'Intermediary Declarations', required: true }
        ],
        'TRAD': [
            { id: 'app_form', label: 'Accomplished Application Form', required: true },
            { id: 'auth_med', label: 'Authorization to Furnish Medical', required: true },
            { id: 'inter_dec', label: 'Intermediary Declarations', required: true },
            { id: 'acr', label: "Agent's Confidential Report (ACR)", required: true },
            { id: 'specimen_sig', label: 'Client Specimen Signature Form OR Valid ID (Signed 3x)', required: true },
            { id: 'fna', label: 'Financial Needs Analysis (FNA)', required: true },
            { id: 'sales_illus', label: 'Sales Illustration', required: true },
            { id: 'proof_pay', label: 'Proof of Payment', required: true },
            { id: 'valid_id', label: 'Valid ID', required: true }
        ]
    };

    const getCategoryFromPolicy = (policyName) => {
        if (!policyName) return '';
        const lower = policyName.toLowerCase();
        if (lower.includes('allianz well')) return 'IHP';
        if (lower.includes('eazy health') || lower.includes('fundamental cover')) return 'TRAD';
        return 'VUL';
    };

    const handleSerialBlur = async () => {
        if (!formData.serialNumber) return;

        try {
            setLoading(true);
            setMessage('Fetching serial details...');
            setMessageType('info');
            setGeneratedPdfUrl(null);

            const response = await api.getSerialDetails(formData.serialNumber);

            if (response.success) {
                const data = response.data;
                const detectedCategory = getCategoryFromPolicy(data.policyType);

                setFormData(prev => ({
                    ...prev,
                    policyType: data.policyType || '',
                    modeOfPayment: data.modeOfPayment || '',
                    policyDate: data.policyDate || '',
                    clientFirstName: data.clientFirstName || '',
                    clientLastName: data.clientLastName || '',
                    formType: detectedCategory
                }));

                if (data.requirements && Array.isArray(data.requirements) && data.requirements.length > 0) {
                    setDynamicRequirements(data.requirements);
                } else {
                    setDynamicRequirements([]);
                }

                setMessage(`Serial found! Identified as ${detectedCategory} Application.`);
                setMessageType('success');
            } else {
                // --- THE ERROR MESSAGE IS SET HERE ---
                // This captures the message from the backend (e.g., "Serial is already ISSUED")
                setMessage(response.message || 'Serial Number not found.');
                setMessageType('error');

                // Clear the form to reset the UI and hide the requirement sections
                setFormData(prev => ({
                    ...prev,
                    formType: '',
                    policyType: '',
                    clientFirstName: '',
                    clientLastName: ''
                }));
                setDynamicRequirements([]);
            }
        } catch (error) {
            console.error(error);
            // Fallback if the server is down or has a different error
            setMessage(error.response?.data?.message || 'Error connecting to server.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMedicalChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            medical: { ...prev.medical, [name]: value }
        }));
    };

    const handleSpecificFileChange = (slotId, e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            setSpecificFiles(prev => {
                const existing = prev[slotId] || [];
                return { ...prev, [slotId]: [...existing, ...newFiles] };
            });
        }
        e.target.value = '';
    };

    const handleRemoveFile = (slotId, fileIndex) => {
        setSpecificFiles(prev => {
            const currentFiles = prev[slotId] || [];
            const updatedFiles = currentFiles.filter((_, idx) => idx !== fileIndex);
            if (updatedFiles.length === 0) {
                const newState = { ...prev };
                delete newState[slotId];
                return newState;
            }
            return { ...prev, [slotId]: updatedFiles };
        });
    };

    const handlePreview = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/preview-application', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formData: { ...formData, isGAE, isVSP },
                    serialNumber: formData.serialNumber
                })
            });

            if (!response.ok) throw new Error('Preview failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPreviewBlobUrl(url);
            setShowPreview(true);
        } catch (e) {
            alert('Could not generate preview.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const closePreview = () => {
        setShowPreview(false);
    };

    // --- VSP ATTESTATION EMAIL HANDLER ---
    const handleSendAttestation = async () => {
        if (!formData.serialNumber) {
            alert("Please enter a valid Serial Number first.");
            return;
        }

        if (!confirm(`Send VSP Attestation email to ${formData.clientFirstName} ${formData.clientLastName}?`)) return;

        try {
            setLoading(true);
            setMessage('Sending attestation email...');
            setMessageType('info');

            const response = await fetch('http://localhost:3000/api/vsp/send-attestation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serialNumber: formData.serialNumber })
            }).then(res => res.json());

            if (response.success) {
                setMessage(response.message);
                setMessageType('success');
            } else {
                setMessage('Error: ' + response.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error(error);
            setMessage('Failed to send email.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    // --- HELPER TO GET ACTIVE REQUIREMENTS ---
    const getActiveRequirements = () => {
        if (!formData.formType) return [];

        let reqs = [];

        // 1. Check if Dynamic Requirements exist (from Admin)
        if (dynamicRequirements.length > 0) {
            // Map dynamic requirements to the format needed by UI
            // We use the label as a base for ID if ID is missing
            reqs = dynamicRequirements.map((r, index) => ({
                id: r.id || `req_${index}_${r.label.replace(/\s+/g, '_').toLowerCase()}`,
                label: r.label,
                required: r.required
            }));
        } else {
            // 2. Fallback to Legacy Hardcoded Requirements
            reqs = [...(LEGACY_REQUIREMENTS[formData.formType] || [])];

            // If VUL and GAE is selected, filter out "nonGaeOnly" items
            if (formData.formType === 'VUL' && isGAE) {
                reqs = reqs.filter(r => !r.nonGaeOnly);
            }
        }

        // --- VSP LOGIC (Always Appended) ---
        if (isVSP) {
            reqs.push({ id: 'proof_meet', label: 'Proof of Meeting (VSP)', required: true });
            reqs.push({ id: 'proof_attest', label: 'Proof of Attestation (VSP)', required: true });
        }

        return reqs;
    };

    const handleSubmit = async () => {
        if (!formData.serialNumber || !formData.formType) {
            alert('Please enter a valid Serial Number first.');
            return;
        }

        const currentReqs = getActiveRequirements();
        const missingFiles = currentReqs
            .filter(r => r.required && (!specificFiles[r.id] || specificFiles[r.id].length === 0))
            .map(r => r.label);

        if (missingFiles.length > 0) {
            alert(`Missing required documents:\n- ${missingFiles.join('\n- ')}`);
            return;
        }

        try {
            setLoading(true);
            setMessage('Uploading documents and sending email...');
            setMessageType('info');

            const dataPayload = new FormData();
            dataPayload.append('serialNumber', formData.serialNumber);
            dataPayload.append('formData', JSON.stringify({ ...formData, isGAE, isVSP }));

            Object.entries(specificFiles).forEach(([key, filesArray]) => {
                filesArray.forEach(file => {
                    dataPayload.append(`documents_${key}`, file);
                });
            });

            const response = await api.submitForm(dataPayload);

            if (response.success) {
                setMessage('Documents submitted successfully!');
                setMessageType('success');
                setGeneratedPdfUrl(response.generatedPdfUrl);

                setFormData({
                    serialNumber: '', formType: '', policyType: '',
                    modeOfPayment: '', policyDate: '', clientFirstName: '', clientLastName: '',
                    medical: { height: '', weight: '', diagnosed: 'No', hospitalized: 'No', smoker: 'No', alcohol: 'No' }
                });
                setIsGAE(false);
                setIsVSP(false);
                setSpecificFiles({});
                setDynamicRequirements([]); // Reset dynamic reqs
            } else {
                setMessage('Submission failed: ' + response.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error(error);
            setMessage('Server error occurred.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const showMedicalSection = formData.formType && (formData.formType !== 'VUL' || !isGAE);

    return (
        <div className="content-container animate-spring">
            <div style={{ marginBottom: '24px', borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eaecf0'}`, paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '700', color: darkMode ? '#FFFDFE' : '#101828' }}>Document Submission</h2>
            </div>
            <div>
                {message && (
                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}
                        style={{
                            padding: '12px 16px',
                            marginBottom: '20px',
                            borderRadius: '8px',
                            fontWeight: '500'
                        }}>
                        {message}
                    </div>
                )}
                {generatedPdfUrl && (
                    <div style={{
                        padding: '20px',
                        backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#e8f4fd',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : '#b8daff'}`,
                        textAlign: 'center'
                    }}>
                        <h4 style={{ margin: '0 0 12px 0', color: darkMode ? '#10b981' : '#004085', fontWeight: '700' }}>Application Generated Successfully!</h4>
                        <a href={generatedPdfUrl} target="_blank" rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: '700',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.transform = 'translateY(0)'; }}
                        >
                            📄 VIEW FINAL SUBMITTED PDF
                        </a>
                    </div>
                )}

                <div className="submission-section form-grid">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Serial Number <span className="required">*</span></label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleTextChange}
                                onBlur={handleSerialBlur}
                                className="monitoring-input"
                                placeholder="Enter Serial to auto-load requirements..."
                                required
                                style={{ flexGrow: 1 }}
                            />
                            <button className="btn-primary" onClick={handleSerialBlur} disabled={loading} style={{ height: '42px', padding: '0 24px' }}>
                                {loading ? '...' : 'LOAD'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Policy Type</label>
                        <input className="monitoring-input readonly" value={formData.policyType} readOnly />
                    </div>

                    <div className="form-group">
                        <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Form Category</label>
                        <input
                            className="monitoring-input readonly"
                            value={formData.formType ? `${formData.formType} Requirements` : ''}
                            readOnly
                            style={{ fontWeight: 'bold' }}
                            placeholder="Auto-detected..."
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Client Name</label>
                        <input className="monitoring-input readonly" value={`${formData.clientFirstName} ${formData.clientLastName}`} readOnly />
                    </div>

                    {/* --- VUL GAE DROPDOWN --- */}
                    {formData.formType === 'VUL' && (
                        <div className="form-group">
                            <label style={{ color: darkMode ? '#3b82f6' : '#0055b8', fontWeight: '700' }}>VUL Underwriting Option</label>
                            <select
                                value={isGAE ? 'GAE' : 'Non-GAE'}
                                onChange={(e) => setIsGAE(e.target.value === 'GAE')}
                                className="monitoring-select"
                                style={{ fontWeight: 'bold' }}
                            >
                                <option value="Non-GAE">Non-GAE (Standard)</option>
                                <option value="GAE">GAE (Guaranteed Offer)</option>
                            </select>
                        </div>
                    )}

                    {/* --- VSP TOGGLE & BUTTON --- */}
                    {formData.formType && (
                        <div className="vsp-panel" style={{ alignSelf: 'end' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="vsp-toggle"
                                    checked={isVSP}
                                    onChange={(e) => setIsVSP(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 0 }}
                                />
                                <label htmlFor="vsp-toggle" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#004085' }}>
                                    Virtual Selling Process (VSP)
                                </label>
                            </div>

                            {isVSP && (
                                <button
                                    type="button"
                                    onClick={handleSendAttestation}
                                    disabled={loading || !formData.serialNumber}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    📧 Send Attestation Email
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* --- FILL APPLICATION FORM BUTTON --- */}
                {formData.formType && (
                    <div style={{
                        marginTop: '24px',
                        padding: '20px',
                        background: darkMode
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))'
                            : 'linear-gradient(135deg, #eff6ff, #eef2ff)',
                        borderRadius: '12px',
                        border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.2)' : '#c7d2fe'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div>
                            <h4 style={{
                                margin: '0 0 4px 0',
                                fontSize: '15px',
                                fontWeight: '700',
                                color: darkMode ? '#e2e8f0' : '#1e3a5f'
                            }}>
                                📝 Fill Application Form
                            </h4>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: darkMode ? '#94a3b8' : '#64748b'
                            }}>
                                {formData.formType === 'IHP'
                                    ? 'Open the IHP Application Form to fill out and generate a PDF.'
                                    : `Open the GAE / NON-GAE Application Form to fill out and generate a PDF.`
                                }
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.open(`/application-form/${formData.formType}`, '_blank')}
                            style={{
                                padding: '12px 28px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                width: 'fit-content',
                                flex: '0 0 auto'
                            }}
                            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)'; }}
                            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)'; }}
                        >
                            {formData.formType === 'IHP' ? '📋 Open IHP Form' : '📋 Open GAE / NON-GAE Form'}
                        </button>
                    </div>
                )}

                {/* --- MEDICAL SECTION --- */}
                {showMedicalSection && (
                    <div className="medical-section" style={{ marginTop: '24px' }}>
                        <h3 className="section-title" style={{ paddingBottom: '12px', marginTop: 0, fontWeight: '700', fontSize: '18px', color: darkMode ? '#e2e8f0' : '#101828' }}>
                            Medical & Personal Declaration
                        </h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Height (cm/ft)</label>
                                <input className="monitoring-input" type="text" name="height" value={formData.medical.height} onChange={handleMedicalChange} placeholder="e.g. 175cm" />
                            </div>
                            <div className="form-group">
                                <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Weight (kg/lbs)</label>
                                <input className="monitoring-input" type="text" name="weight" value={formData.medical.weight} onChange={handleMedicalChange} placeholder="e.g. 70kg" />
                            </div>
                            <div className="form-group">
                                <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Diagnosed with critical illness?</label>
                                <select className="monitoring-select" name="diagnosed" value={formData.medical.diagnosed} onChange={handleMedicalChange}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Hospitalized in last 2 years?</label>
                                <select className="monitoring-select" name="hospitalized" value={formData.medical.hospitalized} onChange={handleMedicalChange}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Smoker?</label>
                                <select className="monitoring-select" name="smoker" value={formData.medical.smoker} onChange={handleMedicalChange}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ color: darkMode ? '#94a3b8' : '#475467' }}>Alcohol consumer?</label>
                                <select className="monitoring-select" name="alcohol" value={formData.medical.alcohol} onChange={handleMedicalChange}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <hr style={{ margin: '32px 0', border: '0', borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eee'}` }} />

                {formData.formType && (
                    <div className="submission-section" style={{ marginTop: '24px' }}>
                        <h3 className="section-title" style={{ paddingBottom: '12px', marginTop: 0, fontWeight: '700', fontSize: '18px', color: darkMode ? '#e2e8f0' : '#101828' }}>
                            Requirements for {formData.formType}
                            {isGAE && ' (GAE)'}
                            {isVSP && ' (VSP)'}
                            <span style={{ fontSize: '0.6em', color: darkMode ? '#94a3b8' : '#667085', marginLeft: '10px', fontWeight: 'normal' }}>
                                (Based on {formData.policyType})
                            </span>
                        </h3>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {getActiveRequirements().map((req) => {
                                const uploadedFiles = specificFiles[req.id] || [];
                                const hasFiles = uploadedFiles.length > 0;

                                return (
                                    <div key={req.id} className="file-slot">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasFiles ? '12px' : '0' }}>
                                            <div className="file-label" style={{ fontWeight: 600 }}>
                                                {req.label}
                                                {req.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    id={`file-${req.id}`}
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleSpecificFileChange(req.id, e)}
                                                    accept="application/pdf,image/jpeg,image/png"
                                                    multiple
                                                />
                                                <label
                                                    htmlFor={`file-${req.id}`}
                                                    style={{
                                                        backgroundColor: hasFiles ? '#10b981' : '#3b82f6',
                                                        color: 'white', padding: '8px 16px',
                                                        borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'inline-block',
                                                        fontWeight: '600', marginBottom: 0, transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {hasFiles ? '+ Add More' : 'Upload File'}
                                                </label>
                                            </div>
                                        </div>

                                        {hasFiles && (
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                                {uploadedFiles.map((file, idx) => (
                                                    <li key={idx} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        fontSize: '0.9em', padding: '6px 0', color: '#555',
                                                        borderBottom: '1px solid #eee'
                                                    }}>
                                                        <span>📄 {file.name}</span>
                                                        <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                                                                style={{
                                                                    border: 'none', backgroundColor: '#3b82f6',
                                                                    color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '2px 10px',
                                                                    width: 'fit-content', flex: '0 0 auto', fontSize: '12px', fontWeight: 'bold'
                                                                }}
                                                                title="Preview File"
                                                            >
                                                                Preview
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile(req.id, idx)}
                                                                style={{
                                                                    border: 'none', backgroundColor: '#ff6b6b',
                                                                    color: 'white', borderRadius: '4px', cursor: 'pointer', padding: '2px 10px',
                                                                    width: 'fit-content', flex: '0 0 auto', fontSize: '13px', fontWeight: 'bold'
                                                                }}
                                                                title="Remove File"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="btn-group" style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={loading || !formData.formType}
                        style={{
                            padding: '12px 28px',
                            background: darkMode ? '#312e81' : '#1e3a8a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
                    >
                        PREVIEW SUMMARY
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.formType}
                        style={{
                            padding: '12px 28px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
                    >
                        {loading ? 'Submitting...' : 'SUBMIT APPLICATION'}
                    </button>
                </div>
            </div>

            {/* --- PDF PREVIEW MODAL --- */}
            {showPreview && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: darkMode ? '#161B22' : 'white', width: '85%', height: '90%', borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eaecf0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: darkMode ? '#FFFDFE' : '#101828', fontWeight: '700' }}>Preview Application Summary</h3>
                            <button onClick={closePreview} style={{ border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: darkMode ? '#94a3b8' : '#667085' }}>&times;</button>
                        </div>
                        <div style={{ flexGrow: 1, backgroundColor: darkMode ? '#0d1117' : '#f0f0f0' }}>
                            <iframe src={previewBlobUrl} width="100%" height="100%" title="PDF Preview" style={{ border: 'none' }} />
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eaecf0'}`, textAlign: 'right' }}>
                            <button onClick={closePreview} className="btn-secondary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600' }}>Close Preview</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SubmissionPage;