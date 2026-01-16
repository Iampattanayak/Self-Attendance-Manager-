import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from './contexts/DataContext';
import { useTheme } from './contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Onboarding() {
  const router = useRouter();
  const { updateSettings } = useData();
  const { colors } = useTheme();

  const [step, setStep] = useState(1);
  const [termStart, setTermStart] = useState(new Date());
  const [termEnd, setTermEnd] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [targetPercentage, setTargetPercentage] = useState('75');
  const [weekStart, setWeekStart] = useState(1); // 0 = Sunday, 1 = Monday
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleComplete = async () => {
    await updateSettings({
      termStart: format(termStart, 'yyyy-MM-dd'),
      termEnd: format(termEnd, 'yyyy-MM-dd'),
      targetPercentage: parseInt(targetPercentage) || 75,
      weekStart,
      isOnboarded: true,
      notificationsEnabled: true,
      reminderMinutesBefore: 10,
    });
    router.replace('/(tabs)');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="calendar" size={80} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>Welcome to Attendance Manager</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Track your attendance effortlessly and maintain your target percentage
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Set Your Term Dates</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        When does your academic term start and end?
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Term Start Date</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowStartPicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {format(termStart, 'MMM dd, yyyy')}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={termStart}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (date) setTermStart(date);
          }}
        />
      )}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Term End Date</Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowEndPicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {format(termEnd, 'MMM dd, yyyy')}
          </Text>
        </TouchableOpacity>
      </View>

      {showEndPicker && (
        <DateTimePicker
          value={termEnd}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(Platform.OS === 'ios');
            if (date) setTermEnd(date);
          }}
        />
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => setStep(1)}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => setStep(3)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Set Target Attendance</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        What's your target attendance percentage?
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Target Percentage</Text>
        <View style={styles.percentageContainer}>
          <TextInput
            style={[
              styles.percentageInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
            value={targetPercentage}
            onChangeText={setTargetPercentage}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={[styles.percentageSymbol, { color: colors.text }]}>%</Text>
        </View>
      </View>

      <View style={styles.presetContainer}>
        {['70', '75', '80', '85', '90'].map(preset => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              { borderColor: colors.border },
              targetPercentage === preset && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTargetPercentage(preset)}
          >
            <Text
              style={[
                styles.presetText,
                { color: targetPercentage === preset ? '#fff' : colors.text },
              ]}
            >
              {preset}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => setStep(2)}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => setStep(4)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Choose Week Start Day</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Which day does your week start?
      </Text>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.weekDayButton,
              { borderColor: colors.border },
              weekStart === index && { backgroundColor: colors.primary },
            ]}
            onPress={() => setWeekStart(index)}
          >
            <Text
              style={[
                styles.weekDayText,
                { color: weekStart === index ? '#fff' : colors.text },
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => setStep(3)}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleComplete}
        >
          <Text style={styles.buttonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: i <= step ? colors.primary : colors.border },
                ]}
              />
            ))}
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  inputGroup: {
    width: '100%',
    gap: 8,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentageInput: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  percentageSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  presetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysContainer: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  weekDayButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
