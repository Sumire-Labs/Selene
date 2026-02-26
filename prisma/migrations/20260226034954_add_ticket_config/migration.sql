-- CreateTable
CREATE TABLE "ticket_configs" (
    "guild_id" TEXT NOT NULL,
    "panel_channel_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "support_role_id" TEXT NOT NULL,
    "panel_message_id" TEXT,
    "ticket_counter" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_configs_pkey" PRIMARY KEY ("guild_id")
);
