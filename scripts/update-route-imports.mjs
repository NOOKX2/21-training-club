import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const replacements = [
  ["@/components/app-pages/WorkoutsPageView", "@/app/(app)/workouts/_components/WorkoutsPageView"],
  ["@/components/app-pages/NutritionPageView", "@/app/(app)/nutrition/_components/NutritionPageView"],
  ["@/components/app-pages/ProgressPageView", "@/app/(app)/progress/_components/ProgressPageView"],
  ["@/components/app-pages/ProfilePageView", "@/app/(app)/profile/_components/ProfilePageView"],
  ["@/components/app-pages/CoachPageView", "@/app/(app)/coach/_components/CoachPageView"],
  ["@/components/workout-program/", "@/app/(app)/workouts/program/_components/"],
  ["@/components/workout/", "@/app/(app)/workouts/_components/"],
  ["@/components/WorkoutProgramEditor", "@/app/(app)/workouts/program/edit/_components/WorkoutProgramEditor"],
  ["@/components/WorkoutClient", "@/app/(app)/workouts/_components/WorkoutClient"],
  ["@/components/NutritionSubmitClient", "@/app/(app)/nutrition/add/_components/NutritionSubmitClient"],
  ["@/components/NutritionRepromptClient", "@/app/(app)/nutrition/reprompt/[mealId]/_components/NutritionRepromptClient"],
  ["@/components/NutritionScoreChart", "@/app/(app)/nutrition/_components/NutritionScoreChart"],
  ["@/components/NutritionHeader", "@/app/(app)/nutrition/_components/NutritionHeader"],
  ["@/components/NutritionClient", "@/app/(app)/nutrition/_components/NutritionClient"],
  ["@/components/nutrition/", "@/app/(app)/nutrition/_components/"],
  ["@/components/WeightProgressChart", "@/app/(app)/progress/_components/WeightProgressChart"],
  ["@/components/ProgressClient", "@/app/(app)/progress/_components/ProgressClient"],
  ["@/components/progress/", "@/app/(app)/progress/_components/"],
  ["@/components/ProfileClient", "@/app/(app)/profile/_components/ProfileClient"],
  ["@/components/profile/", "@/app/(app)/profile/_components/"],
  ["@/components/CoachWeeklyReportsModal", "@/app/(app)/coach/_components/CoachWeeklyReportsModal"],
  ["@/components/CoachClient", "@/app/(app)/coach/_components/CoachClient"],
  ["@/components/coach/", "@/app/(app)/coach/_components/"],
  ["@/components/MessagesClient", "@/app/(app)/messages/_components/MessagesClient"],
  ["@/components/chat/", "@/app/(app)/messages/_components/"],
  ["@/app/(admin)/admin/_components/", "@/app/(admin)/admin/_components/admin-pages/"],
  ["@/app/(admin)/admin/_components/", "@/app/(admin)/admin/_components/admin/"],
  ["@/components/AdminTabNav", "@/app/(admin)/admin/_components/AdminTabNav"],
  ["@/components/RegisterForm", "@/app/register/_components/RegisterForm"],
  ["@/components/auth/", "@/app/login/_components/"],
  ["@/components/AccountExpiredClient", "@/app/account-expired/_components/AccountExpiredClient"],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".git") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else if (/\.(ts|tsx|mts|js|mjs)$/.test(name)) files.push(path);
  }
  return files;
}

let changed = 0;
for (const file of walk(".")) {
  if (file.includes("update-route-imports.mjs")) continue;
  let content = readFileSync(file, "utf8");
  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    writeFileSync(file, next);
    changed++;
  }
}
console.log(`Updated ${changed} files`);
