'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleStart = (e?: React.FormEvent) => {
    e?.preventDefault(); // prevent form refresh

    if (!name.trim()) return alert('Enter your name');

    sessionStorage.setItem("chat_username", name.trim());

    const roomId = Math.random().toString(36).substring(2, 8);
    router.push(`/chat/${roomId}`);
  };

  return (
    <main className="min-h-screen  bg-gray-100 px-4 flex flex-col gap-5 items-center justify-center">
      <div className='flex items-center justify-center'>
        <form
          onSubmit={handleStart}
          className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">Start a New Chat</h2>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8759fc33]"
          />

          <button
            type="submit"
            className="w-full bg-[#8759fc] cursor-pointer hover:bg-[#5530b3] text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
          >
            Create Chat
          </button>

          <p className="text-sm text-gray-500 text-center">
            Share the generated link with a friend to start chatting.
          </p>
        </form>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600 px-4 max-w-md">
        <p>❤️ Created with love</p>
        <p className="mt-2">
          This messaging app is <strong>free to use</strong> by everyone.
          We do <strong>not store any data</strong> — all messages are exchanged in real-time.
          Refreshing the page will <strong>erase your chat</strong> permanently.
        </p>
      </div>
    </main>
  );
}
