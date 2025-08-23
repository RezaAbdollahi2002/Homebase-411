import { useState, useEffect, useRef } from "react";
import axios from "axios";

const BASE_URL = "/api/chat/";

const Message = () => {
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [chatType, setChatType] = useState("direct");
  const [groupName, setGroupName] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [messageText, setMessageText] = useState("");

  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const employeeId = Number(localStorage.getItem("employee_id"));
  const employerId = Number(localStorage.getItem("employer_id") || "");
  const userId = employeeId || employerId;

  // Fetch team
  useEffect(() => {
    axios
      .get(`${BASE_URL}team`, { params: { employee_id: employeeId } })
      .then((res) => {
        if (res.data && res.data.team) setTeam(res.data.team);
      })
      .catch(() => setTeam([]));
  }, [employeeId]);

  // Create ChatUser if not exists
  useEffect(() => {
    const createChatUser = async () => {
      try {
        const payload = new URLSearchParams();
        if (employeeId) payload.append("employee_id", employeeId);
        if (employerId) payload.append("employer_id", employerId);
        payload.append("role", employeeId ? "employee" : "employer");
        payload.append("display_name", "Display Name");

        await axios.post(`${BASE_URL}chatuser`, payload);
      } catch (e) {
        console.error("Chat user creation failed:", e);
      }
    };
    if (employeeId || employerId) createChatUser();
  }, [employeeId, employerId]);

  // Fetch user's conversations
  const fetchConversations = async () => {
    const res = await axios.get(`${BASE_URL}conversations/${userId}`);
    setConversations(res.data);
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open conversation
  const openConversation = async (conv) => {
    setActiveConversation(conv);
    setMessages([]);

    if (ws.current) ws.current.close();

    const res = await axios.get(`${BASE_URL}messages/${conv.id}`);
    setMessages(res.data);

    ws.current = new WebSocket(`ws://localhost:8000/chat/ws/${conv.id}`);

    ws.current.onopen = () => console.log("Connected via WebSocket");

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg.message || msg]);
      } catch {
        console.log("Received:", event.data);
      }
    };

    ws.current.onclose = () => console.log("WebSocket closed");
  };

  // Send message
  const sendMessage = async (text) => {
    if (!activeConversation) return;
    const payload = new FormData();
    payload.append("conversation_id", activeConversation.id);
    payload.append("sender_id", userId);
    if (text) payload.append("text", text);
    if (file) payload.append("file", file);

    const res = await axios.post(`${BASE_URL}message`, payload);
    setMessages((prev) => [
      ...prev,
      {
        id: res.data.message_id,
        sender_id: userId,
        text: text,
        attachment_url: file ? URL.createObjectURL(file) : null,
        attachment_type: file ? "file" : null,
        created_at: new Date().toISOString(),
      },
    ]);
    setFile(null);
    if (ws.current) ws.current.send(JSON.stringify({ text, sender_id: userId }));
  };

  // Toggle member selection
  const toggleMemberSelection = (member) => {
    if (chatType === "direct") {
      setSelectedMembers([member]);
    } else {
      const exists = selectedMembers.find(
        (m) => m.id === member.id && m.role === member.role
      );
      if (exists) {
        setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
      } else {
        setSelectedMembers([...selectedMembers, member]);
      }
    }
  };

  // Create conversation
  const createConversation = async () => {
    if (
      (chatType === "direct" && selectedMembers.length !== 1) ||
      (chatType === "group" && selectedMembers.length < 2)
    ) {
      alert("Select enough members!");
      return;
    }
    if (chatType === "group" && !groupName.trim()) {
      alert("Group name required!");
      return;
    }

    const participants =
      chatType === "direct"
        ? [userId, selectedMembers[0].id]
        : [userId, ...selectedMembers.map((m) => m.id)];

    const payload = {
      type: chatType,
      participants,
      name: chatType === "group" ? groupName : undefined,
    };

    await axios.post(`${BASE_URL}conversation`, payload);
    fetchConversations();
    setSelectedMembers([]);
    setGroupName("");
    setNewMessage(false);
  };

  // Helper for conversation name
  const getConversationName = (conv) => {
    if (conv.type === "group") return conv.name;
    const other = conv.participants?.find((p) => p.id !== userId);
    return other?.full_name || "Direct Chat";
  };

  const filteredTeam = team.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[100%]  bg-gray-50">
      {/* Conversation List / New Message */}
      {!activeConversation && (
        <div className="bg-white  flex flex-col h-[90vh] overflow-hidden">
          {!newMessage && (
            <>
              <button
                className="bg-purple-600 text-white px-2 py-1 rounded mb-3"
                onClick={() => setNewMessage(true)}
              >
                New Message
              </button>
              <h2 className="font-bold mb-2">Conversations</h2>
              <ul className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <li
                    key={conv.id}
                    className="cursor-pointer p-2 border-b hover:bg-gray-100 rounded"
                    onClick={() => openConversation(conv)}
                  >
                    <div className="flex justify-between">
                      <span>{getConversationName(conv)}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(conv.last_message_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {newMessage && (
            <div className="flex flex-col h-full">
              <input
                type="text"
                placeholder="Search team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-2 py-1 rounded mb-2"
              />
              <select
                value={chatType}
                onChange={(e) => {
                  setChatType(e.target.value);
                  setSelectedMembers([]);
                }}
                className="border px-2 py-1 rounded mb-2"
              >
                <option value="direct">Direct</option>
                <option value="group">Group</option>
              </select>
              {chatType === "group" && (
                <input
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="border px-2 py-1 rounded mb-2"
                />
              )}
              <ul className="flex-1 overflow-y-auto border rounded p-1 mb-2">
                {filteredTeam.map((member) => (
                  <li
                    key={`${member.id}-${member.role}`}
                    className={`flex items-center p-2 cursor-pointer rounded hover:bg-purple-50 ${
                      selectedMembers.includes(member) ? "bg-purple-100" : ""
                    }`}
                    onClick={() => toggleMemberSelection(member)}
                  >
                    <img
                      src={member.profile_pic || "/default-avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div className="font-semibold">{member.full_name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded mb-1"
                onClick={createConversation}
              >
                Create {chatType === "direct" ? "Direct" : "Group"} Chat
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                onClick={() => setNewMessage(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat View */}
      {activeConversation && (
        <div className="bg-white p-3 rounded shadow-md flex flex-col h-[90vh]">
          <button
            className="mb-2 text-blue-600"
            onClick={() => setActiveConversation(null)}
          >
            ← Back
          </button>
          <h2 className="font-bold mb-3 text-lg">
            {activeConversation.type === "group"
              ? activeConversation.name
              : getConversationName(activeConversation)}
          </h2>

          <div className="flex-1 overflow-y-auto flex flex-col space-y-2 mb-2 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id || Math.random()}
                className={`flex items-end ${
                  msg.sender_id === userId ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender_id !== userId && (
                  <img
                    src={msg.sender_profile || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                    msg.sender_id === userId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}
                  {msg.attachment_url && (
                    <a
                      href={msg.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs text-blue-700 mt-1"
                    >
                      📎 File
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center border-t border-t-gray-400 pt-2 space-x-2 text-xs md:text-sm">
            <input
              type="text"
              placeholder="Type a message"
              className="border px-3 py-2 rounded flex-1 "
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && messageText.trim()) {
                  sendMessage(messageText);
                  setMessageText("");
                }
              }}
            />

            <label className="bg-gray-200 px-1 py-1 rounded cursor-pointer">
              📎
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded "
              onClick={() => {
                if (messageText.trim()) {
                  sendMessage(messageText);
                  setMessageText("");
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
