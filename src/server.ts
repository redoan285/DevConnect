import express, {type Request, type Response} from "express";
import { prisma } from "./lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

const app = express();
const port = 3000;



app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello World!" });
});


// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: "DevConnect API is working perfectly!",
  });
});


app.post("/api/users", async (req: Request, res: Response) => {
 try {
   const { name, email } = req.body;

  if(
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body. 'name' and 'email' are required.",
    });
  }
 const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
    },
  });
  res.status(201).json({
    success: true,
    data: user,
  });
 } 
catch (error) {
  console.error("Error creating user:", error);
  res.status(500).json({
    success: false,
    message: "Failed to create user. Email may already exist.",
  });
}
});


// Get all users
app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      results: users.length,
      data: users,
    });
  } catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      success: false,
      message: "This email is already registered.",
    });
    return;
  }

  console.error("Error creating user:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}
});


 // Update a user


 // Update a user
app.patch("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "A valid name is required.",
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name: name.trim() },
    });

    res.json({
      success: true,
      message: "User updated successfully!",
      data: user,
    });
  } catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    res.status(404).json({
      success: false,
      message: "User not found.",
    });
    return;
  }

  console.error("Update user error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}
});




            // ! eta auto suggation @@@@
// app.put("/api/users/:id", async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { name, email } = req.body;

//   if (typeof id !== "string") {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid user ID.",
//     });
//   }

//   try {
//     const user = await prisma.user.update({
//       where: { id },
//       data: {
//         name: name.trim(),
//         email: email.trim(),
//       },
//     });

//     res.json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update user.",
//     });
//   }
// });



 // Delete a user

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "User deleted successfully!",
      data: user,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
