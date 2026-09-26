import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "../../../lib/dbConnection";
import UserModel from "@/models/User.model";
import { User } from 'next-auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  const user: User = session?.user as User

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'User not authenticated' },
      { status: 401 }
    )
  }

  try {
    await dbConnect()
    const foundUser = await UserModel.findById(user._id).lean()

    if (!foundUser) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Newest messages first
    const messages = [...foundUser.messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return Response.json(
      { success: true, messages },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error getting messages", error)
    return Response.json(
      { success: false, message: 'Error getting messages' },
      { status: 500 })
  }
}
