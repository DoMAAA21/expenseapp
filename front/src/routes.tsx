import { useRoutes, Navigate } from 'react-router-dom';


export default function Routes() {  
    return useRoutes([
        {
            path: '/',
            element: <Home />
        }
    ])
}