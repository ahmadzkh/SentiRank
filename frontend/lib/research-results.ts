export const TBD_VALUE = "TBD";

export const researchResults = {
  datasetSummary: {
    sourceName: "Spotify Play Store",
    sourcePackage: "com.spotify.music",
    sourceId: "google_play_spotify_id",
    appTitle: "Spotify: Music dan Podcast",
    totalReviews: 97782,
    dateRange: {
      start: "2014-07-06T20:34:44",
      end: "2026-05-13T02:16:04",
    },
    ratingDistribution: [
      { rating: 1, count: 20000, percentage: 20.45 },
      { rating: 2, count: 15000, percentage: 15.34 },
      { rating: 3, count: 27782, percentage: 28.41 },
      { rating: 4, count: 15000, percentage: 15.34 },
      { rating: 5, count: 20000, percentage: 20.45 },
    ],
    initialLabelDistribution: [
      { label: "Negative", count: 35000, percentage: 35.79 },
      { label: "Neutral", count: 27782, percentage: 28.41 },
      { label: "Positive", count: 35000, percentage: 35.79 },
    ],
    finalLabelDistribution: [
      { label: "Negative", count: 39686, percentage: 40.59 },
      { label: "Neutral", count: 17629, percentage: 18.03 },
      { label: "Positive", count: 40467, percentage: 41.38 },
    ],
    duplicateSummary: {
      duplicateExternalIdCount: 0,
      conflictingDuplicateTextCount: 0,
      note: "Tidak ada duplicate external_id pada audit akuisisi data.",
    },
    missingSummary: [
      { field: "external_id", missingCount: 0 },
      { field: "rating", missingCount: 0 },
      { field: "content", missingCount: 0 },
      { field: "reviewed_at", missingCount: 0 },
    ],
    notes: [
      "Data berasal dari pipeline riset SentiRank, bukan mock UI FE-07.",
      "Label awal berasal dari rating, kemudian diperbaiki pada tahap relabeling.",
      "Rentang tanggal diambil dari audit notebook akuisisi data.",
    ],
    sourceArtifacts: [
      "datasets/outputs/eda/01_data_acquisition/rating_distribution_raw.json",
      "datasets/outputs/eda/01_data_acquisition/sentiment_distribution_raw.json",
      "datasets/outputs/eda/01_data_acquisition/missing_value_summary.json",
      "ml-service/notebooks/01_data_acquisition.ipynb",
    ],
  },
  scrapingSummary: {
    packageName: "com.spotify.music",
    sourceName: "Spotify Play Store",
    appTitle: "Spotify: Music dan Podcast",
    region: "ID",
    language: "id",
    collectedReviews: 97782,
    targetReviews: 100000,
    failedItems: 0,
    batchStrategy:
      "Pengambilan data dibagi berdasarkan rating agar kelas rating awal lebih terkendali.",
    quotaAchievement: [
      { rating: 1, targetCount: 20000, actualCount: 20000, achievementRate: 1 },
      { rating: 2, targetCount: 15000, actualCount: 15000, achievementRate: 1 },
      {
        rating: 3,
        targetCount: 30000,
        actualCount: 27782,
        achievementRate: 0.926067,
      },
      { rating: 4, targetCount: 15000, actualCount: 15000, achievementRate: 1 },
      { rating: 5, targetCount: 20000, actualCount: 20000, achievementRate: 1 },
    ],
    rawDatasetNotes: [
      "Raw dataset tersimpan sebagai artefak pipeline, bukan dipanggil langsung dari frontend.",
      "Frontend FE-15 hanya memakai ringkasan riset agar halaman demo tetap ringan.",
      "Tidak ada scraping runtime dari halaman frontend.",
    ],
    sourceArtifacts: [
      "datasets/outputs/eda/01_data_acquisition/scraping_quota_achievement.json",
      "ml-service/notebooks/01_data_acquisition.ipynb",
    ],
  },
  preprocessingSummary: {
    totalRows: 97782,
    missingSourceTextCount: 0,
    emptyTextIndobertCount: 0,
    emptyTextSvmCount: 91,
    relabelingSummary: {
      auditCandidateCount: 6853,
      changedLabelCount: 10153,
      changedLabelPercentage: 10.3833,
      rating3ChangedCount: 10153,
      labelDistributionBefore: {
        Negative: 35000,
        Neutral: 27782,
        Positive: 35000,
      },
      labelDistributionAfter: {
        Negative: 39686,
        Neutral: 17629,
        Positive: 40467,
      },
    },
    textLengthBeforeAfter: [
      { stage: "raw_content", count: 97782, min: 1, median: 36, mean: 63.3762, max: 636 },
      { stage: "text_indobert", count: 97782, min: 1, median: 36, mean: 63.3696, max: 628 },
      { stage: "text_svm", count: 97782, min: 0, median: 36, mean: 62.3845, max: 737 },
    ],
    preprocessingSteps: [
      {
        id: "relabeling",
        name: "Relabeling sentimen",
        description:
          "Audit label rating 3 dan perbaikan label awal menjadi final_sentiment.",
        rowsAffected: 10153,
        status: "Tersedia di artefak",
      },
      {
        id: "text-indobert",
        name: "Teks IndoBERT",
        description:
          "Menyiapkan kolom text_indobert untuk sentiment classification.",
        rowsAffected: 97782,
        status: "Tersedia di artefak",
      },
      {
        id: "text-svm",
        name: "Teks SVM",
        description:
          "Menyiapkan kolom text_svm dan menghapus 91 teks kosong untuk dataset aspek.",
        rowsAffected: 97691,
        status: "Tersedia di artefak",
      },
      {
        id: "aspect-labeling",
        name: "Weak aspect labeling",
        description:
          "Memberi label aspek berbasis keyword untuk persiapan SVM, bukan ground truth expert.",
        rowsAffected: 53515,
        status: "Tersedia di artefak",
      },
    ],
    beforeAfterExamples: [
      {
        id: "example-tbd",
        rawText: TBD_VALUE,
        cleanedText: "Belum tersedia di artefak frontend",
        note: "File ringkas contoh before/after tidak ditemukan pada artefak yang diaudit.",
      },
    ],
    aspectLabelingSummary: {
      totalRows: 97782,
      rowsWithKeywordMatch: 53515,
      rowsWithoutKeywordMatch: 44267,
      generalLabelCount: 44267,
      generalLabelPercentage: 45.2711,
      svmFinalDatasetRows: 16983,
      rowsAfterConfidenceFilter: 16983,
      removedLowConfidenceCount: 36532,
      removedGeneralCount: 44176,
      methodologyNote:
        "Label aspek adalah weak labels berbasis keyword, bukan expert-validated ground truth.",
    },
    refinedAspectDistribution: [
      { label: "Features & Content", count: 21703 },
      { label: "Ads Experience", count: 16282 },
      { label: "Subscription & Pricing", count: 10663 },
      { label: "Performance & Stability", count: 2600 },
      { label: "Account/Login", count: 1474 },
      { label: "Audio Quality", count: 442 },
      { label: "UI/UX", count: 351 },
      { label: "General", count: 44267 },
    ],
    processedDataNotes: [
      "Dataset sentimen akhir memakai 97.782 baris.",
      "Dataset aspek SVM memakai 16.983 baris setelah filter actionable dan confidence.",
      "General fallback tidak dipakai sebagai kriteria AHP/Fuzzy AHP.",
    ],
    sourceArtifacts: [
      "datasets/outputs/eda/02_preprocessing/preprocessing_summary.json",
      "datasets/outputs/eda/02_preprocessing/relabeling_summary.json",
      "datasets/outputs/eda/02_preprocessing/aspect_labeling_refined_summary.json",
      "datasets/outputs/eda/04_svm/svm_aspect_dataset_summary.json",
      "ml-service/notebooks/02_preprocessing.ipynb",
    ],
  },
  aspectSummary: {
    finalClassifier: "merged_5class",
    finalDatasetRows: 16983,
    finalCriteriaCount: 5,
    mergedAspectDistribution: [
      {
        label: "Features, Content & Audio Experience",
        count: 7986,
        percentage: 47.02,
        sourceLabels: ["Features & Content", "Audio Quality"],
      },
      {
        label: "Ads Experience",
        count: 4691,
        percentage: 27.62,
        sourceLabels: ["Ads Experience"],
      },
      {
        label: "Subscription & Pricing",
        count: 2840,
        percentage: 16.72,
        sourceLabels: ["Subscription & Pricing"],
      },
      {
        label: "App Reliability & Usability",
        count: 826,
        percentage: 4.86,
        sourceLabels: ["Performance & Stability", "UI/UX"],
      },
      {
        label: "Account/Login",
        count: 640,
        percentage: 3.77,
        sourceLabels: ["Account/Login"],
      },
    ],
    negativeAspectDistribution: [
      { label: "Ads Experience", count: 10564 },
      { label: "Features, Content & Audio Experience", count: 8499 },
      { label: "Subscription & Pricing", count: 6944 },
      { label: "App Reliability & Usability", count: 1974 },
      { label: "Account/Login", count: 1131 },
    ],
    topNegativeAspect: {
      label: "Ads Experience",
      count: 10564,
    },
    finalCriteria: [
      "Features, Content & Audio Experience",
      "App Reliability & Usability",
      "Ads Experience",
      "Subscription & Pricing",
      "Account/Login",
    ],
    limitationNote:
      "Kriteria ini kandidat AHP/Fuzzy AHP dari weak-label SVM dan tetap memerlukan expert judgement final.",
    sourceArtifacts: [
      "datasets/outputs/eda/04_svm/final_aspect_taxonomy_for_ahp.json",
      "datasets/outputs/eda/02_preprocessing/aspect_by_sentiment_distribution_refined.json",
      "datasets/outputs/eda/04_svm/svm_aspect_dataset_summary.json",
    ],
  },
  indobertEvaluation: {
    finalCandidate: "run_3_weighted_loss_lr_1e-5",
    modelName: "IndoBERT",
    task: "Sentiment classification",
    accuracy: 0.7362285246795746,
    precisionMacro: 0.7085677044571099,
    recallMacro: 0.7234010488718962,
    f1Macro: 0.7093262951288682,
    precisionWeighted: 0.7618704869351424,
    recallWeighted: 0.7362285246795746,
    f1Weighted: 0.7444675721927735,
    neutralPrecision: 0.4770146025,
    neutralRecall: 0.6669187146,
    neutralF1: 0.5562036891,
    support: 14668,
    confusionMatrixReference:
      "docs/figures/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_confusion_matrix.png",
    confusionMatrix: {
      labels: ["Negative", "Neutral", "Positive"],
      rows: [
        { actualLabel: "Negative", predictedCounts: { Negative: 4576, Neutral: 891, Positive: 486 }, support: 5953 },
        { actualLabel: "Neutral", predictedCounts: { Negative: 544, Neutral: 1764, Positive: 337 }, support: 2645 },
        { actualLabel: "Positive", predictedCounts: { Negative: 568, Neutral: 1043, Positive: 4459 }, support: 6070 },
      ],
    },
    notes: [
      "Dipilih karena memiliki Macro F1, Weighted F1, dan Neutral F1 terbaik di antara run yang selesai.",
      "Run 4 dengan slang normalization tidak mengungguli Run 3.",
      "Label sentimen masih mengikuti pipeline riset; noise label dapat memengaruhi metrik.",
    ],
    sourceArtifacts: [
      "datasets/outputs/eda/05_evaluation/model_evaluation_summary.json",
      "datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_classification_report.json",
      "datasets/outputs/eda/03_indobert/run_3_weighted_loss_lr_1e-5/indobert_confusion_matrix.csv",
      "docs/methodology/model_evaluation_summary.md",
    ],
  },
  svmEvaluation: {
    finalClassifier: "merged_5class",
    modelName: "SVM",
    task: "Aspect classification",
    accuracy: 0.950207468879668,
    precisionMacro: 0.9341269083471747,
    recallMacro: 0.9402876428365226,
    f1Macro: 0.9367812076632358,
    precisionWeighted: 0.9502595428801952,
    recallWeighted: 0.950207468879668,
    f1Weighted: 0.9501424835741542,
    minClassF1: 0.8898305085,
    support: 2410,
    confusionMatrixReference:
      "docs/figures/04_svm/svm_merged_5class_confusion_matrix.png",
    confusionMatrix: {
      labels: [
        "Account/Login",
        "Ads Experience",
        "App Reliability & Usability",
        "Features, Content & Audio Experience",
        "Subscription & Pricing",
      ],
      rows: [
        {
          actualLabel: "Account/Login",
          predictedCounts: {
            "Account/Login": 94,
            "Ads Experience": 0,
            "App Reliability & Usability": 0,
            "Features, Content & Audio Experience": 0,
            "Subscription & Pricing": 1,
          },
          support: 95,
        },
        {
          actualLabel: "Ads Experience",
          predictedCounts: {
            "Account/Login": 1,
            "Ads Experience": 544,
            "App Reliability & Usability": 2,
            "Features, Content & Audio Experience": 18,
            "Subscription & Pricing": 9,
          },
          support: 574,
        },
        {
          actualLabel: "App Reliability & Usability",
          predictedCounts: {
            "Account/Login": 2,
            "Ads Experience": 3,
            "App Reliability & Usability": 105,
            "Features, Content & Audio Experience": 7,
            "Subscription & Pricing": 4,
          },
          support: 121,
        },
        {
          actualLabel: "Features, Content & Audio Experience",
          predictedCounts: {
            "Account/Login": 3,
            "Ads Experience": 21,
            "App Reliability & Usability": 7,
            "Features, Content & Audio Experience": 1150,
            "Subscription & Pricing": 14,
          },
          support: 1195,
        },
        {
          actualLabel: "Subscription & Pricing",
          predictedCounts: {
            "Account/Login": 3,
            "Ads Experience": 7,
            "App Reliability & Usability": 1,
            "Features, Content & Audio Experience": 17,
            "Subscription & Pricing": 397,
          },
          support: 425,
        },
      ],
    },
    notes: [
      "Dipilih karena meningkatkan accuracy, macro F1, weighted F1, macro recall, dan minimum class F1 dibanding original_7class.",
      "Merged taxonomy lebih praktis untuk AHP/Fuzzy AHP karena mengurangi beban pairwise comparison.",
      "Evaluasi mengukur kemampuan model belajar weak-label aspect pattern, bukan expert-validated ground truth.",
    ],
    sourceArtifacts: [
      "datasets/outputs/eda/05_evaluation/model_evaluation_summary.json",
      "datasets/outputs/eda/04_svm/svm_merged_5class_metrics.json",
      "datasets/outputs/eda/04_svm/svm_merged_5class_classification_report.json",
      "datasets/outputs/eda/04_svm/svm_merged_5class_confusion_matrix.csv",
      "docs/methodology/svm_aspect_classifier_finalization.md",
    ],
  },
  modelSelectionSummary: {
    finalIndobertCandidate: "run_3_weighted_loss_lr_1e-5",
    finalSvmClassifier: "merged_5class",
    comparisonNotes: [
      "IndoBERT dipilih untuk sentimen karena menangani konteks teks ulasan Indonesia.",
      "SVM dipilih untuk aspek karena taxonomy weak labels lebih terkontrol dan interpretable.",
      "Macro F1 diprioritaskan karena label sentimen dan aspek tidak seimbang.",
    ],
    limitationNotes: [
      "Label sentimen masih dapat mengandung noise dari pipeline relabeling.",
      "SVM dilatih pada weak labels, bukan ground truth expert.",
      "AHP/Fuzzy AHP FE-13/FE-14 masih sample development, bukan final expert judgement.",
    ],
  },
  reportSummary: {
    highLevelFindings: [
      "Dataset riset berisi 97.782 ulasan Spotify dari Google Play.",
      "Distribusi final sentimen relatif seimbang antara Positive dan Negative, dengan Neutral lebih kecil setelah relabeling.",
      "Aspek negatif terbesar pada weak-label refinement adalah Ads Experience.",
      "Model final yang dipilih adalah IndoBERT run_3_weighted_loss_lr_1e-5 dan SVM merged_5class.",
    ],
    datasetFindings:
      "Dataset mencakup rating 1 sampai 5 dengan total 97.782 ulasan, tanpa missing value penting pada external_id, rating, content, dan reviewed_at.",
    sentimentFindings:
      "Final label distribution: Positive 40.467, Negative 39.686, dan Neutral 17.629.",
    aspectFindings:
      "Final taxonomy SVM memakai 5 kelas merged untuk kandidat AHP/Fuzzy AHP; General fallback tidak dipakai sebagai kriteria.",
    modelEvaluationFindings:
      "IndoBERT run_3 dipilih karena trade-off Macro F1 dan Neutral F1 terbaik; SVM merged_5class dipilih karena stabilitas minority class lebih baik.",
    ahpFuzzyAhpDemoLimitation:
      "AHP/Fuzzy AHP pada frontend tetap sample_development_only, not_final_expert_judgement, dan not_final_skripsi_result sampai expert judgement final tersedia.",
  },
} as const;
