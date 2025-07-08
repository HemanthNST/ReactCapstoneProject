import {
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  uuid: uuid("id").primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  profilePicture: text("profile_picture"),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  googleTokenExpiry: timestamp("google_token_expiry"),
  isGoogleFitConnected: varchar({ length: 10 }).default("false"),
  dailyStepsGoal: integer("daily_steps_goal").default(10000),
});
