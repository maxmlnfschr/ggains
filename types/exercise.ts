export interface Exercise {
  id: string;
  name: string;
  alternative_names: string[];
  description: string;
  detailed_steps: string;
  execution_tips: string;
  common_mistakes: string;
  images: string[];
  video_links: string[];
  category_id: string;
  equipment_ids: string[];
  alternative_equipment_ids: string[];
  muscle_ids: string[];
  series_min: number;
  series_max: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  rir_min: number;
  rir_max: number;
  rpe_min: number;
  rpe_max: number;
  created_at: string;
  created_by: string;
  variant_ids: string[];
  category?: Category;
  muscles?: {
    muscle: {
      id: string;
      name: string;
    };
  }[];
  equipment?: {
    equipment: {
      id: string;
      name: string;
      is_alternative: boolean;
    };
  }[];
}

export interface Equipment {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export type CreateExerciseDTO = Omit<Exercise, 'id' | 'created_at' | 'created_by'>;

export interface ExerciseBasic {
  id: string;
  name: string;
}
