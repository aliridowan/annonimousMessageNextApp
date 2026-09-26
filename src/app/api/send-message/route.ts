import dbConnect from "../../../lib/dbConnection";
import UserModel from "@/models/User.model";
import { Message } from "@/models/User.model";
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: Request) {
    try {
        const { username, content } = await request.json()

        const result = messageSchema.safeParse({ content })
        if (!result.success) {
            return Response.json(
                { success: false, message: result.error.issues[0].message },
                { status: 400 }
            )
        }

        await dbConnect()
        const user = await UserModel.findOne({ username })

        if (!user) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            )
        }
        // check is user accepting message
        if (!user.isAcceptingMessage) {
            return Response.json(
                { success: false, message: 'User is not accepting message' },
                { status: 403 }
            )
        }
        const newMessage = { content: result.data.content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json(
            { success: true, message: 'Message sent successfully' },
            { status: 201 })

    } catch (error) {
        console.error("Error sending message", error)
        return Response.json(
            { success: false, message: 'Error sending message' },
            { status: 500 })
    }
}
