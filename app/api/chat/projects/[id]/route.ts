import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams?.id)
    if (Number.isNaN(id)) {
      console.error('Invalid project id:', resolvedParams?.id)
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
    }

    console.log('Deleting project with id:', id)

    const deletedProject = await prisma.project.delete({
      where: { id }
    })

    console.log('Project deleted successfully:', deletedProject)
    return NextResponse.json({ success: true, deleted: deletedProject })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    const message = error?.message ?? 'Failed to delete project'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}