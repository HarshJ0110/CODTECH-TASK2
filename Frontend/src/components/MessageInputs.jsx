import { Button, Flex, Image, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'
import { IoSendSharp } from 'react-icons/io5'
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue } from 'recoil'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import { BsFillImageFill } from 'react-icons/bs'
import { useRef } from 'react'

const MessageInputs = ({ setMessages }) => {
    const [messageText, setMessageText] = useState("")
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom)
    const [conversation, setConversations] = useRecoilState(conversationsAtom)
    const imageRef = useRef(null)
    const {onClose , isOpen} = useDisclosure()

    const handleInput = async (e) => {
        e.preventDefault();
        setMessageText(e.target.value)
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (messageText === "") {
            showToast("Error", "Enter message", "error")
            return
        }
        console.log(selectedConversation)

        try {
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    recipitentId: selectedConversation.userId
                }),
                credentials: 'include'

            })
            const data = await response.json();
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            console.log(data);
            setMessages((messages) => [...messages, data])
            setConversations(prevConvs => {
                const updateConversation = prevConvs.map(conversation => {
                    if (conversation._id === selectedConversation._id) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: messageText,
                                sender: data.sender
                            }
                        }
                    }
                    return conversation
                })
                return updateConversation
            })
            setMessageText("")

        } catch (error) {
            showToast("Error", error.message, "error");
        }

    }

    return (
        <Flex>
            <form onSubmit={handleSendMessage} style={{flex:95}}>
                <InputGroup>
                    <Input
                        w={"full"}
                        placeholder='Type a message'
                        value={messageText}
                        onChange={handleInput}
                    />
                    <InputRightElement onClick={handleSendMessage}>
                        <IoSendSharp />
                    </InputRightElement>
                </InputGroup>
            </form>

            <Flex flex={5} cursor={"pointer"} justifyContent={'center'} p={2}>
                <BsFillImageFill  size={20} onClick={() => imageRef.current.click()}  />
                <Input type='file' hidden ref={imageRef} />
            </Flex>
            <Modal isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent bg={useColorModeValue('white', 'gray.dark')}>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex mt={5} w={'full'}>
                            <Image src='/verified.png' />
                        </Flex>
                        <Flex justifyContent={"flex-end"} my={2}>
                            <IoSendSharp size={24} cursor={"pointer"} />
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default MessageInputs