import fs from "fs";

/**
 * Malware / file-scanning abstraction.
 *
 * UORA stores uploaded files privately (manuscripts, revisions, reviewer CVs)
 * and serves them only through authorized download endpoints. This module
 * defines a clean seam for introducing an external malware scanner without
 * changing the upload pipeline.
 *
 * CURRENT STATUS: No external scanning infrastructure is available in this
 * environment. A safe no-op implementation is used. DO NOT claim malware
 * scanning is active — it is NOT.
 *
 * To integrate a real scanner (e.g. ClamAV daemon, VirusTotal API, S3 Object
 * Lambda), implement `MalwareScanner.scanFile()` and swap it in
 * `createMalwareScanner()`. The upload/controller layer calls
 * `scanFileBeforeAcceptance(path)` before persisting an uploaded file.
 *
 * Design notes:
 *  - Files are scanned AFTER multer writes them to the private uploads dir,
 *    but BEFORE they are referenced by a database record.
 *  - On a detected infection, the temporary file should be removed by the
 *    caller and the upload rejected with a 400/422.
 *  - Scanning must never block the request indefinitely; enforce a timeout.
 */

export interface MalwareScanner {
  /**
   * Scan a file at the given absolute path.
   * @returns true if the file is clean, false if infected.
   * @throws if the scanner is unavailable and scanning is mandatory.
   */
  scanFile(filePath: string): Promise<boolean>;
  /** Whether scanning is enforced in this environment. */
  readonly enabled: boolean;
}

/** No-op scanner: always treats files as clean. Used when no infrastructure exists. */
class NoopScanner implements MalwareScanner {
  readonly enabled = false;

  async scanFile(_filePath: string): Promise<boolean> {
    // Nothing to do: no scanner configured. Kept intentionally empty.
    return true;
  }
}

let instance: MalwareScanner | null = null;

export function createMalwareScanner(): MalwareScanner {
  if (instance) return instance;

  // Integration point: if an external scanner is configured (e.g. via env
  // SCANNER_TYPE), instantiate and return its implementation here.
  instance = new NoopScanner();
  return instance;
}

/**
 * Convenience wrapper used by controllers. Rejects file bytes that are not a
 * scan target or are not present. If a real scanner is configured and a file
 * is detected as malicious, this throws so the caller can clean up.
 */
export async function scanFileBeforeAcceptance(
  filePath: string
): Promise<void> {
  const scanner = createMalwareScanner();

  // If no scanner is configured, there is nothing to enforce.
  if (!scanner.enabled) return;

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("File to scan does not exist");
  }

  const clean = await scanner.scanFile(filePath);
  if (!clean) {
    throw new Error("File failed malware scan");
  }
}
