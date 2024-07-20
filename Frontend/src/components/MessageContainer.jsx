import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import Message from './Message'
import MessageInputs from './MessageInputs'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import { useEffect, useRef, useState } from 'react';
import useShowToast from '../hooks/useShowToast'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'

const MessageContainer = () => {

    const [loadingMessage, setLoadingMessage] = useState(false)
    const [messages, setMessages] = useState([]);
    const showToast = useShowToast()
    const currentUser = useRecoilValue(userAtom)
    const selectedConversation = useRecoilValue(selectedConversationAtom)
    const { socket } = useSocket();
    const setConverastions = useSetRecoilState(conversationsAtom)
    const messageEndRef = useRef()

    useEffect(() => {
        socket.on("newMessage", (message) => {

            if (message.conversationId === selectedConversation._id) {
                setMessages((prevsMessg) => [...prevsMessg, message])
            }

            setConverastions((prev) => {
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
        return () => socket.off("newMessage");
    }, [socket, selectedConversation, setConverastions])

    useEffect(() => {
        const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id
        if (lastMessageIsFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId
            })
        }

        socket.on("messageSeen", ({conversationId}) => {
            if(selectedConversation._id === conversationId){
                setMessages(prev => {
                    const updateMessages = prev.map(message => {
                        if(!message.seen){
                            return{
                                ...message,
                                seen:true
                            }
                        }
                        return message
                    })
                    return updateMessages
                })
            }
        })
    }, [socket, currentUser._id, messages, selectedConversation])

    useEffect(() => {
        const getMessages = async () => {

            setLoadingMessage(true)
            setMessages([])
            try {
                if (selectedConversation.mock) {
                    return
                }
                const response = await fetch(`http://localhost:5000/api/messages/${selectedConversation.userId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                })
                const data = await response.json();
                if (data.error) {
                    showToast('Error', data.error, 'error');
                    return;
                }
                setMessages(data)
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingMessage(false);
            }
        }
        getMessages();
    }, [showToast, selectedConversation.userId, selectedConversation.mock])

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])


    return (
        <Flex
            flex={70}
            bg={useColorModeValue("gray.200", "gray.dark")}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
        >
            <Flex w={"full"} h={12} alignItems={"center"} gap={2} p={2}>
                <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
                <Text display={"flex"} alignItems={"center"}>
                    {selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} />
                </Text>
            </Flex>
            <Divider />
            <Flex flexDirection={"column"} gap={4} my={4} p={2}
                height={"400px"} overflowY={"auto"} className='custom-scrollbar'
            >
                {loadingMessage && ([...Array(5)].map((_, i) => (
                    <Flex
                        key={i}
                        gap={2}
                        alignItems={"center"}
                        p={1}
                        borderRadius={"md"}
                        alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                    >
                        {i % 2 === 0 && <SkeletonCircle />}
                        <Flex flexDirection={"column"} gap={2}>
                            <Skeleton h={"8px"} w={"150px"} />
                            <Skeleton h={"8px"} w={"150px"} />
                            <Skeleton h={"8px"} w={"150px"} />
                        </Flex>
                        {i % 2 !== 0 && <SkeletonCircle />}
                    </Flex>
                )))}
                {!loadingMessage &&
                    messages.map((message) => (
                        <Flex key={message._id}
                            direction={"column"}
                            ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}>
                            <Message
                                message={message}
                                ownMessage={currentUser._id === message.sender}
                            />
                        </Flex>
                    ))
                }
            </Flex>
            <MessageInputs setMessages={setMessages} />
        </Flex>
    )
}

export default MessageContainer