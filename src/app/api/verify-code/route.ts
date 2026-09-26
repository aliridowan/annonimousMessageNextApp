import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/User.model";


export async function POST(request: Request) {
  try {
    await dbConnect()
    const { username, code } = await request.json()
    const decodedUsername = decodeURIComponent(username)
    const user = await UserModel.findOne({ username: decodedUsername })

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 })
    }
    const isCodeValid = user.verifyCode === code
    const isCodeNotExpired = new Date(user.verifycodeExpiry) > new Date()

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true
      await user.save()

      return Response.json(
        { success: true, message: "User Varified Successfully" },
        { status: 200 })
    } else if (!isCodeNotExpired) {
      return Response.json(
        { success: false, message: "Verification code is expired please sign up again to get a new code" },
        { status: 400 })
    } else {
      return Response.json(
        { success: false, message: "Incorrect Varification code" },
        { status: 400 })

    }

  } catch (error) {
    console.error("Error verifying user ", error)

    return Response.json(
      { success: false, message: "Error verifying user" },
      { status: 500 })
  }

}
