'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { FaImage } from "react-icons/fa";

import { IoClose } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmileFill } from 'react-icons/bs';
import Image from 'next/image';


type ChatMessage = {
  sender: string;
  text?: string;
  image?: string;
  timestamp?: string;
};

// Message payload from socket
type MessagePayload = {
  username: string;
  msg: string;
  timestamp: string;
};

// Image payload from socket
type ImagePayload = {
  username: string;
  image: string;
  timestamp: string;
};

export default function ChatRoom() {
  const { roomId } = useParams();
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);



  useEffect(() => {
    let name = sessionStorage.getItem('chat_username');
    if (!name) {
      const entered = prompt('Enter your name');
      name = entered?.trim() || `Guest-${Math.floor(Math.random() * 1000)}`;
      sessionStorage.setItem('chat_username', name);
    }
    setUsername(name);

    socketRef.current = io('https://freechatapp-backend.onrender.com');
    const socket = socketRef.current;

    socket.emit('join-room', { roomId, username: name });

    socket.on('user-joined', (name: string) => {
      setMessages((prev) => [...prev, {
        sender: 'system',
        text: `${name} joined the chat`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('receive-message', (data: any) => {
      // console.log('Incoming message:', data); // 🔍 Debug

      const { username, msg, timestamp }: MessagePayload = data
      setMessages((prev) => [...prev, { sender: username, text: msg, timestamp }]);
    });

    socket.on('receive-image', ({ username, image, timestamp }: ImagePayload) => {
      setMessages((prev) => [...prev, { sender: username, image, timestamp }]);
    });

    socket.on('user-left', (name: string) => {
      setMessages((prev) => [...prev, {
        sender: 'system',
        text: `${name} left the chat`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = { sender: username, text: msg, timestamp };
    setMessages((prev) => [...prev, newMessage]);
    socketRef.current?.emit('send-message', { username, msg, timestamp });
    setMsg('');
    setShowEmojiPicker(false);
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEmojiClick = (emojiData: any) => {
    setMsg((prev) => prev + emojiData.emoji);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('🔗 Chat link copied!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [...prev, {
        sender: username,
        image: base64Image,
        timestamp
      }]);

      socketRef.current?.emit('send-image', {
        image: base64Image,
        roomId,
        username,
        timestamp
      });
    };
    reader.readAsDataURL(file);
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMsg(e.target.value);

  };


  return (
    <div className="min-h-screen md:flex md:items-center md:justify-center bg-white md:bg-gray-100 md:px-4 ms:py-6">
      <div className="bg-white md:shadow-xl md:rounded-2xl p-4 md:p-6 w-full md:max-w-2xl flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base capitalize font-medium  text-gray-800">Hi 👋 {username}</h2>
          <button
            onClick={handleShare}
            className="text-sm bg-[#1fedcd] text-black cursor-pointer px-4 py-1.5 rounded-full hover:bg-[#12c2a6] justify-center items-center gap-1.5 flex transition"
          >
            <FaCopy className='text-black' size={14} />
            <span>Copy Invite Link</span>
          </button>
        </div>

        <div className="border border-gray-300 rounded-xl p-2 md:p-4 h-[75vh] md:h-80 overflow-y-auto bg-gray-50 space-y-2 text-sm">
          {messages.map((m, i) => {
            if (m.sender === 'system') {
              return (
                <div key={i} className="text-center text-xs text-gray-500 italic">
                  [{m.timestamp}] {m.text}
                </div>
              );
            }
            const isYou = m.sender === username;
            return (
              <div key={i} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-2 py-2 rounded-xl max-w-[70%] break-words ${isYou
                    ? 'bg-blue-200 text-black rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                >
                  {!isYou && (
                    <div className="text-xs text-gray-500 mb-1">{m.sender}</div>
                  )}
                  {m.text && <div>{m.text}</div>}
                  {m.image && (
                    <Image
                      src={m.image}
                      alt="shared"
                      className="rounded mt-2 max-w-full max-h-60 object-contain"
                    />
                  )}
                  <div className="text-[10px] text-right text-gray-400 mt-1">{m.timestamp}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-start gap-1 md:gap-2 relative">
          {/* Emoji Button */}

          {showEmojiPicker && (
            <div className="absolute bottom-12 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1  cursor-pointer rounded-md hover:bg-[#8759fc33]"
          >
            {showEmojiPicker ? <IoClose  className=' text-black text-xl md:text-2xl'  /> : <BsEmojiSmileFill  className='text-xl md:text-2xl text-yellow-500' />}
          </button>

          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="imageUpload"
          />

          <label htmlFor="imageUpload" className="p-1  cursor-pointer rounded-md hover:bg-[#8759fc33]">
            <FaImage className='text-xl md:text-2xl text-black' />
          </label>



          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message..."
            value={msg}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-grow text-base  px-4 p-1.5 md:py-2 max-h-[40] border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8759fc33]"
          />

          {/* Send Button */}
          <button
            onClick={sendMessage}
            className=" text-white px-2 py-2 text-xl md:text-2xl rounded-md cursor-pointer hover:bg-[#8759fc33] transition"
          >
            <IoSend  className='text-[#8759fc]' />
          </button>
        </div>
      </div>
    </div>
  );
}
