import UserModel from "@/models/User.model";
import dbConnect from "@/lib/dbConnection";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { singUpSchema } from "@/schemas/singUpSchema";

export async function POST(request: Request) {
  try {
    await dbConnect()
    const parsed = singUpSchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      )
    }
    const { username, email, password } = parsed.data

    const exixtingUserVefiedByUsernameAndVerificationCode = await UserModel.findOne({
      username,
      isVerified: true
    })
    if (exixtingUserVefiedByUsernameAndVerificationCode) {
      return Response.json(
        { success: false, message: 'User with this username already exits' },
        { status: 400 }
      )
    }

    const exixtingUserByEmail = await UserModel.findOne({ email })
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if (exixtingUserByEmail) {
      if (exixtingUserByEmail.isVerified) {
        return Response.json({ success: false, message: "User Already exixts with this email" }, { status: 400 })
      }
      else {
        const hashedPassword = await bcrypt.hash(password, 10)
        exixtingUserByEmail.password = hashedPassword
        exixtingUserByEmail.verifyCode = verifyCode
        exixtingUserByEmail.verifycodeExpiry = new Date(Date.now() + 3600000)
        await exixtingUserByEmail.save()

        const ResponseEmail = await sendVerificationEmail(email, username, verifyCode)
        if (!ResponseEmail.success) {
          return Response.json({ success: false, message: ResponseEmail.message }, { status: 500 })
        }

        return Response.json({
          success: true,
          message: "Account already exists but isn't verified. A new verification code has been sent."
        }, { status: 200 })
      }
    }
    else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifycodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      })
      await newUser.save()

      const ResponseEmail = await sendVerificationEmail(email, username, verifyCode)
      if (!ResponseEmail.success) {
        return Response.json({ success: false, message: ResponseEmail.message }, { status: 500 })
      }

      return Response.json({
        success: true,
        message: "User Registerd Successfully. Please Verify your email"
      }, { status: 201 })
    }

  } catch (error) {
    console.error("Error while registaring user", error)
    return Response.json({
      success: false,
      message: "Error while registaring user"
    }, { status: 500 })
  }
}



// Old Code
// import UserModel from "@/models/User.model";
// import dbConnect from "@/lib/dbConnection";
// import bcrypt from "bcryptjs";
// import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
// // import { success } from "zod";
//
// export async function POST(request: Request) {
//
//   await dbConnect()
//
//   try {
//     const { username, email, password } = await request.json()
//
//     const exixtingUserVefiedByUsernameAndVerificationCode = await UserModel.findOne({
//       username,
//       isVerified: true
//     })
//     if (exixtingUserVefiedByUsernameAndVerificationCode) {
//       return Response.json(
//         {
//           success: true,
//           message: 'User with this username already exits'
//         },
//         {
//           status: 400
//         }
//       )
//     }
//
//     const exixtingUserByEmail = await UserModel.findOne({ email })
//     const verifyCode = Math.floor(10000 + Math.random() * 90000).toString()
//     if (exixtingUserByEmail) {
//       if (exixtingUserByEmail.isVerified) {
//         return Response.json({ success: false, message: "User Already exixts with this email" }, { status: 400 })
//       }
//       else {
//         const hashedPassword = await bcrypt.hash(password, 10)
//         exixtingUserByEmail.password = hashedPassword
//         exixtingUserByEmail.verifyCode = verifyCode
//         exixtingUserByEmail.verifycodeExpiry = new Date(Date.now() + 3600000)
//         //saved user in the database 
//         await exixtingUserByEmail.save()
//       }
//     }
//     else {
//       const hashedPassword = await bcrypt.hash(password, 10)
//       const expiryDate = new Date()
//       expiryDate.setHours(expiryDate.getHours() + 1)
//
//       const newUser = new UserModel({
//         username,
//         email,
//         password: hashedPassword,
//         verifyCode,
//         verifycodeExpiry: expiryDate,
//         isVerified: false,
//         isAcceptingMessage: true,
//         messages: [],
//       })
//
//       await newUser.save()
//
//       //Send Verifiaction Email
//       const ResponseEmail = await sendVerificationEmail(email, username, verifyCode)
//
//       if (!ResponseEmail.success) {
//         return Response.json(
//           { success: false, message: ResponseEmail.message },
//           // { success: false, message: 'User with this email already exixts' },
//           { status: 500 })
//       }
//       return Response.json({
//         success: true,
//         // message: "User Registerd Successfully. Please Verify your email"
//         message: "Account already exists but isn't verified. A new verification code has been sent."
//       }, { status: 201 })
//     }
//
//   } catch (error) {
//     console.error("Error while registaring user", error)
//     return Response.json({
//       success: false,
//       message: "Error while registaring user"
//     })
//   }
// }
