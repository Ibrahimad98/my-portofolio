import type { ProjectMedia } from '@/types/Portfolio'

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'

/** API key — read once at module level so every helper can use it */
const API_KEY: string = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ?? ''

/**
 * Generates a direct viewable image URL from a Google Drive file ID.
 *
 * Uses the Drive REST API `alt=media` endpoint which streams the file bytes
 * directly (HTTP 200, correct Content-Type) — no redirects, no CORS issues,
 * no rate-limiting, as long as the API key is valid and the file is public.
 */
export function driveFileUrl(fileId: string, _width?: number): string {
  return `${DRIVE_API_BASE}/files/${fileId}?alt=media&key=${API_KEY}`
}

/**
 * Returns the direct download / full-resolution URL for a file.
 * Same API endpoint as driveFileUrl — streams the original file bytes.
 */
export function driveDownloadUrl(fileId: string): string {
  return `${DRIVE_API_BASE}/files/${fileId}?alt=media&key=${API_KEY}`
}

/**
 * Google Drive API service.
 * Uses the Google Drive REST v3 API with an API key (no OAuth needed for public files).
 *
 * Prerequisites:
 * 1. Create a GCP project at https://console.cloud.google.com
 * 2. Enable the "Google Drive API"
 * 3. Create an API key under Credentials
 * 4. Share your Drive folder(s)/file(s) as "Anyone with the link can view"
 * 5. Set VITE_GOOGLE_DRIVE_API_KEY in your .env file
 */
export function createGoogleDriveService(apiKey?: string) {
  const _apiKey = apiKey ?? API_KEY

  /**
   * List image/video files in a Google Drive folder.
   * Returns file metadata (id, name, mimeType, thumbnailLink).
   */
  async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
    if (!_apiKey) {
      console.warn('[GoogleDriveService] No API key configured. Skipping Drive fetch.')
      return []
    }

    const query = `'${folderId}' in parents and trashed = false`
    const fields = 'files(id,name,mimeType,thumbnailLink,description)'
    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&key=${_apiKey}&orderBy=name`

    const res = await fetch(url)
    if (!res.ok) {
      console.error('[GoogleDriveService] Failed to list files:', res.status, await res.text())
      return []
    }

    const data = (await res.json()) as { files: DriveFile[] }
    return data.files ?? []
  }

  /**
   * Get a single file's metadata from Google Drive.
   */
  async function getFile(fileId: string): Promise<DriveFile | null> {
    if (!_apiKey) return null

    const fields = 'id,name,mimeType,thumbnailLink,description'
    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=${encodeURIComponent(fields)}&key=${_apiKey}`

    const res = await fetch(url)
    if (!res.ok) {
      console.error('[GoogleDriveService] Failed to get file:', res.status)
      return null
    }

    return (await res.json()) as DriveFile
  }

  /**
   * Convert Drive files from a folder into ProjectMedia items.
   * Image files (image/*) become type: 'image', video files (video/*) become type: 'video'.
   * File description in Drive is used as the caption.
   */
  async function folderToMedia(folderId: string): Promise<ProjectMedia[]> {
    const files = await listFilesInFolder(folderId)
    return files.map(fileToMedia)
  }

  return {
    listFilesInFolder,
    getFile,
    folderToMedia,
    driveFileUrl,
    driveDownloadUrl,
  }
}

/**
 * Convert a single Drive file metadata object into a ProjectMedia item.
 */
export function fileToMedia(file: DriveFile): ProjectMedia {
  const isVideo = file.mimeType.startsWith('video/')

  return {
    src: isVideo ? driveDownloadUrl(file.id) : driveFileUrl(file.id),
    alt: file.name.replace(/\.[^.]+$/, ''), // strip extension for alt text
    caption: file.description ?? file.name.replace(/\.[^.]+$/, ''),
    type: isVideo ? 'video' : 'image',
    poster: isVideo ? driveFileUrl(file.id) : undefined,
    driveFileId: file.id,
  }
}

/**
 * Resolve driveFileId references in media arrays.
 * If a media item has a driveFileId, its src will be replaced with a Google Drive URL.
 * This allows the JSON data to store Drive file IDs and resolve them at runtime.
 */
export function resolveDriveMedia(media: ProjectMedia[]): ProjectMedia[] {
  return media.map((item) => {
    if (!item.driveFileId) return item

    const isVideo = item.type === 'video'
    return {
      ...item,
      src: item.src || (isVideo ? driveDownloadUrl(item.driveFileId) : driveFileUrl(item.driveFileId)),
      poster: item.poster || (isVideo ? driveFileUrl(item.driveFileId) : undefined),
    }
  })
}

/** Metadata returned by Google Drive API v3 */
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  description?: string
}

// Default service instance
export const googleDriveService = createGoogleDriveService()
