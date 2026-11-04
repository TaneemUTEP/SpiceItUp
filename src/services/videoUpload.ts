import { Platform } from 'react-native';
import { supabase } from './supabase';

const uploadUrl = process.env.EXPO_PUBLIC_VIDEO_UPLOAD_URL;

export async function saveRecording(uri: string): Promise<void> {
  if (!uploadUrl) throw new Error('Video storage is not configured.');

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Sign in again before saving a recording.');

  const body = new FormData();
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) throw new Error('Could not read the recorded video.');
    const blob = await response.blob();
    const mimeType = blob.type || (uri.toLowerCase().includes('.webm') ? 'video/webm' : 'video/mp4');
    const video = new Blob([blob], { type: mimeType });
    body.append('file', video, mimeType === 'video/webm' ? 'recording.webm' : 'recording.mp4');
  } else {
    body.append('file', {
      uri,
      name: 'recording.mp4',
      type: 'video/mp4',
    } as unknown as Blob);
  }

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${data.session.access_token}` },
    body,
  });
  if (!response.ok) throw new Error('The recording could not be saved. Please try again.');
}
