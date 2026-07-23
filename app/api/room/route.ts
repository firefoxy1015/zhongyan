import { RoomError, applyRoomAction, getRoomSnapshot } from "../../lib/room-store";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof RoomError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "房间服务暂时不可用。" }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const snapshot = await getRoomSnapshot(url.searchParams.get("code"), url.searchParams.get("token"));
    return Response.json(snapshot);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      roomCode?: unknown;
      token?: unknown;
      action?: unknown;
      payload?: unknown;
    };
    const snapshot = await applyRoomAction(body.roomCode, body.token, body.action, body.payload);
    return Response.json(snapshot);
  } catch (error) {
    return errorResponse(error);
  }
}
