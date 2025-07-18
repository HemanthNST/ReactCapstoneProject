CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"profile_picture" text,
	"google_access_token" text,
	"google_refresh_token" text,
	"google_token_expiry" timestamp,
	"isGoogleFitConnected" varchar(10) DEFAULT 'false',
	"daily_steps_goal" integer DEFAULT 10000,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
