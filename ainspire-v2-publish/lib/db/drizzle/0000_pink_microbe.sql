CREATE TABLE "action_plan_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_id" uuid NOT NULL,
	"action_text" text NOT NULL,
	"owner_type" text NOT NULL,
	"effort_level" text NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_plan_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_plan_id" uuid NOT NULL,
	"phase_number" integer NOT NULL,
	"title" text NOT NULL,
	"days_label" text NOT NULL,
	"objective" text,
	"success_metric" text
);
--> statement-breakpoint
CREATE TABLE "action_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"department_id" uuid,
	"created_by_user_id" uuid,
	"source_snapshot_id" uuid,
	"title" text NOT NULL,
	"executive_summary" text,
	"dominant_persona" text,
	"team_size" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"generated_by_model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"session_id" text,
	"assessment_session_id" uuid,
	"user_id" uuid,
	"organization_id" uuid,
	"anonymous_id" text,
	"event_name" text NOT NULL,
	"event_category" text NOT NULL,
	"screen_name" text,
	"language_code" text,
	"question_id" uuid,
	"result_id" uuid,
	"recommendation_id" uuid,
	"video_id" text,
	"action_plan_id" uuid,
	"properties" jsonb,
	"route" text,
	"user_agent" text,
	"device_type" text,
	"duration_ms" integer,
	"success" boolean,
	"error_code" text,
	"correlation_id" text
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"selected_option_code" text NOT NULL,
	"score" integer NOT NULL,
	"time_to_answer_ms" integer,
	"changed_count" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"consent_type" text NOT NULL,
	"consent_version" text NOT NULL,
	"accepted" boolean NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "assessment_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_code" text NOT NULL,
	"text_en" text NOT NULL,
	"text_bm" text NOT NULL,
	"score" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_version_id" uuid NOT NULL,
	"dimension_id" uuid NOT NULL,
	"question_code" text NOT NULL,
	"question_number" integer NOT NULL,
	"text_en" text NOT NULL,
	"text_bm" text NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	"is_canonical" boolean DEFAULT false NOT NULL,
	"persona_code" text NOT NULL,
	"overall_readiness" integer NOT NULL,
	"confidence" numeric(5, 4),
	"reasoning" text,
	"narrative" text,
	"model_name" text,
	"prompt_version" text,
	"mcp_context_version" text,
	"generation_status" text DEFAULT 'completed' NOT NULL,
	"raw_model_response_redacted" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"user_id" uuid,
	"assessment_version_id" uuid NOT NULL,
	"department_id" uuid,
	"submitted_department_name" text,
	"role_id" uuid,
	"submitted_role_name" text,
	"language_started" text DEFAULT 'EN' NOT NULL,
	"status" text DEFAULT 'started' NOT NULL,
	"client_session_id" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"minimum_questions" integer DEFAULT 20 NOT NULL,
	"maximum_questions" integer DEFAULT 20 NOT NULL,
	"published_at" timestamp with time zone,
	"retired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dimension_id" uuid NOT NULL,
	"topic_en" text NOT NULL,
	"topic_bm" text,
	"search_terms_en" text[],
	"search_terms_bm" text[],
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "open_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"question_code" text NOT NULL,
	"response_text" text NOT NULL,
	"language_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persona_readiness_bands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_code" text NOT NULL,
	"assessment_version_id" uuid NOT NULL,
	"minimum_percentage" integer NOT NULL,
	"maximum_percentage" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"code" text PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_bm" text NOT NULL,
	"tagline_en" text,
	"tagline_bm" text,
	"description_en" text,
	"description_bm" text,
	"color" text,
	"icon_key" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_dimension_mappings" (
	"project_id" uuid NOT NULL,
	"dimension_id" uuid NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_dimension_mappings_project_id_dimension_id_pk" PRIMARY KEY("project_id","dimension_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"department_id" uuid,
	"code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bm" text,
	"description_en" text,
	"description_bm" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "readiness_dimensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bm" text NOT NULL,
	"description_en" text,
	"description_bm" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"video_id" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"video_title" text NOT NULL,
	"channel_title" text,
	"duration" text,
	"relevance_statement" text,
	"youtube_api_source" text
);
--> statement-breakpoint
CREATE TABLE "result_dimension_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_result_id" uuid NOT NULL,
	"dimension_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"score_max" integer DEFAULT 100 NOT NULL,
	"percentage" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_persona_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_result_id" uuid NOT NULL,
	"persona_code" text NOT NULL,
	"score" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_result_id" uuid NOT NULL,
	"sequence_number" integer NOT NULL,
	"recommendation_type" text DEFAULT 'learning' NOT NULL,
	"dimension_id" uuid,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"source" text DEFAULT 'mcp' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"department_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"employee_number" text,
	"name" text,
	"email" text,
	"user_type" text DEFAULT 'employee' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workforce_assessment_links" (
	"workforce_member_id" uuid NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workforce_assessment_links_workforce_member_id_assessment_session_id_pk" PRIMARY KEY("workforce_member_id","assessment_session_id")
);
--> statement-breakpoint
CREATE TABLE "workforce_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_number" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"department_id" uuid,
	"role_id" uuid,
	"grade_code" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workforce_persona_distributions" (
	"snapshot_id" uuid NOT NULL,
	"persona_code" text NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"percentage" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "workforce_persona_distributions_snapshot_id_persona_code_pk" PRIMARY KEY("snapshot_id","persona_code")
);
--> statement-breakpoint
CREATE TABLE "workforce_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"department_id" uuid,
	"snapshot_date" timestamp with time zone NOT NULL,
	"completed_count" integer DEFAULT 0 NOT NULL,
	"pending_count" integer DEFAULT 0 NOT NULL,
	"average_readiness" integer,
	"dominant_persona" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "action_plan_actions" ADD CONSTRAINT "action_plan_actions_phase_id_action_plan_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."action_plan_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plan_phases" ADD CONSTRAINT "action_plan_phases_action_plan_id_action_plans_id_fk" FOREIGN KEY ("action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_source_snapshot_id_workforce_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."workforce_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_dominant_persona_personas_code_fk" FOREIGN KEY ("dominant_persona") REFERENCES "public"."personas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_language_code_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_result_id_assessment_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."assessment_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_recommendation_id_result_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."result_recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_action_plan_id_action_plans_id_fk" FOREIGN KEY ("action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_selected_option_id_assessment_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."assessment_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_consents" ADD CONSTRAINT "assessment_consents_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_options" ADD CONSTRAINT "assessment_options_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_version_id_assessment_versions_id_fk" FOREIGN KEY ("assessment_version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_dimension_id_readiness_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."readiness_dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_language_code_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_persona_code_personas_code_fk" FOREIGN KEY ("persona_code") REFERENCES "public"."personas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_assessment_version_id_assessment_versions_id_fk" FOREIGN KEY ("assessment_version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sessions" ADD CONSTRAINT "assessment_sessions_language_started_languages_code_fk" FOREIGN KEY ("language_started") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_dimension_id_readiness_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."readiness_dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_responses" ADD CONSTRAINT "open_responses_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "open_responses" ADD CONSTRAINT "open_responses_language_code_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_readiness_bands" ADD CONSTRAINT "persona_readiness_bands_persona_code_personas_code_fk" FOREIGN KEY ("persona_code") REFERENCES "public"."personas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_readiness_bands" ADD CONSTRAINT "persona_readiness_bands_assessment_version_id_assessment_versions_id_fk" FOREIGN KEY ("assessment_version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dimension_mappings" ADD CONSTRAINT "project_dimension_mappings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_dimension_mappings" ADD CONSTRAINT "project_dimension_mappings_dimension_id_readiness_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."readiness_dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_videos" ADD CONSTRAINT "recommendation_videos_recommendation_id_result_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."result_recommendations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_dimension_scores" ADD CONSTRAINT "result_dimension_scores_assessment_result_id_assessment_results_id_fk" FOREIGN KEY ("assessment_result_id") REFERENCES "public"."assessment_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_dimension_scores" ADD CONSTRAINT "result_dimension_scores_dimension_id_readiness_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."readiness_dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_persona_scores" ADD CONSTRAINT "result_persona_scores_assessment_result_id_assessment_results_id_fk" FOREIGN KEY ("assessment_result_id") REFERENCES "public"."assessment_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_persona_scores" ADD CONSTRAINT "result_persona_scores_persona_code_personas_code_fk" FOREIGN KEY ("persona_code") REFERENCES "public"."personas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_recommendations" ADD CONSTRAINT "result_recommendations_assessment_result_id_assessment_results_id_fk" FOREIGN KEY ("assessment_result_id") REFERENCES "public"."assessment_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_recommendations" ADD CONSTRAINT "result_recommendations_dimension_id_readiness_dimensions_id_fk" FOREIGN KEY ("dimension_id") REFERENCES "public"."readiness_dimensions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_assessment_links" ADD CONSTRAINT "workforce_assessment_links_workforce_member_id_workforce_members_id_fk" FOREIGN KEY ("workforce_member_id") REFERENCES "public"."workforce_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_assessment_links" ADD CONSTRAINT "workforce_assessment_links_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_members" ADD CONSTRAINT "workforce_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_members" ADD CONSTRAINT "workforce_members_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_members" ADD CONSTRAINT "workforce_members_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_persona_distributions" ADD CONSTRAINT "workforce_persona_distributions_snapshot_id_workforce_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."workforce_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_persona_distributions" ADD CONSTRAINT "workforce_persona_distributions_persona_code_personas_code_fk" FOREIGN KEY ("persona_code") REFERENCES "public"."personas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_snapshots" ADD CONSTRAINT "workforce_snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_snapshots" ADD CONSTRAINT "workforce_snapshots_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workforce_snapshots" ADD CONSTRAINT "workforce_snapshots_dominant_persona_personas_code_fk" FOREIGN KEY ("dominant_persona") REFERENCES "public"."personas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "action_plan_phases_plan_number_idx" ON "action_plan_phases" USING btree ("action_plan_id","phase_number");--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_events_event_id_idx" ON "analytics_events" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_answers_session_question_idx" ON "assessment_answers" USING btree ("assessment_session_id","question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_consents_session_type_idx" ON "assessment_consents" USING btree ("assessment_session_id","consent_type");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_options_question_code_idx" ON "assessment_options" USING btree ("question_id","option_code");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_questions_version_code_idx" ON "assessment_questions" USING btree ("assessment_version_id","question_code");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_questions_version_number_idx" ON "assessment_questions" USING btree ("assessment_version_id","question_number");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_results_session_language_idx" ON "assessment_results" USING btree ("assessment_session_id","language_code");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_versions_code_idx" ON "assessment_versions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_org_code_idx" ON "departments" USING btree ("organization_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_code_idx" ON "organizations" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "persona_bands_version_persona_idx" ON "persona_readiness_bands" USING btree ("assessment_version_id","persona_code");--> statement-breakpoint
CREATE UNIQUE INDEX "readiness_dimensions_code_idx" ON "readiness_dimensions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_videos_recommendation_idx" ON "recommendation_videos" USING btree ("recommendation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "result_dimension_scores_result_dimension_idx" ON "result_dimension_scores" USING btree ("assessment_result_id","dimension_id");--> statement-breakpoint
CREATE UNIQUE INDEX "result_persona_scores_result_persona_idx" ON "result_persona_scores" USING btree ("assessment_result_id","persona_code");--> statement-breakpoint
CREATE UNIQUE INDEX "result_recommendations_result_sequence_idx" ON "result_recommendations" USING btree ("assessment_result_id","sequence_number");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_org_code_idx" ON "roles" USING btree ("organization_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "users_employee_number_idx" ON "users" USING btree ("organization_id","employee_number");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "workforce_members_org_employee_idx" ON "workforce_members" USING btree ("organization_id","employee_number");