import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
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
import { useSetRecoilState } from 'recoil'
import authScreenAtom from '../atoms/authAtom'
import useShowToast from '../hooks/useShowToast'
import userAtom from '../atoms/userAtom'

const SignupCard = () => {

  const setUser = useSetRecoilState(userAtom);
  const [showPassword, setShowPassword] = useState(false)
  const setAuthState = useSetRecoilState(authScreenAtom)
  const [inputs, setInputs] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  })
  const [updating, setUpdating] = useState(false)
  const showToast = useShowToast()

  const handleSignup = async (e) => {
    setUpdating(true)
    try {
      console.log(inputs)

      const response = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(inputs)
      })
      const data = await response.json();
      console.log(data)
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast("Success" , "Account successfully", "success")
      localStorage.setItem('user-threads', JSON.stringify(data));
      setUser(data);  
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally{
      setUpdating(false);
    }
  }

  return (
    <Flex
      align={'center'}
      justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Sign up
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.dark')}
          boxShadow={'lg'}
          p={8}>
          <Stack spacing={4}>
            <form>
              <HStack>
                <Box>
                  <FormControl isRequired>
                    <FormLabel>Full name</FormLabel>
                    <Input
                      type="text"
                      onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                      value={inputs.name}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl isRequired>
                    <FormLabel >Username</FormLabel>
                    <Input
                      type="text"
                      onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                      value={inputs.username}
                    />
                  </FormControl>
                </Box>
              </HStack>
              <FormControl isRequired>
                <FormLabel marginTop={3}>Email address</FormLabel>
                <Input
                  type="email"
                  onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                  value={inputs.email}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel marginTop={3}>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                    value={inputs.password}
                  />
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
                  loadingText="Sining in"
                  size="lg"
                  marginTop={3}
                  bg={useColorModeValue("gray.600", "gray.700")}
                  color={'white'}
                  _hover={{
                    bg: useColorModeValue("gray.700", "gray.800"),

                  }}
                  onClick={handleSignup}
                  isLoading={updating}
                >
                  Sign up
                </Button>
              </Stack>
            </form>
            <Stack pt={6}>
              <Text align={'center'}>
                Already a user? <Link onClick={() => setAuthState('login')} color={'blue.400'}>Login</Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  )
}

export default SignupCard