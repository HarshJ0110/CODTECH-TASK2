import { Avatar, AvatarBadge, Box, Flex, Image, Stack, Text, useColorMode, useColorModeValue, WrapItem } from '@chakra-ui/react'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from 'react-icons/bs'
import { selectedConversationAtom } from '../atoms/messagesAtom';

const Conversation = ({ conversation, isOnline }) => {

    // console.log(isOnline)
    const currentUser = useRecoilValue(userAtom)
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    const lastMessage = conversation.lastMessage;
    const user = conversation.participants[0];
    const colorMode = useColorMode()
    console.log("lastMessage", lastMessage)
    return (

        <Flex
            gap={4}
            alignItems={"center"}
            p={1}
            _hover={{
                cursor: "pointer",
                bg: useColorModeValue("gray.600", "gray.dark")
            }}
            borderRadius={"md"}
            onClick={() => setSelectedConversation({
                _id: conversation._id,
                userId: user?._id,
                userProfilePic: user?.profilePic,
                username: user?.username,
                mock: conversation.mock
            })}
            bg={selectedConversation?._id === conversation._id ? (colorMode === 'light' ? 'gray.400' : 'gray.dark') : ""}
        >

            <WrapItem>
                <Avatar size={{
                    base: "xs",
                    sm: "sm",
                    md: "md"
                }} src={user?.profilePic} alt={user?.username}>
                    {isOnline ? <AvatarBadge boxSize="1em" bg="green.500" /> : ""}
                </Avatar>
            </WrapItem>

            <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight={700} display={"flex"} alignItems={"center"}>
                    {user?.username} <Image src="/verified.png" w={4} h={4} ml={1} />
                </Text>
                <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
                    {currentUser?._id === lastMessage?.sender ? (
                        <Box color={lastMessage.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : ""}
                    {lastMessage?.text.length > 10 ? lastMessage?.text.substring(0, 10) + "..." : lastMessage.text}
                </Text>
            </Stack>
        </Flex>
    )
}

export default Conversation