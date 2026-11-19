import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const BUCKETS = {
  PROFILE: 'profile-images',
  PROJECTS: 'project-images',
  CERTIFICATES: 'certificates',
  RESUMES: 'resumes',
};

/**
 * Uploads a file to a specified Supabase storage bucket
 * @param {string} bucket - The bucket name
 * @param {File} file - The file to upload
 * @param {string} [customPath] - Optional custom path or filename
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFile = async (bucket, file, customPath = '') => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Unable to upload file.');
  }

  // Sanitize file name
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const filePath = customPath || `${timestamp}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

/**
 * Deletes a file from Supabase storage given its public URL or path
 * @param {string} bucket 
 * @param {string} urlOrPath 
 */
export const deleteFile = async (bucket, urlOrPath) => {
  if (!isSupabaseConfigured() || !supabase || !urlOrPath) return;

  try {
    // Extract file path from URL if a full URL was provided
    let path = urlOrPath;
    if (urlOrPath.includes(bucket)) {
      const parts = urlOrPath.split(`/${bucket}/`);
      if (parts.length > 1) {
        path = parts[1].split('?')[0]; // remove query params if any
      }
    }

    await supabase.storage.from(bucket).remove([path]);
  } catch (err) {
    console.warn(`Could not delete file from ${bucket}:`, err);
  }
};
