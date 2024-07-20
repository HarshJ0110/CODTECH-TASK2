import { Flex, useColorMode, Image } from '@chakra-ui/react'
import { Link } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import { RxAvatar } from "react-icons/rx"
import CreatePost from './CreatePost';
import LogoutButton from './LogoutButton';
import authScreenAtom from '../atoms/authAtom';
import { IoHomeOutline } from "react-icons/io5";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

const Header = () => {

  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const setAuthScreen = useSetRecoilState(authScreenAtom)

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"} mt={6} mb={12}>
      {user && (
        <Link to={'/'}>
          <IoHomeOutline size={26} />
        </Link>
      )}

      {!user && (
        <Link to={'/auth'} onClick={() => setAuthScreen('login')}>
          Login
        </Link>
      )}

      {user && (
        <Link to={`/${user.username}`}>
          <RxAvatar size={26} />
        </Link>
      )}
      <Image
        cursor={"pointer"}
        alt='logo'
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode}
      />
      
      {!user && (
        <Link to={'/auth'} onClick={() => setAuthScreen('signin')}>
          SignUp
        </Link>
      )}

      {user && <CreatePost />}

      {user && (
        <Link to={"/chat"}>
          <IoChatbubbleEllipsesOutline size={26} />
        </Link>
      )}

      {/* {user && <LogoutButton />} */}

    </Flex>
  )
}

export default Header