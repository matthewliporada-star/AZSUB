import { useApp } from '../../context/AppContext';
import MainLayout from './MainLayout';
import MPLayout from '../../pages/MP/MPLayout';

const ProfileLayout = ({ children }) => {
    const { userRole, loading } = useApp();

    if (loading) {
        return null; // or a loading spinner
    }

    if (userRole === 'MP' || userRole === 'MD') {
        return <MPLayout title="Profile Info">{children}</MPLayout>;
    }

    return <MainLayout>{children}</MainLayout>;
};

export default ProfileLayout;
