import { useRoutes, Navigate } from 'react-router-dom';
import LoginPage from './domains/(auth)/login/page';


export default function Routes() {  
    return useRoutes([
        {
            path: '/login',
            element: <LoginPage />
        }
    ])
}