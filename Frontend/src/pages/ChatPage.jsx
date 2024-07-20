import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom.js'
import { useRecoilState, useRecoilValue } from 'recoil'
import { BiConversation } from 'react-icons/bi'
import { SearchIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import MessageContainer from '../components/MessageContainer'
import Conversation from '../components/Conversation'
import useShowToast from '../hooks/useShowToast.jsx'
import userAtom from '../atoms/userAtom.js'
import { useSocket } from '../context/SocketContext.jsx'

const ChatPage = () => {

    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    const [conversations, setConversations] = useRecoilState(conversationsAtom)
    const [loadingConversation, setLoadingConversation] = useState(true)
    const [searchingUser, setSearchingUser] = useState(false)
    const [searchText, setSearchText] = useState('');
    const currentUser = useRecoilValue(userAtom);
    const { socket, onlineUsers } = useSocket()
    const showToast = useShowToast()

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchingUser(true)
        try {
            const response = await fetch(`http://localhost:5000/api/users/profile/${searchText}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            const data = await response.json();
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            const messagingYourSelf = currentUser._id === data._id
            if (messagingYourSelf) {
                showToast("Error", "You cannot message yourself", "error");
                return;
            }

            const conversationAlreadyExists = conversations.find(conversation => conversation.participants[0]._id === data._id);
            if (conversationAlreadyExists) {
                setSelectedConversation({
                    _id: conversationAlreadyExists._id,
                    userId: data._id,
                    username: data.username,
                    userProfilePic: data.profilePic
                })
                return
            }

            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: '',
                    sender: ''
                },
                _id: Date.now(),
                participants: [{
                    _id: data._id,
                    username: data.username,
                    profilePic: data.profilePic
                }]
            }
            setConversations(prevConvs => [...prevConvs, mockConversation])

        } catch (error) {
            showToast("Error", error.message, "error")
        } finally {
            setSearchingUser(false)
        }
    }

    useEffect(() => {
        socket?.on("newMessage", (message) => {

            if (message.conversationId === selectedConversation._id) {
                setMessages((prevsMessg) => [...prevsMessg, message])
            }

            setConversations((prev) => {
                const updatedConversation = prev.map((conversation) => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender
                            }
                        }
                    }
                    return conversation;
                })
                return updatedConversation
            })
        })
        return () => socket?.off("newMessage");
    }, [socket, setConversations])

    useEffect(() => {
        socket?.on("messageSeen", ({conversationId}) => {
            setConversations(prev => {
                const updateConversations = prev.map(conversation => {
                    if(conversation._id === conversationId){
                        return {
                            ...conversation,
                            lastMessage:{
                                ...conversation.lastMessage,
                                seen:true
                            }
                        }
                    }
                    return conversation
                })
                return updateConversations
            })
            
        })
    },[socket, setConversations])

    useEffect(() => {
        const getConversations = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/messages/conversations', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                })
                const data = await response.json();
                if (data.error) {
                    showToast('Error', data.error, 'error');
                    return;
                }
                setConversations(data)
            } catch (error) {
                showToast("Error", error.message, "error")
            } finally {
                setLoadingConversation(false)
            }
        }
        getConversations();
    }, [showToast])



    return (
        <Box position={"absolute"} left={"50%"} w={{
            base: "100%",
            md: "80%",
            lg: "750px"
        }}
            p={4}
            transform={"translateX(-50%)"}
        >
            <Flex
                gap={4}
                flexDirection={{
                    base: "column",
                    md: "row"
                }}
                maxW={{
                    sm: "400px",
                    md: "full"
                }}
                mx={"auto"}
            >
                <Flex flex={30}
                    gap={2}
                    flexDirection={"column"}
                    maxW={{
                        sm: "250px",
                        md: "full"
                    }}
                    mx={"auto"}
                >
                    <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
                        Your Conversations
                    </Text>
                    <form onSubmit={handleSearch}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input placeholder='Search a user' value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                            <Button size={"sm"} onClick={handleSearch} isLoading={searchingUser}>
                                <SearchIcon />
                            </Button>
                        </Flex>
                    </form>
                    {loadingConversation && ([0, 1, 2, 3, 4].map((_, i) => (
                        <Flex key={i} gap={4} alignItems={"center"} p={1} borderRadius={"md"}>
                            <Box>
                                <SkeletonCircle size={10} />
                            </Box>
                            <Flex w={"full"} flexDirection={"column"} gap={3}>
                                <Skeleton h={"10px"} w={"80px"} />
                                <Skeleton h={"8px"} w={"90%"} />
                            </Flex>
                        </Flex>
                    )))}


                    {!loadingConversation && (conversations.map((conversation) => (
                        <Conversation key={conversation._id} 
                        conversation={conversation} 
                        isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                        />
                    )))}


                </Flex>
                {!selectedConversation?._id && (
                    <Flex
                        flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDirection={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <BiConversation size={100} />
                        <Text fontSize={20}>Select a conversation to start messaging</Text>
                    </Flex>
                )}
                {selectedConversation?._id && <MessageContainer />}
            </Flex>
        </Box>
    )
}

export default ChatPage