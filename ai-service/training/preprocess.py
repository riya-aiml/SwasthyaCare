"""
SwasthyaCare — Preprocessing Pipeline Builders
Task: ML-S2-03 & ML-S2-05
Constructs scikit-learn ColumnTransformers and Pipelines for ML-DIA-01 and ML-CVD-01.
Ensures zero data leakage: preprocessors fit ONLY on training data.
"""

import os
import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder, FunctionTransformer
from sklearn.impute import SimpleImputer


def _to_int(df):
    """Cast boolean or categorical data to integer numeric."""
    return df.astype(int)


def build_diabetes_preprocessor() -> ColumnTransformer:
    """
    Construct ColumnTransformer for ML-DIA-01: Diabetes Current-Status Assessment
    Continuous: BMI, PhysHlth, MentHlth -> SimpleImputer(median) + StandardScaler
    Ordinal/Categorical: GenHlth, Age, Education, Income -> SimpleImputer(mode) + StandardScaler
    Binary: HighBP, HighChol, CholCheck, Smoker, Stroke, HeartDisease, PhysActivity,
            Fruits, Veggies, HvyAlcohol, AnyHealthcare, NoDocbcCost, DiffWalk
    """
    numeric_features = ["bmi", "phys_hlth_days", "ment_hlth_days"]
    ordinal_features = ["gen_hlth", "age", "education_level", "income_level"]
    binary_features = [
        "high_bp", "high_chol", "chol_check_5yr", "stroke_history",
        "heart_disease_or_attack", "smoker", "phys_activity", "fruits_daily",
        "veggies_daily", "heavy_alcohol", "diff_walk", "any_healthcare",
        "no_doc_bc_cost"
    ]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    ordinal_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("scaler", StandardScaler())
    ])

    binary_transformer = Pipeline(steps=[
        ("to_int", FunctionTransformer(_to_int)),
        ("imputer", SimpleImputer(strategy="most_frequent"))
    ])

    categorical_features = ["sex"]
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(drop="first", handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("ord", ordinal_transformer, ordinal_features),
            ("bin", binary_transformer, binary_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop"
    )
    return preprocessor


def build_cardiovascular_preprocessor() -> ColumnTransformer:
    """
    Construct ColumnTransformer for ML-CVD-01: Cardiovascular Current-Status Assessment
    Continuous: age, trestbps, chol, thalach, oldpeak -> SimpleImputer(median) + StandardScaler
    Binary: sex, fbs, exang -> SimpleImputer(mode)
    Categorical: cp, restecg, slope, thal -> OneHotEncoder(drop='first', handle_unknown='ignore')
    Discrete: ca -> SimpleImputer(median) + StandardScaler
    """
    numeric_features = ["age", "resting_bp", "cholesterol", "max_heart_rate", "st_depression"]
    categorical_features = ["chest_pain_type", "resting_ecg", "st_slope", "thalassemia"]
    binary_features = ["fasting_blood_sugar_gt_120", "exercise_induced_angina"]
    discrete_features = ["num_major_vessels"]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(drop="first", handle_unknown="ignore"))
    ])

    binary_transformer = Pipeline(steps=[
        ("to_int", FunctionTransformer(_to_int)),
        ("imputer", SimpleImputer(strategy="most_frequent"))
    ])

    discrete_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    sex_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(drop="first", handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
            ("bin", binary_transformer, binary_features),
            ("disc", discrete_transformer, discrete_features),
            ("sex", sex_transformer, ["sex"]),
        ],
        remainder="drop"
    )
    return preprocessor


if __name__ == "__main__":
    from training.data_loader import load_and_validate_diabetes_data, load_and_validate_cardiovascular_data

    print("Testing Preprocessors on Synthetic Partitions...")
    # Diabetes
    X_tr_dia, X_te_dia, y_tr_dia, y_te_dia, _ = load_and_validate_diabetes_data()
    dia_prep = build_diabetes_preprocessor()
    X_tr_dia_trans = dia_prep.fit_transform(X_tr_dia)
    X_te_dia_trans = dia_prep.transform(X_te_dia)
    print(f"Diabetes: Train Transformed Shape = {X_tr_dia_trans.shape}, Test Transformed Shape = {X_te_dia_trans.shape}")

    # Cardiovascular
    X_tr_cvd, X_te_cvd, y_tr_cvd, y_te_cvd, _ = load_and_validate_cardiovascular_data()
    cvd_prep = build_cardiovascular_preprocessor()
    X_tr_cvd_trans = cvd_prep.fit_transform(X_tr_cvd)
    X_te_cvd_trans = cvd_prep.transform(X_te_cvd)
    print(f"Cardiovascular: Train Transformed Shape = {X_tr_cvd_trans.shape}, Test Transformed Shape = {X_te_cvd_trans.shape}")
    print("Preprocessing verification passed.")
