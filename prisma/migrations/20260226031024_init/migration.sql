-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '/',
    "dj_role_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "counters" (
    "id" SERIAL NOT NULL,
    "guild_id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "match_type" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_logs" (
    "id" SERIAL NOT NULL,
    "counter_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counter_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "counters_guild_id_idx" ON "counters"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "counters_guild_id_word_key" ON "counters"("guild_id", "word");

-- CreateIndex
CREATE INDEX "counter_logs_counter_id_created_at_idx" ON "counter_logs"("counter_id", "created_at");

-- CreateIndex
CREATE INDEX "counter_logs_counter_id_user_id_idx" ON "counter_logs"("counter_id", "user_id");

-- AddForeignKey
ALTER TABLE "counter_logs" ADD CONSTRAINT "counter_logs_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "counters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
