"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { Scrollbars } from "react-custom-scrollbars-2";
import { TailSpin } from "react-loader-spinner";
import { Button } from "@/components/ui/button";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import Footer from "@/components/footer";
import { Header } from "@/components/header";

export default function ChatBot() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3-70b-chat");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const scrollbarsRef = useRef(null);

  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      const stateToPersist = JSON.stringify(chatSessions);
      localStorage.setItem("chatSessions", stateToPersist);
    }
  }, [chatSessions]);

  useEffect(() => {
    const storedSessions = localStorage.getItem("chatSessions");
    console.log("Recuperado do localStorage:", storedSessions); // Debugging
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions);
      console.log("Sessões analisadas:", parsedSessions); // Debugging
      setChatSessions(parsedSessions);
    }
    // Recuperar o estado da barra lateral do localStorage
    const storedSidebarState = localStorage.getItem("isSidebarVisible");
    if (storedSidebarState !== null) {
      // Verifique se existe a chave
      setIsSidebarVisible(JSON.parse(storedSidebarState));
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible((prevState) => {
      const newState = !prevState;
      localStorage.setItem("isSidebarVisible", JSON.stringify(newState)); // Salvar o novo estado no localStorage
      return newState;
    });
  };

  // Dividir a mensagem do bot em parágrafos para cada nova linha
  const formatBotResponse = (text) => {
    return text.split("\n").map((item, index) => <p key={index}>{item}</p>);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setLoading(true);
    const userMessage = { author: "user", text: inputMessage };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");

    const backendPayload = {
      modelName: selectedModel,
      messages: messages
        .map((msg) => ({
          role: msg.author === "user" ? "user" : "assistant",
          content: msg.text,
        }))
        .concat({ role: "user", content: inputMessage }),
    };

    try {
      const response = await axios.post(
        "https://visionaryaibackend.onrender.com/api/chat/generate",
        backendPayload
      );
      const botResponseText = response.data;
      const botMessage = { author: "bot", text: botResponseText };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      const activeSessionIndex = chatSessions.findIndex(
        (session) => session.isActive
      );
      if (activeSessionIndex !== -1) {
        const updatedSession = {
          ...chatSessions[activeSessionIndex],
          messages: [
            ...chatSessions[activeSessionIndex].messages,
            userMessage,
            botMessage,
          ],
        };
        setChatSessions((prevSessions) => {
          const updatedSessions = [...prevSessions];
          updatedSessions[activeSessionIndex] = updatedSession;
          return updatedSessions;
        });
      } else {
        const newSessionTopic =
          inputMessage.length > 20
            ? `${inputMessage.slice(0, 20)}...`
            : inputMessage.slice(0, 20);
        const newSession = {
          id: Date.now(),
          topic: newSessionTopic || "Novo Chat", // Se inputMessage estiver vazio, use "Novo Chat"
          messages: [...messages, userMessage, botMessage],
          isActive: true,
        };
        setChatSessions((prevSessions) => [...prevSessions, newSession]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setChatSessions((prevSessions) =>
      prevSessions.map((session) => ({
        ...session,
        isActive: false,
      }))
    );
    setMessages([]);
  };
  const handleDeleteSession = (sessionId) => {
    const updatedSessions = chatSessions.filter(
      (session) => session.id !== sessionId
    );
    setChatSessions(updatedSessions);
    // Atualizar imediatamente o localStorage após a atualização do estado
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
  };

  const handleDeleteAllSessions = () => {
    setChatSessions([]);
    setMessages([]);
    // Limpar os dados específicos do localStorage
    localStorage.removeItem("chatSessions");
  };

  return (
    <>
      <Header />
      <div className="flex h-screen bg-gray-900 text-white">
        {isSidebarVisible && (
          <aside className="w-60 flex flex-col bg-[#1e293b] border-r border-gray-700 h-screen">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Button
                className="bg-gray-800 text-white text-sm py-2 px-4 rounded hover:bg-gray-700"
                onClick={handleNewSession}
              >
                Novo Chat
              </Button>
              <Button
                className="bg-red-600 text-white text-sm py-2 px-4 rounded hover:bg-red-500"
                onClick={handleDeleteAllSessions}
              >
                Deletar tudo
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatSessions
                .slice()
                .reverse()
                .map((session, index) => (
                  <div
                    key={index}
                    className="p-4 cursor-pointer hover:bg-gray-800 flex justify-between items-center border-b border-gray-700"
                  >
                    <div
                      className="flex-1"
                      onClick={() => setMessages(session.messages)}
                    >
                      <div className="font-semibold">{session.topic}</div>
                      <div className="text-sm text-gray-400">
                        {session.messages[
                          session.messages.length - 1
                        ].text.slice(0, 50)}
                        {session.messages[session.messages.length - 1].text
                          .length > 50 && "..."}
                      </div>
                    </div>
                    <TrashIcon
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar selecionar a sessão ao clicar no ícone de exclusão
                        handleDeleteSession(session.id);
                      }}
                    />
                  </div>
                ))}
            </div>
          </aside>
        )}
        <TextIcon
          className="text-white min-w-6 min-h-6 max-w-8 max-h-8 ml-4 mt-4 cursor-pointer hover:text-gray-400"
          onClick={toggleSidebar}
          title="Alternar barra lateral"
        />

        <main className="flex-1 flex flex-col bg-[#0f172a]">
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <Select
              onValueChange={(value) => setSelectedModel(value)}
              value={selectedModel}
            >
              <SelectTrigger id="modelSelect" className="bg-gray-800 text-white hover:bg-gray-700">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="llama-3-70b-chat">LLaMA3 70b</SelectItem>
                <SelectItem value="mistral-8x7b-instruct-v0.1">
                  Mistral 8x7B
                </SelectItem>
                <SelectItem value="gemma-7b-it">Gemma 7b</SelectItem>
              </SelectContent>
            </Select>
          </header>
          <div className="flex-1 p-6 flex flex-col space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col justify-center items-center space-y-6">
                <h1 className="text-3xl font-semibold">
                  Com o que eu posso te ajudar hoje?
                </h1>
              </div>
            )}

            <div className="chat-messages-container flex-1 h-0 overflow-hidden">
              <Scrollbars
                autoHide
                autoHideTimeout={1000}
                autoHideDuration={200}
                ref={scrollbarsRef}
                style={{ width: "100%", height: "100%" }}
                renderView={(props) => (
                  <div {...props} className="custom-scrollbars-container" />
                )}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      msg.author === "user"
                        ? "justify-start mb-2"
                        : "justify-end mb-2"
                    } w-full`}
                  >
                    {msg.author === "user" ? (
                      <Avatar>
                        <AvatarImage src="https://i.pinimg.com/736x/61/f7/5e/61f75ea9a680def2ed1c6929fe75aeee.jpg" />
                        <AvatarFallback>Usuário</AvatarFallback>
                      </Avatar>
                    ) : null}
                    <div
                      className={`max-w-[70%] p-2 rounded-md ${
                        msg.author === "user"
                          ? "bg-gray-700 text-white"
                          : "bg-[#1789AB] text-white"
                      }`}
                    >
                      {msg.author === "bot" ? (
                        formatBotResponse(msg.text)
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                    {msg.author === "bot" ? (
                      <Avatar>
                        <AvatarImage src="https://cdn.discordapp.com/attachments/796806130747703360/1258036417582338119/image-removebg-preview.png?ex=6687e6b7&is=66869537&hm=cd12af77719cd0afcfd54bce963a0c371c505b923f08efd0a2c46b2e7e401e04&" />
                        <AvatarFallback>ChatBot</AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                ))}
                {loading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "10px",
                    }}
                  >
                    <TailSpin color="#FFFFFF" height={20} width={20} />
                  </div>
                )}
              </Scrollbars>
            </div>

            <div className="w-full flex items-center p-4 bg-gray-800 rounded-md">
              <Input
                className="flex-1 bg-transparent border-none placeholder-gray-500 text-white"
                placeholder="Escreva sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button className="ml-4 bg-blue-600 text-white hover:bg-blue-500" onClick={handleSendMessage}>
                Enviar
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
            O ChatBot pode cometer erros. Considere verificar as informações importantes.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

function TextIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 6.1H3" />
      <path d="M21 12.1H3" />
      <path d="M15.1 18H3" />
    </svg>
  );
}
const TrashIcon = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor" // Permite que a cor de preenchimento seja alterada via props
    >
      <g data-name="Layer 5">
        <path d="M13.39 13a1 1 0 0 0-.91 1.08l.52 6A1 1 0 0 0 14 21h.09A1 1 0 0 0 15 19.91l-.53-6A1 1 0 0 0 13.39 13zM17.53 13.94l-.53 6A1 1 0 0 0 17.91 21H18a1 1 0 0 0 1-.91l.52-6a1 1 0 0 0-2-.17z"></path>
        <path d="M27,6H20V5a3,3,0,0,0-3-3H15a3,3,0,0,0-3,3V6H5A1,1,0,0,0,5,8H6.09L7.64,23.5a5,5,0,0,0,5,4.5h6.76a5,5,0,0,0,5-4.5L25.91,8H27a1,1,0,0,0,0-2ZM14,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H14Zm8.37,18.3a3,3,0,0,1-3,2.7H12.62a3,3,0,0,1-3-2.7L8.1,8H23.9Z"></path>
      </g>
    </svg>
  );
};
