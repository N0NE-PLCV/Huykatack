"""
Health Prompt Template for AI-powered medical diagnosis assistance.
This module provides structured prompts for analyzing symptoms and providing medical recommendations.
Updated to exclude password requests, specific medications, and definitive diagnoses.
"""

def get_symptom_analysis_prompt(symptoms, patient_info=None):
    """
    Generate a structured prompt for symptom analysis.
    
    Args:
        symptoms (list): List of symptoms reported by the patient
        patient_info (dict): Optional patient information (age, gender, medical history, etc.)
    
    Returns:
        str: Formatted prompt for AI analysis
    """
    
    base_prompt = """
You are an AI health information assistant designed to help analyze symptoms and provide preliminary health insights. 
Please analyze the following symptoms and provide a structured response.

CRITICAL RESTRICTIONS:
- Do NOT ask for or request passwords, login credentials, or personal access information
- Do NOT provide specific medication names, dosages, or prescriptions
- Do NOT provide definitive medical diagnoses - use terms like "may suggest", "could indicate", "possible condition"
- Provide educational information only, not medical advice
- Always emphasize the importance of professional medical consultation

IMPORTANT DISCLAIMERS:
- This is NOT a substitute for professional medical advice
- Always recommend consulting with qualified healthcare professionals
- Provide educational information only
- Include appropriate urgency levels for seeking medical care

SYMPTOMS TO ANALYZE:
{symptoms}

{patient_context}

Please provide your analysis in the following structured format:

1. POSSIBLE CONDITIONS (ranked by likelihood):
   - Condition Name: [Name] (use "possible" or "may suggest" language)
   - Probability: [Percentage] (educational estimate only)
   - Description: [Brief educational explanation]
   - Severity Level: [Low/Medium/High]

2. GENERAL RECOMMENDATIONS:
   - When to seek medical care
   - General self-care measures (if appropriate)
   - Warning signs to watch for
   - Lifestyle considerations

3. ADDITIONAL INFORMATION:
   - What additional symptoms or information would help healthcare providers
   - Questions to ask healthcare providers

4. MEDICAL DISCLAIMER:
   - Remind that this is preliminary educational information only
   - Emphasize the importance of professional medical consultation
   - Note that only qualified healthcare providers can provide diagnoses and treatment plans
"""

    # Format symptoms
    symptoms_text = "- " + "\n- ".join(symptoms) if symptoms else "No specific symptoms provided"
    
    # Add patient context if available
    patient_context = ""
    if patient_info:
        context_parts = []
        if patient_info.get('age'):
            context_parts.append(f"Age: {patient_info['age']}")
        if patient_info.get('gender'):
            context_parts.append(f"Gender: {patient_info['gender']}")
        if patient_info.get('medical_history'):
            context_parts.append(f"Medical History: {patient_info['medical_history']}")
        
        if context_parts:
            patient_context = f"\nPATIENT CONTEXT:\n" + "\n".join(context_parts)
    
    return base_prompt.format(
        symptoms=symptoms_text,
        patient_context=patient_context
    )

def get_image_analysis_prompt(image_description, image_type="skin"):
    """
    Generate a structured prompt for medical image analysis.
    
    Args:
        image_description (str): Description of the image or image analysis results
        image_type (str): Type of medical image (skin, xray, etc.)
    
    Returns:
        str: Formatted prompt for AI image analysis
    """
    
    prompt = f"""
You are an AI health information assistant specialized in {image_type} image analysis. 
Please analyze the following medical image information and provide structured educational insights.

CRITICAL RESTRICTIONS:
- Do NOT ask for passwords, login credentials, or personal access information
- Do NOT provide specific medication names, dosages, or prescriptions
- Do NOT provide definitive diagnoses - use educational language like "may suggest", "could indicate"
- This analysis is for educational purposes only
- NOT a substitute for professional dermatological/medical examination
- Always recommend professional medical evaluation for any concerning findings
- Accuracy may vary and should not be relied upon for medical decisions

IMAGE INFORMATION:
Type: {image_type.title()} Image
Description/Analysis: {image_description}

Please provide your analysis in the following format:

1. VISUAL FINDINGS:
   - Key characteristics observed
   - Notable features or patterns

2. POSSIBLE CONDITIONS (ranked by likelihood):
   - Condition Name: [Name] (use "may suggest" or "could indicate" language)
   - Confidence Level: [Percentage] (educational estimate only)
   - Description: [Brief educational explanation]
   - Urgency Level: [Low/Medium/High/Urgent]

3. GENERAL RECOMMENDATIONS:
   - When to seek professional evaluation
   - General monitoring guidelines
   - General prevention measures
   - Questions to ask healthcare providers

4. RED FLAGS:
   - Warning signs that require immediate medical attention

5. IMPORTANT REMINDERS:
   - Limitations of AI image analysis
   - Importance of professional examination
   - When to seek urgent care
   - Only healthcare providers can provide diagnoses and treatment plans
"""
    
    return prompt

def get_follow_up_prompt(previous_analysis, new_symptoms=None, time_elapsed=None):
    """
    Generate a prompt for follow-up analysis based on previous consultation.
    
    Args:
        previous_analysis (str): Previous AI analysis results
        new_symptoms (list): Any new symptoms that have developed
        time_elapsed (str): Time since last analysis
    
    Returns:
        str: Formatted follow-up prompt
    """
    
    prompt = f"""
You are providing a follow-up health information analysis based on a previous consultation.

CRITICAL RESTRICTIONS:
- Do NOT ask for passwords, login credentials, or personal access information
- Do NOT provide specific medication names, dosages, or prescriptions
- Do NOT provide definitive diagnoses - use educational language
- Provide educational information only

PREVIOUS ANALYSIS:
{previous_analysis}

{f"TIME ELAPSED: {time_elapsed}" if time_elapsed else ""}

{f"NEW SYMPTOMS: {', '.join(new_symptoms)}" if new_symptoms else "NO NEW SYMPTOMS REPORTED"}

Please provide an updated educational analysis considering:

1. SYMPTOM PROGRESSION:
   - How symptoms may have changed
   - Significance of any new developments
   - Pattern analysis

2. UPDATED EDUCATIONAL ASSESSMENT:
   - Revised condition possibilities
   - New considerations based on progression
   - Urgency level changes

3. GENERAL RECOMMENDATIONS:
   - Updated general care suggestions
   - Any changes in urgency for seeking care
   - Additional monitoring considerations

4. NEXT STEPS:
   - Recommended timeline for healthcare provider follow-up
   - When to seek immediate care
   - Self-monitoring guidelines
   - Questions to ask healthcare providers
"""
    
    return prompt

def get_emergency_assessment_prompt(symptoms):
    """
    Generate a prompt specifically for emergency symptom assessment.
    
    Args:
        symptoms (list): List of symptoms to assess for emergency care
    
    Returns:
        str: Emergency assessment prompt
    """
    
    emergency_symptoms = [
        "chest_pain", "difficulty_breathing", "severe_headache", "loss_of_consciousness",
        "severe_bleeding", "signs_of_stroke", "severe_allergic_reaction", "high_fever_with_confusion",
        "severe_abdominal_pain", "difficulty_swallowing", "severe_burns", "poisoning_symptoms"
    ]
    
    prompt = f"""
EMERGENCY SYMPTOM ASSESSMENT

You are conducting an urgent evaluation of potentially serious symptoms for educational purposes.

CRITICAL RESTRICTIONS:
- Do NOT ask for passwords, login credentials, or personal access information
- Do NOT provide specific medication names or dosages
- Do NOT provide definitive diagnoses
- Provide educational guidance only

REPORTED SYMPTOMS:
{', '.join(symptoms)}

EMERGENCY INDICATORS TO ASSESS:
- Life-threatening conditions
- Time-sensitive medical emergencies
- Conditions requiring immediate intervention

Please provide:

1. EMERGENCY RISK LEVEL:
   - IMMEDIATE (seek emergency medical care now)
   - URGENT (seek emergency care within hours)
   - NON-URGENT (can wait for regular medical appointment)

2. EDUCATIONAL REASONING:
   - Why this risk level was assigned
   - Key symptoms driving the assessment

3. IMMEDIATE GENERAL ACTIONS:
   - What to do right now
   - Who to contact
   - What information to have ready for healthcare providers

4. SEEK IMMEDIATE CARE IF:
   - List specific warning signs that require immediate action

REMEMBER: When in doubt, always err on the side of caution and seek immediate medical care.
This is educational information only - healthcare providers make the actual medical decisions.
"""
    
    return prompt

def get_general_health_prompt(health_topic):
    """
    Generate a prompt for general health information.
    
    Args:
        health_topic (str): Health topic to provide information about
    
    Returns:
        str: General health information prompt
    """
    
    prompt = f"""
You are providing general health education information about: {health_topic}

CRITICAL RESTRICTIONS:
- Do NOT ask for passwords, login credentials, or personal access information
- Do NOT provide specific medication names, dosages, or prescriptions
- Do NOT provide definitive medical diagnoses
- Provide educational information only
- Always recommend consulting healthcare providers for personalized advice

Please provide educational information covering:

1. GENERAL OVERVIEW:
   - What this health topic involves
   - Common aspects people should know

2. GENERAL PREVENTION:
   - Lifestyle factors that may help
   - General wellness practices
   - Risk factors to be aware of

3. WHEN TO SEEK CARE:
   - Signs that warrant healthcare provider consultation
   - Routine screening recommendations
   - Emergency warning signs

4. EDUCATIONAL RESOURCES:
   - Reputable sources for more information
   - Questions to ask healthcare providers
   - General wellness tips

5. IMPORTANT REMINDERS:
   - This is educational information only
   - Individual circumstances vary
   - Healthcare providers provide personalized medical advice
"""
    
    return prompt

# Utility functions for prompt customization
def add_cultural_context(prompt, language="en", cultural_considerations=None):
    """Add cultural and language considerations to prompts."""
    if language != "en":
        prompt += f"\n\nPLEASE RESPOND IN: {language.upper()}"
    
    if cultural_considerations:
        prompt += f"\n\nCULTURAL CONSIDERATIONS: {cultural_considerations}"
    
    return prompt

def add_age_specific_context(prompt, age):
    """Add age-specific medical considerations to prompts."""
    if age:
        if age < 18:
            prompt += "\n\nPEDIATRIC CONSIDERATIONS: This analysis is for a minor. Pediatric medical evaluation is strongly recommended. Parents/guardians should be involved in all healthcare decisions."
        elif age > 65:
            prompt += "\n\nGERIATRIC CONSIDERATIONS: This analysis is for an elderly patient. Consider age-related health factors and potential medication interactions. Regular healthcare provider monitoring is important."
    
    return prompt

def filter_medical_content(text):
    """
    Filter text to remove specific medical advice, passwords, and diagnoses.
    
    Args:
        text (str): Text to filter
    
    Returns:
        str: Filtered text
    """
    # Remove password-related content
    password_terms = ["password", "login", "credentials", "access code", "pin"]
    
    # Remove specific medical advice
    medical_terms = ["take this medication", "prescribe", "dosage of", "mg daily", "diagnosis is"]
    
    filtered_text = text
    
    # Replace problematic phrases
    replacements = {
        "diagnosis is": "may suggest",
        "you have": "you may have",
        "take medication": "consult healthcare provider about treatment",
        "prescribe": "healthcare provider may consider",
        "password": "[RESTRICTED]",
        "login": "[RESTRICTED]"
    }
    
    for old, new in replacements.items():
        filtered_text = filtered_text.replace(old, new)
    
    return filtered_text