import { RoutineForm } from '../routine-form'

export default function NewRoutinePage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-8">Nueva Rutina</h1>
      <div className="max-w-xl">
        <RoutineForm />
      </div>
    </div>
  )
}
