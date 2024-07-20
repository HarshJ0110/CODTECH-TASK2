import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useColorModeValue,
    Avatar,
    Center,
} from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import userAtom from '../atoms/userAtom'
import { useEffect, useRef, useState } from 'react'
import usePreviewImg from '../hooks/usePreviewImg'
import useShowToast from '../hooks/useShowToast'
import { useNavigate } from "react-router";

const UpdateProfilePage = () => {

    const showToast = useShowToast()

    const [user, setUser] = useRecoilState(userAtom)
    const [redirect, setRedirect] = useState(false)
    const [inputs, setInputs] = useState({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        bio: user.bio,
    })
    const [updating, setUpdating] = useState(false)
    const { handleImageChange, imgUrl } = usePreviewImg();

    const navigate = useNavigate();
    const fileRef = useRef(null)

    const handleSubmit = async (e) => {
        setUpdating(true);
        try {
            e.preventDefault()
            console.log(inputs)

            const response = await fetch(`http://localhost:5000/api/users/update/${user._id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            const data = await response.json();
            console.log(data)
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            showToast("Success", "Profile updated successfully", "success")
            setUser(data.user);
            setRedirect(true)
            localStorage.setItem('user-threads', JSON.stringify(data.user));
        } catch (error) {
            showToast("Error", error.message, "error")
        } finally {
            setUpdating(false);
        }
    }

    useEffect(() => {
        if (redirect) {
            navigate(`/${user.username}`);
        }
    }, [redirect, navigate]);

    return (
        <form onSubmit={handleSubmit}>
            <Flex
                align={'center'}
                justify={'center'}>
                <Stack
                    spacing={2}
                    w={'full'}
                    maxW={'md'}
                    bg={useColorModeValue('white', 'gray.dark')}
                    rounded={'xl'}
                    boxShadow={'lg'}
                    p={6}
                    my={12}>
                    <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }} mb={2}>
                        User Profile Edit
                    </Heading>
                    <FormControl id="userName">
                        <Stack direction={['column', 'row']} spacing={6}>
                            <Center>
                                <Avatar size="xl" src={imgUrl || user.profilePic}>
                                </Avatar>
                            </Center>
                            <Center w="full">
                                <Button w="full" onClick={() => fileRef.current.click()}>Change Icon</Button>
                                <Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
                            </Center>
                        </Stack>
                    </FormControl>
                    <FormControl id="fullName" isRequired>
                        <FormLabel>Full name</FormLabel>
                        <Input
                            placeholder="John Doe"
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                            value={inputs.name}
                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="userName" isRequired>
                        <FormLabel>User name</FormLabel>
                        <Input
                            placeholder="john doe"
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                            value={inputs.username}
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                        />
                    </FormControl>
                    <FormControl id="email" isRequired>
                        <FormLabel>Email address</FormLabel>
                        <Input
                            placeholder="johndoe@gmail.com"
                            _placeholder={{ color: 'gray.500' }}
                            type="email"
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                        />
                    </FormControl>
                    <FormControl id="bio">
                        <FormLabel>Bio</FormLabel>
                        <Input
                            placeholder="Your bio"
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                            value={inputs.bio}
                            onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
                        />
                    </FormControl>
                    {/* <FormControl id="password">
                        <FormLabel>Password</FormLabel>
                        <Input
                            placeholder="password"
                            _placeholder={{ color: 'gray.500' }}
                            type="password"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                        />
                    </FormControl> */}
                    <Stack spacing={6} marginTop={3} direction={['column', 'row']}>
                        <Button
                            bg={'red.400'}
                            color={'white'}
                            w="full"
                            _hover={{
                                bg: 'red.500',
                            }}>
                            Cancel
                        </Button>
                        <Button
                            bg={'green.400'}
                            color={'white'}
                            w="full"
                            _hover={{
                                bg: 'green.500',
                            }}
                            type='submit'
                            isLoading={updating}
                        >
                            Submit
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
        </form>
    )
}



export default UpdateProfilePage