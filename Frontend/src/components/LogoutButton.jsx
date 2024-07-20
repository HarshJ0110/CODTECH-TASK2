import { Button, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FiLogOut } from "react-icons/fi";
import useLogout from '../hooks/useLogout';

const LogoutButton = () => {
    const logout = useLogout();
    return (
        <Button size={"sm"} bg={useColorModeValue("gray.300", "gray.dark")} onClick={logout} >
            Logout 
        </Button>
    )
}

export default LogoutButton