import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "../../../lib/dbConnection";
import UserModel from "@/models/User.model";
import { User } from 'next-auth'
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const user: User = session?.user as User

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'User not authenticated' },
      { status: 401 }
    )
  }
  const userId = user?._id

  try {
    const result = acceptMessageSchema.safeParse(await request.json())
    if (!result.success) {
      return Response.json(
        { success: false, message: "acceptMessage must be true or false" },
        { status: 400 }
      )
    }

    await dbConnect()
    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: result.data.acceptMessage },
      { returnDocument: 'after' },
    )
    if (!updateUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    return Response.json(
      {
        success: true,
        message: "User status updated successfully for accepting message",
        isAcceptingMessage: updateUser.isAcceptingMessage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("failed to update user status to accept message", error)
    return Response.json(
      { success: false, message: "failed to update user status to accept message" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const user: User = session?.user as User

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'User not authenticated' },
      { status: 401 }
    )
  }
  const userId = user?._id

  try {
    await dbConnect()
    const foundUser = await UserModel.findById(userId)

    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }
    return Response.json(
      { success: true, isAcceptingMessage: foundUser.isAcceptingMessage },
      { status: 200 }
    )
  } catch (error) {
    console.error("failed to get message acceptance status", error)
    return Response.json(
      { success: false, message: "failed to get message acceptance status" },
      { status: 500 }
    )
  }
}
