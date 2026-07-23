import { RoomError, createRoom, joinRoom } from "../../lib/room-store";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof RoomError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "房间服务暂时不可用。" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { action?: unknown; roomCode?: unknown; playerName?: unknown };
    const snapshot = body.action === "join"
      ? await joinRoom(body.roomCode, body.playerName)
      : await createRoom(body.playerName);
    return Response.json(snapshot, { status: body.action === "join" ? 200 : 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
