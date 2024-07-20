import { Box, Flex, VStack, Text, Avatar, Button } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import useShowToast from '../hooks/useShowToast'
import { useRecoilValue } from "recoil";
import { Link } from 'react-router-dom'
import userAtom from '../atoms/userAtom';
import { useState } from 'react';
import LogoutButton from './LogoutButton';

const UserHeader = ({ user }) => {
    const showToast = useShowToast()
    const currentUser = useRecoilValue(userAtom)
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id))
    const [updating, setUpdating] = useState(false)

    const copyUrl = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast('Account created', 'Profile link copied', 'success')
        })
    }

    const handleFollowUnfollow = async () => {
        if(!currentUser){
            showToast("Error" , "Please Login to follow", "error")   
        }

        setUpdating(true)
        try {
            const response = await fetch(`http://localhost:5000/api/users/follow/${user?._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })

            const data = await response.json();

            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }

            if (following) {
                showToast("Success", `Unfollowed ${user?.name}`, "success")
                user.followers.pop();
            } else {
                showToast("Success", `Followed ${user?.name}`, "success")
                user.followers.push(currentUser?._id);
            }

            setFollowing(!following)

        } catch (error) {
            showToast('Error', error.message, 'error');
        } finally{
            setUpdating(false);
        }
    }

    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>
                        {user?.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>
                            {user?.username}
                        </Text>
                        <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} px={2} borderRadius={"full"}>thread.net</Text>
                    </Flex>
                </Box>
                <Box>
                    {user?.profilePic && <Avatar name={user?.name} src={user?.profilePic} size={{ base: "md", md: "xl" }} />}
                    {!user?.profilePic && <Avatar name={user?.name} src='https://bit.ly/broken-link' size={{ base: "md", md: "xl" }} />}

                </Box>
            </Flex>
            <Text>
                {user?.bio}
            </Text>
            {currentUser?._id === user?._id && (
                <Flex gap={4}>
                <Link to={'/update'}>
                    <Button size={"sm"}>Edit Profile</Button>
                </Link>
                <LogoutButton/>
                </Flex>
            )}

            

            {currentUser?._id !== user?._id && (
                <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
                    {following ? "Unfollow" : "Follow"}
                </Button>
            )}
            <Flex w={'full'} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    {/* {console.log(user)} */}
                    <Text color={"gray.light"}>{user?.followers?.length} followers</Text>
                    <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
                    <Text color={"gray.light"}>{user?.following?.length} following</Text>
                    {/* <Link color={"gray.light"}>Instagram.com</Link> */}
                </Flex>
                <Flex>
                    {/* <Box className='icon-container'>
                        <BsInstagram size={24} cursor={"pointer"} />
                    </Box> */}
                    <Box className='icon-container'>
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg={"gray.dark"}>
                                    <MenuItem bg={"gray.dark"} onClick={copyUrl}>
                                        Copy link
                                    </MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </Flex>
            </Flex>

            <Flex w={"full"}>
                <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Posts</Text>
                </Flex>
                <Flex flex={1} borderBottom={"1px solid gray"} justifyContent={"center"} color={"gray.light"} pb={3} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Replies</Text>
                </Flex>
            </Flex>
        </VStack>
    )
}

export default UserHeader