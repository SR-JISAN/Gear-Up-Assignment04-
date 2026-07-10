import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path : path.join(process.cwd(), ".env")
})

export default {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET!,
  jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET!,
  jwt_access_token_expiry: process.env.JWT_ACCESS_TOKEN_EXPIRY!,
  jwt_refresh_token_expiry: process.env.JWT_REFRESH_TOKEN_EXPIRY!,
  strip_secret_key: process.env.STRIP_SECRET_KEY!,
};