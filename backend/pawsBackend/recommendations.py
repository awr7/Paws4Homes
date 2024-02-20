import pandas as pd
from .utilities import standardize_breed 
import logging
import os

logger = logging.getLogger(__name__)

current_dir = os.path.dirname(os.path.realpath(__file__))
# Define the relative path to the CSV file
breed_attributes_csv = os.path.join(current_dir, 'data', 'dog_breeds.csv')

def get_matching_breeds(user_preferences):
    # Mapping of frontend keys to CSV column names
    key_mapping = {
        'activityLevel': 'Activity Level',
        'dailyTime': 'Daily Time',
        'sizePreference': 'Size Preference',
        'otherPets': 'Other Pets',
        'preferredAge': 'Preferred Age',
        'childrenAtHome': 'Children at Home',
        'furPreference': 'Fur Preference',
        'sheddingTolerance': 'Shedding Tolerance',
        'livingSituation': 'Living Situation',
        'lookingFor': 'Looking For'
    }

    print("Loading breed attributes dataset...")
    df = pd.read_csv(breed_attributes_csv)
    print(f"Dataset loaded with shape {df.shape}")

    # Initialize a dictionary to keep track of scores for debugging
    breed_scores = {}

    for index, row in df.iterrows():
        score = 0
        for key, frontend_value in user_preferences.items():
            csv_key = key_mapping.get(key)
            if csv_key and csv_key in df.columns and row[csv_key] == frontend_value:
                score += 1
                if row['Breed'] not in breed_scores:
                    breed_scores[row['Breed']] = {}
                breed_scores[row['Breed']][csv_key] = 1

        df.at[index, 'score'] = score

    # Sorting the dataframe based on score in descending order
    df = df.sort_values(by='score', ascending=False)

    # Printing the detailed scores for top 5 breeds
    print("\nDetailed matching scores for top 5 breeds:")
    for index, row in df.head(5).iterrows():
        breed = row['Breed']
        score_details = breed_scores.get(breed, {})
        print(f"\nBreed: {breed}, Total Score: {row['score']}")
        for attribute, scored in score_details.items():
            print(f"  - Matched on {attribute}: +{scored}")

    top_matches = df['Breed'].head(5).tolist()
    print(f"\nTop matching breeds: {top_matches}")
    return top_matches

def recommend_dogs(user_preferences, dogs_database):
    print("Getting matching breeds based on user preferences...")
    matching_breeds = get_matching_breeds(user_preferences)

    print(f"Standardizing breeds from database: {dogs_database}")
    standardized_breeds = [standardize_breed(breed, matching_breeds) for breed in dogs_database]

    standardized_breeds = [breed for breed in standardized_breeds if breed]
    print(f"Standardized breeds: {standardized_breeds}")

    return list(set(standardized_breeds))
