from fuzzywuzzy import process

def standardize_breed(user_input, breed_list):
    # Attempt fuzzy matching first
    match, score = process.extractOne(user_input, breed_list)
    print(f"Fuzzy matching '{user_input}' to breeds list... Best match: '{match}' with score: {score}")
    
    if score >= 80:
        print(f"High-confidence match found: {match}")
        return match
    else:
        print(f"No high-confidence fuzzy match found for '{user_input}'. Checking for partial matches...")

    # Check for partial matches (e.g., "Husky" in "Siberian Husky")
    for breed in breed_list:
        if user_input.lower() in breed.lower() or breed.lower() in user_input.lower():
            print(f"Partial match found: '{user_input}' in '{breed}'")
            return breed

    print(f"No matching breed found for '{user_input}' in the breed list.")
    return None