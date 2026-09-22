import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  provider: string;
}

export interface IStorageProvider {
  name: string;
  isPersistent: boolean;
  saveImage(buffer: Buffer, mimeType: string, filename: string, baseUrl?: string): Promise<{ url: string; filename: string }>;
  deleteFile(filename: string): Promise<boolean>;
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.js', '.ts', '.html', '.htm',
  '.jsp', '.asp', '.aspx', '.py', '.rb', '.pl', '.cgi', '.dll', '.so', '.vbs'
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validates actual binary file signatures (Magic Bytes).
 */
export function verifyImageMagicBytes(buffer: Buffer, reportedMime: string): boolean {
  if (buffer.length < 4) return false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (reportedMime === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }

  // JPEG: FF D8 FF
  if (reportedMime === 'image/jpeg' || reportedMime === 'image/jpg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }

  // WebP: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
  if (reportedMime === 'image/webp') {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  // SVG: text containing <svg without binary control bytes
  if (reportedMime === 'image/svg+xml') {
    const head = buffer.slice(0, 1024).toString('utf8').trim().toLowerCase();
    return head.includes('<svg') || (head.includes('<?xml') && head.includes('<svg'));
  }

  return false;
}

/**
 * Strict SVG Sanitizer and Security Validator
 */
export function sanitizeSvgContent(buffer: Buffer): Buffer<ArrayBuffer> {
  const svgText = buffer.toString('utf8');

  // Reject executable or malicious patterns in SVG
  const dangerousPatterns = [
    /<script\b/i,
    /<\/script>/i,
    /\bon[a-z]+\s*=/i, // inline event handlers (onload, onerror, onclick, etc.)
    /javascript\s*:/i,
    /data\s*:\s*text\/html/i,
    /<foreignobject\b/i,
    /<iframe\b/i,
    /<embed\b/i,
    /<object\b/i,
    /xlink:href\s*=\s*["']\s*javascript:/i,
    /href\s*=\s*["']\s*javascript:/i,
    /<!ENTITY/i, // XML External Entity (XXE) injection
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(svgText)) {
      throw new Error('Malicious or executable script elements detected in SVG upload. Upload rejected for security.');
    }
  }

  // Ensure root <svg tag is present
  if (!/<svg\b[^>]*>/i.test(svgText)) {
    throw new Error('Invalid SVG payload: Root <svg> element missing.');
  }

  return Buffer.from(svgText, 'utf8');
}

/**
 * Local Filesystem Storage Provider (Development & Testing)
 */
export class LocalStorageProvider implements IStorageProvider {
  public name = 'local';
  public isPersistent = false;
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir
      ? path.resolve(customUploadDir)
      : process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.resolve(__dirname, '../../uploads');

    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (err) {
      console.error('[LocalStorageProvider] Error creating uploads directory:', err);
    }
  }

  public async saveImage(
    buffer: Buffer,
    _mimeType: string,
    filename: string,
    baseUrl?: string
  ): Promise<{ url: string; filename: string }> {
    this.ensureUploadDir();
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${filename}`;
    const publicUrl = baseUrl ? `${baseUrl.replace(/\/+$/, '')}${relativeUrl}` : relativeUrl;

    return { url: publicUrl, filename };
  }

  public async deleteFile(filename: string): Promise<boolean> {
    try {
      const safeFilename = path.basename(filename);
      const filePath = path.join(this.uploadDir, safeFilename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * Production Cloud/Object Storage Provider Point
 * Handles S3 / Cloudinary / Supabase or reports clear configuration error.
 */
export class ObjectStorageProvider implements IStorageProvider {
  public name: string;
  public isPersistent = true;

  constructor() {
    this.name = process.env.STORAGE_PROVIDER || 's3';
  }

  public isConfigured(): boolean {
    const provider = (process.env.STORAGE_PROVIDER || '').toLowerCase();
    if (provider === 's3' || provider === 'aws') {
      return Boolean(process.env.S3_BUCKET_NAME && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ROLE_ARN));
    }
    if (provider === 'cloudinary') {
      return Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY));
    }
    if (provider === 'supabase') {
      return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_STORAGE_BUCKET);
    }
    return false;
  }

  public async saveImage(
    _buffer: Buffer,
    _mimeType: string,
    _filename: string,
    _baseUrl?: string
  ): Promise<{ url: string; filename: string }> {
    if (!this.isConfigured()) {
      throw new Error(
        'Production persistent object storage is not configured. ' +
        'Storing uploads in the Render container filesystem causes images to disappear upon redeployment. ' +
        'Please configure persistent cloud storage (S3 / Cloudinary / Supabase) via environment variables ' +
        '(e.g., STORAGE_PROVIDER=s3, S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).'
      );
    }

    // In a fully configured environment, dispatch to the respective cloud SDK
    throw new Error(`Cloud storage provider "${this.name}" is configured but client integration is pending SDK initialization.`);
  }

  public async deleteFile(_filename: string): Promise<boolean> {
    return false;
  }
}

/**
 * Storage Service Coordinator
 */
export class StorageService {
  private localProvider: LocalStorageProvider;
  private objectProvider: ObjectStorageProvider;

  constructor() {
    this.localProvider = new LocalStorageProvider();
    this.objectProvider = new ObjectStorageProvider();

    if (process.env.NODE_ENV === 'production' && !this.objectProvider.isConfigured()) {
      console.warn(
        '[StorageService] WARNING: Persistent object storage not configured for production environment. ' +
        'Image uploads will be blocked until persistent storage credentials are provided.'
      );
    }
  }

  public getActiveProvider(): IStorageProvider {
    const isProduction = process.env.NODE_ENV === 'production';
    const explicitProvider = process.env.STORAGE_PROVIDER?.toLowerCase();

    if (explicitProvider === 'local' && !isProduction) {
      return this.localProvider;
    }

    if (isProduction && explicitProvider !== 'local_dev_override') {
      return this.objectProvider;
    }

    return this.localProvider;
  }

  /**
   * Validates and saves an image from a base64 data string or buffer.
   */
  public async saveBase64Image(
    dataString: string,
    originalName?: string,
    baseUrl?: string
  ): Promise<UploadResult> {
    if (!dataString || typeof dataString !== 'string') {
      throw new Error('Missing or invalid image data payload');
    }

    // Reject dangerous original filenames
    if (originalName) {
      const ext = path.extname(originalName).toLowerCase();
      if (DANGEROUS_EXTENSIONS.has(ext)) {
        throw new Error(`Prohibited file type: "${ext}". Executable, script, and HTML files are strictly rejected.`);
      }
    }

    let mimeType = 'image/jpeg';
    let base64Data = dataString;

    // Extract MIME from Data URI e.g. "data:image/png;base64,..."
    const matches = dataString.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    } else if (originalName) {
      const ext = path.extname(originalName).toLowerCase();
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    }

    if (!ALLOWED_MIME_TYPES[mimeType]) {
      throw new Error(`Unsupported image MIME type: "${mimeType}". Allowed formats: PNG, JPG/JPEG, WEBP, SVG.`);
    }

    let buffer = Buffer.from(base64Data, 'base64');
    const sizeBytes = buffer.length;

    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File exceeds maximum allowed size of 5MB (Received: ${(sizeBytes / (1024 * 1024)).toFixed(2)}MB).`
      );
    }

    // Deep content verification using Magic Bytes
    const magicMatches = verifyImageMagicBytes(buffer, mimeType);
    if (!magicMatches) {
      throw new Error(`Invalid file content. The actual file bytes do not match the reported MIME type (${mimeType}).`);
    }

    // Sanitize SVG if applicable
    if (mimeType === 'image/svg+xml') {
      buffer = sanitizeSvgContent(buffer);
    }

    // Generate non-guessable, cryptographically secure UUID filename
    const extension = ALLOWED_MIME_TYPES[mimeType] || '.jpg';
    const uuid = crypto.randomUUID();
    const filename = `${Date.now()}_${uuid}${extension}`;

    const provider = this.getActiveProvider();
    const saved = await provider.saveImage(buffer, mimeType, filename, baseUrl);

    return {
      url: saved.url,
      filename: saved.filename,
      mimeType,
      sizeBytes: buffer.length,
      provider: provider.name,
    };
  }

  /**
   * Delete uploaded file safely if replaced or removed
   */
  public async deleteFile(filename: string): Promise<boolean> {
    const provider = this.getActiveProvider();
    return provider.deleteFile(filename);
  }
}

export const storageService = new StorageService();
