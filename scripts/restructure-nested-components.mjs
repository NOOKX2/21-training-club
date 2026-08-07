import {
  mkdirSync,
  readFileSync,
  renameSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  existsSync,
} from "fs";
import { dirname, join, basename } from "path";

const root = process.cwd();

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function moveFile(from, to) {
  const fromPath = join(root, from);
  const toPath = join(root, to);
  if (!existsSync(fromPath)) {
    console.warn(`skip missing: ${from}`);
    return;
  }
  ensureDir(dirname(toPath));
  renameSync(fromPath, toPath);
  console.log(`moved ${from} -> ${to}`);
}

function flattenDir(dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return;
  for (const name of readdirSync(abs)) {
    const child = join(abs, name);
    if (!statSync(child).isDirectory()) continue;
    for (const file of readdirSync(child)) {
      const src = join(child, file);
      const dest = join(abs, file);
      if (existsSync(dest)) {
        console.warn(`skip flatten conflict: ${dest}`);
        continue;
      }
      renameSync(src, dest);
      console.log(`flattened ${dir}/${name}/${file} -> ${dir}/${file}`);
    }
    rmSync(child, { recursive: true, force: true });
  }
}

// --- moves ---
const moves = [
  // workouts: program list
  [
    "app/(app)/workouts/_components/workout-program/WorkoutProgramList.tsx",
    "app/(app)/workouts/program/_components/WorkoutProgramList.tsx",
  ],
  [
    "app/(app)/workouts/_components/workout-program/WorkoutProgramListCard.tsx",
    "app/(app)/workouts/program/_components/WorkoutProgramListCard.tsx",
  ],
  // workouts: program editor
  [
    "app/(app)/workouts/_components/WorkoutProgramEditor.tsx",
    "app/(app)/workouts/program/edit/_components/WorkoutProgramEditor.tsx",
  ],
  [
    "app/(app)/workouts/_components/workout-program/CreateExerciseForm.tsx",
    "app/(app)/workouts/program/edit/_components/CreateExerciseForm.tsx",
  ],
  [
    "app/(app)/workouts/_components/workout-program/ExerciseRow.tsx",
    "app/(app)/workouts/program/edit/_components/ExerciseRow.tsx",
  ],
  [
    "app/(app)/workouts/_components/workout-program/ProgramDayTabs.tsx",
    "app/(app)/workouts/program/edit/_components/ProgramDayTabs.tsx",
  ],
  [
    "app/(app)/workouts/_components/workout-program/TemplatePanel.tsx",
    "app/(app)/workouts/program/edit/_components/TemplatePanel.tsx",
  ],
  // nutrition: route-specific clients
  [
    "app/(app)/nutrition/_components/NutritionSubmitClient.tsx",
    "app/(app)/nutrition/add/_components/NutritionSubmitClient.tsx",
  ],
  [
    "app/(app)/nutrition/_components/NutritionRepromptClient.tsx",
    "app/(app)/nutrition/reprompt/[mealId]/_components/NutritionRepromptClient.tsx",
  ],
  // shared admin widgets -> components/
  [
    "app/(admin)/admin/_components/admin/RestDayToggle.tsx",
    "components/RestDayToggle.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/CardioEditor.tsx",
    "components/CardioEditor.tsx",
  ],
  // admin shell
  [
    "app/(admin)/admin/_components/admin/AdminShell.tsx",
    "app/(admin)/admin/_components/AdminShell.tsx",
  ],
  // admin dashboard
  [
    "app/(admin)/admin/_components/admin-pages/AdminDashboardPageView.tsx",
    "app/(admin)/admin/_components/AdminDashboardPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/AdminDashboard.tsx",
    "app/(admin)/admin/_components/AdminDashboard.tsx",
  ],
  // admin chat
  [
    "app/(admin)/admin/_components/admin-pages/AdminChatPageView.tsx",
    "app/(admin)/admin/chat/_components/AdminChatPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/AdminChat.tsx",
    "app/(admin)/admin/chat/_components/AdminChat.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/CoachProfileEditor.tsx",
    "app/(admin)/admin/chat/_components/CoachProfileEditor.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/CoachWeeklyFeedbackForm.tsx",
    "app/(admin)/admin/chat/_components/CoachWeeklyFeedbackForm.tsx",
  ],
  // admin clients
  [
    "app/(admin)/admin/_components/admin-pages/AdminClientsPageView.tsx",
    "app/(admin)/admin/clients/_components/AdminClientsPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/ClientRoster.tsx",
    "app/(admin)/admin/clients/_components/ClientRoster.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/CreateClientModal.tsx",
    "app/(admin)/admin/clients/_components/CreateClientModal.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/EditClientModal.tsx",
    "app/(admin)/admin/clients/_components/EditClientModal.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/AdminClientViewNav.tsx",
    "app/(admin)/admin/clients/[clientId]/_components/AdminClientViewNav.tsx",
  ],
  // admin custom programs
  [
    "app/(admin)/admin/_components/admin-pages/AdminCustomProgramsPageView.tsx",
    "app/(admin)/admin/custom-programs/_components/AdminCustomProgramsPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/CustomPrograms.tsx",
    "app/(admin)/admin/custom-programs/_components/CustomPrograms.tsx",
  ],
  // admin form checks
  [
    "app/(admin)/admin/_components/admin-pages/AdminFormChecksPageView.tsx",
    "app/(admin)/admin/form-checks/_components/AdminFormChecksPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/FormCheckQueue.tsx",
    "app/(admin)/admin/form-checks/_components/FormCheckQueue.tsx",
  ],
  // admin nutrition review
  [
    "app/(admin)/admin/_components/admin-pages/AdminNutritionPageView.tsx",
    "app/(admin)/admin/nutrition/_components/AdminNutritionPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/NutritionReview.tsx",
    "app/(admin)/admin/nutrition/_components/NutritionReview.tsx",
  ],
  // admin programs
  [
    "app/(admin)/admin/_components/admin-pages/AdminProgramsPageView.tsx",
    "app/(admin)/admin/programs/_components/AdminProgramsPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/ProgramBuilder.tsx",
    "app/(admin)/admin/programs/_components/ProgramBuilder.tsx",
  ],
  // admin results
  [
    "app/(admin)/admin/_components/admin-pages/AdminResultsPageView.tsx",
    "app/(admin)/admin/results/_components/AdminResultsPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/ClientResults.tsx",
    "app/(admin)/admin/results/_components/ClientResults.tsx",
  ],
  // admin videos
  [
    "app/(admin)/admin/_components/admin-pages/AdminVideosPageView.tsx",
    "app/(admin)/admin/videos/_components/AdminVideosPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/ExerciseVideoLibrary.tsx",
    "app/(admin)/admin/videos/_components/ExerciseVideoLibrary.tsx",
  ],
  // admin weight verification
  [
    "app/(admin)/admin/_components/admin-pages/AdminWeightVerificationPageView.tsx",
    "app/(admin)/admin/weight-verification/_components/AdminWeightVerificationPageView.tsx",
  ],
  [
    "app/(admin)/admin/_components/admin/WeightVerification.tsx",
    "app/(admin)/admin/weight-verification/_components/WeightVerification.tsx",
  ],
  // shared admin utils
  [
    "app/(admin)/admin/_components/admin/admin-utils.ts",
    "app/(admin)/admin/_components/admin-utils.ts",
  ],
  [
    "app/(admin)/admin/_components/admin/TierBadge.tsx",
    "app/(admin)/admin/_components/TierBadge.tsx",
  ],
];

for (const [from, to] of moves) moveFile(from, to);

// flatten nested folders inside route _components
const flattenTargets = [
  "app/(app)/workouts/_components/workout",
  "app/(app)/nutrition/_components/nutrition",
  "app/(app)/profile/_components/profile",
  "app/(app)/progress/_components/progress",
  "app/(app)/coach/_components/coach",
  "app/(app)/messages/_components/chat",
  "app/login/_components/auth",
];

for (const dir of flattenTargets) {
  const parent = dirname(dir);
  if (!existsSync(join(root, dir))) continue;
  for (const file of readdirSync(join(root, dir))) {
    moveFile(`${dir}/${file}`, `${parent}/${file}`);
  }
  rmSync(join(root, dir), { recursive: true, force: true });
}

// remove empty admin subdirs
for (const dir of ["app/(admin)/admin/_components/admin", "app/(admin)/admin/_components/admin-pages"]) {
  const abs = join(root, dir);
  if (existsSync(abs)) {
    try {
      rmSync(abs, { recursive: true, force: true });
      console.log(`removed ${dir}`);
    } catch {
      /* not empty */
    }
  }
}

// remove stale components/admin if present
const staleAdmin = join(root, "components/admin");
if (existsSync(staleAdmin)) {
  rmSync(staleAdmin, { recursive: true, force: true });
  console.log("removed components/admin");
}

const replacements = [
  // workouts paths
  ["@/app/(app)/workouts/_components/workout/", "@/app/(app)/workouts/_components/"],
  ["@/app/(app)/workouts/_components/workout-program/", "@/app/(app)/workouts/program/_components/"],
  [
    "@/app/(app)/workouts/_components/WorkoutProgramEditor",
    "@/app/(app)/workouts/program/edit/_components/WorkoutProgramEditor",
  ],
  [
    "@/app/(app)/workouts/_components/workout-program/WorkoutProgramList",
    "@/app/(app)/workouts/program/_components/WorkoutProgramList",
  ],
  [
    "@/app/(app)/workouts/program/_components/WorkoutProgramEditor",
    "@/app/(app)/workouts/program/edit/_components/WorkoutProgramEditor",
  ],
  [
    "@/app/(app)/workouts/program/_components/CreateExerciseForm",
    "@/app/(app)/workouts/program/edit/_components/CreateExerciseForm",
  ],
  [
    "@/app/(app)/workouts/program/_components/ExerciseRow",
    "@/app/(app)/workouts/program/edit/_components/ExerciseRow",
  ],
  [
    "@/app/(app)/workouts/program/_components/ProgramDayTabs",
    "@/app/(app)/workouts/program/edit/_components/ProgramDayTabs",
  ],
  [
    "@/app/(app)/workouts/program/_components/TemplatePanel",
    "@/app/(app)/workouts/program/edit/_components/TemplatePanel",
  ],
  // nutrition
  ["@/app/(app)/nutrition/_components/nutrition/", "@/app/(app)/nutrition/_components/"],
  [
    "@/app/(app)/nutrition/_components/NutritionSubmitClient",
    "@/app/(app)/nutrition/add/_components/NutritionSubmitClient",
  ],
  [
    "@/app/(app)/nutrition/_components/NutritionRepromptClient",
    "@/app/(app)/nutrition/reprompt/[mealId]/_components/NutritionRepromptClient",
  ],
  // profile / progress / coach / messages / login
  ["@/app/(app)/profile/_components/profile/", "@/app/(app)/profile/_components/"],
  ["@/app/(app)/progress/_components/progress/", "@/app/(app)/progress/_components/"],
  ["@/app/(app)/coach/_components/coach/", "@/app/(app)/coach/_components/"],
  ["@/app/(app)/messages/_components/chat/", "@/app/(app)/messages/_components/"],
  ["@/app/login/_components/auth/", "@/app/login/_components/"],
  // shared admin widgets
  ["@/app/(admin)/admin/_components/admin/RestDayToggle", "@/components/RestDayToggle"],
  ["@/app/(admin)/admin/_components/admin/CardioEditor", "@/components/CardioEditor"],
  ["@/components/admin/RestDayToggle", "@/components/RestDayToggle"],
  ["@/components/admin/CardioEditor", "@/components/CardioEditor"],
  // admin shell + dashboard
  ["@/app/(admin)/admin/_components/admin/AdminShell", "@/app/(admin)/admin/_components/AdminShell"],
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminDashboardPageView",
    "@/app/(admin)/admin/_components/AdminDashboardPageView",
  ],
  ["@/app/(admin)/admin/_components/admin/AdminDashboard", "@/app/(admin)/admin/_components/AdminDashboard"],
  // admin chat
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminChatPageView",
    "@/app/(admin)/admin/chat/_components/AdminChatPageView",
  ],
  ["@/app/(admin)/admin/_components/admin/AdminChat", "@/app/(admin)/admin/chat/_components/AdminChat"],
  [
    "@/app/(admin)/admin/_components/admin/CoachProfileEditor",
    "@/app/(admin)/admin/chat/_components/CoachProfileEditor",
  ],
  [
    "@/app/(admin)/admin/_components/admin/CoachWeeklyFeedbackForm",
    "@/app/(admin)/admin/chat/_components/CoachWeeklyFeedbackForm",
  ],
  // admin clients
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminClientsPageView",
    "@/app/(admin)/admin/clients/_components/AdminClientsPageView",
  ],
  ["@/app/(admin)/admin/_components/admin/ClientRoster", "@/app/(admin)/admin/clients/_components/ClientRoster"],
  [
    "@/app/(admin)/admin/_components/admin/CreateClientModal",
    "@/app/(admin)/admin/clients/_components/CreateClientModal",
  ],
  [
    "@/app/(admin)/admin/_components/admin/EditClientModal",
    "@/app/(admin)/admin/clients/_components/EditClientModal",
  ],
  [
    "@/app/(admin)/admin/_components/admin/AdminClientViewNav",
    "@/app/(admin)/admin/clients/[clientId]/_components/AdminClientViewNav",
  ],
  // admin custom programs
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminCustomProgramsPageView",
    "@/app/(admin)/admin/custom-programs/_components/AdminCustomProgramsPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/CustomPrograms",
    "@/app/(admin)/admin/custom-programs/_components/CustomPrograms",
  ],
  // admin form checks
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminFormChecksPageView",
    "@/app/(admin)/admin/form-checks/_components/AdminFormChecksPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/FormCheckQueue",
    "@/app/(admin)/admin/form-checks/_components/FormCheckQueue",
  ],
  // admin nutrition
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminNutritionPageView",
    "@/app/(admin)/admin/nutrition/_components/AdminNutritionPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/NutritionReview",
    "@/app/(admin)/admin/nutrition/_components/NutritionReview",
  ],
  // admin programs
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminProgramsPageView",
    "@/app/(admin)/admin/programs/_components/AdminProgramsPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/ProgramBuilder",
    "@/app/(admin)/admin/programs/_components/ProgramBuilder",
  ],
  // admin results
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminResultsPageView",
    "@/app/(admin)/admin/results/_components/AdminResultsPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/ClientResults",
    "@/app/(admin)/admin/results/_components/ClientResults",
  ],
  // admin videos
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminVideosPageView",
    "@/app/(admin)/admin/videos/_components/AdminVideosPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/ExerciseVideoLibrary",
    "@/app/(admin)/admin/videos/_components/ExerciseVideoLibrary",
  ],
  // admin weight verification
  [
    "@/app/(admin)/admin/_components/admin-pages/AdminWeightVerificationPageView",
    "@/app/(admin)/admin/weight-verification/_components/AdminWeightVerificationPageView",
  ],
  [
    "@/app/(admin)/admin/_components/admin/WeightVerification",
    "@/app/(admin)/admin/weight-verification/_components/WeightVerification",
  ],
  // admin utils
  ["@/app/(admin)/admin/_components/admin/admin-utils", "@/app/(admin)/admin/_components/admin-utils"],
  ["@/app/(admin)/admin/_components/admin/TierBadge", "@/app/(admin)/admin/_components/TierBadge"],
  // legacy paths
  ["@/components/admin-pages/", "@/app/(admin)/admin/_components/"],
  ["@/components/admin/", "@/app/(admin)/admin/_components/"],
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
for (const file of walk(root)) {
  if (file.includes("restructure-nested-components.mjs")) continue;
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

console.log(`Updated imports in ${changed} files`);
