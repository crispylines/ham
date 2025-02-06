// pages/api/rooms.js
import { v4 as uuidv4 } from 'uuid';

// **IN-MEMORY DATA - REPLACE WITH A DATABASE IN A REAL APPLICATION**
let rooms = {}; // RoomId: { name, lobbies: { lobbyId: { hamsters: [], status: 'waiting' } } }

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Get all rooms
        const roomList = Object.entries(rooms).map(([roomId, roomData]) => ({
            id: roomId,
            name: roomData.name,
            lobbyCount: Object.keys(roomData.lobbies).length
        }));
        return res.status(200).json(roomList);
    } else if (req.method === 'POST') {
        // Create a new room (Game Master action)
        const { roomName } = req.body;
        if (!roomName) {
            return res.status(400).json({ message: 'Room name is required' });
        }
        const roomId = uuidv4();
        rooms[roomId] = { name: roomName, lobbies: {} };
        return res.status(201).json({ roomId, message: 'Room created' });
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}