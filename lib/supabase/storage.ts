import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Uploads a file to a public Supabase Storage bucket and returns its URL.
 *
 * The app uses two buckets, both of which must exist and be public:
 * `uploads` for chat attachments and `avatars` for profile pictures.
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  bucket: string,
): Promise<string> {
  const ext = fileName.split(".").pop() ?? "bin";
  const path = `${nanoid()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
