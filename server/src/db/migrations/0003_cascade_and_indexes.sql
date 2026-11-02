ALTER TABLE "audio_chunks" DROP CONSTRAINT "audio_chunks_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "audio_chunks" ADD CONSTRAINT "audio_chunks_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audio_chunks_room_id_idx" ON "audio_chunks" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "audio_chunks_embeddings_idx" ON "audio_chunks" USING hnsw ("embeddings" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "questions_room_id_idx" ON "questions" USING btree ("room_id");