import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_BASE ? import.meta.env.VITE_API_BASE.replace("/api/v1","") : "");
const socket = io(SOCKET_URL, { autoConnect: false });
export default socket;
