import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Camera, 
  Image as ImageIcon, 
  X, 
  BookOpen, 
  Settings, 
  GraduationCap, 
  ChevronLeft,
  Loader2,
  RefreshCcw,
  Menu
} from 'lucide-react';
import { Message, EducationLevel, Subject, UserContext } from './types';
import { LEVELS, SUBJECTS } from './constants';
import { sendMessageToGemini } from './gemini';
import { MarkdownView } from './MarkdownView';

const App: React.FC = () => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Salam! 👋 I am **BK Academy**. \n\nI can help you with your homework, explain difficult concepts, and solve math problems step-by-step. \n\nSelect your class and subject to get started, or just ask me anything!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Settings / Context
  const [userContext, setUserContext] = useState<UserContext>({
    level: EducationLevel.SSC,
    subject: Subject.GENERAL
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- Handlers ---

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Optimistic AI message placeholder
      const loadingId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: loadingId, role: 'model', text: '', isLoading: true }]);

      const responseText = await sendMessageToGemini(messages, newMessage.text, userContext, newMessage.image);

      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: responseText, isLoading: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => [
        ...prev.filter(msg => !msg.isLoading),
        {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm sorry, I encountered an error while connecting to the server. Please check your internet connection and try again.",
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- UI Components ---

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-80 border-r border-emerald-100 flex flex-col`}>
      <div className="p-6 border-b border-emerald-100 bg-emerald-50">
        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xl mb-1">
          <GraduationCap className="w-8 h-8" />
          <span>BK Academy</span>
        </div>
        <p className="text-xs text-emerald-600 pl-1">Bangladesh's Smart Study Partner</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Level Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" /> Class / Level
          </label>
          <select 
            value={userContext.level}
            onChange={(e) => setUserContext({...userContext, level: e.target.value as EducationLevel})}
            className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Subject Focus
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setUserContext({...userContext, subject: subject as Subject})}
                className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  userContext.subject === subject 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-emerald-100 bg-emerald-50 text-xs text-center text-emerald-600">
        Powered by Google Gemini Pro
        <br/>
        NCTB Curriculum Supported
      </div>
      
      {/* Mobile close button */}
      <button 
        onClick={() => setIsSidebarOpen(false)}
        className="md:hidden absolute top-4 right-4 text-emerald-800"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 md:hidden text-emerald-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-bold text-gray-800 text-lg leading-tight md:hidden">BK Academy</h1>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full inline-block max-w-fit">
                {userContext.subject}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="text-gray-500 hover:text-emerald-600 transition-colors p-2"
            title="Clear Chat"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[85%] md:max-w-[75%] ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } items-start gap-3`}
              >
                {/* Avatar */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white border border-emerald-200 text-emerald-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <span className="font-bold text-xs">ME</span>
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                </div>

                {/* Bubble */}
                <div 
                  className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  {/* Image in message */}
                  {msg.image && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                      <img src={msg.image} alt="Uploaded content" className="max-w-full h-auto max-h-64 object-contain" />
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Solving problem...</span>
                    </div>
                  ) : (
                    <div className={msg.role === 'user' ? 'text-white' : ''}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <MarkdownView content={msg.text} />
                      )}
                      {msg.isError && (
                         <div className="mt-2 text-xs bg-red-100 text-red-600 p-2 rounded">
                           Network error. Please try again.
                         </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-lg z-20">
          {selectedImage && (
             <div className="mb-3 flex items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100 w-fit">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-md mr-3" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-1 bg-white rounded-full text-red-500 hover:bg-red-50 border border-red-100"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
          )}
          
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <button 
              onClick={triggerFileInput}
              disabled={isLoading}
              className="p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors flex-shrink-0 focus:ring-2 focus:ring-emerald-300 outline-none"
              title="Upload Image / Camera"
            >
              <Camera className="w-6 h-6" />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-4 py-2 border border-transparent focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedImage ? "Ask a question about this image..." : "Ask a question (Math, Science, English, etc.)..."}
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-gray-700 placeholder-gray-400"
                rows={1}
                style={{ minHeight: '44px' }}
                disabled={isLoading}
              />
            </div>

            <button 
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className={`p-3 rounded-full flex-shrink-0 transition-all shadow-md ${
                (!inputText.trim() && !selectedImage) || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
              }`}
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-gray-400">
            AI can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;