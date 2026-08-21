export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUrlString = (
  url: string | undefined | null,
  type: 'github' | 'linkedin' | 'resume' | 'project' | 'any' = 'any'
): UrlValidationResult => {
  if (!url || typeof url !== 'string') {
    return { isValid: true };
  }

  const trimmed = url.trim();
  if (trimmed === '') {
    return { isValid: true };
  }

  let parsed: URL;
  try {
    let testUrl = trimmed;
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = 'https://' + testUrl;
    }
    parsed = new URL(testUrl);
    const parts = parsed.hostname.toLowerCase().split('.');
    if (parts.length < 2 || parts[parts.length - 1].length < 2) {
      throw new Error('Invalid domain suffix');
    }
  } catch {
    if (type === 'github') {
      return { isValid: false, error: 'Please enter a valid GitHub URL, for example https://github.com/username' };
    }
    if (type === 'linkedin') {
      return { isValid: false, error: 'Please enter a valid LinkedIn URL, for example https://www.linkedin.com/in/username' };
    }
    if (type === 'resume') {
      return { isValid: false, error: 'Please enter a valid Resume URL, for example https://example.com/resume.pdf' };
    }
    if (type === 'project') {
      return { isValid: false, error: 'Please enter a valid Project URL, for example https://github.com/user/project' };
    }
    return { isValid: false, error: 'Please enter a valid URL (e.g., https://example.com)' };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (type === 'github' && !hostname.includes('github.')) {
    return { isValid: false, error: 'Please enter a valid GitHub URL, for example https://github.com/username' };
  }

  if (type === 'linkedin' && !hostname.includes('linkedin.')) {
    return { isValid: false, error: 'Please enter a valid LinkedIn URL, for example https://www.linkedin.com/in/username' };
  }

  return { isValid: true };
};
