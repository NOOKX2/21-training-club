import { v4 as uuidv4 } from "uuid";
import type { Db } from "mongodb";

export type ClientNotificationType =
  | "coach_message"
  | "form_feedback"
  | "friend_request";

export async function createClientNotification(
  db: Db,
  opts: {
    userId: string;
    type: ClientNotificationType;
    title: string;
    message: string;
    link?: string;
    request_id?: string;
    from_user_id?: string;
    from_user_name?: string;
  }
) {
  await db.collection("notifications").insertOne({
    id: uuidv4(),
    user_id: opts.userId,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    link: opts.link,
    request_id: opts.request_id,
    from_user_id: opts.from_user_id,
    from_user_name: opts.from_user_name,
    read: false,
    created_at: new Date().toISOString(),
  });
}

export async function markFriendRequestNotificationsRead(
  db: Db,
  userId: string,
  requestId?: string
) {
  const filter: Record<string, unknown> = {
    user_id: userId,
    type: "friend_request",
    read: false,
  };
  if (requestId) filter.request_id = requestId;

  await db.collection("notifications").updateMany(filter, {
    $set: { read: true },
  });
}
