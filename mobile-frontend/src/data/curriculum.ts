import { SchoolClass } from "../types/curriculum";

export const BOARD_INFO = {
  board: "Andhra Pradesh State Board",
  authority: "SCERT Andhra Pradesh",
  academicYear: "2026-2027",
  notes: [
    "Language subjects may vary by school, medium, and language selection.",
    "Classes 6 and 7 use General Science in the assessment syllabus.",
    "Classes 8, 9, and 10 cover Physical Science and Biological Science separately in the assessment syllabus.",
    "Verify the applicable textbooks and subject structure using the official AP textbook portal.",
  ],
  officialSources: [
    "https://cse.ap.gov.in/textBooksDownloadingPagetitleWise",
    "https://cse.ap.gov.in/loadacademictextbookpublicview",
  ],
};

export const CURRICULUM_DATA: SchoolClass[] = [
  // ==========================================
  // CLASS 6 (SCERT AP - 6 Subjects)
  // ==========================================
  {
    id: "class-6",
    grade: 6,
    title: "Class 6",
    subtitle: "6 Core Subjects · General Science",
    badge: "AP SCERT",
    subjects: [
      {
        id: "c6-telugu",
        name: "Telugu (తెలుగు)",
        description: "అమ్మ ఒడి, తృప్తి, మా కొద్దీ తెల్ల దొరతనము మరియు సమయస్ఫూర్తి పాఠ్యాంశాలు",
        category: "languages",
        icon: "auto-stories",
        chapters: [
          {
            id: "c6-tel-ch1",
            title: "అమ్మ ఒడి (Amma Vodi)",
            description: "తల్లి ప్రేమ, గొప్పతనం మరియు జీవన విలువల పరిచయం",
            order: 1,
            unitName: "పద్య భాగం",
            durationMinutes: 18,
            learningGoals: [
              "మాతృమూర్తి త్యాగాన్ని, ఔన్నత్యాన్ని గుర్తించడం",
              "సరళమైన తెలుగు పద్య భావాన్ని గ్రహించడం",
              "మాతృభాషా ప్రయోగ నైపుణ్యాలు పెంపొందించుకోవడం",
            ],
            sections: [
              {
                id: "c6-tel-ch1-s1",
                title: "గేయ పరిచయం & భావార్థం",
                content: "అమ్మ ఒడి చదువుల బడి. అమ్మ చూపులు వరవడి. తల్లి ప్రేమ పిల్లలకు మొదటి పాఠశాల వంటిది. ఆమె అందించే విలువలు జీవితాంతం మార్గదర్శనం చేస్తాయి.",
                order: 1,
                durationMinutes: 9,
                summaryPoint: "అమ్మే ప్రతి బిడ్డకు తొలి గురువు మరియు మార్గదర్శి.",
              },
              {
                id: "c6-tel-ch1-s2",
                title: "భాషాంశాలు & వ్యాకరణం",
                content: "వర్ణమాల విభజన (అచ్చులు, హల్లులు, ఉభయాక్షరాలు) మరియు నామవాచక పదాల గుర్తింపు.",
                order: 2,
                durationMinutes: 9,
                keyAxiom: "తెలుగు వర్ణమాలలో 56 అక్షరాలు కలవు: అచ్చులు 16, హల్లులు 37, ఉభయాక్షరాలు 3.",
              },
            ],
          },
          {
            id: "c6-tel-ch2",
            title: "తృప్తి (Trupthi)",
            description: "సత్యం శంకరమంచి రచించిన అమరావతి కథలలోని పూర్ణయ్య పాత్ర విశ్లేషణ",
            order: 2,
            unitName: "గద్య భాగం",
            durationMinutes: 20,
            sections: [
              {
                id: "c6-tel-ch2-s1",
                title: "కథా నేపధ్యం & పూర్ణయ్య వ్యక్తిత్వం",
                content: "ఇతరులకు వడ్డించి తినిపించడంలో ఉండే తృప్తి మరియు ఆనందం అనంతమైనది.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c6-hindi",
        name: "Hindi (हिंदी)",
        description: "वह चिड़िया जो, बचपन, नादान दोस्त एवं चाँद से थोड़ी सी गप्पें",
        category: "languages",
        icon: "translate",
        chapters: [
          {
            id: "c6-hin-ch1",
            title: "वह चिड़िया जो (Vah Chidiya Jo)",
            description: "केदारनाथ अग्रवाल द्वारा रचित सुंदर कविता एवं नीले पंखों वाली चिड़िया का स्वभाव",
            order: 1,
            unitName: "काव्य खंड",
            durationMinutes: 16,
            learningGoals: [
              "कविता का सस्वर वाचन एवं भावार्थ समझना",
              "प्रकृति प्रेम और संतोषी स्वभाव का महत्व जानना",
            ],
            sections: [
              {
                id: "c6-hin-ch1-s1",
                title: "कविता वाचन एवं भावार्थ",
                content: "वह चिड़िया जो चोंच मारकर दूध भरे जुंडी के दाने रुचि से, रस से खा लेती है—वह छोटी संतोषी चिड़िया नीले पंखों वाली मैं हूँ।",
                order: 1,
                durationMinutes: 8,
              },
            ],
          },
        ],
      },
      {
        id: "c6-english",
        name: "English",
        description: "A Tale of Two Birds, How the Dog Found Himself a Master & Taro’s Reward",
        category: "languages",
        icon: "menu-book",
        chapters: [
          {
            id: "c6-eng-ch1",
            title: "A Tale of Two Birds",
            description: "A folklore story exploring companionship, behavior, and environment",
            order: 1,
            unitName: "A Pact with the Sun",
            durationMinutes: 18,
            learningGoals: [
              "Understand the influence of company on personality",
              "Enhance narrative comprehension and vocabulary",
            ],
            sections: [
              {
                id: "c6-eng-ch1-s1",
                title: "The Storm and Separation",
                content: "A mother bird and her two young ones lived in a tall tree. A fierce storm blew down the tree and separated the baby birds into two different abodes.",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
        ],
      },
      {
        id: "c6-maths",
        name: "Mathematics",
        description: "Knowing Our Numbers, Whole Numbers, Playing with Numbers, Integers & Basic Geometry",
        category: "stem",
        icon: "calculate",
        chapters: [
          {
            id: "c6-m-ch1",
            title: "Knowing Our Numbers",
            description: "Comparing numbers, place value systems, estimation and Roman numerals",
            order: 1,
            unitName: "Number System",
            durationMinutes: 20,
            learningGoals: [
              "Compare large numbers up to 8 digits",
              "Convert units between metric lengths and weights",
              "Read and write standard Roman numerals",
            ],
            sections: [
              {
                id: "c6-m-ch1-s1",
                title: "Comparing Numbers & Place Value",
                content: "When comparing multi-digit numbers, first count the number of digits. If digit counts match, compare place values starting from the extreme left.",
                order: 1,
                durationMinutes: 10,
                keyAxiom: "Indian System: Ones, Tens, Hundreds, Thousands, Ten Thousands, Lakhs, Ten Lakhs, Crores.",
              },
              {
                id: "c6-m-ch1-s2",
                title: "Large Numbers in Daily Use",
                content: "1 kilometre = 1,000 metres = 100,000 centimetres = 1,000,000 millimetres.",
                order: 2,
                durationMinutes: 10,
              },
            ],
          },
          {
            id: "c6-m-ch2",
            title: "Whole Numbers",
            description: "Natural numbers, predecessors, successors, and number line arithmetic",
            order: 2,
            unitName: "Number System",
            durationMinutes: 18,
            sections: [
              {
                id: "c6-m-ch2-s1",
                title: "Number Line Arithmetic",
                content: "Addition corresponds to moving right on the number line. Subtraction corresponds to moving left.",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
        ],
      },
      {
        id: "c6-science",
        name: "General Science",
        description: "Components of Food, Sorting Materials, Separation of Substances & Living Organisms",
        category: "stem",
        icon: "science",
        chapters: [
          {
            id: "c6-sci-ch1",
            title: "Components of Food",
            description: "Nutrients, carbohydrates, fats, proteins, vitamins and deficiency diseases",
            order: 1,
            unitName: "Food & Health",
            durationMinutes: 20,
            learningGoals: [
              "Identify the major nutrient categories in balanced diets",
              "Perform simple chemical tests for starch, proteins, and fats",
            ],
            sections: [
              {
                id: "c6-sci-ch1-s1",
                title: "Essential Nutrients & Dietary Balance",
                content: "Carbohydrates and fats provide energy. Proteins build body tissues. Vitamins and minerals protect against diseases.",
                order: 1,
                durationMinutes: 10,
                keyAxiom: "Iodine Test: Blue-black coloration indicates the presence of starch.",
              },
            ],
          },
          {
            id: "c6-sci-ch2",
            title: "Sorting Materials into Groups",
            description: "Properties of materials: luster, hardness, solubility and transparency",
            order: 2,
            unitName: "Materials & Matter",
            durationMinutes: 18,
            sections: [
              {
                id: "c6-sci-ch2-s1",
                title: "Transparency, Translucency & Opacity",
                content: "Substances through which things can be seen clearly are transparent (glass). Those through which things cannot be seen are opaque (wood).",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
        ],
      },
      {
        id: "c6-social",
        name: "Social Studies",
        description: "Reading Maps, Globe Model, Land Forms of Andhra Pradesh & Early Civilizations",
        category: "social",
        icon: "public",
        chapters: [
          {
            id: "c6-soc-ch1",
            title: "Reading Maps of Different Kinds",
            description: "Symbols, physical maps, political maps, directions and map scale",
            order: 1,
            unitName: "Geography",
            durationMinutes: 18,
            learningGoals: [
              "Understand cardinal directions and compass bearings",
              "Interpret scale ratios and topographical symbols",
            ],
            sections: [
              {
                id: "c6-soc-ch1-s1",
                title: "Map Essentials & Scale",
                content: "A map is a representation or drawing of the Earth surface or a part of it drawn on a flat surface according to a scale.",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
          {
            id: "c6-soc-ch2",
            title: "Land Forms - Andhra Pradesh",
            description: "Mountains, plateaus, coastal plains and Krishna-Godavari deltas",
            order: 2,
            unitName: "AP Regional Geography",
            durationMinutes: 20,
            sections: [
              {
                id: "c6-soc-ch2-s1",
                title: "Coastal Plains & Delta Agriculture",
                content: "Andhra Pradesh has the second longest coastline in India (974 km) with fertile alluvial soils in the Godavari and Krishna delta basins.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================
  // CLASS 7 (SCERT AP - 6 Subjects)
  // ==========================================
  {
    id: "class-7",
    grade: 7,
    title: "Class 7",
    subtitle: "6 Core Subjects · General Science",
    badge: "AP SCERT",
    subjects: [
      {
        id: "c7-telugu",
        name: "Telugu (తెలుగు)",
        description: "చదువు, నాయనమ్మ, శతక సుధ మరియు మాయాకంబళి పాఠ్యాంశాలు",
        category: "languages",
        icon: "auto-stories",
        chapters: [
          {
            id: "c7-tel-ch1",
            title: "చదువు (Chaduvu)",
            description: "కొఱవి గోపరాజు రచించిన సింహాసన ద్వాత్రింశిక ఆధారిత విద్యా ప్రాశస్త్యం",
            order: 1,
            unitName: "ప్రాచీన పద్యం",
            durationMinutes: 20,
            sections: [
              {
                id: "c7-tel-ch1-s1",
                title: "విద్యా విశిష్టత & శ్లోక భావం",
                content: "చదువనివాడజ్ఞుండగు, చదివిన సదసద్వివేక చతురత గలుగున్. విద్య లేనివాడు జ్ఞానహీనుడు.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c7-hindi",
        name: "Hindi (हिंदी)",
        description: "हम पंछी उन्मुक्त गगन के, दादी माँ, हिमालय की बेटियां एवं कठपुतली",
        category: "languages",
        icon: "translate",
        chapters: [
          {
            id: "c7-hin-ch1",
            title: "हम पंछी उन्मुक्त गगन के",
            description: "शिवमंगल सिंह ‘सुमन’ द्वारा रचित स्वतंत्रता और स्वाभिमान का गीत",
            order: 1,
            unitName: "काव्य खंड",
            durationMinutes: 18,
            sections: [
              {
                id: "c7-hin-ch1-s1",
                title: "स्वतंत्रता का संदेश",
                content: "हम पंछी उन्मुक्त गगन के पिंजरबद्ध न गा पाएँगे, कनक-तीलियों से टकराकर पुलकित पंख टूट जाएँगे।",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
        ],
      },
      {
        id: "c7-english",
        name: "English",
        description: "Three Questions, A Gift of Chappals & The Rebel",
        category: "languages",
        icon: "menu-book",
        chapters: [
          {
            id: "c7-eng-ch1",
            title: "Three Questions",
            description: "Leo Tolstoy classic philosophical parable on presence, empathy, and duty",
            order: 1,
            unitName: "Honeycomb Prose",
            durationMinutes: 20,
            sections: [
              {
                id: "c7-eng-ch1-s1",
                title: "The King’s Query",
                content: "The king wished to know: what is the right time to begin everything? Who are the most necessary people? What is the most important thing to do?",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c7-maths",
        name: "Mathematics",
        description: "Integers, Fractions and Decimals, Data Handling, Simple Equations & Lines and Angles",
        category: "stem",
        icon: "calculate",
        chapters: [
          {
            id: "c7-m-ch1",
            title: "Integers",
            description: "Multiplication and division of positive and negative integers, closure and associativity",
            order: 1,
            unitName: "Number Systems",
            durationMinutes: 22,
            learningGoals: [
              "Multiply directed integers with negative signs",
              "Verify distributive law across signed terms",
            ],
            sections: [
              {
                id: "c7-m-ch1-s1",
                title: "Multiplication of Negative Integers",
                content: "The product of an even count of negative integers is positive; of an odd count is negative.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "(-a) × (-b) = +(a × b) and (-a) × b = -(a × b).",
              },
            ],
          },
          {
            id: "c7-m-ch2",
            title: "Simple Equations",
            description: "Linear algebraic statements, transposed terms and balance transformations",
            order: 2,
            unitName: "Algebra",
            durationMinutes: 20,
            sections: [
              {
                id: "c7-m-ch2-s1",
                title: "Solving Equations by Transposition",
                content: "When moving a term from one side of equality to the other, change addition to subtraction, and multiplication to division.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c7-science",
        name: "General Science",
        description: "Nutrition in Plants & Animals, Heat, Acids Bases and Salts & Respiration",
        category: "stem",
        icon: "science",
        chapters: [
          {
            id: "c7-sci-ch1",
            title: "Nutrition in Plants",
            description: "Autotrophic nutrition, chlorophyll function, photosynthesis equation and stomata",
            order: 1,
            unitName: "Life Science",
            durationMinutes: 20,
            sections: [
              {
                id: "c7-sci-ch1-s1",
                title: "Photosynthesis Mechanism",
                content: "Green plants synthesize carbohydrates from carbon dioxide and water in the presence of solar radiation and chlorophyll.",
                order: 1,
                durationMinutes: 10,
                keyAxiom: "6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2",
              },
            ],
          },
          {
            id: "c7-sci-ch2",
            title: "Heat and Temperature",
            description: "Conduction, convection, radiation and clinical versus laboratory thermometers",
            order: 2,
            unitName: "Physical Science",
            durationMinutes: 18,
            sections: [
              {
                id: "c7-sci-ch2-s1",
                title: "Modes of Heat Transfer",
                content: "Conduction occurs primarily in solids, convection in fluids, and radiation through vacuum without medium.",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
        ],
      },
      {
        id: "c7-social",
        name: "Social Studies",
        description: "Rain and Rivers, Tanks & Groundwater, Kakatiya Kingdom & Vijayanagara Empire",
        category: "social",
        icon: "public",
        chapters: [
          {
            id: "c7-soc-ch1",
            title: "Rain and Rivers",
            description: "Water cycle, evaporation, monsoon winds and Andhra Pradesh river basins",
            order: 1,
            unitName: "Geography & Hydrology",
            durationMinutes: 20,
            sections: [
              {
                id: "c7-soc-ch1-s1",
                title: "River Basins of Godavari & Krishna",
                content: "The Godavari and Krishna originate in the Western Ghats and flow eastwards across Andhra Pradesh into the Bay of Bengal.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================
  // CLASS 8 (SCERT AP - 7 Subjects)
  // Split Physical & Biological Science
  // ==========================================
  {
    id: "class-8",
    grade: 8,
    title: "Class 8",
    subtitle: "7 Core Subjects · AP SCERT",
    badge: "Active Grade",
    subjects: [
      {
        id: "c8-telugu",
        name: "Telugu (తెలుగు)",
        description: "ఆంధ్ర వైభవం, మాతృభూమి, శతక సౌరభం మరియు త్యాగనిరతి",
        category: "languages",
        icon: "auto-stories",
        chapters: [
          {
            id: "c8-tel-ch1",
            title: "ఆంధ్ర వైభవం (Andhra Vaibhavam)",
            description: "తెలుగు జాతి సాంస్కృతిక వైభవం, చారిత్రక ప్రాశస్త్యం మరియు కవుల కీర్తి",
            order: 1,
            unitName: "కవితా విభాగం",
            durationMinutes: 20,
            learningGoals: [
              "తెలుగు నేల చారిత్రక ఘనతను తెలుసుకోవడం",
              "అమరావతి, లేపాక్షి శిల్పకళా సంపదను గ్రహించడం",
            ],
            sections: [
              {
                id: "c8-tel-ch1-s1",
                title: "తెలుగు సంస్కృతి & శిల్పకళ",
                content: "తెలుగు నేల పుణ్యభూమి. కాకతీయులు, విజయనగర రాజులు మరియు శాతవాహనుల పాలనలో తెలుగు సాహిత్యం, కళలు విలసిల్లాయి.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
          {
            id: "c8-tel-ch2",
            title: "శతక సౌరభం (Sathaka Sourabham)",
            description: "సుమతి, వేమన మరియు భాస్కర శతకాలలోని నైతిక పద్యాలు",
            order: 2,
            unitName: "నైతిక విలువలు",
            durationMinutes: 18,
            sections: [
              {
                id: "c8-tel-ch2-s1",
                title: "నీతి పద్యాలు & మకుటం",
                content: "శతక పద్యాలలో ప్రతి పద్యం చివర ఒక మకుటం ఉంటుంది. ఇది మానవ జీవన విధానానికి ఆదర్శాలను అందిస్తుంది.",
                order: 1,
                durationMinutes: 9,
              },
            ],
          },
        ],
      },
      {
        id: "c8-hindi",
        name: "Hindi (हिंदी)",
        description: "ध्वनि (निराला), लाख की चूड़ियाँ, बस की यात्रा एवं दीवानों की हस्ती",
        category: "languages",
        icon: "translate",
        chapters: [
          {
            id: "c8-hin-ch1",
            title: "ध्वनि (सूर्यकांत त्रिपाठी ‘निराला’)",
            description: "युवा पीढ़ी में उत्साह और नवजीवन का संचार करने वाली प्रेरणादायी कविता",
            order: 1,
            unitName: "वसंत भाग-3",
            durationMinutes: 18,
            learningGoals: [
              "निराला जी की काव्य भाषा और प्रतीकात्मकता समझना",
              "आलस्य त्यागकर कर्मठ बनने की प्रेरणा पाना",
            ],
            sections: [
              {
                id: "c8-hin-ch1-s1",
                title: "कविता का भावार्थ",
                content: "अभी न होगा मेरा अंत, अभी-अभी ही तो आया है मेरे वन में मृदुल वसंत। कवि जीवन में आशा और नवचेतना का संचार करते हैं।",
                order: 1,
                durationMinutes: 9,
                keyAxiom: "वसंत ऋतु नव-सृजन और ऊर्जा का प्रतीक है।",
              },
            ],
          },
          {
            id: "c8-hin-ch2",
            title: "लाख की चूड़ियाँ (कामतानाथ)",
            description: "मशीनी युग के कारण लुप्त होते हस्तशिल्प और कारीगर बदलू का स्वाभिमान",
            order: 2,
            unitName: "कहानी",
            durationMinutes: 20,
            sections: [
              {
                id: "c8-hin-ch2-s1",
                title: "बदलू काका का स्वाभिमान",
                content: "बदलू मनिहार था जो लाख की चूड़ियाँ बनाता था। मशीनी काँच की चूड़ियों के आगमन से उसका व्यवसाय ठप हो गया, फिर भी उसने स्वाभिमान नहीं खोया।",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c8-english",
        name: "English",
        description: "The Best Christmas Present, The Tsunami, Glimpses of the Past & Bepin Choudhury",
        category: "languages",
        icon: "menu-book",
        chapters: [
          {
            id: "c8-eng-ch1",
            title: "The Best Christmas Present in the World",
            description: "World War I Christmas truce of 1914 between British and German troops",
            order: 1,
            unitName: "Honeydew Prose",
            durationMinutes: 22,
            learningGoals: [
              "Appreciate universal brotherhood transcending armed conflict",
              "Analyze letter narration and historical context",
            ],
            sections: [
              {
                id: "c8-eng-ch1-s1",
                title: "The Roll-Top Desk & Connie’s Letter",
                content: "The author purchased an old roll-top desk in Bridport and discovered Jim Macpherson poignant letter describing the Christmas truce in No Man Land.",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
          {
            id: "c8-eng-ch2",
            title: "The Ant and the Cricket",
            description: "Aesop fable illustrating foresighted diligence versus carefree procrastination",
            order: 2,
            unitName: "Poetry",
            durationMinutes: 16,
            sections: [
              {
                id: "c8-eng-ch2-s1",
                title: "Fable Rhyme & Moral",
                content: "A silly young cricket sang through warm months and found empty cupboards in winter. The ant advised him to dance the winter away.",
                order: 1,
                durationMinutes: 8,
              },
            ],
          },
        ],
      },
      {
        id: "c8-maths",
        name: "Mathematics",
        description: "Rational Numbers, Linear Equations, Quadrilaterals, Data Handling & Square Roots",
        category: "stem",
        icon: "calculate",
        chapters: [
          {
            id: "c8-m-ch1",
            title: "Rational Numbers",
            description: "Closure, commutativity, associativity, distributive property and number line representation",
            order: 1,
            unitName: "Number Systems",
            durationMinutes: 24,
            learningGoals: [
              "Verify arithmetic properties across Rational Numbers Q",
              "Compute multiplicative and additive inverses",
              "Find rational numbers between any two given numbers",
            ],
            sections: [
              {
                id: "c8-m-ch1-s1",
                title: "Introduction to Rational Numbers",
                content: "A number that can be written in the form p/q, where p and q are integers and q is non-zero, is called a rational number.",
                order: 1,
                durationMinutes: 6,
                keyAxiom: "Definition: Q = { p/q | p, q in Z, q != 0 }",
              },
              {
                id: "c8-m-ch1-s2",
                title: "Properties of Rational Numbers",
                content: "Rational numbers are closed under addition, subtraction, and multiplication. Division by zero is not defined.",
                order: 2,
                durationMinutes: 7,
                keyAxiom: "Distributivity: a(b + c) = ab + ac",
              },
              {
                id: "c8-m-ch1-s3",
                title: "Representation on Number Line",
                content: "Divide unit intervals into equal sub-segments matching denominator q to plot p/q.",
                order: 3,
                durationMinutes: 5,
              },
              {
                id: "c8-m-ch1-s4",
                title: "Practice Problems & Master Quiz",
                content: "Worked textbook problems testing additive inverse, reciprocal multiplications, and multi-step equations.",
                order: 4,
                durationMinutes: 6,
              },
            ],
            quiz: {
              question: "What is the additive inverse of -7/19?",
              options: ["19/7", "7/19", "-19/7", "0"],
              correctIndex: 1,
              explanation: "The additive inverse of a rational number a is -a such that a + (-a) = 0. Therefore, -(-7/19) = 7/19.",
            },
          },
          {
            id: "c8-m-ch2",
            title: "Linear Equations in One Variable",
            description: "Solving equations with variable terms on one side and both sides",
            order: 2,
            unitName: "Algebra",
            durationMinutes: 22,
            sections: [
              {
                id: "c8-m-ch2-s1",
                title: "Equations with Variables on One Side",
                content: "Linear equations have highest power 1. Solve using transposition and balanced operations.",
                order: 1,
                durationMinutes: 7,
              },
              {
                id: "c8-m-ch2-s2",
                title: "Equations with Variables on Both Sides",
                content: "Group all variable terms onto the left-hand side and constants onto the right-hand side.",
                order: 2,
                durationMinutes: 8,
              },
              {
                id: "c8-m-ch2-s3",
                title: "Practical Word Problems",
                content: "Formulating algebraic equations from perimeter, age, and speed word scenarios.",
                order: 3,
                durationMinutes: 7,
              },
            ],
          },
          {
            id: "c8-m-ch3",
            title: "Understanding Quadrilaterals",
            description: "Convex polygons, interior angle sums, and properties of parallelograms and rhombuses",
            order: 3,
            unitName: "Geometry",
            durationMinutes: 20,
            sections: [
              {
                id: "c8-m-ch3-s1",
                title: "Polygons & Angle Sum Property",
                content: "The sum of the measures of the external angles of any polygon is always 360 degrees. Interior angle sum = (n - 2) * 180.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c8-pscience",
        name: "Physical Science",
        description: "Force, Friction, Synthetic Fibres, Metals and Non-Metals, Sound & Light (భౌతిక రసాయన శాస్త్రం)",
        category: "stem",
        icon: "bolt",
        chapters: [
          {
            id: "c8-ps-ch1",
            title: "Force and Pressure",
            description: "Contact and non-contact forces, atmospheric pressure, and liquid manometer pressure",
            order: 1,
            unitName: "Physics",
            durationMinutes: 22,
            learningGoals: [
              "Differentiate between contact (muscular, friction) and non-contact (magnetic, electrostatic, gravitational) forces",
              "Calculate pressure using Formula P = Force / Area",
              "Demonstrate atmospheric pressure through standard barometric phenomena",
            ],
            sections: [
              {
                id: "c8-ps-ch1-s1",
                title: "Force: A Push or a Pull",
                content: "A force arises due to interaction between two objects. A force has both magnitude and direction. It can alter an object state of motion or shape.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "Pressure = Force / Area. Unit: Pascal (N/m²).",
              },
              {
                id: "c8-ps-ch1-s2",
                title: "Atmospheric & Liquid Pressure",
                content: "The pressure exerted by the air column above us is atmospheric pressure. Liquids exert pressure equally in all directions at a given depth.",
                order: 2,
                durationMinutes: 11,
              },
            ],
          },
          {
            id: "c8-ps-ch2",
            title: "Friction",
            description: "Static, sliding, and rolling friction, causes of friction and fluid drag",
            order: 2,
            unitName: "Physics",
            durationMinutes: 20,
            sections: [
              {
                id: "c8-ps-ch2-s1",
                title: "Types of Friction & Interlocking",
                content: "Friction is caused by the interlocking of microscopic irregularities on two contacting surfaces. Static friction > Sliding friction > Rolling friction.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
          {
            id: "c8-ps-ch3",
            title: "Metals and Non-Metals",
            description: "Malleability, ductility, electrical conductivity and chemical displacement reactions",
            order: 3,
            unitName: "Chemistry",
            durationMinutes: 22,
            sections: [
              {
                id: "c8-ps-ch3-s1",
                title: "Physical & Chemical Properties",
                content: "Metals are generally lustrous, malleable, ductile, sonorous, and good conductors of heat and electricity. Non-metals lack these properties.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "Metal + Oxygen -> Metal Oxide (Basic in nature).",
              },
            ],
          },
        ],
      },
      {
        id: "c8-bscience",
        name: "Biological Science",
        description: "Cell Structure, Microorganisms, Reproduction in Animals & Biodiversity (జీవ శాస్త్రం)",
        category: "stem",
        icon: "eco",
        chapters: [
          {
            id: "c8-bs-ch1",
            title: "Cell - Structure and Functions",
            description: "Discovery of cells by Robert Hooke, cell membrane, cytoplasm, nucleus and organelles",
            order: 1,
            unitName: "Cytology",
            durationMinutes: 22,
            learningGoals: [
              "Understand cell as the fundamental structural and functional unit of all living organisms",
              "Differentiate plant cells and animal cells (cell wall, plastids, vacuole)",
            ],
            sections: [
              {
                id: "c8-bs-ch1-s1",
                title: "Discovery of Cell & Microscopy",
                content: "Robert Hooke in 1665 observed thin cork slices under a primitive microscope and coined the term cell. Schleiden and Schwann formulated the Cell Theory.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "Omnis cellula e cellula: All cells arise from pre-existing cells.",
              },
              {
                id: "c8-bs-ch1-s2",
                title: "Plant Cell vs Animal Cell",
                content: "Plant cells possess a rigid outer cellulose cell wall, large central vacuoles, and chloroplasts. Animal cells have only a flexible cell membrane.",
                order: 2,
                durationMinutes: 11,
              },
            ],
          },
          {
            id: "c8-bs-ch2",
            title: "The Story of Microorganisms",
            description: "Bacteria, fungi, protozoa, algae, commercial fermentation and disease prevention",
            order: 2,
            unitName: "Microbiology",
            durationMinutes: 20,
            sections: [
              {
                id: "c8-bs-ch2-s1",
                title: "Friendly Microorganisms & Pasteurization",
                content: "Louis Pasteur in 1857 discovered fermentation. Alexander Fleming discovered penicillin in 1929 from Penicillium notatum.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c8-social",
        name: "Social Studies",
        description: "Reading Maps, Energy from the Sun, Indian Constitution & National Movement",
        category: "social",
        icon: "public",
        chapters: [
          {
            id: "c8-soc-ch1",
            title: "The Indian Constitution",
            description: "Preamble, Fundamental Rights, Separation of Powers, Federalism and Secularism",
            order: 1,
            unitName: "Civics & Governance",
            durationMinutes: 22,
            learningGoals: [
              "Examine the core democratic ideals enshrined in the Preamble",
              "Understand the 6 Fundamental Rights guaranteed under the Constitution",
            ],
            sections: [
              {
                id: "c8-soc-ch1-s1",
                title: "The Preamble & Key Features",
                content: "Drafted by the Constituent Assembly under Dr. B.R. Ambedkar. The Constitution provides a federal structure with independent judiciary and checks on executive authority.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "Preamble: Sovereign, Socialist, Secular, Democratic Republic guaranteeing Justice, Liberty, Equality, Fraternity.",
              },
            ],
          },
          {
            id: "c8-soc-ch2",
            title: "National Movement - Towards Independence",
            description: "1857 revolt, Indian National Congress formation, Gandhi era, and 1947 independence",
            order: 2,
            unitName: "History",
            durationMinutes: 20,
            sections: [
              {
                id: "c8-soc-ch2-s1",
                title: "Non-Cooperation & Salt Satyagraha",
                content: "Mahatma Gandhi transformed the freedom struggle into a mass movement through Satyagraha, Ahimsa, and non-violent civil disobedience.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================
  // CLASS 9 (SCERT AP - 7 Subjects)
  // Split Physical & Biological Science
  // ==========================================
  {
    id: "class-9",
    grade: 9,
    title: "Class 9",
    subtitle: "7 Core Subjects · AP SCERT",
    badge: "Secondary",
    subjects: [
      {
        id: "c9-telugu",
        name: "Telugu (తెలుగు)",
        description: "ధర్మార్జునులు, స్వభాష, ప్రేరణ మరియు శివతాండవం",
        category: "languages",
        icon: "auto-stories",
        chapters: [
          {
            id: "c9-tel-ch1",
            title: "ధర్మార్జునులు (Dharmarjunulu)",
            description: "చేమకూర వేంకటకవి రచించిన విజయవిలాసం ఆధారిత పద్య పాఠం",
            order: 1,
            unitName: "ప్రబంధ కవిత్వం",
            durationMinutes: 20,
            sections: [
              {
                id: "c9-tel-ch1-s1",
                title: "ధర్మరాజు & అర్జునుల సుగుణాలు",
                content: "పాండవుల ధర్మనిరతి, సౌభ్రాతృత్వం మరియు పరాక్రమాల ప్రశంస.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c9-hindi",
        name: "Hindi (हिंदी)",
        description: "दो बैलों की कथा (प्रेमचंद), ल्हासा की ओर एवं साखियाँ व सबद (कबीर)",
        category: "languages",
        icon: "translate",
        chapters: [
          {
            id: "c9-hin-ch1",
            title: "दो बैलों की कथा (मुंशी प्रेमचंद)",
            description: "हीरा और मोती का स्वाभिमान, स्वतंत्रता-प्रेम और पशु-मानव आत्मीयता",
            order: 1,
            unitName: "क्षितिज गद्य",
            durationMinutes: 22,
            sections: [
              {
                id: "c9-hin-ch1-s1",
                title: "हीरा और मोती की मित्रता",
                content: "जानवरों में गधा सबसे ज्यादा बुद्धिहीन समझा जाता है। झूरी के दो बैल हीरा और मोती सीधे, सरल और स्वाभिमानी थे।",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
        ],
      },
      {
        id: "c9-english",
        name: "English",
        description: "The Fun They Had, The Sound of Music, The Little Girl & A Truly Beautiful Mind",
        category: "languages",
        icon: "menu-book",
        chapters: [
          {
            id: "c9-eng-ch1",
            title: "The Fun They Had",
            description: "Isaac Asimov futuristic vision of mechanical schooling in the year 2157",
            order: 1,
            unitName: "Beehive Prose",
            durationMinutes: 20,
            sections: [
              {
                id: "c9-eng-ch1-s1",
                title: "Margie & Tommy Real Book",
                content: "Margie wrote about the real book found in Tommy attic. The printed words stood still instead of moving on a screen.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c9-maths",
        name: "Mathematics",
        description: "Number Systems, Polynomials, Coordinate Geometry, Linear Equations & Triangles",
        category: "stem",
        icon: "calculate",
        chapters: [
          {
            id: "c9-m-ch1",
            title: "Number Systems",
            description: "Real numbers, irrational proofs, decimal expansions, laws of exponents for real powers",
            order: 1,
            unitName: "Real Analysis",
            durationMinutes: 24,
            sections: [
              {
                id: "c9-m-ch1-s1",
                title: "Irrational Numbers on the Real Line",
                content: "Numbers with non-terminating non-repeating decimal representations are irrational (sqrt(2), pi, e).",
                order: 1,
                durationMinutes: 12,
                keyAxiom: "Square root spiral construction: Hypotenuse = sqrt(1^2 + (sqrt(n))^2).",
              },
            ],
          },
          {
            id: "c9-m-ch2",
            title: "Polynomials",
            description: "Zeroes of polynomials, remainder theorem, factor theorem and algebraic identities",
            order: 2,
            unitName: "Algebra",
            durationMinutes: 22,
            sections: [
              {
                id: "c9-m-ch2-s1",
                title: "Standard Algebraic Identities",
                content: "(x + y + z)^2 = x^2 + y^2 + z^2 + 2xy + 2yz + 2zx.",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
        ],
      },
      {
        id: "c9-pscience",
        name: "Physical Science",
        description: "Motion, Laws of Motion, Gravitation, Work & Energy, Sound, Matter in our Surroundings (భౌతిక రసాయన శాస్త్రం)",
        category: "stem",
        icon: "bolt",
        chapters: [
          {
            id: "c9-ps-ch1",
            title: "Motion",
            description: "Distance vs displacement, speed, velocity, uniform acceleration and equations of motion",
            order: 1,
            unitName: "Kinematics",
            durationMinutes: 24,
            sections: [
              {
                id: "c9-ps-ch1-s1",
                title: "Three Kinematic Equations of Motion",
                content: "For constant acceleration a: 1) v = u + at, 2) s = ut + (1/2)at^2, 3) v^2 - u^2 = 2as.",
                order: 1,
                durationMinutes: 12,
                keyAxiom: "Equations: v = u + at; s = ut + 0.5at^2; v^2 - u^2 = 2as",
              },
            ],
          },
          {
            id: "c9-ps-ch2",
            title: "Force and Laws of Motion",
            description: "Newton three laws of motion, inertia, momentum and law of conservation of momentum",
            order: 2,
            unitName: "Dynamics",
            durationMinutes: 22,
            sections: [
              {
                id: "c9-ps-ch2-s1",
                title: "Newton Laws & Momentum",
                content: "Second Law: Force equals rate of change of momentum (F = dp/dt = ma). Action and reaction are equal and opposite.",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
        ],
      },
      {
        id: "c9-bscience",
        name: "Biological Science",
        description: "Cell Structure, Plant & Animal Tissues, Diversity in Living Organisms (జీవ శాస్త్రం)",
        category: "stem",
        icon: "eco",
        chapters: [
          {
            id: "c9-bs-ch1",
            title: "Tissues - Plant and Animal",
            description: "Meristematic, permanent, parenchyma, collenchyma, sclerenchyma, xylem, phloem and epithelial tissues",
            order: 1,
            unitName: "Histology",
            durationMinutes: 22,
            sections: [
              {
                id: "c9-bs-ch1-s1",
                title: "Complex Permanent Tissues (Xylem & Phloem)",
                content: "Xylem transports water and minerals unidirectionally from roots to leaves. Phloem translocates food bidirectionally.",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
        ],
      },
      {
        id: "c9-social",
        name: "Social Studies",
        description: "Our Earth, Natural Realms, Agriculture in India & Democratic Rights",
        category: "social",
        icon: "public",
        chapters: [
          {
            id: "c9-soc-ch1",
            title: "Our Earth & Lithosphere",
            description: "Plate tectonics, continental drift, internal structure of Earth and seismic waves",
            order: 1,
            unitName: "Physical Geography",
            durationMinutes: 20,
            sections: [
              {
                id: "c9-soc-ch1-s1",
                title: "Earth Crust, Mantle and Core",
                content: "The Earth interior consists of three concentric layers: Crust (0-100 km), Mantle (up to 2,900 km), and Core (outer liquid, inner solid nickel-iron).",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    ],
  },

  // ==========================================
  // CLASS 10 (SCERT AP - SSC Board - 7 Subjects)
  // Split Physical & Biological Science
  // ==========================================
  {
    id: "class-10",
    grade: 10,
    title: "Class 10",
    subtitle: "7 Core Subjects · AP SSC Board",
    badge: "Board Exam",
    subjects: [
      {
        id: "c10-telugu",
        name: "Telugu (తెలుగు)",
        description: "మాతృభావన, అమరావతి, జానపదుని జాబు, ధన్యుడు మరియు శతక మధురిమ",
        category: "languages",
        icon: "auto-stories",
        chapters: [
          {
            id: "c10-tel-ch1",
            title: "మాతృభావన (Mathrubhavana)",
            description: "గడియారం వేంకట శేషశాస్త్రి రచించిన శివభారతం ఆధారిత స్త్రీ గౌరవ కావ్యం",
            order: 1,
            unitName: "కావ్య ఖండం",
            durationMinutes: 22,
            learningGoals: [
              "ఛత్రపతి శివాజీ మహారాజు స్త్రీల పట్ల కనబరచిన గౌరవాన్ని ఆదర్శంగా గ్రహించడం",
              "ఉత్పలమాల, చంపకమాల ఛందో విశేషాలు అర్థం చేసుకోవడం",
            ],
            sections: [
              {
                id: "c10-tel-ch1-s1",
                title: "శివాజీ ఔదార్యం & మాతృభావన",
                content: "సోన్‌దేవుడు కళ్యాణీ దుర్గాన్ని జయించి బందీగా తెచ్చిన సుబేదారు కోడలిని శివాజీ తల్లిగా భావించి గౌరవప్రదంగా సాగనంపిన వైనం.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "పరస్త్రీలను తల్లులుగా గౌరవించడమే భారతీయ సనాతన సంస్కార విశిష్టత.",
              },
            ],
          },
          {
            id: "c10-tel-ch2",
            title: "అమరావతి (Amaravathi)",
            description: "ఆంధ్రప్రదేశ్ చారిత్రక రాజధాని అమరావతి శిల్పకళ, బౌద్ధ స్తూపాలు మరియు సాంస్కృతిక వైభవం",
            order: 2,
            unitName: "చారిత్రక వైభవం",
            durationMinutes: 20,
            sections: [
              {
                id: "c10-tel-ch2-s1",
                title: "శాతవాహనుల రాజధాని & బౌద్ధ శిల్ప సంపద",
                content: "ధాన్యకటకం (అమరావతి) శాతవాహనుల రాజధానిగా విరాజిల్లినది. ఆచార్య నాగార్జునుని విజ్ఞాన కేంద్రంగా అంతర్జాతీయ కీర్తి నార్జించినది.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
      {
        id: "c10-hindi",
        name: "Hindi (हिंदी)",
        description: "साखी (कबीर), पद (मीराबाई), बड़े भाई साहब (प्रेमचंद) एवं डायरी का एक पन्ना",
        category: "languages",
        icon: "translate",
        chapters: [
          {
            id: "c10-hin-ch1",
            title: "साखी (कबीरदास)",
            description: "ईश्वर-भक्ति, ज्ञान, अहंकार-मुक्ति और प्रेम की महत्ता दर्शाने वाले अनमोल दोहे",
            order: 1,
            unitName: "स्पर्श पद्य खंड",
            durationMinutes: 20,
            sections: [
              {
                id: "c10-hin-ch1-s1",
                title: "कबीर की साखियों का भावार्थ",
                content: "ऐसी बानी बोलिए, मन का आपा खोइ। औरन को सीतल करै, आपहु सीतल होइ। मधुर वाणी से आत्म-संतुष्टि और दूसरों को शांति मिलती है।",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
          {
            id: "c10-hin-ch2",
            title: "बड़े भाई साहब (मुंशी प्रेमचंद)",
            description: "शिक्षा प्रणाली पर व्यंग्य तथा बड़े भाई के त्याग और मनोवैज्ञानिक अंतर्द्वंद्व की कहानी",
            order: 2,
            unitName: "स्पर्श गद्य",
            durationMinutes: 22,
            sections: [
              {
                id: "c10-hin-ch2-s1",
                title: "बड़े भाई का अनुभव और नसीहत",
                content: "किताबी ज्ञान से अधिक जीवन का व्यावहारिक अनुभव महत्वपूर्ण होता है।",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
        ],
      },
      {
        id: "c10-english",
        name: "English",
        description: "A Letter to God, Nelson Mandela: Long Walk to Freedom & Two Stories About Flying",
        category: "languages",
        icon: "menu-book",
        chapters: [
          {
            id: "c10-eng-ch1",
            title: "A Letter to God",
            description: "Gregorio Lopez y Fuentes story of Lencho unwavering faith in the Almighty",
            order: 1,
            unitName: "First Flight Prose",
            durationMinutes: 22,
            learningGoals: [
              "Analyze irony in literature and human character contradictions",
              "Understand resilience and absolute faith under adversity",
            ],
            sections: [
              {
                id: "c10-eng-ch1-s1",
                title: "The Hailstorm & The Hundred Pesos",
                content: "A catastrophic hailstorm destroyed Lencho entire cornfield. With complete faith, he wrote a direct letter to God demanding one hundred pesos to sow again.",
                order: 1,
                durationMinutes: 11,
                keyAxiom: "Irony: Lencho suspected the compassionate postmaster and clerks as a bunch of crooks.",
              },
            ],
          },
          {
            id: "c10-eng-ch2",
            title: "Nelson Mandela: Long Walk to Freedom",
            description: "Historic presidential inauguration speech in Pretoria dismantling Apartheid",
            order: 2,
            unitName: "Autobiography",
            durationMinutes: 24,
            sections: [
              {
                id: "c10-eng-ch2-s1",
                title: "10th May 1994 - Freedom from Apartheid",
                content: "Never, never, and never again shall it be that this beautiful land will again experience the oppression of one by another.",
                order: 1,
                durationMinutes: 12,
              },
            ],
          },
        ],
      },
      {
        id: "c10-maths",
        name: "Mathematics",
        description: "Real Numbers, Sets, Polynomials, Linear Equations, Quadratic Equations, Progressions & Trigonometry",
        category: "stem",
        icon: "calculate",
        chapters: [
          {
            id: "c10-m-ch1",
            title: "Real Numbers",
            description: "Euclid Division Lemma, Fundamental Theorem of Arithmetic, irrationality of sqrt(p), logarithms",
            order: 1,
            unitName: "Number Theory",
            durationMinutes: 24,
            learningGoals: [
              "Apply Euclid Division Algorithm to find HCF",
              "State and apply Fundamental Theorem of Arithmetic for LCM and HCF",
              "Prove irrationality of sqrt(2), sqrt(3), and sqrt(5)",
            ],
            sections: [
              {
                id: "c10-m-ch1-s1",
                title: "Fundamental Theorem of Arithmetic",
                content: "Every composite number can be uniquely expressed as a product of prime powers, apart from the order of factors.",
                order: 1,
                durationMinutes: 12,
                keyAxiom: "Theorem: HCF(a, b) * LCM(a, b) = a * b",
              },
              {
                id: "c10-m-ch1-s2",
                title: "Logarithmic Properties & Bases",
                content: "log_a(xy) = log_a(x) + log_a(y) and log_a(x/y) = log_a(x) - log_a(y).",
                order: 2,
                durationMinutes: 12,
              },
            ],
          },
          {
            id: "c10-m-ch2",
            title: "Introduction to Trigonometry",
            description: "Trigonometric ratios of acute angles, standard angles (0, 30, 45, 60, 90) and Pythagorean identities",
            order: 2,
            unitName: "Trigonometry",
            durationMinutes: 26,
            sections: [
              {
                id: "c10-m-ch2-s1",
                title: "Pythagorean Trigonometric Identities",
                content: "sin^2(theta) + cos^2(theta) = 1; sec^2(theta) - tan^2(theta) = 1; cosec^2(theta) - cot^2(theta) = 1.",
                order: 1,
                durationMinutes: 13,
                keyAxiom: "sin^2(theta) + cos^2(theta) = 1 for all 0 <= theta <= 90 deg.",
              },
            ],
          },
        ],
      },
      {
        id: "c10-pscience",
        name: "Physical Science",
        description: "Heat, Chemical Reactions, Acids & Bases, Refraction at Curved Surfaces, Periodic Table & Chemical Bonding (భౌతిక రసాయన శాస్త్రం)",
        category: "stem",
        icon: "bolt",
        chapters: [
          {
            id: "c10-ps-ch1",
            title: "Heat and Specific Heat Capacity",
            description: "Thermal equilibrium, temperature, specific heat Q = mc(delta_T), latent heat and evaporation",
            order: 1,
            unitName: "Thermal Physics",
            durationMinutes: 24,
            learningGoals: [
              "Differentiate between heat as energy in transit and temperature as thermal state",
              "Derive Principle of Method of Mixtures: Heat lost by hot body = Heat gained by cold body",
            ],
            sections: [
              {
                id: "c10-ps-ch1-s1",
                title: "Specific Heat & Method of Mixtures",
                content: "The amount of heat required to raise the temperature of 1 gram of substance by 1 degree C is its specific heat. Water has very high specific heat (1 cal/g-deg C).",
                order: 1,
                durationMinutes: 12,
                keyAxiom: "Formula: Q = m * s * Delta_T. Unit of s: cal/g-C or J/kg-K.",
              },
            ],
          },
          {
            id: "c10-ps-ch2",
            title: "Chemical Reactions and Equations",
            description: "Writing and balancing chemical equations, types of reactions, oxidation-reduction and corrosion",
            order: 2,
            unitName: "Inorganic Chemistry",
            durationMinutes: 22,
            sections: [
              {
                id: "c10-ps-ch2-s1",
                title: "Types of Chemical Reactions",
                content: "1) Chemical Combination, 2) Chemical Decomposition, 3) Displacement, 4) Double Displacement, 5) Redox (Oxidation and Reduction).",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
          {
            id: "c10-ps-ch3",
            title: "Refraction of Light at Curved Surfaces",
            description: "Convex and concave lenses, lens maker formula, sign convention and image ray diagrams",
            order: 3,
            unitName: "Optics",
            durationMinutes: 24,
            sections: [
              {
                id: "c10-ps-ch3-s1",
                title: "Lens Formula & Sign Conventions",
                content: "1/f = 1/v - 1/u. Magnification m = v/u = h_image / h_object.",
                order: 1,
                durationMinutes: 12,
                keyAxiom: "Lens Maker Formula: 1/f = (n - 1) * (1/R1 - 1/R2).",
              },
            ],
          },
        ],
      },
      {
        id: "c10-bscience",
        name: "Biological Science",
        description: "Nutrition, Respiration, Transportation, Excretion, Coordination, Reproduction & Heredity (జీవ శాస్త్రం)",
        category: "stem",
        icon: "eco",
        chapters: [
          {
            id: "c10-bs-ch1",
            title: "Nutrition - Food Supplying System",
            description: "Autotrophic and heterotrophic nutrition, light and dark reactions of photosynthesis, human digestive system and malnutrition",
            order: 1,
            unitName: "Physiology",
            durationMinutes: 24,
            learningGoals: [
              "Master chlorophyll absorption and light reaction stages in thylakoids",
              "Understand peristalsis and human enzyme action (pepsin, amylase, lipase)",
            ],
            sections: [
              {
                id: "c10-bs-ch1-s1",
                title: "Photosynthesis: Photolysis of Water",
                content: "In the light reaction (Hill Reaction), chlorophyll absorbs photon energy to split water into H+ and OH- ions, liberating oxygen.",
                order: 1,
                durationMinutes: 12,
                keyAxiom: "Equation: 6CO2 + 12H2O --(Light/Chlorophyll)--> C6H12O6 + 6H2O + 6O2",
              },
            ],
          },
          {
            id: "c10-bs-ch2",
            title: "Respiration - The Energy Producing System",
            description: "Aerobic vs anaerobic respiration, glycolysis, Krebs cycle, human respiratory tract and lung alveoli gas exchange",
            order: 2,
            unitName: "Physiology",
            durationMinutes: 22,
            sections: [
              {
                id: "c10-bs-ch2-s1",
                title: "Aerobic & Anaerobic Respiration Pathways",
                content: "Glycolysis in cytoplasm yields pyruvate. In presence of oxygen, mitochondria produce 36 or 38 ATP molecules.",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
        ],
      },
      {
        id: "c10-social",
        name: "Social Studies",
        description: "India: Relief Features, Ideas of Development, Production & Employment, Climate & Globalization",
        category: "social",
        icon: "public",
        chapters: [
          {
            id: "c10-soc-ch1",
            title: "India: Relief Features",
            description: "Himalayas, Indo-Gangetic Plains, Peninsular Plateau, Coastal Plains and Thar Desert",
            order: 1,
            unitName: "Indian Geography",
            durationMinutes: 22,
            learningGoals: [
              "Locate the three Himalayan parallel ranges (Himadri, Himachal, Shivaliks)",
              "Understand the formation of the Deccan Plateau and Western/Eastern Ghats",
            ],
            sections: [
              {
                id: "c10-soc-ch1-s1",
                title: "The Himalayan Ranges & Indo-Gangetic Basin",
                content: "India physical relief is classified into 6 major divisions: 1) The Himalayas, 2) The Indo-Gangetic Plain, 3) The Peninsular Plateau, 4) The Coastal Plains, 5) The Thar Desert, 6) The Islands.",
                order: 1,
                durationMinutes: 11,
              },
            ],
          },
          {
            id: "c10-soc-ch2",
            title: "Ideas of Development",
            description: "Per capita income, Human Development Index (HDI), public facilities and sustainability",
            order: 2,
            unitName: "Economics",
            durationMinutes: 20,
            sections: [
              {
                id: "c10-soc-ch2-s1",
                title: "Income & Beyond: HDI Measures",
                content: "Development involves freedom, security, respect, education, and health. The UNDP computes Human Development Index based on life expectancy, schooling, and per capita GNI.",
                order: 1,
                durationMinutes: 10,
              },
            ],
          },
        ],
      },
    ],
  },
];
