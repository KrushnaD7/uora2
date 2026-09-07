-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PUBLISH') NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NULL,
    `entity_id` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `ip_address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_user_id_idx`(`user_id`),
    INDEX `activity_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journals` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `short_name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(191) NOT NULL,
    `issn` VARCHAR(191) NULL,
    `eissn` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `journals_slug_key`(`slug`),
    UNIQUE INDEX `journals_subdomain_key`(`subdomain`),
    INDEX `journals_slug_idx`(`slug`),
    INDEX `journals_subdomain_idx`(`subdomain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_settings` (
    `id` VARCHAR(191) NOT NULL,
    `journalId` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `favicon` VARCHAR(191) NULL,
    `about` TEXT NULL,
    `aims_scope` TEXT NULL,
    `ethics` TEXT NULL,
    `guidelines` TEXT NULL,
    `contact_email` VARCHAR(191) NULL,
    `contact_phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `twitter` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `journal_settings_journalId_key`(`journalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authors` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `orcid` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `authors_user_id_key`(`user_id`),
    INDEX `authors_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviewers` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `expertise` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `reviewers_email_key`(`email`),
    INDEX `reviewers_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submissions` (
    `id` VARCHAR(191) NOT NULL,
    `journalId` VARCHAR(191) NOT NULL,
    `paper_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `abstract` TEXT NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'INITIAL_SCREENING', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'REVISED_SUBMITTED', 'ACCEPTED', 'REJECTED', 'PUBLISHED') NOT NULL DEFAULT 'SUBMITTED',
    `reviewer_requested` BOOLEAN NOT NULL DEFAULT false,
    `corresponding_email` VARCHAR(191) NOT NULL,
    `corresponding_phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `submissions_paper_id_key`(`paper_id`),
    INDEX `submissions_journalId_idx`(`journalId`),
    INDEX `submissions_status_idx`(`status`),
    INDEX `submissions_paper_id_idx`(`paper_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_revisions` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `revision_number` INTEGER NOT NULL DEFAULT 1,
    `remarks` TEXT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `stored_name` VARCHAR(191) NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submission_revisions_submissionId_idx`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_authors` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `author_order` INTEGER NOT NULL DEFAULT 1,
    `is_corresponding` BOOLEAN NOT NULL DEFAULT false,

    INDEX `submission_authors_submissionId_idx`(`submissionId`),
    INDEX `submission_authors_authorId_idx`(`authorId`),
    UNIQUE INDEX `submission_authors_submissionId_authorId_key`(`submissionId`, `authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_reviewers` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `assigned_by` VARCHAR(191) NOT NULL,
    `deadline` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `submission_reviewers_submissionId_idx`(`submissionId`),
    INDEX `submission_reviewers_reviewerId_idx`(`reviewerId`),
    INDEX `submission_reviewers_assigned_by_idx`(`assigned_by`),
    UNIQUE INDEX `submission_reviewers_submissionId_reviewerId_key`(`submissionId`, `reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `submissionReviewerId` VARCHAR(191) NOT NULL,
    `recommendation` ENUM('ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT') NOT NULL,
    `overallRating` INTEGER NULL,
    `commentsToAuthor` TEXT NULL,
    `commentsToEditor` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_submissionReviewerId_key`(`submissionReviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_files` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `file_type` ENUM('MANUSCRIPT', 'REVISION', 'SUPPLEMENTARY', 'ARTICLE_PDF', 'REVIEWER_CV') NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `stored_name` VARCHAR(191) NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NULL,
    `file_size` INTEGER NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submission_files_submissionId_idx`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'INITIAL_SCREENING', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'REVISED_SUBMITTED', 'ACCEPTED', 'REJECTED', 'PUBLISHED') NOT NULL,
    `remarks` TEXT NULL,
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submission_status_history_submissionId_idx`(`submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviewer_applications` (
    `id` VARCHAR(191) NOT NULL,
    `journalId` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `expertise` TEXT NULL,
    `cv_file` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reviewer_applications_journalId_idx`(`journalId`),
    INDEX `reviewer_applications_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `volumes` (
    `id` VARCHAR(191) NOT NULL,
    `journalId` VARCHAR(191) NOT NULL,
    `volume_number` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `volumes_journalId_volume_number_key`(`journalId`, `volume_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `issues` (
    `id` VARCHAR(191) NOT NULL,
    `journalId` VARCHAR(191) NOT NULL,
    `volumeId` VARCHAR(191) NOT NULL,
    `issue_number` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `status` ENUM('UPCOMING', 'PUBLISHED') NOT NULL DEFAULT 'UPCOMING',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `issues_volumeId_issue_number_key`(`volumeId`, `issue_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `journalId` VARCHAR(191) NOT NULL,
    `issueId` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `doi` VARCHAR(191) NULL,
    `pages` VARCHAR(191) NULL,
    `pdf_url` VARCHAR(191) NULL,
    `scheduled_publish_at` DATETIME(3) NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `articles_submissionId_key`(`submissionId`),
    UNIQUE INDEX `articles_doi_key`(`doi`),
    INDEX `articles_journalId_idx`(`journalId`),
    INDEX `articles_issueId_idx`(`issueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'SUB_ADMIN', 'EDITOR', 'REVIEWER', 'AUTHOR') NOT NULL DEFAULT 'AUTHOR',
    `status` ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `password_reset_token_hash` VARCHAR(191) NULL,
    `password_reset_expires_at` DATETIME(3) NULL,
    `password_changed_at` DATETIME(3) NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `email_verify_token_hash` VARCHAR(191) NULL,
    `email_verify_expires_at` DATETIME(3) NULL,
    `login_attempts` INTEGER NOT NULL DEFAULT 0,
    `login_lock_until` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revoked_at` DATETIME(3) NULL,

    UNIQUE INDEX `refresh_tokens_token_hash_key`(`token_hash`),
    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_suggestions` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subject_domain` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `reason` TEXT NOT NULL,
    `supporting_info` TEXT NULL,
    `attachment_url` VARCHAR(191) NULL,
    `status` ENUM('SUBMITTED', 'UNDER_EDITOR_REVIEW', 'EDITOR_RECOMMENDED', 'ADMIN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_suggestion_history` (
    `id` VARCHAR(191) NOT NULL,
    `suggestionId` VARCHAR(191) NOT NULL,
    `status` ENUM('SUBMITTED', 'UNDER_EDITOR_REVIEW', 'EDITOR_RECOMMENDED', 'ADMIN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CLOSED') NOT NULL,
    `action_by` VARCHAR(191) NOT NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_settings` ADD CONSTRAINT `journal_settings_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authors` ADD CONSTRAINT `authors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_revisions` ADD CONSTRAINT `submission_revisions_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_authors` ADD CONSTRAINT `submission_authors_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_authors` ADD CONSTRAINT `submission_authors_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_reviewers` ADD CONSTRAINT `submission_reviewers_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_reviewers` ADD CONSTRAINT `submission_reviewers_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `reviewers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_reviewers` ADD CONSTRAINT `submission_reviewers_assigned_by_fkey` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_submissionReviewerId_fkey` FOREIGN KEY (`submissionReviewerId`) REFERENCES `submission_reviewers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_files` ADD CONSTRAINT `submission_files_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_status_history` ADD CONSTRAINT `submission_status_history_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviewer_applications` ADD CONSTRAINT `reviewer_applications_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `volumes` ADD CONSTRAINT `volumes_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `issues` ADD CONSTRAINT `issues_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `issues` ADD CONSTRAINT `issues_volumeId_fkey` FOREIGN KEY (`volumeId`) REFERENCES `volumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_issueId_fkey` FOREIGN KEY (`issueId`) REFERENCES `issues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_suggestions` ADD CONSTRAINT `journal_suggestions_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_suggestion_history` ADD CONSTRAINT `journal_suggestion_history_suggestionId_fkey` FOREIGN KEY (`suggestionId`) REFERENCES `journal_suggestions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_suggestion_history` ADD CONSTRAINT `journal_suggestion_history_action_by_fkey` FOREIGN KEY (`action_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

