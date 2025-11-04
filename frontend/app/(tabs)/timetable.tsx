import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ClassSchedule } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable() {
  const { subjects, classes, addClass, updateClass, deleteClass, settings } = useData();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Group classes by weekday
  const classesByDay = useMemo(() => {
    const grouped: { [key: number]: any[] } = {};
    
    classes.forEach(cls => {
      if (!grouped[cls.weekday]) {
        grouped[cls.weekday] = [];
      }
      const subject = subjects.find(s => s.id === cls.subjectId);
      grouped[cls.weekday].push({ ...cls, subject });
    });

    // Sort classes by start time within each day
    Object.keys(grouped).forEach(day => {
      grouped[parseInt(day)].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [classes, subjects]);

  const openAddModal = (weekday?: number) => {
    setEditingClass(null);
    setSelectedSubjectId(subjects[0]?.id || '');
    setSelectedWeekday(weekday !== undefined ? weekday : settings?.weekStart || 1);
    setStartTime('09:00');
    setDuration('60');
    setModalVisible(true);
  };

  const openEditModal = (classSchedule: ClassSchedule) => {
    setEditingClass(classSchedule);
    setSelectedSubjectId(classSchedule.subjectId);
    setSelectedWeekday(classSchedule.weekday);
    setStartTime(classSchedule.startTime);
    setDuration(classSchedule.durationMinutes.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }

    const classData: ClassSchedule = {
      id: editingClass?.id || `class_${Date.now()}`,
      subjectId: selectedSubjectId,
      weekday: selectedWeekday,
      startTime,
      durationMinutes: parseInt(duration) || 60,
    };

    if (editingClass) {
      await updateClass(editingClass.id, classData);
    } else {
      await addClass(classData);
    }

    setModalVisible(false);
  };

  const handleDelete = (classSchedule: ClassSchedule) => {
    const subject = subjects.find(s => s.id === classSchedule.subjectId);
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete this ${subject?.name} class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteClass(classSchedule.id),
        },
      ]
    );
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setStartTime(`${hours}:${minutes}`);
    }
  };

  const getTimeDate = () => {
    const [hours, minutes] = startTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {subjects.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Subjects Yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Add subjects first before creating a timetable
            </Text>
          </View>
        ) : (
          <View style={styles.timetableContainer}>
            {WEEKDAYS_FULL.map((day, index) => {
              const dayClasses = classesByDay[index] || [];
              return (
                <View key={day} style={[styles.dayCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.dayHeader}>
                    <Text style={[styles.dayName, { color: colors.text }]}>{day}</Text>
                    <TouchableOpacity
                      onPress={() => openAddModal(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="add-circle" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {dayClasses.length === 0 ? (
                    <Text style={[styles.noClasses, { color: colors.textSecondary }]}>
                      No classes scheduled
                    </Text>
                  ) : (
                    dayClasses.map((cls, idx) => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[
                          styles.classItem,
                          { borderLeftColor: cls.subject?.color || colors.primary },
                        ]}
                        onPress={() => openEditModal(cls)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.classContent}>
                          <Text style={[styles.className, { color: colors.text }]}>
                            {cls.subject?.name || 'Unknown'}
                          </Text>
                          <Text style={[styles.classTime, { color: colors.textSecondary }]}>
                            {cls.startTime} • {cls.durationMinutes} min
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDelete(cls)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {subjects.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => openAddModal()}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingClass ? 'Edit Class' : 'Add Class'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
                <View style={styles.subjectList}>
                  {subjects.map(subject => (
                    <TouchableOpacity
                      key={subject.id}
                      style={[
                        styles.subjectOption,
                        { borderColor: colors.border },
                        selectedSubjectId === subject.id && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => setSelectedSubjectId(subject.id)}
                    >
                      <View
                        style={[styles.subjectDot, { backgroundColor: subject.color }]}
                      />
                      <Text
                        style={[
                          styles.subjectOptionText,
                          { color: selectedSubjectId === subject.id ? '#fff' : colors.text },
                        ]}
                      >
                        {subject.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Day *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.daysList}>
                    {WEEKDAYS_FULL.map((day, index) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayOption,
                          { borderColor: colors.border },
                          selectedWeekday === index && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                        ]}
                        onPress={() => setSelectedWeekday(index)}
                      >
                        <Text
                          style={[
                            styles.dayOptionText,
                            { color: selectedWeekday === index ? '#fff' : colors.text },
                          ]}
                        >
                          {WEEKDAYS[index]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Start Time *</Text>
                <TouchableOpacity
                  style={[
                    styles.timeButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={[styles.timeText, { color: colors.text }]}>{startTime}</Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={getTimeDate()}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Duration (minutes) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  placeholder="60"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.presetDurations}>
                {['30', '45', '60', '90', '120'].map(preset => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      { borderColor: colors.border },
                      duration === preset && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setDuration(preset)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: duration === preset ? '#fff' : colors.text },
                      ]}
                    >
                      {preset}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    borderRadius: 16,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  timetableContainer: {
    gap: 16,
  },
  dayCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noClasses: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  classContent: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
  },
  classTime: {
    fontSize: 14,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subjectList: {
    gap: 8,
  },
  subjectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  subjectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectOptionText: {
    fontSize: 16,
  },
  daysList: {
    flexDirection: 'row',
    gap: 8,
  },
  dayOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  presetDurations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -8,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {},
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
