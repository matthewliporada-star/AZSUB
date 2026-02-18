import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { calculateANP } from '../../utils/calculations';

const MonitoringPage = () => {
    const { loadMonitoringData, currentUser, darkMode } = useApp();

    // Theme values
    const themes = {
        bg: darkMode ? '#161B22' : '#ffffff',
        inputBg: darkMode ? '#0d1117' : '#ffffff',
        inputBorder: darkMode ? '#30363d' : '#d0d5dd',
        inputReadOnly: darkMode ? '#161b22' : '#f9fafb',
        textPrimary: darkMode ? '#e2e8f0' : '#101828',
        textSecondary: darkMode ? '#94a3b8' : '#344054',
        borderSubtle: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eaecf0',
        title: darkMode ? '#FFFDFE' : '#101828'
    };

    // --- 1. POLICIES STATE ---
    const [policies, setPolicies] = useState([]);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    // --- 2. FORM STATE ---
    const [formData, setFormData] = useState({
        agency: 'Caelum',
        submissionType: 'New Business',

        // CHANGED: Set to empty strings so they are not auto-filled
        intermediaryName: '',
        intermediaryEmail: '',

        clientFirstName: '',
        clientLastName: '',
        clientEmail: '',
        policyType: '', // Will be set after policies load
        policyDate: '',
        modeOfPayment: 'Annual',
        premiumPaid: '',
        anp: '',
    });

    const [serialNumber, setSerialNumber] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Derived State - Determine if policy is manual based on request_type from database (case-insensitive)
    const selectedPolicy = policies.find(p => p.policy_name === formData.policyType);
    const isManualPolicy = selectedPolicy?.request_type?.toLowerCase() === 'manual';

    // Fetch Active Policies on Mount
    useEffect(() => {
        fetchActivePolicies();
    }, []);

    // Auto-fill from Current User
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                intermediaryName: currentUser.name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim(),
                intermediaryEmail: currentUser.email || '',
                // If agency is available in currentUser, set it. Otherwise keep default or 'Others'
                agency: currentUser.agency || prev.agency
            }));
        }
    }, [currentUser]);

    // --- FETCH POLICIES ---
    const fetchActivePolicies = async () => {
        setLoadingPolicies(true);
        try {
            const response = await api.getActivePolicies();
            if (response.success && response.data.length > 0) {
                setPolicies(response.data);
                // Set first policy as default
                setFormData(prev => ({
                    ...prev,
                    policyType: response.data[0].policy_name
                }));
            } else {
                console.warn('No active policies found');
                setPolicies([]);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
            setMessage('Failed to load policies. Please refresh the page.');
            setMessageType('error');
        } finally {
            setLoadingPolicies(false);
        }
    };

    // --- 3. HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-Calculate ANP
            if (name === 'premiumPaid' || name === 'modeOfPayment') {
                const currentPremium = name === 'premiumPaid' ? value : prev.premiumPaid;
                const currentMode = name === 'modeOfPayment' ? value : prev.modeOfPayment;
                newData.anp = calculateANP(currentPremium, currentMode);
            }

            return newData;
        });

        // Clear Serial if Policy Type changes
        if (name === 'policyType') {
            setSerialNumber('');
            setMessage('');
        }
    };

    const handleManualSerialChange = (e) => {
        setSerialNumber(e.target.value);
    };

    // Helper: Fetch System Serial (Used inside Submit)
    const fetchSystemSerial = async (policyType) => {
        const response = await api.getAvailableSerial(policyType);
        if (response.success) {
            return response.serialNumber;
        } else {
            throw new Error(response.message || 'No serials available.');
        }
    };

    // --- MAIN SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;
        setSubmitting(true);
        setMessage('');

        try {
            let finalSerial = serialNumber;

            // 1. If System Policy: FETCH serial now (Auto-generate)
            if (!isManualPolicy) {
                try {
                    setMessage('Requesting System Serial Number...');
                    finalSerial = await fetchSystemSerial(formData.policyType);
                    setSerialNumber(finalSerial);
                } catch (err) {
                    throw new Error('Could not generate serial: ' + err.message);
                }
            } else {
                // 2. If Manual Policy: Use user input
                if (!finalSerial) throw new Error('Please type the Serial Number manually.');
            }

            // 3. Submit Data
            setMessage(`Submitting with Serial: ${finalSerial}...`);

            const payload = {
                ...formData,
                serialNumber: finalSerial,
                profileId: currentUser?.id // Explicitly link to current user profile
            };
            const response = await api.submitMonitoring(payload);

            if (response.success) {
                setMessage(`Success! Serial Number: ${response.data.serial_number}`);
                setMessageType('success');

                // Refresh monitoring data in context
                loadMonitoringData();

                // Clear form but keep Agency/Agent info for convenience? 
                // Or clear everything as requested:
                setFormData(prev => ({
                    ...prev,
                    clientFirstName: '', clientLastName: '', clientEmail: '',
                    premiumPaid: '', anp: '', policyDate: ''
                }));

                // Keep the serial number visible
                setSerialNumber(response.data.serial_number);
            } else {
                setMessage('Submission Failed: ' + response.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error(error);
            setMessage(error.message || 'Server Error.');
            setMessageType('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="content-container animate-spring" style={{ maxWidth: '1400px', background: themes.bg }}>
            <div style={{ paddingBottom: '16px', borderBottom: `1px solid ${themes.borderSubtle}`, marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: themes.title, letterSpacing: '-0.02em' }}>Solution Provider Monitoring</h2>
            </div>
            <div>
                {message && (
                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`} style={{
                        padding: '10px 16px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        backgroundColor: messageType === 'success'
                            ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5')
                            : (darkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'),
                        color: messageType === 'success'
                            ? (darkMode ? '#34d399' : '#047857')
                            : (darkMode ? '#f87171' : '#b91c1c'),
                        border: `1px solid ${messageType === 'success'
                            ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : '#a7f3d0')
                            : (darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fecaca')}`,
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '16px' }}>{messageType === 'success' ? '✓' : '•'}</span>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginBottom: '20px'
                    }}>
                        {/* Row 1 */}
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agency</label>
                            <select name="agency" value={formData.agency} onChange={handleChange} className="monitoring-select" style={{ width: '100%' }}>
                                <option value="Caelum">Caelum</option>
                                <option value="Shepard One">Shepard One</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submission Type</label>
                            <select name="submissionType" value={formData.submissionType} onChange={handleChange} className="monitoring-select" style={{ width: '100%' }}>
                                <option value="New Business">New Business</option>
                                <option value="Renewal">Renewal</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Intermediary Name</label>
                            <input name="intermediaryName" value={formData.intermediaryName} onChange={handleChange} required readOnly className="monitoring-input readonly" style={{ width: '100%', cursor: 'not-allowed' }} />
                        </div>

                        {/* Row 2 */}
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Intermediary Email</label>
                            <input type="email" name="intermediaryEmail" value={formData.intermediaryEmail} onChange={handleChange} required readOnly className="monitoring-input readonly" style={{ width: '100%', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Policy Type</label>
                            <select
                                name="policyType"
                                value={formData.policyType}
                                onChange={handleChange}
                                disabled={submitting || loadingPolicies}
                                className="monitoring-select"
                                style={{ width: '100%' }}
                            >
                                {loadingPolicies ? (
                                    <option>Loading policies...</option>
                                ) : policies.length === 0 ? (
                                    <option>No active policies available</option>
                                ) : (
                                    policies.map(policy => (
                                        <option key={policy.policy_id} value={policy.policy_name} style={{ background: themes.inputBg, color: themes.textPrimary }}>
                                            {policy.policy_name} ({policy.request_type?.toLowerCase() === 'manual' ? 'Manual' : 'System'})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Serial Number
                                {isManualPolicy ?
                                    <span style={{ fontSize: '10px', background: darkMode ? '#1e293b' : '#F2F4F7', color: darkMode ? '#94a3b8' : '#344054', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', border: darkMode ? '1px solid #334155' : '1px solid #D0D5DD' }}>Manual</span> :
                                    <span style={{ fontSize: '10px', background: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF8FF', color: darkMode ? '#60a5fa' : '#175CD3', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', border: darkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid #B2DDFF' }}>Auto</span>
                                }
                            </label>
                            <input
                                type="text"
                                value={serialNumber}
                                onChange={handleManualSerialChange}
                                readOnly={!isManualPolicy}
                                placeholder={isManualPolicy ? "Enter Serial" : "System Assigned"}
                                className={`monitoring-input ${!isManualPolicy ? 'readonly' : ''}`}
                                style={{
                                    width: '100%',
                                    fontFamily: 'monospace',
                                    fontWeight: '500'
                                }}
                            />
                        </div>

                        {/* Row 3 */}
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client First Name</label>
                            <input name="clientFirstName" value={formData.clientFirstName} onChange={handleChange} required className="monitoring-input" style={{ width: '100%' }} />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client Last Name</label>
                            <input name="clientLastName" value={formData.clientLastName} onChange={handleChange} required className="monitoring-input" style={{ width: '100%' }} />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client Email</label>
                            <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} required className="monitoring-input" style={{ width: '100%' }} />
                        </div>

                        {/* Row 4 */}
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mode of Payment</label>
                            <select name="modeOfPayment" value={formData.modeOfPayment} onChange={handleChange} className="monitoring-select" style={{ width: '100%' }}>
                                <option value="Annual">Annual</option>
                                <option value="Semi-Annual">Semi-Annual</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Premium Paid (PHP)</label>
                            <input
                                type="number"
                                name="premiumPaid"
                                value={formData.premiumPaid}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                                className="monitoring-input"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ANP (Auto)</label>
                            <input
                                type="text"
                                name="anp"
                                value={formData.anp}
                                readOnly
                                className="monitoring-input readonly"
                                style={{
                                    width: '100%',
                                    fontWeight: '600',
                                    boxShadow: 'none'
                                }}
                                placeholder="0.00"
                            />
                        </div>

                        {/* Row 5 */}
                        <div className="form-group">
                            <label style={{ fontSize: '12px', fontWeight: '600', color: themes.textSecondary, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Policy Date</label>
                            <input type="date" name="policyDate" value={formData.policyDate} onChange={handleChange} required className="monitoring-input" style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: `1px solid ${themes.borderSubtle}`,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '10px 24px',
                                fontSize: '14px',
                                fontWeight: '600',
                                backgroundColor: submitting ? '#9ca3af' : '#0055b8',
                                background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #0055b8 0%, #004494 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: submitting ? 'none' : '0 1px 2px rgba(16,24,40,0.05)',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {submitting && <span className="loading"></span>}
                            {submitting ? 'Processing...' : 'Submit Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MonitoringPage;
