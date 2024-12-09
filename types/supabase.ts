 export interface Database {
  public: {
    Tables: {
      routines: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
        }
      }
      routine_exercises: {
        Row: {
          id: string
          routine_id: string
          exercise_id: string
          sets: number
          reps: number
          order_index: number
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          description?: string
          muscle_group?: string
        }
      }
    }
  }
}