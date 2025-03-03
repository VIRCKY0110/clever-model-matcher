
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Upload, Code, Database, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Index = () => {
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [datasetStats, setDatasetStats] = useState<{
    rows: number;
    columns: number;
    columnNames: string[];
    dataSample: Record<string, string>[];
  } | null>(null);
  const [learningType, setLearningType] = useState<"supervised" | "unsupervised" | null>(null);
  const [autoDetectLearningType, setAutoDetectLearningType] = useState(true);

  const steps = [
    {
      title: "Upload Dataset",
      description: "Upload your CSV or Excel file to begin",
      icon: Upload,
    },
    {
      title: "Data Analysis",
      description: "Review dataset statistics and insights",
      icon: Database,
    },
    {
      title: "Algorithm Selection",
      description: "Get ML algorithm recommendations",
      icon: Settings,
    },
    {
      title: "Code Generation",
      description: "Get ready-to-use Python code",
      icon: Code,
    },
  ];

  const handleBeginAnalysis = () => {
    if (step === 1 && !selectedFile) {
      toast.error("Please upload a dataset before proceeding");
      return;
    }

    if (step === 2 && !learningType) {
      toast.error("Please select a learning type before proceeding");
      return;
    }

    if (step === 3 && !selectedAlgorithm) {
      toast.error("Please select an algorithm before proceeding");
      return;
    }

    if (step < steps.length) {
      setStep(step + 1);
      toast.success(`Moving to ${steps[step].title}`);
    } else {
      toast.error("You are already at the final step");
    }
  };

  const handleFileSelect = (
    file: File | null,
    stats?: {
      rows: number;
      columns: number;
      columnNames: string[];
      dataSample: Record<string, string>[];
    }
  ) => {
    setSelectedFile(file);
    if (file && stats) {
      setDatasetStats(stats);
      
      if (autoDetectLearningType) {
        // Determine if the dataset is likely for supervised or unsupervised learning
        const lastColumnName = stats.columnNames[stats.columnNames.length - 1];
        const lastColumnValues = stats.dataSample.map(row => row[lastColumnName]);
        
        // Check if last column has numeric values only
        const isNumeric = lastColumnValues.every(value => !isNaN(Number(value)));
        
        // Check if last column has a small number of unique values (suggesting classification)
        const uniqueValues = new Set(lastColumnValues);
        
        if (uniqueValues.size < stats.rows * 0.2 || isNumeric) {
          setLearningType("supervised");
        } else {
          setLearningType("unsupervised");
        }
      }
      
      toast.success("File analyzed successfully");
    } else {
      setDatasetStats(null);
      setLearningType(null);
    }
  };

  const handleLearningTypeSelect = (type: "supervised" | "unsupervised") => {
    setLearningType(type);
    setAutoDetectLearningType(false);
    toast.success(`Selected ${type} learning`);
  };

  const handleAlgorithmSelect = (algorithmName: string) => {
    setSelectedAlgorithm(algorithmName);
    toast.success(`Selected ${algorithmName} algorithm`);
  };

  const calculateDataTypes = (data: Record<string, string>[]) => {
    const columnTypes: Record<string, Set<string>> = {};
    
    Object.keys(data[0] || {}).forEach(column => {
      columnTypes[column] = new Set();
    });

    data.forEach(row => {
      Object.entries(row).forEach(([column, value]) => {
        if (value === null || value === undefined || value === "") {
          columnTypes[column].add("missing");
        } else if (!isNaN(Number(value))) {
          columnTypes[column].add("numerical");
        } else if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
          columnTypes[column].add("boolean");
        } else if (!isNaN(Date.parse(value))) {
          columnTypes[column].add("datetime");
        } else {
          columnTypes[column].add("categorical");
        }
      });
    });

    const typeCounts = {
      numerical: 0,
      categorical: 0,
      datetime: 0,
      boolean: 0
    };

    Object.values(columnTypes).forEach(typeSet => {
      const types = Array.from(typeSet);
      if (types.includes("numerical")) typeCounts.numerical++;
      else if (types.includes("datetime")) typeCounts.datetime++;
      else if (types.includes("boolean")) typeCounts.boolean++;
      else typeCounts.categorical++;
    });

    return typeCounts;
  };

  const calculateMissingValues = (data: Record<string, string>[]) => {
    let totalCells = 0;
    let missingCells = 0;

    data.forEach(row => {
      Object.values(row).forEach(value => {
        totalCells++;
        if (value === null || value === undefined || value === "") {
          missingCells++;
        }
      });
    });

    return ((missingCells / totalCells) * 100).toFixed(1);
  };

  const getSupervisedAlgorithms = (
    dataTypes: {
      numerical: number;
      categorical: number;
      datetime: number;
      boolean: number;
    },
    totalRows: number,
    missingValuesPercentage: number
  ) => {
    const algorithms = [
      {
        name: "Random Forest",
        score: 0,
        description: "Best for handling both numerical and categorical data. Excellent for avoiding overfitting.",
        useCases: "Classification, Regression",
        type: "supervised"
      },
      {
        name: "XGBoost",
        score: 0,
        description: "Powerful gradient boosting algorithm. Handles missing values well.",
        useCases: "Classification, Regression, Ranking",
        type: "supervised"
      },
      {
        name: "Neural Network",
        score: 0,
        description: "Deep learning model for complex patterns. Good with large datasets.",
        useCases: "Classification, Regression, Pattern Recognition",
        type: "supervised"
      },
      {
        name: "LightGBM",
        score: 0,
        description: "Fast gradient boosting framework. Efficient with large datasets.",
        useCases: "Classification, Regression",
        type: "supervised"
      },
      {
        name: "CatBoost",
        score: 0,
        description: "Handles categorical features automatically. Fast training.",
        useCases: "Classification, Regression",
        type: "supervised"
      },
      {
        name: "SVM",
        score: 0,
        description: "Effective for high-dimensional spaces. Good with clear margins.",
        useCases: "Classification, Regression",
        type: "supervised"
      },
      {
        name: "K-Nearest Neighbors",
        score: 0,
        description: "Simple and interpretable. Good for small to medium datasets.",
        useCases: "Classification, Regression",
        type: "supervised"
      },
      {
        name: "Logistic Regression",
        score: 0,
        description: "Simple and interpretable. Good baseline model.",
        useCases: "Binary Classification",
        type: "supervised"
      },
      {
        name: "Decision Tree",
        score: 0,
        description: "Highly interpretable. Good for feature importance.",
        useCases: "Classification, Regression",
        type: "supervised"
      },
      {
        name: "AdaBoost",
        score: 0,
        description: "Combines weak learners into strong ones. Good with weak patterns.",
        useCases: "Classification, Regression",
        type: "supervised"
      }
    ];

    return algorithms.map(algo => {
      let score = 0;
      
      if (missingValuesPercentage > 5) {
        if (["XGBoost", "CatBoost", "Random Forest"].includes(algo.name)) {
          score += 20;
        }
      }

      if (dataTypes.categorical > 0) {
        if (["CatBoost", "Random Forest", "LightGBM"].includes(algo.name)) {
          score += dataTypes.categorical * 5;
        }
      }

      if (totalRows > 10000) {
        if (["LightGBM", "XGBoost", "Neural Network"].includes(algo.name)) {
          score += 15;
        } else if (["SVM", "K-Nearest Neighbors"].includes(algo.name)) {
          score -= 10;
        }
      } else if (totalRows < 1000) {
        if (["Logistic Regression", "Decision Tree", "K-Nearest Neighbors"].includes(algo.name)) {
          score += 15;
        }
      }

      if (dataTypes.numerical > 0) {
        if (["Neural Network", "XGBoost", "Random Forest"].includes(algo.name)) {
          score += dataTypes.numerical * 3;
        }
      }

      return {
        ...algo,
        score: Math.min(100, Math.max(0, score)),
      };
    })
    .sort((a, b) => b.score - a.score);
  };

  const getUnsupervisedAlgorithms = (
    dataTypes: {
      numerical: number;
      categorical: number;
      datetime: number;
      boolean: number;
    },
    totalRows: number
  ) => {
    const algorithms = [
      {
        name: "K-Means Clustering",
        score: 0,
        description: "Divides data into k clusters based on similarity. Good for well-separated clusters.",
        useCases: "Customer Segmentation, Image Compression",
        type: "unsupervised"
      },
      {
        name: "DBSCAN",
        score: 0,
        description: "Density-based clustering that handles noise well. Can find arbitrarily shaped clusters.",
        useCases: "Anomaly Detection, Spatial Clustering",
        type: "unsupervised"
      },
      {
        name: "Hierarchical Clustering",
        score: 0,
        description: "Creates a tree of clusters. Good for exploring hierarchical relationships.",
        useCases: "Taxonomy Creation, Document Clustering",
        type: "unsupervised"
      },
      {
        name: "PCA",
        score: 0,
        description: "Dimensionality reduction technique that maximizes variance.",
        useCases: "Feature Extraction, Data Visualization",
        type: "unsupervised"
      },
      {
        name: "t-SNE",
        score: 0,
        description: "Non-linear dimensionality reduction for visualization. Preserves local structures.",
        useCases: "High-dimensional Data Visualization",
        type: "unsupervised"
      },
      {
        name: "UMAP",
        score: 0,
        description: "Modern dimensionality reduction technique. Faster than t-SNE with better global structure.",
        useCases: "Visualization, General Dimensionality Reduction",
        type: "unsupervised"
      },
      {
        name: "Isolation Forest",
        score: 0,
        description: "Efficiently detects outliers using random forests.",
        useCases: "Anomaly Detection, Fraud Detection",
        type: "unsupervised"
      },
      {
        name: "Gaussian Mixture Models",
        score: 0,
        description: "Probabilistic model for representing normally distributed clusters.",
        useCases: "Soft Clustering, Density Estimation",
        type: "unsupervised"
      }
    ];

    return algorithms.map(algo => {
      let score = 0;
      
      // PCA, t-SNE and UMAP work well with high-dimensional numerical data
      if (dataTypes.numerical > 5) {
        if (["PCA", "t-SNE", "UMAP"].includes(algo.name)) {
          score += 25;
        }
      }

      // K-Means and GMM prefer numerical data
      if (dataTypes.numerical > dataTypes.categorical) {
        if (["K-Means Clustering", "Gaussian Mixture Models"].includes(algo.name)) {
          score += 20;
        }
      }

      // DBSCAN and Hierarchical can work better with mixed data types
      if (dataTypes.categorical > 0) {
        if (["DBSCAN", "Hierarchical Clustering"].includes(algo.name)) {
          score += 15;
        }
      }

      // For large datasets
      if (totalRows > 10000) {
        if (["K-Means Clustering", "DBSCAN", "Isolation Forest"].includes(algo.name)) {
          score += 15;
        } else if (["Hierarchical Clustering", "t-SNE"].includes(algo.name)) {
          score -= 10; // These can be slow on large datasets
        }
      } 
      // For smaller datasets
      else if (totalRows < 1000) {
        if (["Hierarchical Clustering", "t-SNE", "UMAP"].includes(algo.name)) {
          score += 15;
        }
      }

      return {
        ...algo,
        score: Math.min(100, Math.max(0, score)),
      };
    })
    .sort((a, b) => b.score - a.score);
  };

  const getRecommendedAlgorithms = (
    dataTypes: {
      numerical: number;
      categorical: number;
      datetime: number;
      boolean: number;
    },
    totalRows: number,
    missingValuesPercentage: number
  ) => {
    if (learningType === "supervised") {
      return getSupervisedAlgorithms(dataTypes, totalRows, missingValuesPercentage);
    } else {
      return getUnsupervisedAlgorithms(dataTypes, totalRows);
    }
  };

  const generateAlgorithmCode = (algorithm: string, fileName: string) => {
    // Determine if the selected algorithm is supervised or unsupervised
    const isSupervisedAlgorithm = [
      "Random Forest", "XGBoost", "Neural Network", "LightGBM", "CatBoost", 
      "SVM", "K-Nearest Neighbors", "Logistic Regression", "Decision Tree", "AdaBoost"
    ].includes(algorithm);

    if (isSupervisedAlgorithm) {
      return generateSupervisedCode(algorithm, fileName);
    } else {
      return generateUnsupervisedCode(algorithm, fileName);
    }
  };

  const generateSupervisedCode = (algorithm: string, fileName: string) => {
    const imports = {
      "Random Forest": "from sklearn.ensemble import RandomForestClassifier",
      "XGBoost": "import xgboost as xgb\nfrom xgboost import XGBClassifier",
      "Neural Network": "from sklearn.neural_network import MLPClassifier",
      "LightGBM": "import lightgbm as lgb\nfrom lightgbm import LGBMClassifier",
      "CatBoost": "from catboost import CatBoostClassifier",
      "SVM": "from sklearn.svm import SVC",
      "K-Nearest Neighbors": "from sklearn.neighbors import KNeighborsClassifier",
      "Logistic Regression": "from sklearn.linear_model import LogisticRegression",
      "Decision Tree": "from sklearn.tree import DecisionTreeClassifier",
      "AdaBoost": "from sklearn.ensemble import AdaBoostClassifier"
    };

    const modelInit = {
      "Random Forest": `model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)`,
      "XGBoost": `model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=6,
    random_state=42
)`,
      "Neural Network": `model = MLPClassifier(
    hidden_layer_sizes=(100, 50),
    activation='relu',
    max_iter=1000,
    random_state=42
)`,
      "LightGBM": `model = LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=6,
    random_state=42
)`,
      "CatBoost": `model = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=6,
    random_state=42,
    verbose=False
)`,
      "SVM": `model = SVC(
    kernel='rbf',
    C=1.0,
    gamma='scale',
    probability=True,
    random_state=42
)`,
      "K-Nearest Neighbors": `model = KNeighborsClassifier(
    n_neighbors=5,
    weights='uniform',
    algorithm='auto'
)`,
      "Logistic Regression": `model = LogisticRegression(
    C=1.0,
    max_iter=1000,
    random_state=42
)`,
      "Decision Tree": `model = DecisionTreeClassifier(
    max_depth=10,
    min_samples_split=2,
    random_state=42
)`,
      "AdaBoost": `model = AdaBoostClassifier(
    n_estimators=100,
    learning_rate=1.0,
    random_state=42
)`
    };

    return `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import confusion_matrix, classification_report, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
${imports[algorithm as keyof typeof imports]}

# Load the dataset
df = pd.read_csv('${fileName || "dataset.csv"}')

# Display basic information
print("Dataset Shape:", df.shape)
print("\\nFirst 5 rows:")
print(df.head())
print("\\nData Types:")
print(df.dtypes)
print("\\nSummary Statistics:")
print(df.describe())

# Handle missing values
df = df.fillna(df.mean() if df.select_dtypes(include=[np.number]).columns.any() else df.mode().iloc[0])

# Identify categorical columns and numerical columns
categorical_cols = df.select_dtypes(include=['object', 'category']).columns
numerical_cols = df.select_dtypes(include=[np.number]).columns

# Use the last column as the target variable
target_column = df.columns[-1]
feature_columns = [col for col in df.columns if col != target_column]

print(f"\\nTarget variable: {target_column}")
print(f"Features: {feature_columns}")

# Prepare features and target
X = df[feature_columns]
y = df[target_column]

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Preprocessing for numerical and categorical data
numerical_transformer = Pipeline(steps=[
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combine preprocessing steps
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_cols),
        ('cat', categorical_transformer, categorical_cols)
    ]
)

# Initialize and train the model
${modelInit[algorithm as keyof typeof modelInit]}

# Create and fit pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', model)
])

# Train the model
pipeline.fit(X_train, y_train)

# Make predictions
y_pred = pipeline.predict(X_test)

# Evaluation metrics
print("\\nModel Evaluation:")
print("--------------------")

# Check if the problem is classification or regression
unique_values = len(np.unique(y))
is_classification = unique_values < 10  # Heuristic: if fewer than 10 unique values, likely classification

if is_classification:
    # Classification metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    print("\\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('Predicted labels')
    plt.ylabel('True labels')
    plt.title('Confusion Matrix')
    plt.savefig('confusion_matrix.png')
    print("Confusion matrix visualization saved as 'confusion_matrix.png'")
    
    print("\\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    
else:
    # Regression metrics
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Mean Squared Error: {mse:.4f}")
    print(f"Root Mean Squared Error: {rmse:.4f}")
    print(f"R² Score: {r2:.4f}")
    
    # Plot actual vs predicted values
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test, y_pred, alpha=0.5)
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
    plt.xlabel('Actual values')
    plt.ylabel('Predicted values')
    plt.title('Actual vs Predicted Values')
    plt.savefig('regression_results.png')
    print("Regression results visualization saved as 'regression_results.png'")

# Feature importance (for models that support it)
try:
    if hasattr(pipeline['model'], 'feature_importances_'):
        importances = pipeline['model'].feature_importances_
        
        # Get feature names after preprocessing
        if hasattr(pipeline['preprocessor'], 'get_feature_names_out'):
            feature_names = pipeline['preprocessor'].get_feature_names_out()
        else:
            feature_names = X.columns
        
        # Create DataFrame for feature importance
        feature_importance = pd.DataFrame({
            'Feature': feature_names,
            'Importance': importances
        }).sort_values('Importance', ascending=False)
        
        print("\\nFeature Importance:")
        print(feature_importance.head(10))
        
        # Plot feature importance
        plt.figure(figsize=(12, 8))
        sns.barplot(x='Importance', y='Feature', data=feature_importance.head(20))
        plt.title('Feature Importance')
        plt.tight_layout()
        plt.savefig('feature_importance.png')
        print("Feature importance visualization saved as 'feature_importance.png'")
except Exception as e:
    print(f"Could not compute feature importance: {e}")

print("\\nPredictions (First 5):")
print(y_pred[:5])

# Save the model
import joblib
joblib.dump(pipeline, '${algorithm.toLowerCase().replace(/\s+/g, '_')}_model.pkl')
print("\\nModel saved as '${algorithm.toLowerCase().replace(/\s+/g, '_')}_model.pkl'")
`;
  };

  const generateUnsupervisedCode = (algorithm: string, fileName: string) => {
    let imports = "";
    let modelCode = "";
    let evaluationCode = "";
    
    switch (algorithm) {
      case "K-Means Clustering":
        imports = "from sklearn.cluster import KMeans";
        modelCode = `
# Initialize and fit K-Means model
model = KMeans(n_clusters=3, random_state=42)
clusters = model.fit_predict(X_scaled)

# Add cluster labels to original data
df_clustered = df.copy()
df_clustered['Cluster'] = clusters`;
        evaluationCode = `
# Evaluate clusters with Silhouette Score
from sklearn.metrics import silhouette_score
silhouette_avg = silhouette_score(X_scaled, clusters)
print(f"Silhouette Score: {silhouette_avg:.4f}")

# Plot clusters (for 2D visualization, use PCA if more than 2 dimensions)
if X_scaled.shape[1] > 2:
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    plt.figure(figsize=(10, 8))
    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.scatter(model.cluster_centers_[:, 0], model.cluster_centers_[:, 1], 
                c='red', marker='x', s=100)
    plt.title('K-Means Clustering with PCA Visualization')
else:
    plt.figure(figsize=(10, 8))
    plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.scatter(model.cluster_centers_[:, 0], model.cluster_centers_[:, 1], 
                c='red', marker='x', s=100)
    plt.title('K-Means Clustering')

plt.savefig('kmeans_clusters.png')
print("Clustering visualization saved as 'kmeans_clusters.png'")

# Plot cluster distribution
plt.figure(figsize=(8, 6))
sns.countplot(x='Cluster', data=df_clustered)
plt.title('Cluster Distribution')
plt.savefig('cluster_distribution.png')
print("Cluster distribution saved as 'cluster_distribution.png'")

# Analyze clusters
print("\\nCluster Summary:")
for cluster in range(model.n_clusters):
    print(f"\\nCluster {cluster}:")
    print(df_clustered[df_clustered['Cluster'] == cluster].describe())`;
        break;
        
      case "DBSCAN":
        imports = "from sklearn.cluster import DBSCAN";
        modelCode = `
# Initialize and fit DBSCAN model
model = DBSCAN(eps=0.5, min_samples=5)
clusters = model.fit_predict(X_scaled)

# Add cluster labels to original data
df_clustered = df.copy()
df_clustered['Cluster'] = clusters`;
        evaluationCode = `
# Count number of clusters and noise points
n_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)
n_noise = list(clusters).count(-1)
print(f"Number of estimated clusters: {n_clusters}")
print(f"Number of noise points: {n_noise}")

# Plot clusters (for 2D visualization, use PCA if more than 2 dimensions)
if X_scaled.shape[1] > 2:
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    plt.figure(figsize=(10, 8))
    # Black is used for noise points
    unique_clusters = set(clusters)
    colors = plt.cm.viridis(np.linspace(0, 1, len(unique_clusters)))
    for cluster, col in zip(unique_clusters, colors):
        if cluster == -1:
            # Black used for noise
            col = [0, 0, 0, 1]
        plt.scatter(X_pca[clusters == cluster, 0], X_pca[clusters == cluster, 1],
                   c=[col], marker='o', s=50, alpha=0.8)
    plt.title('DBSCAN Clustering with PCA Visualization')
else:
    plt.figure(figsize=(10, 8))
    plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.title('DBSCAN Clustering')

plt.savefig('dbscan_clusters.png')
print("Clustering visualization saved as 'dbscan_clusters.png'")

# Plot cluster distribution
cluster_labels = ['Noise' if c == -1 else f'Cluster {c}' for c in clusters]
cluster_df = pd.DataFrame({'Cluster': cluster_labels})

plt.figure(figsize=(10, 6))
sns.countplot(x='Cluster', data=cluster_df)
plt.title('Cluster Distribution')
plt.xticks(rotation=45)
plt.savefig('dbscan_distribution.png')
print("Cluster distribution saved as 'dbscan_distribution.png'")`;
        break;
        
      case "Hierarchical Clustering":
        imports = "from sklearn.cluster import AgglomerativeClustering\nfrom scipy.cluster.hierarchy import dendrogram, linkage";
        modelCode = `
# Initialize and fit Hierarchical Clustering model
model = AgglomerativeClustering(n_clusters=3)
clusters = model.fit_predict(X_scaled)

# Add cluster labels to original data
df_clustered = df.copy()
df_clustered['Cluster'] = clusters`;
        evaluationCode = `
# Create linkage matrix for dendrogram
# Using only a sample for large datasets to make it more legible
max_samples = min(1000, X_scaled.shape[0])
indices = np.random.choice(range(X_scaled.shape[0]), max_samples, replace=False)
X_sample = X_scaled[indices]

# Create linkage matrix
Z = linkage(X_sample, method='ward')

# Plot dendrogram
plt.figure(figsize=(12, 8))
dendrogram(Z)
plt.title('Hierarchical Clustering Dendrogram')
plt.xlabel('Sample index')
plt.ylabel('Distance')
plt.savefig('dendrogram.png')
print("Dendrogram visualization saved as 'dendrogram.png'")

# Plot clusters (for 2D visualization, use PCA if more than 2 dimensions)
if X_scaled.shape[1] > 2:
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    plt.figure(figsize=(10, 8))
    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.title('Hierarchical Clustering with PCA Visualization')
else:
    plt.figure(figsize=(10, 8))
    plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.title('Hierarchical Clustering')

plt.savefig('hierarchical_clusters.png')
print("Clustering visualization saved as 'hierarchical_clusters.png'")

# Plot cluster distribution
plt.figure(figsize=(8, 6))
sns.countplot(x='Cluster', data=df_clustered)
plt.title('Cluster Distribution')
plt.savefig('hierarchical_distribution.png')
print("Cluster distribution saved as 'hierarchical_distribution.png'")

# Analyze clusters
print("\\nCluster Summary:")
for cluster in range(model.n_clusters):
    print(f"\\nCluster {cluster}:")
    print(df_clustered[df_clustered['Cluster'] == cluster].describe())`;
        break;
        
      case "PCA":
        imports = "from sklearn.decomposition import PCA";
        modelCode = `
# Initialize and fit PCA model
n_components = min(X_scaled.shape[1], 5)  # Get top 5 components (or fewer if not enough features)
model = PCA(n_components=n_components)
X_pca = model.fit_transform(X_scaled)

# Create a DataFrame with the principal components
component_names = [f'PC{i+1}' for i in range(n_components)]
df_pca = pd.DataFrame(X_pca, columns=component_names)

# Add original indexes 
df_pca['index'] = df.index

# Merge with original data if needed
df_with_pca = pd.concat([df.reset_index(drop=True), df_pca.drop('index', axis=1).reset_index(drop=True)], axis=1)`;
        evaluationCode = `
# Explained variance
explained_variance = model.explained_variance_ratio_
cumulative_variance = np.cumsum(explained_variance)

print("\\nExplained Variance by Components:")
for i, var in enumerate(explained_variance):
    print(f"PC{i+1}: {var:.4f} ({cumulative_variance[i]:.4f} cumulative)")

# Plot explained variance
plt.figure(figsize=(10, 6))
plt.bar(component_names, explained_variance)
plt.plot(component_names, cumulative_variance, 'ro-')
plt.axhline(y=0.8, color='r', linestyle='-')
plt.title('Explained Variance by Principal Components')
plt.ylabel('Explained Variance Ratio')
plt.xlabel('Principal Components')
plt.savefig('pca_variance.png')
print("PCA variance visualization saved as 'pca_variance.png'")

# Plot first two principal components
plt.figure(figsize=(10, 8))
plt.scatter(X_pca[:, 0], X_pca[:, 1], alpha=0.5)
plt.title('First Two Principal Components')
plt.xlabel('PC1')
plt.ylabel('PC2')
plt.savefig('pca_scatter.png')
print("PCA scatter plot saved as 'pca_scatter.png'")

# Feature loadings for the first few components
if hasattr(model, 'components_') and X.columns is not None:
    loadings = pd.DataFrame(
        model.components_.T, 
        columns=component_names, 
        index=X.columns
    )
    print("\\nFeature Loadings:")
    print(loadings)
    
    # Plot feature loadings
    plt.figure(figsize=(12, 8))
    sns.heatmap(loadings, annot=True, cmap='coolwarm', linewidths=0.5)
    plt.title('PCA Feature Loadings')
    plt.savefig('pca_loadings.png')
    print("PCA loadings visualization saved as 'pca_loadings.png'")`;
        break;
        
      case "t-SNE":
        imports = "from sklearn.manifold import TSNE";
        modelCode = `
# Initialize and fit t-SNE model
model = TSNE(n_components=2, random_state=42, perplexity=min(30, X_scaled.shape[0]-1))
X_tsne = model.fit_transform(X_scaled)

# Create a DataFrame with the t-SNE components
df_tsne = pd.DataFrame(X_tsne, columns=['t-SNE 1', 't-SNE 2'])

# Add original indexes
df_tsne['index'] = df.index

# Merge with original data if needed
df_with_tsne = pd.concat([df.reset_index(drop=True), df_tsne.drop('index', axis=1).reset_index(drop=True)], axis=1)`;
        evaluationCode = `
# Plot t-SNE results
plt.figure(figsize=(10, 8))
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], alpha=0.5)
plt.title('t-SNE Visualization')
plt.xlabel('t-SNE 1')
plt.ylabel('t-SNE 2')
plt.savefig('tsne_scatter.png')
print("t-SNE visualization saved as 'tsne_scatter.png'")

# Try to identify clusters using K-means on t-SNE result
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(X_tsne)

plt.figure(figsize=(10, 8))
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=clusters, cmap='viridis', alpha=0.8)
plt.title('t-SNE with K-Means Clustering')
plt.savefig('tsne_clusters.png')
print("t-SNE with clustering saved as 'tsne_clusters.png'")

# Add cluster labels to original data
df_clustered = df.copy()
df_clustered['Cluster'] = clusters

# Plot cluster distribution
plt.figure(figsize=(8, 6))
sns.countplot(x='Cluster', data=df_clustered)
plt.title('Cluster Distribution')
plt.savefig('tsne_cluster_distribution.png')
print("Cluster distribution saved as 'tsne_cluster_distribution.png'")`;
        break;
        
      case "UMAP":
        imports = "import umap";
        modelCode = `
# Initialize and fit UMAP model
model = umap.UMAP(n_components=2, random_state=42)
X_umap = model.fit_transform(X_scaled)

# Create a DataFrame with the UMAP components
df_umap = pd.DataFrame(X_umap, columns=['UMAP 1', 'UMAP 2'])

# Add original indexes
df_umap['index'] = df.index

# Merge with original data if needed
df_with_umap = pd.concat([df.reset_index(drop=True), df_umap.drop('index', axis=1).reset_index(drop=True)], axis=1)`;
        evaluationCode = `
# Plot UMAP results
plt.figure(figsize=(10, 8))
plt.scatter(X_umap[:, 0], X_umap[:, 1], alpha=0.5)
plt.title('UMAP Visualization')
plt.xlabel('UMAP 1')
plt.ylabel('UMAP 2')
plt.savefig('umap_scatter.png')
print("UMAP visualization saved as 'umap_scatter.png'")

# Try to identify clusters using K-means on UMAP result
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(X_umap)

plt.figure(figsize=(10, 8))
plt.scatter(X_umap[:, 0], X_umap[:, 1], c=clusters, cmap='viridis', alpha=0.8)
plt.title('UMAP with K-Means Clustering')
plt.savefig('umap_clusters.png')
print("UMAP with clustering saved as 'umap_clusters.png'")

# Add cluster labels to original data
df_clustered = df.copy()
df_clustered['Cluster'] = clusters

# Plot cluster distribution
plt.figure(figsize=(8, 6))
sns.countplot(x='Cluster', data=df_clustered)
plt.title('Cluster Distribution')
plt.savefig('umap_cluster_distribution.png')
print("Cluster distribution saved as 'umap_cluster_distribution.png'")`;
        break;
        
      case "Isolation Forest":
        imports = "from sklearn.ensemble import IsolationForest";
        modelCode = `
# Initialize and fit Isolation Forest model
model = IsolationForest(contamination=0.1, random_state=42)
outliers = model.fit_predict(X_scaled)

# Convert predictions: -1 for outliers, 1 for inliers
outliers_binary = np.where(outliers == -1, 1, 0)  # 1 for outlier, 0 for normal

# Add outlier information to original data
df_with_outliers = df.copy()
df_with_outliers['is_outlier'] = outliers_binary`;
        evaluationCode = `
# Count outliers
n_outliers = sum(outliers_binary)
print(f"\\nNumber of detected outliers: {n_outliers} ({n_outliers/len(outliers_binary):.2%} of data)")

# Plot outliers in 2D (using PCA if more than 2 dimensions)
if X_scaled.shape[1] > 2:
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    plt.figure(figsize=(10, 8))
    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=outliers_binary, cmap='coolwarm', alpha=0.8)
    plt.colorbar(label='Outlier')
    plt.title('Outlier Detection with Isolation Forest (PCA visualization)')
else:
    plt.figure(figsize=(10, 8))
    plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=outliers_binary, cmap='coolwarm', alpha=0.8)
    plt.colorbar(label='Outlier')
    plt.title('Outlier Detection with Isolation Forest')

plt.savefig('isolation_forest_outliers.png')
print("Outlier detection visualization saved as 'isolation_forest_outliers.png'")

# Feature importance for outliers (calculate mean difference between outliers and inliers)
outlier_importance = pd.DataFrame()
outlier_importance['Feature'] = X.columns
outlier_importance['Importance'] = [
    abs(X.iloc[outliers_binary == 1, i].mean() - X.iloc[outliers_binary == 0, i].mean())
    for i in range(X.shape[1])
]
outlier_importance = outlier_importance.sort_values('Importance', ascending=False)

print("\\nFeature Importance for Outliers:")
print(outlier_importance.head(10))

# Plot feature importance
plt.figure(figsize=(12, 8))
sns.barplot(x='Importance', y='Feature', data=outlier_importance.head(20))
plt.title('Feature Importance for Outlier Detection')
plt.tight_layout()
plt.savefig('outlier_feature_importance.png')
print("Feature importance visualization saved as 'outlier_feature_importance.png'")`;
        break;
        
      case "Gaussian Mixture Models":
        imports = "from sklearn.mixture import GaussianMixture";
        modelCode = `
# Initialize and fit Gaussian Mixture Model
model = GaussianMixture(n_components=3, random_state=42)
clusters = model.fit_predict(X_scaled)

# Add cluster labels to original data
df_clustered = df.copy()
df_clustered['Cluster'] = clusters`;
        evaluationCode = `
# Get model BIC and AIC
bic = model.bic(X_scaled)
aic = model.aic(X_scaled)
print(f"\\nBIC: {bic}")
print(f"AIC: {aic}")

# Get cluster probabilities
probs = model.predict_proba(X_scaled)
prob_df = pd.DataFrame(probs, columns=[f'Prob_Cluster_{i}' for i in range(model.n_components)])
df_with_probs = pd.concat([df_clustered, prob_df], axis=1)

# Plot clusters (for 2D visualization, use PCA if more than 2 dimensions)
if X_scaled.shape[1] > 2:
    from sklearn.decomposition import PCA
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    plt.figure(figsize=(10, 8))
    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.title('Gaussian Mixture Model with PCA Visualization')
else:
    plt.figure(figsize=(10, 8))
    plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=clusters, cmap='viridis', alpha=0.8)
    plt.title('Gaussian Mixture Model Clustering')

plt.savefig('gmm_clusters.png')
print("GMM clustering visualization saved as 'gmm_clusters.png'")

# Plot cluster distribution
plt.figure(figsize=(8, 6))
sns.countplot(x='Cluster', data=df_clustered)
plt.title('Cluster Distribution')
plt.savefig('gmm_distribution.png')
print("Cluster distribution saved as 'gmm_distribution.png'")

# Visualize uncertainty (entropy of probabilities)
from scipy.stats import entropy
cluster_entropy = [entropy(probs[i]) for i in range(len(probs))]
df_clustered['Uncertainty'] = cluster_entropy

# Plot uncertainty 
plt.figure(figsize=(10, 6))
if X_scaled.shape[1] > 2:
    plt.scatter(X_pca[:, 0], X_pca[:, 1], c=cluster_entropy, cmap='viridis', alpha=0.8)
else:
    plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=cluster_entropy, cmap='viridis', alpha=0.8)
plt.colorbar(label='Uncertainty (Entropy)')
plt.title('Clustering Uncertainty')
plt.savefig('gmm_uncertainty.png')
print("Uncertainty visualization saved as 'gmm_uncertainty.png'")

# Analyze clusters
print("\\nCluster Summary:")
for cluster in range(model.n_components):
    print(f"\\nCluster {cluster}:")
    print(df_clustered[df_clustered['Cluster'] == cluster].describe())`;
        break;
        
      default:
        return "# Algorithm not recognized or not implemented yet.";
    }
    
    return `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
${imports}

# Load the dataset
df = pd.read_csv('${fileName || "dataset.csv"}')

# Display basic information
print("Dataset Shape:", df.shape)
print("\\nFirst 5 rows:")
print(df.head())
print("\\nData Types:")
print(df.dtypes)
print("\\nSummary Statistics:")
print(df.describe())

# Handle missing values
df = df.fillna(df.mean() if df.select_dtypes(include=[np.number]).columns.any() else df.mode().iloc[0])

# Extract features (for unsupervised learning, we'll use all columns)
X = df.select_dtypes(include=['number'])  # Use only numeric columns

# Print selected features
print("\\nSelected Features:", X.columns.tolist())

# Standardize the data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Apply unsupervised learning
${modelCode}

# Evaluate results
${evaluationCode}

# Save the model
import joblib
joblib.dump(model, '${algorithm.toLowerCase().replace(/\s+/g, '_')}_model.pkl')
print("\\nModel saved as '${algorithm.toLowerCase().replace(/\s+/g, '_')}_model.pkl'")
`;
  };

  const getAlgorithmDescription = (algorithm: string) => {
    // Supervised algorithms descriptions
    const supervisedDescriptions: Record<string, string> = {
      "Random Forest": `This code implements a Random Forest classifier on your dataset. It:
• Automatically splits your data into training and testing sets
• Handles preprocessing for both numerical and categorical features
• Uses the last column as the target variable
• Evaluates model performance with metrics like accuracy, precision, recall, and F1 score
• Generates a confusion matrix visualization to see prediction patterns
• Creates feature importance plots to understand which variables have the most impact
• Saves the trained model for future use`,

      "XGBoost": `This code implements an XGBoost model on your dataset. It:
• Leverages gradient boosting for high performance prediction
• Preprocesses all data types automatically
• Evaluates with comprehensive classification or regression metrics
• Visualizes confusion matrix or regression performance
• Shows feature importance to understand key predictors
• Handles both categorical and numerical features
• Implements early stopping to prevent overfitting
• Saves the trained model for future deployment`,

      "Neural Network": `This code implements a Neural Network (MLP) classifier on your dataset. It:
• Creates a multi-layer perceptron network with two hidden layers
• Automatically preprocesses and normalizes all input features
• Uses ReLU activation for better gradient flow
• Evaluates model performance with classification metrics
• Visualizes prediction results through confusion matrix
• Can automatically detect whether you're solving a classification or regression problem
• Saves the trained model for deployment`,

      "LightGBM": `This code implements a LightGBM model on your dataset. It:
• Utilizes gradient boosting with leaf-wise tree growth for efficiency
• Automatically handles feature preprocessing
• Uses the last column as your target variable
• Evaluates with comprehensive metrics appropriate for your problem
• Creates visualizations of model performance
• Identifies the most important features that drive predictions
• Saves the trained model for future use`,

      "CatBoost": `This code implements a CatBoost classifier on your dataset. It:
• Provides automatic handling of categorical features without preprocessing
• Uses innovative ordered boosting to reduce overfitting
• Preprocesses numerical data for optimal performance
• Evaluates model with comprehensive metrics
• Visualizes prediction patterns through confusion matrix
• Identifies the most important features that drive predictions
• Saves the trained model for future use`,

      "SVM": `This code implements a Support Vector Machine classifier on your dataset. It:
• Uses RBF kernel for handling non-linear relationships
• Automatically scales features for optimal performance
• Evaluates model with comprehensive metrics
• Visualizes prediction patterns through confusion matrix
• Detects whether your problem is classification or regression
• Handles both categorical and numerical features
• Saves the trained model for deployment`,

      "K-Nearest Neighbors": `This code implements a K-Nearest Neighbors classifier on your dataset. It:
• Uses 5 neighbors for prediction by default
• Automatically preprocesses and scales features
• Evaluates model with classification or regression metrics
• Visualizes prediction patterns through confusion matrix
• Detects problem type (classification/regression) automatically
• Works with both numerical and categorical features through preprocessing
• Saves the trained model for future use`,

      "Logistic Regression": `This code implements a Logistic Regression model on your dataset. It:
• Creates a simple yet effective classifier for binary problems
• Automatically handles feature scaling and preprocessing
• Evaluates with precision, recall, accuracy and F1 score
• Visualizes prediction results through confusion matrix
• Works with both numerical and categorical features
• Uses regularization to prevent overfitting
• Saves the trained model for future use`,

      "Decision Tree": `This code implements a Decision Tree classifier on your dataset. It:
• Creates a highly interpretable model with clear decision rules
• Automatically handles different feature types without scaling
• Evaluates with comprehensive classification metrics
• Visualizes prediction patterns through confusion matrix
• Shows feature importance to understand key predictors
• Controls tree depth to prevent overfitting
• Saves the trained model for future use`,

      "AdaBoost": `This code implements an AdaBoost classifier on your dataset. It:
• Combines multiple weak learners into a strong predictive model
• Automatically weights difficult-to-classify examples
• Handles preprocessing of different feature types
• Evaluates with comprehensive metrics
• Visualizes prediction results through confusion matrix
• Shows feature importance to understand key predictors
• Saves the trained model for future use`
    };

    // Unsupervised algorithms descriptions
    const unsupervisedDescriptions: Record<string, string> = {
      "K-Means Clustering": `This code implements K-Means clustering on your dataset. It:
• Automatically groups your data into 3 distinct clusters
• Standardizes all numerical features for better clustering
• Evaluates cluster quality using silhouette score
• Creates visualizations of the clusters using PCA for high-dimensional data
• Shows the distribution of data points across clusters
• Provides statistical summaries of each cluster's characteristics
• Saves the trained model for future use on new data`,

      "DBSCAN": `This code implements DBSCAN density-based clustering on your dataset. It:
• Identifies clusters of arbitrary shapes based on data density
• Automatically detects and labels noise points
• Works without specifying the number of clusters in advance
• Creates visualizations of clusters with PCA for high-dimensional data
• Shows cluster distribution including noise points
• Adapts to clusters of varying density and size
• Saves the clustering model for future use`,

      "Hierarchical Clustering": `This code implements Hierarchical Clustering on your dataset. It:
• Creates a hierarchical structure of nested clusters
• Visualizes this hierarchy through a dendrogram
• Applies agglomerative (bottom-up) clustering
• Creates 2D visualizations of the final clusters
• Shows cluster distributions and characteristics
• Works well for identifying relationships between clusters
• Saves the clustering model for future use`,

      "PCA": `This code implements Principal Component Analysis on your dataset. It:
• Reduces dimensionality while preserving maximum variance
• Shows explained variance for each principal component
• Visualizes how much of the original information is retained
• Creates 2D scatter plots of the first two components
• Shows feature loadings to interpret what each component represents
• Merges PCA results with original data for further analysis
• Saves the PCA model for future transformations`,

      "t-SNE": `This code implements t-SNE dimensionality reduction on your dataset. It:
• Creates a 2D representation of your high-dimensional data
• Preserves local relationships between data points
• Visualizes natural clusters in your data
• Applies K-means clustering to the t-SNE results
• Shows cluster distributions
• Works well for visualizing complex non-linear structures
• Saves the model for reference (though t-SNE doesn't transform new data)`,

      "UMAP": `This code implements UMAP dimensionality reduction on your dataset. It:
• Creates a 2D representation that preserves both local and global structure
• Performs faster than t-SNE for large datasets
• Visualizes natural clusters in your data
• Applies K-means clustering to the UMAP results
• Shows cluster distributions
• Works well for visualizing complex data relationships
• Saves the model for transforming new data points`,

      "Isolation Forest": `This code implements Isolation Forest for anomaly detection on your dataset. It:
• Identifies outliers and anomalies in your data
• Works by isolating observations through random partitioning
• Creates visualizations of detected outliers
• Shows which features contribute most to outlier detection
• Works efficiently on high-dimensional datasets
• Adapts to different types of anomalies
• Saves the model for detecting anomalies in new data`,

      "Gaussian Mixture Models": `This code implements Gaussian Mixture Models on your dataset. It:
• Models your data as a mixture of multiple Gaussian distributions
• Provides soft cluster assignments with probability scores
• Evaluates model fit using BIC and AIC information criteria
• Creates visualizations of the identified clusters
• Shows cluster distributions and characteristics
• Visualizes uncertainty in cluster assignments
• Saves the model for future clustering of new data`
    };

    // Combine both types of descriptions
    const allDescriptions = { ...supervisedDescriptions, ...unsupervisedDescriptions };
    
    return allDescriptions[algorithm] || "This code implements the selected machine learning algorithm on your dataset.";
  };

  const getCodeExplanationBySection = (algorithm: string) => {
    const isSupervisedAlgorithm = [
      "Random Forest", "XGBoost", "Neural Network", "LightGBM", "CatBoost", 
      "SVM", "K-Nearest Neighbors", "Logistic Regression", "Decision Tree", "AdaBoost"
    ].includes(algorithm);

    if (isSupervisedAlgorithm) {
      return [
        {
          title: "Data Loading & Exploration",
          explanation: "This section loads your dataset from a CSV file and performs initial data exploration. It displays basic information about the dataset including shape, data types, and statistics."
        },
        {
          title: "Data Preprocessing",
          explanation: "This section prepares your data for modeling by handling missing values, identifying categorical and numerical features, and preparing feature and target variables."
        },
        {
          title: "Feature Engineering & Model Setup",
          explanation: "Sets up preprocessing pipelines for both categorical and numerical features. Categorical features are one-hot encoded while numerical features are scaled."
        },
        {
          title: "Model Training & Prediction",
          explanation: "Initializes the selected model with optimized hyperparameters, trains it on the training data, and makes predictions on the test set."
        },
        {
          title: "Evaluation & Visualization",
          explanation: "Automatically determines whether your problem is classification or regression and calculates appropriate metrics. For classification, it includes accuracy, precision, recall, F1-score, and creates a confusion matrix visualization."
        },
        {
          title: "Feature Importance Analysis",
          explanation: "Analyzes which features have the most impact on predictions and visualizes these insights to help you understand what's driving model decisions."
        },
        {
          title: "Model Saving",
          explanation: "Saves the trained model pipeline (including preprocessors) to a file for future use in production environments."
        }
      ];
    } else {
      return [
        {
          title: "Data Loading & Exploration",
          explanation: "Loads your dataset and displays fundamental information about its structure, data types, and descriptive statistics."
        },
        {
          title: "Data Preprocessing",
          explanation: "Handles missing values and extracts numerical features for unsupervised learning. All features are standardized to ensure equal contribution to the analysis."
        },
        {
          title: "Model Initialization & Fitting",
          explanation: "Initializes the selected unsupervised algorithm and applies it to the standardized data. Parameters are optimized for your dataset size and characteristics."
        },
        {
          title: "Clustering or Dimensionality Reduction",
          explanation: algorithm.includes("Clustering") || algorithm === "Gaussian Mixture Models" ? 
            "Assigns data points to clusters based on similarities and adds cluster labels to the original dataset." :
            "Transforms high-dimensional data into lower dimensions while preserving important relationships between data points."
        },
        {
          title: "Visualization & Evaluation",
          explanation: "Creates visualizations appropriate to the algorithm type. For clustering, this includes cluster plots and distribution. For dimensionality reduction, it visualizes the transformed data and explained variance."
        },
        {
          title: "Analysis & Interpretation",
          explanation: algorithm.includes("Clustering") || algorithm === "Gaussian Mixture Models" ? 
            "Provides statistical summaries of each cluster to help you understand the characteristics of grouped data." :
            "Provides metrics to evaluate the quality of the dimensionality reduction or anomaly detection."
        },
        {
          title: "Model Saving",
          explanation: "Saves the trained model for later use in analyzing new data points."
        }
      ];
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Start Your ML Journey
              </h2>
              <p className="text-primary-600">
                Upload your dataset to receive personalized ML recommendations
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
            {datasetStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-6"
              >
                <div className="bg-primary-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">
                    Dataset Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-primary-600">Total Rows</p>
                      <p className="text-2xl font-semibold text-primary-900">
                        {datasetStats.rows.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-primary-600">Total Columns</p>
                      <p className="text-2xl font-semibold text-primary-900">
                        {datasetStats.columns.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">
                    Column Names
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {datasetStats.columnNames.map((column, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          index === datasetStats.columnNames.length - 1
                            ? "bg-accent text-white font-semibold"
                            : "bg-white text-primary-600"
                        }`}
                      >
                        {column}
                        {index === datasetStats.columnNames.length - 1 && " (Target)"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-primary-50 p-6 rounded-lg overflow-x-auto">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">
                    Data Preview (First 5 rows)
                  </h3>
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-primary-50">
                      <tr>
                        {datasetStats.columnNames.map((column, index) => (
                          <th
                            key={index}
                            className={`px-4 py-2 text-left text-sm font-medium ${
                              index === datasetStats.columnNames.length - 1
                                ? "bg-accent text-white"
                                : "text-primary-900"
                            }`}
                          >
                            {column}
                            {index === datasetStats.columnNames.length - 1 && " (Target)"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {datasetStats.dataSample.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t border-primary-100">
                          {datasetStats.columnNames.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className={`px-4 py-2 text-sm ${
                                colIndex === datasetStats.columnNames.length - 1
                                  ? "text-accent font-medium"
                                  : "text-primary-600"
                              }`}
                            >
                              {String(row[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        );
      case 2:
        if (!datasetStats) {
          return (
            <div className="text-center p-8">
              <p className="text-primary-600">
                Please upload a dataset first to view analysis
              </p>
            </div>
          );
        }

        {
          const analysisDataTypes = calculateDataTypes(datasetStats.dataSample);
          const analysisMissingValues = Number(calculateMissingValues(datasetStats.dataSample));

          return (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                  Data Analysis
                </h2>
                <p className="text-primary-600">
                  Analyzing your dataset to understand its characteristics
                </p>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Dataset Overview</h3>
                        <p className="text-sm text-primary-600">
                          {selectedFile?.name}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary-50/10">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-6">Choose Learning Type</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card 
                        className={`border-2 cursor-pointer transition-all duration-200 ${
                          learningType === "supervised" && !autoDetectLearningType
                            ? "border-accent bg-accent/5"
                            : "border-primary-200 hover:border-accent/50"
                        }`}
                        onClick={() => handleLearningTypeSelect("supervised")}
                      >
                        <CardContent className="p-6">
                          <h3 className="text-lg font-medium mb-2">Supervised Learning</h3>
                          <p className="text-sm text-primary-600 mb-4">
                            Best for prediction tasks where you have labeled data with a target variable.
                          </p>
                          <p className="text-xs text-primary-500">
                            Target column will be: <span className="font-semibold text-accent">{datasetStats.columnNames[datasetStats.columnNames.length - 1]}</span>
                          </p>
                          <div className="mt-4 text-xs">
                            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                              Classification, Regression
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className={`border-2 cursor-pointer transition-all duration-200 ${
                          learningType === "unsupervised" && !autoDetectLearningType
                            ? "border-accent bg-accent/5"
                            : "border-primary-200 hover:border-accent/50"
                        }`}
                        onClick={() => handleLearningTypeSelect("unsupervised")}
                      >
                        <CardContent className="p-6">
                          <h3 className="text-lg font-medium mb-2">Unsupervised Learning</h3>
                          <p className="text-sm text-primary-600 mb-4">
                            Best for discovering patterns and structure in unlabeled data.
                          </p>
                          <p className="text-xs text-primary-500">
                            All columns will be used as features
                          </p>
                          <div className="mt-4 text-xs">
                            <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                              Clustering, Dimensionality Reduction
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {autoDetectLearningType && learningType && (
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm text-primary-800">
                          <span className="font-semibold">Auto-detected:</span> Based on your dataset, we recommend {" "}
                          <span className="font-semibold">{learningType === "supervised" ? "Supervised" : "Unsupervised"}</span> learning.
                          You can change this selection by clicking on an option above.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Basic Statistics</h3>
                      <ul className="space-y-2 text-sm text-primary-600">
                        <li>Rows: {datasetStats.rows.toLocaleString()}</li>
                        <li>Columns: {datasetStats.columns.toLocaleString()}</li>
                        <li>Missing Values: {analysisMissingValues}%</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-2">Data Types</h3>
                      <ul className="space-y-2 text-sm text-primary-600">
                        <li>Numerical: {analysisDataTypes.numerical} columns</li>
                        <li>Categorical: {analysisDataTypes.categorical} columns</li>
                        <li>Datetime: {analysisDataTypes.datetime} columns</li>
                        <li>Boolean: {analysisDataTypes.boolean} columns</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        }

      case 3:
        if (!datasetStats) {
          return (
            <div className="text-center p-8">
              <p className="text-primary-600">
                Please upload a dataset first to view algorithm recommendations
              </p>
            </div>
          );
        }

        {
          const algorithmDataTypes = calculateDataTypes(datasetStats.dataSample);
          const algorithmMissingValues = Number(calculateMissingValues(datasetStats.dataSample));
          const recommendedAlgorithms = getRecommendedAlgorithms(
            algorithmDataTypes,
            datasetStats.rows,
            algorithmMissingValues
          );

          const bestAlgorithms = recommendedAlgorithms.slice(0, 5);
          const alternativeAlgorithms = recommendedAlgorithms.slice(5);

          return (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                  Algorithm Selection
                </h2>
                <p className="text-primary-600">
                  Choose any algorithm that best suits your needs. Match percentages are recommendations based on your data.
                </p>
              </div>

              <Card className="mb-6 bg-primary-50/30 border-accent">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-2">Learning Type</h3>
                  <div className="flex items-center">
                    <div className="bg-accent/10 p-2 rounded-full mr-3">
                      <Settings className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-primary-800">
                      {learningType === "supervised" 
                        ? `Supervised Learning (Target: ${datasetStats.columnNames[datasetStats.columnNames.length - 1]})` 
                        : "Unsupervised Learning"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-4">
                    Recommended Algorithms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bestAlgorithms.map((algo, i) => (
                      <Card 
                        key={i} 
                        className={`border-2 cursor-pointer transition-all duration-200 ${
                          selectedAlgorithm === algo.name
                            ? "border-accent bg-accent/5"
                            : "border-primary-200 hover:border-accent/50"
                        }`}
                        onClick={() => handleAlgorithmSelect(algo.name)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">{algo.name}</h3>
                            <span className="text-accent font-semibold">
                              {algo.score}% Match
                            </span>
                          </div>
                          <p className="text-sm text-primary-600 mb-2">
                            {algo.description}
                          </p>
                          <p className="text-xs text-primary-500">
                            <span className="font-semibold">Use Cases:</span>{" "}
                            {algo.useCases}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-4">
                    Other Algorithms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alternativeAlgorithms.map((algo, i) => (
                      <Card 
                        key={i}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedAlgorithm === algo.name
                            ? "border-2 border-accent bg-accent/5"
                            : "hover:border-accent/50"
                        }`}
                        onClick={() => handleAlgorithmSelect(algo.name)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">{algo.name}</h3>
                            <span className="text-primary-600 font-semibold">
                              {algo.score}% Match
                            </span>
                          </div>
                          <p className="text-sm text-primary-600 mb-2">
                            {algo.description}
                          </p>
                          <p className="text-xs text-primary-500">
                            <span className="font-semibold">Use Cases:</span>{" "}
                            {algo.useCases}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case 4:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-primary-900 mb-2">
                Generated Code
              </h2>
              <p className="text-primary-600">
                Ready-to-use Python code with evaluation metrics
              </p>
            </div>

            {!selectedAlgorithm ? (
              <div className="text-center p-6 bg-yellow-50 rounded-lg mb-6">
                <p className="text-yellow-700">
                  Please go back and select an algorithm to generate code
                </p>
              </div>
            ) : (
              <>
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-medium">Selected Algorithm</h3>
                        <p className="text-accent font-semibold">{selectedAlgorithm}</p>
                        <p className="text-sm text-primary-600 mt-1">
                          {learningType === "supervised" 
                            ? "Supervised Learning" 
                            : "Unsupervised Learning"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Dataset</h3>
                        <p className="text-primary-600">{selectedFile?.name || "dataset.csv"}</p>
                        <p className="text-sm text-primary-600 mt-1">
                          {datasetStats && (
                            <>
                              {`${datasetStats.rows} rows × ${datasetStats.columns} columns`}
                              {learningType === "supervised" && (
                                <>
                                  <br />
                                  <span className="font-medium">Target: </span>
                                  {datasetStats.columnNames[datasetStats.columnNames.length - 1]}
                                </>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Code Explanation */}
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Code Explanation</h3>
                      <div className="bg-primary-50 p-4 rounded-lg space-y-4 h-[600px] overflow-y-auto">
                        {/* Algorithm Description */}
                        <div>
                          <h4 className="text-md font-semibold text-primary-900 mb-2">Overview</h4>
                          <p className="text-primary-800 whitespace-pre-line text-sm">
                            {getAlgorithmDescription(selectedAlgorithm)}
                          </p>
                        </div>
                        
                        {/* Code Section Explanations */}
                        <div className="mt-4 pt-4 border-t border-primary-200">
                          <h4 className="text-md font-semibold text-primary-900 mb-2">Code Breakdown</h4>
                          <div className="space-y-3">
                            {getCodeExplanationBySection(selectedAlgorithm).map((section, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-md shadow-sm">
                                <h5 className="text-sm font-medium text-accent mb-1">{section.title}</h5>
                                <p className="text-xs text-primary-700">{section.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Python Code */}
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">Python Code</h3>
                      <pre className="bg-primary-50 p-4 rounded-lg overflow-auto text-left h-[600px] text-sm text-primary-900 whitespace-pre-wrap">
                        <code>
                          {generateAlgorithmCode(selectedAlgorithm, selectedFile?.name || "dataset.csv")}
                        </code>
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            ML Algorithm Generator
          </h1>
          <p className="text-lg text-primary-600 max-w-2xl mx-auto">
            Upload your dataset and receive intelligent recommendations for the best
            machine learning algorithms and hyperparameters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card
                className={`p-6 ${
                  step === i + 1
                    ? "border-accent border-2"
                    : "border-primary-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      step === i + 1
                        ? "bg-accent text-white"
                        : "bg-primary-100 text-primary-600"
                    }`}
                  >
                    <s.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">{s.title}</h3>
                    <p className="text-sm text-primary-600">{s.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="p-8">
            {renderStepContent()}
            {step < steps.length && (
              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white"
                  onClick={handleBeginAnalysis}
                >
                  Next Step
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
