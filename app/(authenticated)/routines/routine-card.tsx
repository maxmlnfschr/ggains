import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RoutineWithExercises } from '@/types/routine'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'

interface RoutineCardProps {
  routine: RoutineWithExercises
}

export function RoutineCard({ routine }: RoutineCardProps) {
  return (
    <Card className="hover:bg-accent transition-colors">
      <CardHeader>
        <CardTitle>
          <Link href={`/routines/${routine.id}`} className="hover:underline">
            {routine.name}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Creada el {new Date(routine.created_at).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Dumbbell className="mr-2 h-4 w-4" />
          <span>{routine.routine_exercises?.length || 0} ejercicios</span>
        </div>
      </CardContent>
    </Card>
  )
}
