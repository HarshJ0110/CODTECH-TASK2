import React, { useEffect, useState } from 'react'
import { Avatar, Flex, Box, Image, Text, useBreakpointValue, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button, ModalFooter, useColorModeValue, Spinner, Divider } from '@chakra-ui/react'
import Actions from '../components/Actions'
import Comments from '../components/Comments'
import useGetUserProfile from '../hooks/useGetUserProfile'
import useShowToast from '../hooks/useShowToast'
import { useNavigate, useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { DeleteIcon } from '@chakra-ui/icons'
import postsAtom from '../atoms/postAtom'


const PostPage = () => {

    const { user, loading } = useGetUserProfile();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const showToast = useShowToast();
    const { pid } = useParams();
    const currentUser = useRecoilValue(userAtom);
    const imageHeight = useBreakpointValue({ base: 60, md: 80 });
    const navigate = useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [Loading, setLoading] = useState(false)

    const currentPost = posts[0];

    const handleDeletePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/posts/delete/${currentPost._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })

            const data = await response.json();

            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            showToast("Sucess", "Post deleted successfully", "success");
            navigate(`/${user.username}`);

        } catch (error) {
            showToast("Error", error.message, "error")
            setUser(null)
        } finally{
            setLoading(false);
        }
    }


    useEffect(() => {
        const getPost = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${pid}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                })

                const data = await response.json();

                if (data.error) {
                    showToast('Error', data.error, 'error');
                    return;
                }
                console.log(data)
                setPosts([data])

            } catch (error) {
                showToast("Error", error.message, "error")
                setPosts(null)
            }
        }
        getPost();
    }, [pid, showToast, setPosts])


    if (!user && loading) {
        return <Flex justifyContent={"center"} alignItems={"center"}><Spinner size={"xl"} /></Flex>
    }

    if (!currentPost) {
        return null
    }

    return (
        <>
            <Flex>
                <Flex w={'full'} alignItems={"center"} gap={3}>
                    <Avatar size={"md"} name={user.username} src={user.profilePic} />
                    <Flex w={"full"} alignItems={"center"}>
                        <Text fontSize={"sm"} fontWeight={"bold"}>
                            {user.username}
                        </Text>
                        <Image src='/verified.png' w={4} h={4} ml={1}></Image>
                    </Flex>
                </Flex>
                <Flex gap={4} alignItems={"center"}>
                    <Text fontSize={"sm"} width={36} textAlign={"right"} color={"gray.light"}>
                        {formatDistanceToNow(new Date(currentPost.createdAt))} ago
                    </Text>
                    {user?._id === currentUser?._id && (<DeleteIcon size={20} cursor={"pointer"} onClick={onOpen}/>)}
                </Flex>
            </Flex>
            <Text my={3}>{currentPost.text}</Text>
            {currentPost.img &&
                <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
                    <Image src={currentPost.img} w={"full"} height={imageHeight} />
                </Box>
            }

            <Flex gap={3} my={3}>
                <Actions post={currentPost} postedBy={currentPost.postedBy} />
            </Flex>
            <Divider my={4} />


            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg={useColorModeValue('white', 'gray.dark')}>
                    <ModalHeader mt={16}>Are you sure you want to delete this post ?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                    </ModalBody>

                    <ModalFooter >
                        <Button variant='ghost' onClick={handleDeletePost} bg={useColorModeValue('gray.300', 'gray.dark')} isLoading={Loading}>Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Flex justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text fontSize={"2xl"}>👋</Text>
                    <Text color={"gray.light"}>Get the app to like, reply and post.</Text>
                </Flex>
                <Button>Get</Button>
            </Flex>
            <Divider my={4} />

            {currentPost.replies.map((reply, index) => (
                <Comments
                key={index}
                comment={reply}
                lastComment={reply._id === currentPost.replies[currentPost.replies.length -1]._id}
            />
            ))}
            
        </>
    )
}

export default PostPage