import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import useShowToast from './useShowToast';

const useGetUserProfile = () => {
    const [user, setUser] = useState()
    const [loading, setLoading] = useState(true);
    const { username } = useParams()
    const showToast = useShowToast()

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/profile/${username}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                })
                const data = await response.json();
                // console.log(data)
                if (data.error) {
                    showToast('Error', data.error, 'error');
                    return;
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error.message, "error")
            } finally {
                setLoading(false);
            }
        }
        getUser()
    }, [username, showToast])
    return {loading, user}
}

export default useGetUserProfile