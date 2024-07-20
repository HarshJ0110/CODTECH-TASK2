import { Avatar, Box, Flex, Image, Text } from '@chakra-ui/react'
import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { selectedConversationAtom } from '../atoms/messagesAtom'
import { BsCheck2All } from 'react-icons/bs'

const Message = ({ message, ownMessage }) => {

    const user = useRecoilValue(userAtom)
    const selectedConversation = useRecoilValue(selectedConversationAtom)

    return (
        <>
            {ownMessage ?
                (
                    <Flex gap={2} alignSelf={"flex-end"}>
                        {/* {false && ( */}
                            <Flex maxW={"350px"} bg={"green.400"} p={1} px={2} borderRadius={"md"}>
                                <Text color={"white"} >{message.text}</Text>
                                <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.700" : ""} fontWeight={"bold"}>
                                    <BsCheck2All size={16} />
                                </Box>
                            </Flex>
                        {/* )} */}

                        {/* {true && (
                            <Flex mt={5} w={'200px'}>
                                <Image src='/verified.png' alt='Message image' borderRadius={4}></Image>
                            </Flex>
                        )} */}
                        <Avatar w={7} h={7} src={user.profilePic} mr={2} />
                    </Flex>
                ) :
                (
                    <Flex gap={2} >
                        <Avatar w={7} h={7} src={selectedConversation.userProfilePic} />
                        {message.text && (
                            <Text maxW={"350px"} bg={"gray.400"} p={1} px={2} borderRadius={"md"} color={"black"}>
                                {message.text}
                            </Text>
                        )}
                        {message.img && (
                            <Flex mt={5} w={'200px'}>
                                <Image src='/verified.png' alt='Message image' borderRadius={4}></Image>
                            </Flex>
                        )}
                    </Flex>)
            }
        </>
    )
}

export default Message