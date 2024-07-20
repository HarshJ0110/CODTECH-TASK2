import React, { useEffect, useState } from 'react'
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue } from 'recoil'
import { Avatar, Flex, Box, Image, Text, useBreakpointValue, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button, ModalFooter, useColorModeValue } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import Actions from './Actions'
import { formatDistanceToNow } from 'date-fns'
import { DeleteIcon } from '@chakra-ui/icons'
import userAtom from '../atoms/userAtom'
import postsAtom from '../atoms/postAtom'


const Post = ({ post, postedBy }) => {

    if (!postedBy) {
        return null;
    }

    const { isOpen, onOpen, onClose } = useDisclosure()
    const imageHeight = useBreakpointValue({ base: 60, md: 80 });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState()
    const [posts, setPosts] = useRecoilState(postsAtom)
    const currentUser = useRecoilValue(userAtom);
    const showToast = useShowToast()

    const handleDeletePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/posts/delete/${post._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })

            const data = await response.json();

            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            showToast("Success", "Post deleted successfully", "success")
            setPosts(posts.filter((p) => p._id !== post._id))

        } catch (error) {
            showToast("Error", error.message, "error")
            setUser(null)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/profile/${postedBy}`, {
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
                setUser(data)

            } catch (error) {
                showToast("Error", error.message, "error")
                setUser(null)
            }
        }
        getUser();
    }, [postedBy, showToast])

    return (
        <Flex gap={3} mb={4} py={5}>
            <Flex flexDirection={"column"} alignItems={"center"}>
                <Link to={`/${user?.username}`}>
                    <Avatar size={"md"} name={user?.username} src={user?.profilePic} />
                </Link>
                <Box w={'1px'} h={"full"} bg={'gray.light'} my={2}></Box>
                <Box position={"relative"} w={"full"}>
                    <Avatar size={"xs"} name='Dan Abrahmov' src='https://bit.ly/dan-abramov' position={"absolute"} top={"0px"} left={"15px"} padding={"2px"} />
                    <Avatar size={"xs"} name='Ryan Florence' src='https://bit.ly/ryan-florence' position={"absolute"} bottom={"0px"} right={"-5px"} padding={"2px"} />
                    <Avatar size={"xs"} name='Kent Dodds' src='https://bit.ly/kent-c-dodds' position={"absolute"} bottom={"0px"} left={"4px"} padding={"2px"} />
                </Box>
            </Flex>
            <Flex flex={1} flexDirection={"column"} gap={2}>
                <Flex justifyContent={"space-between"} w={"full"}>
                    <Link to={`/${user?.username}`}>
                        <Flex w={"full"} alignItems={"center"}>
                            <Text fontSize={"sm"} fontWeight={"bold"}>
                                {user?.username}
                            </Text>
                            <Image src='/verified.png' w={4} h={4} ml={1}></Image>
                        </Flex>
                    </Link>
                    <Flex gap={4} alignItems={"center"}>
                        <Text fontSize={"sm"} width={36} textAlign={"right"} color={"gray.light"}>
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                        </Text>
                        {user?._id === currentUser?._id && (<DeleteIcon size={20} cursor={"pointer"} onClick={onOpen} />)}
                    </Flex>
                </Flex>
                <Link to={`/${user?.username}/post/${post._id}`}>
                    <Text fontSize={"sm"} mb={2}>{post.text}</Text>
                    {post.img &&
                        <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
                            <Image src={post.img} w={"full"} h={imageHeight} />
                        </Box>
                    }
                </Link>
                <Flex gap={3} my={1}>
                    <Actions post={post} />
                </Flex>
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={useColorModeValue('white', 'gray.dark')}>
                    <ModalHeader mt={16}>Are you sure you want to delete this post ?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    </ModalBody>

                    <ModalFooter >
                        <Button variant='ghost' onClick={handleDeletePost} bg={useColorModeValue('gray.300', 'gray.dark')} isLoading={loading}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default Post