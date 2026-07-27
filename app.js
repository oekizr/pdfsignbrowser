const GOOGLE_CLIENT_ID = '635710334964-4n2svafi5fvnchfo9oqsb99v4hhtumt0.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

const linkPanelEl = document.getElementById('link-panel');
const editorAppEl = document.getElementById('editor-app');
const linkFormEl = document.getElementById('link-form');
const linkInputEl = document.getElementById('drive-link-input');
const linkStatusEl = document.getElementById('link-status');

let tokenClient = null;
let pendingFileId = null;

function showLinkStatus(message) {
  linkStatusEl.textContent = message;
}

function extractDriveFileId(text) {
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getTokenClient() {
  if (!tokenClient) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) {
          showLinkStatus(`Login Google gagal: ${response.error}`);
          return;
        }
        window.setExternalToken(response.access_token);
        startEditorFor(pendingFileId);
      }
    });
  }
  return tokenClient;
}

function startEditorFor(fileId) {
  linkPanelEl.style.display = 'none';
  editorAppEl.style.display = '';
  init(fileId);
}

linkFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  showLinkStatus('');

  if (typeof google === 'undefined' || !google.accounts) {
    showLinkStatus('Google Sign-In belum siap, coba lagi sebentar.');
    return;
  }

  const fileId = extractDriveFileId(linkInputEl.value.trim());
  if (!fileId) {
    showLinkStatus('Link Google Drive PDF tidak dikenali.');
    return;
  }

  pendingFileId = fileId;
  getTokenClient().requestAccessToken();
});
