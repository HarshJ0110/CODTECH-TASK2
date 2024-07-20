import { Box, Container } from "@chakra-ui/react"
import { Navigate, Route, Routes } from "react-router-dom";
import UserPage from "./pages/UserPage";
import Header from "./components/Header";
import PostPage from "./pages/PostPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import ChatPage from "./pages/ChatPage";

function App() {

  const user = useRecoilValue(userAtom);
  console.log(user);
  return (
    <Box position={"relative"} w={"full"} >
    <Container maxW="620px">
      <Header />
      <Routes>
        <Route path='/' element={user ? <HomePage /> : <Navigate to={'/auth'} />}> </Route>
        <Route path='/auth' element={user ? <Navigate to={'/'} /> : <AuthPage />}> </Route>
        <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to={'/'} />}> </Route>
        <Route path='/:username' element={<UserPage />}> </Route>
        <Route path='/:username/post/:pid' element={<PostPage />}></Route>
        <Route path='/chat' element={user ? <ChatPage/> : <Navigate to={'/'} />}></Route>
      </Routes>
    </Container>
    </Box>
  )
}

export default App
