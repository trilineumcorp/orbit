import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  getVideos, createVideo, updateVideo, deleteVideo, Video,
  getFlipBooks, createFlipBook, updateFlipBook, deleteFlipBook, FlipBook,
  getExams, createExam, updateExam, deleteExam, Exam, ExamQuestion
} from '@/services/content';
import { Image } from 'expo-image';
import { extractYouTubeId, getYouTubeThumbnail } from '@/utils/youtube';
import { VideoSkeleton } from '@/components/skeleton';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const STANDARDS = [6, 7, 8, 9, 10];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
const EXAM_TYPES = ['IIT', 'NEET'];

// IIT Exam Pattern Template
const IIT_EXAM_PATTERN = {
  duration: 180, // 3 hours
  totalQuestions: 90,
  subjects: {
    'Mathematics': { questions: 30, marks: 120 },
    'Physics': { questions: 30, marks: 120 },
    'Chemistry': { questions: 30, marks: 120 },
  },
  markingScheme: {
    correct: 4,
    incorrect: -1,
    unanswered: 0,
  },
  passingMarks: 120, // 10% of total
};

// NEET Exam Pattern Template
const NEET_EXAM_PATTERN = {
  duration: 200, // 3 hours 20 minutes
  totalQuestions: 180,
  subjects: {
    'Physics': { questions: 45, marks: 180 },
    'Chemistry': { questions: 45, marks: 180 },
    'Biology': { questions: 90, marks: 360 }, // 45 Botany + 45 Zoology
  },
  markingScheme: {
    correct: 4,
    incorrect: -1,
    unanswered: 0,
  },
  passingMarks: 720, // 50% of total
};

type NavigationState = {
  level: 'standards' | 'subjects' | 'content';
  selectedStandard?: number;
  selectedSubject?: string;
  selectedContentType?: 'videos' | 'flipbooks' | 'exams';
};

export default function AdminContentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'standards' });
  const [videos, setVideos] = useState<Video[]>([]);
  const [flipbooks, setFlipbooks] = useState<FlipBook[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Video | FlipBook | Exam | null>(null);
  const [formType, setFormType] = useState<'video' | 'flipbook' | 'exam'>('video');
  
  // Form states
  const [videoForm, setVideoForm] = useState({
    title: '',
    youtubeUrl: '',
    description: '',
    standard: navigation.selectedStandard || 6,
    subject: navigation.selectedSubject || 'Mathematics',
  });
  
  const [flipbookForm, setFlipbookForm] = useState({
    title: '',
    pdfUrl: '',
    description: '',
    standard: navigation.selectedStandard || 6,
    subject: navigation.selectedSubject || 'Mathematics',
  });
  
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    duration: 60,
    examType: 'IIT' as 'IIT' | 'NEET',
    standard: navigation.selectedStandard || 6,
    subject: navigation.selectedSubject || 'Mathematics',
    passingMarks: 0,
    questions: [] as ExamQuestion[],
  });

  useEffect(() => {
    if (navigation.level === 'content' && navigation.selectedStandard && navigation.selectedSubject && navigation.selectedContentType) {
      loadContent();
    }
  }, [navigation]);

  const loadContent = async () => {
    if (!navigation.selectedStandard || !navigation.selectedSubject || !navigation.selectedContentType) return;
    
    setLoading(true);
    try {
      if (navigation.selectedContentType === 'videos') {
        const data = await getVideos(navigation.selectedStandard, navigation.selectedSubject);
        setVideos(data);
      } else if (navigation.selectedContentType === 'flipbooks') {
        const data = await getFlipBooks(navigation.selectedStandard, navigation.selectedSubject);
        setFlipbooks(data);
      } else if (navigation.selectedContentType === 'exams') {
        const data = await getExams(navigation.selectedStandard, navigation.selectedSubject);
        setExams(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSelect = (standard: number) => {
    setNavigation({ level: 'subjects', selectedStandard: standard });
  };

  const handleSubjectSelect = (subject: string) => {
    setNavigation({ 
      level: 'content', 
      selectedStandard: navigation.selectedStandard, 
      selectedSubject: subject 
    });
  };

  const handleContentTypeSelect = (contentType: 'videos' | 'flipbooks' | 'exams') => {
    setNavigation({ 
      ...navigation, 
      selectedContentType: contentType 
    });
  };

  const handleBack = () => {
    if (navigation.level === 'content' && !navigation.selectedContentType) {
      setNavigation({ level: 'subjects', selectedStandard: navigation.selectedStandard });
    } else if (navigation.level === 'subjects') {
      setNavigation({ level: 'standards' });
    } else if (navigation.level === 'content' && navigation.selectedContentType) {
      setNavigation({ ...navigation, selectedContentType: undefined });
    }
  };

  const handleAdd = (type: 'video' | 'flipbook' | 'exam') => {
    setFormType(type);
    setEditingItem(null);
    if (type === 'video') {
      setVideoForm({
        title: '',
        youtubeUrl: '',
        description: '',
        standard: navigation.selectedStandard || 6,
        subject: navigation.selectedSubject || 'Mathematics',
      });
    } else if (type === 'flipbook') {
      setFlipbookForm({
        title: '',
        pdfUrl: '',
        description: '',
        standard: navigation.selectedStandard || 6,
        subject: navigation.selectedSubject || 'Mathematics',
      });
    } else {
      const pattern = examForm.examType === 'IIT' ? IIT_EXAM_PATTERN : NEET_EXAM_PATTERN;
      setExamForm({
        title: '',
        description: '',
        duration: pattern.duration,
        examType: 'IIT',
        standard: navigation.selectedStandard || 6,
        subject: navigation.selectedSubject || 'Mathematics',
        passingMarks: pattern.passingMarks,
        questions: [],
      });
    }
    setShowAddForm(true);
  };

  const handleSaveVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.youtubeUrl.trim()) {
      Alert.alert('Error', 'Please fill in title and YouTube URL');
      return;
    }

    const videoId = extractYouTubeId(videoForm.youtubeUrl);
    if (!videoId) {
      Alert.alert('Error', 'Invalid YouTube URL');
      return;
    }

    try {
      if (editingItem && '_id' in editingItem) {
        await updateVideo((editingItem as Video)._id || (editingItem as Video).id || '', videoForm);
        Alert.alert('Success', 'Video updated successfully');
      } else {
        await createVideo(videoForm);
        Alert.alert('Success', 'Video created successfully');
      }
      setShowAddForm(false);
      setEditingItem(null);
      loadContent();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save video');
    }
  };

  const handleSaveFlipbook = async () => {
    if (!flipbookForm.title.trim() || !flipbookForm.pdfUrl.trim()) {
      Alert.alert('Error', 'Please fill in title and PDF URL');
      return;
    }

    if (!flipbookForm.pdfUrl.toLowerCase().endsWith('.pdf')) {
      Alert.alert('Error', 'Please provide a valid PDF URL');
      return;
    }

    try {
      if (editingItem && '_id' in editingItem) {
        await updateFlipBook((editingItem as FlipBook)._id || (editingItem as FlipBook).id || '', flipbookForm);
        Alert.alert('Success', 'Flipbook updated successfully');
      } else {
        await createFlipBook(flipbookForm);
        Alert.alert('Success', 'Flipbook created successfully');
      }
      setShowAddForm(false);
      setEditingItem(null);
      loadContent();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save flipbook');
    }
  };

  const handleSaveExam = async () => {
    if (!examForm.title.trim()) {
      Alert.alert('Error', 'Please fill in exam title');
      return;
    }

    if (examForm.questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question');
      return;
    }

    try {
      const examData = {
        ...examForm,
        totalMarks: examForm.questions.reduce((sum, q) => sum + q.marks, 0),
      };

      if (editingItem && '_id' in editingItem) {
        await updateExam((editingItem as Exam)._id || (editingItem as Exam).id || '', examData);
        Alert.alert('Success', 'Exam updated successfully');
      } else {
        await createExam(examData);
        Alert.alert('Success', 'Exam created successfully');
      }
      setShowAddForm(false);
      setEditingItem(null);
      loadContent();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save exam');
    }
  };

  const handleDelete = async (item: Video | FlipBook | Exam, type: 'video' | 'flipbook' | 'exam') => {
    Alert.alert(
      `Delete ${type === 'video' ? 'Video' : type === 'flipbook' ? 'Flipbook' : 'Exam'}`,
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'video') {
                await deleteVideo((item as Video)._id || (item as Video).id || '');
              } else if (type === 'flipbook') {
                await deleteFlipBook((item as FlipBook)._id || (item as FlipBook).id || '');
              } else {
                await deleteExam((item as Exam)._id || (item as Exam).id || '');
              }
              Alert.alert('Success', `${type === 'video' ? 'Video' : type === 'flipbook' ? 'Flipbook' : 'Exam'} deleted successfully`);
              loadContent();
            } catch (error: any) {
              Alert.alert('Error', error.message || `Failed to delete ${type}`);
            }
          },
        },
      ]
    );
  };

  const applyExamPattern = (examType: 'IIT' | 'NEET') => {
    const pattern = examType === 'IIT' ? IIT_EXAM_PATTERN : NEET_EXAM_PATTERN;
    const subjectInfo = pattern.subjects[examForm.subject as keyof typeof pattern.subjects];
    
    if (!subjectInfo) {
      Alert.alert('Error', `${examForm.subject} is not available for ${examType} exam pattern`);
      return;
    }

    setExamForm({
      ...examForm,
      examType,
      duration: pattern.duration,
      passingMarks: pattern.passingMarks,
      questions: Array.from({ length: subjectInfo.questions }, (_, i) => ({
        question: `Question ${i + 1}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        marks: pattern.markingScheme.correct,
      })),
    });
  };

  const addQuestion = () => {
    setExamForm({
      ...examForm,
      questions: [
        ...examForm.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: examForm.examType === 'IIT' ? IIT_EXAM_PATTERN.markingScheme.correct : NEET_EXAM_PATTERN.markingScheme.correct,
        },
      ],
    });
  };

  const updateQuestion = (index: number, field: keyof ExamQuestion, value: any) => {
    const newQuestions = [...examForm.questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setExamForm({ ...examForm, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    setExamForm({
      ...examForm,
      questions: examForm.questions.filter((_, i) => i !== index),
    });
  };

  const renderStandards = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <ThemedText style={styles.sectionTitle}>Select Standard</ThemedText>
      <View style={styles.grid}>
        {STANDARDS.map((standard) => (
          <TouchableOpacity
            key={standard}
            style={[styles.folderCard, isDark && styles.folderCardDark]}
            onPress={() => handleStandardSelect(standard)}>
            <View style={[styles.folderIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
              <IconSymbol name="folder.fill" size={32} color={ThemeColors.orange} />
            </View>
            <ThemedText style={styles.folderText}>{standard}th Standard</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderSubjects = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.breadcrumb}>
        <ThemedText style={styles.breadcrumbText}>
          {navigation.selectedStandard}th Standard
        </ThemedText>
      </View>
      <ThemedText style={styles.sectionTitle}>Select Subject</ThemedText>
      <View style={styles.grid}>
        {SUBJECTS.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[styles.folderCard, isDark && styles.folderCardDark]}
            onPress={() => handleSubjectSelect(subject)}>
            <View style={[styles.folderIcon, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
              <IconSymbol name="book.fill" size={32} color={ThemeColors.deepBlue} />
            </View>
            <ThemedText style={styles.folderText}>{subject}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderContentTypeSelection = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.breadcrumb}>
        <ThemedText style={styles.breadcrumbText}>
          {navigation.selectedStandard}th Standard / {navigation.selectedSubject}
        </ThemedText>
      </View>
      <ThemedText style={styles.sectionTitle}>Select Content Type</ThemedText>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.folderCard, isDark && styles.folderCardDark]}
          onPress={() => handleContentTypeSelect('videos')}>
          <View style={[styles.folderIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
            <IconSymbol name="play.rectangle.fill" size={32} color={ThemeColors.orange} />
          </View>
          <ThemedText style={styles.folderText}>Videos</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.folderCard, isDark && styles.folderCardDark]}
          onPress={() => handleContentTypeSelect('flipbooks')}>
          <View style={[styles.folderIcon, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
            <IconSymbol name="book.pages.fill" size={32} color={ThemeColors.deepBlue} />
          </View>
          <ThemedText style={styles.folderText}>Flipbooks</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.folderCard, isDark && styles.folderCardDark]}
          onPress={() => handleContentTypeSelect('exams')}>
          <View style={[styles.folderIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
            <IconSymbol name="doc.text.fill" size={32} color={ThemeColors.orange} />
          </View>
          <ThemedText style={styles.folderText}>Exams</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderVideos = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.breadcrumb}>
        <ThemedText style={styles.breadcrumbText}>
          {navigation.selectedStandard}th / {navigation.selectedSubject} / Videos
        </ThemedText>
      </View>
      {loading ? (
        <VideoSkeleton count={6} />
      ) : videos.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="play.rectangle.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.emptyText}>No videos yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Add your first video to get started</ThemedText>
        </View>
      ) : (
        videos.map((video) => (
          <View key={video._id || video.id} style={[styles.itemCard, isDark && styles.itemCardDark]}>
            <Image
              source={{ uri: getYouTubeThumbnail(video.youtubeUrl) }}
              style={styles.thumbnail}
              contentFit="cover"
            />
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {video.title}
              </ThemedText>
              {video.description && (
                <ThemedText style={styles.itemDescription} numberOfLines={2}>
                  {video.description}
                </ThemedText>
              )}
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingItem(video);
                    setVideoForm({
                      title: video.title,
                      youtubeUrl: video.youtubeUrl,
                      description: video.description || '',
                      standard: video.standard || navigation.selectedStandard || 6,
                      subject: video.subject || navigation.selectedSubject || 'Mathematics',
                    });
                    setFormType('video');
                    setShowAddForm(true);
                  }}>
                  <IconSymbol name="pencil" size={18} color={ThemeColors.deepBlue} />
                  <ThemedText style={styles.actionText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(video, 'video')}>
                  <IconSymbol name="trash.fill" size={18} color={ThemeColors.orange} />
                  <ThemedText style={[styles.actionText, styles.deleteText]}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderFlipbooks = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.breadcrumb}>
        <ThemedText style={styles.breadcrumbText}>
          {navigation.selectedStandard}th / {navigation.selectedSubject} / Flipbooks
        </ThemedText>
      </View>
      {loading ? (
        <VideoSkeleton count={6} />
      ) : flipbooks.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="book.pages.fill" size={64} color={ThemeColors.deepBlue} />
          <ThemedText style={styles.emptyText}>No flipbooks yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Add your first flipbook to get started</ThemedText>
        </View>
      ) : (
        flipbooks.map((flipbook) => (
          <View key={flipbook._id || flipbook.id} style={[styles.itemCard, isDark && styles.itemCardDark]}>
            <View style={[styles.pdfIcon, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
              <IconSymbol name="doc.fill" size={40} color={ThemeColors.deepBlue} />
            </View>
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {flipbook.title}
              </ThemedText>
              {flipbook.description && (
                <ThemedText style={styles.itemDescription} numberOfLines={2}>
                  {flipbook.description}
                </ThemedText>
              )}
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingItem(flipbook);
                    setFlipbookForm({
                      title: flipbook.title,
                      pdfUrl: flipbook.pdfUrl,
                      description: flipbook.description || '',
                      standard: flipbook.standard || navigation.selectedStandard || 6,
                      subject: flipbook.subject || navigation.selectedSubject || 'Mathematics',
                    });
                    setFormType('flipbook');
                    setShowAddForm(true);
                  }}>
                  <IconSymbol name="pencil" size={18} color={ThemeColors.deepBlue} />
                  <ThemedText style={styles.actionText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(flipbook, 'flipbook')}>
                  <IconSymbol name="trash.fill" size={18} color={ThemeColors.orange} />
                  <ThemedText style={[styles.actionText, styles.deleteText]}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderExams = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.breadcrumb}>
        <ThemedText style={styles.breadcrumbText}>
          {navigation.selectedStandard}th / {navigation.selectedSubject} / Exams
        </ThemedText>
      </View>
      {loading ? (
        <VideoSkeleton count={6} />
      ) : exams.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="doc.text.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.emptyText}>No exams yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Add your first exam to get started</ThemedText>
        </View>
      ) : (
        exams.map((exam) => (
          <View key={exam._id || exam.id} style={[styles.itemCard, isDark && styles.itemCardDark]}>
            <View style={[styles.examIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
              <IconSymbol name="doc.text.fill" size={40} color={ThemeColors.orange} />
            </View>
            <View style={styles.itemInfo}>
              <ThemedText style={styles.itemTitle} numberOfLines={2}>
                {exam.title}
              </ThemedText>
              {exam.description && (
                <ThemedText style={styles.itemDescription} numberOfLines={2}>
                  {exam.description}
                </ThemedText>
              )}
              <View style={styles.examMeta}>
                <ThemedText style={styles.examMetaText}>
                  {exam.examType} • {exam.duration} min • {exam.questions?.length || 0} questions
                </ThemedText>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingItem(exam);
                    setExamForm({
                      title: exam.title,
                      description: exam.description || '',
                      duration: exam.duration,
                      examType: (exam.examType as 'IIT' | 'NEET') || 'IIT',
                      standard: exam.standard || navigation.selectedStandard || 6,
                      subject: exam.subject || navigation.selectedSubject || 'Mathematics',
                      passingMarks: exam.passingMarks || 0,
                      questions: exam.questions || [],
                    });
                    setFormType('exam');
                    setShowAddForm(true);
                  }}>
                  <IconSymbol name="pencil" size={18} color={ThemeColors.deepBlue} />
                  <ThemedText style={styles.actionText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(exam, 'exam')}>
                  <IconSymbol name="trash.fill" size={18} color={ThemeColors.orange} />
                  <ThemedText style={[styles.actionText, styles.deleteText]}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderForm = () => {
    if (formType === 'video') {
      return (
        <ScrollView style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Title *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={videoForm.title}
              onChangeText={(text) => setVideoForm({ ...videoForm, title: text })}
              placeholder="Enter video title"
              placeholderTextColor={isDark ? '#999' : '#999'}
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>YouTube URL *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={videoForm.youtubeUrl}
              onChangeText={(text) => setVideoForm({ ...videoForm, youtubeUrl: text })}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor={isDark ? '#999' : '#999'}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              value={videoForm.description}
              onChangeText={(text) => setVideoForm({ ...videoForm, description: text })}
              placeholder="Enter video description"
              placeholderTextColor={isDark ? '#999' : '#999'}
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Standard *</ThemedText>
            <View style={styles.row}>
              {STANDARDS.map((std) => (
                <TouchableOpacity
                  key={std}
                  style={[
                    styles.optionButton,
                    videoForm.standard === std && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => setVideoForm({ ...videoForm, standard: std })}>
                  <ThemedText style={[styles.optionText, videoForm.standard === std && styles.optionTextActive]}>
                    {std}th
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Subject *</ThemedText>
            <View style={styles.row}>
              {SUBJECTS.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.optionButton,
                    videoForm.subject === subj && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => setVideoForm({ ...videoForm, subject: subj })}>
                  <ThemedText style={[styles.optionText, videoForm.subject === subj && styles.optionTextActive]}>
                    {subj}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveVideo}>
            <ThemedText style={styles.saveButtonText}>
              {editingItem ? 'Update Video' : 'Add Video'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      );
    } else if (formType === 'flipbook') {
      return (
        <ScrollView style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Title *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={flipbookForm.title}
              onChangeText={(text) => setFlipbookForm({ ...flipbookForm, title: text })}
              placeholder="Enter flipbook title"
              placeholderTextColor={isDark ? '#999' : '#999'}
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>PDF URL *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={flipbookForm.pdfUrl}
              onChangeText={(text) => setFlipbookForm({ ...flipbookForm, pdfUrl: text })}
              placeholder="https://example.com/file.pdf"
              placeholderTextColor={isDark ? '#999' : '#999'}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              value={flipbookForm.description}
              onChangeText={(text) => setFlipbookForm({ ...flipbookForm, description: text })}
              placeholder="Enter flipbook description"
              placeholderTextColor={isDark ? '#999' : '#999'}
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Standard *</ThemedText>
            <View style={styles.row}>
              {STANDARDS.map((std) => (
                <TouchableOpacity
                  key={std}
                  style={[
                    styles.optionButton,
                    flipbookForm.standard === std && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => setFlipbookForm({ ...flipbookForm, standard: std })}>
                  <ThemedText style={[styles.optionText, flipbookForm.standard === std && styles.optionTextActive]}>
                    {std}th
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Subject *</ThemedText>
            <View style={styles.row}>
              {SUBJECTS.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.optionButton,
                    flipbookForm.subject === subj && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => setFlipbookForm({ ...flipbookForm, subject: subj })}>
                  <ThemedText style={[styles.optionText, flipbookForm.subject === subj && styles.optionTextActive]}>
                    {subj}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveFlipbook}>
            <ThemedText style={styles.saveButtonText}>
              {editingItem ? 'Update Flipbook' : 'Add Flipbook'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Title *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={examForm.title}
              onChangeText={(text) => setExamForm({ ...examForm, title: text })}
              placeholder="Enter exam title"
              placeholderTextColor={isDark ? '#999' : '#999'}
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              value={examForm.description}
              onChangeText={(text) => setExamForm({ ...examForm, description: text })}
              placeholder="Enter exam description"
              placeholderTextColor={isDark ? '#999' : '#999'}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Exam Type *</ThemedText>
            <View style={styles.row}>
              {EXAM_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    examForm.examType === type && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => applyExamPattern(type as 'IIT' | 'NEET')}>
                  <ThemedText style={[styles.optionText, examForm.examType === type && styles.optionTextActive]}>
                    {type}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Standard *</ThemedText>
            <View style={styles.row}>
              {STANDARDS.map((std) => (
                <TouchableOpacity
                  key={std}
                  style={[
                    styles.optionButton,
                    examForm.standard === std && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => setExamForm({ ...examForm, standard: std })}>
                  <ThemedText style={[styles.optionText, examForm.standard === std && styles.optionTextActive]}>
                    {std}th
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Subject *</ThemedText>
            <View style={styles.row}>
              {SUBJECTS.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.optionButton,
                    examForm.subject === subj && styles.optionButtonActive,
                    isDark && styles.optionButtonDark,
                  ]}
                  onPress={() => setExamForm({ ...examForm, subject: subj })}>
                  <ThemedText style={[styles.optionText, examForm.subject === subj && styles.optionTextActive]}>
                    {subj}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Duration (minutes) *</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={examForm.duration.toString()}
              onChangeText={(text) => setExamForm({ ...examForm, duration: parseInt(text) || 60 })}
              placeholder="60"
              placeholderTextColor={isDark ? '#999' : '#999'}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Passing Marks</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={examForm.passingMarks.toString()}
              onChangeText={(text) => setExamForm({ ...examForm, passingMarks: parseInt(text) || 0 })}
              placeholder="0"
              placeholderTextColor={isDark ? '#999' : '#999'}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <View style={styles.questionHeader}>
              <ThemedText style={styles.label}>Questions ({examForm.questions.length})</ThemedText>
              <TouchableOpacity style={styles.addQuestionButton} onPress={addQuestion}>
                <IconSymbol name="plus.circle.fill" size={24} color={ThemeColors.orange} />
                <ThemedText style={styles.addQuestionText}>Add Question</ThemedText>
              </TouchableOpacity>
            </View>
            {examForm.questions.map((question, index) => (
              <View key={index} style={[styles.questionCard, isDark && styles.questionCardDark]}>
                <View style={styles.questionHeader}>
                  <ThemedText style={styles.questionNumber}>Q{index + 1}</ThemedText>
                  <TouchableOpacity onPress={() => removeQuestion(index)}>
                    <IconSymbol name="trash.fill" size={20} color={ThemeColors.orange} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, isDark && styles.inputDark]}
                  value={question.question}
                  onChangeText={(text) => updateQuestion(index, 'question', text)}
                  placeholder="Enter question"
                  placeholderTextColor={isDark ? '#999' : '#999'}
                  multiline
                />
                {question.options.map((option, optIndex) => (
                  <TextInput
                    key={optIndex}
                    style={[styles.input, styles.optionInput, isDark && styles.inputDark]}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...question.options];
                      newOptions[optIndex] = text;
                      updateQuestion(index, 'options', newOptions);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                    placeholderTextColor={isDark ? '#999' : '#999'}
                  />
                ))}
                <View style={styles.questionFooter}>
                  <View>
                    <ThemedText style={styles.smallLabel}>Correct Answer</ThemedText>
                    <View style={styles.row}>
                      {question.options.map((_, optIndex) => (
                        <TouchableOpacity
                          key={optIndex}
                          style={[
                            styles.optionButton,
                            question.correctAnswer === optIndex && styles.optionButtonActive,
                            isDark && styles.optionButtonDark,
                          ]}
                          onPress={() => updateQuestion(index, 'correctAnswer', optIndex)}>
                          <ThemedText style={[styles.optionText, question.correctAnswer === optIndex && styles.optionTextActive]}>
                            {String.fromCharCode(65 + optIndex)}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View>
                    <ThemedText style={styles.smallLabel}>Marks</ThemedText>
                    <TextInput
                      style={[styles.input, styles.marksInput, isDark && styles.inputDark]}
                      value={question.marks.toString()}
                      onChangeText={(text) => updateQuestion(index, 'marks', parseInt(text) || 1)}
                      placeholder="1"
                      placeholderTextColor={isDark ? '#999' : '#999'}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveExam}>
            <ThemedText style={styles.saveButtonText}>
              {editingItem ? 'Update Exam' : 'Create Exam'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          {navigation.level === 'standards' ? (
            <TouchableOpacity
              onPress={() => router.push('/(admin)/')}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <IconSymbol name="chevron.left" size={24} color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <IconSymbol name="chevron.left" size={24} color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue} />
            </TouchableOpacity>
          )}
          <ThemedText style={styles.headerTitle}>Manage Content</ThemedText>
          {navigation.level === 'content' && navigation.selectedContentType && (
            <TouchableOpacity
              onPress={() => handleAdd(navigation.selectedContentType === 'videos' ? 'video' : navigation.selectedContentType === 'flipbooks' ? 'flipbook' : 'exam')}
              style={styles.addButton}
              activeOpacity={0.7}>
              <IconSymbol name="plus.circle.fill" size={24} color={ThemeColors.orange} />
            </TouchableOpacity>
          )}
          {navigation.level === 'standards' && (
            <View style={styles.addButton} />
          )}
          {navigation.level === 'subjects' && (
            <View style={styles.addButton} />
          )}
          {navigation.level === 'content' && !navigation.selectedContentType && (
            <View style={styles.addButton} />
          )}
        </View>

        {/* Content */}
        {navigation.level === 'standards' && renderStandards()}
        {navigation.level === 'subjects' && renderSubjects()}
        {navigation.level === 'content' && !navigation.selectedContentType && renderContentTypeSelection()}
        {navigation.level === 'content' && navigation.selectedContentType === 'videos' && renderVideos()}
        {navigation.level === 'content' && navigation.selectedContentType === 'flipbooks' && renderFlipbooks()}
        {navigation.level === 'content' && navigation.selectedContentType === 'exams' && renderExams()}

        {/* Add/Edit Form Modal */}
        <Modal
          visible={showAddForm}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddForm(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modal, isDark && styles.modalDark]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {editingItem ? `Edit ${formType === 'video' ? 'Video' : formType === 'flipbook' ? 'Flipbook' : 'Exam'}` : `Add New ${formType === 'video' ? 'Video' : formType === 'flipbook' ? 'Flipbook' : 'Exam'}`}
                </ThemedText>
                <TouchableOpacity onPress={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={ThemeColors.orange} />
                </TouchableOpacity>
              </View>
              {renderForm()}
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? (isTablet ? 20 : 16) : (isTablet ? 16 : 12),
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerDark: {
    backgroundColor: '#1A3D4D',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  breadcrumb: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  breadcrumbText: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  folderCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  folderCardDark: {
    backgroundColor: '#2A4D5D',
  },
  folderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  folderText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemCardDark: {
    backgroundColor: '#2A4D5D',
  },
  thumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  pdfIcon: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examIcon: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  examMeta: {
    marginBottom: 8,
  },
  examMetaText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteText: {
    color: ThemeColors.orange,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalDark: {
    backgroundColor: '#1A3D4D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    maxHeight: 600,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputDark: {
    backgroundColor: '#2A4D5D',
    borderColor: '#3A5D6D',
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  optionButtonDark: {
    backgroundColor: '#2A4D5D',
    borderColor: '#3A5D6D',
  },
  optionButtonActive: {
    backgroundColor: ThemeColors.orange,
    borderColor: ThemeColors.orange,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: ThemeColors.orange,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: ThemeColors.orange,
  },
  questionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questionCardDark: {
    backgroundColor: '#2A4D5D',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  optionInput: {
    marginTop: 8,
  },
  marksInput: {
    width: 80,
  },
});
