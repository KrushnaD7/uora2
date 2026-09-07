import { AuthService } from "./src/modules/auth/auth.service";

async function main() {
  const authService = new AuthService();
  try {
    const result = await authService.register(
      "Super Admin",
      "admin@uora.com",
      "password123",
      "ADMIN"
    );
    console.log("Admin user created successfully!");
    console.log("Email:", result.user.email);
  } catch (error: any) {
    if (error.message === "Email already in use") {
      console.log("Admin user already exists with email: admin@uora.com");
    } else {
      console.error("Failed to create admin:", error);
    }
  }
}

main().then(() => process.exit(0));
