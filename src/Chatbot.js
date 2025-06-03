    import React, {useState} from 'react';
    import {
        View,
        Text,
        TextInput,
        TouchableOpacity,
        ActivityIndicator,
        StyleSheet,
        FlatList,
        KeyboardAvoidingView,
        Platform
    } from 'react-native';
    import {speak, isSpeakingAsync, stop} from 'expo-speech';
    import { API_KEY } from '../Constants';
    import axios from 'axios';
    import ChatItem from './ChatItem';

    const ChatBot = () => {
        const [chat, setChat] = useState([]);
        const [textInput, setTextInput] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [isSpeaking, setIsSpeaking] = useState(false);

        const handleTextInput = async () => {
            //Add text input to chat
            let newChat = [
                ...chat,
                {
                    role: 'user',
                    parts: [{text: textInput}],
                }];

                setLoading(true);
                try {
                    const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                        {
                            contents: newChat,
                        }
                    );
                    console.log('response', response);
                    const modelResponse = 
                    response.data?.candidates[0]?.content?.parts?.[0]?.text || '';

                    if (modelResponse) {
                        //Add model response to chat
                        const newChatWithModel = [
                            ...newChat,
                            {
                                role: 'model',
                                parts: [{text: modelResponse}],
                            },
                        ];
                        setChat(newChatWithModel);
                        setTextInput('');
                    }
                } catch (error) {
                    console.error('error', error);
                    console.error('error.response', error.response);
                    setError('Sorry and error occurred. Please try again later.');
                } finally {
                    setLoading(false);
                }
        }

        const handleSpeak = async (text) => {
            if (isSpeaking) {
                //Stop speaking
                stop();
                setIsSpeaking(false);
            } else {
                // Start speaking
                if (! (await isSpeakingAsync())) {
                    speak(text);
                    setIsSpeaking(true);
                }
            }
        }

        const renderChatItem = ({ item }) => {
            return (
                <ChatItem 
                    role={item.role}
                    text={item.parts[0].text}
                    onSpeak={() => handleSpeak(item.parts[0].text)}
                />
            )
        }

        return (
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -20}
            >
                <Text style={styles.title}>Gemini Chatbot</Text>
                {loading && <ActivityIndicator style={styles.loading} color="#0096FF" />}
                <FlatList 
                    data={chat}
                    renderItem={renderChatItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.chatContainer}
                    showsVerticalScrollIndicator={false}
                />
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.textInput}
                        value={textInput}
                        onChangeText={setTextInput}
                        placeholder="Type a message..."
                        placeholderTextColor="gray"
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleTextInput}>
                        <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </KeyboardAvoidingView>
        )
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            padding: 20,
        },
        title: {
            fontSize: 26,
            fontWeight: 'bold',
            marginBottom: 20,
            marginTop: 40,
            textAlign: 'center',
            color: '#0096FF',
        },
        chatContainer: {
            flexGrow: 1,
            justifyContent: 'flex-end',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 10, // Thêm margin bottom
        },
        textInput: {
            flex: 1,
            height: 40,
            borderWidth: 2,
            borderColor: '#0096FF',
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
            color: 'black',
            backgroundColor: '#fff',
        },
        sendButton: {
            padding: 10,
            backgroundColor: '#0096FF',
            borderRadius: 5,
        },
        sendText: {
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
        },
        loading: {
            marginTop: 20,
        },
        error: {
            color: 'red',
            marginTop: 20,
        },
    });

    export default ChatBot;