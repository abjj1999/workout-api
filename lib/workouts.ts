import type { SupabaseClient } from "@supabase/supabase-js";

// Shape the Expo app sends when saving or replacing a finished workout.
export interface SetInput {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseInput {
  exerciseId: string;
  position: number;
  sets: SetInput[];
}

export interface WorkoutInput {
  startedAt: string;
  finishedAt: string;
  note: string | null;
  exercises: ExerciseInput[];
}

export function parseWorkout(body: unknown): WorkoutInput | null {
  const w = body as WorkoutInput;
  if (
    !w ||
    typeof w.startedAt !== "string" ||
    Number.isNaN(Date.parse(w.startedAt)) ||
    typeof w.finishedAt !== "string" ||
    Number.isNaN(Date.parse(w.finishedAt)) ||
    (w.note !== null && typeof w.note !== "string") ||
    !Array.isArray(w.exercises)
  ) {
    return null;
  }
  for (const e of w.exercises) {
    if (
      typeof e?.exerciseId !== "string" ||
      typeof e?.position !== "number" ||
      !Array.isArray(e?.sets) ||
      e.sets.some(
        (s) =>
          typeof s?.setNumber !== "number" ||
          typeof s?.weight !== "number" ||
          typeof s?.reps !== "number" ||
          typeof s?.completed !== "boolean",
      )
    ) {
      return null;
    }
  }
  return w;
}

/** Inserts a workout's exercises and their sets. Throws on failure. */
export async function insertExercises(
  supabase: SupabaseClient,
  workoutId: string,
  exercises: ExerciseInput[],
): Promise<void> {
  for (const exercise of exercises) {
    const { data: exerciseRow, error: exerciseError } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: workoutId,
        exercise_id: exercise.exerciseId,
        position: exercise.position,
      })
      .select("id")
      .single();
    if (exerciseError) throw new Error(exerciseError.message);

    if (exercise.sets.length > 0) {
      const { error: setsError } = await supabase.from("workout_sets").insert(
        exercise.sets.map((set) => ({
          workout_exercise_id: exerciseRow.id,
          set_number: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
        })),
      );
      if (setsError) throw new Error(setsError.message);
    }
  }
}
