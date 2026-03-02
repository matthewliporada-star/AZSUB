// FormPage.jsx - Standalone page wrapper for prototype forms
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './FormStyles.css';
import IHPForm from './IHPForm';
import LifeInsuranceForm from './LifeInsuranceForm';

const FormPage = () => {
    const { formType } = useParams();

    const [sharedFormData, setSharedFormData] = useState({
        clientId: '',
        clientName: '',
        email: '',
        mobile: '',
    });

    const getFormTitle = () => {
        if (formType === 'IHP') return 'IHP Application Form';
        return 'GAE / NON-GAE Application Form';
    };

    const renderForm = () => {
        if (formType === 'IHP') {
            return (
                <IHPForm
                    sharedData={sharedFormData}
                    updateSharedData={setSharedFormData}
                />
            );
        }
        return (
            <LifeInsuranceForm
                sharedData={sharedFormData}
                updateSharedData={setSharedFormData}
            />
        );
    };

    return (
        <div className="form-modal-overlay" style={{ position: 'relative', minHeight: '100vh', display: 'block', background: '#f8fafc' }}>
            <div className="form-modal-container" style={{ width: '100%', minHeight: '100vh', margin: '0', display: 'flex', flexDirection: 'column' }}>
                <div className="form-modal-header" style={{ padding: '20px 40px' }}>
                    <h3>📝 {getFormTitle()}</h3>
                </div>
                <div className="form-modal-body" style={{ flex: 1, padding: '20px' }}>
                    <div className="prototype-form-scope">
                        <div className="main-content">
                            {renderForm()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormPage;
