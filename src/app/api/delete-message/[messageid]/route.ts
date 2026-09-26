import { getServerSession } from "next-auth";
import { User } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/User.model";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageid: string }> }
) {
  const { messageid } = await params

  const session = await getServerSession(authOptions)
  const user: User = session?.user as User

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    )
  }

  if (!mongoose.Types.ObjectId.isValid(messageid)) {
    return Response.json(
      { success: false, message: 'Invalid message id' },
      { status: 400 }
    )
  }

  try {
    await dbConnect()
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    )

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { success: false, message: 'Message not found or already deleted' },
        { status: 404 }
      )
    }

    return Response.json(
      { success: true, message: 'Message deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting message:', error)
    return Response.json(
      { success: false, message: 'Error deleting message' },
      { status: 500 }
    )
  }
}
