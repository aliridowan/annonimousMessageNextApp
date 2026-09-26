import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/User.model";
import { z } from 'zod'
import { userNameValidation } from "@/schemas/singUpSchema";

const usernameQuerySchema = z.object({
  username: userNameValidation
})

export async function GET(request: Request) {

  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const queryParam = {
      username: searchParams.get("username")
    }
    //validate with zod
    const result = usernameQuerySchema.safeParse(queryParam)
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || []

      return Response.json({ success: false, message: usernameErrors.length > 0 ? usernameErrors.join(',') : 'Invalid query Perametter' }, { status: 400 })
    }


    const { username } = result.data

    const exixtingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

    if (exixtingVerifiedUser) {
      return Response.json({ success: false, message: 'username is already taken' }, { status: 400 })
    }

    return Response.json({ success: true, message: 'Username is available' }, { status: 200 })
  } catch (error) {
    console.error("Error checking username", error)
    return Response.json({ success: false, message: "Error checking username" }, { status: 500 })

  }
}


