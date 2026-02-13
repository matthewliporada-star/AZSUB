import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// Import Scoped Styles
import '../../pages/AP/AP_Styles.css';
import '../../pages/AL/AL_Styles.css';

const MainLayout = ({ children }) => {
    const location = useLocation();

    // Determine the section based on path for scoping CSS
    const isAP = location.pathname.startsWith('/ap');
    const isAL = location.pathname.startsWith('/al');

    // Specific wrapper class
    let layoutClass = 'default-layout';
    if (isAP) layoutClass = 'ap-layout';
    else if (isAL) layoutClass = 'al-layout';

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className={`app-layout-wrapper ${layoutClass}`}>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
                <TopBar sidebarOpen={sidebarOpen} />
                <div className="container">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
