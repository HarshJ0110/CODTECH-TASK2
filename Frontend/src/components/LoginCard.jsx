import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {useSetRecoilState} from 'recoil'
import authScreenAtom from '../atoms/authAtom'
import useShowToast from '../hooks/useShowToast'
import userAtom from '../atoms/userAtom'

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false)
  const setAuthState = useSetRecoilState(authScreenAtom)
  const setUser = useSetRecoilState(userAtom)
  const [inputs, setInputs] = useState({
    username: '',
    password: ''
  })
  const [updating, setUpdating] = useState(false)
  const showToast = useShowToast()

  const handlelogin = async () => {
    setUpdating(true);
    try {
      console.log(inputs)

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
        credentials: 'include'

      })
      const data = await response.json();
      console.log(data)
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast("Success" , "LoggedIn successfully", "success")
      localStorage.setItem('user-threads', JSON.stringify(data));
      setUser(data);  
    } catch (error) {
      showToast("Error" ,error.message, "error")
    } finally{
      setUpdating(false)
    }
  }

  return (
    <Flex
      align={'center'}
      justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Login
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.dark')}
          boxShadow={'lg'}
          p={8}
          w={{
            base: "full",
            sm: "400px"
          }}
        >
          <form>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input type="text" value={inputs.username} onChange={(e) => setInputs({...inputs, username: e.target.value})}/>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input type={showPassword ? 'text' : 'password'} value={inputs.password} onChange={(e) => setInputs({...inputs, password: e.target.value})}/>
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() => setShowPassword((showPassword) => !showPassword)}>
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Logging in"
                  size="lg"
                  bg={useColorModeValue("gray.600", "gray.700")}
                  color={'white'}
                  _hover={{
                    bg: useColorModeValue("gray.700", "gray.800"),
                  }}
                  onClick={handlelogin}
                  isLoading={updating}
                  >
                  Login
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={'center'}>
                  Don't have an account? <Link onClick={() => setAuthState('signup')} color={'blue.400'}>Sign Up</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  )
}

export default LoginCard