import { PremiumHeader } from '@/components/premium-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useRef } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View, ScrollView, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiOriginUrl } from '@/services/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hi there! I am your AI Study Assistant. What would you like to learn today?',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${getApiOriginUrl()}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: data.data.response,
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: 'Sorry, I am having trouble connecting to my knowledge base right now. ' + (data.message || ''),
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
         id: (Date.now() + 1).toString(),
         role: 'model',
         content: 'Could not reach the server. Please make sure the backend is running.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PremiumHeader
        title="AI Study Assistant"
        subtitle="Powered by orbiting knowledge"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer} 
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow, 
                msg.role === 'user' ? styles.messageRowUser : styles.messageRowModel
              ]}
            >
              {msg.role === 'model' && (
                <View style={[styles.avatarContainer, { backgroundColor: ThemeColors.deepBlue }]}>
                   <IconSymbol name="sparkles" size={16} color={ThemeColors.orange} />
                </View>
              )}
              
              <View 
                style={[
                  styles.messageBubble,
                  msg.role === 'user' 
                    ? [styles.userBubble, { backgroundColor: ThemeColors.orange }] 
                    : [styles.modelBubble, { backgroundColor: colors.card, borderColor: colors.border }]
                ]}
              >
                <ThemedText style={[styles.messageText, msg.role === 'user' && { color: '#fff' }]}>
                  {msg.content}
                </ThemedText>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={ThemeColors.orange} />
              <ThemedText style={{ marginLeft: 10, fontSize: 13, opacity: 0.6 }}>Thinking...</ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder="Ask a question..."
            placeholderTextColor={colors.icon}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <LinearGradient
              colors={[ThemeColors.orange, '#FF7A00']}
              style={styles.sendButtonGradient}
            >
              <IconSymbol name="arrow.up" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowModel: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
