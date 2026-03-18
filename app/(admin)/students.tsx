import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { getUsers, updateStudentByAdmin } from '@/services/auth';
import { User } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ListSkeleton } from '@/components/skeleton';
import { detectNetworkSpeed, getMinLoadingTime } from '@/utils/network';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

const CLASSES = [6, 7, 8, 9, 10];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

// Shared avatar and edit button background color
const AVATAR_BG_COLOR = ThemeColors.orange + '20';

type NavigationState = {
  level: 'classes' | 'sections' | 'students';
  selectedClass?: number;
  selectedSection?: string;
};

export default function AdminStudentsScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavigationState>({ level: 'classes' });
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    class: '',
    phoneNumber: '',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      let minLoadingTime = 300;
      
      try {
        const networkSpeed = await detectNetworkSpeed();
        minLoadingTime = getMinLoadingTime(networkSpeed);
      } catch (networkError) {
        console.warn('Network speed detection failed, using default:', networkError);
      }
      
      const startTime = Date.now();
      console.log('Fetching users from API...');
      const users = await getUsers();
      console.log('Received users from API:', users.length);
      
      const studentUsers = users.filter((u) => u.role === 'student');
      console.log('Filtered student users:', studentUsers.length);
      console.log('Student data sample:', studentUsers.slice(0, 3).map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        class: s.class,
        rollNumber: s.rollNumber
      })));
      
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      setStudents(studentUsers);
      console.log('Successfully set students state:', studentUsers.length);
    } catch (error: any) {
      console.error('Failed to load students:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message || 'Failed to load students. Please check your connection and try again.');
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadStudents(true);
  };

  const handleClassSelect = (classNum: number) => {
    setNavigation({ level: 'sections', selectedClass: classNum });
  };

  const handleSectionSelect = (section: string) => {
    setNavigation({ 
      level: 'students', 
      selectedClass: navigation.selectedClass, 
      selectedSection: section 
    });
  };

  const handleBack = () => {
    if (navigation.level === 'students') {
      setNavigation({ level: 'sections', selectedClass: navigation.selectedClass });
    } else if (navigation.level === 'sections') {
      setNavigation({ level: 'classes' });
    }
  };

  const getStudentsByClassAndSection = (classNum?: number, section?: string): User[] => {
    if (!classNum) return [];
    
    let filtered = students.filter((s) => {
      if (!s.class) return false;
      
      // Handle different class formats: "6", "6-A", "6A", "Class 6", etc.
      const classStr = s.class.toString().toUpperCase().trim();
      const classNumStr = classNum.toString();
      
      // Check if class number matches - more flexible matching
      const classMatches = 
        classStr.startsWith(classNumStr) || 
        classStr.includes(`CLASS ${classNumStr}`) || 
        classStr === classNumStr ||
        classStr.match(new RegExp(`^${classNumStr}[^0-9]`)) !== null; // Matches "6-A", "6A", etc.
      
      if (!classMatches) return false;
      
      if (section) {
        // Check if section matches - look for section letter in the class string
        const sectionUpper = section.toUpperCase();
        // Match section at the end or after a separator (dash, space, etc.)
        const sectionPattern = new RegExp(`[-\\s]?${sectionUpper}$|${sectionUpper}[-\\s]`, 'i');
        return sectionPattern.test(classStr);
      }
      
      // If no section specified, return all students in this class
      return true;
    });

    return filtered;
  };

  const getClassesWithStudents = (): number[] => {
    const classesWithStudents = new Set<number>();
    students.forEach((s) => {
      if (s.class) {
        const classStr = s.class.toString().trim();
        // Extract class number from various formats
        const match = classStr.match(/^(\d+)/);
        if (match) {
          const classNum = parseInt(match[1], 10);
          if (!isNaN(classNum) && classNum >= 6 && classNum <= 10) {
            classesWithStudents.add(classNum);
          }
        }
      }
    });
    return Array.from(classesWithStudents).sort();
  };

  const getSectionsForClass = (classNum: number): string[] => {
    const sections = new Set<string>();
    const classStudents = getStudentsByClassAndSection(classNum);

    classStudents.forEach((s) => {
      if (s.class) {
        const classStr = s.class.toString().toUpperCase().trim();
        // Extract section (A, B, C, etc.)
        const sectionMatch = classStr.match(/[A-Z]$/);
        if (sectionMatch) {
          sections.add(sectionMatch[0]);
        }
      }
    });

    return Array.from(sections).sort();
  };

  const handleEdit = (student: User) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      rollNumber: student.rollNumber || '',
      class: student.class || '',
      phoneNumber: student.phoneNumber || '',
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingStudent) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    try {
      setSaving(true);
      await updateStudentByAdmin(editingStudent.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        rollNumber: editForm.rollNumber.trim(),
        class: editForm.class.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
      });

      Alert.alert('Success', 'Student updated successfully');
      setShowEditModal(false);
      setEditingStudent(null);
      await loadStudents(); // Reload students to reflect changes
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const renderClasses = () => {
    const classesWithStudents = getClassesWithStudents();
    
    if (loading) {
      return (
        <View style={styles.content}>
          <ListSkeleton count={5} itemHeight={140} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.emptyText}>Error Loading Students</ThemedText>
          <ThemedText style={styles.emptySubtext}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadStudents()}
            activeOpacity={0.7}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (classesWithStudents.length === 0 && students.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="person.2.fill" size={64} color={ThemeColors.orange} />
          <ThemedText style={styles.emptyText}>No students found</ThemedText>
          <ThemedText style={styles.emptySubtext}>Students will appear here when registered</ThemedText>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <ThemedText style={styles.sectionTitle}>Select Class</ThemedText>
        <View style={styles.grid}>
          {CLASSES.map((classNum) => {
            const classStudents = getStudentsByClassAndSection(classNum);
            const hasStudents = classStudents.length > 0;

            return (
              <TouchableOpacity
                key={classNum}
                style={[
                  styles.folderCard,
                  isDark && styles.folderCardDark,
                  !hasStudents && styles.folderCardEmpty,
                ]}
                onPress={() => hasStudents && handleClassSelect(classNum)}
                activeOpacity={hasStudents ? 0.7 : 1}
                disabled={!hasStudents}>
                <View style={[styles.folderIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                  <IconSymbol 
                    name="folder.fill" 
                    size={32} 
                    color={hasStudents ? ThemeColors.orange : ThemeColors.orange + '60'} 
                  />
                </View>
                <ThemedText style={[styles.folderText, !hasStudents && styles.folderTextEmpty]}>
                  Class {classNum}
                </ThemedText>
                <ThemedText style={styles.folderCount}>
                  {classStudents.length} {classStudents.length === 1 ? 'Student' : 'Students'}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderSections = () => {
    if (!navigation.selectedClass) return null;

    const sections = getSectionsForClass(navigation.selectedClass);
    const classStudents = getStudentsByClassAndSection(navigation.selectedClass);

    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.breadcrumb}>
          <ThemedText style={styles.breadcrumbText}>Class {navigation.selectedClass}</ThemedText>
        </View>
        <ThemedText style={styles.sectionTitle}>Select Section</ThemedText>
        <View style={styles.grid}>
          {sections.length > 0 ? (
            sections.map((section) => {
              const sectionStudents = getStudentsByClassAndSection(navigation.selectedClass, section);
              return (
                <TouchableOpacity
                  key={section}
                  style={[styles.folderCard, isDark && styles.folderCardDark]}
                  onPress={() => handleSectionSelect(section)}
                  activeOpacity={0.7}>
                  <View style={[styles.folderIcon, { backgroundColor: ThemeColors.deepBlue + '20' }]}>
                    <IconSymbol name="folder.fill" size={32} color={ThemeColors.deepBlue} />
                  </View>
                  <ThemedText style={styles.folderText}>Section {section}</ThemedText>
                  <ThemedText style={styles.folderCount}>
                    {sectionStudents.length} {sectionStudents.length === 1 ? 'Student' : 'Students'}
                  </ThemedText>
                </TouchableOpacity>
              );
            })
          ) : null}
          
          {/* Show "All Students" option if there are students without sections or if no sections exist */}
          {classStudents.length > 0 && (
            <TouchableOpacity
              style={[styles.folderCard, isDark && styles.folderCardDark]}
              onPress={() => {
                // Navigate directly to students view without section filter
                setNavigation({ 
                  level: 'students', 
                  selectedClass: navigation.selectedClass,
                  selectedSection: undefined
                });
              }}
              activeOpacity={0.7}>
              <View style={[styles.folderIcon, { backgroundColor: ThemeColors.orange + '20' }]}>
                <IconSymbol name="person.2.fill" size={32} color={ThemeColors.orange} />
              </View>
              <ThemedText style={styles.folderText}>All Students</ThemedText>
              <ThemedText style={styles.folderCount}>
                {classStudents.length} {classStudents.length === 1 ? 'Student' : 'Students'}
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {sections.length === 0 && classStudents.length === 0 && (
            <View style={styles.emptyContainer}>
              <IconSymbol name="folder.fill" size={64} color={ThemeColors.deepBlue} />
              <ThemedText style={styles.emptyText}>No students found</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                No students in Class {navigation.selectedClass}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderStudents = () => {
    if (!navigation.selectedClass) return null;

    let displayStudents = getStudentsByClassAndSection(navigation.selectedClass, navigation.selectedSection);
    
    console.log('Rendering students:', {
      selectedClass: navigation.selectedClass,
      selectedSection: navigation.selectedSection,
      totalStudents: students.length,
      filteredStudents: displayStudents.length,
      sampleClasses: students.slice(0, 5).map(s => s.class)
    });
    
    // Filter by search query
    if (searchQuery) {
      displayStudents = displayStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return (
      <View style={styles.content}>
        {loading ? (
          <View style={styles.listContent}>
            <ListSkeleton count={8} itemHeight={100} />
          </View>
        ) : displayStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="person.fill" size={64} color={ThemeColors.orange} />
            <ThemedText style={styles.emptyText}>
              {searchQuery ? 'No students match your search' : 'No students found'}
            </ThemedText>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}>
                <ThemedText style={styles.clearSearchText}>Clear Search</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={displayStudents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.studentCard, isDark && styles.studentCardDark]}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: AVATAR_BG_COLOR }]}>
                      <IconSymbol name="person.fill" size={24} color={ThemeColors.orange} />
                    </View>
                    <View style={styles.studentDetails}>
                      <ThemedText style={styles.studentName}>{item.name}</ThemedText>
                      <ThemedText style={styles.studentEmail}>{item.email}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.studentMeta}>
                    {item.rollNumber && (
                      <View style={styles.metaItem}>
                        <IconSymbol name="number" size={14} color={ThemeColors.orange} />
                        <ThemedText style={styles.metaText}>Roll: {item.rollNumber}</ThemedText>
                      </View>
                    )}
                    {item.class && (
                      <View style={styles.metaItem}>
                        <IconSymbol name="graduationcap.fill" size={14} color={ThemeColors.deepBlue} />
                        <ThemedText style={styles.metaText}>Class: {item.class}</ThemedText>
                      </View>
                    )}
                    {item.phoneNumber && (
                      <View style={styles.metaItem}>
                        <IconSymbol name="phone.fill" size={14} color={ThemeColors.orange} />
                        <ThemedText style={styles.metaText}>{item.phoneNumber}</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <IconSymbol name="pencil" size={22} color={ThemeColors.orange} />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          {(navigation.level === 'sections' || navigation.level === 'students') && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <IconSymbol name="chevron.left" size={24} color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue} />
            </TouchableOpacity>
          )}
          {navigation.level === 'classes' && (
            <TouchableOpacity
              onPress={() => router.push('/(admin)/')}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <IconSymbol name="chevron.left" size={24} color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue} />
            </TouchableOpacity>
          )}
          <ThemedText style={styles.headerTitle}>
            {navigation.level === 'classes' && 'Students'}
            {navigation.level === 'sections' && `Class ${navigation.selectedClass}`}
            {navigation.level === 'students' && `Class ${navigation.selectedClass}${navigation.selectedSection ? ` - Section ${navigation.selectedSection}` : ''}`}
          </ThemedText>
          <View style={styles.backButton} />
        </View>

        {/* Search Bar - Only show when viewing students */}
        {navigation.level === 'students' && (
          <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
            <IconSymbol name="magnifyingglass" size={20} color={isDark ? '#888' : '#999'} />
            <TextInput
              style={[styles.searchInput, isDark && styles.searchInputDark]}
              placeholder="Search students..."
              placeholderTextColor={isDark ? '#888' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={isDark ? '#888' : '#999'} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        {navigation.level === 'classes' && renderClasses()}
        {navigation.level === 'sections' && renderSections()}
        {navigation.level === 'students' && renderStudents()}

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modal, isDark && styles.modalDark]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Edit Student</ThemedText>
                <TouchableOpacity
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  activeOpacity={0.7}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={ThemeColors.orange} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Name *</ThemedText>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    placeholder="Student Name"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Email *</ThemedText>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                    placeholder="student@example.com"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Roll Number</ThemedText>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={editForm.rollNumber}
                    onChangeText={(text) => setEditForm({ ...editForm, rollNumber: text })}
                    placeholder="Roll Number"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Class</ThemedText>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={editForm.class}
                    onChangeText={(text) => setEditForm({ ...editForm, class: text })}
                    placeholder="e.g., 6-A, 7-B"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>Phone Number</ThemedText>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={editForm.phoneNumber}
                    onChangeText={(text) => setEditForm({ ...editForm, phoneNumber: text })}
                    placeholder="Phone Number"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    keyboardType="phone-pad"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                  }}
                  disabled={saving}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.7}>
                  {saving ? (
                    <ActivityIndicator color={ThemeColors.white} />
                  ) : (
                    <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                  )}
                </TouchableOpacity>
              </View>
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
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  searchContainerDark: {
    backgroundColor: '#2A4D5D',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchInputDark: {
    color: '#FFF',
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
    justifyContent: 'space-between',
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
  folderCardEmpty: {
    opacity: 0.5,
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
    marginBottom: 4,
  },
  folderTextEmpty: {
    opacity: 0.6,
  },
  folderCount: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  studentCardDark: {
    backgroundColor: '#2A4D5D',
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  studentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    opacity: 0.8,
    fontWeight: '500',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AVATAR_BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    ...Platform.select({
      ios: {
        shadowColor: ThemeColors.orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: ThemeColors.orange,
    borderRadius: 12,
  },
  retryButtonText: {
    color: ThemeColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: ThemeColors.orange + '20',
    borderRadius: 8,
  },
  clearSearchText: {
    color: ThemeColors.orange,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalDark: {
    backgroundColor: '#1A3D4D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDark: {
    backgroundColor: '#2A4D5D',
    borderColor: '#3A5D6D',
    color: '#FFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonDark: {
    backgroundColor: '#2A4D5D',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: ThemeColors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: ThemeColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
