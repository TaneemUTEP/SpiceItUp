import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator, useWindowDimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Camera, CameraType, VideoQuality } from 'expo-camera';
import { ResizeMode, Video } from 'expo-av';
import { RootStackParamList } from '../navigation/types';
import { saveRecording } from '../services/videoUpload';

type Props = StackScreenProps<RootStackParamList, 'ActionCam'>;

const prompts = [
  'Dance for 20 seconds like nobody is watching.',
  'Slow spin and strike a pose at the end.',
  'Act out a movie kiss in dramatic slow-mo.',
  'Lip-sync a chorus to your favorite song.',
  'Do a playful runway walk toward the lens.',
  'Share a secret into the camera, softly.',
  'Try a balance pose and hold for 10 seconds.',
  'Give a 10-second massage demo on a pillow.',
  'Improvise a 15-second roleplay scene.',
  'Trace a heart shape toward the camera.',
  'Do your best “blue steel” stare for 5s.',
  'Blow a kiss, then wink at the lens.',
  'Create a dramatic shadow silhouette move.',
  'Try a yoga stretch with a slow exhale.',
  'Alternate slow/fast dance for 15 seconds.',
  'Mime walking on the moon for 10 seconds.',
];

const pickPrompt = (prev?: string) => {
  const pool = prompts.filter(item => item !== prev);
  return pool[Math.floor(Math.random() * pool.length)];
};

const ActionCamScreen: React.FC<Props> = ({ navigation }) => {
  const [prompt, setPrompt] = useState(() => pickPrompt());
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [type, setType] = useState<CameraType>(CameraType.front);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const cameraRef = useRef<Camera | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const cameraWidth = Math.min(windowWidth * 0.92, 520);

  const permissionLabel = useMemo(() => {
    if (!permission) return 'Request camera access';
    if (permission.granted) return 'Camera ready';
    if (permission.canAskAgain) return 'Enable camera';
    return 'Permission required';
  }, [permission]);

  const handlePrompt = () => setPrompt(current => pickPrompt(current));

  const askPermission = async (): Promise<boolean> => {
    const res = await requestPermission();
    if (!res.granted) {
      Alert.alert('Camera blocked', 'Please allow camera access in your system settings to record.');
    }
    return res.granted;
  };

  const toggleCamera = () => {
    setType(current => (current === CameraType.front ? CameraType.back : CameraType.front));
  };

  const toggleRecord = async () => {
    const granted = permission?.granted || (await askPermission());
    if (!granted) return;

    if (isRecording) {
      cameraRef.current?.stopRecording();
      return;
    }

    if (!cameraRef.current) {
      Alert.alert('Camera not ready', 'Wait for the preview to load before recording.');
      return;
    }

    setIsRecording(true);
    setRecordedUri(null);
    setUploadError('');

    let result: { uri?: string } | undefined;
    try {
      result = await cameraRef.current.recordAsync({
        maxDuration: 60,
        quality: VideoQuality['720p'],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      Alert.alert('Recording failed', message);
    } finally {
      setIsRecording(false);
    }

    if (!result?.uri) return;
    setRecordedUri(result.uri);
    try {
      await saveRecording(result.uri);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'The recording could not be saved. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>Live Action</Text>
      <Text style={styles.title}>Action Cam</Text>
      <Text style={styles.subtitle}>Generate a prompt, roll the camera, and capture the moment right inside the app.</Text>

      <View style={styles.promptCard}>
        <Text style={styles.promptLabel}>Suggested action</Text>
        <Text style={styles.promptText}>{prompt}</Text>
        <View style={styles.promptRow}>
          <Pressable style={styles.buttonGhost} onPress={handlePrompt} hitSlop={8}>
            <Text style={styles.buttonGhostText}>New prompt</Text>
          </Pressable>
          <Pressable style={styles.buttonGhost} onPress={() => navigation.navigate('Home')} hitSlop={8}>
            <Text style={styles.buttonGhostText}>Home</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.cameraShell, { width: cameraWidth }]}>
        {!permission?.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>Camera access</Text>
            <Text style={styles.permissionCopy}>Turn on the camera to start recording your prompt.</Text>
            <Pressable style={styles.primaryButton} onPress={askPermission}>
              <Text style={styles.primaryButtonText}>{permissionLabel}</Text>
            </Pressable>
          </View>
        ) : (
          <Camera
            ref={node => (cameraRef.current = node)}
            style={[
              styles.camera,
              {
                width: '100%',
                aspectRatio: 16 / 9,
                maxHeight: Math.max(240, cameraWidth * 9 / 16),
              },
            ]}
            type={type}
            ratio="16:9"
          />
        )}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.secondaryButton} onPress={toggleCamera}>
          <Text style={styles.secondaryButtonText}>Flip</Text>
        </Pressable>
        <Pressable style={[styles.recordButton, isRecording && styles.recording]} onPress={toggleRecord} hitSlop={10}>
          {isRecording ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.recordButtonText}>Stop</Text>
            </>
          ) : (
            <Text style={styles.recordButtonText}>Record</Text>
          )}
        </Pressable>
      </View>

      {uploadError ? <Text style={styles.uploadError}>{uploadError}</Text> : null}

      {recordedUri ? (
        <View style={[styles.previewCard, { width: cameraWidth }]}>
          <Text style={styles.previewTitle}>Last take</Text>
          <Video
            source={{ uri: recordedUri }}
            style={styles.previewVideo}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping
          />
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1f0405' },
  container: { padding: 18, flexGrow: 1, alignItems: 'center', gap: 16, paddingBottom: 60 },
  kicker: {
    color: '#ff9c6b',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  title: { color: '#fff6f0', fontSize: 30, fontWeight: '800', alignSelf: 'flex-start' },
  subtitle: { color: '#ffcdb6', fontSize: 15, lineHeight: 20, alignSelf: 'flex-start' },
  promptCard: {
    width: '100%',
    backgroundColor: '#451015',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8c3732',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  promptLabel: { color: '#f2b8aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  promptText: { color: '#fff4ec', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  promptRow: { flexDirection: 'row', gap: 10 },
  buttonGhost: {
    backgroundColor: '#5c1418',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#a43f2f',
  },
  buttonGhostText: { color: '#fff3ec', fontWeight: '700' },
  cameraShell: {
    width: '100%',
    backgroundColor: '#2d0608',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#7d1f23',
    minHeight: 260,
    justifyContent: 'center',
  },
  permissionBox: { alignItems: 'center', gap: 10 },
  permissionTitle: { color: '#fff6f0', fontSize: 18, fontWeight: '800' },
  permissionCopy: { color: '#ffcdb6', fontSize: 14, textAlign: 'center', paddingHorizontal: 12 },
  camera: { borderRadius: 14, overflow: 'hidden' },
  controls: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center', alignItems: 'center' },
  secondaryButton: {
    backgroundColor: '#5c1418',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#a43f2f',
  },
  secondaryButtonText: { color: '#fff3ec', fontWeight: '700' },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#c1271f',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ffb16f',
  },
  recording: { backgroundColor: '#d93b32' },
  recordButtonText: { color: '#fff9f5', fontWeight: '800', fontSize: 15 },
  uploadError: { width: '100%', maxWidth: 520, color: '#ffb8b0', fontWeight: '700' },
  primaryButton: {
    backgroundColor: '#f05a28',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ffd0aa',
  },
  primaryButtonText: { color: '#fffdfb', fontWeight: '800' },
  previewCard: {
    width: '100%',
    backgroundColor: '#5c1418',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#a43f2f',
    gap: 8,
  },
  previewTitle: { color: '#fff3ec', fontSize: 16, fontWeight: '800' },
  previewVideo: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: '#000', overflow: 'hidden' },
});

export default ActionCamScreen;
