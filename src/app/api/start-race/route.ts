import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { roomId, lobbyId } = await request.json();

    if (!roomId || !lobbyId) {
        return NextResponse.json(
            { message: 'Room ID and Lobby ID are required' },
            { status: 400 }
        );
    }

    // For this simplified example, we're just acknowledging the start
    return NextResponse.json({ message: 'Race started' });
} 