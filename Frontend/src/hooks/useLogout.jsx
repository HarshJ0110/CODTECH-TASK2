import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from './useShowToast';

const useLogout = () => {
    const [_, setUser] = useRecoilState(userAtom);

    const logout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await response.json();
            console.log(data);
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            localStorage.removeItem("user-threads");
            setUser(null);
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };
    return logout;
}

export default useLogout;

