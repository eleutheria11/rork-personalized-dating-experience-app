import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GUIDE_ENABLED } from "@/constants/flags";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { X, Send, Bot, User } from "lucide-react-native";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function BookingAssistantScreen() {
  const { dateDetails } = useLocalSearchParams();
  const parsedDate = useMemo(() => {
    try {
      if (typeof dateDetails === "string") return JSON.parse(dateDetails);
    } catch (e) {
      console.log("BookingAssistant: failed to parse dateDetails", e);
    }
    return null as any;
  }, [dateDetails]);

  const scrollRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: parsedDate
        ? `I'll help you with "${parsedDate?.title}" at ${parsedDate?.location}. Do you want me to book a reservation, arrange transportation, or look for deals?`
        : "Hi! I'm your Date Guide. I can help you make reservations, get transportation, find discounts, and suggest the best times to go. What can I help you with today?",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: "You are a helpful dating assistant that helps with bookings, reservations, and date planning. Be concise and helpful." 
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ]
        }),
      });

      const data = await response.json();
      return (data as any).completion as string;
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: response,
      }]);
    },
  });

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    }]);
    setInputText("");
    
    sendMessage.mutate(userMessage);
  };

  const quickAsk = (text: string) => {
    setInputText("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: text }]);
    sendMessage.mutate(text);
  };

  if (!GUIDE_ENABLED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.7}>
            <X size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Date Guide</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#666' }}>Date Guide is currently disabled.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#FFF0F5"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Date Guide</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 0, web: 0 }) as number}
        style={styles.keyboardView}
      >
        <ScrollView 
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentInsetAdjustmentBehavior="always"
          onContentSizeChange={() => {
            try {
              scrollRef.current?.scrollToEnd({ animated: true });
            } catch (e) {
              console.log('BookingAssistant: scrollToEnd error', e);
            }
          }}
        >
          {parsedDate && (
            <View style={styles.quickActions}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
                <TouchableOpacity style={styles.chip} onPress={() => quickAsk(`Book a reservation for ${parsedDate?.title}${parsedDate?.reservationUrl ? ` using ${parsedDate?.reservationUrl}` : ""}`)}>
                  <Text style={styles.chipText}>Book reservation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => quickAsk(`Find transportation options to ${parsedDate?.address ?? parsedDate?.location} at the best price`)}>
                  <Text style={styles.chipText}>Get transportation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => quickAsk(`Look for deals, promos or discounts for ${parsedDate?.title} near ${parsedDate?.address ?? parsedDate?.location}`)}>
                  <Text style={styles.chipText}>Find deals</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
          {messages.map((message) => (
            <View
              key={message.id}
              testID={`message-${message.id}`}
              style={[
                styles.messageRow,
                message.role === "user" && styles.userMessageRow,
              ]}
            >
              {message.role === "assistant" && (
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={["#E91E63", "#F06292"]}
                    style={styles.avatar}
                  >
                    <Bot size={16} color="#fff" />
                  </LinearGradient>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === "user" && styles.userMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user" && styles.userMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
              {message.role === "user" && (
                <View style={styles.avatarContainer}>
                  <View style={styles.userAvatar}>
                    <User size={16} color="#E91E63" />
                  </View>
                </View>
              )}
            </View>
          ))}
          {sendMessage.isPending && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#E91E63" />
              <Text style={styles.loadingText}>Guide is typing...</Text>
            </View>
          )}
        </ScrollView>

        {parsedDate && (
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => router.push({ pathname: "/date-feedback" as any, params: { venueTitle: parsedDate?.title ?? "", venueLocation: parsedDate?.location ?? "" } } as never)}
            activeOpacity={0.8}
            testID="end-date-feedback"
          >
            <LinearGradient colors={["#4CAF50", "#66BB6A"]} style={styles.feedbackGradient}>
              <Text style={styles.feedbackText}>End date & leave feedback</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about your date..."
            placeholderTextColor="#999"
            multiline
            onFocus={() => {
              setTimeout(() => {
                try {
                  scrollRef.current?.scrollToEnd({ animated: true });
                } catch (e) {
                  console.log('BookingAssistant: scroll on focus error', e);
                }
              }, 50);
            }}
            testID="assistant-input"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!inputText.trim() || sendMessage.isPending}
          >
            <LinearGradient
              colors={["#E91E63", "#F06292"]}
              style={styles.sendGradient}
            >
              <Send size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  quickActions: {
    marginBottom: 10,
  },
  quickActionsRow: {
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    backgroundColor: "#FFF0F5",
    borderWidth: 1,
    borderColor: "#F8BBD0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    color: "#E91E63",
    fontWeight: "600",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-end",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E91E63",
  },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  userMessageBubble: {
    backgroundColor: "#E91E63",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 40,
  },
  loadingText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    alignItems: "flex-end",
    gap: 10,
  },
  feedbackButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  feedbackGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  feedbackText: {
    color: "#fff",
    fontWeight: "700",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});