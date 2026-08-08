import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = "generated-images";

export async function uploadImageFromBase64(
  base64: string,
  mimeType = "image/png",
): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const ext = mimeType.split("/")[1] ?? "png";
  const path = `${nanoid()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

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
