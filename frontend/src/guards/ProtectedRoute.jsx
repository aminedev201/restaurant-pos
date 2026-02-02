import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/Authcontext';
import { ROUTES } from '../config/routes';
import Loading from '../components/common/Loading';


const GuestRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Loading />
        );
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return children;
};

GuestRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default GuestRoute;