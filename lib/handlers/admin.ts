import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { getDb } from "../db";
import { getAdminUser, hashPassword } from "../auth";
import { json, error, parseBody, handleAuthError } from "../api-helpers";

export async function handleAdmin(
  req: NextRequest,
  segments: string[]
): Promise<Response> {
  try {
    await getAdminUser(req);
    const db = await getDb();
    const resource = segments[1];

    if (resource === "stats" && req.method === "GET") {
      const total_clients = await db.collection("users").countDocuments({ role: "user" });
      const tier_3_count = await db.collection("users").countDocuments({ tier_level: "Tier 3" });
      const recent = await db
        .collection("users")
        .find({ role: "user" })
        .project({ _id: 0, name: 1, email: 1, created_at: 1 })
        .sort({ created_at: -1 })
        .limit(10)
        .toArray();
      return json({
        total_clients,
        mrr: tier_3_count * 299,
        churn_rate: 2.5,
        recent_activity: recent,
      });
    }

    if (resource === "clients" && req.method === "GET") {
      const clients = await db.collection("users").find({ role: "user" }).toArray();
      return json(
        clients.map((c) => ({
          id: String(c._id),
          email: c.email,
          name: c.name,
          role: c.role,
          tier_level: c.tier_level,
        }))
      );
    }

    if (resource === "create-client" && req.method === "POST") {
      const body = await parseBody<{
        name: string;
        email: string;
        password: string;
        tier_level?: string;
      }>(req);
      const email = body.email.toLowerCase();
      const existing = await db.collection("users").findOne({ email });
      if (existing) return error("Email already exists", 400);
      const result = await db.collection("users").insertOne({
        email,
        name: body.name,
        password_hash: hashPassword(body.password),
        role: "user",
        tier_level: body.tier_level ?? "Tier 1",
        created_at: new Date().toISOString(),
      });
      return json({
        id: String(result.insertedId),
        email,
        name: body.name,
        password: body.password,
        tier_level: body.tier_level ?? "Tier 1",
        message: "Client created successfully",
      });
    }

    if (resource === "programs" && req.method === "POST") {
      const program = await parseBody<{
        track: string;
        day: number;
        exercises: unknown[];
        id?: string;
      }>(req);
      await db.collection("program_templates").updateOne(
        { track: program.track, day: program.day },
        { $set: { ...program, id: program.id ?? uuidv4() } },
        { upsert: true }
      );
      return json({ message: "Program saved successfully" });
    }

    if (resource === "programs" && segments[2] && segments[3] && req.method === "GET") {
      const program = await db.collection("program_templates").findOne(
        { track: segments[2], day: parseInt(segments[3], 10) },
        { projection: { _id: 0 } }
      );
      if (!program) {
        return json({ track: segments[2], day: parseInt(segments[3], 10), exercises: [], id: uuidv4() });
      }
      return json(program);
    }

    if (resource === "exercise-videos" && req.method === "GET") {
      const videos = await db.collection("exercise_videos").find({}).project({ _id: 0 }).toArray();
      return json(videos);
    }

    if (resource === "exercise-videos" && req.method === "POST") {
      const video = await parseBody<Record<string, unknown>>(req);
      const doc = {
        id: uuidv4(),
        ...video,
        created_at: new Date().toISOString(),
      };
      await db.collection("exercise_videos").insertOne(doc);
      return json(doc);
    }

    if (resource === "form-checks" && req.method === "GET" && segments.length === 2) {
      const subs = await db
        .collection("form_checks")
        .find({ status: "pending" })
        .project({ _id: 0 })
        .toArray();
      return json(subs);
    }

    if (
      resource === "form-checks" &&
      segments[2] &&
      segments[3] === "feedback" &&
      req.method === "POST"
    ) {
      const url = new URL(req.url);
      const feedback_text = url.searchParams.get("feedback_text") ?? "";
      const feedback_audio_base64 = url.searchParams.get("feedback_audio_base64") ?? "";
      const body = await parseBody<{ feedback_text?: string; feedback_audio_base64?: string }>(req);
      const submission = await db.collection("form_checks").findOne({ id: segments[2] });
      if (!submission) return error("Submission not found", 404);
      await db.collection("form_checks").updateOne(
        { id: segments[2] },
        {
          $set: {
            feedback_text: body.feedback_text ?? feedback_text,
            feedback_audio_base64: body.feedback_audio_base64 ?? feedback_audio_base64,
            status: "reviewed",
          },
        }
      );
      await db.collection("notifications").insertOne({
        id: uuidv4(),
        user_id: submission.user_id,
        type: "form_feedback",
        title: "Form check feedback received",
        message: `Your coach reviewed your ${submission.exercise_name} form video`,
        read: false,
        created_at: new Date().toISOString(),
      });
      return json({ message: "Feedback submitted successfully" });
    }

    if (resource === "custom-programs" && req.method === "POST") {
      const body = await parseBody<{
        client_email: string;
        day: number;
        exercises: unknown[];
      }>(req);
      await db.collection("custom_programs").updateOne(
        { client_email: body.client_email, day: body.day },
        { $set: { client_email: body.client_email, day: body.day, exercises: body.exercises } },
        { upsert: true }
      );
      return json({ message: "Custom program saved successfully" });
    }

    if (resource === "custom-programs" && segments[2] && segments[3] && req.method === "GET") {
      const program = await db.collection("custom_programs").findOne(
        { client_email: decodeURIComponent(segments[2]), day: parseInt(segments[3], 10) },
        { projection: { _id: 0 } }
      );
      return json(program ?? { client_email: segments[2], day: parseInt(segments[3], 10), exercises: [] });
    }

    if (resource === "custom-program" && req.method === "POST") {
      const body = await parseBody<{
        user_email: string;
        week: number;
        day: number;
        exercises: unknown[];
      }>(req);
      const client = await db.collection("users").findOne({ email: body.user_email });
      if (!client) return error("Client not found", 404);
      const program_doc = {
        user_email: body.user_email,
        week: body.week,
        day: body.day,
        exercises: body.exercises,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await db.collection("custom_programs").updateOne(
        { user_email: body.user_email, week: body.week, day: body.day },
        { $set: program_doc },
        { upsert: true }
      );
      return json({ message: "Custom program saved successfully" });
    }

    if (resource === "custom-program" && segments[2] && segments[3] && segments[4]) {
      const program = await db.collection("custom_programs").findOne(
        {
          user_email: decodeURIComponent(segments[2]),
          week: parseInt(segments[3], 10),
          day: parseInt(segments[4], 10),
        },
        { projection: { _id: 0 } }
      );
      return json(program ?? { exercises: [] });
    }

    if (resource === "meal-plans" && req.method === "GET") {
      const plans = await db.collection("meal_plans").find({}).project({ _id: 0 }).toArray();
      return json(plans);
    }

    if (resource === "meal-plans" && req.method === "POST") {
      const body = await parseBody<{ name: string; meals: unknown[] }>(req);
      const plan = { id: uuidv4(), name: body.name, meals: body.meals, created_at: new Date().toISOString() };
      await db.collection("meal_plans").insertOne(plan);
      return json(plan);
    }

    if (resource === "assign-meal-plan" && req.method === "POST") {
      const body = await parseBody<{ client_email: string; plan_id: string }>(req);
      await db.collection("users").updateOne(
        { email: body.client_email },
        { $set: { assigned_meal_plan: body.plan_id } }
      );
      return json({ message: "Meal plan assigned" });
    }

    if (resource === "weekly-reports" && req.method === "POST") {
      const body = await parseBody<{ user_id: string; week_number: number; report_text: string }>(req);
      const userDoc = await db.collection("users").findOne({ _id: new ObjectId(body.user_id) });
      if (!userDoc || userDoc.tier_level !== "Tier 3") {
        return error("Weekly reports are for Tier 3 clients only", 400);
      }
      const report = {
        id: uuidv4(),
        user_id: body.user_id,
        week_number: body.week_number,
        report_text: body.report_text,
        created_at: new Date().toISOString(),
      };
      await db.collection("weekly_reports").insertOne(report);
      await db.collection("notifications").insertOne({
        id: uuidv4(),
        user_id: body.user_id,
        type: "weekly_report",
        title: "New Weekly Report",
        message: `Your coach sent you Week ${body.week_number} report`,
        read: false,
        created_at: new Date().toISOString(),
      });
      return json(report);
    }

    if (resource === "tier3-clients" && req.method === "GET") {
      const clients = await db
        .collection("users")
        .find({ tier_level: "Tier 3", role: "user" })
        .project({ password_hash: 0 })
        .toArray();
      return json(clients);
    }

    if (resource === "lift-progress" && segments[2] === "pending") {
      const lifts = await db
        .collection("lift_progress")
        .find({ verification_status: "Pending" })
        .project({ _id: 0 })
        .sort({ submitted_at: -1 })
        .toArray();
      return json(lifts);
    }

    if (resource === "lift-progress" && segments[2] && segments[3] === "verify") {
      const result = await db.collection("lift_progress").updateOne(
        { id: segments[2] },
        { $set: { verification_status: "Verified" } }
      );
      if (result.modifiedCount === 0) return error("Lift record not found", 404);
      return json({ message: "Lift verified successfully", verification_status: "Verified" });
    }

    if (resource === "lift-progress" && segments[2] && segments[3] === "reject") {
      const result = await db.collection("lift_progress").updateOne(
        { id: segments[2] },
        { $set: { verification_status: "Rejected" } }
      );
      if (result.modifiedCount === 0) return error("Lift record not found", 404);
      return json({ message: "Lift rejected", verification_status: "Rejected" });
    }
  } catch (e) {
    return handleAuthError(e);
  }
  return error("Not found", 404);
}
