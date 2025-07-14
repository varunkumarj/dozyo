import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MicroTaskView from "@/components/micro-task-view"

interface PageProps {
  params: {
    id: string
  }
}

export default async function TaskPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <MicroTaskView taskId={params.id} />
}
