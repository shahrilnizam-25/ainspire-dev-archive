import {
	boolean,
	integer,
	jsonb,
	numeric,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

const createdUpdated = {
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const organizationsTable = pgTable("organizations", {
	id: uuid("id").defaultRandom().primaryKey(),
	code: text("code").notNull(),
	name: text("name").notNull(),
	status: text("status").notNull().default("active"),
	...createdUpdated,
}, (table) => [uniqueIndex("organizations_code_idx").on(table.code)]);

export const usersTable = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").references(() => organizationsTable.id),
	employeeNumber: text("employee_number"),
	name: text("name"),
	email: text("email"),
	userType: text("user_type").notNull().default("employee"),
	status: text("status").notNull().default("active"),
	...createdUpdated,
}, (table) => [
	uniqueIndex("users_employee_number_idx").on(table.organizationId, table.employeeNumber),
	uniqueIndex("users_email_idx").on(table.email),
]);

export const departmentsTable = pgTable("departments", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").references(() => organizationsTable.id),
	code: text("code").notNull(),
	name: text("name").notNull(),
	displayOrder: integer("display_order").notNull().default(0),
	active: boolean("active").notNull().default(true),
	...createdUpdated,
}, (table) => [uniqueIndex("departments_org_code_idx").on(table.organizationId, table.code)]);

export const rolesTable = pgTable("roles", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").references(() => organizationsTable.id),
	departmentId: uuid("department_id").references(() => departmentsTable.id),
	code: text("code").notNull(),
	name: text("name").notNull(),
	displayOrder: integer("display_order").notNull().default(0),
	active: boolean("active").notNull().default(true),
	...createdUpdated,
}, (table) => [uniqueIndex("roles_org_code_idx").on(table.organizationId, table.code)]);

export const languagesTable = pgTable("languages", {
	code: text("code").primaryKey(),
	name: text("name").notNull(),
	active: boolean("active").notNull().default(true),
});

export const readinessDimensionsTable = pgTable("readiness_dimensions", {
	id: uuid("id").defaultRandom().primaryKey(),
	code: text("code").notNull(),
	nameEn: text("name_en").notNull(),
	nameBm: text("name_bm").notNull(),
	descriptionEn: text("description_en"),
	descriptionBm: text("description_bm"),
	displayOrder: integer("display_order").notNull().default(0),
	active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("readiness_dimensions_code_idx").on(table.code)]);

export const assessmentVersionsTable = pgTable("assessment_versions", {
	id: uuid("id").defaultRandom().primaryKey(),
	code: text("code").notNull(),
	name: text("name").notNull(),
	status: text("status").notNull().default("draft"),
	minimumQuestions: integer("minimum_questions").notNull().default(20),
	maximumQuestions: integer("maximum_questions").notNull().default(20),
	publishedAt: timestamp("published_at", { withTimezone: true }),
	retiredAt: timestamp("retired_at", { withTimezone: true }),
	...createdUpdated,
}, (table) => [uniqueIndex("assessment_versions_code_idx").on(table.code)]);

export const assessmentQuestionsTable = pgTable("assessment_questions", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentVersionId: uuid("assessment_version_id").notNull().references(() => assessmentVersionsTable.id),
	dimensionId: uuid("dimension_id").notNull().references(() => readinessDimensionsTable.id),
	questionCode: text("question_code").notNull(),
	questionNumber: integer("question_number").notNull(),
	textEn: text("text_en").notNull(),
	textBm: text("text_bm").notNull(),
	required: boolean("required").notNull().default(true),
	active: boolean("active").notNull().default(true),
}, (table) => [
	uniqueIndex("assessment_questions_version_code_idx").on(table.assessmentVersionId, table.questionCode),
	uniqueIndex("assessment_questions_version_number_idx").on(table.assessmentVersionId, table.questionNumber),
]);

export const assessmentOptionsTable = pgTable("assessment_options", {
	id: uuid("id").defaultRandom().primaryKey(),
	questionId: uuid("question_id").notNull().references(() => assessmentQuestionsTable.id),
	optionCode: text("option_code").notNull(),
	textEn: text("text_en").notNull(),
	textBm: text("text_bm").notNull(),
	score: integer("score").notNull(),
	displayOrder: integer("display_order").notNull().default(0),
}, (table) => [uniqueIndex("assessment_options_question_code_idx").on(table.questionId, table.optionCode)]);

export const personasTable = pgTable("personas", {
	code: text("code").primaryKey(),
	nameEn: text("name_en").notNull(),
	nameBm: text("name_bm").notNull(),
	taglineEn: text("tagline_en"),
	taglineBm: text("tagline_bm"),
	descriptionEn: text("description_en"),
	descriptionBm: text("description_bm"),
	color: text("color"),
	iconKey: text("icon_key"),
	displayOrder: integer("display_order").notNull().default(0),
	active: boolean("active").notNull().default(true),
});

export const personaReadinessBandsTable = pgTable("persona_readiness_bands", {
	id: uuid("id").defaultRandom().primaryKey(),
	personaCode: text("persona_code").notNull().references(() => personasTable.code),
	assessmentVersionId: uuid("assessment_version_id").notNull().references(() => assessmentVersionsTable.id),
	minimumPercentage: integer("minimum_percentage").notNull(),
	maximumPercentage: integer("maximum_percentage").notNull(),
}, (table) => [uniqueIndex("persona_bands_version_persona_idx").on(table.assessmentVersionId, table.personaCode)]);

export const assessmentSessionsTable = pgTable("assessment_sessions", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").references(() => organizationsTable.id),
	userId: uuid("user_id").references(() => usersTable.id),
	assessmentVersionId: uuid("assessment_version_id").notNull().references(() => assessmentVersionsTable.id),
	departmentId: uuid("department_id").references(() => departmentsTable.id),
	submittedDepartmentName: text("submitted_department_name"),
	roleId: uuid("role_id").references(() => rolesTable.id),
	submittedRoleName: text("submitted_role_name"),
	languageStarted: text("language_started").notNull().default("EN").references(() => languagesTable.code),
	status: text("status").notNull().default("started"),
	clientSessionId: text("client_session_id"),
	startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
	submittedAt: timestamp("submitted_at", { withTimezone: true }),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow().notNull(),
});

export const assessmentAnswersTable = pgTable("assessment_answers", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentSessionId: uuid("assessment_session_id").notNull().references(() => assessmentSessionsTable.id),
	questionId: uuid("question_id").notNull().references(() => assessmentQuestionsTable.id),
	selectedOptionId: uuid("selected_option_id").notNull().references(() => assessmentOptionsTable.id),
	questionNumber: integer("question_number").notNull(),
	selectedOptionCode: text("selected_option_code").notNull(),
	score: integer("score").notNull(),
	timeToAnswerMs: integer("time_to_answer_ms"),
	changedCount: integer("changed_count").notNull().default(0),
	answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("assessment_answers_session_question_idx").on(table.assessmentSessionId, table.questionId)]);

export const assessmentConsentsTable = pgTable("assessment_consents", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentSessionId: uuid("assessment_session_id").notNull().references(() => assessmentSessionsTable.id),
	consentType: text("consent_type").notNull(),
	consentVersion: text("consent_version").notNull(),
	accepted: boolean("accepted").notNull(),
	acceptedAt: timestamp("accepted_at", { withTimezone: true }).defaultNow().notNull(),
	ipHash: text("ip_hash"),
	userAgent: text("user_agent"),
}, (table) => [uniqueIndex("assessment_consents_session_type_idx").on(table.assessmentSessionId, table.consentType)]);

export const openResponsesTable = pgTable("open_responses", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentSessionId: uuid("assessment_session_id").notNull().references(() => assessmentSessionsTable.id),
	questionCode: text("question_code").notNull(),
	responseText: text("response_text").notNull(),
	languageCode: text("language_code").notNull().references(() => languagesTable.code),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const assessmentResultsTable = pgTable("assessment_results", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentSessionId: uuid("assessment_session_id").notNull().references(() => assessmentSessionsTable.id),
	languageCode: text("language_code").notNull().references(() => languagesTable.code),
	isCanonical: boolean("is_canonical").notNull().default(false),
	personaCode: text("persona_code").notNull().references(() => personasTable.code),
	overallReadiness: integer("overall_readiness").notNull(),
	confidence: numeric("confidence", { precision: 5, scale: 4 }),
	reasoning: text("reasoning"),
	narrative: text("narrative"),
	modelName: text("model_name"),
	promptVersion: text("prompt_version"),
	mcpContextVersion: text("mcp_context_version"),
	generationStatus: text("generation_status").notNull().default("completed"),
	rawModelResponseRedacted: jsonb("raw_model_response_redacted"),
	...createdUpdated,
}, (table) => [uniqueIndex("assessment_results_session_language_idx").on(table.assessmentSessionId, table.languageCode)]);

export const resultDimensionScoresTable = pgTable("result_dimension_scores", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentResultId: uuid("assessment_result_id").notNull().references(() => assessmentResultsTable.id),
	dimensionId: uuid("dimension_id").notNull().references(() => readinessDimensionsTable.id),
	score: integer("score").notNull(),
	scoreMax: integer("score_max").notNull().default(100),
	percentage: integer("percentage").notNull(),
}, (table) => [uniqueIndex("result_dimension_scores_result_dimension_idx").on(table.assessmentResultId, table.dimensionId)]);

export const resultPersonaScoresTable = pgTable("result_persona_scores", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentResultId: uuid("assessment_result_id").notNull().references(() => assessmentResultsTable.id),
	personaCode: text("persona_code").notNull().references(() => personasTable.code),
	score: integer("score").notNull(),
}, (table) => [uniqueIndex("result_persona_scores_result_persona_idx").on(table.assessmentResultId, table.personaCode)]);

export const projectsTable = pgTable("projects", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").references(() => organizationsTable.id),
	departmentId: uuid("department_id").references(() => departmentsTable.id),
	code: text("code").notNull(),
	nameEn: text("name_en").notNull(),
	nameBm: text("name_bm"),
	descriptionEn: text("description_en"),
	descriptionBm: text("description_bm"),
	active: boolean("active").notNull().default(true),
});

export const projectDimensionMappingsTable = pgTable("project_dimension_mappings", {
	projectId: uuid("project_id").notNull().references(() => projectsTable.id),
	dimensionId: uuid("dimension_id").notNull().references(() => readinessDimensionsTable.id),
	priority: integer("priority").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.projectId, table.dimensionId] })]);

export const learningTopicsTable = pgTable("learning_topics", {
	id: uuid("id").defaultRandom().primaryKey(),
	dimensionId: uuid("dimension_id").notNull().references(() => readinessDimensionsTable.id),
	topicEn: text("topic_en").notNull(),
	topicBm: text("topic_bm"),
	searchTermsEn: text("search_terms_en").array(),
	searchTermsBm: text("search_terms_bm").array(),
	active: boolean("active").notNull().default(true),
});

export const resultRecommendationsTable = pgTable("result_recommendations", {
	id: uuid("id").defaultRandom().primaryKey(),
	assessmentResultId: uuid("assessment_result_id").notNull().references(() => assessmentResultsTable.id),
	sequenceNumber: integer("sequence_number").notNull(),
	recommendationType: text("recommendation_type").notNull().default("learning"),
	dimensionId: uuid("dimension_id").references(() => readinessDimensionsTable.id),
	title: text("title").notNull(),
	description: text("description").notNull(),
	source: text("source").notNull().default("mcp"),
}, (table) => [uniqueIndex("result_recommendations_result_sequence_idx").on(table.assessmentResultId, table.sequenceNumber)]);

export const recommendationVideosTable = pgTable("recommendation_videos", {
	id: uuid("id").defaultRandom().primaryKey(),
	recommendationId: uuid("recommendation_id").notNull().references(() => resultRecommendationsTable.id),
	videoId: text("video_id").notNull(),
	videoUrl: text("video_url").notNull(),
	thumbnailUrl: text("thumbnail_url").notNull(),
	videoTitle: text("video_title").notNull(),
	channelTitle: text("channel_title"),
	duration: text("duration"),
	relevanceStatement: text("relevance_statement"),
	youtubeApiSource: text("youtube_api_source"),
}, (table) => [uniqueIndex("recommendation_videos_recommendation_idx").on(table.recommendationId)]);

export const workforceMembersTable = pgTable("workforce_members", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id),
	employeeNumber: text("employee_number").notNull(),
	name: text("name").notNull(),
	email: text("email"),
	departmentId: uuid("department_id").references(() => departmentsTable.id),
	roleId: uuid("role_id").references(() => rolesTable.id),
	gradeCode: text("grade_code"),
	active: boolean("active").notNull().default(true),
}, (table) => [uniqueIndex("workforce_members_org_employee_idx").on(table.organizationId, table.employeeNumber)]);

export const workforceAssessmentLinksTable = pgTable("workforce_assessment_links", {
	workforceMemberId: uuid("workforce_member_id").notNull().references(() => workforceMembersTable.id),
	assessmentSessionId: uuid("assessment_session_id").notNull().references(() => assessmentSessionsTable.id),
	isCurrent: boolean("is_current").notNull().default(true),
	linkedAt: timestamp("linked_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.workforceMemberId, table.assessmentSessionId] })]);

export const workforceSnapshotsTable = pgTable("workforce_snapshots", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id),
	departmentId: uuid("department_id").references(() => departmentsTable.id),
	snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
	completedCount: integer("completed_count").notNull().default(0),
	pendingCount: integer("pending_count").notNull().default(0),
	averageReadiness: integer("average_readiness"),
	dominantPersona: text("dominant_persona").references(() => personasTable.code),
	...createdUpdated,
});

export const workforcePersonaDistributionsTable = pgTable("workforce_persona_distributions", {
	snapshotId: uuid("snapshot_id").notNull().references(() => workforceSnapshotsTable.id),
	personaCode: text("persona_code").notNull().references(() => personasTable.code),
	memberCount: integer("member_count").notNull().default(0),
	percentage: integer("percentage").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.snapshotId, table.personaCode] })]);

export const actionPlansTable = pgTable("action_plans", {
	id: uuid("id").defaultRandom().primaryKey(),
	organizationId: uuid("organization_id").notNull().references(() => organizationsTable.id),
	departmentId: uuid("department_id").references(() => departmentsTable.id),
	createdByUserId: uuid("created_by_user_id").references(() => usersTable.id),
	sourceSnapshotId: uuid("source_snapshot_id").references(() => workforceSnapshotsTable.id),
	title: text("title").notNull(),
	executiveSummary: text("executive_summary"),
	dominantPersona: text("dominant_persona").references(() => personasTable.code),
	teamSize: integer("team_size"),
	status: text("status").notNull().default("draft"),
	generatedByModel: text("generated_by_model"),
	...createdUpdated,
});

export const actionPlanPhasesTable = pgTable("action_plan_phases", {
	id: uuid("id").defaultRandom().primaryKey(),
	actionPlanId: uuid("action_plan_id").notNull().references(() => actionPlansTable.id),
	phaseNumber: integer("phase_number").notNull(),
	title: text("title").notNull(),
	daysLabel: text("days_label").notNull(),
	objective: text("objective"),
	successMetric: text("success_metric"),
}, (table) => [uniqueIndex("action_plan_phases_plan_number_idx").on(table.actionPlanId, table.phaseNumber)]);

export const actionPlanActionsTable = pgTable("action_plan_actions", {
	id: uuid("id").defaultRandom().primaryKey(),
	phaseId: uuid("phase_id").notNull().references(() => actionPlanPhasesTable.id),
	actionText: text("action_text").notNull(),
	ownerType: text("owner_type").notNull(),
	effortLevel: text("effort_level").notNull(),
	status: text("status").notNull().default("planned"),
});

export const analyticsEventsTable = pgTable("analytics_events", {
	id: uuid("id").defaultRandom().primaryKey(),
	eventId: uuid("event_id").defaultRandom().notNull(),
	occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
	sessionId: text("session_id"),
	assessmentSessionId: uuid("assessment_session_id").references(() => assessmentSessionsTable.id),
	userId: uuid("user_id").references(() => usersTable.id),
	organizationId: uuid("organization_id").references(() => organizationsTable.id),
	anonymousId: text("anonymous_id"),
	eventName: text("event_name").notNull(),
	eventCategory: text("event_category").notNull(),
	screenName: text("screen_name"),
	languageCode: text("language_code").references(() => languagesTable.code),
	questionId: uuid("question_id").references(() => assessmentQuestionsTable.id),
	resultId: uuid("result_id").references(() => assessmentResultsTable.id),
	recommendationId: uuid("recommendation_id").references(() => resultRecommendationsTable.id),
	videoId: text("video_id"),
	actionPlanId: uuid("action_plan_id").references(() => actionPlansTable.id),
	properties: jsonb("properties"),
	route: text("route"),
	userAgent: text("user_agent"),
	deviceType: text("device_type"),
	durationMs: integer("duration_ms"),
	success: boolean("success"),
	errorCode: text("error_code"),
	correlationId: text("correlation_id"),
}, (table) => [uniqueIndex("analytics_events_event_id_idx").on(table.eventId)]);

export type Organization = typeof organizationsTable.$inferSelect;
export type AssessmentSession = typeof assessmentSessionsTable.$inferSelect;
export type AssessmentAnswer = typeof assessmentAnswersTable.$inferSelect;
export type AssessmentResult = typeof assessmentResultsTable.$inferSelect;
export type AnalyticsEvent = typeof analyticsEventsTable.$inferSelect;