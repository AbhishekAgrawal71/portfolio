import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const BUCKETS = {
  PROFILE: 'profile-images',
  PROJECTS: 'project-images',
  CERTIFICATES: 'certificates',
  RESUMES: 'resumes',
};

export const UPLOAD_RULES = {
  [BUCKETS.PROFILE]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxSizeLabel: '5 MB',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    label: 'Profile picture',
  },
  [BUCKETS.PROJECTS]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxSizeLabel: '5 MB',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    label: 'Project screenshot',
  },
  [BUCKETS.CERTIFICATES]: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxSizeLabel: '10 MB',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    label: 'Certificate file',
  },
  [BUCKETS.RESUMES]: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxSizeLabel: '10 MB',
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
    label: 'Resume PDF',
  },
};

/**
 * Validates a file against bucket-specific upload rules.
 * @param {string} bucket - The storage bucket name
 * @param {File} file - The file object to validate
 * @throws {Error} If the file fails size, MIME, or extension validation
 * @returns {boolean} True if file is valid
 */
export const validateFile = (bucket, file) => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const rule = UPLOAD_RULES[bucket];
  if (!rule) {
    // Bucket without specific rule, basic size sanity check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File exceeds the maximum allowable upload size of 10 MB.');
    }
    return true;
  }

  // 1. File Size Check
  if (file.size > rule.maxSizeBytes) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${fileSizeMB} MB) exceeds the maximum allowed limit of ${rule.maxSizeLabel} for ${rule.label}.`
    );
  }

  // 2. MIME Type Check (if browser reported a mime type)
  if (file.type && !rule.allowedMimeTypes.includes(file.type.toLowerCase())) {
    const formattedTypes = rule.allowedExtensions.map((e) => e.replace('.', '').toUpperCase()).join(', ');
    throw new Error(
      `Invalid file format (${file.type}). Allowed formats for ${rule.label}: ${formattedTypes}.`
    );
  }

  // 3. File Extension Check
  const fileName = file.name || '';
  const lastDot = fileName.lastIndexOf('.');
  const ext = lastDot !== -1 ? fileName.slice(lastDot).toLowerCase() : '';
  if (!rule.allowedExtensions.includes(ext)) {
    const formattedExtensions = rule.allowedExtensions.map((e) => e.replace('.', '').toUpperCase()).join(', ');
    throw new Error(
      `Invalid file extension (${ext || 'none'}). Allowed extensions for ${rule.label}: ${formattedExtensions}.`
    );
  }

  return true;
};

/**
 * Uploads a file to a specified Supabase storage bucket with client-side validation.
 * @param {string} bucket - The bucket name
 * @param {File} file - The file to upload
 * @param {string} [customPath] - Optional custom path or filename
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFile = async (bucket, file, customPath = '') => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Unable to upload file.');
  }

  // Client-side validation prior to upload
  validateFile(bucket, file);

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
