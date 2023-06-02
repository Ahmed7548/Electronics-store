import { z } from "zod";

export const conWithGoogleSchema = z.object({
	credentials: z.string(),
});

export type ConWithGoogleReq = z.infer<typeof conWithGoogleSchema>;
