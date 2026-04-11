import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth >= 768;
const isDesktop = screenWidth >= 1024;

interface ActivityQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ActivityContent {
  title: string;
  intro: string;
  details: string;
  questions: ActivityQuestion[];
}

const activityContentMap: Record<string, ActivityContent> = {
  'air-water': {
  title: 'Air & Water Activities',
  intro: 'Welcome to Air & Water interactive activities.',
  details:
    'Learn about properties of air, importance of water, sources of water, and environmental awareness through this quiz.',
  questions: [
    {
      question: 'Which gas is essential for breathing?',
      options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'],
      correctAnswer: 'Oxygen',
    },
    {
      question: 'Air is a mixture of:',
      options: ['Only oxygen', 'Only nitrogen', 'Different gases', 'Only carbon dioxide'],
      correctAnswer: 'Different gases',
    },
    {
      question: 'Which of the following is NOT a source of water?',
      options: ['River', 'Lake', 'Ocean', 'Rock'],
      correctAnswer: 'Rock',
    },
    {
      question: 'Water is important for:',
      options: ['Drinking', 'Cooking', 'Cleaning', 'All of the above'],
      correctAnswer: 'All of the above',
    },
    {
      question: 'Which process turns water into vapor?',
      options: ['Condensation', 'Evaporation', 'Freezing', 'Melting'],
      correctAnswer: 'Evaporation',
    },
    {
      question: 'Which process forms clouds?',
      options: ['Evaporation', 'Condensation', 'Freezing', 'Boiling'],
      correctAnswer: 'Condensation',
    },
    {
      question: 'Which gas do plants use from air?',
      options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      correctAnswer: 'Carbon dioxide',
    },
    {
      question: 'Air occupies:',
      options: ['No space', 'Only land', 'Space', 'Only water'],
      correctAnswer: 'Space',
    },
    {
      question: 'Which is the purest form of natural water?',
      options: ['River water', 'Sea water', 'Rain water', 'Lake water'],
      correctAnswer: 'Rain water',
    },
    {
      question: 'Saving water means:',
      options: [
        'Using more water',
        'Wasting water',
        'Using water carefully',
        'Ignoring water usage',
      ],
      correctAnswer: 'Using water carefully',
    },
  ],
},
  fractions: {
  title: 'Fractions Activities',
  intro: 'Welcome to Fractions activities.',
  details: 'Practice fractions with examples, equivalent fractions, improper fractions, and mixed numbers.',
  questions: [
    {
      question: 'What is the numerator in 5/8?',
      options: ['5', '8', '3', '13'],
      correctAnswer: '5',
    },
    {
      question: 'Which fraction is equivalent to 1/2?',
      options: ['2/3', '3/6', '4/5', '3/5'],
      correctAnswer: '3/6',
    },
    {
      question: 'Which is an improper fraction?',
      options: ['3/5', '1/4', '7/3', '2/9'],
      correctAnswer: '7/3',
    },
    {
      question: 'What mixed number equals 9/4?',
      options: ['2¼', '3½', '1¾', '2¾'],
      correctAnswer: '2¼',
    },
  ],
},
  'plants': {
  title: 'Plants Activities',
  intro: 'Welcome to Plants science quiz.',
  details:
    'Test your understanding of plant parts, photosynthesis, and plant life cycle.',
  questions: [
    {
      question: 'Which plant part absorbs water from the soil?',
      options: ['Leaves', 'Stem', 'Roots', 'Flower'],
      correctAnswer: 'Roots',
    },
    {
      question: 'What gas do plants release during photosynthesis?',
      options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
      correctAnswer: 'Oxygen',
    },
    {
      question: 'What do plants need for photosynthesis? (Choose the best answer)',
      options: [
        'Soil only',
        'Water, CO₂ & sunlight',
        'Water & darkness',
        'Air & soil',
      ],
      correctAnswer: 'Water, CO₂ & sunlight',
    },
    {
      question: "What is the FIRST stage in a plant's life cycle?",
      options: ['Flowering', 'Seedling', 'Seed', 'Germination'],
      correctAnswer: 'Seed',
    },
  ],
},
  'tenali-lsrw': {
  title: 'Tenali Rama - LSRW',
  intro: 'Welcome to Tenali Rama reading comprehension activities.',
  details:
    'Read the story carefully and answer the following comprehension questions based on Tenali Rama’s clever thinking.',
  questions: [
    {
      question: 'Why was the king troubled at the beginning of the story?',
      options: [
        'His palace was too small',
        'His courtiers were lazy',
        'Mice had invaded his palace',
        'He had lost his crown',
      ],
      correctAnswer: 'Mice had invaded his palace',
    },
    {
      question: 'What did the king give each courtier to solve the mouse problem?',
      options: [
        'A dog',
        'A cat',
        'A mousetrap',
        'A bag of grain',
      ],
      correctAnswer: 'A cat',
    },
    {
      question: 'What did Tenali place beside the bowl of milk?',
      options: [
        'Hot chilli paste',
        'A piece of fish',
        'A mousetrap',
        'Another cat',
      ],
      correctAnswer: 'Hot chilli paste',
    },
    {
      question: "What happened when Tenali's cat saw the bowl of milk during inspection?",
      options: [
        'It drank it eagerly',
        'It lapped it slowly',
        'It ran out of the hall',
        'It knocked it over',
      ],
      correctAnswer: 'It ran out of the hall',
    },
    {
      question: 'Why did the king reward Tenali?',
      options: [
        'He was the funniest',
        'He understood the purpose of the task',
        'He had the biggest cat',
        'He caught the most mice himself',
      ],
      correctAnswer: 'He understood the purpose of the task',
    },
  ],
},
  'kabir-dohe': {
    title: 'Kabir Dohe Activities',
    intro: 'Welcome to Kabir Dohe activities.',
    details: 'Learn Hindi poetry through simple and engaging exercises.',
    questions: [
      {
        question: 'Kabir is famous for?',
        options: ['Dohe', 'Songs', 'Stories', 'Drama'],
        correctAnswer: 'Dohe',
      },
      {
        question: 'Dohe are usually written in?',
        options: ['Two lines', 'Ten pages', 'One word', 'Paragraphs'],
        correctAnswer: 'Two lines',
      },
      {
        question: 'Kabir Dohe mainly teach?',
        options: ['Life lessons', 'Car driving', 'Cooking', 'Painting'],
        correctAnswer: 'Life lessons',
      },
    ],
  },
  'mass-weight': {
  title: 'Mass, Weight & Volume',
  intro: 'Welcome to Mass, Weight & Volume activities.',
  details:
    'Understand mass, weight, density, volume, measurement tools, and related real-world applications through this quiz.',
  questions: [
    {
      question: 'What does mass measure?',
      options: ['Gravitational force', 'Amount of matter', 'Space occupied', 'Temperature'],
      correctAnswer: 'Amount of matter',
    },
    {
      question: 'Which tool measures WEIGHT?',
      options: ['Balance scale', 'Graduated cylinder', 'Spring scale / Newton meter', 'Beaker'],
      correctAnswer: 'Spring scale / Newton meter',
    },
    {
      question: 'Convert 2.5 kg to grams:',
      options: ['25 g', '250 g', '2,500 g', '25,000 g'],
      correctAnswer: '2,500 g',
    },
    {
      question: 'On the Moon, compared to Earth, your mass will be:',
      options: ['Much less', 'The same', 'Much more', 'Zero'],
      correctAnswer: 'The same',
    },
    {
      question: 'The formula for density is:',
      options: ['D = M + V', 'D = M x V', 'D = M ÷ V', 'D = V ÷ M'],
      correctAnswer: 'D = M ÷ V',
    },
    {
      question: 'A rock with density 2.5 g/cm³ will:',
      options: ['Float in water', 'Sink in water', 'Hover in the middle', 'Dissolve in water'],
      correctAnswer: 'Sink in water',
    },
    {
      question: 'You want to find the volume of an irregular stone. Which method do you use?',
      options: ['L×W×H formula', 'V=πr²h', 'Water displacement', 'Weighing on a balance'],
      correctAnswer: 'Water displacement',
    },
    {
      question: 'The meniscus of a liquid should be read:',
      options: ['At the top of the curve', 'At the bottom of the curve', 'At eye level from above', 'Using a thermometer'],
      correctAnswer: 'At the bottom of the curve',
    },
    {
      question: 'Archimedes discovered water displacement while:',
      options: ['Cooking dinner', 'Climbing into a bath', 'Sailing a ship', 'Weighing a crown on scales'],
      correctAnswer: 'Climbing into a bath',
    },
    {
      question: 'A feather and a hammer fall at the same rate on the Moon because there is:',
      options: ['Less gravity', 'No air resistance', 'More mass', 'Higher temperature'],
      correctAnswer: 'No air resistance',
    },
    {
      question: 'An object has mass 80 g and volume 40 cm³. Its density is:',
      options: ['0.5 g/cm³', '1.0 g/cm³', '2.0 g/cm³', '3.2 g/cm³'],
      correctAnswer: '2.0 g/cm³',
    },
    {
      question: 'Weight is measured in:',
      options: ['Grams', 'Kilograms', 'Newtons', 'Litres'],
      correctAnswer: 'Newtons',
    },
    {
      question: 'Which liquid is densest and goes at the bottom of a density tower?',
      options: ['Water', 'Vegetable oil', 'Honey', 'Rubbing alcohol'],
      correctAnswer: 'Honey',
    },
    {
      question: 'Accuracy in measurement means:',
      options: ['Getting the same result every time', 'Getting a result close to the true value', 'Using the most expensive tool', 'Measuring the fastest'],
      correctAnswer: 'Getting a result close to the true value',
    },
    {
      question: 'A student on Earth weighs 490 N. On the Moon (g=1.6), their weight is approximately:',
      options: ['490 N', '80 N', '245 N', '30 N'],
      correctAnswer: '80 N',
    },
  ],
},
};

const createActivityHtml = (content: ActivityContent) => {
  const safeQuestions = JSON.stringify(content.questions);

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: #f7f9fc;
          color: #1f2937;
          margin: 0;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        h1 {
          color: #0f3d67;
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 22px;
        }
        p {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 14px;
        }
        .btn {
          display: inline-block;
          margin-top: 12px;
          padding: 12px 18px;
          border-radius: 10px;
          background: #ff8a00;
          color: white;
          text-decoration: none;
          font-size: 16px;
          border: none;
          cursor: pointer;
        }
        .activity-box {
          display: none;
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          background: #eef6ff;
          border: 1px solid #d8e9ff;
        }
        .question {
          font-size: 17px;
          font-weight: bold;
          margin-bottom: 14px;
          color: #0f3d67;
        }
        .option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 10px;
          border: 1px solid #cfd8e3;
          background: #fff;
          font-size: 15px;
          cursor: pointer;
        }
        .option:hover {
          background: #f5f9ff;
        }
        .result {
          margin-top: 12px;
          font-weight: bold;
          font-size: 15px;
        }
        .score {
          margin-top: 10px;
          color: #0f3d67;
          font-weight: bold;
        }
        .next-btn {
          display: none;
          margin-top: 14px;
          padding: 10px 16px;
          border-radius: 10px;
          background: #0f3d67;
          color: white;
          border: none;
          cursor: pointer;
        }
        .final-box {
          display: none;
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          background: #f0fff4;
          border: 1px solid #b7ebc6;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${content.title}</h1>
        <p>${content.intro}</p>
        <p>${content.details}</p>

        <button class="btn" onclick="startActivity()">Start Activity</button>

        <div id="activityBox" class="activity-box">
          <div id="questionText" class="question"></div>
          <div id="optionsContainer"></div>
          <div id="result" class="result"></div>
          <div id="scoreText" class="score"></div>
          <button id="nextBtn" class="next-btn" onclick="nextQuestion()">Next Question</button>
        </div>

        <div id="finalBox" class="final-box">
          <h2>Activity Completed</h2>
          <p id="finalScore"></p>
        </div>
      </div>

      <script>
        const questions = ${safeQuestions};
        let currentQuestionIndex = 0;
        let score = 0;
        let answered = false;

        function postMessageToApp(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }

        function startActivity() {
          document.getElementById('activityBox').style.display = 'block';
          document.getElementById('finalBox').style.display = 'none';
          currentQuestionIndex = 0;
          score = 0;
          answered = false;
          renderQuestion();
          postMessageToApp({ type: 'activity_started' });
        }

        function renderQuestion() {
          const question = questions[currentQuestionIndex];
          answered = false;

          document.getElementById('questionText').innerText =
            'Question ' + (currentQuestionIndex + 1) + ': ' + question.question;

          const optionsContainer = document.getElementById('optionsContainer');
          optionsContainer.innerHTML = '';

          question.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.innerText = option;
            button.onclick = function () {
              selectAnswer(option);
            };
            optionsContainer.appendChild(button);
          });

          document.getElementById('result').innerText = '';
          document.getElementById('scoreText').innerText = 'Score: ' + score + '/' + questions.length;
          document.getElementById('nextBtn').style.display = 'none';
        }

        function selectAnswer(answer) {
          if (answered) return;

          answered = true;
          const question = questions[currentQuestionIndex];
          const result = document.getElementById('result');

          if (answer === question.correctAnswer) {
            score++;
            result.innerHTML = '✅ Correct answer!';
            result.style.color = 'green';
          } else {
            result.innerHTML = '❌ Wrong answer. Correct answer is: ' + question.correctAnswer;
            result.style.color = 'red';
          }

          document.getElementById('scoreText').innerText = 'Score: ' + score + '/' + questions.length;

          postMessageToApp({
            type: 'answer_selected',
            question: question.question,
            selectedAnswer: answer,
            correctAnswer: question.correctAnswer,
            isCorrect: answer === question.correctAnswer,
            currentQuestionIndex: currentQuestionIndex,
            score: score,
            totalQuestions: questions.length
          });

          if (currentQuestionIndex < questions.length - 1) {
            document.getElementById('nextBtn').style.display = 'inline-block';
          } else {
            setTimeout(() => {
              finishActivity();
            }, 800);
          }
        }

        function nextQuestion() {
          currentQuestionIndex++;
          renderQuestion();
        }

        function finishActivity() {
          document.getElementById('activityBox').style.display = 'none';
          document.getElementById('finalBox').style.display = 'block';
          document.getElementById('finalScore').innerText =
            'Your final score is ' + score + ' out of ' + questions.length + '.';

          postMessageToApp({
            type: 'activity_finished',
            score: score,
            totalQuestions: questions.length
          });
        }
      </script>
    </body>
  </html>
  `;
};

export default function ActivityDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();

  const id = typeof params.id === 'string' ? params.id : '';
  const title = typeof params.title === 'string' ? params.title : 'Activity';
  const description =
    typeof params.description === 'string' ? params.description : 'Activity details';
  const grade = typeof params.grade === 'string' ? params.grade : '';

  const activityHtml = useMemo(() => {
    const content = activityContentMap[id];

    if (!content) {
      return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #f8fafc;
            }
            .card {
              background: white;
              border-radius: 16px;
              padding: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Activity not found</h1>
            <p>No output is mapped for this activity.</p>
          </div>
        </body>
      </html>
      `;
    }

    return createActivityHtml(content);
  }, [id]);

  const androidStatusBarOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const handleWebViewMessage = async (event: any) => {
    try {
      const rawMessage = event?.nativeEvent?.data;
      if (!rawMessage) return;

      const message = JSON.parse(rawMessage);

      if (message.type === 'activity_started') {
        Alert.alert('Activity Started', `${title} started successfully`);
        return;
      }

      if (message.type === 'answer_selected') {
        console.log('Answer selected:', message);

        // Backend API call example
        // await fetch('https://your-backend-api.com/api/activity-answer', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     activityId: id,
        //     question: message.question,
        //     selectedAnswer: message.selectedAnswer,
        //     correctAnswer: message.correctAnswer,
        //     isCorrect: message.isCorrect,
        //     score: message.score,
        //     totalQuestions: message.totalQuestions,
        //   }),
        // });

        return;
      }

      if (message.type === 'activity_finished') {
        console.log('Activity finished:', message);

        Alert.alert(
          'Activity Completed',
          `Your score: ${message.score}/${message.totalQuestions}`
        );

        // Backend API call example
        // await fetch('https://your-backend-api.com/api/activity-result', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     activityId: id,
        //     score: message.score,
        //     totalQuestions: message.totalQuestions,
        //     studentId: 'your-student-id',
        //   }),
        // });

        return;
      }
    } catch (error) {
      console.error('WebView message parse error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: androidStatusBarOffset }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {title}
          </ThemedText>

          <View style={styles.headerRightSpace} />
        </View>

        <View style={styles.metaContainer}>
          <ThemedText style={styles.metaDescription}>{description}</ThemedText>

          {!!grade && (
            <View style={styles.gradeTag}>
              <ThemedText style={styles.gradeText}>{grade}</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.webviewWrapper}>
          <WebView
            originWhitelist={['*']}
            source={{ html: activityHtml }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            onMessage={handleWebViewMessage}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const getResponsiveValue = (
  small: number,
  medium: number,
  large: number,
  xlarge?: number
) => {
  if (isDesktop && xlarge !== undefined) return xlarge;
  if (isTablet) return large;
  if (isSmallScreen) return small;
  return medium;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  container: {
    flex: 1,
    backgroundColor: ThemeColors.lightNeutral,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: ThemeColors.white,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: getResponsiveValue(18, 20, 22, 24),
    fontWeight: '700',
    marginHorizontal: 12,
  },
  headerRightSpace: {
    width: 24,
  },
  metaContainer: {
    paddingHorizontal: getResponsiveValue(16, 20, 24, 28),
    paddingVertical: 14,
    backgroundColor: ThemeColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metaDescription: {
    fontSize: 14,
    color: ThemeColors.grayText,
    lineHeight: 20,
    marginBottom: 10,
  },
  gradeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: ThemeColors.orange + '15',
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 12,
    color: ThemeColors.orange,
    fontWeight: '600',
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
});