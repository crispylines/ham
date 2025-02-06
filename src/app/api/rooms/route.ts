import { NextResponse } from 'next/server';

// **IN-MEMORY DATA - REPLACE WITH A DATABASE IN A REAL APPLICATION**
let rooms: {
    [key: string]: {
        name: string;
        lobbies: {
            [key: string]: {
                hamsters: string[];
                status: 'waiting' | 'racing' | 'finished';
            };
        };
    };
} = {};

export async function GET() {
    // Get all rooms
    const roomList = Object.entries(rooms).map(([roomId, roomData]) => ({
        id: roomId,
        name: roomData.name,
        lobbyCount: Object.keys(roomData.lobbies).length
    }));
    return NextResponse.json(roomList);
}

export async function POST(request: Request) {
    const { roomName } = await request.json();
    
    if (!roomName) {
        return NextResponse.json(
            { message: 'Room name is required' },
            { status: 400 }
        );
    }

    const roomId = crypto.randomUUID();
    rooms[roomId] = { name: roomName, lobbies: {} };
    
    return NextResponse.json(
        { roomId, message: 'Room created' },
        { status: 201 }
    );
} 