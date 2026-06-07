import { v4 as uuidv4 } from "uuid";
import type { Db } from "mongodb";
import type { Coach } from "./data";
import { profilePhotoStreamPath } from "./profile-photo-storage";

export const DEFAULT_COACH_NAME = "21Coach";
export const DEFAULT_COACH_IMAGE =
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2glMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3ODA0OTQ2MjR8MA&ixlib=rb-4.1.0&q=85";

type CoachDoc = {
  id?: string;
  name?: string;
  profile_image_url?: string;
  profile_photo_id?: string;
  is_online?: boolean;
};

export type { CoachDoc };

export function coachProfileImageUrl(doc: CoachDoc): string {
  if (doc.profile_photo_id) {
    return profilePhotoStreamPath(String(doc.profile_photo_id));
  }
  if (doc.profile_image_url) {
    return String(doc.profile_image_url);
  }
  return DEFAULT_COACH_IMAGE;
}

export function serializeCoach(doc: CoachDoc): Coach {
  return {
    id: String(doc.id),
    name: String(doc.name ?? DEFAULT_COACH_NAME),
    profile_image_url: coachProfileImageUrl(doc),
    is_online: doc.is_online !== false,
  };
}

export async function ensureCoaches(db: Db): Promise<CoachDoc[]> {
  let coaches = await db.collection("coaches").find({}).project({ _id: 0 }).toArray();

  if (coaches.length === 0) {
    const coach = {
      id: uuidv4(),
      name: DEFAULT_COACH_NAME,
      profile_image_url: DEFAULT_COACH_IMAGE,
      is_online: true,
    };
    await db.collection("coaches").insertOne(coach);
    return [coach];
  }

  for (const coach of coaches) {
    if (coach.name === "Coach Sarah") {
      await db
        .collection("coaches")
        .updateOne({ id: coach.id }, { $set: { name: DEFAULT_COACH_NAME } });
      coach.name = DEFAULT_COACH_NAME;
    }
  }

  return coaches as CoachDoc[];
}
